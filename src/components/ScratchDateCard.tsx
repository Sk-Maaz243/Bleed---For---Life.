import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Download, MapPin, ClipboardList } from 'lucide-react';
import { SITE_CONFIG } from '../config';
import { DiaryLine } from './DiaryMotion';

// ==========================================
// GOOGLE FORM LINK
// Apna Google Form URL yahan paste karna
// ==========================================

const GOOGLE_FORM_URL = 'PASTE_YOUR_GOOGLE_FORM_LINK_HERE';

interface ScratchDateCardProps {
  onRevealed: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getTimeRemaining(targetIso: string): TimeRemaining {
  const targetMs = new Date(targetIso).getTime();
  const diff = targetMs - Date.now();

  if (Number.isNaN(targetMs) || diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: false };
}

function padTwo(val: number): string {
  return String(val).padStart(2, '0');
}

function downloadIcsFile() {
  const {
    title,
    icsStartUtc,
    icsEndUtc,
    venueAddress,
    description,
    icsFilename,
  } = SITE_CONFIG.event;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bleed For Life//Blood Donation Camp//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:bleed-for-life-2026-bhiwandi@bleedforlife.org',
    'DTSTAMP:20260101T000000Z',
    `DTSTART:${icsStartUtc}`,
    `DTEND:${icsEndUtc}`,
    `SUMMARY:${title}`,
    `LOCATION:${venueAddress}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = icsFilename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function buildGoogleCalendarUrl(): string {
  const {
    title,
    icsStartUtc,
    icsEndUtc,
    venueAddress,
    description,
  } = SITE_CONFIG.event;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${icsStartUtc}/${icsEndUtc}`,
    location: venueAddress,
    details: description,
    ctz: 'Asia/Kolkata',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function ScrollRollerBar({
  position,
}: {
  position: 'top' | 'bottom';
}) {
  return (
    <div
      className={`relative z-20 flex items-center justify-center w-full select-none ${
        position === 'top'
          ? 'drop-shadow-[0_6px_10px_rgba(31,19,22,0.22)]'
          : 'drop-shadow-[0_10px_16px_rgba(31,19,22,0.26)]'
      }`}
      aria-hidden="true"
    >
      <div className="flex items-center shrink-0">
        <span className="w-2 h-3 rounded-l-full bg-gradient-to-b from-[#F5DE9E] via-[#C59B4E] to-[#7C561B] border border-[#7C561B]/60" />

        <span className="w-3 h-5 rounded-sm bg-gradient-to-b from-[#FCE9B2] via-[#C59B4E] to-[#875E1D] border border-[#7C561B]/70 shadow-inner" />
      </div>

      <div className="relative h-3.5 flex-1 bg-gradient-to-b from-[#6B3322] via-[#3E180F] to-[#1E0A06] border-y border-[#C59B4E]/60 flex items-center justify-between px-3">
        <span className="h-full w-1.5 bg-gradient-to-b from-[#F5DE9E] via-[#C59B4E] to-[#7C561B]" />

        <span className="h-[1.5px] flex-1 mx-2 bg-gradient-to-r from-transparent via-[#F5DE9E]/40 to-transparent" />

        <span className="h-full w-1.5 bg-gradient-to-b from-[#F5DE9E] via-[#C59B4E] to-[#7C561B]" />
      </div>

      <div className="flex items-center shrink-0">
        <span className="w-3 h-5 rounded-sm bg-gradient-to-b from-[#FCE9B2] via-[#C59B4E] to-[#875E1D] border border-[#7C561B]/70 shadow-inner" />

        <span className="w-2 h-3 rounded-r-full bg-gradient-to-b from-[#F5DE9E] via-[#C59B4E] to-[#7C561B] border border-[#7C561B]/60" />
      </div>
    </div>
  );
}

export function ScratchDateCard({
  onRevealed,
}: ScratchDateCardProps) {
  const scrollWrapRef = useRef<HTMLDivElement | null>(null);
  const hasNotifiedRef = useRef(false);

  const [isUnrolled, setIsUnrolled] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(SITE_CONFIG.event.targetIsoIst)
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getTimeRemaining(SITE_CONFIG.event.targetIsoIst));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const node = scrollWrapRef.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsUnrolled(true);
      return;
    }

