import React, { useEffect, useRef, useState } from "react";
import { Project, Scene, Character, DialogueCue, SFXCue } from "../types";
import { STOCK_BACKGROUNDS, StockBackground } from "../data";
import { Sparkles, Volume2, Film } from "lucide-react";

interface StageAnimatorProps {
  project: Project;
  sceneIndex: number; // 1-indexed
  currentTime: number; // relative to scene (seconds)
  isPlaying: boolean;
  onTimeUpdate?: (time: number) => void;
  onSceneEnd?: () => void;
}

export default function StageAnimator({
  project,
  sceneIndex,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onSceneEnd,
}: StageAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeScene = project.scenes.find((s) => s.sceneIndex === sceneIndex) || project.scenes[0];

  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<DialogueCue | null>(null);
  const [lastSfxTriggered, setLastSfxTriggered] = useState<string | null>(null);

  // Audio state
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeSpeechCueId = useRef<string | null>(null);

  // Particle simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{ x: number; y: number; r: number; speedY: number; speedX: number; alpha: number }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles based on weather
    const effect = activeScene.bgWeatherEffect;
    const particleCount = effect === "none" ? 0 : effect === "rain" ? 120 : effect === "snow" ? 60 : 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: effect === "rain" ? 1.5 : Math.random() * 3 + 1,
        speedY: effect === "rain" ? Math.random() * 8 + 6 : effect === "snow" ? Math.random() * 1.5 + 0.5 : Math.random() * 0.4 - 0.2,
        speedX: effect === "rain" ? -1.5 : effect === "snow" ? Math.random() * 1 - 0.5 : Math.random() * 0.6 - 0.3,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (effect !== "none") {
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle =
            effect === "rain"
              ? `rgba(156, 163, 175, ${p.alpha * 0.6})`
              : effect === "stars" || effect === "particles"
              ? `rgba(253, 224, 71, ${p.alpha})`
              : `rgba(255, 255, 255, ${p.alpha})`;

          if (effect === "rain") {
            // Draw rain line
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.speedY * 1.5);
            ctx.strokeStyle = `rgba(173, 216, 230, ${p.alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          } else {
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }

          // Move
          p.y += p.speedY;
          p.x += p.speedX;

          // Wrap boundaries
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < 0 || p.x > canvas.width) {
            p.x = p.x < 0 ? canvas.width : 0;
          }
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeScene.bgWeatherEffect, activeScene.id]);

  // Synchronize timelines and dialogues
  useEffect(() => {
    if (!activeScene) return;

    // Find current dialogue
    const cue = activeScene.dialogues.find(
      (d) => currentTime >= d.startTime && currentTime <= d.startTime + d.duration
    );

    if (cue) {
      setActiveDialogue(cue);
      setActiveSpeakerId(cue.characterId || null);

      // Speak dialogue out loud using Web Speech synthesis if isPlaying is active!
      if (isPlaying && activeSpeechCueId.current !== cue.id) {
        activeSpeechCueId.current = cue.id;
        // Stop current speaking
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();

          const textToSpeak = cue.characterId ? cue.text : cue.text.replace("NARRATOR: ", "");
          const utterance = new SpeechSynthesisUtterance(textToSpeak);

          // Retrieve character voice settings
          const speaker = project.characters.find((c) => c.id === cue.characterId);
          if (speaker) {
            utterance.rate = speaker.voiceSettings.speed || 1.0;
            utterance.pitch = speaker.voiceSettings.pitch || 1.0;
            // Fuzzy match system voices
            const voices = window.speechSynthesis.getVoices();
            const matchingVoice = voices.find((v) => {
              const accent = speaker.voiceSettings.accent.toLowerCase();
              const isFemale = speaker.voiceSettings.gender === "female";
              return (
                v.lang.toLowerCase().includes(accent) &&
                v.name.toLowerCase().includes(isFemale ? "female" : "male")
              );
            }) || voices.find((v) => v.lang.toLowerCase().includes("en"));

            if (matchingVoice) {
              utterance.voice = matchingVoice;
            }
          } else {
            // Narrator voice
            utterance.rate = 0.95;
            utterance.pitch = 0.9;
          }

          speechUtteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        }
      }
    } else {
      setActiveDialogue(null);
      setActiveSpeakerId(null);
      // Cancel speech if no dialogue cue is active
      if (!isPlaying && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        activeSpeechCueId.current = null;
      }
    }

    // Sound effect trigger check
    activeScene.sfxCues.forEach((sfx) => {
      // trigger if within 0.1s threshold and not triggered yet
      const diff = currentTime - sfx.startTime;
      if (diff >= 0 && diff < 0.25) {
        const idKey = `${sfx.id}_triggered`;
        if (lastSfxTriggered !== idKey) {
          setLastSfxTriggered(idKey);
          // Play simulated beep/chime audio node
          playSFXNode(sfx.soundName);
        }
      }
    });

    // Check if scene duration is reached
    if (currentTime >= activeScene.duration) {
      if (onSceneEnd) onSceneEnd();
    }
  }, [currentTime, activeScene.id, isPlaying]);

  // Handle play/pause toggle for SpeechSynthesis
  useEffect(() => {
    if (!isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      activeSpeechCueId.current = null;
    }
  }, [isPlaying]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playSFXNode = (soundName: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (soundName === "magical_chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else if (soundName === "laser") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (soundName === "explosion") {
        // Noise buffer simulation
        const bufferSize = audioCtx.sampleRate * 1.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 1.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.4);

        noise.start();
        noise.stop(audioCtx.currentTime + 1.5);
      } else {
        // Standard blip
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Web Audio SFX blocked or failed:", e);
    }
  };

  // Get background style
  const stockBg = STOCK_BACKGROUNDS.find((bg) => bg.style === activeScene.bgStyle) || STOCK_BACKGROUNDS[0];
  const bgClasses = stockBg.colors[activeScene.bgTimeOfDay] || stockBg.colors.day;

  // Camera shot styling transformation
  const getCameraStyle = () => {
    const shot = activeScene.cameraShot;
    let scale = 1.0;
    let x = 0;
    let y = 0;

    // Determine speaker coordinates
    let speakX = 50;
    if (activeSpeakerId) {
      const spIndex = activeScene.charactersPresent.find((c) => c.characterId === activeSpeakerId);
      if (spIndex) {
        speakX = spIndex.positionX;
      }
    }

    switch (shot) {
      case "close-up":
        scale = 1.9;
        x = -(speakX - 50) * 1.5;
        y = -20;
        break;
      case "reaction":
        scale = 1.7;
        x = speakX > 50 ? -35 : 35;
        y = -10;
        break;
      case "medium":
        scale = 1.35;
        y = -5;
        break;
      case "two-shot":
        scale = 1.5;
        y = -8;
        break;
      case "zoom-in":
        scale = 1.0 + (currentTime / activeScene.duration) * 0.35;
        y = -((currentTime / activeScene.duration) * 10);
        break;
      case "zoom-out":
        scale = 1.35 - (currentTime / activeScene.duration) * 0.35;
        break;
      case "pan-left":
        scale = 1.2;
        x = -25 + (currentTime / activeScene.duration) * 50;
        break;
      case "pan-right":
        scale = 1.2;
        x = 25 - (currentTime / activeScene.duration) * 50;
        break;
      case "establishing":
        scale = 1.05;
        x = Math.sin(currentTime * 0.4) * 8;
        break;
      default:
        scale = 1.0;
        break;
    }

    return {
      transform: `scale(${scale}) translate(${x}px, ${y}px)`,
      transition: isPlaying ? "transform 1.5s cubic-bezier(0.1, 0.8, 0.2, 1.0)" : "transform 0.4s ease-out",
    };
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl bg-black overflow-hidden shadow-md select-none border border-[#D8E0EA]">
      {/* 2.5D Layered Environment Wrapper */}
      <div
        ref={containerRef}
        className="w-full h-full relative transition-all duration-1000 overflow-hidden"
      >
        {/* Background Parallax Canvas Plate */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${bgClasses[0]} transition-all duration-700`}
          style={getCameraStyle()}
        >
          {/* Dynamic Graphic Backplate elements */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Background Illustration Accents */}
          {activeScene.bgStyle === "modern_lab" && (
            <div className="absolute bottom-10 left-10 right-10 top-1/4 rounded-2xl border border-white/10 bg-indigo-900/10 backdrop-blur-xs flex items-center justify-around p-4">
              <div className="w-12 h-24 bg-indigo-500/10 border border-indigo-400/20 rounded flex flex-col justify-end p-1">
                <div
                  className="w-full bg-cyan-400 rounded-xs transition-all duration-300"
                  style={{ height: `${50 + Math.sin(currentTime * 4) * 40}%` }}
                />
              </div>
              <div className="w-20 h-20 rounded-full border border-indigo-500/20 flex items-center justify-center relative">
                <div
                  className="w-16 h-16 rounded-full border border-dashed border-cyan-400/40 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-cyan-400">
                  {Math.round(80 + Math.sin(currentTime * 2) * 15)}%
                </div>
              </div>
              <div className="w-32 h-16 bg-slate-800/20 border border-slate-700/20 rounded p-2 text-[8px] font-mono text-emerald-400 overflow-hidden">
                <div>&gt; star_engine_core</div>
                <div className="text-cyan-400">READY (H-18)</div>
                <div className="text-white/40">SYS_V_TEMP: {Math.round(340 + Math.sin(currentTime * 3) * 5)}K</div>
              </div>
            </div>
          )}

          {activeScene.bgStyle === "cozy_home" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-900/10 border-t border-amber-600/10 rounded-t-3xl flex items-end justify-center">
              <div className="w-20 h-16 bg-orange-600/10 rounded-t-2xl flex items-end justify-center p-1 border-t border-orange-500/20">
                <div
                  className="w-12 bg-yellow-400/70 rounded-t-xl transition-all duration-200"
                  style={{ height: `${30 + Math.random() * 50}%` }}
                />
              </div>
            </div>
          )}

          {activeScene.bgStyle === "star_station" && (
            <div className="absolute top-10 left-10 right-10 bottom-1/3 border border-purple-500/20 rounded-3xl bg-purple-950/10 backdrop-blur-xs flex items-center justify-center">
              <div className="text-center">
                <div className="text-purple-400 text-xs font-mono tracking-widest uppercase mb-1">Observation Sector</div>
                <div className="text-[10px] text-white/50 font-mono">NEBULA CORRIDOR: LOCKED</div>
              </div>
            </div>
          )}

          {/* Renders Scene Characters */}
          <div className="absolute inset-x-0 bottom-0 top-12 flex items-end relative overflow-hidden">
            {activeScene.charactersPresent.map((pos) => {
              const char = project.characters.find((c) => c.id === pos.characterId);
              if (!char) return null;

              const isSpeaking = activeSpeakerId === char.id;
              const isStock = char.imageUrl.startsWith("stock_");

              // Compute character animation offsets
              const breatheOffset = Math.sin(currentTime * 3.5) * 1.5; // pixels
              const tiltAngle = Math.sin(currentTime * 1.5) * (isSpeaking ? 3 : 1); // degrees

              // Celebrating action animation
              const isCelebrating = activeDialogue?.characterId === char.id && activeDialogue?.action === "celebrating";
              const jumpOffset = isCelebrating ? Math.abs(Math.sin(currentTime * 10)) * 25 : 0;

              // Mouth scale computation for speaking morph
              let mouthHeightPercent = 0.2;
              let mouthWidthPercent = 1.0;
              if (isSpeaking) {
                // simulate syllables based on simple sine wave mixed with raw amplitude
                const rawOsc = Math.sin(currentTime * 18) * Math.sin(currentTime * 8);
                mouthHeightPercent = 0.35 + Math.abs(rawOsc) * 0.65;
                mouthWidthPercent = 0.9 + Math.abs(Math.sin(currentTime * 12)) * 0.2;
              }

              // Eyebrows emotion positioning
              let browY = 0;
              let browRotate = 0;
              if (activeDialogue?.characterId === char.id) {
                if (activeDialogue.emotion === "excited") {
                  browY = -3;
                  browRotate = -5;
                } else if (activeDialogue.emotion === "angry") {
                  browY = 2;
                  browRotate = 10;
                } else if (activeDialogue.emotion === "sad") {
                  browY = 1;
                  browRotate = -8;
                }
              }

              return (
                <div
                  key={char.id}
                  className="absolute bottom-0 flex flex-col items-center transition-all duration-300"
                  style={{
                    left: `${pos.positionX}%`,
                    transform: `translateX(-50%) translate3d(0, ${-breatheOffset - pos.positionY - jumpOffset}px, 0) scale(${
                      pos.scale
                    }) rotate(${tiltAngle}deg)`,
                    zIndex: pos.depth,
                  }}
                >
                  {/* Dynamic rigged render vector box */}
                  <div
                    className={`relative w-40 h-40 ${
                      pos.facing === "left" ? "scale-x-[-1]" : ""
                    } transition-all duration-300`}
                  >
                    {isStock ? (
                      <div className="w-full h-full relative">
                        {/* Eyebrows Layer */}
                        <div
                          className="absolute w-full top-[32%] flex justify-around px-11 pointer-events-none z-30"
                          style={{
                            transform: `translateY(${browY}px)`,
                          }}
                        >
                          <div
                            className="w-4 h-1.5 bg-[#2E2A25] rounded-full transition-all"
                            style={{ transform: `rotate(${browRotate}deg)` }}
                          />
                          <div
                            className="w-4 h-1.5 bg-[#2E2A25] rounded-full transition-all"
                            style={{ transform: `rotate(${-browRotate}deg)` }}
                          />
                        </div>

                        {/* Blinking Eyes Layer */}
                        <div className="absolute w-full top-[38%] flex justify-around px-12 pointer-events-none z-20">
                          {/* Left Eye */}
                          <div className="w-3.5 h-3.5 bg-white rounded-full border border-slate-300 flex items-center justify-center relative">
                            {/* Iris */}
                            <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                            {/* Lid (Blinking Simulation) */}
                            <div
                              className="absolute inset-x-0 top-0 bg-stone-200 transition-all duration-150 rounded-t-full"
                              style={{
                                height:
                                  Math.sin(currentTime * 0.4) > 0.96 ? "100%" : "0%",
                              }}
                            />
                          </div>
                          {/* Right Eye */}
                          <div className="w-3.5 h-3.5 bg-white rounded-full border border-slate-300 flex items-center justify-center relative">
                            {/* Iris */}
                            <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                            {/* Lid */}
                            <div
                              className="absolute inset-x-0 top-0 bg-stone-200 transition-all duration-150 rounded-t-full"
                              style={{
                                height:
                                  Math.sin(currentTime * 0.4) > 0.96 ? "100%" : "0%",
                              }}
                            />
                          </div>
                        </div>

                        {/* Dynamic Lip Sync Mouth Layer */}
                        <div className="absolute w-full top-[64%] flex justify-center pointer-events-none z-20">
                          <div
                            className="bg-rose-800 border-2 border-rose-950 rounded-full transition-all duration-75 flex items-center justify-center overflow-hidden"
                            style={{
                              width: `${24 * mouthWidthPercent}px`,
                              height: `${18 * mouthHeightPercent}px`,
                            }}
                          >
                            {/* teeth/tongue simulation inside mouth */}
                            {mouthHeightPercent > 0.5 && (
                              <div className="w-full h-1/3 bg-white self-start" />
                            )}
                          </div>
                        </div>

                        {/* Base Character SVG Vectors */}
                        {char.imageUrl === "stock_kibo" ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Ears */}
                            <circle cx="20" cy="50" r="8" fill="#FFD0A1" />
                            <circle cx="80" cy="50" r="8" fill="#FFD0A1" />
                            {/* Neck */}
                            <rect x="42" y="65" width="16" height="20" fill="#FFD0A1" />
                            {/* Space suit shoulders */}
                            <path d="M15 88 Q 50 68 85 88 Z" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="2" />
                            <circle cx="50" cy="85" r="5" fill="#4F46E5" />
                            {/* Face base */}
                            <circle cx="50" cy="48" r="30" fill="#FFE0BD" />
                            {/* Hair */}
                            <path d="M20 38 Q 50 10 80 38 Q 50 25 20 38 Z" fill="#2E2A25" />
                            <path d="M20 38 Q 30 25 40 38 Z" fill="#2E2A25" />
                            {/* Nose */}
                            <path d="M50 50 L 48 57 L 52 57 Z" fill="#E0A96D" />
                            {/* Cheeks */}
                            <circle cx="32" cy="54" r="3" fill="#FFA3A3" opacity="0.4" />
                            <circle cx="68" cy="54" r="3" fill="#FFA3A3" opacity="0.4" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Ears */}
                            <circle cx="20" cy="50" r="7" fill="#FFC9A1" />
                            <circle cx="80" cy="50" r="7" fill="#FFC9A1" />
                            {/* Neck */}
                            <rect x="43" y="66" width="14" height="20" fill="#FFC9A1" />
                            {/* Techsuit shoulders */}
                            <path d="M18 88 Q 50 66 82 88 Z" fill="#263238" stroke="#37474F" strokeWidth="2" />
                            <path d="M40 75 L 50 88 L 60 75 Z" fill="#0F9D8A" />
                            {/* Face base */}
                            <circle cx="50" cy="48" r="28" fill="#FFD6B5" />
                            {/* Hair ponytail */}
                            <circle cx="50" cy="18" r="12" fill="#E65100" />
                            <path d="M22 40 Q 50 15 78 40 Q 50 30 22 40 Z" fill="#FF6D00" />
                            {/* Glasses */}
                            <rect x="28" y="34" width="18" height="10" rx="3" fill="none" stroke="#263238" strokeWidth="2" />
                            <rect x="54" y="34" width="18" height="10" rx="3" fill="none" stroke="#263238" strokeWidth="2" />
                            <line x1="46" y1="39" x2="54" y2="39" stroke="#263238" strokeWidth="2" />
                            {/* Nose */}
                            <path d="M50 49 L 48 55 L 52 55 Z" fill="#DE9B6E" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      // Custom photo image with landmarks overlays!
                      <div className="w-full h-full relative">
                        <img
                          src={char.imageUrl}
                          alt={char.name}
                          className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        {/* Dynamic interactive mouth overlaying custom image at landmarks coordinates */}
                        <div
                          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${char.faceLandmarks.mouthCenter.x}%`,
                            top: `${char.faceLandmarks.mouthCenter.y}%`,
                          }}
                        >
                          <div
                            className="bg-rose-800 border border-rose-950 rounded-full transition-all duration-75"
                            style={{
                              width: `${16 * mouthWidthPercent}px`,
                              height: `${12 * mouthHeightPercent}px`,
                            }}
                          />
                        </div>

                        {/* Blinking eyes overlaying custom photo at landmarks */}
                        <div
                          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${char.faceLandmarks.leftEye.x}%`,
                            top: `${char.faceLandmarks.leftEye.y}%`,
                          }}
                        >
                          <div
                            className="bg-black transition-all duration-150"
                            style={{
                              width: "10px",
                              height: Math.sin(currentTime * 0.4) > 0.96 ? "10px" : "0px",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                        <div
                          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${char.faceLandmarks.rightEye.x}%`,
                            top: `${char.faceLandmarks.rightEye.y}%`,
                          }}
                        >
                          <div
                            className="bg-black transition-all duration-150"
                            style={{
                              width: "10px",
                              height: Math.sin(currentTime * 0.4) > 0.96 ? "10px" : "0px",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual speaker highlight indicator */}
                  {isSpeaking && (
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-[#EEF0FF] border border-[#4F46E5] flex items-center gap-1 shadow-xs animate-bounce">
                      <Sparkles className="w-2.5 h-2.5 text-[#4F46E5] animate-pulse" />
                      <span className="text-[9px] font-bold text-[#4F46E5] tracking-wide font-mono">SPEAKING</span>
                    </div>
                  )}

                  {/* Human-labeled name tag */}
                  <div className="mt-1 bg-[#253047] text-white text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md shadow-xs uppercase">
                    {char.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ambient/Weather Layer Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* Cinematic VFX Overlays */}
        {activeScene.bgWeatherEffect === "fog" && (
          <div className="absolute inset-0 pointer-events-none bg-indigo-900/10 mix-blend-color-burn z-10" />
        )}
        {activeScene.bgWeatherEffect === "rain" && (
          <div className="absolute inset-0 pointer-events-none bg-sky-950/20 mix-blend-multiply z-10" />
        )}

        {/* Burned-In Subtitles Subsystem */}
        {activeDialogue && (
          <div className="absolute bottom-6 inset-x-12 z-40 text-center pointer-events-none">
            <div className="inline-block bg-black/75 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg max-w-xl animate-fade-in">
              <span
                className="text-[10px] font-bold uppercase tracking-wider block mb-1 font-mono"
                style={{
                  color:
                    project.characters.find((c) => c.id === activeDialogue.characterId)?.subtitleColor || "#FFFFFF",
                }}
              >
                {activeDialogue.characterId || "Narrator"}
              </span>
              <p className="text-white text-xs sm:text-sm font-medium tracking-wide leading-snug">
                {activeDialogue.text}
              </p>
            </div>
          </div>
        )}

        {/* Scene HUD watermark label */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-2 pointer-events-none z-30 font-mono text-[10px]">
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>SCENE {sceneIndex}/{project.scenes.length}: {activeScene.title}</span>
          <span className="text-white/40">|</span>
          <span className="text-cyan-400 font-bold">{currentTime.toFixed(1)}s / {activeScene.duration.toFixed(1)}s</span>
        </div>

        {/* Volume status mixing watermarks */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 text-white/80 flex items-center gap-1.5 pointer-events-none z-30 font-mono text-[9px]">
          <Volume2 className="w-3 h-3 text-[#0F9D8A]" />
          <span>AUDIO MIXER ENROLLED</span>
        </div>
      </div>
    </div>
  );
}
