import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, UserPlus, Printer, Home, Sparkles } from 'lucide-react';

interface PrintCompleteModalProps {
  copies: number;
  templateNames: string[];
  thumbnailUrl: string;
  onNewCustomer: () => void;
  onReprint: () => void;
  onGoHome: () => void;
}

export const PrintCompleteModal: React.FC<PrintCompleteModalProps> = ({
  copies,
  templateNames,
  thumbnailUrl,
  onNewCustomer,
  onReprint,
  onGoHome,
}) => {
  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ffffff'],
      });
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-zinc-100 flex flex-col items-center text-center p-6 md:p-8">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-1">
          PRINT COMPLETE
        </h3>
        <p className="text-xs text-zinc-400 mb-6">
          {copies} sheet{copies > 1 ? 's' : ''} sent to printer • 4 photobooth strips ready for cutting
        </p>

        {/* Thumbnail Preview */}
        {thumbnailUrl && (
          <div className="w-36 h-48 bg-zinc-950 rounded-lg p-1.5 border border-zinc-800 shadow-inner mb-6 overflow-hidden flex items-center justify-center">
            <img
              src={thumbnailUrl}
              alt="Print Job"
              className="w-full h-full object-contain rounded"
            />
          </div>
        )}

        <div className="text-xs text-zinc-400 mb-6 font-mono">
          <span>Designs: </span>
          <span className="text-zinc-200 font-semibold">{templateNames.join(', ')}</span>
        </div>

        {/* 3 Primary Action Buttons */}
        <div className="w-full space-y-3">
          {/* NEW CUSTOMER BUTTON */}
          <button
            onClick={onNewCustomer}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>NEW CUSTOMER (NEXT PROJECT)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* REPRINT BUTTON */}
            <button
              onClick={onReprint}
              className="py-2.5 px-3 rounded-lg text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>REPRINT</span>
            </button>

            {/* HOME BUTTON */}
            <button
              onClick={onGoHome}
              className="py-2.5 px-3 rounded-lg text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4 text-zinc-400" />
              <span>HOME</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
