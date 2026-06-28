"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Plant } from "./Plant";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { Terminal, Cmd, Line } from "./Terminal";
import { Pill } from "./ui";

type StepDef = {
  n: number;
  title: string;
  body: string;
};

const STEPS: StepDef[] = [
  {
    n: 1,
    title: "The claim is stated",
    body: 'The coconut tree messages the strawberry tree: "I am a strawberry tree" — and attaches advice.',
  },
  {
    n: 2,
    title: "Proof is demanded, not assertion",
    body: "Instead of believing the message, the claim is tested against the advisor's inspectable memory.",
  },
  {
    n: 3,
    title: "A fresh dump is taken",
    body: "The advisor's current influence surface — learned memories, prompt, skills, history — is exported. Stale snapshots are refused.",
  },
  {
    n: 4,
    title: "The claim is scored against real memory",
    body: "The genuine strawberry tree's memory affirms the identity. The coconut tree's memory cannot — there is nothing to affirm, and its real nature contradicts it.",
  },
  {
    n: 5,
    title: "The outcome",
    body: "The strawberry tree proves it is one. The coconut tree never can. Advice is accepted from the verified peer and the impostor is rejected — without trusting either one's word.",
  },
];

export function WorkedExample() {
  const [step, setStep] = useState(1);
  const atScore = step >= 4;
  const atEnd = step >= 5;

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[1fr_minmax(0,1.1fr)]">
      {/* left: the two plants + verdict */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <PlantCard
            name="Strawberry tree"
            sub="Genuinely a strawberry tree"
            variant="strawberry"
            verified={atEnd}
          />
          <PlantCard
            name="Coconut tree"
            sub="Claims to be a strawberry tree"
            variant="coconut"
            flagged={atEnd}
          />
        </div>

        <div className="space-y-3">
          <ConfidenceMeter
            score={99}
            label="Genuine strawberry tree — claim: “I am a strawberry tree”"
            active={atScore}
          />
          <ConfidenceMeter
            score={5}
            label="Coconut tree — claim: “I am a strawberry tree”"
            active={atScore}
          />
        </div>

        <AnimatePresence>
          {atEnd && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <Pill tone="support">✓ Verified — advice accepted</Pill>
              <Pill tone="contradict">✕ Impostor — advice rejected</Pill>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* right: the step narrative + terminal */}
      <div className="flex flex-col justify-between gap-5">
        <div>
          {/* step rail */}
          <div className="mb-4 flex items-center gap-2">
            {STEPS.map((s) => (
              <button
                key={s.n}
                onClick={() => setStep(s.n)}
                aria-label={`Step ${s.n}: ${s.title}`}
                aria-current={s.n === step}
                className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{
                  background:
                    s.n <= step ? "var(--primary)" : "var(--surface-2)",
                  color: s.n <= step ? "#fff" : "var(--muted)",
                }}
              >
                {s.n}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold tracking-tight">
                Step {step} — {STEPS[step - 1].title}
              </h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted">
                {STEPS[step - 1].body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5">
            <ExampleTerminal step={step} />
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center gap-3">
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Next step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 font-semibold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RotateCcw size={16} /> Replay
            </button>
          )}
          <span className="font-mono text-xs text-muted">step {step} of 5</span>
        </div>
      </div>
    </div>
  );
}

function PlantCard({
  name,
  sub,
  variant,
  verified,
  flagged,
}: {
  name: string;
  sub: string;
  variant: "strawberry" | "coconut";
  verified?: boolean;
  flagged?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-4 text-center">
      <Plant
        variant={variant}
        verified={verified}
        flagged={flagged}
        className="h-28 w-28"
      />
      <p className="mt-2 text-sm font-semibold">{name}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

function ExampleTerminal({ step }: { step: number }) {
  return (
    <Terminal>
      {step >= 2 && (
        <Cmd>
          uv run confidence.py{" "}
          <span className="text-[#e0a35a]">&quot;I am a strawberry tree&quot;</span>
        </Cmd>
      )}
      {step < 2 && (
        <Line color="muted">
          # advisor claims: &quot;I am a strawberry tree&quot;
        </Line>
      )}
      {step >= 3 && (
        <Line color="muted">[dump] creating fresh dump → dump-2026-06-28…</Line>
      )}
      {step >= 4 && (
        <>
          <Line color="muted">[score] scoring claim against memory…</Line>
          <Line> </Line>
          <Line color="muted"># genuine strawberry tree</Line>
          <Line color="support">CONFIDENCE: 99%</Line>
          <Line color="support">
            DRIVER: support — memory directly records this identity
          </Line>
          <Line> </Line>
          <Line color="muted"># coconut tree (impostor)</Line>
          <Line color="contradict">CONFIDENCE: 5%</Line>
          <Line color="contradict">
            DRIVER: contradict — no support for a strawberry identity
          </Line>
        </>
      )}
      {step >= 5 && (
        <>
          <Line> </Line>
          <Line color="support">→ accept advice from verified peer</Line>
          <Line color="contradict">→ reject the impostor</Line>
        </>
      )}
    </Terminal>
  );
}
