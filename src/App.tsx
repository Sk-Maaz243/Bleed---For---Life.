import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Copy, Check, Share2 } from 'lucide-react';
import { SITE_CONFIG } from './config';
import { extractPhotoAtmosphere, type PhotoAtmosphere } from './utils/photoAtmosphere';
import {
  DarkSectionDrops,
  HeartbeatFooterWave,
  HeartbeatLine,
  LightSectionAmbient,
  SectionDivider,
} from './components/SvgArtwork';
import { ConfettiBurst } from './components/ConfettiBurst';
import { MusicController, type MusicControllerHandle } from './components/MusicController';
import { OpenSplash } from './components/OpenSplash';
import { ImpactSection } from './components/ImpactSection';
import { ScratchDateCard } from './components/ScratchDateCard';
import { PledgeSection } from './components/PledgeSection';
import { FinalHeartSection } from './components/FinalHeartSection';
import { VintageScrollChrome } from './components/VintageScrollChrome';
import { DiaryLine, DiaryPage } from './components/DiaryMotion';

function SectionEnterTrigger({
  active,
  onEnter,
  children,
}: {
  active: boolean;
  onEnter: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const wasVisibleRef = useRef(false);
  const lastFiredRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !wasVisibleRef.current) {
            wasVisibleRef.current = true;
            const now = Date.now();
            if (now - lastFiredRef.current > 1200) {
              lastFiredRef.current = now;
              onEnter();
            }
          } else if (!entry.isIntersecting && entry.intersectionRatio < 0.1) {
            wasVisibleRef.current = false;
          }
        }
      },
      { threshold: [0.05, 0.42] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active, onEnter]);

  return <div ref={ref}>{children}</div>;
}

function NextPageArrow({
  targetId,
  variant = 'on-dark',
  label = 'Go to next page',
}: {
  targetId: string;
  variant?: 'on-dark' | 'on-cream';
  label?: string;
}) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isDark = variant === 'on-dark';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={label}
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
      className="mt-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B4E]"
    >
      <span
        className={`w-8 h-8 rounded-full inline-flex items-center justify-center border transition-all group-hover:scale-110 group-active:scale-95 ${
          isDark
            ? 'border-[#C59B4E]/45 bg-[#2A0810]/80 text-[#D8B168] group-hover:border-[#D8B168] group-hover:text-[#FAF5EB] shadow-[0_4px_14px_rgba(0,0,0,0.45)]'
            : 'border-[#C59B4E]/55 bg-[#EFE6D5] text-[#9A6F2B] group-hover:bg-[#A61229] group-hover:border-[#A61229] group-hover:text-[#FAF5EB] shadow-[0_4px_14px_rgba(110,7,23,0.1)]'
        }`}
      >
        <ChevronDown className="w-4 h-4" />
      </span>
    </motion.button>
  );
}

