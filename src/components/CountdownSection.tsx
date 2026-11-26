import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '../config';
import { SectionDivider } from './SvgArtwork';
import { DiaryLine } from './DiaryMotion';

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
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
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

export function CountdownSection() {
  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(SITE_CONFIG.event.targetIsoIst)
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getTimeRemaining(SITE_CONFIG.event.targetIsoIst));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const boxes = [
    { label: SITE_CONFIG.countdown.units.days, value: String(remaining.days) },
    { label: SITE_CONFIG.countdown.units.hours, value: padTwo(remaining.hours) },
    { label: SITE_CONFIG.countdown.units.minutes, value: padTwo(remaining.minutes) },
    { label: SITE_CONFIG.countdown.units.seconds, value: padTwo(remaining.seconds) },
  ];

  return (
    <div className="flex flex-col items-center text-center w-full">
      <DiaryLine delay={0.05}>
        <span className="font-label text-xs tracking-[0.26em] uppercase text-[#B3001B]">
          Every Second Counts
        </span>
      </DiaryLine>
      <DiaryLine delay={0.16}>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#0B0B0B] tracking-tight">
          {SITE_CONFIG.countdown.heading}
        </h2>
      </DiaryLine>
      <DiaryLine delay={0.26}>
        <p className="mt-2 font-body text-lg text-[#0B0B0B]/75 italic">
          {SITE_CONFIG.event.dateDisplay} · {SITE_CONFIG.event.timeDisplay}
        </p>
      </DiaryLine>

      {remaining.isPast ? (
        <DiaryLine delay={0.36} className="w-full">
          <div className="mt-8 w-full px-8 py-7 rounded-2xl border border-[#B3001B]/35 bg-[#0B0B0B] text-[#F5EDE0]">
            <p className="font-display text-2xl font-bold text-[#F5EDE0]">
              {SITE_CONFIG.countdown.completedMessage}
            </p>
          </div>
        </DiaryLine>
      ) : (
        <div className="mt-8 grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
          {boxes.map((box, idx) => (
            <DiaryLine key={box.label} delay={0.34 + idx * 0.08}>
              <motion.div
                animate={{
                  y: [0, -8, 0, 1, 0],
                  scale: [1, 1.03, 1, 0.985, 1],
                }}
                transition={{
                  duration: 1.8,
                  delay: idx * 0.22,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative flex flex-col items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#F5EDE0] py-5 px-2 border border-[#B3001B]/45 shadow-[0_12px_26px_rgba(11,11,11,0.18)] overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#7A0012] via-[#B3001B] to-[#7A0012]" />
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: idx * 0.22,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <motion.span
                    key={box.value}
                    initial={{ y: -8, scale: 1.14, opacity: 0.65 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                    className="inline-block font-display text-2xl sm:text-3xl font-bold tabular-nums text-[#F5EDE0]"
                  >
                    {box.value}
                  </motion.span>
                </motion.div>
                <span className="mt-1.5 font-label text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#F5EDE0]/70">
                  {box.label}
                </span>
              </motion.div>
            </DiaryLine>
          ))}
        </div>
      )}

      <DiaryLine delay={0.62} className="w-full">
        <SectionDivider variant="on-cream" className="mt-10" />
      </DiaryLine>

      <DiaryLine delay={0.72} className="w-full">
        <div className="mt-7 w-full rounded-2xl bg-[#EFE5D4] border border-[#0B0B0B]/12 px-5 py-4">
          <p className="font-display text-lg font-semibold text-[#0B0B0B]">
            {SITE_CONFIG.event.venueAddress}
          </p>
          <p className="mt-1 font-body italic text-base text-[#B3001B]">
            {SITE_CONFIG.event.notes[0]}
          </p>
        </div>
      </DiaryLine>
    </div>
  );
}
