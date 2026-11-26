import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { SITE_CONFIG } from '../config';
import { HeartbeatFooterWave } from './SvgArtwork';
import { DiaryLine } from './DiaryMotion';

interface SwirlParticle {
  angle: number;
  radius: number;
  angularVel: number;
  radialVel: number;
  size: number;
  alpha: number;
  color: string;
  kind: 'heart' | 'drop';
}

const SWIRL_COLORS = ['#A61229', '#C59B4E', '#FAF5EB', '#6E0717', '#DF223F'];

function HeartSwirlBlast({ blastKey }: { blastKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (blastKey <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = 360;
    const height = 360;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = width / 2;
    const cy = height / 2;

    const particles: SwirlParticle[] = Array.from({ length: 34 }, (_, idx) => {
      const baseAngle = (idx / 34) * Math.PI * 2;
      return {
        angle: baseAngle,
        radius: 12 + (idx % 3) * 8,
        angularVel: 0.095 + Math.random() * 0.045,
        radialVel: 2.2 + Math.random() * 2.0,
        size: 7 + Math.random() * 6,
        alpha: 1,
        color: SWIRL_COLORS[idx % SWIRL_COLORS.length],
        kind: idx % 3 === 0 ? 'drop' : 'heart',
      };
    });

    let rafId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = 0;

      for (const p of particles) {
        p.angle += p.angularVel;
        p.radius += p.radialVel;
        p.radialVel *= 0.985;
        p.alpha -= 0.015;

        if (p.alpha <= 0.01) continue;
        alive++;

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(x, y);
        ctx.rotate(p.angle + Math.PI / 2);
        ctx.fillStyle = p.color;

        const s = p.size * 0.52;
        if (p.kind === 'heart') {
          ctx.beginPath();
          ctx.moveTo(0, s);
          ctx.bezierCurveTo(s * 1.45, 0, s * 0.9, -s, 0, -s * 0.32);
          ctx.bezierCurveTo(-s * 0.9, -s, -s * 1.45, 0, 0, s);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.15);
          ctx.bezierCurveTo(s * 0.85, 0, s * 0.85, s * 0.95, 0, s * 0.95);
          ctx.bezierCurveTo(-s * 0.85, s * 0.95, -s * 0.85, 0, 0, -s * 1.15);
          ctx.fill();
        }
        ctx.restore();
      }

      if (alive > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [blastKey]);

  if (blastKey <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] z-30"
      aria-hidden="true"
    />
  );
}

interface FinalHeartSectionProps {
  onCloseInvitation?: () => void;
  onPromiseLocked?: () => void;
}

