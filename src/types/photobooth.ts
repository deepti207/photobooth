export type Mode = 'vertical' | 'horizontal';

export interface CropSettings {
  zoom: number; // 1 to 3
  panX: number; // -100 to 100 (%)
  panY: number; // -100 to 100 (%)
  rotation: number; // 0, 90, 180, 270
  fitMode?: 'cover' | 'contain';
}

export interface PhotoSlot {
  id: string;
  slotIndex: number; // 0 to 5 (PHOTO 1 to PHOTO 6)
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'vertical' | 'horizontal';
  crop: CropSettings;
}

export interface TemplateGeometry {
  stripWidthPx: number;
  stripHeightPx: number;
  photoWidthPx: number;
  photoHeightPx: number;
  photoAspectRatio: number; // width / height
  gapBetweenPhotosPx: number;
  borderThicknessPx: number;
  headerAreaHeightPx: number;
  footerAreaHeightPx: number;
  safeMarginPx: number;
}

export type BorderStyle =
  | 'none'
  | 'thin'
  | 'thick'
  | 'double'
  | 'rounded'
  | 'film'
  | 'polaroid'
  | 'vintage'
  | 'floral'
  | 'decorative'
  | 'pattern'
  | 'colored'
  | 'handdrawn'
  | 'sticker';

export interface CustomTextConfig {
  eventName: string;
  subText: string;
  venue: string;
  hashtag: string;
  customMessage: string;
  placement: 'top' | 'bottom' | 'both';
  fontFamily: string;
  textColor?: string;
}

export interface LogoConfig {
  url: string | null;
  name?: string;
  placement: 'top' | 'bottom';
  scale: number; // 0.5 to 1.5
  opacity: number; // 0.1 to 1.0
}

export type DecorationType =
  | 'none'
  | 'hearts'
  | 'film_sprockets'
  | 'floral'
  | 'vintage_vignette'
  | 'confetti'
  | 'stars'
  | 'indian_mandala'
  | 'polaroid_tags'
  | 'stickers'
  | 'retro_lines'
  // Indian & Festive Decorations
  | 'garba_dandiya'
  | 'garba_modern'
  | 'garba_night'
  | 'garba_mirror'
  | 'dandiya_colorful'
  | 'diwali_diyas'
  | 'holi_colors'
  | 'ganesh_toran'
  | 'janmashtami_peacock'
  | 'dussehra_marigold'
  | 'pongal_harvest'
  | 'eid_crescent'
  | 'christmas_indian'
  | 'rajasthani_jharokha'
  | 'gujarati_bandhani'
  | 'punjabi_phulkari'
  | 'bengali_alpana'
  | 'maharashtrian_paithani'
  | 'south_indian_kasavu'
  | 'kashmiri_paisley'
  | 'indian_wedding_royal'
  // Digicam Decorations
  | 'digicam_classic'
  | 'digicam_flash'
  | 'digicam_datestamp'
  | 'digicam_night'
  | 'digicam_party'
  | 'digicam_2000s'
  | 'digicam_vacation';

export type DigicamDateFormat =
  | 'DD/MM/YY'
  | 'MM/DD/YY'
  | 'YY/MM/DD'
  | 'DD.MM.YY'
  | 'DD-MM-YY'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'MONTH DD YYYY';

export type DigicamTimeFormat = '12-hour' | '24-hour' | 'hh:mm' | 'hh:mm:ss' | 'none';

export type DigicamTimestampPos =
  | 'bottom_right'
  | 'bottom_left'
  | 'top_right'
  | 'top_left'
  | 'inside_corner'
  | 'strip_footer';

export type DigicamTimestampColor = 'orange' | 'red' | 'yellow' | 'white' | 'green' | 'blue';

export type DigicamPhotoEffect =
  | 'original'
  | 'digicam_light'
  | 'digicam_classic'
  | 'digicam_flash'
  | 'digicam_night'
  | 'strong_digicam';

