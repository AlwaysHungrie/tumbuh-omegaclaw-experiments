"use client";

import { ReactNode } from "react";

/** A faux terminal frame for showing commands and confidence-score output. */
export function Terminal({
  title = "confidence-score",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#0e1512] shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#e06a6a]" />
        <span className="h-3 w-3 rounded-full bg-[#e0a35a]" />
        <span className="h-3 w-3 rounded-full bg-[#41b277]" />
        <span className="ml-2 font-mono text-xs text-white/50">{title}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-[#e9efe7]">
        {children}
      </pre>
    </div>
  );
}

export function Cmd({ children }: { children: ReactNode }) {
  return (
    <div className="text-[#e9efe7]">
      <span className="select-none text-[#41b277]">$ </span>
      {children}
    </div>
  );
}

export function Line({
  color,
  children,
}: {
  color?: "support" | "contradict" | "muted";
  children: ReactNode;
}) {
  const c =
    color === "support"
      ? "text-[#41b277]"
      : color === "contradict"
        ? "text-[#e06a6a]"
        : color === "muted"
          ? "text-white/45"
          : "text-[#e9efe7]";
  return <div className={c}>{children}</div>;
}
