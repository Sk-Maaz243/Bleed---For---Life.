import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '../config';
import { GlossyBloodDrop } from './SvgArtwork';

interface OpenSplashProps {
  mode?: 'open' | 'close';
  onBeforeOpenAudio: () => void;
  onCurtainStart?: () => void;
  onOpened: () => void;
  onReopen?: () => void;
}

// Consistent 1-to-1 SVG cubic-bezier path topology so Framer Motion morphs smoothly at 60fps
const LEFT_CURTAIN_CLOSED =
  'M 0 0 L 241 0 C 241 210, 241 350, 241 422 C 241 498, 241 650, 241 844 L 0 844 Z';
const LEFT_CURTAIN_DIAMOND =
  'M 0 0 L 238 0 C 234 210, 174 352, 174 422 C 174 494, 234 645, 238 844 L 0 844 Z';
const LEFT_CURTAIN_TIEBACK =
  'M 0 0 L 166 0 C 134 210, 52 350, 52 422 C 52 500, 92 652, 112 844 L 0 844 Z';
const LEFT_CURTAIN_GATHERED =
  'M 0 0 L 62 0 C 42 210, 8 350, 8 422 C 8 500, 18 652, 26 844 L 0 844 Z';
const LEFT_CURTAIN_OPEN =
  'M 0 0 L 0 0 C 0 210, 0 350, 0 422 C 0 500, 0 652, 0 844 L 0 844 Z';

const LEFT_TRIM_CLOSED =
  'M 241 0 C 241 210, 241 350, 241 422 C 241 498, 241 650, 241 844';
const LEFT_TRIM_DIAMOND =
  'M 238 0 C 234 210, 174 352, 174 422 C 174 494, 234 645, 238 844';
const LEFT_TRIM_TIEBACK =
  'M 166 0 C 134 210, 52 350, 52 422 C 52 500, 92 652, 112 844';
const LEFT_TRIM_GATHERED =
  'M 62 0 C 42 210, 8 350, 8 422 C 8 500, 18 652, 26 844';
const LEFT_TRIM_OPEN =
  'M 0 0 C 0 210, 0 350, 0 422 C 0 500, 0 652, 0 844';

const RIGHT_CURTAIN_CLOSED =
  'M 480 0 L 239 0 C 239 210, 239 350, 239 422 C 239 498, 239 650, 239 844 L 480 844 Z';
const RIGHT_CURTAIN_DIAMOND =
  'M 480 0 L 242 0 C 246 210, 306 352, 306 422 C 306 494, 246 645, 242 844 L 480 844 Z';
const RIGHT_CURTAIN_TIEBACK =
  'M 480 0 L 314 0 C 346 210, 428 350, 428 422 C 428 500, 388 652, 368 844 L 480 844 Z';
const RIGHT_CURTAIN_GATHERED =
  'M 480 0 L 418 0 C 438 210, 472 350, 472 422 C 472 500, 462 652, 454 844 L 480 844 Z';
const RIGHT_CURTAIN_OPEN =
  'M 480 0 L 480 0 C 480 210, 480 350, 480 422 C 480 500, 480 652, 480 844 L 480 844 Z';

const RIGHT_TRIM_CLOSED =
  'M 239 0 C 239 210, 239 350, 239 422 C 239 498, 239 650, 239 844';
const RIGHT_TRIM_DIAMOND =
  'M 242 0 C 246 210, 306 352, 306 422 C 306 494, 246 645, 242 844';
const RIGHT_TRIM_TIEBACK =
  'M 314 0 C 346 210, 428 350, 428 422 C 428 500, 388 652, 368 844';
const RIGHT_TRIM_GATHERED =
  'M 418 0 C 438 210, 472 350, 472 422 C 472 500, 462 652, 454 844';
const RIGHT_TRIM_OPEN =
  'M 480 0 C 480 210, 480 350, 480 422 C 480 500, 480 652, 480 844';

