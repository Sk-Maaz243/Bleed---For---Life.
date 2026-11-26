import { motion } from 'motion/react';

export function GlossyBloodDrop({
  size = 96,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.32)}
      viewBox="0 0 120 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="dropBaseGrad" cx="38%" cy="34%" r="68%">
          <stop offset="0%" stopColor="#DF223F" />
          <stop offset="45%" stopColor="#A61229" />
          <stop offset="85%" stopColor="#6E0717" />
          <stop offset="100%" stopColor="#3B030C" />
        </radialGradient>
        <linearGradient id="dropRimGrad" x1="20%" y1="10%" x2="80%" y2="95%">
          <stop offset="0%" stopColor="#E6C37E" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#A61229" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FAF5EB" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="dropSpecGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#FCE4DC" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M60 8C60 8 108 69 108 102C108 128.51 86.51 150 60 150C33.49 150 12 128.51 12 102C12 69 60 8 60 8Z"
        fill="url(#dropBaseGrad)"
        stroke="url(#dropRimGrad)"
        strokeWidth="1.5"
      />

      <path
        d="M28 112C33 130 46 140 60 140C77 140 92 127 96 108C87 125 73 132 58 132C44 132 34 124 28 112Z"
        fill="#E0243F"
        opacity="0.4"
      />

      <path
        d="M45 48C34 65 25 84 26 101C26.5 107 30 109 33 104C36 98 36 84 41 69C45 58 50 51 45 48Z"
        fill="url(#dropSpecGrad)"
      />

      <ellipse cx="42" cy="40" rx="3.2" ry="5.5" transform="rotate(-18 42 40)" fill="#FFF5F6" opacity="0.82" />
    </svg>
  );
}

