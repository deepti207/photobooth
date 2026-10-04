import jsPDF from 'jspdf';
import {
  ColorTheme,
  CustomColors,
  CustomTextConfig,
  DigicamDateFormat,
  DigicamSettings,
  DigicamTimeFormat,
  DigicamTimestampColor,
  DigicamTimestampPos,
  EmojiBorderSettings,
  LogoConfig,
  PhotoSlot,
  Template,
  TemplateGeometry,
} from '../types/photobooth';

// A4 at 300 DPI
export const A4_WIDTH_PX = 2480;
export const A4_HEIGHT_PX = 3508;

// Physical dimensions in mm
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// Strip dimensions inside each quadrant (at 300 DPI)
// Each quadrant is 1240 x 1754 px
export const STRIP_WIDTH_PX = 620; // fallback standard px
export const STRIP_HEIGHT_PX = 1620; // ~137.2 mm

/**
 * Computes native photobooth strip dimensions adhering to:
 * - Photo width occupies 88-92% of the usable strip width
 * - Minimal side margin (4-5% on each side)
 * - Vertical Mode: 1:1 square (or 4:5 portrait)
 * - Horizontal Mode: 3:2 landscape (or 4:3 landscape)
 * - Exactly 6 photos stacked vertically in a single continuous strip
 */
export function getStripDimensions(template: Template): { width: number; height: number } {
  const isVertical = template.orientation === 'vertical';
  const defaultRatio = isVertical ? 1.0 : 1.5;
  const frameRatio = template.frameRatio || defaultRatio;

  const stripHeight = 1620;
  const topH = (template.category.includes('INDIAN') || template.category.includes('GARBA') || template.category.includes('DIGICAM')) ? 80 : 65;
  const bottomH = 65;
  const gap = 12;
  const availableH = stripHeight - topH - bottomH - 5 * gap;
  const photoH = Math.floor(availableH / 6); // ~238px
  const photoW = Math.round(photoH * frameRatio); // 238px (1:1 square) or 357px (3:2 landscape)

  // Photo occupies ~91% of strip width (4.5% side margins on left & right)
  const stripWidth = Math.round(photoW / 0.91); // ~262px (vertical) or ~392px (horizontal)

  return { width: stripWidth, height: stripHeight };
}

// Geometry for Vertical Mode: Square (1:1) / Near-Square (4:5) frames with minimal 4.5% side borders
export const VERTICAL_TEMPLATE_GEOMETRY: TemplateGeometry = {
  stripWidthPx: 262,
  stripHeightPx: 1620,
  photoWidthPx: 238,
  photoHeightPx: 238,
  photoAspectRatio: 1.0, // 1:1 Square
  gapBetweenPhotosPx: 12,
  borderThicknessPx: 2,
  headerAreaHeightPx: 80,
  footerAreaHeightPx: 65,
  safeMarginPx: 12, // Minimal 4.5% side margin
};