export function OpenSplash({
  mode = 'open',
  onBeforeOpenAudio,
  onCurtainStart,
  onOpened,
  onReopen,
}: OpenSplashProps) {
  const [phase, setPhase] = useState<
    'idle' | 'dropping' | 'splashing' | 'curtain' | 'done' | 'closing' | 'sealed'
  >(() => (mode === 'close' ? 'closing' : 'idle'));
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (mode !== 'close') return;
    clearTimers();
    setPhase('closing');

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('sealed');
      }, 2800)
    );
  }, [mode]);

  const handleTapToOpen = () => {
    if (phase !== 'idle' && phase !== 'sealed') return;

    if (phase === 'sealed') {
      onReopen?.();
    }

    onBeforeOpenAudio();
    clearTimers();
    setPhase('dropping');

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('splashing');
      }, 1120)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('curtain');
      }, 1680)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        onCurtainStart?.();
      }, 2450)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('done');
        onOpened();
      }, 5250)
    );
  };

  if (phase === 'done') return null;

  const isCurtainOpening = phase === 'curtain';
  const isClosingOrSealed = phase === 'closing' || phase === 'sealed';
  const isClosedLook =
    phase === 'idle' || phase === 'dropping' || phase === 'splashing' || phase === 'sealed';

  const slowOpenTransition = {
    duration: 3.55,
    times: [0, 0.24, 0.56, 0.85, 1],
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const slowCloseTransition = {
    duration: 2.75,
    times: [0, 0.18, 0.5, 0.82, 1],
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const activeTransition = isClosingOrSealed ? slowCloseTransition : slowOpenTransition;

  const getLeftCurtainAnim = () => {
    if (isCurtainOpening) {
      return [
        LEFT_CURTAIN_CLOSED,
        LEFT_CURTAIN_DIAMOND,
        LEFT_CURTAIN_TIEBACK,
        LEFT_CURTAIN_GATHERED,
        LEFT_CURTAIN_OPEN,
      ];
    }
    if (phase === 'closing') {
      return [
        LEFT_CURTAIN_OPEN,
        LEFT_CURTAIN_GATHERED,
        LEFT_CURTAIN_TIEBACK,
        LEFT_CURTAIN_DIAMOND,
        LEFT_CURTAIN_CLOSED,
      ];
    }
    return LEFT_CURTAIN_CLOSED;
  };

  const getLeftTrimAnim = () => {
    if (isCurtainOpening) {
      return [
        LEFT_TRIM_CLOSED,
        LEFT_TRIM_DIAMOND,
        LEFT_TRIM_TIEBACK,
        LEFT_TRIM_GATHERED,
        LEFT_TRIM_OPEN,
      ];
    }
    if (phase === 'closing') {
      return [
        LEFT_TRIM_OPEN,
        LEFT_TRIM_GATHERED,
        LEFT_TRIM_TIEBACK,
        LEFT_TRIM_DIAMOND,
        LEFT_TRIM_CLOSED,
      ];
    }
    return LEFT_TRIM_CLOSED;
  };

  const getRightCurtainAnim = () => {
    if (isCurtainOpening) {
      return [
        RIGHT_CURTAIN_CLOSED,
        RIGHT_CURTAIN_DIAMOND,
        RIGHT_CURTAIN_TIEBACK,
        RIGHT_CURTAIN_GATHERED,
        RIGHT_CURTAIN_OPEN,
      ];
    }
    if (phase === 'closing') {
      return [
        RIGHT_CURTAIN_OPEN,
        RIGHT_CURTAIN_GATHERED,
        RIGHT_CURTAIN_TIEBACK,
        RIGHT_CURTAIN_DIAMOND,
        RIGHT_CURTAIN_CLOSED,
      ];
    }
    return RIGHT_CURTAIN_CLOSED;
  };

  const getRightTrimAnim = () => {
    if (isCurtainOpening) {
      return [
        RIGHT_TRIM_CLOSED,
        RIGHT_TRIM_DIAMOND,
        RIGHT_TRIM_TIEBACK,
        RIGHT_TRIM_GATHERED,
        RIGHT_TRIM_OPEN,
      ];
    }
    if (phase === 'closing') {
      return [
        RIGHT_TRIM_OPEN,
        RIGHT_TRIM_GATHERED,
        RIGHT_TRIM_TIEBACK,
        RIGHT_TRIM_DIAMOND,
        RIGHT_TRIM_CLOSED,
      ];
    }
    return RIGHT_TRIM_CLOSED;
  };

  return (
    <div
      onClick={handleTapToOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTapToOpen();
        }
      }}
      aria-label={phase === 'sealed' ? 'Tap to reopen invitation' : 'Tap to open invitation'}
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-between select-none overflow-hidden ${
        phase === 'idle' || phase === 'sealed' ? 'cursor-pointer' : 'pointer-events-none'
      }`}
    >
      {/* Warm sunlit cream silk backing behind curtains */}
      <motion.div
        initial={{ opacity: mode === 'close' ? 0 : 1 }}
        animate={{
          opacity: isCurtainOpening ? 0 : phase === 'closing' ? [0, 0, 1] : 1,
        }}
        transition={
          phase === 'closing'
            ? { duration: 2.75, times: [0, 0.72, 1], ease: 'easeIn' }
            : { duration: 0.85, delay: isCurtainOpening ? 0.35 : 0, ease: 'easeOut' }
        }
        className="pointer-events-none absolute inset-0 bg-[#F4EAD7]"
        aria-hidden="true"
      />

      {/* SLOW-MOTION ROYAL CREAM SILK & ANTIQUE GOLD PLEATED CURTAINS */}
      <motion.svg
        viewBox="0 0 480 844"
        preserveAspectRatio="none"
        initial={{ opacity: mode === 'close' ? 0.15 : 1 }}
        animate={{
          opacity: isCurtainOpening ? 0 : phase === 'closing' ? [0.15, 1, 1] : 1,
        }}
        transition={
          phase === 'closing'
            ? { duration: 0.65, ease: 'easeOut' }
            : { duration: 0.65, delay: isCurtainOpening ? 2.95 : 0, ease: 'easeOut' }
        }
        className="pointer-events-none absolute inset-0 w-full h-full z-10"
        aria-hidden="true"
      >
        <defs>
          <pattern id="creamSilkPleats" width="44" height="844" patternUnits="userSpaceOnUse">
            <rect width="44" height="844" fill="#EFE4CE" />
            <rect x="0" y="0" width="44" height="844" fill="url(#creamPleatFoldShade)" />
          </pattern>

          <linearGradient id="creamPleatFoldShade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CEB78F" stopOpacity="0.92" />
            <stop offset="22%" stopColor="#F5ECE0" stopOpacity="0.95" />
            <stop offset="46%" stopColor="#FFFBF4" stopOpacity="0.98" />
            <stop offset="58%" stopColor="#E6D2AE" stopOpacity="0.65" />
            <stop offset="78%" stopColor="#EFE3CE" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#C8B086" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="creamCurtainHeightShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B89B6B" stopOpacity="0.28" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.24" />
            <stop offset="78%" stopColor="#E6C37E" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#A68B5B" stopOpacity="0.32" />
          </linearGradient>

          <linearGradient id="creamValanceRoyalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DFCFAF" />
            <stop offset="48%" stopColor="#F7EFE2" />
            <stop offset="90%" stopColor="#EFE2CA" />
            <stop offset="100%" stopColor="#C59B4E" />
          </linearGradient>

          <filter id="creamCurtainSoftShadow" x="-10%" y="-5%" width="120%" height="110%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#4E3818" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* LEFT CREAM SILK CURTAIN PANEL */}
        <g filter="url(#creamCurtainSoftShadow)">
          <motion.path
            d={mode === 'close' && phase === 'closing' ? LEFT_CURTAIN_OPEN : LEFT_CURTAIN_CLOSED}
            animate={{ d: getLeftCurtainAnim() }}
            transition={activeTransition}
            fill="url(#creamSilkPleats)"
          />
          <motion.path
            d={mode === 'close' && phase === 'closing' ? LEFT_CURTAIN_OPEN : LEFT_CURTAIN_CLOSED}
            animate={{ d: getLeftCurtainAnim() }}
            transition={activeTransition}
            fill="url(#creamCurtainHeightShade)"
          />
          <motion.path
            d={mode === 'close' && phase === 'closing' ? LEFT_TRIM_OPEN : LEFT_TRIM_CLOSED}
            animate={{ d: getLeftTrimAnim() }}
            transition={activeTransition}
            fill="none"
            stroke="#C59B4E"
            strokeWidth="4.5"
          />
          <motion.path
            d={mode === 'close' && phase === 'closing' ? LEFT_TRIM_OPEN : LEFT_TRIM_CLOSED}
            animate={{ d: getLeftTrimAnim() }}
            transition={activeTransition}
            fill="none"
            stroke="#8C0D1F"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="0.1 15"
          />
        </g>

        {/* RIGHT CREAM SILK CURTAIN PANEL */}
        <g filter="url(#creamCurtainSoftShadow)">
          <motion.path
            d={mode === 'close' && phase === 'closing' ? RIGHT_CURTAIN_OPEN : RIGHT_CURTAIN_CLOSED}
            animate={{ d: getRightCurtainAnim() }}
            transition={activeTransition}
            fill="url(#creamSilkPleats)"
          />
          <motion.path
            d={mode === 'close' && phase === 'closing' ? RIGHT_CURTAIN_OPEN : RIGHT_CURTAIN_CLOSED}
            animate={{ d: getRightCurtainAnim() }}
            transition={activeTransition}
            fill="url(#creamCurtainHeightShade)"
          />
          <motion.path
            d={mode === 'close' && phase === 'closing' ? RIGHT_TRIM_OPEN : RIGHT_TRIM_CLOSED}
            animate={{ d: getRightTrimAnim() }}
            transition={activeTransition}
            fill="none"
            stroke="#C59B4E"
            strokeWidth="4.5"
          />
          <motion.path
            d={mode === 'close' && phase === 'closing' ? RIGHT_TRIM_OPEN : RIGHT_TRIM_CLOSED}
            animate={{ d: getRightTrimAnim() }}
            transition={activeTransition}
            fill="none"
            stroke="#8C0D1F"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="0.1 15"
          />
        </g>

        {/* LEFT WAIST TASSEL (Crimson & Antique Gold) */}
        <motion.g
          initial={{ x: mode === 'close' ? 0 : 241, y: 422, opacity: 0.95 }}
          animate={
            isCurtainOpening
              ? {
                  x: [241, 174, 52, 8, 0],
                  y: [422, 422, 422, 422, 422],
                  opacity: [0.95, 1, 1, 0.85, 0],
                }
              : phase === 'closing'
                ? {
                    x: [0, 8, 52, 174, 241],
                    y: [422, 422, 422, 422, 422],
                    opacity: [0, 0.85, 1, 1, 0.95],
                  }
                : { x: 241, y: 422, opacity: 0.95 }
          }
          transition={activeTransition}
        >
          <circle cx="-6" cy="0" r="7" fill="#C59B4E" stroke="#6E0717" strokeWidth="2" />
          <path d="M-12 5 L-2 5 L0 38 Q-7 44 -14 38 Z" fill="#A61229" stroke="#C59B4E" strokeWidth="1.2" />
          <rect x="-11" y="5" width="8" height="5" rx="2" fill="#E6C37E" />
        </motion.g>

        {/* RIGHT WAIST TASSEL (Crimson & Antique Gold) */}
        <motion.g
          initial={{ x: mode === 'close' ? 480 : 239, y: 422, opacity: 0.95 }}
          animate={
            isCurtainOpening
              ? {
                  x: [239, 306, 428, 472, 480],
                  y: [422, 422, 422, 422, 422],
                  opacity: [0.95, 1, 1, 0.85, 0],
                }
              : phase === 'closing'
                ? {
                    x: [480, 472, 428, 306, 239],
                    y: [422, 422, 422, 422, 422],
                    opacity: [0, 0.85, 1, 1, 0.95],
                  }
                : { x: 239, y: 422, opacity: 0.95 }
          }
          transition={activeTransition}
        >
          <circle cx="6" cy="0" r="7" fill="#C59B4E" stroke="#6E0717" strokeWidth="2" />
          <path d="M2 5 L12 5 L14 38 Q7 44 0 38 Z" fill="#A61229" stroke="#C59B4E" strokeWidth="1.2" />
          <rect x="3" y="5" width="8" height="5" rx="2" fill="#E6C37E" />
        </motion.g>

        {/* TOP SCALLOPED CREAM & GOLD VALANCE SWAGS */}
        <motion.g
          initial={{ y: mode === 'close' ? -55 : -10, opacity: mode === 'close' ? 0 : 0.98 }}
          animate={
            isCurtainOpening
              ? { y: [0, 0, -4, -55], opacity: [0.98, 1, 0.95, 0] }
              : phase === 'closing'
                ? { y: [-55, -8, 0, -6], opacity: [0, 0.9, 1, 0.98] }
                : { y: -10, opacity: 0.98 }
          }
          transition={
            phase === 'closing'
              ? { duration: 2.75, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }
              : { duration: 3.55, times: [0, 0.65, 0.85, 1], ease: 'easeInOut' }
          }
        >
          <path
            d="M0 0 L480 0 L480 42 Q420 94 360 44 Q300 98 240 46 Q180 98 120 44 Q60 94 0 42 Z"
            fill="url(#creamValanceRoyalGrad)"
            stroke="#C59B4E"
            strokeWidth="2.5"
          />
          <path
            d="M0 36 Q60 88 120 38 Q180 92 240 40 Q300 92 360 38 Q420 88 480 36"
            fill="none"
            stroke="#8C0D1F"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0.1 14"
          />
        </motion.g>
      </motion.svg>

      {/* Soft sunlit golden center halo */}
      <motion.div
        animate={{ opacity: isClosedLook ? 1 : 0 }}
        transition={{ duration: 0.45 }}
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,250,240,0.48) 0%, rgba(244,234,215,0.12) 55%, rgba(186,154,104,0.28) 100%)',
        }}
        aria-hidden="true"
      />

      {/* CLEAN FOREGROUND SPLASH CONTENT (No extra closing clutter) */}
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-between px-6 py-16">
        <motion.div
          animate={{ opacity: phase === 'idle' || phase === 'sealed' ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center text-center pt-5"
        >
          <p
            dir="rtl"
            lang="ar"
            className="text-base sm:text-lg font-semibold text-[#8C6422] tracking-normal"
          >
            {SITE_CONFIG.brand.bismillah}
          </p>
          <div className="mt-2.5 h-px w-14 bg-[#C59B4E]/75" />
        </motion.div>

        {/* Center Drop + Gold Pulse Rings */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          <motion.div
            animate={{
              scale: phase === 'idle' || phase === 'sealed' ? [1, 1.32, 1] : 1,
              opacity: phase === 'idle' || phase === 'sealed' ? [0.55, 0.14, 0.55] : 0,
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute w-56 h-56 rounded-full border border-[#C59B4E]/75"
          />
          <motion.div
            animate={{
              scale: phase === 'idle' || phase === 'sealed' ? [0.85, 1.15, 0.85] : 1,
              opacity: phase === 'idle' || phase === 'sealed' ? [0.6, 0.2, 0.6] : 0,
            }}
            transition={{ duration: 2.8, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute w-40 h-40 rounded-full border border-[#A61229]/35"
          />

          <motion.div
            animate={{
              scale: phase === 'idle' || phase === 'sealed' ? [1, 1.08, 1] : 1,
              opacity: phase === 'idle' || phase === 'sealed' ? [0.42, 0.65, 0.42] : 0,
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(166,18,41,0.35) 0%, rgba(197,155,78,0.28) 52%, transparent 76%)' }}
          />

          <motion.div
            initial={{ y: 0, scale: 1, opacity: mode === 'close' ? 0 : 1 }}
            animate={
              phase === 'dropping'
                ? { y: '42vh', scale: [1, 0.94, 0.72], scaleY: [1, 1.16, 0.88], opacity: 1 }
                : phase === 'splashing' || phase === 'curtain'
                  ? { y: '45vh', scale: 0.25, opacity: 0 }
                  : phase === 'closing'
                    ? { y: 0, scale: 0.75, opacity: 0 }
                    : phase === 'sealed'
                      ? { y: 0, scale: 1, opacity: 1 }
                      : { y: [0, -8, 0], scale: 1, opacity: 1 }
            }
            transition={
              phase === 'idle'
                ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                : phase === 'dropping'
                  ? { duration: 1.12, ease: [0.35, 0, 0.25, 1] }
                  : { duration: 0.5, ease: 'easeOut' }
            }
            className="relative z-10 flex flex-col items-center"
          >
            <GlossyBloodDrop
              size={102}
              className="drop-shadow-[0_14px_26px_rgba(110,7,23,0.32)]"
            />
          </motion.div>
        </div>

        {/* Bottom TAP TO OPEN / TAP TO REOPEN pill */}
        <motion.div
          animate={{ opacity: phase === 'idle' || phase === 'sealed' ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pb-4 flex flex-col items-center text-center"
        >
          <span className="inline-flex items-center justify-center rounded-full border border-[#C59B4E] bg-gradient-to-b from-[#A61229] to-[#6E0717] px-8 py-3 font-label text-xs sm:text-sm font-semibold tracking-[0.26em] uppercase text-[#FAF5EB] shadow-[0_10px_28px_rgba(110,7,23,0.34)]">
            {phase === 'sealed' ? SITE_CONFIG.open.reopenPrompt : SITE_CONFIG.open.tapPrompt}
          </span>
        </motion.div>
      </div>

      {/* Slow-motion garnet & antique gold splash ripple */}
      {(phase === 'splashing' || phase === 'curtain') && (
        <motion.div
          initial={{ scale: 0, opacity: 0.94 }}
          animate={
            phase === 'curtain'
              ? { scale: 28, opacity: 0 }
              : { scale: 15, opacity: 0.88 }
          }
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute bottom-[7%] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full z-25"
          style={{
            background:
              'radial-gradient(circle, rgba(230,195,126,0.95) 0%, rgba(166,18,41,0.92) 48%, rgba(250,245,235,0.4) 100%)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
