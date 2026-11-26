import { motion } from 'motion/react';

export function DiaryPage({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div style={{ perspective: 1200 }} className={`w-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, rotateX: 9, y: 26, scale: 0.97 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'top center' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function DiaryLine({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.58, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
