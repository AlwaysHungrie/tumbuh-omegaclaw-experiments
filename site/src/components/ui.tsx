"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary"
    >
      {children}
    </motion.p>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
    >
      {children}
    </motion.h1>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl"
    >
      {children}
    </motion.p>
  );
}

export function Card({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Pill({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "accent" | "contradict" | "support";
}) {
  const map = {
    primary: "bg-primary-soft text-primary-strong",
    accent: "bg-accent-soft text-accent",
    contradict: "bg-[var(--contradict)]/12 text-[var(--contradict)]",
    support: "bg-[var(--support)]/12 text-[var(--support)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  );
}
