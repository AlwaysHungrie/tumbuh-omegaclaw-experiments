"use client";

import { motion } from "framer-motion";

/** Animated 0–100 confidence bar. Color shifts green (support) → red (contradict). */
export function ConfidenceMeter({
  score,
  label,
  active,
}: {
  score: number;
  label: string;
  active: boolean;
}) {
  const color =
    score >= 60
      ? "var(--support)"
      : score <= 40
        ? "var(--contradict)"
        : "var(--neutral)";

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <motion.span
          className="font-mono text-3xl font-bold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={active ? { opacity: 1 } : { opacity: 0 }}
        >
          {active ? <Counter to={score} /> : "—"}
          <span className="text-xl">%</span>
        </motion.span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={active ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function Counter({ to }: { to: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <CountUp to={to} />
    </motion.span>
  );
}

import { useEffect, useState } from "react";

function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}
