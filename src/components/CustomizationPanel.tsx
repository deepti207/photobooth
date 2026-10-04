import React, { useRef, useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Sliders,
  Trash2,
  Upload,
  Camera,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Smile,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  BorderStyle,
  CustomTextConfig,
  DEFAULT_EMOJI_BORDER,
  DigicamDateFormat,
  DigicamPhotoEffect,
  DigicamSettings,
  DigicamTimeFormat,
  DigicamTimestampColor,
  DigicamTimestampPos,
  EmojiBorderSettings,
  EmojiDensity,
  EmojiPlacement,
  EmojiSize,
  LogoConfig,
  Template,
} from '../types/photobooth';

interface CustomizationPanelProps {
  customText: CustomTextConfig;
  onCustomTextChange: (updated: CustomTextConfig) => void;
  logo: LogoConfig;
  onLogoChange: (updated: LogoConfig) => void;
  currentTemplate: Template;
  onUpdateFrameBorder: (borderStyle: BorderStyle) => void;
  onUpdateDigicamSettings: (settings: DigicamSettings) => void;
  onUpdateEmojiBorder?: (settings: EmojiBorderSettings) => void;
}

const BORDER_STYLES: { id: BorderStyle; label: string }[] = [
  { id: 'none', label: 'No Border' },
  { id: 'thin', label: 'Thin Border' },
  { id: 'thick', label: 'Thick Border' },
  { id: 'double', label: 'Double Border' },
  { id: 'rounded', label: 'Rounded Border' },
  { id: 'film', label: 'Film Sprockets' },
  { id: 'polaroid', label: 'Polaroid Border' },
  { id: 'vintage', label: 'Vintage Border' },
  { id: 'floral', label: 'Floral Border' },
  { id: 'decorative', label: 'Decorative Border' },
  { id: 'pattern', label: 'Pattern Border' },
  { id: 'colored', label: 'Colored Border' },
  { id: 'handdrawn', label: 'Hand-Drawn' },
  { id: 'sticker', label: 'Sticker Frame' },
];

const EMOJI_PRESETS: { name: string; icon: string; emojis: string[] }[] = [
  { name: 'Sparkles', icon: '✨', emojis: ['✨', '⭐', '🌟', '💫'] },
  { name: 'Hearts', icon: '💖', emojis: ['💖', '💕', '💗', '🥰'] },
  { name: 'Floral', icon: '🌸', emojis: ['🌸', '🌺', '🌷', '🌼'] },
  { name: 'Party', icon: '🎉', emojis: ['🎉', '🥳', '🍾', '🎈'] },
  { name: 'Y2K Retro', icon: '🪩', emojis: ['🪩', '🍒', '⚡', '💿'] },
  { name: 'Desi Festive', icon: '🪔', emojis: ['💃', '🪔', '✨', '🦚'] },
  { name: 'Cute & Soft', icon: '🎀', emojis: ['🎀', '🍓', '🧸', '🍰'] },
  { name: 'Wedding', icon: '💍', emojis: ['💍', '💐', '🥂', '🕊️'] },
  { name: 'Vintage', icon: '🎞️', emojis: ['🎞️', '📷', '🎬', '📽️'] },
  { name: 'Luxury Gold', icon: '👑', emojis: ['👑', '💎', '✨', '⚜️'] },
];

