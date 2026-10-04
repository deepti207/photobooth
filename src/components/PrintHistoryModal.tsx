import React from 'react';
import { X, Printer, Trash2, Calendar, Clock, Layers, ExternalLink, RefreshCw } from 'lucide-react';
import { PrintHistoryItem } from '../types/photobooth';

interface PrintHistoryModalProps {
  history: PrintHistoryItem[];
  onClose: () => void;
  onReprintItem: (item: PrintHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const PrintHistoryModal: React.FC<PrintHistoryModalProps> = ({
  history,
  onClose,
  onReprintItem,
  onDeleteItem,
  onClearAll,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400" />
              PRINT HISTORY
            </h3>
            <p className="text-xs text-zinc-400">
              {history.length} print jobs saved in local offline storage
            </p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-zinc-800 rounded transition-colors"
              >
                Clear History
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <Printer className="w-12 h-12 stroke-[1.5] mb-3 text-zinc-600" />
              <h4 className="text-sm font-semibold text-zinc-400">No print jobs yet</h4>
              <p className="text-xs text-zinc-600 max-w-xs mt-1">
                Completed A4 sheet prints will automatically appear here for fast reprinting.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const date = new Date(item.timestamp);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    {/* Thumbnail & Meta */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {item.thumbnailUrl ? (
                        <div className="w-14 h-20 bg-zinc-900 rounded p-1 border border-zinc-800 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.thumbnailUrl}
                            alt="Print Job"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-20 bg-zinc-900 rounded border border-zinc-800 shrink-0 flex items-center justify-center text-zinc-600 font-mono text-[10px]">
                          A4
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            item.mode === 'vertical'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {item.mode.toUpperCase()} MODE
                          </span>
                          <span className="text-xs font-semibold text-zinc-200">
                            4 Strips • {item.copies} Cop{item.copies > 1 ? 'ies' : 'y'}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 truncate max-w-xs">
                          Templates: {item.templateNames.join(', ')}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeStr}
                          </span>
                          <span className="text-emerald-400 font-medium">✓ Printed</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: OPEN, REPRINT, DELETE */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <button
                        onClick={() => onReprintItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>REPRINT</span>
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
