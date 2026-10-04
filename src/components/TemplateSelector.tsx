import React, { useState, useMemo } from 'react';
import {
  ColorTheme,
  CustomColors,
  Mode,
  Template,
} from '../types/photobooth';
import { HORIZONTAL_TEMPLATES, VERTICAL_TEMPLATES } from '../data/templates';
import {
  Sparkles,
  Check,
  Search,
  Dices,
  Heart,
  Palette,
  Clock,
} from 'lucide-react';
import { addRecentTemplateId, toggleFavoriteTemplateId } from '../utils/storage';

interface TemplateSelectorProps {
  mode: Mode;
  selectedTemplate: Template;
  onSelectTemplate: (template: Template) => void;
  favoriteTemplateIds: string[];
  recentTemplateIds: string[];
  onUpdateFavorites: (updated: string[]) => void;
  onUpdateColorTheme: (theme: ColorTheme, custom?: CustomColors) => void;
}

// All requested categories in intuitive operational order
const ALL_CATEGORIES = [
  'ALL',
  'FAVORITES',
  'RECENT',
  'EMOJI BORDER',
  'DIGICAM',
  'DANDIYA',
  'GARBA',
  'NAVRATRI',
  'INDIAN',
  'DIWALI',
  'HOLI',
  'GANESH CHATURTHI',
  'JANMASHTAMI',
  'DUSSEHRA',
  'INDIAN HERITAGE',
  'RAJASTHANI',
  'GUJARATI',
  'PUNJABI',
  'MAHARASHTRIAN',
  'SOUTH INDIAN',
  'CLASSIC',
  'POLAROID',
  'VINTAGE',
  'RETRO',
  'FILM',
  'CAMERA',
  'ANALOG',
  'MINIMAL',
  'LUXURY',
  'PARTY',
  'WEDDING',
  'COUPLE',
  'CUTE',
  'Y2K',
  'CINEMATIC',
  'BOLLYWOOD',
  'FLORAL',
  'TRAVEL',
  'SUMMER',
  'BEACH',
  'CHRISTMAS',
  'NEW YEAR',
  'FRIENDS',
  'SCHOOL',
  'COLLEGE',
  'SPORTS',
  'FESTIVAL',
  'NEON',
  'STICKER',
  'SCRAPBOOK',
  'NEWSPAPER',
  '90s',
  '2000s',
  '2010s',
  'CUSTOM',
];

