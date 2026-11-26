import { SITE_CONFIG } from '../config';
import { DiaryLine } from './DiaryMotion';
import { GlossyBloodDrop, SectionDivider } from './SvgArtwork';

export function ImpactSection() {
  return (
    <div className="flex flex-col items-center text-center w-full max-w-[356px] mx-auto px-1">
      <DiaryLine delay={0.05}>
        <div className="inline-flex items-center gap-2">
          <span className="h-px w-6 bg-[#C59B4E]/60" aria-hidden="true" />
          <span className="font-label text-[11px] font-semibold tracking-[0.24em] uppercase text-[#9A6F2B]">
            {SITE_CONFIG.impact.eyebrow}
          </span>
          <span className="h-px w-6 bg-[#C59B4E]/60" aria-hidden="true" />
        </div>
      </DiaryLine>

      <DiaryLine delay={0.12} className="w-full">
        <div className="mt-5 relative rounded-[26px] bg-gradient-to-b from-[#FFFDF9] to-[#F7ECDA] border border-[#C59B4E]/55 px-5 pt-6 pb-5 shadow-[0_18px_40px_rgba(31,19,22,0.08)]">
          <div
            className="pointer-events-none absolute inset-[6px] rounded-[20px] border border-[#C59B4E]/25"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center">
            <GlossyBloodDrop size={28} />

            <h2 className="mt-3.5 font-display text-[1.62rem] sm:text-[1.85rem] font-semibold text-[#1F1316] leading-[1.24] tracking-tight text-balance">
              {SITE_CONFIG.impact.paigam}
            </h2>

            <SectionDivider variant="on-cream" className="my-4" />

            <p className="font-body italic text-[1.12rem] sm:text-xl text-[#A61229] leading-snug text-balance">
              {SITE_CONFIG.impact.scientificQuote}
            </p>
          </div>
        </div>
      </DiaryLine>

      <DiaryLine delay={0.24} className="w-full mt-4">
        <div className="grid grid-cols-3 divide-x divide-[#C59B4E]/35 rounded-2xl bg-[#EFE6D5]/80 border border-[#C59B4E]/45 py-2.5 px-2">
          {SITE_CONFIG.impact.pillars.map((pillar) => (
            <div key={pillar} className="px-1.5 flex items-center justify-center">
              <span className="font-label text-[10px] font-semibold tracking-[0.11em] uppercase text-[#9A6F2B] leading-tight">
                {pillar}
              </span>
            </div>
          ))}
        </div>
      </DiaryLine>
    </div>
  );
}
