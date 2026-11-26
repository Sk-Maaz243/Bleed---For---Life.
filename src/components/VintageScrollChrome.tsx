import { motion, useScroll, useTransform } from 'motion/react';

export function VintageScrollChrome() {
  const { scrollYProgress } = useScroll();
  const valanceY = useTransform(scrollYProgress, [0, 0.14], [0, -10]);
  const valanceOpacity = useTransform(scrollYProgress, [0, 0.08], [0.96, 0.88]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[42]"
    >
      {/* Delicate gold-and-garnet antique letter borders */}
      <div
        className="absolute inset-y-0 left-0 w-[5px] opacity-70"
        style={{
          background:
            'linear-gradient(90deg, rgba(110,7,23,0.8) 0%, rgba(197,155,78,0.55) 60%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[5px] opacity-70"
        style={{
          background:
            'linear-gradient(270deg, rgba(110,7,23,0.8) 0%, rgba(197,155,78,0.55) 60%, transparent 100%)',
        }}
      />

      {/* Top Royal Parchment Scroll Roller */}
      <motion.div
        style={{ y: valanceY, opacity: valanceOpacity }}
        className="absolute top-0 inset-x-0 flex flex-col items-center"
      >
        <div
          className="w-full h-3.5 shadow-[0_6px_16px_rgba(0,0,0,0.45)] border-b border-[#C59B4E]/50 flex items-center justify-between px-1"
          style={{
            background:
              'linear-gradient(180deg, #4A0410 0%, #9E1428 42%, #DFBE84 78%, #6E0717 100%)',
          }}
        >
          <span className="w-2.5 h-4 -mt-0.5 rounded-full bg-gradient-to-b from-[#FAF5EB] to-[#C59B4E] border border-[#3B030C] shadow" />
          <span className="w-2.5 h-4 -mt-0.5 rounded-full bg-gradient-to-b from-[#FAF5EB] to-[#C59B4E] border border-[#3B030C] shadow" />
        </div>

        {/* Slim gold-and-garnet progress ribbon */}
        <div className="w-full h-[2.5px] bg-[#1C050A]/30 overflow-hidden">
          <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: 'left center' }}
            className="h-full w-full bg-gradient-to-r from-[#A61229] via-[#C59B4E] to-[#FAF5EB]"
          />
        </div>
      </motion.div>

      {/* Bottom Antique Scroll Roller */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-1">
        <div
          className="w-full h-2.5 shadow-[0_-4px_14px_rgba(0,0,0,0.4)] border-t border-[#C59B4E]/45 flex items-center justify-between px-1"
          style={{
            background:
              'linear-gradient(180deg, #6E0717 0%, #DFBE84 32%, #9E1428 76%, #3B030C 100%)',
          }}
        >
          <span className="w-2.5 h-3.5 -mb-0.5 rounded-full bg-gradient-to-b from-[#FAF5EB] to-[#C59B4E] border border-[#3B030C] shadow" />
          <span className="w-2.5 h-3.5 -mb-0.5 rounded-full bg-gradient-to-b from-[#FAF5EB] to-[#C59B4E] border border-[#3B030C] shadow" />
        </div>
      </div>
    </div>
  );
}
