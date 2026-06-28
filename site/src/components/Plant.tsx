"use client";

import { motion } from "framer-motion";

type Variant = "strawberry" | "coconut";

/**
 * Hand-drawn SVG plant. `strawberry` = bushy with red berries,
 * `coconut` = tall palm. `verified` toggles a green halo, `flagged` a red one.
 */
export function Plant({
  variant,
  verified,
  flagged,
  className = "",
}: {
  variant: Variant;
  verified?: boolean;
  flagged?: boolean;
  className?: string;
}) {
  const halo = verified
    ? "var(--support)"
    : flagged
      ? "var(--contradict)"
      : "transparent";

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {(verified || flagged) && (
        <motion.span
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: halo, opacity: 0.18 }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.18 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
      <svg
        viewBox="0 0 120 140"
        className="relative h-full w-full"
        role="img"
      >
        {/* pot */}
        <path
          d="M38 112 H82 L76 134 H44 Z"
          fill="var(--accent)"
          opacity="0.9"
        />
        <rect x="36" y="106" width="48" height="9" rx="2" fill="var(--accent)" />
        {/* soil */}
        <ellipse cx="60" cy="108" rx="22" ry="4" fill="var(--primary-strong)" />

        {variant === "strawberry" ? <Strawberry /> : <Coconut />}
      </svg>
    </div>
  );
}

function Strawberry() {
  return (
    <g>
      {/* stems */}
      <path
        d="M60 108 C60 90 52 80 46 70 M60 108 C60 88 68 78 74 66 M60 108 V64"
        stroke="var(--primary-strong)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* leaves */}
      {[
        { cx: 44, cy: 64, r: 13 },
        { cx: 76, cy: 60, r: 14 },
        { cx: 60, cy: 50, r: 16 },
        { cx: 50, cy: 78, r: 11 },
        { cx: 72, cy: 80, r: 11 },
      ].map((l, i) => (
        <motion.circle
          key={i}
          cx={l.cx}
          cy={l.cy}
          r={l.r}
          fill="var(--primary)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 200, damping: 14 }}
          style={{ transformOrigin: `${l.cx}px ${l.cy}px` }}
        />
      ))}
      {/* berries */}
      {[
        { cx: 48, cy: 88 },
        { cx: 70, cy: 92 },
        { cx: 60, cy: 78 },
      ].map((b, i) => (
        <motion.g
          key={i}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        >
          <path
            d={`M${b.cx - 5} ${b.cy} Q${b.cx} ${b.cy + 11} ${b.cx + 5} ${b.cy} Q${b.cx} ${b.cy + 4} ${b.cx - 5} ${b.cy} Z`}
            fill="var(--contradict)"
          />
          <circle cx={b.cx - 2} cy={b.cy + 2} r="0.8" fill="#ffe9c7" />
          <circle cx={b.cx + 2} cy={b.cy + 3} r="0.8" fill="#ffe9c7" />
        </motion.g>
      ))}
    </g>
  );
}

function Coconut() {
  return (
    <g>
      {/* trunk */}
      <path
        d="M58 108 C56 92 55 78 57 60"
        stroke="var(--accent)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* fronds */}
      {[-70, -35, 0, 35, 70].map((deg, i) => (
        <motion.path
          key={i}
          d="M57 58 q22 -6 38 6"
          stroke="var(--primary)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          style={{ transformOrigin: "57px 58px", rotate: `${deg}deg` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
        />
      ))}
      {/* coconuts */}
      {[
        { cx: 53, cy: 58 },
        { cx: 63, cy: 60 },
      ].map((c, i) => (
        <motion.circle
          key={i}
          cx={c.cx}
          cy={c.cy}
          r="5"
          fill="var(--primary-strong)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
        />
      ))}
    </g>
  );
}
