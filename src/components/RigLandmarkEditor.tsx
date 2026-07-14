import React, { useState, useRef, useEffect } from "react";
import { Character, FaceLandmarks } from "../types";
import { Eye, Move, Smile, Compass, RotateCcw } from "lucide-react";

interface RigLandmarkEditorProps {
  character: Character;
  onUpdateLandmarks: (landmarks: FaceLandmarks) => void;
}

export default function RigLandmarkEditor({ character, onUpdateLandmarks }: RigLandmarkEditorProps) {
  const [activeKey, setActiveKey] = useState<keyof FaceLandmarks | "leftEye" | "rightEye" | "mouthLeft" | "mouthRight" | "mouthCenter" | "nose" | "faceOutline" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Render character default vector if stock, or image if uploaded
  const isStockKibo = character.imageUrl === "stock_kibo";
  const isStockNori = character.imageUrl === "stock_nori";

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || activeKey === "faceOutline") return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Limit ranges
    const posX = Math.max(0, Math.min(100, x));
    const posY = Math.max(0, Math.min(100, y));

    if (activeKey && activeKey !== "faceOutline") {
      const updated = { ...character.faceLandmarks };
      (updated[activeKey] as any) = { x: posX, y: posY };
      onUpdateLandmarks(updated);
    }
  };

  const startDragOutline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveKey("faceOutline");
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragOffset({
      x: x - character.faceLandmarks.faceOutline.x,
      y: y - character.faceLandmarks.faceOutline.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeKey !== "faceOutline" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(0, Math.min(80, Math.round(x - dragOffset.x)));
    const newY = Math.max(0, Math.min(80, Math.round(y - dragOffset.y)));

    const updated = { ...character.faceLandmarks };
    updated.faceOutline = {
      ...updated.faceOutline,
      x: newX,
      y: newY,
    };
    onUpdateLandmarks(updated);
  };

  const stopDrag = () => {
    if (activeKey === "faceOutline") {
      setActiveKey(null);
    }
  };

  const handleLandmarkReset = () => {
    const defaults: Record<string, FaceLandmarks> = {
      KIBO: {
        leftEye: { x: 38, y: 40 },
        rightEye: { x: 62, y: 40 },
        mouthLeft: { x: 42, y: 72 },
        mouthRight: { x: 58, y: 72 },
        mouthCenter: { x: 50, y: 74 },
        nose: { x: 50, y: 55 },
        faceOutline: { x: 20, y: 15, width: 60, height: 70 },
      },
      NORI: {
        leftEye: { x: 38, y: 38 },
        rightEye: { x: 62, y: 38 },
        mouthLeft: { x: 43, y: 70 },
        mouthRight: { x: 57, y: 70 },
        mouthCenter: { x: 50, y: 71 },
        nose: { x: 50, y: 53 },
        faceOutline: { x: 22, y: 12, width: 56, height: 72 },
      },
    };

    const targetKey = character.id in defaults ? character.id : "KIBO";
    onUpdateLandmarks(defaults[targetKey]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 bg-white rounded-2xl border border-[#D8E0EA] shadow-sm">
      {/* Visual Canvas Stage */}
      <div className="flex-1 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-[#253047] mb-2 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#4F46E5]" /> Interactive Rig Canvas
        </h3>
        <p className="text-xs text-[#64748B] mb-4 text-center">
          Select a node from the sidebar and click on the head below to align coordinates, or drag the face box outline.
        </p>

        <div
          ref={containerRef}
          onClick={handleContainerClick}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          className={`relative w-72 h-72 rounded-2xl border border-[#D8E0EA] overflow-hidden cursor-crosshair select-none bg-slate-50 flex items-center justify-center transition-all ${
            activeKey ? "ring-2 ring-indigo-200" : ""
          }`}
        >
          {/* Custom Image Upload or Stock illustration */}
          {isStockKibo && (
            <svg viewBox="0 0 100 100" className="w-full h-full p-6">
              {/* Ears */}
              <circle cx="20" cy="50" r="8" fill="#FFD0A1" stroke="#E0A96D" strokeWidth="1" />
              <circle cx="80" cy="50" r="8" fill="#FFD0A1" stroke="#E0A96D" strokeWidth="1" />
              {/* Neck */}
              <rect x="42" y="65" width="16" height="20" fill="#FFD0A1" stroke="#E0A96D" />
              {/* Face base */}
              <circle cx="50" cy="48" r="30" fill="#FFE0BD" stroke="#E0A96D" strokeWidth="1.5" />
              {/* Hair */}
              <path d="M20 38 Q 50 10 80 38 Q 50 25 20 38 Z" fill="#2E2A25" />
              <path d="M20 38 Q 30 25 40 38 Z" fill="#2E2A25" />
              {/* Cheeks */}
              <circle cx="32" cy="54" r="3" fill="#FFA3A3" opacity="0.6" />
              <circle cx="68" cy="54" r="3" fill="#FFA3A3" opacity="0.6" />
            </svg>
          )}

          {isStockNori && (
            <svg viewBox="0 0 100 100" className="w-full h-full p-6">
              {/* Ears */}
              <circle cx="20" cy="50" r="7" fill="#FFC9A1" stroke="#DE9B6E" />
              <circle cx="80" cy="50" r="7" fill="#FFC9A1" stroke="#DE9B6E" />
              {/* Neck */}
              <rect x="43" y="66" width="14" height="20" fill="#FFC9A1" stroke="#DE9B6E" />
              {/* Face base */}
              <circle cx="50" cy="48" r="28" fill="#FFD6B5" stroke="#DE9B6E" strokeWidth="1.5" />
              {/* Hair - ponytail / bun */}
              <circle cx="50" cy="18" r="12" fill="#E65100" />
              <path d="M22 40 Q 50 15 78 40 Q 50 30 22 40 Z" fill="#FF6D00" />
              {/* Glasses rim */}
              <rect x="28" y="34" width="18" height="10" rx="3" fill="none" stroke="#263238" strokeWidth="2" />
              <rect x="54" y="34" width="18" height="10" rx="3" fill="none" stroke="#263238" strokeWidth="2" />
              <line x1="46" y1="39" x2="54" y2="39" stroke="#263238" strokeWidth="2" />
            </svg>
          )}

          {!isStockKibo && !isStockNori && (
            <div className="w-full h-full relative bg-indigo-50 flex items-center justify-center p-4">
              <img
                src={character.imageUrl.startsWith("data:") ? character.imageUrl : "https://picsum.photos/seed/face/400/400"}
                alt="Custom Character Rig"
                className="max-w-full max-h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Landmarks Nodes Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Face Outline Box */}
            <div
              onMouseDown={startDragOutline}
              className={`absolute border-2 pointer-events-auto cursor-move transition-all ${
                activeKey === "faceOutline" ? "border-[#4F46E5] bg-indigo-50/10" : "border-slate-400 border-dashed"
              }`}
              style={{
                left: `${character.faceLandmarks.faceOutline.x}%`,
                top: `${character.faceLandmarks.faceOutline.y}%`,
                width: `${character.faceLandmarks.faceOutline.width}%`,
                height: `${character.faceLandmarks.faceOutline.height}%`,
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-700 text-[10px] text-white px-1 rounded flex items-center gap-0.5 shadow-sm">
                <Move className="w-2.5 h-2.5" /> Face Area
              </div>
            </div>

            {/* Left Eye Node */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-md transition-all ${
                activeKey === "leftEye" ? "border-[#4F46E5] scale-125" : "border-emerald-500"
              }`}
              style={{ left: `${character.faceLandmarks.leftEye.x}%`, top: `${character.faceLandmarks.leftEye.y}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            {/* Right Eye Node */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-md transition-all ${
                activeKey === "rightEye" ? "border-[#4F46E5] scale-125" : "border-emerald-500"
              }`}
              style={{ left: `${character.faceLandmarks.rightEye.x}%`, top: `${character.faceLandmarks.rightEye.y}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            {/* Nose Node */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-md transition-all ${
                activeKey === "nose" ? "border-[#4F46E5] scale-125" : "border-orange-500"
              }`}
              style={{ left: `${character.faceLandmarks.nose.x}%`, top: `${character.faceLandmarks.nose.y}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            </div>

            {/* Mouth Left Node */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-md transition-all ${
                activeKey === "mouthLeft" ? "border-[#4F46E5] scale-125" : "border-rose-500"
              }`}
              style={{ left: `${character.faceLandmarks.mouthLeft.x}%`, top: `${character.faceLandmarks.mouthLeft.y}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>

            {/* Mouth Right Node */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-md transition-all ${
                activeKey === "mouthRight" ? "border-[#4F46E5] scale-125" : "border-rose-500"
              }`}
              style={{ left: `${character.faceLandmarks.mouthRight.x}%`, top: `${character.faceLandmarks.mouthRight.y}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>

            {/* Mouth Center Node */}
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shadow-md transition-all ${
                activeKey === "mouthCenter" ? "border-[#4F46E5] scale-125" : "border-rose-600"
              }`}
              style={{ left: `${character.faceLandmarks.mouthCenter.x}%`, top: `${character.faceLandmarks.mouthCenter.y}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Controls Panel */}
      <div className="w-full md:w-60 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Rig Landmark Nodes</h4>
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveKey("leftEye")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                activeKey === "leftEye"
                  ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5]"
                  : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" /> Left Eye Node
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8E0EA]">
                {character.faceLandmarks.leftEye.x}%, {character.faceLandmarks.leftEye.y}%
              </span>
            </button>

            <button
              onClick={() => setActiveKey("rightEye")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                activeKey === "rightEye"
                  ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5]"
                  : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" /> Right Eye Node
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8E0EA]">
                {character.faceLandmarks.rightEye.x}%, {character.faceLandmarks.rightEye.y}%
              </span>
            </button>

            <button
              onClick={() => setActiveKey("nose")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                activeKey === "nose"
                  ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5]"
                  : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-orange-500" /> Nose Pointer
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8E0EA]">
                {character.faceLandmarks.nose.x}%, {character.faceLandmarks.nose.y}%
              </span>
            </button>

            <button
              onClick={() => setActiveKey("mouthLeft")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                activeKey === "mouthLeft"
                  ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5]"
                  : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-rose-500" /> Mouth Corner Left
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8E0EA]">
                {character.faceLandmarks.mouthLeft.x}%, {character.faceLandmarks.mouthLeft.y}%
              </span>
            </button>

            <button
              onClick={() => setActiveKey("mouthRight")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                activeKey === "mouthRight"
                  ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5]"
                  : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-rose-500" /> Mouth Corner Right
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8E0EA]">
                {character.faceLandmarks.mouthRight.x}%, {character.faceLandmarks.mouthRight.y}%
              </span>
            </button>

            <button
              onClick={() => setActiveKey("mouthCenter")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                activeKey === "mouthCenter"
                  ? "bg-[#EEF0FF] border-[#4F46E5] text-[#4F46E5]"
                  : "bg-slate-50 border-[#D8E0EA] text-[#253047] hover:bg-[#EEF2F7]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-rose-600" /> Mouth Center Aperture
              </span>
              <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8E0EA]">
                {character.faceLandmarks.mouthCenter.x}%, {character.faceLandmarks.mouthCenter.y}%
              </span>
            </button>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#D8E0EA] flex flex-col gap-2">
          <button
            onClick={handleLandmarkReset}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#D8E0EA] text-[#64748B] hover:text-[#253047] hover:bg-slate-50 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Node Positions
          </button>
          <div className="text-[10px] text-[#64748B] italic leading-snug">
            The mouth, eyes, and bounding area coordinates are used to anchor the 2.5D animation rig, ensuring accurate sync timing and blink states.
          </div>
        </div>
      </div>
    </div>
  );
}