export function FinalHeartSection({
  onCloseInvitation,
  onPromiseLocked,
}: FinalHeartSectionProps) {
  const [committed, setCommitted] = useState(false);
  const [ropePulled, setRopePulled] = useState(false);
  const [blastKey, setBlastKey] = useState(0);

  const handleLockPromise = () => {
    if (committed) return;
    setCommitted(true);
    setBlastKey((k) => k + 1);
    onPromiseLocked?.();
  };

  const triggerRopeClose = () => {
    if (ropePulled) return;
    setRopePulled(true);
    window.setTimeout(() => {
      onCloseInvitation?.();
      window.setTimeout(() => setRopePulled(false), 1200);
    }, 380);
  };

  return (
    <div className="relative flex flex-col items-center justify-center text-center w-full max-w-[320px] mx-auto">
      <HeartSwirlBlast blastKey={blastKey} />

      {/* Direct Compact Ornamental Qur'an Quote Box */}
      <DiaryLine delay={0.08} className="w-full relative z-10">
        <div className="relative w-full rounded-[22px] bg-[#FAF5EB] text-[#1F1316] border-[1.5px] border-[#C59B4E] p-1.5 shadow-[0_20px_48px_rgba(110,7,23,0.42)]">
          {/* Corner antique gold filigree */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#C59B4E]/75 rounded-tl-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#C59B4E]/75 rounded-tr-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#C59B4E]/75 rounded-bl-sm"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#C59B4E]/75 rounded-br-sm"
          />

          <div className="rounded-[16px] border border-[#C59B4E]/40 px-4 py-4 flex flex-col items-center">
            {/* Delicate non-interactive heart emblem */}
            <svg
              width="24"
              height="22"
              viewBox="0 0 24 22"
              fill="none"
              aria-hidden="true"
              className="mb-1.5"
            >
              <path
                d="M12 20.5C12 20.5 22 13.6 22 6.8C22 3.3 19.2 1 16 1C14 1 12.6 2.1 12 3.4C11.4 2.1 10 1 8 1C4.8 1 2 3.3 2 6.8C2 13.6 12 20.5 12 20.5Z"
                fill="#A61229"
                stroke="#C59B4E"
                strokeWidth="1.2"
              />
            </svg>

            <span className="font-label text-[10px] font-semibold tracking-[0.22em] uppercase text-[#9A6F2B]">
              {SITE_CONFIG.final.pulseEyebrow}
            </span>

            <blockquote className="mt-2 font-display italic text-[17px] sm:text-lg font-medium text-[#1F1316] leading-snug text-balance">
              {SITE_CONFIG.final.quranQuote}
            </blockquote>

            <div className="my-2.5 h-px w-10 bg-[#C59B4E]/55" />

            <p className="font-label text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A61229]">
              {SITE_CONFIG.final.cardStamp}
            </p>

            <button
              type="button"
              onClick={handleLockPromise}
              className={`mt-3.5 w-full min-h-[44px] px-4 py-2 rounded-full font-label text-[11px] font-semibold tracking-[0.18em] uppercase inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                committed
                  ? 'bg-[#1F1316] text-[#E6C37E] border border-[#C59B4E]'
                  : 'bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] border border-[#C59B4E]/50 shadow-[0_8px_20px_rgba(166,18,41,0.28)] hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              {committed && <Check className="w-3.5 h-3.5 text-[#E6C37E]" />}
              {committed
                ? SITE_CONFIG.final.committedBadge
                : SITE_CONFIG.final.commitButton}
            </button>
          </div>
        </div>
      </DiaryLine>

      {/* Hanging Silk Pull-Rope (Rassi) directly visible underneath */}
      <DiaryLine delay={0.22} className="mt-5 flex flex-col items-center select-none relative z-10">
        <div className="w-4 h-4 rounded-full border-2 border-[#D8B168] bg-[#6E0717] shadow-[0_0_14px_rgba(197,155,78,0.55)]" />

        <motion.button
          type="button"
          drag="y"
          dragConstraints={{ top: 0, bottom: 44 }}
          dragElastic={0.22}
          dragSnapToOrigin
          onDragEnd={(_event, info) => {
            if (info.offset.y > 18 || info.velocity.y > 110) {
              triggerRopeClose();
            }
          }}
          onClick={triggerRopeClose}
          animate={
            ropePulled
              ? { y: 32, scaleY: 1.06 }
              : { y: [0, 4, 0] }
          }
          transition={
            ropePulled
              ? { type: 'spring', stiffness: 260, damping: 16 }
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
          aria-label={SITE_CONFIG.final.ropeHint}
          style={{ touchAction: 'none' }}
          className="group -mt-1 flex flex-col items-center cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8B168]"
        >
          <svg width="14" height="62" viewBox="0 0 14 62" fill="none" aria-hidden="true">
            <line x1="7" y1="0" x2="7" y2="62" stroke="#8A0E22" strokeWidth="5" />
            <line
              x1="7"
              y1="2"
              x2="7"
              y2="60"
              stroke="#E6C37E"
              strokeWidth="3.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          </svg>

          <div className="-mt-1 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-b from-[#FAF5EB] to-[#C59B4E] border-2 border-[#6E0717] shadow-[0_6px_16px_rgba(166,18,41,0.5)] group-hover:scale-110 transition-transform" />
            <div className="w-3.5 h-2 rounded-sm bg-[#A61229] border-y border-[#D8B168]/70" />
            <div className="w-5 h-8 rounded-b-full bg-gradient-to-b from-[#FAF5EB] via-[#E6C37E] to-[#A61229] shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex justify-evenly px-1 pt-1">
              <span className="w-px h-6 bg-[#5C0613]/45" />
              <span className="w-px h-6.5 bg-[#5C0613]/45" />
              <span className="w-px h-6 bg-[#5C0613]/45" />
            </div>
          </div>
        </motion.button>

        <p className="mt-2.5 font-label text-[11px] font-medium tracking-[0.18em] uppercase text-[#FAF5EB]/85">
          {ropePulled ? SITE_CONFIG.final.closingText : SITE_CONFIG.final.ropeHint}
        </p>
      </DiaryLine>

      <DiaryLine delay={0.34} className="w-full">
        <HeartbeatFooterWave variant="on-dark" className="mt-5" />
      </DiaryLine>

      <DiaryLine delay={0.42} className="w-full flex justify-center">
        <div className="mt-3 pt-3 border-t border-[#C59B4E]/22 w-full max-w-[240px]">
          <p className="font-body text-sm text-[#FAF5EB]/70">
            {SITE_CONFIG.final.footer}
          </p>
        </div>
      </DiaryLine>
    </div>
  );
}