const COLOR_OPTIONS: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: 'original', label: 'Original', swatch: 'bg-zinc-700' },
  { id: 'red', label: 'Red', swatch: 'bg-red-600' },
  { id: 'blue', label: 'Blue', swatch: 'bg-sky-500' },
  { id: 'pink', label: 'Pink', swatch: 'bg-pink-500' },
  { id: 'purple', label: 'Purple', swatch: 'bg-purple-600' },
  { id: 'green', label: 'Green', swatch: 'bg-emerald-600' },
  { id: 'yellow', label: 'Yellow', swatch: 'bg-amber-400' },
  { id: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
  { id: 'black', label: 'Black', swatch: 'bg-zinc-950' },
  { id: 'white', label: 'White', swatch: 'bg-white' },
  { id: 'cream', label: 'Cream', swatch: 'bg-amber-100' },
  { id: 'brown', label: 'Brown', swatch: 'bg-amber-900' },
  { id: 'gold', label: 'Gold', swatch: 'bg-yellow-600' },
  { id: 'silver', label: 'Silver', swatch: 'bg-slate-400' },
  { id: 'pastel', label: 'Pastel', swatch: 'bg-fuchsia-300' },
  { id: 'rainbow', label: 'Rainbow', swatch: 'bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400' },
  { id: 'custom', label: 'Custom', swatch: 'bg-gradient-to-br from-indigo-500 to-pink-500' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  mode,
  selectedTemplate,
  onSelectTemplate,
  favoriteTemplateIds,
  recentTemplateIds,
  onUpdateFavorites,
  onUpdateColorTheme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCustomColorPicker, setShowCustomColorPicker] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState<CustomColors>({
    background: '#18181b',
    border: '#d4af37',
    accent: '#facc15',
    text: '#ffffff',
    decoration: '#f59e0b',
  });

  const templates: Template[] = mode === 'vertical' ? VERTICAL_TEMPLATES : HORIZONTAL_TEMPLATES;

  // Search & Filter
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesCat = t.category.toLowerCase().includes(query);
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(query));
        const matchesDesc = t.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesTags && !matchesDesc) {
          return false;
        }
      }

      // 2. Favorites category
      if (selectedCategory === 'FAVORITES') {
        return favoriteTemplateIds.includes(t.id);
      }

      // 3. Recent category
      if (selectedCategory === 'RECENT') {
        return recentTemplateIds.includes(t.id);
      }

      // 4. Emoji Border category
      if (selectedCategory === 'EMOJI BORDER') {
        return t.emojiBorder?.enabled || t.tags?.includes('CUTE') || t.tags?.includes('PARTY') || t.tags?.includes('Y2K');
      }

      // 5. All
      if (selectedCategory === 'ALL') return true;

      // 5. Category / Tags
      if (t.category.toUpperCase() === selectedCategory.toUpperCase()) return true;
      if (t.tags && t.tags.some((tag) => tag.toUpperCase() === selectedCategory.toUpperCase())) return true;

      // Indian special groupings
      if (selectedCategory === 'INDIAN') {
        return (
          t.category.includes('INDIAN') ||
          t.category.includes('GARBA') ||
          t.category.includes('DANDIYA') ||
          t.category.includes('NAVRATRI') ||
          t.category.includes('DIWALI') ||
          t.category.includes('HOLI') ||
          t.category.includes('GANESH') ||
          t.category.includes('JANMASHTAMI') ||
          t.category.includes('DUSSEHRA') ||
          t.category.includes('BOLLYWOOD') ||
          t.category.includes('RAJASTHANI') ||
          t.category.includes('GUJARATI') ||
          t.category.includes('PUNJABI') ||
          t.category.includes('MAHARASHTRIAN') ||
          t.category.includes('SOUTH INDIAN') ||
          (t.tags && t.tags.some((tag) => tag.includes('INDIAN')))
        );
      }

      return false;
    });
  }, [templates, selectedCategory, searchQuery, favoriteTemplateIds, recentTemplateIds]);

  // Surprise Me / Random Compatible Template
  const handleSurpriseMe = () => {
    const list = filteredTemplates.length > 0 ? filteredTemplates : templates;
    const random = list[Math.floor(Math.random() * list.length)];
    if (random) {
      handleSelect(random);
    }
  };

  const handleSelect = (tmpl: Template) => {
    addRecentTemplateId(tmpl.id);
    onSelectTemplate(tmpl);
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = toggleFavoriteTemplateId(id);
    onUpdateFavorites(updated);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Search & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search templates (e.g. "garba", "digicam", "vintage", "diwali")...'
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Surprise Me & Favorites count */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSurpriseMe}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Choose a random compatible template"
          >
            <Dices className="w-4 h-4" />
            <span>Surprise Me</span>
          </button>
        </div>
      </div>

      {/* Quick Color Switcher Bar */}
      <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>COLOR:</span>
          <span className="text-[11px] font-mono text-zinc-400 capitalize">
            {selectedTemplate.colorTheme || 'Original'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {COLOR_OPTIONS.map((c) => {
            const isActive = (selectedTemplate.colorTheme || 'original') === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (c.id === 'custom') {
                    setShowCustomColorPicker(true);
                    onUpdateColorTheme('custom', customColors);
                  } else {
                    setShowCustomColorPicker(false);
                    onUpdateColorTheme(c.id);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                }`}
                title={`Switch to ${c.label} color theme`}
              >
                <span className={`w-2.5 h-2.5 rounded-full border border-white/20 ${c.swatch}`} />
                <span className="text-[11px]">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Settings Drawer */}
      {showCustomColorPicker && (
        <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Background Color</label>
            <input
              type="color"
              value={customColors.background}
              onChange={(e) => {
                const updated = { ...customColors, background: e.target.value };
                setCustomColors(updated);
                onUpdateColorTheme('custom', updated);
              }}
              className="w-full h-8 bg-zinc-900 rounded border border-zinc-700 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Frame Border Color</label>
            <input
              type="color"
              value={customColors.border}
              onChange={(e) => {
                const updated = { ...customColors, border: e.target.value };
                setCustomColors(updated);
                onUpdateColorTheme('custom', updated);
              }}
              className="w-full h-8 bg-zinc-900 rounded border border-zinc-700 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Accent / Motifs</label>
            <input
              type="color"
              value={customColors.accent}
              onChange={(e) => {
                const updated = { ...customColors, accent: e.target.value };
                setCustomColors(updated);
                onUpdateColorTheme('custom', updated);
              }}
              className="w-full h-8 bg-zinc-900 rounded border border-zinc-700 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">Typography Text</label>
            <input
              type="color"
              value={customColors.text}
              onChange={(e) => {
                const updated = { ...customColors, text: e.target.value };
                setCustomColors(updated);
                onUpdateColorTheme('custom', updated);
              }}
              className="w-full h-8 bg-zinc-900 rounded border border-zinc-700 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        {ALL_CATEGORIES.map((cat) => {
          let count = 0;
          if (cat === 'ALL') count = templates.length;
          else if (cat === 'FAVORITES') count = favoriteTemplateIds.length;
          else if (cat === 'RECENT') count = recentTemplateIds.length;
          else {
            count = templates.filter((t) => {
              if (t.category.toUpperCase() === cat.toUpperCase()) return true;
              if (t.tags && t.tags.some((tag) => tag.toUpperCase() === cat.toUpperCase())) return true;
              if (cat === 'INDIAN') {
                return (
                  t.category.includes('INDIAN') ||
                  t.category.includes('GARBA') ||
                  t.category.includes('DANDIYA') ||
                  t.category.includes('NAVRATRI') ||
                  t.category.includes('DIWALI') ||
                  t.category.includes('HOLI') ||
                  t.category.includes('GANESH')
                );
              }
              return false;
            }).length;
          }

          if (count === 0 && cat !== 'ALL') return null;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                  : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700/60'
              }`}
            >
              {cat === 'FAVORITES' && <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />}
              {cat === 'RECENT' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 max-h-[460px] overflow-y-auto pr-1 pb-4">
        {filteredTemplates.map((tmpl) => {
          const isSelected = tmpl.id === selectedTemplate.id;
          const isFav = favoriteTemplateIds.includes(tmpl.id);

          const bgStyle: React.CSSProperties = tmpl.background.gradientColors
            ? {
                backgroundImage: `linear-gradient(180deg, ${tmpl.background.gradientColors[0]} 0%, ${tmpl.background.gradientColors[1]} 100%)`,
              }
            : {
                backgroundColor: tmpl.background.color,
              };

          return (
            <button
              key={tmpl.id}
              onClick={() => handleSelect(tmpl)}
              className={`relative flex flex-col p-2.5 rounded-xl text-left transition-all border group cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800 border-amber-500 shadow-xl ring-2 ring-amber-500/80'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              {/* Miniature Photobooth Strip Preview - Faithful Representation */}
              <div
                className="w-full h-36 rounded-lg mb-2 p-2 flex flex-col justify-between overflow-hidden shadow-inner border border-zinc-700/60 relative"
                style={bgStyle}
              >
                {/* Film sprockets if film template */}
                {tmpl.decorations?.type === 'film_sprockets' && (
                  <div className="absolute inset-y-0 left-0.5 right-0.5 flex justify-between pointer-events-none opacity-60">
                    <div className="flex flex-col justify-between py-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-2 rounded-xs bg-white" />
                      ))}
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-2 rounded-xs bg-white" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Strip Mini Header */}
                <div className="text-center shrink-0 z-10">
                  <div
                    className="text-[8px] font-bold tracking-wider truncate font-mono"
                    style={{ color: tmpl.headerStyle.color }}
                  >
                    {tmpl.digicamEffect?.enabled
                      ? '• REC [FINE]'
                      : tmpl.decorations?.type === 'garba_dandiya'
                      ? '🥢 DANDIYA 🥢'
                      : tmpl.decorations?.type === 'diwali_diyas'
                      ? '🪔 DIWALI 🪔'
                      : tmpl.name.toUpperCase()}
                  </div>
                </div>

                {/* EXACT 6 MINI PHOTO FRAMES */}
                <div className="flex-1 flex flex-col gap-0.5 justify-center py-0.5 px-1 z-10">
                  {Array.from({ length: 6 }).map((_, fIdx) => (
                    <div
                      key={fIdx}
                      className={`flex items-center justify-between px-1 text-[6px] text-zinc-400 overflow-hidden ${
                        mode === 'vertical' ? 'mx-auto w-[65%]' : 'w-full'
                      }`}
                      style={{
                        height: '11px',
                        backgroundColor: '#18181b',
                        border: `${tmpl.frame.borderWidth > 1 ? 1 : 0.5}px solid ${tmpl.frame.borderColor}`,
                        borderRadius: `${tmpl.frame.borderRadius > 3 ? 2 : 0}px`,
                        boxShadow: tmpl.frame.matColor ? '0 0 0 1px #ffffff' : undefined,
                      }}
                    >
                      <span className="opacity-40 font-mono">0{fIdx + 1}</span>
                      {tmpl.digicamEffect?.enabled && (
                        <span className="text-[#ff6a00] font-mono text-[5px] font-bold">'06</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Strip Mini Footer */}
                <div className="text-center shrink-0 z-10">
                  <div
                    className="text-[7px] truncate font-mono opacity-80"
                    style={{ color: tmpl.footerStyle.color }}
                  >
                    {tmpl.digicamEffect?.enabled ? '12.1 MP • ISO 400' : 'PHOTOBOOTH'}
                  </div>
                </div>

                {/* Favorite Heart Button */}
                <div
                  onClick={(e) => handleToggleFavorite(e, tmpl.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/80 text-zinc-400 hover:text-rose-500 transition-colors z-20"
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </div>
              </div>

              {/* Template Meta */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-xs text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                  {tmpl.name}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="text-[10px] text-zinc-400 line-clamp-1">{tmpl.description}</div>

              <div className="mt-2 pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                <span className="truncate max-w-[85px]">{tmpl.category}</span>
                {tmpl.emojiBorder?.enabled ? (
                  <span className="text-pink-400 font-bold flex items-center gap-0.5">
                    <span>✨</span>
                    <span>Emoji</span>
                  </span>
                ) : (
                  <span className="capitalize text-zinc-400">{tmpl.frame.borderStyle}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