export function HeartbeatLine({ className = '' }: { className?: string }) {
  const ecgPath =
    'M 0 36 L 68 36 L 82 36 L 91 27 L 100 44 L 111 8 L 122 58 L 132 24 L 141 36 L 160 36 L 210 36 L 222 36 L 230 29 L 238 42 L 247 14 L 256 52 L 265 28 L 273 36 L 340 36';

  return (
    <div className={`w-full max-w-[320px] mx-auto overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 340 66" fill="none" className="w-full h-auto">
        <defs>
          <linearGradient id="ecgGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C59B4E" stopOpacity="0" />
            <stop offset="20%" stopColor="#C59B4E" stopOpacity="0.88" />
            <stop offset="50%" stopColor="#E63B57" stopOpacity="1" />
            <stop offset="80%" stopColor="#C59B4E" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#C59B4E" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={ecgPath} stroke="#C59B4E" strokeOpacity="0.25" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

        <motion.path
          d={ecgPath}
          stroke="url(#ecgGlowGrad)"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.28, pathOffset: 0, opacity: 0.9 }}
          animate={{ pathOffset: [0, 1] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}

export function HeartbeatFooterWave({
  variant = 'on-dark',
  className = '',
}: {
  variant?: 'on-dark' | 'on-cream';
  className?: string;
}) {
  const wavePath =
    'M 0 22 L 58 22 L 70 22 L 78 14 L 86 30 L 95 6 L 104 36 L 113 14 L 120 22 L 176 22 L 186 22 L 193 15 L 200 28 L 208 8 L 216 33 L 224 16 L 231 22 L 266 22';
  const baseStroke = variant === 'on-dark' ? '#C59B4E' : '#A61229';
  const baseOpacity = variant === 'on-dark' ? 0.3 : 0.22;
  const gradId = `footerWaveGrad-${variant}`;

  return (
    <div
      className={`w-full max-w-[300px] mx-auto flex items-center justify-center gap-2 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 302 42" fill="none" className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C59B4E" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#A61229" stopOpacity="1" />
            <stop offset="100%" stopColor="#C59B4E" stopOpacity="1" />
          </linearGradient>
        </defs>

        <path
          d={wavePath}
          stroke={baseStroke}
          strokeOpacity={baseOpacity}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <motion.path
          d={wavePath}
          stroke={`url(#${gradId})`}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.32, pathOffset: 0 }}
          animate={{ pathOffset: [0, 1] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <g transform="translate(274, 11)">
          <path
            d="M11 20C11 20 2 13.8 2 7.6C2 4.5 4.4 2 7.3 2C9.1 2 10.4 2.9 11 4.2C11.6 2.9 12.9 2 14.7 2C17.6 2 20 4.5 20 7.6C20 13.8 11 20 11 20Z"
            fill="#A61229"
            stroke="#C59B4E"
            strokeOpacity="0.45"
            strokeWidth="0.9"
            className="animate-lub-dub origin-[11px_11px]"
          />
          <path
            d="M5.5 6.5C4.5 7.5 4.2 9 4.6 10.3"
            stroke="#FAF5EB"
            strokeOpacity="0.65"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export function BeatingHeart({ size = 84, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-50"
        style={{ background: 'radial-gradient(circle, #C59B4E 0%, #A61229 45%, transparent 72%)' }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative animate-lub-dub drop-shadow-[0_10px_28px_rgba(166,18,41,0.55)]"
      >
        <defs>
          <radialGradient id="heartGrad" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#DF223F" />
            <stop offset="52%" stopColor="#A61229" />
            <stop offset="100%" stopColor="#5C0613" />
          </radialGradient>
        </defs>
        <path
          d="M60 101C60 101 11 70.5 11 36.5C11 20.5 23.5 9 38.5 9C48.2 9 56.2 14.2 60 21.8C63.8 14.2 71.8 9 81.5 9C96.5 9 109 20.5 109 36.5C109 70.5 60 101 60 101Z"
          fill="url(#heartGrad)"
          stroke="#C59B4E"
          strokeOpacity="0.55"
          strokeWidth="1.8"
        />
        <path
          d="M27 28C22 33 20 41 22 48C22.8 50.8 26 50.5 26.8 47.5C28 43 30 37 34.5 32.5C37 30 31.5 24 27 28Z"
          fill="#FFFFFF"
          opacity="0.52"
        />
      </svg>
    </div>
  );
}

export function SectionDivider({
  variant = 'on-dark',
  className = '',
}: {
  variant?: 'on-dark' | 'on-cream';
  className?: string;
}) {
  const lineColor = variant === 'on-dark' ? '#C59B4E' : '#B88A44';
  const lineOpacity = variant === 'on-dark' ? 0.38 : 0.42;

  return (
    <div className={`flex items-center justify-center gap-3 w-full max-w-[240px] mx-auto ${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 20" fill="none" className="w-full h-5">
        <line x1="0" y1="10" x2="96" y2="10" stroke={lineColor} strokeOpacity={lineOpacity} strokeWidth="1" />
        <line x1="144" y1="10" x2="240" y2="10" stroke={lineColor} strokeOpacity={lineOpacity} strokeWidth="1" />
        <circle cx="104" cy="10" r="1.5" fill="#C59B4E" />
        <path
          d="M120 3C120 3 125.5 10.2 125.5 13.6C125.5 16.58 123.04 19 120 19C116.96 19 114.5 16.58 114.5 13.6C114.5 10.2 120 3 120 3Z"
          fill="#A61229"
        />
        <circle cx="136" cy="10" r="1.5" fill="#C59B4E" />
      </svg>
    </div>
  );
}

const DROP_CONFIGS = [
  { left: '8%', duration: '12.5s', delay: '-2s', size: 10 },
  { left: '25%', duration: '15.5s', delay: '-7s', size: 9 },
  { left: '50%', duration: '14s', delay: '-4s', size: 10 },
  { left: '74%', duration: '15s', delay: '-11s', size: 11 },
  { left: '91%', duration: '13s', delay: '-5.5s', size: 9 },
];

const HEART_CONFIGS = [
  { left: '14%', duration: '18s', delay: '-3s', size: 16 },
  { left: '84%', duration: '20s', delay: '-9s', size: 15 },
];

export function DarkSectionDrops() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Subtle velvet radial warmth */}
      <div
        className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full blur-3xl opacity-[0.22]"
        style={{ background: 'radial-gradient(circle, #6E0717 0%, transparent 72%)' }}
      />

      {DROP_CONFIGS.map((drop, idx) => (
        <div
          key={`drop-${idx}`}
          className="animate-fall-drop absolute -top-6"
          style={
            {
              left: drop.left,
              '--drop-duration': drop.duration,
              '--drop-delay': drop.delay,
            } as React.CSSProperties
          }
        >
          <svg
            width={drop.size}
            height={Math.round(drop.size * 1.4)}
            viewBox="0 0 12 17"
            fill="none"
          >
            <path
              d="M6 1C6 1 11 7.6 11 11.2C11 13.85 8.76 16 6 16C3.24 16 1 13.85 1 11.2C1 7.6 6 1 6 1Z"
              fill={idx % 2 === 0 ? '#A61229' : '#C59B4E'}
              fillOpacity={idx % 2 === 0 ? '0.85' : '0.45'}
            />
          </svg>
        </div>
      ))}

      {HEART_CONFIGS.map((heart, idx) => (
        <div
          key={`dark-heart-${idx}`}
          className="animate-float-heart absolute top-0"
          style={
            {
              left: heart.left,
              '--heart-duration': heart.duration,
              '--heart-delay': heart.delay,
            } as React.CSSProperties
          }
        >
          <svg width={heart.size} height={heart.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21C12 21 3 14.8 3 8.5C3 5.4 5.4 3 8.3 3C10.1 3 11.4 3.9 12 5.2C12.6 3.9 13.9 3 15.7 3C18.6 3 21 5.4 21 8.5C21 14.8 12 21 12 21Z"
              stroke="#C59B4E"
              strokeOpacity="0.45"
              strokeWidth="1.4"
              fill="#A61229"
              fillOpacity="0.16"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

const LIGHT_DROP_CONFIGS = [
  { left: '9%', duration: '12s', delay: '-1.5s', size: 10 },
  { left: '30%', duration: '15s', delay: '-6.5s', size: 9 },
  { left: '72%', duration: '14.5s', delay: '-9.5s', size: 10 },
  { left: '90%', duration: '12.5s', delay: '-5s', size: 9 },
];

const LIGHT_HEART_CONFIGS = [
  { left: '12%', duration: '17s', delay: '-2s', size: 17 },
  { left: '85%', duration: '16.5s', delay: '-10s', size: 16 },
];

export function LightSectionAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #C59B4E 0%, transparent 72%)' }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-[0.1]"
        style={{ background: 'radial-gradient(circle, #A61229 0%, transparent 72%)' }}
      />

      {LIGHT_DROP_CONFIGS.map((drop, idx) => (
        <div
          key={`light-drop-${idx}`}
          className="animate-fall-drop absolute -top-6"
          style={
            {
              left: drop.left,
              '--drop-duration': drop.duration,
              '--drop-delay': drop.delay,
            } as React.CSSProperties
          }
        >
          <svg
            width={drop.size}
            height={Math.round(drop.size * 1.4)}
            viewBox="0 0 12 17"
            fill="none"
          >
            <path
              d="M6 1C6 1 11 7.6 11 11.2C11 13.85 8.76 16 6 16C3.24 16 1 13.85 1 11.2C1 7.6 6 1 6 1Z"
              fill={idx % 2 === 0 ? '#A61229' : '#B88A44'}
              fillOpacity={idx % 2 === 0 ? '0.45' : '0.35'}
            />
          </svg>
        </div>
      ))}

      {LIGHT_HEART_CONFIGS.map((heart, idx) => (
        <div
          key={`light-heart-${idx}`}
          className="animate-float-heart absolute top-0"
          style={
            {
              left: heart.left,
              '--heart-duration': heart.duration,
              '--heart-delay': heart.delay,
            } as React.CSSProperties
          }
        >
          <svg width={heart.size} height={heart.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21C12 21 3 14.8 3 8.5C3 5.4 5.4 3 8.3 3C10.1 3 11.4 3.9 12 5.2C12.6 3.9 13.9 3 15.7 3C18.6 3 21 5.4 21 8.5C21 14.8 12 21 12 21Z"
              fill="#A61229"
              fillOpacity="0.14"
              stroke="#C59B4E"
              strokeOpacity="0.5"
              strokeWidth="1.3"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
