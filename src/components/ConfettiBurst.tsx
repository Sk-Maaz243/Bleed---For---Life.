import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'rect' | 'drop' | 'heart';
}

const COLORS = ['#A61229', '#FAF5EB', '#6E0717', '#C59B4E', '#DF223F'];

interface ConfettiBurstProps {
  burstKey: number;
  sideBurstKey: number;
}

export function ConfettiBurst({ burstKey, sideBurstKey }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafIdRef = useRef<number>(0);

  const ensureLoopRunning = () => {
    if (rafIdRef.current !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== w * currentDpr || canvas.height !== h * currentDpr) {
        canvas.width = w * currentDpr;
        canvas.height = h * currentDpr;
      }

      ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const list = particlesRef.current;
      const nextList: Particle[] = [];

      for (const p of list) {
        p.vy += 0.2;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0.01) continue;
        nextList.push(p);

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size * 0.34, p.size, p.size * 0.68);
        } else if (p.shape === 'heart') {
          const s = p.size * 0.55;
          ctx.beginPath();
          ctx.moveTo(0, s);
          ctx.bezierCurveTo(s * 1.4, 0, s * 0.9, -s, 0, -s * 0.35);
          ctx.bezierCurveTo(-s * 0.9, -s, -s * 1.4, 0, 0, s);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      particlesRef.current = nextList;

      if (nextList.length > 0) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = 0;
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  };

  // Center burst (Scratch reveal / Pledge submit)
  useEffect(() => {
    if (burstKey <= 0) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const originX = width / 2;
    const originY = height * 0.48;

    const spawned: Particle[] = Array.from({ length: 76 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8.5;
      const shapes: Particle['shape'][] = ['rect', 'drop', 'heart'];
      return {
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4.2,
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: 0.012,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    });

    particlesRef.current.push(...spawned);
    ensureLoopRunning();
  }, [burstKey]);

  // Side-by-side congratulation cannon bursts on entering each section
  useEffect(() => {
    if (sideBurstKey <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const columnLeft = width > 520 ? (width - 480) / 2 : 0;
    const columnRight = width > 520 ? columnLeft + 480 : width;

    const shapes: Particle['shape'][] = ['rect', 'heart', 'drop'];
    const spawned: Particle[] = [];

    // Left edge cannon firing inward & upward
    for (let i = 0; i < 18; i++) {
      const angle = -0.35 - Math.random() * 0.85; // upward-right
      const speed = 4.2 + Math.random() * 5.8;
      spawned.push({
        x: columnLeft + 6,
        y: height * (0.42 + Math.random() * 0.34),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        size: 5 + Math.random() * 5.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.24,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.96,
        decay: 0.014,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    // Right edge cannon firing inward & upward
    for (let i = 0; i < 18; i++) {
      const angle = Math.PI + 0.35 + Math.random() * 0.85; // upward-left
      const speed = 4.2 + Math.random() * 5.8;
      spawned.push({
        x: columnRight - 6,
        y: height * (0.42 + Math.random() * 0.34),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        size: 5 + Math.random() * 5.5,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.24,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.96,
        decay: 0.014,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    particlesRef.current.push(...spawned);
    ensureLoopRunning();
  }, [sideBurstKey]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== 0) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[70] w-full h-full"
      aria-hidden="true"
    />
  );
}
