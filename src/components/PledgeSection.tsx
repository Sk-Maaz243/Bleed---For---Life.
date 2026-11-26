import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Check,
  ChevronDown,
  Download,
  ImagePlus,
  Lock,
  MapPin,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { SITE_CONFIG } from '../config';
import { extractPhotoAtmosphere, type PhotoAtmosphere } from '../utils/photoAtmosphere';
import { DiaryLine } from './DiaryMotion';
import { PhotoCropModal, type PhotoCropState } from './PhotoCropModal';
import { GlossyBloodDrop } from './SvgArtwork';

interface PledgePassData {
  id: string;
  name: string;
  bloodGroup: string;
}

interface UnlockProof {
  eventDay: string;
  lat: number;
  lng: number;
  unlockedAt: string;
}

const UNLOCK_STORAGE_KEY = 'bleedForLife_heroStoryUnlock_v1';

function getIstDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function readSavedUnlockProof(): UnlockProof | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(UNLOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UnlockProof>;
    if (
      parsed &&
      parsed.eventDay === SITE_CONFIG.event.eventDayIst &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number' &&
      haversineMeters(
        parsed.lat,
        parsed.lng,
        SITE_CONFIG.event.venueCoords.lat,
        SITE_CONFIG.event.venueCoords.lng
      ) <= SITE_CONFIG.event.venueCoords.radiusMeters &&
      getIstDateString() >= SITE_CONFIG.event.eventDayIst
    ) {
      return {
        eventDay: parsed.eventDay,
        lat: parsed.lat,
        lng: parsed.lng,
        unlockedAt: typeof parsed.unlockedAt === 'string' ? parsed.unlockedAt : new Date().toISOString(),
      };
    }
  } catch {
    // Ignore malformed localStorage data
  }
  return null;
}

function saveUnlockProof(proof: UnlockProof): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(proof));
  } catch {
    // Ignore storage quota / private mode failures
  }
}

interface PledgeSectionProps {
  onPledgeSuccess: () => void;
  onPhotoChange?: (photoUrl: string | null) => void;
}

function captureFullFrameDataUrl(
  source: HTMLImageElement | HTMLVideoElement,
  srcWidth: number,
  srcHeight: number,
  mirrorHorizontal = false
): string | null {
  if (!srcWidth || !srcHeight) return null;
  const maxDim = 1080;
  const scale = Math.min(1, maxDim / Math.max(srcWidth, srcHeight));
  const outW = Math.round(srcWidth * scale);
  const outH = Math.round(srcHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.save();
  if (mirrorHorizontal) {
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, outW, outH);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

function cropSquareImageToDataUrl(
  source: HTMLImageElement | HTMLVideoElement,
  srcWidth: number,
  srcHeight: number,
  mirrorHorizontal = false
): string | null {
  if (!srcWidth || !srcHeight) return null;
  const side = Math.min(srcWidth, srcHeight);
  const sx = (srcWidth - side) / 2;
  const sy = (srcHeight - side) / 2;
  const outSize = 640;

  const canvas = document.createElement('canvas');
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.save();
  if (mirrorHorizontal) {
    ctx.translate(outSize, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, sx, sy, side, side, 0, 0, outSize, outSize);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.9);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function drawGoldenHeartDivider(ctx: CanvasRenderingContext2D, width: number, y: number) {
  const cx = width / 2;
  ctx.save();

  // Left & right tapered antique gold lines
  const leftGrad = ctx.createLinearGradient(120, y, cx - 54, y);
  leftGrad.addColorStop(0, 'rgba(197, 155, 78, 0)');
  leftGrad.addColorStop(0.6, 'rgba(197, 155, 78, 0.85)');
  leftGrad.addColorStop(1, '#C59B4E');
  ctx.strokeStyle = leftGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(cx - 56, y);
  ctx.stroke();

  const rightGrad = ctx.createLinearGradient(cx + 54, y, width - 120, y);
  rightGrad.addColorStop(0, '#C59B4E');
  rightGrad.addColorStop(0.4, 'rgba(197, 155, 78, 0.85)');
  rightGrad.addColorStop(1, 'rgba(197, 155, 78, 0)');
  ctx.strokeStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(cx + 56, y);
  ctx.lineTo(width - 120, y);
  ctx.stroke();

  // Small diamond accents flanking heart
  ctx.fillStyle = '#D4A853';
  for (const dx of [-58, 58]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx, y - 6);
    ctx.lineTo(cx + dx + 6, y);
    ctx.lineTo(cx + dx, y + 6);
    ctx.lineTo(cx + dx - 6, y);
    ctx.closePath();
    ctx.fill();
  }

  // Golden heart in the middle
  const heartGrad = ctx.createLinearGradient(cx, y - 24, cx, y + 28);
  heartGrad.addColorStop(0, '#E8C56E');
  heartGrad.addColorStop(1, '#B38028');
  ctx.fillStyle = heartGrad;
  ctx.beginPath();
  ctx.moveTo(cx, y + 26);
  ctx.bezierCurveTo(cx + 42, y + 2, cx + 38, y - 28, cx + 16, y - 28);
  ctx.bezierCurveTo(cx + 6, y - 28, cx, y - 18, cx, y - 14);
  ctx.bezierCurveTo(cx, y - 18, cx - 6, y - 28, cx - 16, y - 28);
  ctx.bezierCurveTo(cx - 38, y - 28, cx - 42, y + 2, cx, y + 26);
  ctx.closePath();
  ctx.fill();

  // White ECG pulse inside the golden heart
  ctx.strokeStyle = '#FAF5EB';
  ctx.lineWidth = 3.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 21, y - 2);
  ctx.lineTo(cx - 11, y - 2);
  ctx.lineTo(cx - 6, y - 12);
  ctx.lineTo(cx - 1, y + 9);
  ctx.lineTo(cx + 5, y - 14);
  ctx.lineTo(cx + 10, y + 2);
  ctx.lineTo(cx + 21, y - 2);
  ctx.stroke();

  ctx.restore();
}

function drawBloodDropEmblem(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy - 8);
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.bezierCurveTo(0, -96, 78, -4, 78, 46);
  ctx.arc(0, 46, 78, 0, Math.PI);
  ctx.bezierCurveTo(-78, -4, 0, -96, 0, -96);
  ctx.closePath();
  ctx.fillStyle = '#A61229';
  ctx.fill();
  ctx.strokeStyle = '#D4A853';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}