export interface DigicamSettings {
  enabled: boolean;
  style: 'classic' | 'flash' | 'datestamp' | 'night' | 'party' | '2000s' | 'vacation';
  showTimestamp: boolean;
  dateFormat: DigicamDateFormat;
  timeFormat: DigicamTimeFormat;
  mode: 'automatic' | 'manual';
  customDate: string;
  customTime: string;
  timestampPosition: DigicamTimestampPos;
  timestampColor: DigicamTimestampColor;
  timestampFont: 'lcd' | 'pixel' | 'blocky' | 'compact';
  showCameraInfo: boolean;
  cameraModelText: string;
  photoEffect: DigicamPhotoEffect;
}

export type ColorTheme =
  | 'original'
  | 'red'
  | 'blue'
  | 'pink'
  | 'purple'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'black'
  | 'white'
  | 'cream'
  | 'brown'
  | 'gold'
  | 'silver'
  | 'pastel'
  | 'rainbow'
  | 'custom';

export interface CustomColors {
  background: string;
  border: string;
  accent: string;
  text: string;
  decoration: string;
}

export type EmojiPlacement =
  | 'all_borders'
  | 'sides_only'
  | 'top_bottom'
  | 'corners_gaps';

export type EmojiSize = 'small' | 'medium' | 'large';

export type EmojiDensity = 'sparse' | 'medium' | 'dense';

export interface EmojiBorderSettings {
  enabled: boolean;
  emojiList: string[];
  placement: EmojiPlacement;
  size: EmojiSize;
  density: EmojiDensity;
  customEmojiInput?: string;
}

export const DEFAULT_EMOJI_BORDER: EmojiBorderSettings = {
  enabled: false,
  emojiList: ['💖', '✨', '🌸', '⭐'],
  placement: 'all_borders',
  size: 'medium',
  density: 'medium',
};

export interface Template {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  orientation: Mode;
  description: string;
  background: {
    color: string;
    gradient?: string;
    gradientColors?: [string, string];
    texture?: string;
  };
  frame: {
    borderStyle: BorderStyle;
    borderColor: string;
    borderWidth: number; // in mm or px
    borderRadius: number;
    shadow?: string;
    innerPadding: number;
    matColor?: string;
  };
  headerStyle: {
    fontFamily: string;
    color: string;
    accentColor?: string;
    align: 'left' | 'center' | 'right';
  };
  footerStyle: {
    fontFamily: string;
    color: string;
    accentColor?: string;
  };
  decorations?: {
    type: DecorationType;
    primaryColor?: string;
    accentColor?: string;
    secondaryColor?: string;
  };
  frameRatio?: number; // width / height, e.g. 1.0 (1:1 square) or 0.8 (4:5) or 1.5 (3:2) or 1.333 (4:3)
  frameRatioLabel?: '1:1' | '4:5' | '3:2' | '4:3';
  digicamEffect?: DigicamSettings;
  colorTheme?: ColorTheme;
  customColors?: CustomColors;
  emojiBorder?: EmojiBorderSettings;
}

export type A4DesignMode = 'same_design' | 'different_designs';
export type A4PhotoMode = 'same_photos' | 'different_photos';

export interface StripConfiguration {
  templateId: string;
  customText: CustomTextConfig;
  logo: LogoConfig;
}

export interface PrintHistoryItem {
  id: string;
  timestamp: number;
  mode: Mode;
  templateNames: string[];
  thumbnailUrl: string;
  photoCount: number;
  copies: number;
  a4DesignMode: A4DesignMode;
  a4PhotoMode: A4PhotoMode;
}

export interface StallSettings {
  fastMode: boolean;
  cuttingGuides: boolean;
  defaultCopies: number;
  printDpi: number;
  stallName: string;
  storageFolderPath: string;
  borderlessPrint: boolean;
  favoriteTemplateIds: string[];
  recentTemplateIds: string[];
}
