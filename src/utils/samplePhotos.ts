import { PhotoSlot } from '../types/photobooth';

function createPhotoCanvas(
  width: number,
  height: number,
  theme: {
    bgGradient: [string, string];
    character: string;
    label: string;
    sublabel: string;
    hasConfetti?: boolean;
    hasSparkles?: boolean;
    propEmoji?: string;
  }
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, theme.bgGradient[0]);
  grad.addColorStop(1, theme.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft bokeh circles
  for (let i = 0; i < 12; i++) {
    const bx = (Math.sin(i * 1.7) * 0.5 + 0.5) * width;
    const by = (Math.cos(i * 2.3) * 0.5 + 0.5) * height;
    const br = 30 + (i % 4) * 25;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + (i % 3) * 0.05})`;
    ctx.fill();
  }

  // Portrait Silhouette / Stylized Avatar Figure
  const cx = width / 2;
  const cy = height * 0.52;

  // Shoulders / torso
  ctx.beginPath();
  ctx.ellipse(cx, cy + height * 0.32, width * 0.36, height * 0.24, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - height * 0.05, Math.min(width, height) * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();

  // Avatar emoji / character expression
  ctx.font = `${Math.round(Math.min(width, height) * 0.28)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.character, cx, cy - height * 0.05);

  // Prop emoji
  if (theme.propEmoji) {
    ctx.font = `${Math.round(Math.min(width, height) * 0.16)}px system-ui, sans-serif`;
    ctx.fillText(theme.propEmoji, cx + width * 0.24, cy - height * 0.16);
  }

  // Confetti particles
  if (theme.hasConfetti) {
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#34d399'];
    for (let c = 0; c < 24; c++) {
      const px = ((c * 47) % width);
      const py = ((c * 89) % height);
      ctx.fillStyle = colors[c % colors.length];
      ctx.fillRect(px, py, 6 + (c % 5), 10 + (c % 4));
    }
  }

  // Sparkles
  if (theme.hasSparkles) {
    ctx.fillStyle = '#fef08a';
    for (let s = 0; s < 8; s++) {
      const sx = (width * (s + 1)) / 9;
      const sy = height * 0.2 + (s % 3) * 60;
      ctx.font = `${16 + (s % 3) * 6}px system-ui`;
      ctx.fillText('✨', sx, sy);
    }
  }

  // Subtle lower gradient vignette
  const bottomGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
  bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Text tag
  ctx.font = `bold ${Math.round(Math.min(width, height) * 0.058)}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(theme.label, cx, height - 34);

  ctx.font = `${Math.round(Math.min(width, height) * 0.038)}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(theme.sublabel, cx, height - 14);

  return canvas.toDataURL('image/jpeg', 0.95);
}

export function generateSampleVerticalPhotos(): PhotoSlot[] {
  const configs = [
    {
      bgGradient: ['#3b82f6', '#1d4ed8'] as [string, string],
      character: '😄',
      label: 'PHOTO 1 • READY',
      sublabel: 'Studio Booth • Smile & Pose',
      hasConfetti: true,
      propEmoji: '🕶️',
    },
    {
      bgGradient: ['#ec4899', '#be185d'] as [string, string],
      character: '🥳',
      label: 'PHOTO 2 • CELEBRATE',
      sublabel: 'Party Time • Cheers',
      hasSparkles: true,
      propEmoji: '🎉',
    },
    {
      bgGradient: ['#8b5cf6', '#6d28d9'] as [string, string],
      character: '✌️',
      label: 'PHOTO 3 • BESTIES',
      sublabel: 'Forever Memories',
      hasConfetti: true,
      propEmoji: '⭐',
    },
    {
      bgGradient: ['#f59e0b', '#b45309'] as [string, string],
      character: '😎',
      label: 'PHOTO 4 • GLAMOUR',
      sublabel: 'Golden Hour Shine',
      hasSparkles: true,
      propEmoji: '📸',
    },
    {
      bgGradient: ['#10b981', '#047857'] as [string, string],
      character: '💖',
      label: 'PHOTO 5 • SILLY MOMENTS',
      sublabel: 'Laughs & Hugs',
      hasConfetti: true,
      propEmoji: '🎈',
    },
    {
      bgGradient: ['#6366f1', '#4338ca'] as [string, string],
      character: '🤩',
      label: 'PHOTO 6 • GRAND FINALE',
      sublabel: 'Perfect Shot',
      hasSparkles: true,
      propEmoji: '👑',
    },
  ];

  const w = 600;
  const h = 750; // 4:5 aspect ratio (pure vertical)

  return configs.map((c, idx) => ({
    id: `sample_vert_${idx + 1}`,
    slotIndex: idx,
    dataUrl: createPhotoCanvas(w, h, c),
    name: `Camera_RAW_00${idx + 1}_portrait.jpg`,
    width: w,
    height: h,
    aspectRatio: w / h,
    orientation: 'vertical' as const,
    crop: { zoom: 1, panX: 0, panY: 0, rotation: 0 },
  }));
}

export function generateSampleHorizontalPhotos(): PhotoSlot[] {
  const configs = [
    {
      bgGradient: ['#0284c7', '#0369a1'] as [string, string],
      character: '😃',
      label: 'PHOTO 1 • GROUP GATHERING',
      sublabel: 'Panoramic Stage • Squad Goals',
      hasConfetti: true,
      propEmoji: '✨',
    },
    {
      bgGradient: ['#db2777', '#9d174d'] as [string, string],
      character: '🤗',
      label: 'PHOTO 2 • FAMILY EMBRACE',
      sublabel: 'Warm Hugs & Big Smiles',
      hasSparkles: true,
      propEmoji: '💖',
    },
    {
      bgGradient: ['#7c3aed', '#5b21b6'] as [string, string],
      character: '🎉',
      label: 'PHOTO 3 • CELEBRATION DANCE',
      sublabel: 'Dance Floor Memories',
      hasConfetti: true,
      propEmoji: '🎵',
    },
    {
      bgGradient: ['#d97706', '#92400e'] as [string, string],
      character: '🥂',
      label: 'PHOTO 4 • TOAST & CHEERS',
      sublabel: 'Here is to Tonight',
      hasSparkles: true,
      propEmoji: '🍾',
    },
    {
      bgGradient: ['#059669', '#065f46'] as [string, string],
      character: '🤪',
      label: 'PHOTO 5 • SILLY CREW',
      sublabel: 'Candid Outtakes',
      hasConfetti: true,
      propEmoji: '🎩',
    },
    {
      bgGradient: ['#4f46e5', '#3730a3'] as [string, string],
      character: '🌟',
      label: 'PHOTO 6 • FINAL SQUAD POSE',
      sublabel: 'Stall Signature Print',
      hasSparkles: true,
      propEmoji: '🏆',
    },
  ];

  const w = 800;
  const h = 533; // 3:2 landscape aspect ratio (pure horizontal)

  return configs.map((c, idx) => ({
    id: `sample_horiz_${idx + 1}`,
    slotIndex: idx,
    dataUrl: createPhotoCanvas(w, h, c),
    name: `Camera_RAW_10${idx + 1}_landscape.jpg`,
    width: w,
    height: h,
    aspectRatio: w / h,
    orientation: 'horizontal' as const,
    crop: { zoom: 1, panX: 0, panY: 0, rotation: 0 },
  }));
}
