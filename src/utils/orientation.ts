import { Mode } from '../types/photobooth';

export interface ImageOrientationResult {
  valid: boolean;
  orientation: 'vertical' | 'horizontal';
  width: number;
  height: number;
  aspectRatio: number;
  dataUrl: string;
  errorMessage?: string;
}

export function detectImageDimensions(file: File): Promise<ImageOrientationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const aspectRatio = width / height;
        // In photography, <= 1.05 is portrait/square-portrait, > 1.05 is landscape
        const orientation: 'vertical' | 'horizontal' = aspectRatio <= 1.05 ? 'vertical' : 'horizontal';
        resolve({
          valid: true,
          orientation,
          width,
          height,
          aspectRatio,
          dataUrl,
        });
      };
      img.onerror = () => {
        resolve({
          valid: false,
          orientation: 'vertical',
          width: 0,
          height: 0,
          aspectRatio: 1,
          dataUrl: '',
          errorMessage: `Failed to load image file: ${file.name}. Please ensure it is a valid JPG or PNG file.`,
        });
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      resolve({
        valid: false,
        orientation: 'vertical',
        width: 0,
        height: 0,
        aspectRatio: 1,
        dataUrl: '',
        errorMessage: `Failed to read file: ${file.name}`,
      });
    };
    reader.readAsDataURL(file);
  });
}

export function validatePhotoForMode(
  photoInfo: { name: string; width: number; height: number; orientation: 'vertical' | 'horizontal' },
  mode: Mode
): { valid: boolean; message?: string } {
  if (mode === 'vertical' && photoInfo.orientation === 'horizontal') {
    return {
      valid: false,
      message: `Image orientation rejected: "${photoInfo.name}" (${photoInfo.width}×${photoInfo.height}) is a HORIZONTAL photo. Vertical Mode requires portrait photos. Please select vertical photos or switch to Horizontal Mode.`,
    };
  }

  if (mode === 'horizontal' && photoInfo.orientation === 'vertical') {
    return {
      valid: false,
      message: `Image orientation rejected: "${photoInfo.name}" (${photoInfo.width}×${photoInfo.height}) is a VERTICAL photo. Horizontal Mode requires landscape photos. Please select horizontal photos or switch to Vertical Mode.`,
    };
  }

  return { valid: true };
}
