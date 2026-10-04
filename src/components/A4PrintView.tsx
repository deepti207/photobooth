import React, { useEffect, useRef, useState } from 'react';
import {
  Printer,
  FileDown,
  Image as ImageIcon,
  Scissors,
  ArrowLeft,
  UserPlus,
  RefreshCw,
  Copy,
  Layers,
  Sparkles,
  Check,
  CheckCircle2,
  Sliders,
  Maximize2,
} from 'lucide-react';
import {
  A4DesignMode,
  A4PhotoMode,
  CustomTextConfig,
  LogoConfig,
  Mode,
  PhotoSlot,
  Template,
} from '../types/photobooth';
import { exportA4Pdf, downloadCanvasPng, renderA4Canvas } from '../utils/canvasRenderer';
import { HORIZONTAL_TEMPLATES, VERTICAL_TEMPLATES } from '../data/templates';
import { generateSampleHorizontalPhotos, generateSampleVerticalPhotos } from '../utils/samplePhotos';

interface A4PrintViewProps {
  mode: Mode;
  basePhotos: PhotoSlot[];
  baseTemplate: Template;
  baseCustomText: CustomTextConfig;
  baseLogo: LogoConfig;
  cuttingGuides: boolean;
  onToggleCuttingGuides: () => void;
  onBackToEdit: () => void;
  onNewCustomer: () => void;
  onPrintSuccess: (thumbnailUrl: string, copies: number, templateNames: string[]) => void;
}