export default function App() {
  const [curtainMode, setCurtainMode] = useState<'open' | 'close' | null>('open');
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [sideConfettiKey, setSideConfettiKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [storyPhotoUrl, setStoryPhotoUrl] = useState<string | null>(null);
  const [photoAtmosphere, setPhotoAtmosphere] = useState<PhotoAtmosphere | null>(null);
  const musicRef = useRef<MusicControllerHandle | null>(null);

  const isOpened = curtainMode === null;

  useEffect(() => {
    document.body.style.overflow = isOpened ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpened]);

  useEffect(() => {
    let active = true;
    if (!storyPhotoUrl) {
      setPhotoAtmosphere(null);
      return;
    }
    extractPhotoAtmosphere(storyPhotoUrl).then((atmosphere) => {
      if (active) {
        setPhotoAtmosphere(atmosphere);
      }
    });
    return () => {
      active = false;
    };
  }, [storyPhotoUrl]);

  const lum = photoAtmosphere?.luminance ?? 0.45;
  const glowRgb = photoAtmosphere?.glowRgb ?? '230, 195, 126';
  const linenVeilAlpha = lum < 0.28 ? 0.82 : 0.75;

  const triggerConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1);
  }, []);

  const triggerSideCelebration = useCallback(() => {
    setSideConfettiKey((k) => k + 1);
  }, []);

  const handleBeforeOpenAudio = () => {
    musicRef.current?.playSyncFromGesture();
  };

  const siteUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : SITE_CONFIG.share.urlFallback;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${SITE_CONFIG.share.whatsappMessage} ${siteUrl}`
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = siteUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#120307] text-[#FAF5EB] relative overflow-x-hidden">
      {/* Desktop Velvet Garnet & Antique Gold backdrop */}
      <div
        className="pointer-events-none fixed inset-0 hidden sm:block overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[780px] h-[780px] rounded-full blur-[150px] opacity-30"
          style={{
            background: 'radial-gradient(circle, #A61229 0%, #6E0717 48%, transparent 72%)',
          }}
        />
        <div
          className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full blur-[160px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(230, 195, 126, 0.9) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Subtle archival texture */}
      <div
        className="film-grain pointer-events-none fixed inset-0 z-[55] opacity-[0.04]"
        aria-hidden="true"
      />

      {/* Confetti canvas */}
      <ConfettiBurst burstKey={confettiKey} sideBurstKey={sideConfettiKey} />

      {/* Persistent Music Audio & Bottom-Left Floating Button */}
      <MusicController ref={musicRef} />

      {/* OPEN / CLOSE CURTAINS (Slow-motion drop + Royal Burgundy & Gold parda) */}
      {curtainMode !== null && (
        <OpenSplash
          mode={curtainMode}
          onBeforeOpenAudio={handleBeforeOpenAudio}
          onCurtainStart={() => setHeroRevealed(true)}
          onOpened={() => {
            setHeroRevealed(true);
            setCurtainMode(null);
          }}
          onReopen={() => {
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
            setHeroRevealed(false);
          }}
        />
      )}

      {/* Royal Parchment Scroll Chrome when reading */}
      {isOpened && <VintageScrollChrome />}

      {/* Centered mobile-first 7-page invitation column */}
      <main className="relative z-10 w-full max-w-[480px] mx-auto min-h-screen bg-[#1C050A] shadow-[0_0_90px_rgba(0,0,0,0.9)] sm:border-x sm:border-[#C59B4E]/22">
        {/* PAGE 1: COVER (Velvet Garnet) */}
        <SectionEnterTrigger active={isOpened} onEnter={triggerSideCelebration}>
          <section
            id="hero-section"
            aria-label="Hero"
            className="snap-page relative z-10 min-h-[100svh] bg-gradient-to-b from-[#280810] via-[#1C050A] to-[#140307] text-[#FAF5EB] px-6 pt-10 pb-8 flex flex-col items-center justify-between text-center overflow-hidden"
          >
            <DarkSectionDrops />

            <div className="relative z-10 pt-2 flex flex-col items-center gap-1.5 text-[#D8B168]/90">
              <p
                dir="rtl"
                lang="ar"
                className="text-sm sm:text-base font-medium text-[#E6C37E] tracking-normal"
              >
                {SITE_CONFIG.brand.bismillah}
              </p>
              <div className="flex items-center gap-3 text-[#D8B168]/80">
                <span className="h-px w-8 bg-[#C59B4E]/60" />
                <span className="font-label text-[10px] font-medium tracking-[0.24em] uppercase">
                  2011 — 2026
                </span>
                <span className="h-px w-8 bg-[#C59B4E]/60" />
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full my-auto">
              <HeartbeatLine className="mb-8" />

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="font-label text-[10.5px] sm:text-xs font-medium tracking-[0.24em] uppercase text-[#D8B168]"
              >
                {SITE_CONFIG.brand.subtitle}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                transition={{ duration: 0.75, delay: 0.42 }}
                className="mt-3 font-display text-[2.15rem] sm:text-[2.65rem] font-semibold leading-[1.1] tracking-tight text-[#FAF5EB] text-balance"
              >
                {SITE_CONFIG.brand.title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={heroRevealed ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.6, delay: 0.68 }}
                className="my-5 h-px w-20 bg-gradient-to-r from-transparent via-[#C59B4E] to-transparent"
              />

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={{ duration: 0.7, delay: 0.85 }}
                className="font-body italic text-lg sm:text-xl text-[#FAF5EB]/90"
              >
                {SITE_CONFIG.brand.tagline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mt-7 flex items-center justify-center gap-2.5 text-[11px] font-label font-medium tracking-[0.18em] uppercase text-[#FAF5EB]/75 whitespace-nowrap"
              >
                <span>6 Dec 2026</span>
                <span className="text-[#D8B168]" aria-hidden="true">·</span>
                <span>Bhiwandi</span>
              </motion.div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center pt-4">
              <HeartbeatFooterWave variant="on-dark" />
              <NextPageArrow targetId="impact-section" variant="on-dark" label="Next: Wake Up" />
            </div>
          </section>
        </SectionEnterTrigger>

        {/* PAGE 2: THE REALITY CHECK (Warm Ivory Parchment) */}
        <SectionEnterTrigger active={isOpened} onEnter={triggerSideCelebration}>
          <section
            id="impact-section"
            className="snap-page relative z-10 min-h-[100svh] bg-[#FAF5EB] text-[#1F1316] px-6 pt-10 pb-8 flex flex-col items-center justify-between overflow-hidden"
          >
            <LightSectionAmbient />
            <DiaryPage className="relative z-10 my-auto">
              <ImpactSection />
            </DiaryPage>
            <div className="relative z-10 w-full flex flex-col items-center pt-4">
              <HeartbeatFooterWave variant="on-cream" />
              <NextPageArrow
                targetId="scratch-section"
                variant="on-cream"
                label="Next: Save the Date"
              />
            </div>
          </section>
        </SectionEnterTrigger>

        {/* PAGE 3: SCRATCH THE DATE, COUNTDOWN & GET DIRECTIONS (Warm Linen Parchment) */}
        <SectionEnterTrigger active={isOpened} onEnter={triggerSideCelebration}>
          <section
            id="scratch-section"
            className="snap-page relative z-10 min-h-[100svh] bg-[#EFE6D5] text-[#1F1316] px-6 pt-6 pb-5 flex flex-col items-center justify-between overflow-hidden border-t border-[#C59B4E]/35"
          >
            <LightSectionAmbient />
            <DiaryPage className="relative z-10 my-auto">
              <ScratchDateCard onRevealed={triggerConfetti} />
            </DiaryPage>
            <div className="relative z-10 w-full flex flex-col items-center pt-2">
              <HeartbeatFooterWave variant="on-cream" />
              <NextPageArrow
                targetId="story-section"
                variant="on-cream"
                label="Next: Surprise for Story on Event Day"
              />
            </div>
          </section>
        </SectionEnterTrigger>

        {/* PAGE 4: SURPRISE FOR STORY ON EVENT DAY (Warm Linen Parchment) */}
        <SectionEnterTrigger active={isOpened} onEnter={triggerSideCelebration}>
          <section
            id="story-section"
            className="relative z-10 min-h-[100svh] bg-[#EFE6D5] text-[#1F1316] px-6 pt-10 pb-8 flex flex-col items-center justify-start overflow-x-clip border-t border-[#C59B4E]/35"
          >
            {/* Soft portrait aura strictly contained inside the Story/Photo section */}
            <AnimatePresence>
              {storyPhotoUrl && (
                <motion.div
                  key="selfie-light-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
                  aria-hidden="true"
                >
                  <img
                    src={storyPhotoUrl}
                    alt=""
                    className="w-full h-full object-cover object-center scale-105"
                    style={{
                      opacity: lum < 0.28 ? 0.34 : 0.26,
                      filter: `blur(10px) saturate(1.12) brightness(${
                        lum < 0.28 ? 1.32 : 1.05
                      })`,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, rgba(${glowRgb}, 0.24) 0%, rgba(239,230,213,${linenVeilAlpha}) 70%, rgba(239,230,213,0.9) 100%)`,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <LightSectionAmbient />
            <DiaryPage className="relative z-20 w-full">
              <PledgeSection
                onPledgeSuccess={triggerConfetti}
                onPhotoChange={setStoryPhotoUrl}
              />
            </DiaryPage>
            <div className="relative z-10 w-full flex flex-col items-center mt-auto pt-6">
              <HeartbeatFooterWave variant="on-cream" />
              <NextPageArrow
                targetId="share-section"
                variant="on-cream"
                label="Next: Step Forward Today"
              />
            </div>
          </section>
        </SectionEnterTrigger>

        {/* PAGE 5 (2nd LAST): STEP FORWARD TODAY (Warm Ivory Parchment) */}
        <SectionEnterTrigger active={isOpened} onEnter={triggerSideCelebration}>
          <section
            id="share-section"
            className="snap-page relative z-10 min-h-[100svh] bg-[#FAF5EB] text-[#1F1316] px-6 pt-10 pb-8 flex flex-col items-center justify-between text-center overflow-hidden"
          >
            <LightSectionAmbient />
            <DiaryPage className="relative z-10 my-auto flex flex-col items-center max-w-[380px]">
              <DiaryLine delay={0.05}>
                <span className="font-label text-[11px] font-semibold tracking-[0.24em] uppercase text-[#9A6F2B]">
                  {SITE_CONFIG.share.eyebrow}
                </span>
              </DiaryLine>
              <DiaryLine delay={0.14}>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1F1316] tracking-tight text-balance">
                  {SITE_CONFIG.share.heading}
                </h2>
              </DiaryLine>
              <DiaryLine delay={0.22}>
                <p className="mt-2 font-body italic text-lg sm:text-xl text-[#1F1316]/80 text-balance">
                  {SITE_CONFIG.share.subtext}
                </p>
              </DiaryLine>

              <DiaryLine delay={0.32} className="w-full">
                <div className="mt-6 w-full rounded-3xl bg-[#EFE6D5]/95 border border-[#C59B4E]/45 p-6 shadow-[0_12px_32px_rgba(31,19,22,0.08)]">
                  <p className="font-display italic text-lg sm:text-xl font-medium text-[#A61229] leading-relaxed text-balance">
                    “{SITE_CONFIG.share.excuseBoldLine}”
                  </p>

                  <SectionDivider variant="on-cream" className="my-5" />

                  <div className="flex flex-col gap-3">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[48px] px-6 py-3 rounded-full bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-xs font-semibold tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 border border-[#C59B4E]/45 shadow-[0_10px_28px_rgba(110,7,23,0.28)] hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <Share2 className="w-4 h-4 text-[#D8B168]" />
                      {SITE_CONFIG.share.whatsappButton}
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full min-h-[46px] px-6 py-2.5 rounded-full border border-[#C59B4E]/50 bg-[#FAF5EB] text-[#1F1316] font-label text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[#A61229]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#9A6F2B]" />
                      )}
                      {copied ? SITE_CONFIG.share.copiedButton : SITE_CONFIG.share.copyButton}
                    </button>
                  </div>
                </div>
              </DiaryLine>
            </DiaryPage>

            <div className="relative z-10 w-full flex flex-col items-center pt-4">
              <HeartbeatFooterWave variant="on-cream" />
              <NextPageArrow
                targetId="final-section"
                variant="on-cream"
                label="Next: Final Promise"
              />
            </div>
          </section>
        </SectionEnterTrigger>

        {/* PAGE 7 (FINAL): COMPACT QUR'AN QUOTE & SILK ROPE (Deep Velvet Garnet) */}
        <SectionEnterTrigger active={isOpened} onEnter={triggerSideCelebration}>
          <footer
            id="final-section"
            className="snap-page relative z-10 min-h-[100svh] bg-gradient-to-b from-[#24070D] via-[#180408] to-[#120307] text-[#FAF5EB] px-6 py-12 flex flex-col items-center justify-center text-center overflow-hidden"
          >
            <DarkSectionDrops />
            <DiaryPage className="relative z-10 w-full">
              <FinalHeartSection
                onPromiseLocked={triggerConfetti}
                onCloseInvitation={() => {
                  setCurtainMode('close');
                }}
              />
            </DiaryPage>
          </footer>
        </SectionEnterTrigger>
      </main>
    </div>
  );
}
