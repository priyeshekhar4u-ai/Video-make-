import React, { useRef, useState, useEffect } from "react";
import { Project, Scene, DialogueCue, SFXCue } from "../types";
import { Play, Pause, Scissors, Trash2, Lock, Unlock, ZoomIn, ZoomOut, RotateCcw, RotateCw } from "lucide-react";

interface TimelineEditorProps {
  project: Project;
  sceneIndex: number; // 1-indexed
  onSelectSceneIndex: (index: number) => void;
  currentTime: number; // relative to scene
  onScrub: (time: number) => void;
  onUpdateScenes: (scenes: Scene[]) => void;
}

export default function TimelineEditor({
  project,
  sceneIndex,
  onSelectSceneIndex,
  currentTime,
  onScrub,
  onUpdateScenes,
}: TimelineEditorProps) {
  const activeScene = project.scenes.find((s) => s.sceneIndex === sceneIndex) || project.scenes[0];
  const [zoomLevel, setZoomLevel] = useState<number>(14); // pixels per second
  const timelineRulerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Split active scene at playhead
  const handleSplitScene = () => {
    if (activeScene.isLocked) return;

    const splitTime = currentTime;
    if (splitTime <= 1.0 || splitTime >= activeScene.duration - 1.0) return; // avoid tiny fragments

    // Create scene 1 dialogues (before split)
    const beforeDialogues = activeScene.dialogues
      .filter((d) => d.startTime < splitTime)
      .map((d) => ({
        ...d,
        duration: d.startTime + d.duration > splitTime ? splitTime - d.startTime : d.duration,
      }));

    // Create scene 2 dialogues (after split)
    const afterDialogues = activeScene.dialogues
      .filter((d) => d.startTime + d.duration > splitTime)
      .map((d, i) => {
        const originalEnd = d.startTime + d.duration;
        const newStart = Math.max(0, d.startTime - splitTime);
        const newDuration = originalEnd - Math.max(splitTime, d.startTime);
        return {
          ...d,
          id: `${d.id}_split_${i}`,
          startTime: newStart,
          duration: newDuration,
        };
      });

    // Create scene 1 and scene 2 durations
    const duration1 = splitTime;
    const duration2 = activeScene.duration - splitTime;

    // Create two scenes
    const scene1: Scene = {
      ...activeScene,
      title: `${activeScene.title} (Part A)`,
      duration: duration1,
      dialogues: beforeDialogues,
      sfxCues: activeScene.sfxCues.filter((s) => s.startTime < splitTime),
    };

    const scene2: Scene = {
      ...activeScene,
      id: `${activeScene.id}_split_${Date.now()}`,
      sceneIndex: activeScene.sceneIndex + 1,
      title: `${activeScene.title} (Part B)`,
      duration: duration2,
      dialogues: afterDialogues,
      sfxCues: activeScene.sfxCues
        .filter((s) => s.startTime >= splitTime)
        .map((s) => ({ ...s, id: `${s.id}_s`, startTime: s.startTime - splitTime })),
    };

    // Reorder subsequent scene indexes
    const updatedScenes: Scene[] = [];
    project.scenes.forEach((sc) => {
      if (sc.sceneIndex < activeScene.sceneIndex) {
        updatedScenes.push(sc);
      } else if (sc.sceneIndex === activeScene.sceneIndex) {
        updatedScenes.push(scene1);
        updatedScenes.push(scene2);
      } else {
        updatedScenes.push({
          ...sc,
          sceneIndex: sc.sceneIndex + 1,
        });
      }
    });

    onUpdateScenes(updatedScenes);
    onScrub(0);
  };

  // Delete scene
  const handleDeleteScene = () => {
    if (project.scenes.length <= 1 || activeScene.isLocked) return;

    const filtered = project.scenes
      .filter((sc) => sc.sceneIndex !== sceneIndex)
      .map((sc, i) => ({
        ...sc,
        sceneIndex: i + 1,
      }));

    onUpdateScenes(filtered);
    onSelectSceneIndex(Math.max(1, sceneIndex - 1));
    onScrub(0);
  };

  // Toggle scene lock
  const handleToggleLock = () => {
    const updated = project.scenes.map((sc) =>
      sc.sceneIndex === sceneIndex ? { ...sc, isLocked: !sc.isLocked } : sc
    );
    onUpdateScenes(updated);
  };

  // Handle ruler mouse seek
  const handleTimelineRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = Math.max(0, Math.min(activeScene.duration, x / zoomLevel));
    onScrub(seekTime);
  };

  const handleMouseDownPlayhead = () => {
    setIsDraggingPlayhead(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingPlayhead || !timelineRulerRef.current) return;
      const rect = timelineRulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const seekTime = Math.max(0, Math.min(activeScene.duration, x / zoomLevel));
      onScrub(seekTime);
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    if (isDraggingPlayhead) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingPlayhead, zoomLevel]);

  // Width in pixels of active scene timeline
  const timelineWidth = activeScene.duration * zoomLevel;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#D8E0EA] shadow-sm overflow-hidden p-4">
      {/* Upper Timeline Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D8E0EA] mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#253047] uppercase tracking-wider">Timeline Tracks</span>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-[#D8E0EA]">
            SCENE {sceneIndex} DURATION: {activeScene.duration.toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Split button */}
          <button
            disabled={activeScene.isLocked || activeScene.duration < 2.0}
            onClick={handleSplitScene}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeScene.isLocked || activeScene.duration < 2.0
                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
            }`}
            title="Split selected scene at playhead position"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-500" /> Split Scene
          </button>

          {/* Lock button */}
          <button
            onClick={handleToggleLock}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeScene.isLocked
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
            }`}
          >
            {activeScene.isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600" /> Locked
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-slate-500" /> Lock Scene
              </>
            )}
          </button>

          {/* Delete scene */}
          <button
            disabled={project.scenes.length <= 1 || activeScene.isLocked}
            onClick={handleDeleteScene}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              project.scenes.length <= 1 || activeScene.isLocked
                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>

          <span className="h-6 w-[1px] bg-slate-200 mx-1" />

          {/* Zooming Controls */}
          <button
            onClick={() => setZoomLevel(Math.max(6, zoomLevel - 2))}
            className="p-1.5 rounded-lg border border-[#D8E0EA] bg-slate-50 text-slate-500 hover:text-[#253047] hover:bg-slate-100"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 w-10 text-center">{Math.round(zoomLevel * 7)}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(30, zoomLevel + 2))}
            className="p-1.5 rounded-lg border border-[#D8E0EA] bg-slate-50 text-slate-500 hover:text-[#253047] hover:bg-slate-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tracks Wrapper */}
      <div className="flex flex-col relative overflow-x-auto select-none max-h-72 border border-[#D8E0EA] rounded-xl bg-slate-50">
        <div className="min-w-max relative flex flex-col">
          {/* TRACK 1: TIMELINE RULER TIME */}
          <div
            ref={timelineRulerRef}
            onClick={handleTimelineRulerClick}
            className="h-8 border-b border-[#D8E0EA] bg-slate-100 flex items-end relative cursor-pointer"
            style={{ width: `${timelineWidth}px` }}
          >
            {/* Tick marks */}
            {Array.from({ length: Math.ceil(activeScene.duration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute bottom-0 border-l border-slate-300 text-[9px] font-mono text-[#64748B] pl-1"
                style={{ left: `${sec * zoomLevel}px`, height: sec % 5 === 0 ? "100%" : "50%" }}
              >
                {sec % 5 === 0 ? `${sec}s` : ""}
              </div>
            ))}

            {/* Draggable Red Playhead Pointer */}
            <div
              onMouseDown={handleMouseDownPlayhead}
              className="absolute top-0 bottom-[-300px] w-0.5 bg-red-500 cursor-ew-resize z-50 group"
              style={{ left: `${currentTime * zoomLevel}px` }}
            >
              <div className="absolute top-0 -translate-x-1/2 w-3 h-3.5 bg-red-500 rounded-b shadow-sm flex items-center justify-center">
                <span className="w-1 h-1.5 bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* TRACK 2: SCENES CHUNKS */}
          <div className="h-10 border-b border-[#D8E0EA] bg-white flex items-center relative pl-24">
            <div className="absolute left-0 top-0 bottom-0 w-24 border-r border-[#D8E0EA] bg-slate-50 flex items-center px-2 font-semibold text-[10px] text-[#64748B] uppercase">
              Scene List
            </div>
            {/* Scenes present */}
            <div className="flex items-center h-full absolute left-24">
              {project.scenes.map((sc) => {
                const isActive = sc.sceneIndex === sceneIndex;
                const width = sc.duration * zoomLevel;
                return (
                  <button
                    key={sc.id}
                    onClick={() => onSelectSceneIndex(sc.sceneIndex)}
                    className={`h-7 rounded-md text-[10px] font-bold px-2 flex items-center justify-between border select-none transition-all mr-1 truncate ${
                      isActive
                        ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5] shadow-xs"
                        : "bg-white border-[#D8E0EA] text-[#253047] hover:bg-slate-50"
                    }`}
                    style={{ width: `${width - 4}px` }}
                  >
                    <span className="truncate">Sc {sc.sceneIndex}: {sc.title}</span>
                    {sc.isLocked && <Lock className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: DIALOGUES/NARRATION TIMINGS */}
          <div className="h-10 border-b border-[#D8E0EA] bg-white flex items-center relative pl-24">
            <div className="absolute left-0 top-0 bottom-0 w-24 border-r border-[#D8E0EA] bg-slate-50 flex items-center px-2 font-semibold text-[10px] text-[#64748B] uppercase">
              Dialogue
            </div>
            <div className="absolute left-24 h-full flex items-center">
              {activeScene.dialogues.map((cue) => {
                const isCurrent = currentTime >= cue.startTime && currentTime <= cue.startTime + cue.duration;
                const width = cue.duration * zoomLevel;
                const isNarrator = !cue.characterId;
                return (
                  <div
                    key={cue.id}
                    className={`h-7 rounded-md border text-[9px] font-medium px-2 flex flex-col justify-center absolute truncate leading-tight select-none transition-all ${
                      isCurrent
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                        : isNarrator
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                    style={{ left: `${cue.startTime * zoomLevel}px`, width: `${width - 2}px` }}
                  >
                    <span className="font-bold uppercase tracking-wide truncate">
                      {cue.characterId || "Narrator"} ({cue.emotion})
                    </span>
                    <span className="truncate">{cue.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 4: CAMERA SHOT ANCHORS */}
          <div className="h-9 border-b border-[#D8E0EA] bg-white flex items-center relative pl-24">
            <div className="absolute left-0 top-0 bottom-0 w-24 border-r border-[#D8E0EA] bg-slate-50 flex items-center px-2 font-semibold text-[10px] text-[#64748B] uppercase">
              Camera Shot
            </div>
            <div className="absolute left-24 h-full flex items-center">
              <div
                className="h-6 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-800 text-[9px] font-semibold px-2.5 flex items-center gap-1.5 uppercase tracking-wide"
                style={{ width: `${timelineWidth - 4}px` }}
              >
                <span>🎬 {activeScene.cameraShot} shot</span>
                <span className="text-cyan-300">|</span>
                <span className="text-[8px] text-cyan-600 lowercase font-normal">adjusts scale, pan, focus coordinates</span>
              </div>
            </div>
          </div>

          {/* TRACK 5: SOUND EFFECTS CUES */}
          <div className="h-9 border-b border-[#D8E0EA] bg-white flex items-center relative pl-24">
            <div className="absolute left-0 top-0 bottom-0 w-24 border-r border-[#D8E0EA] bg-slate-50 flex items-center px-2 font-semibold text-[10px] text-[#64748B] uppercase">
              Sound FX (SFX)
            </div>
            <div className="absolute left-24 h-full flex items-center">
              {activeScene.sfxCues.map((sfx) => {
                const isTriggered = Math.abs(currentTime - sfx.startTime) < 0.5;
                return (
                  <div
                    key={sfx.id}
                    className={`h-6 rounded-md border text-[9px] px-2 flex items-center gap-1 font-semibold absolute select-none transition-all ${
                      isTriggered
                        ? "bg-rose-500 text-white border-rose-600 scale-105 shadow-sm"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}
                    style={{ left: `${sfx.startTime * zoomLevel}px` }}
                  >
                    🔔 {sfx.soundName.replace("_", " ")}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 6: MUSIC BACKGROUND SOUND */}
          <div className="h-9 border-b border-[#D8E0EA] bg-white flex items-center relative pl-24">
            <div className="absolute left-0 top-0 bottom-0 w-24 border-r border-[#D8E0EA] bg-slate-50 flex items-center px-2 font-semibold text-[10px] text-[#64748B] uppercase">
              BGM Theme
            </div>
            <div className="absolute left-24 h-full flex items-center">
              <div
                className="h-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-2.5 flex items-center gap-1.5 uppercase"
                style={{ width: `${timelineWidth - 4}px` }}
              >
                🎵 {activeScene.musicCue.theme} theme (vol: {activeScene.musicCue.volume * 100}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#64748B] mt-2 flex items-center justify-between">
        <span>Click anywhere on the ruler bar to scrub the playhead. Drag to seek frame numbers.</span>
        <span className="font-mono text-indigo-600">ZOOM RESOLUTION: {(zoomLevel * 7).toFixed(0)}%</span>
      </div>
    </div>
  );
}