export const A4PrintView: React.FC<A4PrintViewProps> = ({
  mode,
  basePhotos,
  baseTemplate,
  baseCustomText,
  baseLogo,
  cuttingGuides,
  onToggleCuttingGuides,
  onBackToEdit,
  onNewCustomer,
  onPrintSuccess,
}) => {
  // A4 Options
  const [designMode, setDesignMode] = useState<A4DesignMode>('same_design');
  const [photoMode, setPhotoMode] = useState<A4PhotoMode>('same_photos');
  const [copies, setCopies] = useState<number>(1);

  // Independent template selectors for the 4 strips
  const availableTemplates = mode === 'vertical' ? VERTICAL_TEMPLATES : HORIZONTAL_TEMPLATES;

  const [sameTemplate, setSameTemplate] = useState<Template>(baseTemplate);

  const [stripTemplates, setStripTemplates] = useState<Template[]>([
    baseTemplate,
    availableTemplates[1 % availableTemplates.length] || baseTemplate,
    availableTemplates[2 % availableTemplates.length] || baseTemplate,
    availableTemplates[3 % availableTemplates.length] || baseTemplate,
  ]);

  // Independent photos for the 4 strips if DIFFERENT PHOTOS is chosen
  const [differentPhotosPerStrip, setDifferentPhotosPerStrip] = useState<PhotoSlot[][]>([
    basePhotos,
    mode === 'vertical' ? generateSampleVerticalPhotos().map(p => ({ ...p, slotIndex: p.slotIndex })) : generateSampleHorizontalPhotos(),
    mode === 'vertical' ? generateSampleVerticalPhotos().map(p => ({ ...p, slotIndex: p.slotIndex, id: `diff_3_${p.id}` })) : generateSampleHorizontalPhotos(),
    mode === 'vertical' ? generateSampleVerticalPhotos().map(p => ({ ...p, slotIndex: p.slotIndex, id: `diff_4_${p.id}` })) : generateSampleHorizontalPhotos(),
  ]);

  // Keep first strip in sync with baseTemplate & basePhotos
  useEffect(() => {
    setSameTemplate(baseTemplate);
    setStripTemplates((prev) => [baseTemplate, prev[1] || baseTemplate, prev[2] || baseTemplate, prev[3] || baseTemplate]);
  }, [baseTemplate]);

  useEffect(() => {
    setDifferentPhotosPerStrip((prev) => [basePhotos, prev[1] || basePhotos, prev[2] || basePhotos, prev[3] || basePhotos]);
  }, [basePhotos]);

  // Canvas State
  const [a4Canvas, setA4Canvas] = useState<HTMLCanvasElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Render the A4 sheet whenever any config changes
  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    const timer = setTimeout(async () => {
      try {
        const stripsData = Array.from({ length: 4 }).map((_, idx) => {
          const tmpl = designMode === 'same_design' ? sameTemplate : stripTemplates[idx] || sameTemplate;
          const photos = photoMode === 'same_photos' ? basePhotos : differentPhotosPerStrip[idx] || basePhotos;
          return {
            photos,
            template: tmpl,
            customText: baseCustomText,
            logo: baseLogo,
          };
        });

        const canvas = await renderA4Canvas(stripsData, cuttingGuides);
        if (!isCancelled) {
          setA4Canvas(canvas);
          setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.9));
          setIsRendering(false);
        }
      } catch (err) {
        console.error('Error rendering A4:', err);
        if (!isCancelled) setIsRendering(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    mode,
    basePhotos,
    baseTemplate,
    baseCustomText,
    baseLogo,
    designMode,
    photoMode,
    stripTemplates,
    differentPhotosPerStrip,
    cuttingGuides,
    sameTemplate,
  ]);

  const handleSystemPrint = () => {
    if (!previewDataUrl) return;

    // Trigger Print
    window.print();

    // Record print job in history & show celebration modal
    const templateNames = designMode === 'same_design'
      ? [baseTemplate.name]
      : stripTemplates.map((t) => t.name);

    onPrintSuccess(previewDataUrl, copies, templateNames);
  };

  const handleSavePdf = () => {
    if (!a4Canvas) return;
    const filename = `Photobooth_A4_${mode}_${designMode}_${Date.now()}.pdf`;
    exportA4Pdf(a4Canvas, filename);

    const templateNames = designMode === 'same_design'
      ? [baseTemplate.name]
      : stripTemplates.map((t) => t.name);
    onPrintSuccess(previewDataUrl || '', copies, templateNames);
  };

  const handleSavePng = () => {
    if (!a4Canvas) return;
    const filename = `Photobooth_A4_300DPI_${mode}_${Date.now()}.png`;
    downloadCanvasPng(a4Canvas, filename);

    const templateNames = designMode === 'same_design'
      ? [baseTemplate.name]
      : stripTemplates.map((t) => t.name);
    onPrintSuccess(previewDataUrl || '', copies, templateNames);
  };

  const updateIndividualStripTemplate = (stripIndex: number, templateId: string) => {
    const tmpl = availableTemplates.find((t) => t.id === templateId) || baseTemplate;
    setStripTemplates((prev) => {
      const copy = [...prev];
      copy[stripIndex] = tmpl;
      return copy;
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-zinc-950 text-zinc-100 select-none">
      {/* Printable Area dedicated for window.print() */}
      <div id="print-sheet-root" className="hidden print:block fixed inset-0 bg-white z-[9999]">
        {previewDataUrl && (
          <img
            src={previewDataUrl}
            alt="Print Sheet"
            className="w-full h-full object-contain"
            style={{ width: '210mm', height: '297mm' }}
          />
        )}
      </div>

      {/* Left / Top Controls Pane */}
      <div className="w-full lg:w-96 p-4 lg:p-6 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between overflow-y-auto space-y-6 print:hidden shrink-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit</span>
            </button>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-400">A4 • 210 × 297 mm</span>
              <div className="text-[10px] text-zinc-500">2 × 2 Layout (4 Strips)</div>
            </div>
          </div>

          {/* Section: A4 Design Mode (Same Design vs Different Designs) */}
          <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Strip Templates
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">4 Strips on Sheet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setDesignMode('same_design')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                  designMode === 'same_design'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                USE SAME TEMPLATE FOR ALL 4 STRIPS
              </button>
              <button
                onClick={() => setDesignMode('different_designs')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                  designMode === 'different_designs'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CUSTOMIZE EACH STRIP
              </button>
            </div>

            {/* When Same Design: Quick Dropdown to Switch Template Across All 4 Strips */}
            {designMode === 'same_design' && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Selected Template (All 4 Strips):</span>
                  <span className="font-bold text-amber-400 font-mono truncate max-w-[150px]">{sameTemplate.name}</span>
                </div>
                <select
                  value={sameTemplate.id}
                  onChange={(e) => {
                    const found = availableTemplates.find((t) => t.id === e.target.value);
                    if (found) setSameTemplate(found);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 font-semibold"
                >
                  {availableTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.category}: {t.name}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-emerald-400/90 font-mono">
                  ✓ All 4 strips use this exact template & frame styling
                </div>
              </div>
            )}

            {/* If Different Designs x 4: 4 Independent Selectors */}
            {designMode === 'different_designs' && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <span className="text-[11px] text-zinc-400 font-medium block">
                  Select Template for each quadrant:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {stripTemplates.map((curTmpl, sIdx) => (
                    <div key={sIdx} className="bg-zinc-900 p-2 rounded border border-zinc-800">
                      <div className="text-[10px] font-mono text-amber-400 font-bold mb-1">
                        STRIP {sIdx + 1}
                      </div>
                      <select
                        value={curTmpl.id}
                        onChange={(e) => updateIndividualStripTemplate(sIdx, e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-200 focus:outline-none"
                      >
                        {availableTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: A4 Photo Options (Same Photos vs Different Photos) */}
          <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                Photo Source
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">6 Photos / Strip</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPhotoMode('same_photos')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                  photoMode === 'same_photos'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                SAME PHOTOS
              </button>
              <button
                onClick={() => setPhotoMode('different_photos')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                  photoMode === 'different_photos'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                DIFFERENT PHOTOS
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 leading-normal">
              {photoMode === 'same_photos'
                ? 'All four strips use the customer\'s uploaded 6 photos.'
                : 'Each strip features its own independent set of 6 photos (24 total photos on A4 sheet).'}
            </div>
          </div>

          {/* Section: Cutting Guides & Print Settings */}
          <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-zinc-200">Cutting Guides</div>
                  <div className="text-[10px] text-zinc-500">Dotted cut lines & corner marks</div>
                </div>
              </div>

              <button
                onClick={onToggleCuttingGuides}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  cuttingGuides
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cuttingGuides ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Copies */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <span className="text-zinc-400">Print Copies:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold text-zinc-100 px-2">{copies}</span>
                <button
                  onClick={() => setCopies((c) => Math.min(20, c + 1))}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: PRINT, SAVE PDF, SAVE PNG */}
        <div className="pt-4 border-t border-zinc-800 space-y-2.5">
          {/* Main Print Button */}
          <button
            onClick={handleSystemPrint}
            disabled={isRendering || !previewDataUrl}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg hover:shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            <span>PRINT A4 SHEET (100% ACTUAL SIZE)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSavePdf}
              disabled={isRendering || !a4Canvas}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-rose-400" />
              <span>Save PDF</span>
            </button>

            <button
              onClick={handleSavePng}
              disabled={isRendering || !a4Canvas}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Save 300 DPI PNG</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onNewCustomer}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Customer (Reset)</span>
            </button>
            <span className="text-[10px] text-zinc-500 font-mono">100% Actual Scale</span>
          </div>
        </div>
      </div>

      {/* Right / Center Preview Pane (Accurate A4 Sheet Display) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto bg-zinc-950/90 relative print:hidden">
        {/* Top Info Banner */}
        <div className="w-full max-w-2xl flex items-center justify-between text-xs text-zinc-400 mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-200">A4 Page Preview — 210 × 297 mm</span>
            <span className="text-zinc-600">·</span>
            <span>4 Strips (2 × 2 Grid)</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
            <span>300 DPI Output</span>
            <span>·</span>
            <span>{cuttingGuides ? 'Cutting Guides Active' : 'No Guides'}</span>
          </div>
        </div>

        {/* A4 Sheet Container */}
        <div className="relative rounded-lg shadow-2xl p-1 bg-zinc-800 border border-zinc-700/80 max-h-[82vh] flex items-center justify-center">
          {isRendering && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center z-20 rounded-lg">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-2" />
              <span className="text-xs font-mono text-zinc-200">Rendering 300 DPI A4 Sheet...</span>
            </div>
          )}

          {previewDataUrl ? (
            <img
              src={previewDataUrl}
              alt="A4 Sheet Preview"
              className="max-h-[76vh] w-auto object-contain rounded bg-white shadow-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
              style={{
                aspectRatio: '210/297',
              }}
            />
          ) : (
            <div
              className="w-[420px] max-h-[76vh] bg-zinc-900 rounded flex flex-col items-center justify-center text-zinc-600"
              style={{ aspectRatio: '210/297' }}
            >
              <RefreshCw className="w-8 h-8 animate-spin mb-2 text-amber-500" />
              <span className="text-xs">Preparing 4-strip layout...</span>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-zinc-500 flex items-center gap-3">
          <span>Each strip: ~52mm × 137mm</span>
          <span>·</span>
          <span>Even gutters for paper rotary guillotine cutting</span>
        </div>
      </div>
    </div>
  );
};
