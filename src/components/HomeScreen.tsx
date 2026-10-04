import React from 'react';
import { Smartphone, Image as ImageIcon, History, Settings, Zap, Printer, Scissors, Sparkles, CheckCircle2 } from 'lucide-react';
import { Mode } from '../types/photobooth';

interface HomeScreenProps {
  onSelectMode: (mode: Mode) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  fastMode: boolean;
  onToggleFastMode: () => void;
  historyCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMode,
  onOpenHistory,
  onOpenSettings,
  fastMode,
  onToggleFastMode,
  historyCount,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 md:p-10 select-none">
      {/* Brand Hero Section */}
      <div className="max-w-5xl mx-auto w-full text-center pt-4 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Offline Ready · Windows Stall Edition · 300 DPI A4 Output</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2">
          PHOTOBOOTH STUDIO
        </h1>
        <p className="text-lg md:text-xl font-medium text-zinc-400 tracking-wide">
          Create <span className="text-amber-500 font-bold">•</span> Print <span className="text-rose-500 font-bold">•</span> Memories
        </p>
      </div>

      {/* Main Mode Selection Cards */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
        {/* VERTICAL MODE CARD */}
        <button
          onClick={() => onSelectMode('vertical')}
          className="group relative flex flex-col text-left p-8 rounded-xl bg-zinc-900/90 hover:bg-zinc-900 border-2 border-zinc-800 hover:border-amber-500/80 transition-all duration-200 shadow-xl hover:shadow-amber-500/10 active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all">
              <Smartphone className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              6 VERTICAL PHOTOS
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            VERTICAL MODE
          </h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            6 vertical portrait photos → Square / near-square compact frames with generous borders on a classic long photobooth strip.
            Automatic portrait detection, compact square frames (1:1), and 30+ curated templates.
          </p>

          {/* Visual Mini Representation of 6 square stacked frames */}
          <div className="mt-auto pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-zinc-950/80 px-3 py-1.5 rounded border border-zinc-800">
              <div className="w-5 h-5 rounded-xs bg-amber-500/40 border border-amber-500/60" />
              <div className="w-5 h-5 rounded-xs bg-amber-500/40 border border-amber-500/60" />
              <div className="w-5 h-5 rounded-xs bg-amber-500/40 border border-amber-500/60" />
              <div className="w-5 h-5 rounded-xs bg-amber-500/40 border border-amber-500/60" />
              <div className="w-5 h-5 rounded-xs bg-amber-500/40 border border-amber-500/60" />
              <div className="w-5 h-5 rounded-xs bg-amber-500/40 border border-amber-500/60" />
              <span className="text-[11px] text-zinc-400 ml-2 font-mono">6× Square Stack</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-amber-500 text-zinc-950 font-bold text-sm group-hover:bg-amber-400 transition-colors">
              <span>Start Vertical</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* HORIZONTAL MODE CARD */}
        <button
          onClick={() => onSelectMode('horizontal')}
          className="group relative flex flex-col text-left p-8 rounded-xl bg-zinc-900/90 hover:bg-zinc-900 border-2 border-zinc-800 hover:border-cyan-500/80 transition-all duration-200 shadow-xl hover:shadow-cyan-500/10 active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all">
              <ImageIcon className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              6 HORIZONTAL PHOTOS
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            HORIZONTAL MODE
          </h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            6 horizontal landscape photos → Landscape photo frames (3:2) stacked vertically inside the same long photobooth strip.
            Automatic landscape validation, fixed landscape ratios, and 30+ curated templates.
          </p>

          {/* Visual Mini Representation of 6 horizontal stacked frames */}
          <div className="mt-auto pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-zinc-950/80 px-3 py-1.5 rounded border border-zinc-800">
              <div className="w-6 h-4 rounded-xs bg-cyan-500/40 border border-cyan-500/60" />
              <div className="w-6 h-4 rounded-xs bg-cyan-500/40 border border-cyan-500/60" />
              <div className="w-6 h-4 rounded-xs bg-cyan-500/40 border border-cyan-500/60" />
              <div className="w-6 h-4 rounded-xs bg-cyan-500/40 border border-cyan-500/60" />
              <div className="w-6 h-4 rounded-xs bg-cyan-500/40 border border-cyan-500/60" />
              <div className="w-6 h-4 rounded-xs bg-cyan-500/40 border border-cyan-500/60" />
              <span className="text-[11px] text-zinc-400 ml-2 font-mono">6× Landscape Stack</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-500 text-zinc-950 font-bold text-sm group-hover:bg-cyan-400 transition-colors">
              <span>Start Horizontal</span>
              <span>→</span>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Stall Actions & System Info */}
      <div className="max-w-5xl mx-auto w-full pt-8 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-left transition-colors"
          >
            <div className="p-2 rounded bg-zinc-800 text-zinc-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">Print History</div>
              <div className="text-xs text-zinc-500">{historyCount} previous print jobs</div>
            </div>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-left transition-colors"
          >
            <div className="p-2 rounded bg-zinc-800 text-zinc-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">Settings</div>
              <div className="text-xs text-zinc-500">Printers & storage</div>
            </div>
          </button>

          <button
            onClick={onToggleFastMode}
            className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
              fastMode
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className={`p-2 rounded ${fastMode ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-300'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">Fast Stall Mode</div>
              <div className="text-xs text-zinc-500">{fastMode ? 'ACTIVE (Fast queue)' : 'Standard mode'}</div>
            </div>
          </button>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <div className="p-2 rounded bg-zinc-800/80 text-zinc-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-200">A4 • 4 Strips</div>
              <div className="text-xs text-zinc-500">2 × 2 sheet layout (210×297mm)</div>
            </div>
          </div>
        </div>

        {/* Commercial Stall Specs Footer Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Orientation Strict Detection
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Fixed Frame Dimensions (No Stretch)
            </span>
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-emerald-500" />
              Integrated Cutting Guides
            </span>
          </div>
          <div className="font-mono text-[11px] text-zinc-600 mt-2 sm:mt-0">
            PHOTOBOOTH STUDIO STALL EDITION · 100% ACTUAL SIZE PRINTING
          </div>
        </div>
      </div>
    </div>
  );
};
