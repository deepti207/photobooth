import React, { useState } from 'react';
import { X, Settings, Folder, Printer, Zap, Check, Scissors, HardDrive, RefreshCw } from 'lucide-react';
import { StallSettings } from '../types/photobooth';

interface SettingsModalProps {
  settings: StallSettings;
  onSaveSettings: (settings: StallSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [form, setForm] = useState<StallSettings>({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const handleTestPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">STALL SETTINGS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Stall Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Stall / Event Operator Name
            </label>
            <input
              type="text"
              value={form.stallName}
              onChange={(e) => setForm({ ...form, stallName: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-medium"
              placeholder="e.g. Photobooth Studio Express Stall #1"
            />
          </div>

          {/* Local Storage Folder Location */}
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Local File Storage Location</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Offline folders structure: Photos/, Strips/, Prints/ (YYYY-MM-DD/)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.storageFolderPath}
                onChange={(e) => setForm({ ...form, storageFolderPath: e.target.value })}
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, storageFolderPath: 'C:/PhotoBooth Studio/Prints/' })}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 rounded border border-zinc-700"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Fast Stall Mode & Cutting Guides Defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Fast Stall Mode
                </div>
                <div className="text-[10px] text-zinc-500">Streamlined 3-click workflow</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, fastMode: !form.fastMode })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  form.fastMode ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    form.fastMode ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  Cutting Guides
                </div>
                <div className="text-[10px] text-zinc-500">Dotted lines between strips</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, cuttingGuides: !form.cuttingGuides })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  form.cuttingGuides ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    form.cuttingGuides ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Print Resolution & Copies */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Print Resolution</label>
              <select
                value={form.printDpi}
                onChange={(e) => setForm({ ...form, printDpi: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none"
              >
                <option value={300}>300 DPI (Commercial Print Ready)</option>
                <option value={200}>200 DPI (Fast Thermal / Draft)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Default Print Copies</label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.defaultCopies}
                onChange={(e) => setForm({ ...form, defaultCopies: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Printer Calibration Test */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Windows Printer Diagnostics:</span>
            <button
              type="button"
              onClick={handleTestPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Printer Test Page</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : null}
              <span>{savedNotice ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
