import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Maximize2, Move, User, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface PhotoCropState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface PhotoCropModalProps {
  isOpen: boolean;
  rawPhotoUrl: string | null;
  initialCrop?: PhotoCropState;
  onCancel: () => void;
  onApply: (croppedDataUrl: string, cropState: PhotoCropState) => void;
}

const PREVIEW_SIZE = 240;
const OUTPUT_SIZE = 640;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

async function renderCroppedSquare(
  rawUrl: string,
  crop: PhotoCropState
): Promise<string | null> {
  const img = await loadImg(rawUrl);
  if (!img.width || !img.height) return null;

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base scale: 1.0 fits the shorter dimension ("cover" at zoom=1)
  const coverScale = Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height);
  const drawScale = coverScale * crop.zoom;
  const drawW = img.width * drawScale;
  const drawH = img.height * drawScale;

  // Map preview pixel offsets into output pixel offsets
  const offsetScale = OUTPUT_SIZE / PREVIEW_SIZE;
  const dx = (OUTPUT_SIZE - drawW) / 2 + crop.offsetX * offsetScale;
  const dy = (OUTPUT_SIZE - drawH) / 2 + crop.offsetY * offsetScale;

  // Softly blurred self-fill background when user zooms out ("Full Fit")
  ctx.save();
  if ('filter' in ctx) {
    ctx.filter = 'blur(18px) brightness(0.82) saturate(1.1)';
  }
  const bgScale = Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height) * 1.1;
  const bgW = img.width * bgScale;
  const bgH = img.height * bgScale;
  ctx.drawImage(img, (OUTPUT_SIZE - bgW) / 2, (OUTPUT_SIZE - bgH) / 2, bgW, bgH);
  ctx.restore();

  // Sharp user-positioned foreground photo
  ctx.drawImage(img, dx, dy, drawW, drawH);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export function PhotoCropModal({
  isOpen,
  rawPhotoUrl,
  initialCrop,
  onCancel,
  onApply,
}: PhotoCropModalProps) {
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 640, h: 640 });
  const [crop, setCrop] = useState<PhotoCropState>(
    initialCrop ?? { zoom: 1, offsetX: 0, offsetY: 0 }
  );
  const [saving, setSaving] = useState(false);

  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !rawPhotoUrl) return;
    setCrop(initialCrop ?? { zoom: 1, offsetX: 0, offsetY: 0 });
    loadImg(rawPhotoUrl)
      .then((img) => {
        setImgSize({ w: img.width || 640, h: img.height || 640 });
      })
      .catch(() => {
        setImgSize({ w: 640, h: 640 });
      });
  }, [isOpen, rawPhotoUrl, initialCrop]);

  const coverBaseScale = Math.max(PREVIEW_SIZE / imgSize.w, PREVIEW_SIZE / imgSize.h);
  const containZoom =
    Math.min(PREVIEW_SIZE / imgSize.w, PREVIEW_SIZE / imgSize.h) / coverBaseScale;
  const minZoom = Math.min(0.65, Number((containZoom * 0.96).toFixed(2)));
  const maxZoom = 2.8;

  const drawnW = imgSize.w * coverBaseScale * crop.zoom;
  const drawnH = imgSize.h * coverBaseScale * crop.zoom;

  const clampOffsets = (nextX: number, nextY: number, z: number) => {
    const w = imgSize.w * coverBaseScale * z;
    const h = imgSize.h * coverBaseScale * z;
    const limitX = Math.max(PREVIEW_SIZE * 0.32, Math.abs(w - PREVIEW_SIZE) / 2 + 24);
    const limitY = Math.max(PREVIEW_SIZE * 0.32, Math.abs(h - PREVIEW_SIZE) / 2 + 24);
    return {
      offsetX: Math.max(-limitX, Math.min(limitX, nextX)),
      offsetY: Math.max(-limitY, Math.min(limitY, nextY)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      origX: crop.offsetX,
      origY: crop.offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    const clamped = clampOffsets(
      dragStartRef.current.origX + dx,
      dragStartRef.current.origY + dy,
      crop.zoom
    );
    setCrop((prev) => ({
      ...prev,
      offsetX: clamped.offsetX,
      offsetY: clamped.offsetY,
    }));
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  const handleZoomChange = (nextZoom: number) => {
    const z = Math.max(minZoom, Math.min(maxZoom, nextZoom));
    const clamped = clampOffsets(crop.offsetX, crop.offsetY, z);
    setCrop({
      zoom: z,
      offsetX: clamped.offsetX,
      offsetY: clamped.offsetY,
    });
  };

  const handlePresetFull = () => {
    const fullZoom = Math.max(minZoom, Math.min(1, Number(containZoom.toFixed(2))));
    setCrop({ zoom: fullZoom, offsetX: 0, offsetY: 0 });
  };

  const handlePresetFace = () => {
    const faceZoom = 1.6;
    const clamped = clampOffsets(0, 18, faceZoom);
    setCrop({ zoom: faceZoom, offsetX: clamped.offsetX, offsetY: clamped.offsetY });
  };

  const handleSave = async () => {
    if (!rawPhotoUrl || saving) return;
    setSaving(true);
    try {
      const result = await renderCroppedSquare(rawPhotoUrl, crop);
      if (result) {
        onApply(result, crop);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && rawPhotoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-[#140307]/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[360px] rounded-3xl bg-[#FAF5EB] border-2 border-[#C59B4E] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] text-center text-[#1F1316]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A6F2B]">
                Frame Your Photo
              </span>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close photo editor"
                className="w-8 h-8 rounded-full border border-[#C59B4E]/45 bg-white/80 flex items-center justify-center text-[#1F1316]/75 hover:text-[#A61229] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-body italic text-xs text-[#1F1316]/75 mb-3">
              Drag to move · Zoom for face or full view
            </p>

            {/* Circular interactive crop stage */}
            <div className="flex justify-center">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  width: PREVIEW_SIZE,
                  height: PREVIEW_SIZE,
                  touchAction: 'none',
                }}
                className="relative rounded-full overflow-hidden border-[3px] border-[#C59B4E] shadow-[0_12px_32px_rgba(110,7,23,0.22)] bg-[#2A0810] cursor-grab active:cursor-grabbing select-none"
              >
                {/* Blurred backdrop preview */}
                <img
                  src={rawPhotoUrl}
                  alt=""
                  draggable={false}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-full h-full object-cover blur-md opacity-70 scale-110"
                />

                {/* Draggable, zoomable user image */}
                <img
                  src={rawPhotoUrl}
                  alt="Adjust portrait framing"
                  draggable={false}
                  style={{
                    width: drawnW,
                    height: drawnH,
                    maxWidth: 'none',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${crop.offsetX}px), calc(-50% + ${crop.offsetY}px))`,
                  }}
                  className="pointer-events-none absolute select-none"
                />

                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-inset ring-[#FAF5EB]/60" />
              </div>
            </div>

            <p className="mt-2 inline-flex items-center gap-1 font-label text-[9px] font-semibold tracking-[0.14em] uppercase text-[#9A6F2B]">
              <Move className="w-3 h-3" />
              Drag Photo Inside Circle
            </p>

            {/* Quick Presets: Face Zoom vs Full Photo */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePresetFace}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#C59B4E]/55 bg-[#EFE6D5] text-[#1F1316] font-label text-[10px] font-semibold tracking-[0.12em] uppercase inline-flex items-center justify-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#A61229]" />
                Face Focus
              </button>
              <button
                type="button"
                onClick={handlePresetFull}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#C59B4E]/55 bg-[#EFE6D5] text-[#1F1316] font-label text-[10px] font-semibold tracking-[0.12em] uppercase inline-flex items-center justify-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#9A6F2B]" />
                Full Photo
              </button>
            </div>

            {/* Zoom slider */}
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <button
                type="button"
                onClick={() => handleZoomChange(crop.zoom - 0.15)}
                aria-label="Zoom out"
                className="w-8 h-8 rounded-full border border-[#C59B4E]/45 bg-white flex items-center justify-center text-[#1F1316] cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={0.02}
                value={crop.zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                aria-label="Zoom photo"
                className="flex-1 accent-[#A61229] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleZoomChange(crop.zoom + 0.15)}
                aria-label="Zoom in"
                className="w-8 h-8 rounded-full border border-[#C59B4E]/45 bg-white flex items-center justify-center text-[#1F1316] cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-4 w-full min-h-[44px] px-5 py-2.5 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-xs font-semibold tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 border border-[#C59B4E]/45 shadow-[0_10px_24px_rgba(166,18,41,0.28)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#E6C37E]" />
              {saving ? 'SAVING...' : 'USE THIS PHOTO'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