const POPULAR_EMOJIS = [
  '✨', '💖', '⭐', '🌸', '🎉', '🪩', '🍒', '🪔',
  '🎀', '💍', '🍓', '🧸', '💃', '👑', '🥳', '🔥',
  '🦋', '🌹', '💫', '🥂', '🕊️', '🍀', '🌻', '⚡'
];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  customText,
  onCustomTextChange,
  logo,
  onLogoChange,
  currentTemplate,
  onUpdateFrameBorder,
  onUpdateDigicamSettings,
  onUpdateEmojiBorder,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const digicam = currentTemplate.digicamEffect;
  const emojiBorder: EmojiBorderSettings = currentTemplate.emojiBorder || DEFAULT_EMOJI_BORDER;

  const [customEmojiInput, setCustomEmojiInput] = useState('');

  const updateEmojiBorder = (partial: Partial<EmojiBorderSettings>) => {
    if (onUpdateEmojiBorder) {
      onUpdateEmojiBorder({
        ...emojiBorder,
        ...partial,
      });
    }
  };

  const handleAddCustomEmoji = () => {
    const trimmed = customEmojiInput.trim();
    if (!trimmed) return;
    const newEmojis = Array.from(trimmed);
    const updatedList = Array.from(new Set([...emojiBorder.emojiList, ...newEmojis]));
    updateEmojiBorder({ emojiList: updatedList });
    setCustomEmojiInput('');
  };

  const handleToggleIndividualEmoji = (emoji: string) => {
    const exists = emojiBorder.emojiList.includes(emoji);
    let updatedList: string[];
    if (exists) {
      if (emojiBorder.emojiList.length > 1) {
        updatedList = emojiBorder.emojiList.filter((e) => e !== emoji);
      } else {
        updatedList = emojiBorder.emojiList;
      }
    } else {
      updatedList = [...emojiBorder.emojiList, emoji];
    }
    updateEmojiBorder({ emojiList: updatedList });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        onLogoChange({
          ...logo,
          url: ev.target?.result as string,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    onLogoChange({
      ...logo,
      url: null,
      name: undefined,
    });
  };

  const updateDigicam = (partial: Partial<DigicamSettings>) => {
    const base: DigicamSettings = digicam || {
      enabled: true,
      style: 'classic',
      showTimestamp: true,
      dateFormat: 'DD/MM/YY',
      timeFormat: '24-hour',
      mode: 'automatic',
      customDate: '',
      customTime: '',
      timestampPosition: 'bottom_right',
      timestampColor: 'orange',
      timestampFont: 'lcd',
      showCameraInfo: true,
      cameraModelText: 'DIGITAL COMPACT CAMERA',
      photoEffect: 'digicam_classic',
    };
    onUpdateDigicamSettings({ ...base, ...partial });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-6">
      {/* 1. Authentic Digicam Settings (if Digicam template or active) */}
      {(digicam?.enabled || currentTemplate.category === 'DIGICAM') && (
        <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/50 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Authentic Digicam Engine
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">2000s Compact Camera Aesthetic</span>
          </div>

          {/* Timestamp ON/OFF & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-zinc-200">Date Timestamp</span>
              </div>
              <button
                onClick={() => updateDigicam({ showTimestamp: !digicam?.showTimestamp })}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  digicam?.showTimestamp !== false ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {digicam?.showTimestamp !== false ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-zinc-200">Date Source</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateDigicam({ mode: 'automatic' })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    digicam?.mode !== 'manual' ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Auto
                </button>
                <button
                  onClick={() => updateDigicam({ mode: 'manual' })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    digicam?.mode === 'manual' ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>
          </div>

          {/* Manual Date / Time Fields if Manual */}
          {digicam?.mode === 'manual' && (
            <div className="grid grid-cols-2 gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Custom Date</label>
                <input
                  type="text"
                  value={digicam.customDate || '04/10/06'}
                  onChange={(e) => updateDigicam({ customDate: e.target.value })}
                  placeholder="04/10/06 or OCT 04 2006"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-amber-400 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Custom Time</label>
                <input
                  type="text"
                  value={digicam.customTime || '19:42'}
                  onChange={(e) => updateDigicam({ customTime: e.target.value })}
                  placeholder="19:42 or 07:42 PM"
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-amber-400 font-mono focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Format Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Date Format</label>
              <select
                value={digicam?.dateFormat || 'DD/MM/YY'}
                onChange={(e) => updateDigicam({ dateFormat: e.target.value as DigicamDateFormat })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none"
              >
                <option value="DD/MM/YY">DD/MM/YY (04/10/26)</option>
                <option value="MM/DD/YY">MM/DD/YY (10/04/26)</option>
                <option value="YY/MM/DD">YY/MM/DD (26/10/04)</option>
                <option value="DD.MM.YY">DD.MM.YY (04.10.26)</option>
                <option value="DD-MM-YY">DD-MM-YY (04-10-26)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (04/10/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (10/04/2026)</option>
                <option value="MONTH DD YYYY">MONTH DD YYYY (OCT 04 2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Time Format</label>
              <select
                value={digicam?.timeFormat || '24-hour'}
                onChange={(e) => updateDigicam({ timeFormat: e.target.value as DigicamTimeFormat })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none"
              >
                <option value="24-hour">24-Hour (19:42)</option>
                <option value="12-hour">12-Hour (07:42 PM)</option>
                <option value="hh:mm:ss">With Seconds (19:42:08)</option>
                <option value="none">Date Only (No Time)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Timestamp Color</label>
              <div className="flex items-center gap-1.5 pt-1">
                {(['orange', 'red', 'yellow', 'white', 'green', 'blue'] as const).map((col) => {
                  const hex =
                    col === 'orange' ? '#ff6a00' : col === 'red' ? '#ef4444' : col === 'yellow' ? '#facc15' : col === 'white' ? '#ffffff' : col === 'green' ? '#22c55e' : '#38bdf8';
                  const isSel = (digicam?.timestampColor || 'orange') === col;
                  return (
                    <button
                      key={col}
                      onClick={() => updateDigicam({ timestampColor: col })}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        isSel ? 'ring-2 ring-white scale-110' : 'border-zinc-700 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={col}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Position & Photo Effect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Timestamp Position</label>
              <select
                value={digicam?.timestampPosition || 'bottom_right'}
                onChange={(e) => updateDigicam({ timestampPosition: e.target.value as DigicamTimestampPos })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none"
              >
                <option value="bottom_right">Bottom Right of Photo</option>
                <option value="bottom_left">Bottom Left of Photo</option>
                <option value="top_right">Top Right of Photo</option>
                <option value="top_left">Top Left of Photo</option>
                <option value="strip_footer">Strip Bottom Footer</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Digicam Flash & Color Effect</label>
              <select
                value={digicam?.photoEffect || 'digicam_classic'}
                onChange={(e) => updateDigicam({ photoEffect: e.target.value as DigicamPhotoEffect })}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none"
              >
                <option value="original">Original (No Effect)</option>
                <option value="digicam_light">Digicam Light (CCD Warmth)</option>
                <option value="digicam_classic">Digicam Classic (Cool Sensor)</option>
                <option value="digicam_flash">Digicam Flash (Direct Flash)</option>
                <option value="digicam_night">Digicam Night (Dark Environment)</option>
                <option value="strong_digicam">Strong Digicam Look</option>
              </select>
            </div>
          </div>

          {/* Camera Info Toggle */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Camera HUD Info (REC, Battery, MP):</span>
            <button
              onClick={() => updateDigicam({ showCameraInfo: !digicam?.showCameraInfo })}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                digicam?.showCameraInfo ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {digicam?.showCameraInfo ? 'SHOWN' : 'HIDDEN'}
            </button>
          </div>
        </div>
      )}

      {/* 2. Custom Text Section */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            Strip Text & Typography
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono">Kept compact for photobooth style</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Event Name / Title</label>
            <input
              type="text"
              value={customText.eventName}
              onChange={(e) => onCustomTextChange({ ...customText, eventName: e.target.value })}
              placeholder="e.g. INNOVERSE 2026 / BEST DAY EVER"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Subtitle / Date</label>
            <input
              type="text"
              value={customText.subText}
              onChange={(e) => onCustomTextChange({ ...customText, subText: e.target.value })}
              placeholder="e.g. October 2026 • Stall #04"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Venue / Location</label>
            <input
              type="text"
              value={customText.venue}
              onChange={(e) => onCustomTextChange({ ...customText, venue: e.target.value })}
              placeholder="e.g. Grand Plaza / Beachfront"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Hashtag / Instagram</label>
            <input
              type="text"
              value={customText.hashtag}
              onChange={(e) => onCustomTextChange({ ...customText, hashtag: e.target.value })}
              placeholder="e.g. #PhotoboothMemories @ourbooth"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-zinc-400 mb-1 font-medium">Custom Message (Footer)</label>
            <input
              type="text"
              value={customText.customMessage}
              onChange={(e) => onCustomTextChange({ ...customText, customMessage: e.target.value })}
              placeholder="e.g. Thanks for celebrating with us!"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Text Placement Options */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="text-zinc-400 font-medium">Text Placement:</span>
          {(['top', 'bottom', 'both'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => onCustomTextChange({ ...customText, placement: pos })}
              className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                customText.placement === pos
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Border Styles Section */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Border Styles
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono">Applied to all 6 frames</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {BORDER_STYLES.map((b) => (
            <button
              key={b.id}
              onClick={() => onUpdateFrameBorder(b.id)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium text-center truncate border transition-colors ${
                currentTemplate.frame.borderStyle === b.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Emoji Border System Section */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-pink-500/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                Emoji Border System
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono font-normal">
                  Decorative Layer
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                Cute repeating emoji garlands framing the border area without obscuring photos
              </p>
            </div>
          </div>

          {/* Prominent ON / OFF Button */}
          <button
            onClick={() => updateEmojiBorder({ enabled: !emojiBorder.enabled })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              emojiBorder.enabled
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/30 ring-2 ring-pink-400/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                emojiBorder.enabled ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-600'
              }`}
            />
            <span>{emojiBorder.enabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* When enabled, show full customization controls */}
        {emojiBorder.enabled && (
          <div className="space-y-4 pt-1">
            {/* Active Emoji Garland Preview & Chips */}
            <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Active Border Emojis ({emojiBorder.emojiList.length}):
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Repeats along border</span>
              </div>

              {/* Emoji garland sequence preview */}
              <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-md flex items-center gap-2 overflow-x-auto text-lg select-none">
                {Array.from({ length: 14 }).map((_, idx) => (
                  <span key={idx} className="shrink-0 hover:scale-125 transition-transform cursor-default">
                    {emojiBorder.emojiList[idx % emojiBorder.emojiList.length] || '✨'}
                  </span>
                ))}
                <span className="text-zinc-600 text-xs font-mono ml-1">...</span>
              </div>

              {/* Active Emoji Chips with Remove Button */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {emojiBorder.emojiList.map((emoji, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs font-medium text-zinc-200"
                  >
                    <span className="text-sm">{emoji}</span>
                    {emojiBorder.emojiList.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = emojiBorder.emojiList.filter((_, i) => i !== idx);
                          updateEmojiBorder({ emojiList: updated });
                        }}
                        className="text-zinc-500 hover:text-rose-400 transition-colors ml-0.5"
                        title={`Remove ${emoji}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add Custom Emoji Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customEmojiInput}
                  onChange={(e) => setCustomEmojiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomEmoji();
                    }
                  }}
                  placeholder="Type or paste any emoji (e.g. 🐱 ☕ 🍀)"
                  className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handleAddCustomEmoji}
                  disabled={!customEmojiInput.trim()}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-400 text-zinc-950 font-bold text-xs rounded transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Curated Theme Preset Packs (1-Click) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                1-Click Theme Packs:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                {EMOJI_PRESETS.map((pack) => {
                  const isActive =
                    pack.emojis.length === emojiBorder.emojiList.length &&
                    pack.emojis.every((e, i) => e === emojiBorder.emojiList[i]);
                  return (
                    <button
                      key={pack.name}
                      onClick={() => updateEmojiBorder({ emojiList: pack.emojis })}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-pink-500/20 border-pink-400 text-pink-200 font-bold shadow-xs'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span className="text-sm shrink-0">{pack.icon}</span>
                      <span className="text-[11px] truncate">{pack.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick-Tap Emoji Palette */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Quick-Tap Individual Emojis (Click to Toggle):
              </span>
              <div className="flex flex-wrap gap-1 p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg">
                {POPULAR_EMOJIS.map((emoji) => {
                  const isSelected = emojiBorder.emojiList.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleToggleIndividualEmoji(emoji)}
                      className={`w-7 h-7 rounded text-sm flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink-500 text-white scale-110 shadow-xs'
                          : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                      title={isSelected ? `Click to remove ${emoji}` : `Click to add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Placement, Size, and Density Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Placement */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 block">
                  Placement Area
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'all_borders', label: 'All Borders (Full)' },
                    { id: 'sides_only', label: 'Sides Only (Left/Right)' },
                    { id: 'top_bottom', label: 'Top & Bottom' },
                    { id: 'corners_gaps', label: 'Gaps & Corners' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updateEmojiBorder({ placement: p.id as EmojiPlacement })}
                      className={`px-2 py-1.5 rounded text-[11px] text-left font-medium border transition-colors ${
                        emojiBorder.placement === p.id
                          ? 'bg-pink-500/20 text-pink-200 border-pink-500/70 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 block">
                  Emoji Size
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'small', label: 'Small (10px)', desc: 'Subtle accent' },
                    { id: 'medium', label: 'Medium (14px)', desc: 'Balanced' },
                    { id: 'large', label: 'Large (18px)', desc: 'Bold & vibrant' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateEmojiBorder({ size: s.id as EmojiSize })}
                      className={`px-2 py-1.5 rounded text-[11px] text-left border transition-colors ${
                        emojiBorder.size === s.id
                          ? 'bg-pink-500/20 text-pink-200 border-pink-500/70 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-medium">{s.label}</div>
                      <div className="text-[9px] text-zinc-500">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 block">
                  Density & Spacing
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'sparse', label: 'Sparse', desc: 'Airy, spread out' },
                    { id: 'medium', label: 'Medium', desc: 'Standard cadence' },
                    { id: 'dense', label: 'Dense', desc: 'Continuous garland' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => updateEmojiBorder({ density: d.id as EmojiDensity })}
                      className={`px-2 py-1.5 rounded text-[11px] text-left border transition-colors ${
                        emojiBorder.density === d.id
                          ? 'bg-pink-500/20 text-pink-200 border-pink-500/70 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-medium">{d.label}</div>
                      <div className="text-[9px] text-zinc-500">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Safe Border Guarantee Banner */}
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300/90 flex items-center gap-2">
              <span className="text-base shrink-0">🛡️</span>
              <span>
                <strong>Photo Protection Active:</strong> Emojis render strictly inside the border area and gaps. They will never overlap, clip, or obscure faces or photo content.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Logo Upload & Positioning */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            Event Logo / Stall Watermark
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono">PNG / JPG / Transparent PNG</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />

          {logo.url ? (
            <div className="flex items-center gap-3 bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <img src={logo.url} alt="Logo" className="w-10 h-10 object-contain rounded bg-zinc-900 p-1" />
              <div className="space-y-1">
                <div className="font-semibold text-zinc-200 truncate max-w-[140px]">
                  {logo.name || 'Uploaded Logo'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="text-amber-400 hover:text-amber-300 text-[11px]"
                  >
                    Change
                  </button>
                  <span className="text-zinc-600">·</span>
                  <button
                    onClick={handleRemoveLogo}
                    className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Sponsor / Stall Logo</span>
            </button>
          )}

          {logo.url && (
            <div className="flex items-center gap-4 flex-1 min-w-[240px]">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Position</label>
                <div className="flex items-center gap-1">
                  {(['top', 'bottom'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => onLogoChange({ ...logo, placement: p })}
                      className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                        logo.placement === p
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Scale</span>
                  <span className="font-mono">{logo.scale.toFixed(1)}×</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={logo.scale}
                  onChange={(e) => onLogoChange({ ...logo, scale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded appearance-none accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono">{Math.round(logo.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={logo.opacity}
                  onChange={(e) => onLogoChange({ ...logo, opacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded appearance-none accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
