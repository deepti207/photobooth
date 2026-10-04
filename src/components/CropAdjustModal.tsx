import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Move,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
} from 'lucide-react';
import { CropSettings, Mode, PhotoSlot } from '../types/photobooth';

interface CropAdjustModalProps {
  photo: PhotoSlot;
  mode: Mode;
  onSave: (updatedCrop: CropSettings) => void;
  onClose: () => void;
}

export const CropAdjustModal: React.FC<CropAdjustModalProps> = ({
  photo,
  mode,
  onSave,
  onClose,
}) => {
  const [zoom, setZoom] = useState(photo.crop.zoom || 1);
  const [panX, setPanX] = useState(photo.crop.panX || 0);
  const [panY, setPanY] = useState(photo.crop.panY || 0);
  const [rotation, setRotation] = useState(photo.crop.rotation || 0);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>(photo.crop.fitMode || 'cover');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Frame aspect ratio based on mode:
  // VERTICAL MODE: Square / near-square compact frame (1:1 ratio = 1.0)
  // HORIZONTAL MODE: Landscape frame (3:2 ratio = 1.5)
  const frameAspectRatio = mode === 'vertical' ? 1.0 : 3 / 2;

  // Render preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const destW = canvas.width;
      const destH = canvas.height;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, destW, destH);
      ctx.clip();

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const srcRatio = srcW / srcH;
      const destRatio = destW / destH;

      let renderW: number;
      let renderH: number;

      if (fitMode === 'contain') {
        if (srcRatio > destRatio) {
          renderW = destW;
          renderH = destW / srcRatio;
        } else {
          renderH = destH;
          renderW = destH * srcRatio;
        }
      } else {
        if (srcRatio > destRatio) {
          renderH = destH;
          renderW = destH * srcRatio;
        } else {
          renderW = destW;
          renderH = destW / srcRatio;
        }
      }

      renderW *= zoom;
      renderH *= zoom;

      const maxPanX = Math.max(0, (renderW - destW) / 2);
      const maxPanY = Math.max(0, (renderH - destH) / 2);

      const panOffsetPxX = (panX / 100) * (maxPanX || renderW * 0.25);
      const panOffsetPxY = (panY / 100) * (maxPanY || renderH * 0.25);

      const drawX = (destW - renderW) / 2 + panOffsetPxX;
      const drawY = (destH - renderH) / 2 + panOffsetPxY;

      ctx.drawImage(img, drawX, drawY, renderW, renderH);

      // Rule of thirds guide
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(destW / 3, 0);
      ctx.lineTo(destW / 3, destH);
      ctx.moveTo((destW * 2) / 3, 0);
      ctx.lineTo((destW * 2) / 3, destH);
      ctx.moveTo(0, destH / 3);
      ctx.lineTo(destW, destH / 3);
      ctx.moveTo(0, (destH * 2) / 3);
      ctx.lineTo(destW, (destH * 2) / 3);
      ctx.stroke();

      ctx.restore();
    };
    img.src = photo.dataUrl;
  }, [photo.dataUrl, zoom, panX, panY, rotation, mode, fitMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newPanX = Math.min(100, Math.max(-100, dragStartRef.current.initialPanX + dx * 0.5));
    const newPanY = Math.min(100, Math.max(-100, dragStartRef.current.initialPanY + dy * 0.5));
    setPanX(Math.round(newPanX));
    setPanY(Math.round(newPanY));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Nudge controls
  const handleNudge = (dx: number, dy: number) => {
    setPanX((prev) => Math.min(100, Math.max(-100, prev + dx)));
    setPanY((prev) => Math.min(100, Math.max(-100, prev + dy)));
  };

  const handleZoomChange = (delta: number) => {
    setZoom((prev) => Math.min(3, Math.max(1, +(prev + delta).toFixed(2))));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setFitMode('cover');
  };

  const handleSave = () => {
    onSave({
      zoom,
      panX,
      panY,
      rotation,
      fitMode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Move className="w-4 h-4 text-amber-400" />
              Adjust Position & Crop • Slot {photo.slotIndex + 1} ({mode === 'vertical' ? 'Square 1:1 Frame' : 'Landscape 3:2 Frame'})
            </h3>
            <p className="text-xs text-zinc-400">
              {mode === 'vertical'
                ? 'Compact square photobooth frame • High-quality cover cropping'
                : 'Landscape photobooth frame • High-quality cover cropping'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Canvas Preview */}
        <div className="p-5 flex flex-col items-center justify-center bg-zinc-950/70">
          <div
            className="relative rounded-lg overflow-hidden border-2 border-amber-500 shadow-xl cursor-grab active:cursor-grabbing"
            style={{
              width: mode === 'vertical' ? '280px' : '360px',
              height: mode === 'vertical' ? '280px' : '240px',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={mode === 'vertical' ? 560 : 720}
              height={mode === 'vertical' ? 560 : 480}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-zinc-300 pointer-events-none font-mono">
              Drag to pan
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-mono">
              {mode === 'vertical' ? 'SQUARE' : 'LANDSCAPE'} ({fitMode.toUpperCase()}) {zoom.toFixed(1)}×
            </div>
          </div>
        </div>

        {/* Quick Position & Zoom Controls */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-3.5">
          {/* Action Button Row: Zoom +, Zoom -, Fit, Fill, Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Zoom Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => handleZoomChange(-0.15)}
                disabled={zoom <= 1}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 disabled:opacity-30 flex items-center gap-1"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Zoom -</span>
              </button>
              <span className="font-mono text-xs px-2 text-amber-400 font-bold">{zoom.toFixed(2)}×</span>
              <button
                onClick={() => handleZoomChange(0.15)}
                disabled={zoom >= 3}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 disabled:opacity-30 flex items-center gap-1"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom +</span>
              </button>
            </div>

            {/* Fit vs Fill Mode */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setFitMode('cover')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  fitMode === 'cover' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
                title="Fill frame (Cover crop)"
              >
                Fill
              </button>
              <button
                onClick={() => setFitMode('contain')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  fitMode === 'contain' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
                title="Fit whole photo (Letterbox)"
              >
                Fit
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* D-Pad / Move Position Controls */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Position / Move Controls:</span>
              <span className="text-[11px] text-amber-400 font-mono">
                X: {panX > 0 ? `+${panX}` : panX}% • Y: {panY > 0 ? `+${panY}` : panY}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleNudge(-10, 0)}
                className="py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold"
                title="Move photo left inside frame"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Move Left</span>
              </button>

              <button
                onClick={() => handleNudge(0, -10)}
                className="py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold"
                title="Move photo up inside frame"
              >
                <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Move Up</span>
              </button>

              <button
                onClick={() => handleNudge(0, 10)}
                className="py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold"
                title="Move photo down inside frame"
              >
                <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Move Down</span>
              </button>

              <button
                onClick={() => handleNudge(10, 0)}
                className="py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold"
                title="Move photo right inside frame"
              >
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Move Right</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Position</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
