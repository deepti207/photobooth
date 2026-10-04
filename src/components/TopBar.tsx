import React from 'react';
import { Camera, History, Settings, Zap, Maximize, Minimize, Home, UserPlus } from 'lucide-react';
import { Mode } from '../types/photobooth';

interface TopBarProps {
  currentMode: Mode | null;
  currentStep: 'home' | 'editor' | 'a4print' | 'history' | 'settings';
  fastMode: boolean;
  onToggleFastMode: () => void;
  onGoHome: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onNewCustomer: () => void;
  photoCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  currentStep,
  fastMode,
  onToggleFastMode,
  onGoHome,
  onOpenHistory,
  onOpenSettings,
  onNewCustomer,
  photoCount,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800 text-zinc-100 flex items-center justify-between px-4 select-none shrink-0 z-40">
      {/* Zone 1: Brand Title & App Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-zinc-950 font-black shadow-sm">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-zinc-50">PHOTOBOOTH STUDIO</span>
              <span className="text-[10px] text-zinc-500 font-mono">OFFLINE V2.4</span>
            </div>
          </div>
        </button>

        {currentMode && currentStep !== 'home' && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs text-zinc-400">
            <span className="font-medium text-zinc-200">
              {currentMode === 'vertical' ? '📱 Vertical Mode' : '🖼️ Horizontal Mode'}
            </span>
            <span className="text-zinc-600">·</span>
            <span>{photoCount} / 6 photos</span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation & Quick Shortcuts */}
      <div className="flex items-center gap-2">
        {currentStep !== 'home' && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded border border-zinc-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        )}

        {photoCount > 0 && currentStep !== 'home' && (
          <button
            onClick={onNewCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/50 rounded border border-rose-800/60 transition-colors"
            title="Reset slots and start fresh for next customer"
          >
            <UserPlus className="w-3.5 h-3.5 text-rose-400" />
            <span>New Customer</span>
          </button>
        )}

        {/* Fast Stall Mode Toggle */}
        <button
          onClick={onToggleFastMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-all ${
            fastMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-900'
          }`}
          title="Fast Stall Mode hides extra menus for lightning-fast queue printing"
        >
          <Zap className={`w-3.5 h-3.5 ${fastMode ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
          <span>Fast Stall Mode</span>
          {fastMode && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
        </button>
      </div>

      {/* Zone 3: Actions & System */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded border border-zinc-800 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Print History</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded border border-zinc-800 transition-colors"
          title="Stall Settings"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded border border-zinc-800 transition-colors hidden sm:flex"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