    let openTimer: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) return;

        if (entry.isIntersecting) {
          if (openTimer) {
            window.clearTimeout(openTimer);
          }

          openTimer = window.setTimeout(() => {
            setIsUnrolled(true);

            if (!hasNotifiedRef.current) {
              hasNotifiedRef.current = true;
              onRevealed();
            }
          }, 180);
        } else {
          if (openTimer) {
            window.clearTimeout(openTimer);
            openTimer = null;
          }

          setIsUnrolled(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => {
      if (openTimer) window.clearTimeout(openTimer);
      observer.disconnect();
    };
  }, [onRevealed]);

  const googleCalendarUrl = buildGoogleCalendarUrl();

  const boxes = [
    {
      label: SITE_CONFIG.countdown.units.days,
      value: String(remaining.days),
    },
    {
      label: SITE_CONFIG.countdown.units.hours,
      value: padTwo(remaining.hours),
    },
    {
      label: SITE_CONFIG.countdown.units.minutes,
      value: padTwo(remaining.minutes),
    },
    {
      label: SITE_CONFIG.countdown.units.seconds,
      value: padTwo(remaining.seconds),
    },
  ];

  return (
    <div
      ref={scrollWrapRef}
      className="flex flex-col items-center text-center w-full max-w-[360px] mx-auto"
    >
      <DiaryLine delay={0.05} className="flex items-center gap-2.5 mb-0.5">
        <span className="h-px w-5 bg-[#C59B4E]/60" />

        <span className="font-label text-[10px] font-semibold tracking-[0.24em] uppercase text-[#9A6F2B]">
          Save The Date
        </span>

        <span className="h-px w-5 bg-[#C59B4E]/60" />
      </DiaryLine>

      <DiaryLine delay={0.14}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={isUnrolled ? 'revealed' : 'hidden'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="font-display text-[1.65rem] sm:text-3xl font-semibold text-[#1F1316] tracking-tight text-balance"
          >
            {isUnrolled
              ? SITE_CONFIG.scratch.headingAfter
              : SITE_CONFIG.scratch.headingBefore}
          </motion.h2>
        </AnimatePresence>
      </DiaryLine>

      <DiaryLine delay={0.2}>
        <p className="mt-0.5 font-body text-sm sm:text-base text-[#1F1316]/75 italic">
          {isUnrolled
            ? SITE_CONFIG.scratch.subtextAfter
            : SITE_CONFIG.scratch.subtextBefore}
        </p>
      </DiaryLine>

      {/* Royal Scroll Invitation */}

      <DiaryLine delay={0.26} className="mt-3 w-full max-w-[292px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsUnrolled((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsUnrolled((prev) => !prev);
            }
          }}
          aria-label="Royal Save The Date Scroll Invitation"
          className="relative flex flex-col items-center w-full cursor-pointer select-none focus:outline-none"
        >
          <ScrollRollerBar position="top" />

          <motion.div
            initial={false}
            animate={{
              height: isUnrolled ? 166 : 6,
            }}
            transition={{
              duration: 1.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative w-[86%] overflow-hidden shadow-[0_14px_30px_rgba(31,19,22,0.16)]"
            style={{
              background:
                'linear-gradient(180deg, #DEC392 0%, #FBF1DA 14%, #F7EAD0 50%, #FBF1DA 86%, #D9BC89 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-3"
              style={{
                background:
                  'linear-gradient(90deg, rgba(138,96,30,0.22) 0%, transparent 100%)',
              }}
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-3"
              style={{
                background:
                  'linear-gradient(270deg, rgba(138,96,30,0.22) 0%, transparent 100%)',
              }}
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-x-2.5 inset-y-2 border border-[#C59B4E]/55 rounded-[2px]"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-[#3B180E]/30 to-transparent"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-[#3B180E]/28 to-transparent"
              aria-hidden="true"
            />

            <motion.div
              initial={false}
              animate={{
                opacity: isUnrolled ? 1 : 0,
                y: isUnrolled ? 0 : -10,
              }}
              transition={{
                duration: 0.55,
                delay: isUnrolled ? 0.38 : 0,
              }}
              className="relative z-10 h-[166px] px-5 flex flex-col items-center justify-center"
            >
              <svg
                viewBox="0 0 120 12"
                className="w-24 h-2.5 mb-1.5 text-[#9A6F2B]"
                aria-hidden="true"
              >
                <line x1="6" y1="6" x2="48" y2="6" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
                <polygon points="60,2 64,6 60,10 56,6" fill="#A61229" />
                <line x1="72" y1="6" x2="114" y2="6" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
              </svg>

              <p className="font-royal-script text-[2rem] sm:text-[2.15rem] text-[#8C0D1F] leading-[0.95] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                {SITE_CONFIG.scratch.revealedDay}
              </p>

              <p className="mt-1 font-display italic text-[1.35rem] sm:text-[1.48rem] font-semibold text-[#1F1316] tracking-tight leading-tight">
                {SITE_CONFIG.scratch.revealedDateMain}
              </p>

              <p className="mt-1.5 font-label text-[10px] font-bold tracking-[0.18em] uppercase text-[#9A6F2B]">
                {SITE_CONFIG.scratch.revealedTime}
              </p>

              <svg
                viewBox="0 0 120 12"
                className="w-20 h-2.5 mt-2 text-[#9A6F2B]"
                aria-hidden="true"
              >
                <line x1="12" y1="6" x2="52" y2="6" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
                <circle cx="60" cy="6" r="2.2" fill="currentColor" />
                <line x1="68" y1="6" x2="108" y2="6" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
              </svg>
            </motion.div>
          </motion.div>

          <div className="relative w-full">
            <ScrollRollerBar position="bottom" />

            <motion.div
              initial={false}
              animate={{
                scale: isUnrolled ? 0.85 : 1,
                opacity: isUnrolled ? 0.9 : 1,
              }}
              transition={{ duration: 0.45 }}
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2.5 z-30 w-6 h-6 rounded-full bg-gradient-to-b from-[#B3152E] to-[#6E0717] border border-[#F5DE9E] shadow-[0_3px_8px_rgba(31,19,22,0.35)] flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="w-2 h-2 rounded-full border border-[#F5DE9E]/75" />
            </motion.div>
          </div>
        </div>
      </DiaryLine>

      {/* Countdown */}

      <DiaryLine delay={0.36} className="mt-5 w-full max-w-[324px]">
        {remaining.isPast ? (
          <p className="font-display text-base font-semibold text-[#A61229]">
            {SITE_CONFIG.countdown.completedMessage}
          </p>
        ) : (
          <div className="rounded-2xl bg-gradient-to-b from-[#2A0810] to-[#1A0409] border border-[#C59B4E]/55 px-2 py-2 shadow-[0_10px_24px_rgba(31,19,22,0.16)] grid grid-cols-4 divide-x divide-[#C59B4E]/25">
            {boxes.map((box) => (
              <div
                key={box.label}
                className="flex flex-col items-center justify-center px-1"
              >
                <span className="font-display text-lg sm:text-xl font-semibold tabular-nums text-[#FAF5EB] leading-tight">
                  {box.value}
                </span>

                <span className="font-label text-[9px] font-medium tracking-[0.14em] uppercase text-[#D8B168]">
                  {box.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </DiaryLine>

      {/* Venue + Save Date + Directions + Google Form */}

      <DiaryLine delay={0.44} className="mt-3 w-full max-w-[324px]">
        <div className="rounded-2xl bg-[#FAF5EB]/95 border border-[#C59B4E]/55 p-3 shadow-[0_12px_28px_rgba(31,19,22,0.08)]">

          {/* Venue Details */}

          <div className="pb-2.5 mb-2.5 border-b border-[#C59B4E]/25 flex flex-col items-center">
            <p className="font-label text-[9px] font-semibold tracking-[0.16em] uppercase text-[#9A6F2B]">
              {SITE_CONFIG.event.venueSociety}
            </p>

            <p className="mt-0.5 font-display text-sm sm:text-[15px] font-semibold text-[#1F1316] leading-snug">
              {SITE_CONFIG.event.venueName}
            </p>

            <p className="mt-0.5 font-label text-[10px] font-semibold tracking-[0.12em] uppercase text-[#9A6F2B]">
              Thana Road, Bhiwandi · {SITE_CONFIG.event.timeDisplay}
            </p>
          </div>

          {/* Save Date + Get Directions */}

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() => {
                downloadIcsFile();
                setShowCalendarOptions((prev) => !prev);
              }}
              className="min-h-[44px] px-2.5 py-2 rounded-xl border border-[#C59B4E]/60 bg-[#EFE6D5] text-[#1F1316] font-label text-[11px] font-semibold tracking-[0.1em] uppercase inline-flex items-center justify-center gap-1.5 hover:bg-white active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-[#9A6F2B]" />
              Save Date
            </button>

            <a
              href={SITE_CONFIG.venue.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-2.5 py-2 rounded-xl bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] font-label text-[11px] font-semibold tracking-[0.1em] uppercase inline-flex items-center justify-center gap-1.5 border border-[#C59B4E]/45 shadow-[0_6px_16px_rgba(166,18,41,0.28)] hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E6C37E]" />
              {SITE_CONFIG.venue.directionsButton}
            </a>

          </div>

          {/* Google Form Registration Button */}

          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register using Google Form"
            className="mt-2.5 w-full min-h-[46px] px-4 py-3 rounded-xl bg-gradient-to-b from-[#A61229] via-[#8F1025] to-[#6E0717] text-[#FAF5EB] font-label text-[11px] font-bold tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2 border border-[#C59B4E]/65 shadow-[0_7px_18px_rgba(166,18,41,0.25)] hover:brightness-110 hover:shadow-[0_9px_22px_rgba(166,18,41,0.35)] active:scale-[0.98] transition-all"
          >
            <ClipboardList className="w-4 h-4 text-[#E6C37E]" />
            Register Now
          </a>

          {/* Calendar Options */}

          <AnimatePresence>
            {showCalendarOptions && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-2.5 pt-2 border-t border-[#C59B4E]/20 flex items-center justify-center gap-2 w-full"
              >
                <button
                  type="button"
                  onClick={downloadIcsFile}
                  className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#C59B4E]/45 bg-white/80 text-[#1F1316] font-label text-[10px] font-semibold tracking-[0.08em] uppercase inline-flex items-center justify-center gap-1 hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3 h-3 text-[#A61229]" />
                  {SITE_CONFIG.scratch.icsActionLabel}
                </button>

                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#A61229]/35 bg-[#A61229]/10 text-[#A61229] font-label text-[10px] font-semibold tracking-[0.08em] uppercase inline-flex items-center justify-center gap-1 hover:bg-[#A61229]/16 transition-colors whitespace-nowrap"
                >
                  <Calendar className="w-3 h-3" />
                  {SITE_CONFIG.scratch.googleCalLabel}
                </a>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </DiaryLine>
    </div>
  );
}