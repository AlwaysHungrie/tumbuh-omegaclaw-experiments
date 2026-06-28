"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";

export type Slide = {
  id: string;
  label: string; // for the dot-nav tooltip / progress
  render: () => ReactNode;
};

// Optional deep-link: ?slide=N (1-based) opens straight to a slide.
function initialSlide(count: number): number {
  if (typeof window === "undefined") return 0;
  const p = new URLSearchParams(window.location.search).get("slide");
  if (!p) return 0;
  const n = parseInt(p, 10) - 1;
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(count - 1, n));
}

export function Deck({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [dark, setDark] = useState(true);

  // Apply deep-link after mount (kept out of useState initializer to avoid a
  // server/client hydration mismatch — server always renders slide 0).
  useEffect(() => {
    const target = initialSlide(slides.length);
    if (target !== 0) setI(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback(
    (next: number) => {
      setDir(next > i ? 1 : -1);
      setI(Math.max(0, Math.min(slides.length - 1, next)));
    },
    [i, slides.length],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(i + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(i - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, slides.length]);

  const slide = slides[i];

  return (
    <div className="grain-bg relative flex h-dvh w-full flex-col overflow-hidden">
      {/* top bar */}
      <header className="z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Leaf />
          <span className="font-mono text-sm font-semibold tracking-tight">
            tumbuh
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted tabular-nums">
            {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* slide stage — keyed motion (no AnimatePresence wait, so content is
          always mounted immediately and never depends on an exit completing). */}
      <main className="relative flex-1 overflow-hidden">
        <motion.section
          key={slide.id}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 overflow-y-auto"
        >
          <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center px-5 py-8 sm:px-8">
            {slide.render()}
          </div>
        </motion.section>
      </main>

      {/* bottom nav */}
      <footer className="z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <NavButton dir="prev" onClick={() => go(i - 1)} disabled={i === 0} />
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => go(idx)}
              aria-label={`Go to slide ${idx + 1}: ${s.label}`}
              aria-current={idx === i}
              className="group relative h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{
                width: idx === i ? 28 : 10,
                background: idx === i ? "var(--primary)" : "var(--border)",
              }}
            />
          ))}
        </div>
        <NavButton
          dir="next"
          onClick={() => go(i + 1)}
          disabled={i === slides.length - 1}
        />
      </footer>
    </div>
  );
}

function NavButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      className="grid h-11 w-11 place-items-center rounded-lg border border-border bg-surface text-foreground transition-all hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {dir === "prev" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}

function Leaf() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 22C6 22 4 16 4 10 4 5 8 2 12 2c0 6-2 8-6 10 5 0 8-2 10-6 0 8-2 16-4 16Z"
        fill="var(--primary)"
      />
    </svg>
  );
}
