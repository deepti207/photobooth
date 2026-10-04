import React, { useRef, useState } from 'react';
import {
  Upload,
  FolderOpen,
  Crop,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle2,
  Check,
  X,
  Image as ImageIcon,
  HardDrive,
  Camera,
  Laptop,
  Download,
  Folder,
  Layers,
} from 'lucide-react';
import { Mode, PhotoSlot } from '../types/photobooth';
import { detectImageDimensions, validatePhotoForMode } from '../utils/orientation';
import { generateSampleHorizontalPhotos, generateSampleVerticalPhotos } from '../utils/samplePhotos';

interface PhotoUploadSlotsProps {
  mode: Mode;
  photos: PhotoSlot[];
  onPhotosChange: (updated: PhotoSlot[]) => void;
  onOpenCropModal: (photo: PhotoSlot) => void;
}

interface ScannedImage {
  file: File;
  name: string;
  dataUrl?: string;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  valid?: boolean;
}

export const PhotoUploadSlots: React.FC<PhotoUploadSlotsProps> = ({
  mode,
  photos,
  onPhotosChange,
  onOpenCropModal,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOverGlobal, setDragOverGlobal] = useState(false);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);

  // Folder Browsing & Thumbnail Picker Tray Modal
  const [scannedPhotos, setScannedPhotos] = useState<ScannedImage[]>([]);
  const [selectedFolderIndices, setSelectedFolderIndices] = useState<number[]>([]);
  const [showFolderPickerModal, setShowFolderPickerModal] = useState(false);
  const [showBrowseLocationModal, setShowBrowseLocationModal] = useState(false);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);

  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 6 Slots mapping
  const slotList: (PhotoSlot | null)[] = Array.from({ length: 6 }).map((_, idx) => {
    return photos.find((p) => p.slotIndex === idx) || null;
  });

  const photoCount = photos.filter(Boolean).length;

  // Process files with orientation validation
  const processFiles = async (files: FileList | File[], targetStartIndex: number = 0) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newSlots = [...photos];
    const errors: string[] = [];

    let currentSlot = targetStartIndex;

    for (const file of fileArray) {
      if (currentSlot >= 6) break;

      const detection = await detectImageDimensions(file);
      if (!detection.valid) {
        errors.push(detection.errorMessage || `Failed to read ${file.name}`);
        continue;
      }

      // Check orientation for current mode
      const validation = validatePhotoForMode(
        {
          name: file.name,
          width: detection.width,
          height: detection.height,
          orientation: detection.orientation,
        },
        mode
      );

      if (!validation.valid) {
        errors.push(validation.message || `Invalid orientation for ${file.name}`);
        continue;
      }

      // Valid: create slot
      const existingIdx = newSlots.findIndex((p) => p.slotIndex === currentSlot);
      const newSlotItem: PhotoSlot = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slotIndex: currentSlot,
        dataUrl: detection.dataUrl,
        name: file.name,
        width: detection.width,
        height: detection.height,
        aspectRatio: detection.aspectRatio,
        orientation: detection.orientation,
        crop: { zoom: 1, panX: 0, panY: 0, rotation: 0, fitMode: 'cover' },
      };

      if (existingIdx !== -1) {
        newSlots[existingIdx] = newSlotItem;
      } else {
        newSlots.push(newSlotItem);
      }

      currentSlot++;
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(' • '));
    }

    // Sort by slotIndex
    newSlots.sort((a, b) => a.slotIndex - b.slotIndex);
    onPhotosChange(newSlots);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files, 0);
    }
    e.target.value = '';
  };

  const handleSingleUpload = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    if (e.target.files && e.target.files[0]) {
      processFiles([e.target.files[0]], slotIndex);
    }
    e.target.value = '';
  };

  // Browse entire folder (SD card, Desktop, Camera folder, USB drive)
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoadingFolder(true);
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));

    const scanned: ScannedImage[] = [];
    for (const f of files.slice(0, 36)) {
      const detection = await detectImageDimensions(f);
      const isValid = detection.valid && (
        mode === 'vertical' ? detection.orientation === 'vertical' : detection.orientation === 'horizontal'
      );
      scanned.push({
        file: f,
        name: f.name,
        dataUrl: detection.dataUrl,
        orientation: detection.orientation,
        width: detection.width,
        height: detection.height,
        valid: isValid,
      });
    }

    setScannedPhotos(scanned);
    // Pre-select first 6 valid photos
    const firstSix = scanned.map((s, i) => (s.valid ? i : -1)).filter((idx) => idx !== -1).slice(0, 6);
    setSelectedFolderIndices(firstSix);
    setIsLoadingFolder(false);
    setShowFolderPickerModal(true);
    e.target.value = '';
  };

  const handleConfirmFolderSelection = () => {
    const selectedFiles = selectedFolderIndices.map((idx) => scannedPhotos[idx].file);
    processFiles(selectedFiles, 0);
    setShowFolderPickerModal(false);
  };

  const toggleFolderSelection = (idx: number) => {
    if (selectedFolderIndices.includes(idx)) {
      setSelectedFolderIndices((prev) => prev.filter((i) => i !== idx));
    } else {
      if (selectedFolderIndices.length >= 6) {
        // Swap last
        setSelectedFolderIndices((prev) => [...prev.slice(0, 5), idx]);
      } else {
        setSelectedFolderIndices((prev) => [...prev, idx]);
      }
    }
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGlobal(false);
    if (e.dataTransfer.files) {
      const firstEmpty = slotList.findIndex((s) => s === null);
      processFiles(e.dataTransfer.files, firstEmpty !== -1 ? firstEmpty : 0);
    }
  };

  const handleRemovePhoto = (slotIndex: number) => {
    const updated = photos.filter((p) => p.slotIndex !== slotIndex);
    onPhotosChange(updated);
  };

  const handleClearAll = () => {
    onPhotosChange([]);
    setErrorMessage(null);
  };

  const handleLoadSamplePhotos = () => {
    setErrorMessage(null);
    if (mode === 'vertical') {
      onPhotosChange(generateSampleVerticalPhotos());
    } else {
      onPhotosChange(generateSampleHorizontalPhotos());
    }
  };

  // Reordering: swap slotIndex of slotA and slotB
  const handleSwapSlots = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= 6 || fromIndex === toIndex) return;

    const fromItem = photos.find((p) => p.slotIndex === fromIndex);
    const toItem = photos.find((p) => p.slotIndex === toIndex);

    const updated = photos.map((p) => {
      if (p.slotIndex === fromIndex) {
        return { ...p, slotIndex: toIndex };
      }
      if (p.slotIndex === toIndex) {
        return { ...p, slotIndex: fromIndex };
      }
      return p;
    });

    updated.sort((a, b) => a.slotIndex - b.slotIndex);
    onPhotosChange(updated);
  };

  const handleSlotDragStart = (e: React.DragEvent, slotIdx: number) => {
    setDraggedSlotIndex(slotIdx);
    e.dataTransfer.setData('text/plain', slotIdx.toString());
  };

  const handleSlotDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSlotIndex !== null && draggedSlotIndex !== targetSlotIdx) {
      handleSwapSlots(draggedSlotIndex, targetSlotIdx);
    }
    setDraggedSlotIndex(null);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Upload Zone Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 p-3.5 rounded-lg border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-100">
              {mode === 'vertical' ? '📱 6 Vertical Photos → Square / Near-Square Frames' : '🖼️ 6 Horizontal Photos → Landscape Frames'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                photoCount === 6
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {photoCount} of 6 loaded
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {mode === 'vertical'
              ? 'Vertical photos automatically cropped into compact square photobooth frames with generous borders.'
              : 'Horizontal photos placed into landscape photobooth frames. Click any slot to adjust crop & position.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 📁 BROWSE PHOTOS (Main Location & Folder Selector) */}
          <button
            onClick={() => setShowBrowseLocationModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
            title="Browse photos from Camera, SD Card, USB, Desktop, or Downloads"
          >
            <FolderOpen className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            <span>📁 BROWSE PHOTOS</span>
          </button>

          {/* BROWSE FOLDER (SD card, USB, Desktop, Camera folder) */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory is standard in Chromium/Edge/Chrome
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={handleFolderUpload}
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
            title="Browse entire camera folder or SD card"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Browse Folder</span>
          </button>

          {/* SELECT 6 PHOTOS (Multi-Select) */}
          <input
            ref={bulkFileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleBulkUpload}
          />
          <button
            onClick={() => bulkFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Photos</span>
          </button>

          {/* Load Sample Demo Photos button */}
          <button
            onClick={handleLoadSamplePhotos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 transition-colors"
            title="Load 6 demo photos for instant testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo 6</span>
          </button>

          {photoCount > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
              title="Clear all 6 slots"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rejection / Validation Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-200 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-rose-100">Image Orientation Alert: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Drag & Drop Notice Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverGlobal(true);
        }}
        onDragLeave={() => setDragOverGlobal(false)}
        onDrop={handleGlobalDrop}
        className={`rounded-lg transition-all ${
          dragOverGlobal ? 'ring-2 ring-amber-500 bg-amber-500/10' : ''
        }`}
      >
        {/* 6 Photo Slots Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {slotList.map((photo, slotIdx) => {
            const hasPhoto = Boolean(photo);
            const slotNumber = slotIdx + 1;

            return (
              <div
                key={slotIdx}
                draggable={hasPhoto}
                onDragStart={(e) => hasPhoto && handleSlotDragStart(e, slotIdx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleSlotDrop(e, slotIdx)}
                className={`relative flex flex-col rounded-lg border overflow-hidden transition-all group ${
                  hasPhoto
                    ? 'bg-zinc-900 border-zinc-700 shadow-sm hover:border-amber-500/60 cursor-grab active:cursor-grabbing'
                    : 'bg-zinc-950/70 border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
                }`}
              >
                {/* Slot Header */}
                <div className="px-2.5 py-1.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-zinc-300">PHOTO {slotNumber}</span>
                  {hasPhoto ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      READY
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-[10px]">EMPTY</span>
                  )}
                </div>

                {/* Slot Image / Placeholder */}
                <div
                  className="relative flex-1 flex items-center justify-center p-2 min-h-[140px] cursor-pointer"
                  style={{
                    aspectRatio: mode === 'vertical' ? '1/1' : '3/2',
                  }}
                  onClick={() => {
                    if (hasPhoto && photo) {
                      onOpenCropModal(photo);
                    } else {
                      singleFileInputRefs.current[slotIdx]?.click();
                    }
                  }}
                >
                  {hasPhoto && photo ? (
                    <>
                      <img
                        src={photo.dataUrl}
                        alt={`Slot ${slotNumber}`}
                        className="w-full h-full object-cover rounded shadow-inner"
                      />
                      {/* Overlay action bar on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenCropModal(photo)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-100 transition-colors"
                            title="Adjust Crop & Position (Zoom, Pan, Fit, Fill)"
                          >
                            <Crop className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => singleFileInputRefs.current[slotIdx]?.click()}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors"
                            title="Replace Photo"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemovePhoto(slotIdx)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-100 transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Order Swap arrows */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {slotIdx > 0 && (
                            <button
                              onClick={() => handleSwapSlots(slotIdx, slotIdx - 1)}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-mono flex items-center gap-0.5"
                              title="Move photo earlier"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          )}
                          {slotIdx < 5 && (
                            <button
                              onClick={() => handleSwapSlots(slotIdx, slotIdx + 1)}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-mono flex items-center gap-0.5"
                              title="Move photo later"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center text-center p-3 w-full h-full text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <Upload className="w-6 h-6 mb-1 text-zinc-600 group-hover:text-amber-500/80 transition-colors" />
                      <span className="text-[11px] font-medium">Click / Drop</span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {mode === 'vertical' ? 'Portrait only' : 'Landscape only'}
                      </span>
                    </div>
                  )}

                  {/* Hidden single file input per slot */}
                  <input
                    ref={(el) => {
                      singleFileInputRefs.current[slotIdx] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSingleUpload(e, slotIdx)}
                  />
                </div>

                {/* Footer slot meta */}
                {hasPhoto && photo && (
                  <div className="px-2 py-1 bg-zinc-950 text-[10px] text-zinc-400 font-mono truncate border-t border-zinc-800 flex items-center justify-between">
                    <span className="truncate">{photo.name}</span>
                    <span className="text-zinc-500 shrink-0 ml-1">
                      {photo.crop.zoom > 1 ? `${photo.crop.zoom.toFixed(1)}x` : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dedicated PHOTO ORDER Strip (Drag-and-Drop Reordering PHOTO 1 to PHOTO 6) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
              Photo Order (Drag to reorder sequence)
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {photos.length} photos assigned • Drag any photo to change position
          </span>
        </div>

        {/* Horizontal Sequence Bar: PHOTO 1 through PHOTO 6 */}
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, slotIdx) => {
            const photo = photos.find((p) => p.slotIndex === slotIdx);
            const slotNumber = slotIdx + 1;
            const hasPhoto = Boolean(photo);

            return (
              <div
                key={slotIdx}
                draggable={hasPhoto}
                onDragStart={(e) => hasPhoto && handleSlotDragStart(e, slotIdx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleSlotDrop(e, slotIdx)}
                onClick={() => {
                  if (photo) onOpenCropModal(photo);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all select-none ${
                  hasPhoto
                    ? 'bg-zinc-950 border-amber-500/50 hover:border-amber-400 hover:bg-zinc-900 cursor-grab active:cursor-grabbing shadow-sm'
                    : 'bg-zinc-950/40 border-dashed border-zinc-800 text-zinc-600'
                }`}
                title={hasPhoto ? `PHOTO ${slotNumber}: ${photo?.name} (Click to edit crop/zoom)` : `PHOTO ${slotNumber} (Empty)`}
              >
                <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                  <span className={hasPhoto ? 'text-amber-400' : 'text-zinc-500'}>
                    PHOTO {slotNumber}
                  </span>
                  {hasPhoto && (
                    <span className="text-[9px] text-emerald-400">✓</span>
                  )}
                </div>

                <div className="w-12 h-12 rounded overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
                  {hasPhoto && photo ? (
                    <img
                      src={photo.dataUrl}
                      alt={`Photo ${slotNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-mono">#{slotNumber}</span>
                  )}
                </div>

                <span className="text-[9px] text-zinc-400 font-mono truncate w-full mt-1">
                  {photo?.name || 'Empty'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
          <span>Example: Drag Photo 6 → Photo 1 to place the 6th photo at the top.</span>
          <span className="text-amber-400/90 font-mono">Strip preview updates immediately</span>
        </div>
      </div>

      {/* Fast Instructions Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 pt-0.5">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          Click any photo to adjust Zoom, Pan, Fit, Fill. Physical frame size stays 100% constant.
        </span>
      </div>

      {/* 📁 BROWSE PHOTOS Location Explorer Modal */}
      {showBrowseLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-zinc-100">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                  Browse & Select Photo Location
                </h3>
                <p className="text-xs text-zinc-400">
                  Select photos from your PC, Connected Camera, SD Card, or USB Drive
                </p>
              </div>
              <button
                onClick={() => setShowBrowseLocationModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowBrowseLocationModal(false);
                    folderInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/60 hover:border-amber-400 text-left transition-all hover:scale-[1.01] group cursor-pointer"
                >
                  <div className="p-3 rounded-lg bg-amber-500 text-zinc-950 font-bold group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-100 group-hover:text-amber-300">
                      [ BROWSE FOLDER ]
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Open entire SD Card, Camera DCIM folder, or local folder
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowBrowseLocationModal(false);
                    bulkFileInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border-2 border-cyan-500/60 hover:border-cyan-400 text-left transition-all hover:scale-[1.01] group cursor-pointer"
                >
                  <div className="p-3 rounded-lg bg-cyan-500 text-zinc-950 font-bold group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300">
                      [ SELECT PHOTOS ]
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Select 6 photos at once with multi-select file dialog
                    </div>
                  </div>
                </button>
              </div>

              {/* Supported Locations Grid */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Supported Photo Booth Locations & Drives
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <Laptop className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Desktop</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Downloads</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>Pictures</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Camera (DCIM)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <HardDrive className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>SD Card Drive</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <HardDrive className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>USB Flash Drive</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <HardDrive className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>External Hard Drive</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Local Folder</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 pt-1">
                  💡 In the file picker, select your connected camera card (e.g. Drive E:, F: or DCIM folder) to access photos transferred straight from the camera.
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBrowseLocationModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Picker Modal (Thumbnails preview before confirming 6 photos) */}
      {showFolderPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden text-zinc-100">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  Select 6 Photos from Folder
                </h3>
                <p className="text-xs text-zinc-400">
                  {scannedPhotos.length} photos found • {selectedFolderIndices.length} of 6 selected
                </p>
              </div>
              <button
                onClick={() => setShowFolderPickerModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {scannedPhotos.map((item, idx) => {
                const isSelected = selectedFolderIndices.includes(idx);
                const orderNumber = selectedFolderIndices.indexOf(idx) + 1;

                return (
                  <div
                    key={idx}
                    onClick={() => item.valid && toggleFolderSelection(idx)}
                    className={`relative rounded-lg overflow-hidden border p-1 transition-all cursor-pointer ${
                      !item.valid
                        ? 'opacity-30 border-zinc-800 cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500 bg-amber-500/10'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                    }`}
                  >
                    <div className="aspect-square w-full rounded overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shadow">
                        {orderNumber}
                      </div>
                    )}
                    <div className="text-[9px] text-zinc-400 truncate mt-1 text-center font-mono">
                      {item.name}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {selectedFolderIndices.length === 6 ? '✓ Exactly 6 photos selected' : `Please select ${6 - selectedFolderIndices.length} more`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFolderPickerModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmFolderSelection}
                  disabled={selectedFolderIndices.length !== 6}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 shadow-sm"
                >
                  Load 6 Selected Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