async function renderHeroStoryDataUrl(
  pass: PledgePassData,
  photoDataUrl: string | null,
  rawPhotoDataUrl?: string | null
): Promise<string | null> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed cleanly with available fonts
    }
  }

  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1620;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Warm sunlit parchment base
  ctx.fillStyle = '#FAF2E3';
  ctx.fillRect(0, 0, width, height);

  let loadedPhoto: HTMLImageElement | null = null;
  let atmosphere: PhotoAtmosphere = {
    dominantRgb: '186, 134, 72',
    glowRgb: '238, 204, 136',
    luminance: 0.45,
  };

  const backdropSrc = rawPhotoDataUrl || photoDataUrl;
  if (backdropSrc || photoDataUrl) {
    try {
      const [portraitImg, backdropImg, sampled] = await Promise.all([
        photoDataUrl ? loadImage(photoDataUrl) : Promise.resolve(null),
        backdropSrc ? loadImage(backdropSrc) : Promise.resolve(null),
        extractPhotoAtmosphere((backdropSrc || photoDataUrl)!),
      ]);
      loadedPhoto = portraitImg;
      atmosphere = sampled;

      if (backdropImg) {
        // Softly blended, gently blurred full-certificate photo backdrop customized per user's photo
        ctx.save();
        const brightnessBoost =
          atmosphere.luminance < 0.25 ? 1.48 : atmosphere.luminance < 0.45 ? 1.24 : 1.04;
        ctx.globalAlpha = atmosphere.luminance < 0.25 ? 0.52 : 0.42;
        if ('filter' in ctx) {
          ctx.filter = `blur(10px) saturate(1.18) brightness(${brightnessBoost})`;
        }
        const scale = Math.max(width / backdropImg.width, height / backdropImg.height) * 1.06;
        const drawW = backdropImg.width * scale;
        const drawH = backdropImg.height * scale;
        ctx.drawImage(backdropImg, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
        ctx.restore();

        // Adaptive sunlit cream-ivory & photo-tinted veil so text stays 100% crisp
        const tintGrad = ctx.createLinearGradient(0, 0, 0, height);
        tintGrad.addColorStop(0, `rgba(252, 244, 226, 0.56)`);
        tintGrad.addColorStop(0.28, `rgba(${atmosphere.glowRgb}, 0.28)`);
        tintGrad.addColorStop(0.55, 'rgba(250, 242, 227, 0.68)');
        tintGrad.addColorStop(1, 'rgba(248, 237, 216, 0.84)');
        ctx.fillStyle = tintGrad;
        ctx.fillRect(0, 0, width, height);
      }
    } catch {
      loadedPhoto = null;
    }
  }

  // Top-left sunlit golden flare + diagonal golden ray glow
  ctx.save();
  const sunFlare = ctx.createRadialGradient(90, 80, 20, 120, 120, 680);
  sunFlare.addColorStop(0, 'rgba(255, 249, 224, 0.72)');
  sunFlare.addColorStop(0.35, `rgba(${atmosphere.glowRgb}, 0.34)`);
  sunFlare.addColorStop(1, 'rgba(230, 195, 126, 0)');
  ctx.fillStyle = sunFlare;
  ctx.fillRect(0, 0, width, height);

  const centerAura = ctx.createRadialGradient(width / 2, 540, 40, width / 2, 540, 480);
  centerAura.addColorStop(0, 'rgba(255, 245, 214, 0.42)');
  centerAura.addColorStop(0.6, `rgba(${atmosphere.glowRgb}, 0.16)`);
  centerAura.addColorStop(1, 'rgba(230, 195, 126, 0)');
  ctx.fillStyle = centerAura;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Outer gleaming rounded antique-gold border + inner hairline
  ctx.save();
  const frameGrad = ctx.createLinearGradient(0, 0, width, height);
  frameGrad.addColorStop(0, '#F5DE9E');
  frameGrad.addColorStop(0.35, '#C59B4E');
  frameGrad.addColorStop(0.7, '#F0D388');
  frameGrad.addColorStop(1, '#A87D32');
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(26, 26, width - 52, height - 52, 42);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(197, 155, 78, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(42, 42, width - 84, height - 84, 32);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';

  // Header directly over sunlit sky-glow background (without Bismillah)
  ctx.fillStyle = '#9A6F2B';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(SITE_CONFIG.brand.title, width / 2, 134);

  ctx.fillStyle = '#8C0D1F';
  ctx.font = '700 68px Fraunces, Georgia, serif';
  ctx.fillText(SITE_CONFIG.pledge.passTitle, width / 2, 214);

  ctx.fillStyle = '#9E1428';
  ctx.font = 'italic 30px Lora, Georgia, serif';
  ctx.fillText('Certificate of Honour', width / 2, 266);

  // Centerpiece: Crystal-clear circular portrait inside a double golden frame (NO buttons/icons!)
  const centerX = width / 2;
  const centerY = 504;
  const avatarRadius = 158;

  if (loadedPhoto) {
    try {
      const img = loadedPhoto;
      // Soft golden aura halo behind circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarRadius + 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240, 211, 136, 0.36)';
      ctx.fill();
      ctx.restore();

      // Clipped crystal-clear original uploaded photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(
        img,
        sx,
        sy,
        side,
        side,
        centerX - avatarRadius,
        centerY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.restore();

      // Gleaming burnished double gold ring
      const ringGrad = ctx.createLinearGradient(
        centerX - avatarRadius,
        centerY - avatarRadius,
        centerX + avatarRadius,
        centerY + avatarRadius
      );
      ringGrad.addColorStop(0, '#F7E1A0');
      ringGrad.addColorStop(0.5, '#C59B4E');
      ringGrad.addColorStop(1, '#9A6F2B');
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarRadius + 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#FAF5EB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarRadius - 3, 0, Math.PI * 2);
      ctx.stroke();
    } catch {
      drawBloodDropEmblem(ctx, centerX, centerY);
    }
  } else {
    drawBloodDropEmblem(ctx, centerX, centerY);
  }

  // Donor Name & Blood Group directly underneath
  ctx.fillStyle = '#1F1316';
  ctx.font = '700 62px Fraunces, Georgia, serif';
  const displayName = pass.name.length > 22 ? `${pass.name.slice(0, 20)}…` : pass.name;
  ctx.fillText(displayName, width / 2, 756);

  ctx.fillStyle = '#A61229';
  ctx.font = '700 66px Fraunces, Georgia, serif';
  ctx.fillText(pass.bloodGroup, width / 2, 838);

  // Short Heartfelt Quote
  ctx.fillStyle = '#1F1316';
  ctx.font = 'italic 33px Lora, Georgia, serif';
  ctx.fillText(SITE_CONFIG.pledge.storyQuote, width / 2, 932);

  // 3 Rounded Cream-Gold Achievement Pills
  const cards = [
    { title: '3 Lives', sub: 'SAVED' },
    { title: 'Sadqah', sub: '& DUAS' },
    { title: 'Hero', sub: '2026' },
  ];
  const cardW = 278;
  const cardH = 128;
  const gap = 26;
  const startX = (width - (cardW * 3 + gap * 2)) / 2;
  const cardY = 1004;

  cards.forEach((item, idx) => {
    const cx = startX + idx * (cardW + gap);
    ctx.save();
    ctx.fillStyle = 'rgba(250, 243, 224, 0.9)';
    ctx.strokeStyle = '#C59B4E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx, cardY, cardW, cardH, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#A61229';
    ctx.font = '700 40px Fraunces, Georgia, serif';
    ctx.fillText(item.title, cx + cardW / 2, cardY + 62);

    ctx.fillStyle = '#1F1316';
    ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(item.sub, cx + cardW / 2, cardY + 102);
    ctx.restore();
  });

  // Golden Heartbeat Heart Divider
  drawGoldenHeartDivider(ctx, width, 1212);

  // Compact Qur'an 5:32 Honour Quote
  ctx.fillStyle = '#1F1316';
  ctx.font = 'italic 31px Lora, Georgia, serif';
  ctx.fillText('“Whoever saves one life, saves all mankind.”', width / 2, 1304);
  ctx.font = '600 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#9A6F2B';
  ctx.fillText('AL-QUR’AN · 5:32', width / 2, 1348);

  // Official Date & Venue Footer
  ctx.fillStyle = '#9A6F2B';
  ctx.font = '700 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `6 DEC 2026  ·  ${SITE_CONFIG.event.venueName.toUpperCase()}`,
    width / 2,
    1448
  );
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${SITE_CONFIG.event.venueSociety.toUpperCase()}  ·  THANA ROAD, BHIWANDI`,
    width / 2,
    1490
  );

  return canvas.toDataURL('image/png');
}

async function downloadHeroStoryPng(
  pass: PledgePassData,
  photoDataUrl: string | null,
  rawPhotoDataUrl?: string | null
) {
  const dataUrl = await renderHeroStoryDataUrl(pass, photoDataUrl, rawPhotoDataUrl);
  if (!dataUrl) return;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'bleed-for-life-certificate.png';
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  } catch {
    const link = document.createElement('a');
    link.download = 'bleed-for-life-certificate.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function triggerCachedDownload(blob: Blob | null, dataUrl: string | null) {
  if (blob) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'bleed-for-life-certificate.png';
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
    return true;
  }
  if (dataUrl) {
    const link = document.createElement('a');
    link.download = 'bleed-for-life-certificate.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
  return false;
}

function openExternalStoryTarget(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function WhatsAppStoryIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M22.7 19.3c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.8 8.8 0 0 1-2.6-1.6 9.8 9.8 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6s-.7-1.8-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.8 5.2.8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"
      />
    </svg>
  );
}

function InstagramStoryIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <defs>
        <linearGradient id="ig-story-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="45%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8.5" fill="url(#ig-story-grad)" />
      <rect
        x="8.2"
        y="8.2"
        width="15.6"
        height="15.6"
        rx="4.6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="3.6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="20.7" cy="11.3" r="1.15" fill="#FFFFFF" />
    </svg>
  );
}

function FacebookStoryIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M17.8 25.5v-8.4h2.8l.4-3.3h-3.2v-2.1c0-.9.3-1.6 1.6-1.6h1.7V7.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4h-2.8v3.3h2.8v8.4h3.4z"
      />
    </svg>
  );
}

export function PledgeSection({ onPledgeSuccess, onPhotoChange }: PledgeSectionProps) {
  const [pledgeCount, setPledgeCount] = useState<number>(0);
  const [unlockProof, setUnlockProof] = useState<UnlockProof | null>(() => readSavedUnlockProof());
  const [checkingLock, setCheckingLock] = useState<boolean>(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>(SITE_CONFIG.pledge.bloodGroups[0]);
  const [bloodMenuOpen, setBloodMenuOpen] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [rawPhotoDataUrl, setRawPhotoDataUrl] = useState<string | null>(null);
  const [cropState, setCropState] = useState<PhotoCropState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingRawUrl, setPendingRawUrl] = useState<string | null>(null);
  const [photoAtmosphere, setPhotoAtmosphere] = useState<PhotoAtmosphere | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heroPass, setHeroPass] = useState<PledgePassData | null>(null);

  const sectionWrapRef = useRef<HTMLDivElement | null>(null);
  const autoTriedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bloodDropdownRef = useRef<HTMLDivElement | null>(null);
  const cachedStoryFileRef = useRef<File | null>(null);
  const cachedStoryBlobRef = useRef<Blob | null>(null);
  const cachedStoryDataUrlRef = useRef<string | null>(null);

  const unlocked = Boolean(unlockProof);
  const isEventDay = getIstDateString() === SITE_CONFIG.event.eventDayIst;
  const backdropPhotoUrl = rawPhotoDataUrl || photoDataUrl;

  const verifyVenueAndUnlock = useCallback(
    (silent = false) => {
      if (unlocked) return;

      if (!isEventDay) {
        if (!silent) {
          setLockMessage(
            `Locked until Event Day (${SITE_CONFIG.event.dateDisplay}). Open this page at ${SITE_CONFIG.event.venueFullName}, Bhiwandi to unlock.`
          );
        }
        return;
      }

      if (!navigator.geolocation) {
        if (!silent) {
          setLockMessage('Location services are required on your phone at the venue to unlock.');
        }
        return;
      }

      if (!silent) {
        setCheckingLock(true);
        setLockMessage(null);
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const dist = haversineMeters(
            latitude,
            longitude,
            SITE_CONFIG.event.venueCoords.lat,
            SITE_CONFIG.event.venueCoords.lng
          );
          if (dist <= SITE_CONFIG.event.venueCoords.radiusMeters) {
            const proof: UnlockProof = {
              eventDay: SITE_CONFIG.event.eventDayIst,
              lat: latitude,
              lng: longitude,
              unlockedAt: new Date().toISOString(),
            };
            saveUnlockProof(proof);
            setUnlockProof(proof);
            setLockMessage(null);
          } else if (!silent) {
            const kmAway = (dist / 1000).toFixed(1);
            setLockMessage(
              `You are ~${kmAway} km away. Visit ${SITE_CONFIG.event.venueName}, Bhiwandi on Event Day to unlock automatically.`
            );
          }
          setCheckingLock(false);
        },
        () => {
          if (!silent) {
            setLockMessage(
              `Please turn on Location / GPS on your phone at ${SITE_CONFIG.event.venueName} to unlock.`
            );
          }
          setCheckingLock(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    },
    [isEventDay, unlocked]
  );

  // Auto-unlock automatically on Event Day when the user arrives at the college and views this section
  useEffect(() => {
    if (!isEventDay || unlocked) return;

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'granted') {
            verifyVenueAndUnlock(true);
          }
        })
        .catch(() => {
          // Ignore permissions API errors
        });
    }

    const node = sectionWrapRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !autoTriedRef.current) {
          autoTriedRef.current = true;
          verifyVenueAndUnlock(true);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isEventDay, unlocked, verifyVenueAndUnlock]);

  useEffect(() => {
    onPhotoChange?.(backdropPhotoUrl);
    if (!backdropPhotoUrl) {
      setPhotoAtmosphere(null);
      return;
    }
    let active = true;
    extractPhotoAtmosphere(backdropPhotoUrl).then((sampled) => {
      if (active) setPhotoAtmosphere(sampled);
    });
    return () => {
      active = false;
    };
  }, [backdropPhotoUrl, onPhotoChange]);

  // Pre-build certificate File in background so navigator.share({ files }) works instantaneously on tap
  useEffect(() => {
    cachedStoryFileRef.current = null;
    cachedStoryBlobRef.current = null;
    cachedStoryDataUrlRef.current = null;
    setShareNote(null);

    if (!heroPass) return;
    let active = true;
    renderHeroStoryDataUrl(heroPass, photoDataUrl, rawPhotoDataUrl)
      .then(async (dataUrl) => {
        if (!active || !dataUrl) return;
        cachedStoryDataUrlRef.current = dataUrl;
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        if (!active) return;
        cachedStoryBlobRef.current = blob;
        cachedStoryFileRef.current = new File([blob], 'bleed-for-life-certificate.png', {
          type: 'image/png',
        });
      })
      .catch(() => {
        // Fallback renders on-demand if pre-cache fails
      });

    return () => {
      active = false;
    };
  }, [heroPass, photoDataUrl, rawPhotoDataUrl]);

  useEffect(() => {
    if (!bloodMenuOpen) return;
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (
        bloodDropdownRef.current &&
        !bloodDropdownRef.current.contains(event.target as Node)
      ) {
        setBloodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [bloodMenuOpen]);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {
      // Ignore autoplay promise rejection if user already tapped
    });
  }, [cameraOpen]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/pledges')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load count'))))
      .then((data: { count?: number }) => {
        if (mounted && typeof data.count === 'number') {
          setPledgeCount(data.count);
        }
      })
      .catch(() => {
        // Keep 0 gracefully if unavailable
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      nativeCameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError('Camera unavailable — please add a photo from gallery.');
      nativeCameraInputRef.current?.click();
    }
  };

  const handleCaptureSelfie = () => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const fullFrame = captureFullFrameDataUrl(video, width, height, true);
    const defaultCropped = cropSquareImageToDataUrl(video, width, height, true);
    const initialRaw = fullFrame || defaultCropped;
    if (defaultCropped) {
      setPhotoDataUrl(defaultCropped);
    }
    if (initialRaw) {
      setRawPhotoDataUrl(initialRaw);
      setPendingRawUrl(initialRaw);
      setCropState({ zoom: 1, offsetX: 0, offsetY: 0 });
      setCropModalOpen(true);
    }
    stopCameraStream();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setCameraError(null);
    stopCameraStream();

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) return;
      const img = new Image();
      img.onload = () => {
        const fullRes = captureFullFrameDataUrl(img, img.width, img.height, false) || result;
        const defaultCropped = cropSquareImageToDataUrl(img, img.width, img.height, false);
        setPhotoDataUrl(defaultCropped || result);
        setRawPhotoDataUrl(fullRes);
        setPendingRawUrl(fullRes);
        setCropState({ zoom: 1, offsetX: 0, offsetY: 0 });
        setCropModalOpen(true);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    stopCameraStream();
    setBloodMenuOpen(false);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          bloodGroup,
          lat: unlockProof?.lat,
          lng: unlockProof?.lng,
          unlockProof,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        count?: number;
        pledge?: PledgePassData;
      };

      if (!response.ok || !data.pledge) {
        setErrorMsg(data.error || 'Could not create your story pass. Please try again.');
        setSubmitting(false);
        return;
      }

      if (typeof data.count === 'number') {
        setPledgeCount(data.count);
      } else {
        setPledgeCount((c) => c + 1);
      }

      setHeroPass(data.pledge);
      onPledgeSuccess();
    } catch {
      setErrorMsg('Network issue while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadStory = async () => {
    if (!heroPass || downloading) return;
    setDownloading(true);
    setShareNote(null);
    try {
      if (cachedStoryBlobRef.current || cachedStoryDataUrlRef.current) {
        triggerCachedDownload(cachedStoryBlobRef.current, cachedStoryDataUrlRef.current);
      } else {
        await downloadHeroStoryPng(heroPass, photoDataUrl, rawPhotoDataUrl);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleShareStory = async (platform: 'whatsapp' | 'instagram' | 'facebook') => {
    if (!heroPass) return;
    setShareNote(null);

    const shareUrl =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : SITE_CONFIG.share.urlFallback;
    const shareText = `Alhamdulillah! I donated blood at ${SITE_CONFIG.brand.title} (${SITE_CONFIG.event.dateDisplay}). Join us at ${SITE_CONFIG.event.venueName}: ${shareUrl}`;

    const file = cachedStoryFileRef.current;
    if (file && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const canShareFile =
          typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
        if (canShareFile) {
          await navigator.share({
            files: [file],
            title: `${heroPass.name} · ${SITE_CONFIG.pledge.passTitle}`,
            text: shareText,
          });
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Fall through to save photo + open platform Story destination
      }
    }

    // Fallback when native file-share sheet isn't available (e.g. desktop browser):
    // Save certificate photo immediately and open the chosen social app
    if (cachedStoryBlobRef.current || cachedStoryDataUrlRef.current) {
      triggerCachedDownload(cachedStoryBlobRef.current, cachedStoryDataUrlRef.current);
    } else {
      await downloadHeroStoryPng(heroPass, photoDataUrl, rawPhotoDataUrl);
    }

    if (platform === 'whatsapp') {
      setShareNote('Certificate saved! Select it in WhatsApp Status to post.');
      openExternalStoryTarget(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`);
    } else if (platform === 'instagram') {
      setShareNote('Certificate saved! Add it directly to your Instagram Story.');
      openExternalStoryTarget('https://www.instagram.com/');
    } else {
      setShareNote('Certificate saved! Add it directly to your Facebook Story.');
      openExternalStoryTarget(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
      );
    }
  };

  const glowRgb = photoAtmosphere?.glowRgb ?? '238, 204, 136';
  const lum = photoAtmosphere?.luminance ?? 0.45;
  const certBlurBrightness = lum < 0.25 ? 1.48 : lum < 0.45 ? 1.24 : 1.04;

  const renderFormSelfieControls = () => (
    <div className="flex flex-col items-center">
      <span className="block font-label text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A6F2B] mb-1.5 text-center">
        {SITE_CONFIG.pledge.photoLabel}
      </span>

      <div className="relative">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-[#C59B4E] bg-[#FAF5EB] shadow-[0_10px_26px_rgba(110,7,23,0.2)] overflow-hidden flex items-center justify-center">
          {cameraOpen ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : photoDataUrl ? (
            <img
              src={photoDataUrl}
              alt="Your donor selfie"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#A61229]">
              <Camera className="w-6 h-6 stroke-[1.75]" />
              <span className="mt-0.5 font-label text-[9px] font-semibold tracking-[0.18em] uppercase text-[#1F1316]/70">
                Selfie
              </span>
            </div>
          )}
        </div>

        {!cameraOpen && (
          <button
            type="button"
            onClick={
              photoDataUrl
                ? () => {
                    setPhotoDataUrl(null);
                    setRawPhotoDataUrl(null);
                    setPendingRawUrl(null);
                  }
                : handleOpenCamera
            }
            aria-label={photoDataUrl ? 'Remove selfie' : 'Open selfie camera'}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] border-2 border-[#FAF5EB] flex items-center justify-center shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {photoDataUrl ? <Trash2 className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
          </button>
        )}
      </div>

      {cameraOpen ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleCaptureSelfie}
            className="min-h-[34px] px-4 py-1 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-[11px] font-semibold tracking-[0.15em] uppercase inline-flex items-center gap-1.5 border border-[#C59B4E]/45 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            {SITE_CONFIG.pledge.captureButton}
          </button>
          <button
            type="button"
            onClick={stopCameraStream}
            className="min-h-[34px] px-3.5 py-1 rounded-full border border-[#C59B4E]/45 bg-[#FAF5EB] text-[#1F1316] font-label text-[11px] font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-1 hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            {SITE_CONFIG.pledge.cancelCameraButton}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleOpenCamera}
            className="min-h-[34px] px-3.5 py-1 rounded-full bg-[#1F1316] text-[#FAF5EB] font-label text-[10px] font-semibold tracking-[0.15em] uppercase inline-flex items-center gap-1.5 border border-[#C59B4E]/40 shadow-sm hover:bg-[#2f1d22] active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#E6C37E]" />
            {SITE_CONFIG.pledge.cameraButton}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[34px] px-3.5 py-1 rounded-full border border-[#C59B4E]/55 bg-[#FAF5EB] text-[#1F1316] font-label text-[10px] font-semibold tracking-[0.15em] uppercase inline-flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
          >
            <ImagePlus className="w-3.5 h-3.5 text-[#A61229]" />
            {SITE_CONFIG.pledge.uploadButton}
          </button>
          {(rawPhotoDataUrl || photoDataUrl) && (
            <button
              type="button"
              onClick={() => {
                setPendingRawUrl(rawPhotoDataUrl || photoDataUrl);
                setCropModalOpen(true);
              }}
              className="min-h-[34px] px-3.5 py-1 rounded-full border border-[#A61229]/45 bg-[#A61229]/10 text-[#A61229] font-label text-[10px] font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-1.5 hover:bg-[#A61229]/15 active:scale-95 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Adjust Photo
            </button>
          )}
        </div>
      )}

      {cameraError && (
        <p className="mt-1.5 font-body italic text-xs text-[#A61229] max-w-[260px]">
          {cameraError}
        </p>
      )}
    </div>
  );

  return (
    <div ref={sectionWrapRef} className="flex flex-col items-center text-center w-full max-w-[380px] mx-auto">
      {/* Hidden file inputs kept mounted so photo swap outside the certificate also works */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelected}
        className="hidden"
      />

      <DiaryLine delay={0.05}>
        <span className="font-label text-[11px] font-semibold tracking-[0.22em] uppercase text-[#A61229]">
          {SITE_CONFIG.pledge.eyebrow}
        </span>
      </DiaryLine>

      <DiaryLine delay={0.14}>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-[#1F1316] tracking-tight text-balance">
          {SITE_CONFIG.pledge.heading}
        </h2>
      </DiaryLine>

      <DiaryLine delay={0.22}>
        <p className="mt-1 font-body italic text-sm sm:text-base text-[#1F1316]/75">
          {SITE_CONFIG.pledge.subtext}
          {pledgeCount > 0 && (
            <span className="ml-1.5 not-italic font-label text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9A6F2B]">
              · {pledgeCount} {SITE_CONFIG.pledge.counterSuffix}
            </span>
          )}
        </p>
      </DiaryLine>

      <DiaryLine delay={0.3} className="w-full">
        <div>
          {!unlocked ? (
            <div className="mt-4 w-full rounded-3xl bg-[#FAF5EB]/95 border-[1.5px] border-[#C59B4E]/60 p-6 shadow-[0_16px_38px_rgba(31,19,22,0.1)] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] border-2 border-[#C59B4E] flex items-center justify-center shadow-[0_8px_22px_rgba(166,18,41,0.3)]">
                <Lock className="w-6 h-6 text-[#E6C37E]" />
              </div>

              <h3 className="mt-3.5 font-display text-xl font-semibold text-[#1F1316]">
                Locked Until Event Day
              </h3>
              <p className="mt-1.5 font-body italic text-sm text-[#1F1316]/80 leading-relaxed max-w-[275px]">
                Auto-unlocks on <span className="not-italic font-semibold text-[#A61229]">{SITE_CONFIG.event.dateDisplay}</span> at {SITE_CONFIG.event.venueFullName} — and stays open on your phone.
              </p>

              <div className="mt-4 w-full rounded-2xl bg-[#EFE6D5]/90 border border-[#C59B4E]/40 px-3.5 py-3 flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between text-xs font-label">
                  <span className="uppercase tracking-[0.12em] text-[#1F1316]/70 font-semibold">
                    Event Date
                  </span>
                  <span className={`font-semibold ${isEventDay ? 'text-emerald-700' : 'text-[#9A6F2B]'}`}>
                    {isEventDay ? 'Today · Ready' : '6 Dec 2026'}
                  </span>
                </div>
                <div className="h-px bg-[#C59B4E]/25" />
                <div className="flex items-center justify-between gap-2 text-xs font-label">
                  <span className="uppercase tracking-[0.12em] text-[#1F1316]/70 font-semibold shrink-0">
                    Venue GPS
                  </span>
                  <span className="font-semibold text-[#9A6F2B] inline-flex items-center gap-1 text-right">
                    <MapPin className="w-3 h-3 text-[#A61229] shrink-0" />
                    {SITE_CONFIG.event.venueName}, Bhiwandi
                  </span>
                </div>
              </div>

              {lockMessage && (
                <p role="status" className="mt-3 font-body italic text-xs font-medium text-[#A61229] leading-snug max-w-[275px]">
                  {lockMessage}
                </p>
              )}

              <button
                type="button"
                onClick={() => verifyVenueAndUnlock(false)}
                disabled={checkingLock}
                className="mt-4 w-full min-h-[46px] px-5 py-2.5 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-xs font-semibold tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 border border-[#C59B4E]/45 shadow-[0_10px_24px_rgba(166,18,41,0.3)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#E6C37E]" />
                {checkingLock ? 'CHECKING LOCATION...' : 'VERIFY LOCATION & UNLOCK'}
              </button>
            </div>
          ) : heroPass ? (
            <motion.div
              key="pledge-pass"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 w-full"
            >
              {/* PURE CERTIFICATE DESIGN — ZERO editing buttons or icons inside */}
              <div className="relative rounded-3xl bg-[#FAF2E3] border-[3px] border-[#C59B4E] p-1.5 shadow-[0_20px_48px_rgba(110,7,23,0.22)] text-center overflow-hidden">
                {/* Softly blended uploaded photo backdrop across entire certificate */}
                {backdropPhotoUrl && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    <img
                      src={backdropPhotoUrl}
                      alt=""
                      className="w-full h-full object-cover object-center scale-105"
                      style={{
                        opacity: lum < 0.25 ? 0.52 : 0.42,
                        filter: `blur(5px) saturate(1.18) brightness(${certBlurBrightness})`,
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(180deg, rgba(252,244,226,0.56) 0%, rgba(${glowRgb},0.26) 28%, rgba(250,242,227,0.68) 56%, rgba(248,237,216,0.84) 100%)`,
                      }}
                    />
                  </div>
                )}

                {/* Golden sunlit top-left flare & warm glow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(circle at 12% 8%, rgba(255,248,218,0.72) 0%, rgba(${glowRgb},0.28) 34%, transparent 64%), radial-gradient(circle at 50% 40%, rgba(255,244,210,0.38) 0%, transparent 65%)`,
                  }}
                />

                <div className="relative z-10 border border-[#C59B4E]/60 rounded-[20px] px-4 py-5 flex flex-col items-center">
                  <p className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A6F2B]">
                    {SITE_CONFIG.brand.title}
                  </p>
                  <h3 className="mt-1 font-display text-[1.55rem] sm:text-[1.72rem] font-bold text-[#8C0D1F] tracking-tight leading-tight">
                    {SITE_CONFIG.pledge.passTitle}
                  </h3>
                  <p className="mt-0.5 font-body italic text-xs font-medium text-[#9E1428]">
                    Certificate of Honour
                  </p>

                  {/* Crystal-clear portrait inside double gold ring — NO icons/buttons */}
                  <div className="my-3.5 relative flex items-center justify-center">
                    {photoDataUrl ? (
                      <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-[#F7E1A0] via-[#C59B4E] to-[#9A6F2B] shadow-[0_10px_28px_rgba(197,155,78,0.45)]">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#FAF5EB] bg-[#1F1316]">
                          <img
                            src={photoDataUrl}
                            alt={heroPass.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <GlossyBloodDrop size={46} />
                    )}
                  </div>

                  <p className="font-display text-2xl font-bold text-[#1F1316] break-words leading-tight">
                    {heroPass.name}
                  </p>
                  <p className="mt-0.5 font-display text-3xl font-bold text-[#A61229]">
                    {heroPass.bloodGroup}
                  </p>

                  <p className="mt-2.5 font-body italic text-sm text-[#1F1316]/90 leading-snug max-w-[280px]">
                    {SITE_CONFIG.pledge.storyQuote}
                  </p>

                  <div className="mt-3.5 grid grid-cols-3 gap-2 w-full">
                    <div className="rounded-xl bg-[#FAF3E0]/90 border border-[#C59B4E]/65 px-1.5 py-2 shadow-sm">
                      <p className="font-display text-sm font-bold text-[#A61229]">3 Lives</p>
                      <p className="font-label text-[9px] font-bold uppercase tracking-wider text-[#1F1316]/80">
                        Saved
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FAF3E0]/90 border border-[#C59B4E]/65 px-1.5 py-2 shadow-sm">
                      <p className="font-display text-sm font-bold text-[#A61229]">Sadqah</p>
                      <p className="font-label text-[9px] font-bold uppercase tracking-wider text-[#1F1316]/80">
                        &amp; Duas
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FAF3E0]/90 border border-[#C59B4E]/65 px-1.5 py-2 shadow-sm">
                      <p className="font-display text-sm font-bold text-[#A61229]">Hero</p>
                      <p className="font-label text-[9px] font-bold uppercase tracking-wider text-[#1F1316]/80">
                        2026
                      </p>
                    </div>
                  </div>

                  {/* Golden Heartbeat-Heart Divider matching certificate reference */}
                  <div className="my-3.5 flex items-center justify-center w-full max-w-[260px]" aria-hidden="true">
                    <svg viewBox="0 0 260 28" fill="none" className="w-full h-6">
                      <line x1="0" y1="14" x2="104" y2="14" stroke="#C59B4E" strokeOpacity="0.65" strokeWidth="1.2" />
                      <line x1="156" y1="14" x2="260" y2="14" stroke="#C59B4E" strokeOpacity="0.65" strokeWidth="1.2" />
                      <polygon points="108,10 112,14 108,18 104,14" fill="#D4A853" />
                      <polygon points="152,10 156,14 152,18 148,14" fill="#D4A853" />
                      <path
                        d="M130 24C130 24 142 15.5 141 7.5C140.4 3.4 136.8 1.5 133.5 2.5C131.5 3.1 130.5 4.8 130 6.2C129.5 4.8 128.5 3.1 126.5 2.5C123.2 1.5 119.6 3.4 119 7.5C118 15.5 130 24 130 24Z"
                        fill="#C59B4E"
                      />
                      <path
                        d="M122.5 11.5H126L127.8 8L129.8 15.5L131.8 6.8L133.5 13L135.2 11.5H137.5"
                        stroke="#FAF5EB"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="font-body italic text-xs text-[#1F1316]/90 max-w-[270px]">
                    “Whoever saves one life, saves all mankind.” (Qur’an · 5:32)
                  </p>
                  <p className="mt-2 font-label text-[10px] font-bold tracking-[0.11em] uppercase text-[#9A6F2B] leading-snug">
                    6 Dec 2026 · {SITE_CONFIG.event.venueFullName}, Bhiwandi
                  </p>
                </div>
              </div>

              <p className="mt-2.5 font-body italic text-sm text-[#1F1316]/75">
                {SITE_CONFIG.pledge.storyHint}
              </p>

              {/* Controls OUTSIDE the certificate card */}
              <div className="mt-3 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleDownloadStory}
                  disabled={downloading}
                  className="w-full min-h-[46px] px-6 py-2.5 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-xs font-semibold tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 border border-[#C59B4E]/45 shadow-[0_10px_24px_rgba(166,18,41,0.3)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#E6C37E]" />
                  {downloading ? 'PREPARING CERTIFICATE...' : SITE_CONFIG.pledge.downloadPassButton}
                </button>

                {/* Direct Story Share Options: WhatsApp, Instagram, Facebook */}
                <div className="rounded-2xl bg-[#FAF5EB]/90 border border-[#C59B4E]/45 px-3 py-2.5 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareStory('whatsapp')}
                      aria-label="Share your story on WhatsApp"
                      className="min-h-[58px] px-2 py-2 rounded-xl bg-white/90 border border-[#C59B4E]/35 flex flex-col items-center justify-center gap-1 hover:border-[#25D366] hover:bg-white active:scale-95 transition-all cursor-pointer"
                    >
                      <WhatsAppStoryIcon />
                      <span className="font-label text-[10px] font-semibold text-[#1F1316] whitespace-nowrap">
                        WhatsApp
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareStory('instagram')}
                      aria-label="Share your story on Instagram"
                      className="min-h-[58px] px-2 py-2 rounded-xl bg-white/90 border border-[#C59B4E]/35 flex flex-col items-center justify-center gap-1 hover:border-[#DD2A7B] hover:bg-white active:scale-95 transition-all cursor-pointer"
                    >
                      <InstagramStoryIcon />
                      <span className="font-label text-[10px] font-semibold text-[#1F1316] whitespace-nowrap">
                        Instagram
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareStory('facebook')}
                      aria-label="Share your story on Facebook"
                      className="min-h-[58px] px-2 py-2 rounded-xl bg-white/90 border border-[#C59B4E]/35 flex flex-col items-center justify-center gap-1 hover:border-[#1877F2] hover:bg-white active:scale-95 transition-all cursor-pointer"
                    >
                      <FacebookStoryIcon />
                      <span className="font-label text-[10px] font-semibold text-[#1F1316] whitespace-nowrap">
                        Facebook
                      </span>
                    </button>
                  </div>

                  <p className="mt-2 font-label text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A6F2B]">
                    {SITE_CONFIG.pledge.shareStoryLabel}
                  </p>

                  {shareNote && (
                    <p className="mt-1 font-body italic text-xs text-[#A61229]">
                      {shareNote}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(rawPhotoDataUrl || photoDataUrl) && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingRawUrl(rawPhotoDataUrl || photoDataUrl);
                          setCropModalOpen(true);
                        }}
                        className="min-h-[36px] font-label text-[10px] font-semibold tracking-[0.15em] uppercase text-[#A61229] hover:text-[#6E0717] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        Adjust Photo
                      </button>
                      <span className="text-[#C59B4E]/60" aria-hidden="true">·</span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[36px] font-label text-[10px] font-semibold tracking-[0.15em] uppercase text-[#9A6F2B] hover:text-[#A61229] transition-colors cursor-pointer"
                  >
                    Change Photo
                  </button>
                  <span className="text-[#C59B4E]/60" aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setHeroPass(null);
                      setShareNote(null);
                      setName('');
                      setPhone('');
                      setPhotoDataUrl(null);
                      setRawPhotoDataUrl(null);
                      setPendingRawUrl(null);
                    }}
                    className="min-h-[36px] font-label text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1F1316]/65 hover:text-[#A61229] transition-colors cursor-pointer"
                  >
                    {SITE_CONFIG.pledge.pledgeAnotherButton}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-3 w-full rounded-3xl bg-[#FAF5EB]/90 backdrop-blur-[2px] border border-[#C59B4E]/50 p-4 shadow-[0_14px_34px_rgba(31,19,22,0.08)] flex flex-col gap-2.5 text-left"
              noValidate
            >
              {renderFormSelfieControls()}

              {/* Side-by-side Name & Phone on mobile so Blood Group stays comfortably in view without scrolling */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="pledge-name"
                    className="block font-label text-[10px] font-semibold tracking-[0.14em] uppercase text-[#1F1316]/75 mb-1 text-center"
                  >
                    {SITE_CONFIG.pledge.nameLabel}
                  </label>
                  <input
                    id="pledge-name"
                    type="text"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={SITE_CONFIG.pledge.namePlaceholder}
                    className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white/90 border border-[#C59B4E]/40 text-[#1F1316] placeholder:text-[#1F1316]/40 font-body text-sm sm:text-base text-center focus:outline-none focus:border-[#A61229] focus:ring-2 focus:ring-[#A61229]/20 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pledge-phone"
                    className="block font-label text-[10px] font-semibold tracking-[0.14em] uppercase text-[#1F1316]/75 mb-1 text-center"
                  >
                    {SITE_CONFIG.pledge.phoneLabel}
                  </label>
                  <input
                    id="pledge-phone"
                    type="tel"
                    required
                    maxLength={24}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={SITE_CONFIG.pledge.phonePlaceholder}
                    className="w-full min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white/90 border border-[#C59B4E]/40 text-[#1F1316] placeholder:text-[#1F1316]/40 font-body text-sm sm:text-base text-center focus:outline-none focus:border-[#A61229] focus:ring-2 focus:ring-[#A61229]/20 transition-all"
                  />
                </div>
              </div>

              <div ref={bloodDropdownRef} className="relative">
                <span className="block font-label text-[10px] font-semibold tracking-[0.16em] uppercase text-[#1F1316]/75 mb-1 text-center">
                  {SITE_CONFIG.pledge.bloodGroupLabel}
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setBloodMenuOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={bloodMenuOpen}
                  className="w-full min-h-[40px] px-4 py-1.5 rounded-xl bg-white/90 border border-[#C59B4E]/45 text-[#1F1316] font-label text-xs font-semibold tracking-[0.12em] uppercase inline-flex items-center justify-between hover:border-[#A61229]/60 focus:outline-none focus:border-[#A61229] transition-all cursor-pointer"
                >
                  <span className="w-4" aria-hidden="true" />
                  <span className="text-[#A61229] text-sm font-bold tracking-[0.08em]">
                    {bloodGroup}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9A6F2B] transition-transform duration-200 ${
                      bloodMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {bloodMenuOpen && (
                    <motion.div
                      role="listbox"
                      aria-label={SITE_CONFIG.pledge.bloodGroupLabel}
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      onWheel={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      style={{ WebkitOverflowScrolling: 'touch' }}
                      className="absolute left-0 right-0 bottom-full mb-1.5 z-50 rounded-2xl bg-[#FAF5EB] border border-[#C59B4E] shadow-[0_18px_40px_rgba(31,19,22,0.26)] p-1.5 max-h-[168px] overflow-y-auto overscroll-contain touch-pan-y"
                    >
                      {SITE_CONFIG.pledge.bloodGroups.map((bg) => {
                        const selected = bloodGroup === bg;
                        return (
                          <button
                            key={bg}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setBloodGroup(bg);
                              setBloodMenuOpen(false);
                            }}
                            className={`w-full min-h-[34px] px-3 py-1 rounded-xl font-label text-xs font-semibold tracking-[0.1em] flex items-center justify-between transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[#A61229] text-[#FAF5EB]'
                                : 'text-[#1F1316] hover:bg-[#EFE6D5]'
                            }`}
                          >
                            <span>{bg}</span>
                            {selected && <Check className="w-3.5 h-3.5 text-[#E6C37E]" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {errorMsg && (
                <p role="alert" className="text-center font-body text-sm font-semibold text-[#A61229]">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-0.5 w-full min-h-[44px] px-6 py-2 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-xs font-semibold tracking-[0.2em] uppercase border border-[#C59B4E]/45 shadow-[0_10px_24px_rgba(166,18,41,0.3)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
              >
                {submitting ? SITE_CONFIG.pledge.submittingButton : SITE_CONFIG.pledge.submitButton}
              </button>
            </form>
          )}
        </div>
      </DiaryLine>

      <PhotoCropModal
        isOpen={cropModalOpen}
        rawPhotoUrl={pendingRawUrl}
        initialCrop={cropState}
        onCancel={() => setCropModalOpen(false)}
        onApply={(croppedUrl, nextCrop) => {
          setPhotoDataUrl(croppedUrl);
          setCropState(nextCrop);
          setCropModalOpen(false);
        }}
      />
    </div>
  );
}