// Geometry for Horizontal Mode: Landscape (3:2 / 4:3) frames with minimal 4.5% side borders
export const HORIZONTAL_TEMPLATE_GEOMETRY: TemplateGeometry = {
  stripWidthPx: 392,
  stripHeightPx: 1620,
  photoWidthPx: 357,
  photoHeightPx: 238,
  photoAspectRatio: 1.5, // 3:2 Landscape
  gapBetweenPhotosPx: 12,
  borderThicknessPx: 2,
  headerAreaHeightPx: 80,
  footerAreaHeightPx: 65,
  safeMarginPx: 17.5, // Minimal 4.5% side margin
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Color Theme Palette Definition
const THEME_PALETTES: Record<ColorTheme, { bg: string; grad?: [string, string]; border: string; accent: string; text: string }> = {
  original: { bg: '#ffffff', border: '#e2e8f0', accent: '#f59e0b', text: '#0f172a' },
  red: { bg: '#450a0a', grad: ['#680f0f', '#310606'], border: '#ef4444', accent: '#f87171', text: '#fef2f2' },
  blue: { bg: '#082f49', grad: ['#0c4a6e', '#031c2d'], border: '#0284c7', accent: '#38bdf8', text: '#f0f9ff' },
  pink: { bg: '#500724', grad: ['#700c36', '#3b051b'], border: '#ec4899', accent: '#f472b6', text: '#fdf2f8' },
  purple: { bg: '#3b0764', grad: ['#581c87', '#2e1065'], border: '#a855f7', accent: '#c084fc', text: '#faf5ff' },
  green: { bg: '#052e16', grad: ['#064e22', '#021f0e'], border: '#10b981', accent: '#34d399', text: '#f0fdf4' },
  yellow: { bg: '#422006', grad: ['#5f2f09', '#2d1604'], border: '#eab308', accent: '#facc15', text: '#fefce8' },
  orange: { bg: '#431407', grad: ['#651f0c', '#2c0c04'], border: '#f97316', accent: '#fb923c', text: '#fff7ed' },
  black: { bg: '#09090b', grad: ['#18181b', '#000000'], border: '#27272a', accent: '#a1a1aa', text: '#f4f4f5' },
  white: { bg: '#ffffff', border: '#e4e4e7', accent: '#71717a', text: '#18181b' },
  cream: { bg: '#fefce8', grad: ['#fef9c3', '#fef08a'], border: '#ca8a04', accent: '#eab308', text: '#451a03' },
  brown: { bg: '#271711', grad: ['#382017', '#1b0f0b'], border: '#78350f', accent: '#b45309', text: '#fef3c7' },
  gold: { bg: '#1c1608', grad: ['#2e240c', '#151005'], border: '#d4af37', accent: '#facc15', text: '#fef9c3' },
  silver: { bg: '#0f172a', grad: ['#1e293b', '#0a0f1d'], border: '#94a3b8', accent: '#cbd5e1', text: '#f8fafc' },
  pastel: { bg: '#fdf4ff', grad: ['#fae8ff', '#f5d0fe'], border: '#d946ef', accent: '#f472b6', text: '#3b0764' },
  rainbow: { bg: '#18181b', grad: ['#4a044e', '#082f49'], border: '#f43f5e', accent: '#38bdf8', text: '#ffffff' },
  custom: { bg: '#ffffff', border: '#000000', accent: '#f59e0b', text: '#000000' },
};

/**
 * Formats date and time string based on Digicam settings
 */
export function formatDigicamTimestamp(settings?: DigicamSettings): { dateStr: string; timeStr: string } {
  const now = new Date();

  if (settings?.mode === 'manual' && (settings.customDate || settings.customTime)) {
    return {
      dateStr: settings.customDate || '04/10/26',
      timeStr: settings.customTime || '19:42',
    };
  }

  const d = now.getDate();
  const m = now.getMonth() + 1;
  const yFull = now.getFullYear();
  const yShort = String(yFull).slice(-2);

  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const mName = monthNames[now.getMonth()];

  let dateStr = `${dd}/${mm}/${yShort}`;
  const dFormat: DigicamDateFormat = settings?.dateFormat || 'DD/MM/YY';

  switch (dFormat) {
    case 'DD/MM/YY': dateStr = `${dd}/${mm}/${yShort}`; break;
    case 'MM/DD/YY': dateStr = `${mm}/${dd}/${yShort}`; break;
    case 'YY/MM/DD': dateStr = `${yShort}/${mm}/${dd}`; break;
    case 'DD.MM.YY': dateStr = `${dd}.${mm}.${yShort}`; break;
    case 'DD-MM-YY': dateStr = `${dd}-${mm}-${yShort}`; break;
    case 'DD/MM/YYYY': dateStr = `${dd}/${mm}/${yFull}`; break;
    case 'MM/DD/YYYY': dateStr = `${mm}/${dd}/${yFull}`; break;
    case 'MONTH DD YYYY': dateStr = `${mName} ${dd} ${yFull}`; break;
  }

  const hours24 = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 || 12;
  const hh12 = String(hours12).padStart(2, '0');
  const hh24 = String(hours24).padStart(2, '0');

  let timeStr = `${hh24}:${mins}`;
  const tFormat: DigicamTimeFormat = settings?.timeFormat || '24-hour';

  switch (tFormat) {
    case '12-hour': timeStr = `${hh12}:${mins} ${isPM ? 'PM' : 'AM'}`; break;
    case '24-hour': timeStr = `${hh24}:${mins}`; break;
    case 'hh:mm': timeStr = `${hh24}:${mins}`; break;
    case 'hh:mm:ss': timeStr = `${hh24}:${mins}:${secs}`; break;
    case 'none': timeStr = ''; break;
  }

  return { dateStr, timeStr };
}

/**
 * Returns RGB hex color for timestamp
 */
function getTimestampColorHex(color?: DigicamTimestampColor): string {
  switch (color) {
    case 'orange': return '#ff6a00';
    case 'red': return '#ef4444';
    case 'yellow': return '#facc15';
    case 'white': return '#ffffff';
    case 'green': return '#22c55e';
    case 'blue': return '#38bdf8';
    default: return '#ff6a00';
  }
}

/**
 * Draws an individual image into a fixed rectangle using cover cropping or contain fit.
 * Guarantees NO stretching and identical frame dimensions across all 6 slots.
 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: PhotoSlot['crop'],
  destX: number,
  destY: number,
  destW: number,
  destH: number,
  borderRadius: number,
  digicamEffect?: DigicamSettings
) {
  ctx.save();

  // Create rounded clipping path for the frame
  ctx.beginPath();
  if (borderRadius > 0) {
    ctx.roundRect(destX, destY, destW, destH, borderRadius);
  } else {
    ctx.rect(destX, destY, destW, destH);
  }
  ctx.clip();

  // Source aspect ratio
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const srcRatio = srcW / srcH;
  const destRatio = destW / destH;

  const isContain = crop.fitMode === 'contain';

  let renderW: number;
  let renderH: number;

  if (isContain) {
    // Fit mode: contain whole image inside frame without cropping
    if (srcRatio > destRatio) {
      renderW = destW;
      renderH = destW / srcRatio;
    } else {
      renderH = destH;
      renderW = destH * srcRatio;
    }
  } else {
    // Fill mode: high-quality cover cropping
    if (srcRatio > destRatio) {
      renderH = destH;
      renderW = destH * srcRatio;
    } else {
      renderW = destW;
      renderH = destW / srcRatio;
    }
  }

  // Apply user manual zoom
  const zoom = Math.max(1, crop.zoom || 1);
  renderW *= zoom;
  renderH *= zoom;

  // Center alignment + manual pan
  const maxPanX = Math.max(0, (renderW - destW) / 2);
  const maxPanY = Math.max(0, (renderH - destH) / 2);

  const panOffsetPxX = ((crop.panX || 0) / 100) * (maxPanX || renderW * 0.25);
  const panOffsetPxY = ((crop.panY || 0) / 100) * (maxPanY || renderH * 0.25);

  const drawX = destX + (destW - renderW) / 2 + panOffsetPxX;
  const drawY = destY + (destH - renderH) / 2 + panOffsetPxY;

  ctx.drawImage(img, drawX, drawY, renderW, renderH);

  // Subtle Digicam Photo Post-Processing Effect (authentic compact camera feel)
  if (digicamEffect?.enabled) {
    const effect = digicamEffect.photoEffect || 'digicam_classic';

    if (effect === 'digicam_flash' || effect === 'strong_digicam') {
      // Direct flash look: center highlight burst + subtle falloff at edges
      const flashGrad = ctx.createRadialGradient(
        destX + destW * 0.5,
        destY + destH * 0.45,
        destW * 0.08,
        destX + destW * 0.5,
        destY + destH * 0.45,
        destW * 0.75
      );
      flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      flashGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(destX, destY, destW, destH);
    } else if (effect === 'digicam_night') {
      // Direct flash with dark environment
      const nightGrad = ctx.createRadialGradient(
        destX + destW * 0.5,
        destY + destH * 0.45,
        destW * 0.1,
        destX + destW * 0.5,
        destY + destH * 0.45,
        destW * 0.85
      );
      nightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      nightGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
      nightGrad.addColorStop(1, 'rgba(5, 10, 20, 0.28)');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(destX, destY, destW, destH);
    } else if (effect === 'digicam_classic') {
      // Cool digital sensor tint
      ctx.fillStyle = 'rgba(220, 240, 255, 0.04)';
      ctx.fillRect(destX, destY, destW, destH);
    } else if (effect === 'digicam_light') {
      // Subtle vintage CCD sensor warmth
      ctx.fillStyle = 'rgba(255, 245, 230, 0.03)';
      ctx.fillRect(destX, destY, destW, destH);
    }
  }

  ctx.restore();
}

/**
 * Draws tasteful decorations around the strip (header, footer, gutters)
 */
function drawDecorations(
  ctx: CanvasRenderingContext2D,
  template: Template,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  fixedFrameW: number,
  fixedFrameH: number,
  sideMargin: number,
  topHeaderH: number,
  bottomFooterH: number,
  photoGap: number,
  activeColors: { bg: string; border: string; accent: string; text: string }
) {
  const dec = template.decorations;
  if (!dec || dec.type === 'none') return;

  const pColor = activeColors.accent || dec.primaryColor || '#d4af37';
  const aColor = dec.accentColor || '#f43f5e';
  const sColor = dec.secondaryColor || '#10b981';

  ctx.save();

  switch (dec.type) {
    case 'hearts': {
      ctx.font = `${Math.round(20 * scale)}px sans-serif`;
      ctx.fillStyle = pColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♥', sideMargin * 0.5, 28 * scale);
      ctx.fillText('♥', canvasWidth - sideMargin * 0.5, 28 * scale);
      ctx.fillText('♥', sideMargin * 0.5, canvasHeight - 24 * scale);
      ctx.fillText('♥', canvasWidth - sideMargin * 0.5, canvasHeight - 24 * scale);
      break;
    }

    case 'floral': {
      ctx.font = `${Math.round(18 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🌿', sideMargin * 0.5, 28 * scale);
      ctx.fillText('🌸', canvasWidth - sideMargin * 0.5, 28 * scale);
      ctx.fillText('🌸', sideMargin * 0.5, canvasHeight - 28 * scale);
      ctx.fillText('🌿', canvasWidth - sideMargin * 0.5, canvasHeight - 28 * scale);
      break;
    }

    case 'confetti': {
      const colors = [pColor, aColor, sColor];
      for (let c = 0; c < 16; c++) {
        const cx = (c * 73) % canvasWidth;
        const cy = c < 8 ? (c * 17) % topHeaderH : canvasHeight - bottomFooterH + ((c * 19) % bottomFooterH);
        ctx.fillStyle = colors[c % colors.length];
        ctx.fillRect(cx, cy, 5 * scale, 8 * scale);
      }
      break;
    }

    case 'stars': {
      ctx.font = `${Math.round(16 * scale)}px sans-serif`;
      ctx.fillStyle = pColor;
      ctx.textAlign = 'center';
      ctx.fillText('✦', sideMargin * 0.5, 24 * scale);
      ctx.fillText('✦', canvasWidth - sideMargin * 0.5, 24 * scale);
      ctx.fillText('✦', sideMargin * 0.5, canvasHeight - 20 * scale);
      ctx.fillText('✦', canvasWidth - sideMargin * 0.5, canvasHeight - 20 * scale);
      break;
    }

    case 'retro_lines': {
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(sideMargin, topHeaderH - 8 * scale);
      ctx.lineTo(canvasWidth - sideMargin, topHeaderH - 8 * scale);
      ctx.stroke();

      ctx.strokeStyle = aColor;
      ctx.beginPath();
      ctx.moveTo(sideMargin, topHeaderH - 4 * scale);
      ctx.lineTo(canvasWidth - sideMargin, topHeaderH - 4 * scale);
      ctx.stroke();
      break;
    }

    case 'vintage_vignette': {
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1.5 * scale;
      const corner = 20 * scale;

      // Corners
      ctx.beginPath();
      ctx.moveTo(10 * scale, 10 * scale + corner);
      ctx.lineTo(10 * scale, 10 * scale);
      ctx.lineTo(10 * scale + corner, 10 * scale);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvasWidth - 10 * scale - corner, 10 * scale);
      ctx.lineTo(canvasWidth - 10 * scale, 10 * scale);
      ctx.lineTo(canvasWidth - 10 * scale, 10 * scale + corner);
      ctx.stroke();
      break;
    }

    // 💃 DANDIYA & GARBA COLLECTION
    case 'garba_dandiya': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(17 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🥢 🪔 🥢', canvasWidth / 2, topHeaderH - 14 * scale);

      ctx.fillStyle = aColor;
      ctx.beginPath();
      ctx.arc(sideMargin * 0.5, 24 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.arc(canvasWidth - sideMargin * 0.5, 24 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pColor;
      for (let g = 0; g < 5; g++) {
        const gy = topHeaderH + (g + 1) * fixedFrameH + (g + 0.5) * photoGap;
        ctx.fillText('✦', sideMargin * 0.5, gy);
        ctx.fillText('✦', canvasWidth - sideMargin * 0.5, gy);
      }
      break;
    }

    case 'garba_modern': {
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1.5 * scale;
      const step = 14 * scale;
      ctx.beginPath();
      for (let x = sideMargin; x < canvasWidth - sideMargin; x += step) {
        ctx.lineTo(x + step * 0.5, topHeaderH - 12 * scale);
        ctx.lineTo(x + step, topHeaderH - 6 * scale);
      }
      ctx.stroke();

      ctx.fillStyle = aColor;
      ctx.font = `${Math.round(14 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('GARBA NIGHTS', canvasWidth / 2, topHeaderH - 22 * scale);
      break;
    }

    case 'garba_night': {
      ctx.fillStyle = '#fde047';
      ctx.font = `${Math.round(15 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✨ 🪔 ✨', canvasWidth / 2, topHeaderH - 14 * scale);
      ctx.fillText('🪔 DANDIYA RAAS 🪔', canvasWidth / 2, canvasHeight - bottomFooterH + 6 * scale);
      break;
    }

    case 'garba_mirror': {
      // Mirror-work circular embroidery and concentric rings
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 1.5 * scale;
      for (let m = 0; m < 6; m++) {
        const my = topHeaderH + m * (fixedFrameH + photoGap) + fixedFrameH * 0.5;
        // Left mirror
        ctx.beginPath();
        ctx.arc(sideMargin * 0.5, my, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right mirror
        ctx.beginPath();
        ctx.arc(canvasWidth - sideMargin * 0.5, my, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = pColor;
      ctx.font = `bold ${Math.round(14 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🪞 GARBA MIRROR WORK 🪞', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'dandiya_colorful': {
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('🥢 DANDIYA UTSAV 🥢', canvasWidth / 2, topHeaderH - 14 * scale);
      ctx.fillStyle = '#ec4899';
      ctx.fillText('🎉 RAAS GARBA FESTIVAL 🎉', canvasWidth / 2, canvasHeight - bottomFooterH + 6 * scale);
      break;
    }

    // 🪔 DIWALI
    case 'diwali_diyas': {
      ctx.fillStyle = '#f59e0b';
      ctx.font = `${Math.round(18 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🪔  HAPPY DIWALI  🪔', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // HOLI
    case 'holi_colors': {
      const holiColors = ['#f43f5e', '#06b6d4', '#facc15', '#a855f7', '#10b981'];
      for (let s = 0; s < 18; s++) {
        ctx.fillStyle = holiColors[s % holiColors.length];
        const hx = s % 2 === 0 ? (s * 11) % sideMargin : canvasWidth - (s * 11) % sideMargin;
        const hy = (canvasHeight * (s + 1)) / 20;
        ctx.beginPath();
        ctx.arc(hx, hy, (3 + (s % 3)) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ec4899';
      ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY HOLI', canvasWidth / 2, topHeaderH - 12 * scale);
      break;
    }

    // GANESH CHATURTHI
    case 'ganesh_toran': {
      ctx.fillStyle = '#ea580c';
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🌺 SHREE GANESHAY NAMAH 🌺', canvasWidth / 2, topHeaderH - 14 * scale);
      ctx.fillStyle = pColor;
      ctx.fillText('✦ ॐ ✦', canvasWidth / 2, canvasHeight - bottomFooterH + 6 * scale);
      break;
    }

    // JANMASHTAMI
    case 'janmashtami_peacock': {
      ctx.fillStyle = '#0284c7';
      ctx.font = `${Math.round(17 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🦚 SHREE KRISHNA 🦚', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // DUSSEHRA
    case 'dussehra_marigold': {
      ctx.fillStyle = '#d97706';
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🏹 VIJAYADASHAMI 🏹', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // PONGAL
    case 'pongal_harvest': {
      ctx.fillStyle = '#ca8a04';
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🌾 HAPPY PONGAL / SANKRANTI 🌾', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // EID
    case 'eid_crescent': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(17 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🌙  EID MUBARAK  ✦', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // CHRISTMAS INDIAN
    case 'christmas_indian': {
      ctx.fillStyle = '#dc2626';
      ctx.font = `${Math.round(17 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🎄 JOYOUS CHRISTMAS 🔔', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // REGIONAL
    case 'rajasthani_jharokha': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('⚜️ PADHARO MHARE DES ⚜️', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'gujarati_bandhani': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✦ JAY SHREE KRISHNA ✦', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'punjabi_phulkari': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🥁  RANG LA PUNJAB  🥁', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'bengali_alpana': {
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🐚 SHUBHO BIJOYA 🐚', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'maharashtrian_paithani': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🦚  JAI MAHARASHTRA  🦚', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'south_indian_kasavu': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🪔  SOUTH INDIAN TRADITION  🪔', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'kashmiri_paisley': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🍁 KASHMIR CHINAR 🍁', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    case 'indian_wedding_royal': {
      ctx.fillStyle = pColor;
      ctx.font = `${Math.round(16 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💍 SHUBH VIVAH 💍', canvasWidth / 2, topHeaderH - 14 * scale);
      break;
    }

    // 📷 ADVANCED DIGICAM DECORATIONS
    case 'digicam_classic':
    case 'digicam_flash':
    case 'digicam_datestamp':
    case 'digicam_night':
    case 'digicam_party':
    case 'digicam_2000s':
    case 'digicam_vacation': {
      const dEffect = template.digicamEffect;
      if (dEffect?.showCameraInfo) {
        // Authentic camera info in header
        ctx.fillStyle = activeColors.accent || '#64748b';
        ctx.font = `bold ${Math.round(10 * scale)}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('• REC [FINE]', sideMargin, 24 * scale);
        ctx.textAlign = 'right';
        ctx.fillText('🔋 12.1 MP', canvasWidth - sideMargin, 24 * scale);

        // Technical details in footer
        ctx.textAlign = 'center';
        ctx.font = `${Math.round(10 * scale)}px monospace`;
        ctx.fillStyle = '#64748b';
        const camModel = dEffect.cameraModelText || 'DIGITAL COMPACT CAMERA';
        ctx.fillText(`${camModel} • ISO 400 • F3.2`, canvasWidth / 2, canvasHeight - bottomFooterH + 10 * scale);
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Renders the Emoji Border decorative layer strictly inside the border area.
 * Emojis frame the strip along:
 * - Outer side borders (left and right margins)
 * - Top header margin & bottom footer margin
 * - Horizontal separator gaps between the 6 photo frames
 * Uses an inverted clipping mask to guarantee emojis NEVER obscure or overlap the photos.
 */
export function drawEmojiBorder(
  ctx: CanvasRenderingContext2D,
  emojiBorder: EmojiBorderSettings,
  targetWidth: number,
  targetHeight: number,
  scale: number,
  fixedFrameW: number,
  fixedFrameH: number,
  frameX: number,
  topHeaderH: number,
  bottomFooterH: number,
  photoGap: number
) {
  if (!emojiBorder.enabled || !emojiBorder.emojiList || emojiBorder.emojiList.length === 0) {
    return;
  }

  const { emojiList, placement, size, density } = emojiBorder;

  // Font size scaling
  let fontSizePx: number;
  switch (size) {
    case 'small':
      fontSizePx = Math.max(9, Math.round(10 * scale));
      break;
    case 'large':
      fontSizePx = Math.max(15, Math.round(18 * scale));
      break;
    case 'medium':
    default:
      fontSizePx = Math.max(12, Math.round(14 * scale));
      break;
  }

  // Spacing step based on density
  let stepPx: number;
  switch (density) {
    case 'sparse':
      stepPx = Math.round(52 * scale);
      break;
    case 'dense':
      stepPx = Math.round(22 * scale);
      break;
    case 'medium':
    default:
      stepPx = Math.round(34 * scale);
      break;
  }

  ctx.save();

  // Create an inverted clip mask so emojis NEVER draw over any of the 6 photo frames
  try {
    const region = new Path2D();
    region.rect(0, 0, targetWidth, targetHeight);
    for (let i = 0; i < 6; i++) {
      const frameY = topHeaderH + i * (fixedFrameH + photoGap);
      region.rect(frameX, frameY, fixedFrameW, fixedFrameH);
    }
    ctx.clip(region, 'evenodd');
  } catch {
    // Fallback if Path2D is unsupported
  }

  ctx.font = `${fontSizePx}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let emojiIdx = 0;
  const nextEmoji = () => {
    const e = emojiList[emojiIdx % emojiList.length];
    emojiIdx++;
    return e;
  };

  const leftMarginCenter = Math.max(frameX / 2, 6 * scale);
  const rightMarginCenter = targetWidth - Math.max((targetWidth - (frameX + fixedFrameW)) / 2, 6 * scale);

  // 1. SIDES ONLY or ALL BORDERS: Cascade down left and right borders
  if (placement === 'sides_only' || placement === 'all_borders') {
    const startY = 14 * scale;
    const endY = targetHeight - 14 * scale;
    for (let y = startY; y <= endY; y += stepPx) {
      ctx.fillText(nextEmoji(), leftMarginCenter, y);
      ctx.fillText(nextEmoji(), rightMarginCenter, y);
    }
  }

  // 2. TOP & BOTTOM or ALL BORDERS: Top header and bottom footer
  if (placement === 'top_bottom' || placement === 'all_borders') {
    const topY = Math.max(6 * scale, topHeaderH - 12 * scale);
    const bottomY = Math.min(targetHeight - 6 * scale, targetHeight - bottomFooterH + 12 * scale);
    const startX = frameX + 10 * scale;
    const endX = frameX + fixedFrameW - 10 * scale;

    for (let x = startX; x <= endX; x += stepPx) {
      ctx.fillText(nextEmoji(), x, topY);
      ctx.fillText(nextEmoji(), x, bottomY);
    }
  }

  // 3. CORNERS & GAPS or ALL BORDERS: Inter-photo gaps and frame corners
  if (placement === 'corners_gaps' || placement === 'all_borders') {
    for (let i = 0; i < 5; i++) {
      const frameY = topHeaderH + i * (fixedFrameH + photoGap);
      const gapCenterY = frameY + fixedFrameH + photoGap / 2;
      const gapStep = Math.max(stepPx * 0.9, 20 * scale);

      for (let gx = frameX + 12 * scale; gx <= frameX + fixedFrameW - 12 * scale; gx += gapStep) {
        ctx.fillText(nextEmoji(), gx, gapCenterY);
      }

      if (placement === 'corners_gaps') {
        ctx.fillText(nextEmoji(), leftMarginCenter, gapCenterY);
        ctx.fillText(nextEmoji(), rightMarginCenter, gapCenterY);
      }
    }

    if (placement === 'corners_gaps') {
      ctx.fillText(nextEmoji(), leftMarginCenter, 14 * scale);
      ctx.fillText(nextEmoji(), rightMarginCenter, 14 * scale);
      ctx.fillText(nextEmoji(), leftMarginCenter, targetHeight - 14 * scale);
      ctx.fillText(nextEmoji(), rightMarginCenter, targetHeight - 14 * scale);
    }
  }

  ctx.restore();
}

/**
 * Renders a single 6-photo photobooth strip to an HTMLCanvasElement
 */
export async function renderSingleStripCanvas(
  photos: PhotoSlot[],
  template: Template,
  customText: CustomTextConfig,
  logo: LogoConfig,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<HTMLCanvasElement> {
  const defaultDims = getStripDimensions(template);
  const targetWidth = canvasWidth || defaultDims.width;
  const targetHeight = canvasHeight || defaultDims.height;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const scale = targetHeight / 1620;

  // Resolve Active Color Theme
  let activeColors = {
    bg: template.background.color,
    border: template.frame.borderColor,
    accent: template.headerStyle.accentColor || '#f59e0b',
    text: template.headerStyle.color,
  };

  const themeKey = template.colorTheme || 'original';
  if (themeKey === 'custom' && template.customColors) {
    activeColors = {
      bg: template.customColors.background,
      border: template.customColors.border,
      accent: template.customColors.accent,
      text: template.customColors.text,
    };
  } else if (themeKey !== 'original' && THEME_PALETTES[themeKey]) {
    const pal = THEME_PALETTES[themeKey];
    activeColors = {
      bg: pal.bg,
      border: pal.border,
      accent: pal.accent,
      text: pal.text,
    };
  }

  // 1. Draw Strip Background
  const pal = THEME_PALETTES[themeKey];
  if (themeKey !== 'original' && pal?.grad) {
    const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
    grad.addColorStop(0, pal.grad[0]);
    grad.addColorStop(1, pal.grad[1]);
    ctx.fillStyle = grad;
  } else if (template.background.gradientColors) {
    const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
    grad.addColorStop(0, template.background.gradientColors[0]);
    grad.addColorStop(1, template.background.gradientColors[1]);
    ctx.fillStyle = grad;
  } else if (template.background.gradient) {
    const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
    grad.addColorStop(0, activeColors.bg);
    grad.addColorStop(1, '#090a0f');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = activeColors.bg;
  }
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. Film Sprockets or Edge Perforations
  if (template.decorations?.type === 'film_sprockets') {
    const sprocketW = 12 * scale;
    const sprocketH = 18 * scale;
    const sprocketSpacing = 36 * scale;
    const count = Math.floor(targetHeight / sprocketSpacing);
    ctx.fillStyle = template.decorations.primaryColor || '#d4d4d4';
    for (let s = 0; s < count; s++) {
      const sy = s * sprocketSpacing + 12 * scale;
      ctx.beginPath();
      ctx.roundRect(4 * scale, sy, sprocketW, sprocketH, 2 * scale);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(targetWidth - 4 * scale - sprocketW, sy, sprocketW, sprocketH, 2 * scale);
      ctx.fill();
    }
  }

  // 3. Strip Dimensions & Margins
  // Header and footer are kept compact so photos clearly dominate the strip
  const topHeaderH = (customText.placement === 'top' || customText.placement === 'both' || logo.url || template.category.includes('INDIAN') || template.category.includes('GARBA') || template.category.includes('DIGICAM'))
    ? 80 * scale
    : 60 * scale;

  const bottomFooterH = (customText.placement === 'bottom' || customText.placement === 'both')
    ? 75 * scale
    : 60 * scale;

  const isVertical = template.orientation === 'vertical';
  const photoGap = 12 * scale;
  const totalGaps = 5 * photoGap;
  const availablePhotoH = targetHeight - topHeaderH - bottomFooterH;

  // STRICT FIXED FRAME DIMENSIONS FOR ALL 6 PHOTOS:
  // 6 photo frames stacked vertically inside the strip:
  const maxAllowedFrameH = Math.floor((availablePhotoH - totalGaps) / 6);

  // Aspect ratio according to exact mode requirements:
  // VERTICAL MODE: Square / near-square portrait-style frames (default 1:1, or 4:5 if specified)
  // HORIZONTAL MODE: Landscape frames (default 3:2, or 4:3 if specified)
  const defaultRatio = isVertical ? 1.0 : 1.5;
  const frameRatio = template.frameRatio || defaultRatio;

  // Photo width occupies MOST of the strip width (88-92%), with minimal side borders (4-5% on each side)
  const minSideMargin = template.decorations?.type === 'film_sprockets' ? 20 * scale : Math.max(6 * scale, Math.round(targetWidth * 0.045));
  let fixedFrameW = Math.round(targetWidth - minSideMargin * 2);
  let fixedFrameH = Math.round(fixedFrameW / frameRatio);

  // If height would exceed the available vertical space, clamp to maxAllowedFrameH and maintain strict ratio
  if (fixedFrameH > maxAllowedFrameH) {
    fixedFrameH = maxAllowedFrameH;
    fixedFrameW = Math.round(fixedFrameH * frameRatio);
  }

  // Centered horizontally inside the strip with minimal side borders (photo dominates the strip!)
  const frameX = Math.round((targetWidth - fixedFrameW) / 2);

  // 4. Preload images
  const loadedPhotos: (HTMLImageElement | null)[] = await Promise.all(
    Array.from({ length: 6 }).map(async (_, idx) => {
      const p = photos[idx];
      if (p?.dataUrl) {
        try {
          return await loadImage(p.dataUrl);
        } catch {
          return null;
        }
      }
      return null;
    })
  );

  let loadedLogo: HTMLImageElement | null = null;
  if (logo.url) {
    try {
      loadedLogo = await loadImage(logo.url);
    } catch {
      loadedLogo = null;
    }
  }

  // 5. Draw Header Text & Logo
  let currentTop = 14 * scale;
  if (logo.url && loadedLogo && logo.placement === 'top') {
    ctx.save();
    ctx.globalAlpha = logo.opacity;
    const lScale = (logo.scale || 1) * scale;
    const lw = Math.min(140 * lScale, fixedFrameW);
    const lh = (lw / (loadedLogo.naturalWidth || 1)) * (loadedLogo.naturalHeight || 1);
    ctx.drawImage(loadedLogo, (targetWidth - lw) / 2, currentTop, lw, lh);
    currentTop += lh + 8 * scale;
    ctx.restore();
  }

  if (customText.placement === 'top' || customText.placement === 'both') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (customText.eventName) {
      ctx.fillStyle = customText.textColor || activeColors.text;
      ctx.font = `bold ${Math.round(16 * scale)}px ${template.headerStyle.fontFamily}`;
      ctx.fillText(customText.eventName.toUpperCase(), targetWidth / 2, currentTop);
      currentTop += 20 * scale;
    }

    if (customText.subText) {
      ctx.fillStyle = activeColors.accent || template.footerStyle.color;
      ctx.font = `${Math.round(11 * scale)}px ${template.headerStyle.fontFamily}`;
      ctx.fillText(customText.subText, targetWidth / 2, currentTop);
      currentTop += 16 * scale;
    }
  }

  // Formatted date & time for Digicam
  const { dateStr, timeStr } = formatDigicamTimestamp(template.digicamEffect);
  const tsColorHex = getTimestampColorHex(template.digicamEffect?.timestampColor);

  // 6. Draw 6 Fixed Photo Frames
  const startY = topHeaderH;

  for (let i = 0; i < 6; i++) {
    const frameY = startY + i * (fixedFrameH + photoGap);
    const photo = photos[i];
    const img = loadedPhotos[i];

    // Frame backdrop / mat
    ctx.save();
    if (template.frame.borderStyle === 'polaroid' || template.frame.matColor) {
      ctx.fillStyle = template.frame.matColor || '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6 * scale;
      ctx.fillRect(
        frameX - 6 * scale,
        frameY - 6 * scale,
        fixedFrameW + 12 * scale,
        fixedFrameH + (template.frame.borderStyle === 'polaroid' ? 22 * scale : 12 * scale)
      );
    } else {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, fixedFrameW, fixedFrameH, template.frame.borderRadius * scale);
      ctx.fill();
    }
    ctx.restore();

    // Draw Photo Content (Cover crop + Pan/Zoom + Digicam Effect)
    if (img && photo) {
      drawCoverImage(
        ctx,
        img,
        photo.crop,
        frameX,
        frameY,
        fixedFrameW,
        fixedFrameH,
        template.frame.borderRadius * scale,
        template.digicamEffect
      );
    } else {
      // Empty slot placeholder
      ctx.save();
      ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, fixedFrameW, fixedFrameH, template.frame.borderRadius * scale);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`SLOT ${i + 1}`, frameX + fixedFrameW / 2, frameY + fixedFrameH / 2);
      ctx.restore();
    }

    // Border styling
    ctx.save();
    ctx.lineWidth = Math.max(isVertical ? 2.5 * scale : 1.5 * scale, template.frame.borderWidth * scale);
    ctx.strokeStyle = activeColors.border;

    if (template.frame.borderStyle === 'double') {
      ctx.strokeRect(frameX, frameY, fixedFrameW, fixedFrameH);
      ctx.strokeRect(frameX + 3 * scale, frameY + 3 * scale, fixedFrameW - 6 * scale, fixedFrameH - 6 * scale);
    } else if (template.frame.borderStyle === 'thin' || template.frame.borderStyle === 'thick') {
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, fixedFrameW, fixedFrameH, template.frame.borderRadius * scale);
      ctx.stroke();
    } else if (template.frame.borderStyle === 'decorative' || template.frame.borderStyle === 'pattern') {
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, fixedFrameW, fixedFrameH, template.frame.borderRadius * scale);
      ctx.stroke();
      const tick = 10 * scale;
      ctx.beginPath();
      ctx.moveTo(frameX - 2, frameY + tick);
      ctx.lineTo(frameX - 2, frameY - 2);
      ctx.lineTo(frameX + tick, frameY - 2);
      ctx.stroke();
    }
    ctx.restore();

    // Side frame numbers (film style)
    if (template.decorations?.type === 'film_sprockets') {
      ctx.fillStyle = activeColors.accent || '#f59e0b';
      ctx.font = `${Math.round(10 * scale)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`0${i + 1}A`, 18 * scale, frameY + fixedFrameH / 2);
    }

    // Authentic Digicam Date Stamp inside photo frame or corner
    if (template.digicamEffect?.enabled && template.digicamEffect.showTimestamp !== false) {
      const pos: DigicamTimestampPos = template.digicamEffect.timestampPosition || 'bottom_right';
      const fullTs = timeStr ? `${dateStr} ${timeStr}` : dateStr;

      ctx.save();
      ctx.fillStyle = tsColorHex;
      ctx.font = `bold ${Math.round(9 * scale)}px monospace`;
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 3;

      if (pos === 'bottom_right' || pos === 'inside_corner') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`'${fullTs}`, frameX + fixedFrameW - 5 * scale, frameY + fixedFrameH - 5 * scale);
      } else if (pos === 'bottom_left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`'${fullTs}`, frameX + 5 * scale, frameY + fixedFrameH - 5 * scale);
      } else if (pos === 'top_right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`'${fullTs}`, frameX + fixedFrameW - 5 * scale, frameY + 5 * scale);
      } else if (pos === 'top_left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`'${fullTs}`, frameX + 5 * scale, frameY + 5 * scale);
      }
      ctx.restore();
    }
  }

  // 7. Footer Text & Logo
  let footerY = targetHeight - bottomFooterH + 12 * scale;

  if (logo.url && loadedLogo && logo.placement === 'bottom') {
    ctx.save();
    ctx.globalAlpha = logo.opacity;
    const lScale = (logo.scale || 1) * scale;
    const lw = Math.min(130 * lScale, fixedFrameW);
    const lh = (lw / (loadedLogo.naturalWidth || 1)) * (loadedLogo.naturalHeight || 1);
    ctx.drawImage(loadedLogo, (targetWidth - lw) / 2, footerY, lw, lh);
    footerY += lh + 6 * scale;
    ctx.restore();
  }

  if (customText.placement === 'bottom' || customText.placement === 'both') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (customText.customMessage) {
      ctx.fillStyle = activeColors.text;
      ctx.font = `italic ${Math.round(11 * scale)}px ${template.footerStyle.fontFamily}`;
      ctx.fillText(customText.customMessage, targetWidth / 2, footerY);
      footerY += 16 * scale;
    }

    if (customText.hashtag || customText.venue) {
      const footerLine = [customText.hashtag, customText.venue].filter(Boolean).join(' • ');
      ctx.fillStyle = activeColors.accent || template.footerStyle.color;
      ctx.font = `${Math.round(10 * scale)}px ${template.footerStyle.fontFamily}`;
      ctx.fillText(footerLine, targetWidth / 2, footerY);
      footerY += 14 * scale;
    }
  }

  // Strip footer timestamp if configured for footer
  if (template.digicamEffect?.enabled && template.digicamEffect.timestampPosition === 'strip_footer') {
    const fullTs = timeStr ? `${dateStr}  ${timeStr}` : dateStr;
    ctx.save();
    ctx.fillStyle = tsColorHex;
    ctx.font = `bold ${Math.round(11 * scale)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 2;
    ctx.fillText(`'${fullTs}`, targetWidth / 2, targetHeight - 10 * scale);
    ctx.restore();
  }

  // 8. Draw Decorations
  drawDecorations(
    ctx,
    template,
    targetWidth,
    targetHeight,
    scale,
    fixedFrameW,
    fixedFrameH,
    frameX,
    topHeaderH,
    bottomFooterH,
    photoGap,
    activeColors
  );

  // 9. Draw Emoji Border System (decorative layer inside the border area without obscuring photos)
  if (template.emojiBorder?.enabled) {
    drawEmojiBorder(
      ctx,
      template.emojiBorder,
      targetWidth,
      targetHeight,
      scale,
      fixedFrameW,
      fixedFrameH,
      frameX,
      topHeaderH,
      bottomFooterH,
      photoGap
    );
  }

  return canvas;
}

/**
 * Renders the FULL A4 sheet (210 x 297 mm at 300 DPI: 2480 x 3508 px)
 * Exactly 4 strips arranged in a clean 2 x 2 layout.
 */
export async function renderA4Canvas(
  strips: {
    photos: PhotoSlot[];
    template: Template;
    customText: CustomTextConfig;
    logo: LogoConfig;
  }[],
  cuttingGuides: boolean = true
): Promise<HTMLCanvasElement> {
  const a4Canvas = document.createElement('canvas');
  a4Canvas.width = A4_WIDTH_PX;
  a4Canvas.height = A4_HEIGHT_PX;
  const ctx = a4Canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get A4 canvas context');

  // Pure white paper base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);

  // Quadrants: 2 columns x 2 rows
  const halfW = A4_WIDTH_PX / 2; // 1240 px
  const halfH = A4_HEIGHT_PX / 2; // 1754 px

  // Render each of the 4 strips at native 300 DPI strip size
  for (let idx = 0; idx < 4; idx++) {
    const stripData = strips[idx] || strips[0];
    const dims = getStripDimensions(stripData.template);
    const stripCanvas = await renderSingleStripCanvas(
      stripData.photos,
      stripData.template,
      stripData.customText,
      stripData.logo,
      dims.width,
      dims.height
    );

    const col = idx % 2; // 0 (left) or 1 (right)
    const row = Math.floor(idx / 2); // 0 (top) or 1 (bottom)

    // Center the strip inside its quadrant with balanced physical margins
    const quadX = col * halfW;
    const quadY = row * halfH;

    const posX = quadX + (halfW - dims.width) / 2;
    const posY = quadY + (halfH - dims.height) / 2;

    // Draw strip
    ctx.drawImage(stripCanvas, posX, posY, dims.width, dims.height);

    // Subtle physical strip cutting tick marks (corner marks for guillotine)
    if (cuttingGuides) {
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      const tick = 24;

      // Top-left corner tick
      ctx.beginPath();
      ctx.moveTo(posX - tick, posY);
      ctx.lineTo(posX, posY);
      ctx.lineTo(posX, posY - tick);
      ctx.stroke();

      // Top-right corner tick
      ctx.beginPath();
      ctx.moveTo(posX + dims.width + tick, posY);
      ctx.lineTo(posX + dims.width, posY);
      ctx.lineTo(posX + dims.width, posY - tick);
      ctx.stroke();

      // Bottom-left corner tick
      ctx.beginPath();
      ctx.moveTo(posX - tick, posY + dims.height);
      ctx.lineTo(posX, posY + dims.height);
      ctx.lineTo(posX, posY + dims.height + tick);
      ctx.stroke();

      // Bottom-right corner tick
      ctx.beginPath();
      ctx.moveTo(posX + dims.width + tick, posY + dims.height);
      ctx.lineTo(posX + dims.width, posY + dims.height);
      ctx.lineTo(posX + dims.width, posY + dims.height + tick);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Central Quadrant Cutting Guides (Dotted lines along 50% X and 50% Y)
  if (cuttingGuides) {
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);

    // Vertical center cut line
    ctx.beginPath();
    ctx.moveTo(halfW, 40);
    ctx.lineTo(halfW, A4_HEIGHT_PX - 40);
    ctx.stroke();

    // Horizontal center cut line
    ctx.beginPath();
    ctx.moveTo(40, halfH);
    ctx.lineTo(A4_WIDTH_PX - 40, halfH);
    ctx.stroke();

    // Small cut scissor icon / mark indicator in center
    ctx.fillStyle = '#64748b';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✂ CUT LINE ✂', halfW, halfH - 18);
    ctx.fillText('✂ CUT LINE ✂', halfW, halfH + 18);

    // Subtle edge marks for alignment
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(halfW, A4_HEIGHT_PX);
    ctx.lineTo(halfW, A4_HEIGHT_PX - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, halfH);
    ctx.lineTo(30, halfH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(A4_WIDTH_PX, halfH);
    ctx.lineTo(A4_WIDTH_PX - 30, halfH);
    ctx.stroke();

    ctx.restore();
  }

  return a4Canvas;
}

/**
 * Downloads a canvas element as high-res PNG
 */
export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports A4 canvas directly to a print-ready PDF (A4 210 x 297 mm)
 */
export function exportA4Pdf(a4Canvas: HTMLCanvasElement, filename: string = 'Photobooth_A4_Print.pdf') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const imgData = a4Canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
  pdf.save(filename);
}
