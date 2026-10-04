import React, { useEffect, useRef, useState } from 'react';
import { Download, Sparkles, ZoomIn, Eye, RefreshCw, Crop } from 'lucide-react';
import { CustomTextConfig, LogoConfig, Mode, PhotoSlot, Template } from '../types/photobooth';
import { downloadCanvasPng, getStripDimensions, renderSingleStripCanvas } from '../utils/canvasRenderer';

interface StripPreviewProps {
  mode: Mode;
  photos: PhotoSlot[];
  template: Template;
  customText: CustomTextConfig;
  logo: LogoConfig;
  onOpenCropModal?: (photo: PhotoSlot) => void;
  onToggleEmojiBorder?: () => void;
}

export const StripPreview: React.FC<StripPreviewProps> = ({
  mode,
  photos,
  template,
  customText,
  logo,
  onOpenCropModal,
  onToggleEmojiBorder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Render strip when props change
  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    const timer = setTimeout(async () => {
      try {
        const dims = getStripDimensions(template);
        const canvas = await renderSingleStripCanvas(
          photos,
          template,
          customText,
          logo,
          dims.width,
          dims.height
        );
        if (!isCancelled) {
          setRenderedCanvas(canvas);
          setIsRendering(false);
        }
      } catch (err) {
        console.error('Strip preview render failed:', err);
        if (!isCancelled) setIsRendering(false);
      }
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [photos, template, customText, logo]);

  const handleDownloadSingleStrip = () => {
    if (renderedCanvas) {
      downloadCanvasPng(
        renderedCanvas,
        `Photobooth_Strip_${mode}_${template.name.replace(/\s+/g, '_')}.png`
      );
    }
  };

  // Approximate relative vertical regions for the 6 photos on the strip
  const photoZones = [
    { slotIdx: 0, top: '9%', height: '13.5%' },
    { slotIdx: 1, top: '23.3%', height: '13.5%' },
    { slotIdx: 2, top: '37.6%', height: '13.5%' },
    { slotIdx: 3, top: '51.9%', height: '13.5%' },
    { slotIdx: 4, top: '66.2%', height: '13.5%' },
    { slotIdx: 5, top: '80.5%', height: '13.5%' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-2 select-none">
      {/* Header bar */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-1.5 px-1">
        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Physical Strip Preview (6 Photos)</span>
        </div>
        <button
          onClick={handleDownloadSingleStrip}
          disabled={!renderedCanvas || isRendering}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-400 disabled:opacity-40 transition-colors cursor-pointer"
          title="Save individual strip PNG (digital customer copy)"
        >
          <Download className="w-3 h-3" />
          <span>Save Digital Strip</span>
        </button>
      </div>

      {/* Quick Emoji Border Toggle Bar */}
      <div className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 mb-2 text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-sm">
            {template.emojiBorder?.enabled
              ? (template.emojiBorder.emojiList.slice(0, 3).join('') || '✨')
              : '✨'}
          </span>
          <span className="font-semibold text-zinc-200">Emoji Border:</span>
          <span
            className={`font-mono text-[11px] font-bold ${
              template.emojiBorder?.enabled ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            {template.emojiBorder?.enabled ? 'ON' : 'OFF'}
          </span>
        </div>

        {onToggleEmojiBorder && (
          <button
            onClick={onToggleEmojiBorder}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
              template.emojiBorder?.enabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span>{template.emojiBorder?.enabled ? 'Turn OFF' : 'Turn ON'}</span>
          </button>
        )}
      </div>

      {/* Photobooth Strip Canvas Container */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 shadow-2xl max-h-[580px] overflow-hidden"
      >
        {isRendering && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}

        {renderedCanvas ? (
          <div className="relative inline-block">
            <img
              src={renderedCanvas.toDataURL('image/jpeg', 0.95)}
              alt="Photobooth Strip Preview"
              className="h-[520px] w-auto object-contain rounded shadow-2xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] border border-zinc-700/60"
            />

            {/* Clickable interactive photo zones */}
            {onOpenCropModal &&
              photoZones.map((zone) => {
                const photo = photos.find((p) => p.slotIndex === zone.slotIdx);
                return (
                  <button
                    key={zone.slotIdx}
                    onClick={() => {
                      if (photo) onOpenCropModal(photo);
                    }}
                    style={{
                      top: zone.top,
                      height: zone.height,
                      left: '4.5%',
                      right: '4.5%',
                    }}
                    className={`absolute rounded transition-all flex items-center justify-center group ${
                      photo
                        ? 'hover:bg-amber-400/20 hover:ring-2 hover:ring-amber-400 cursor-pointer'
                        : 'pointer-events-none'
                    }`}
                    title={photo ? `Photo ${zone.slotIdx + 1}: Click to adjust crop/zoom` : `Slot ${zone.slotIdx + 1} (Empty)`}
                  >
                    {photo && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Crop className="w-3 h-3" />
                        Adjust
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ) : (
          <div className="h-[520px] w-[190px] rounded bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-zinc-600">
            <Sparkles className="w-8 h-8 mb-2 animate-pulse" />
            <span className="text-xs">Generating Strip...</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-zinc-500 font-mono text-center">
        Narrow strip • 52mm × 137mm physical size • Click any photo to crop
      </div>
    </div>
  );
};
