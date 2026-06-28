"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Brain,
  Sprout,
  Scale,
  Eye,
  RefreshCcw,
  ShieldCheck,
  Network,
  Coins,
  GitBranch,
  Boxes,
  ArrowRight,
} from "lucide-react";
import type { Slide } from "./Deck";
import { Plant } from "./Plant";
import { WorkedExample } from "./WorkedExample";
import { Kicker, Title, Lead, Card, Pill } from "./ui";

export const slides: Slide[] = [
  // 1 — TITLE
  {
    id: "title",
    label: "Tumbuh",
    render: () => (
      <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <Kicker>Tumbuh · to grow</Kicker>
          <Title>
            Autonomous plants that{" "}
            <span className="text-primary">sustain themselves.</span>
          </Title>
          <Lead>
            Give a plant a wallet and an AI agent. It buys its own water and
            nutrients, pays for services, and upgrades its infrastructure — and
            it can <strong className="text-foreground">prove</strong> what it is
            and how it will behave.
          </Lead>
          <div className="mt-7 flex flex-wrap gap-2">
            <Pill tone="primary">
              <Wallet size={13} /> Wallet
            </Pill>
            <Pill tone="primary">
              <Brain size={13} /> AI agent
            </Pill>
            <Pill tone="accent">
              <ShieldCheck size={13} /> Verifiable claims
            </Pill>
          </div>
          <p className="mt-8 font-mono text-xs text-muted">
            Use ← → or the dots below to navigate.
          </p>
        </div>
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Plant variant="strawberry" className="h-64 w-64" />
          </motion.div>
        </div>
      </div>
    ),
  },

  // 2 — WHAT IS AN AUTONOMOUS PLANT
  {
    id: "what",
    label: "What is it",
    render: () => (
      <div>
        <Kicker>The idea</Kicker>
        <Title>What is an autonomous plant?</Title>
        <Lead>
          A real plant paired with two things — and the autonomy to use them.
        </Lead>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card delay={0.1}>
            <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">
              <Wallet size={20} />
            </div>
            <h3 className="text-lg font-bold">A wallet</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Its own on-chain account and balance. The plant becomes an economic
              actor with resources it controls directly.
            </p>
          </Card>
          <Card delay={0.18}>
            <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">
              <Brain size={20} />
            </div>
            <h3 className="text-lg font-bold">An AI agent</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              A reasoning loop that perceives the plant&apos;s condition, forms a
              plan, and spends to keep the organism alive and growing.
            </p>
          </Card>
        </div>
        <Card delay={0.28} className="mt-4 border-l-4 border-l-accent">
          <p className="text-pretty leading-relaxed">
            Survival stops being a question of whether a gardener remembers to
            water it — and becomes a question of whether the plant can{" "}
            <strong>manage its own resources well enough to thrive.</strong>
          </p>
        </Card>
      </div>
    ),
  },

  // 3 — WHY #1: COMPETITION
  {
    id: "why-compete",
    label: "Why — competition",
    render: () => (
      <div>
        <Kicker>Why · 01</Kicker>
        <Title>Plants compete — even when we don&apos;t want them to.</Title>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card delay={0.1}>
            <Pill tone="primary">Biological</Pill>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Side by side, plants compete for light, water, and nutrients. That
              is simply what plants do.
            </p>
          </Card>
          <Card delay={0.18}>
            <Pill tone="contradict">Man-made</Pill>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              When we plant a field, we <em>still</em> force competition — the
              same drip line, the same schedule, the same sun. We designed it,
              often without meaning to.
            </p>
          </Card>
          <Card delay={0.26} className="bg-primary-soft">
            <Pill tone="support">We can change this</Pill>
            <p className="mt-3 text-sm leading-relaxed text-primary-strong">
              If each plant can reason and transact, plants can{" "}
              <strong>collaborate</strong> — coordinating water, sharing surplus
              nutrients, pooling for shared infrastructure.
            </p>
          </Card>
        </div>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-muted">
          The biology stays the same. The system around it becomes{" "}
          <strong className="text-foreground">cooperative by design.</strong>
        </p>
      </div>
    ),
  },

  // 4 — WHY #2: MARKET
  {
    id: "why-market",
    label: "Why — the market",
    render: () => (
      <div>
        <Kicker>Why · 02</Kicker>
        <Title>The open market distributes resources fairly.</Title>
        <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2">
          <Card delay={0.1}>
            <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <Scale size={20} />
            </div>
            <h3 className="text-lg font-bold">The hard problem</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              What is a plant <em>worth</em>? Carbon-credit schemes assign worth
              through complex, contested, externally-administered accounting.
            </p>
          </Card>
          <Card delay={0.18} className="bg-primary-soft">
            <div className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-white/60 text-primary-strong">
              <Coins size={20} />
            </div>
            <h3 className="text-lg font-bold text-primary-strong">
              The simpler answer
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-primary-strong">
              A plant&apos;s <strong>balance is its worth.</strong> The resources
              it can command follow from what it holds and earns. No central
              authority — the market decides, continuously and transparently.
            </p>
          </Card>
        </div>
        <Card delay={0.28} className="mt-4">
          <p className="text-pretty leading-relaxed text-muted">
            This is the same mechanism we already use to measure the economic
            worth of <strong className="text-foreground">people.</strong>{" "}
            Extending it to plants is not a stretch — it applies a tool we
            already trust to a new kind of participant.
          </p>
        </Card>
      </div>
    ),
  },

  // 5 — WHY OMEGACLAW
  {
    id: "omegaclaw",
    label: "Why OmegaClaw",
    render: () => (
      <div>
        <Kicker>The substrate</Kicker>
        <Title>Why OmegaClaw?</Title>
        <Lead>
          A plant is only as trustworthy as the agent behind its wallet. How do
          we know an agent is who it says it is — and will behave as claimed?
        </Lead>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card delay={0.1}>
            <RefreshCcw size={22} className="text-primary" />
            <h3 className="mt-3 font-bold">Self-learning</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Agents run in continuous loops, set their own goals, and improve
              over time — not static scripts.
            </p>
          </Card>
          <Card delay={0.18}>
            <Eye size={22} className="text-primary" />
            <h3 className="mt-3 font-bold">Inspectable memory</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Every decision-influence comes from an enumerable set of sources —
              prompt, skills, memory, history. The whole surface dumps to disk.
            </p>
          </Card>
          <Card delay={0.26} className="bg-accent-soft ring-1 ring-accent/30">
            <ShieldCheck size={22} className="text-accent" />
            <h3 className="mt-3 font-bold">
              Memory → a claim-testing system
              <span className="ml-2 align-middle">
                <Pill tone="accent">most important</Pill>
              </span>
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
              Because the surface is inspectable, we can ask: does the
              agent&apos;s own memory support what it claims? An agent that can
              be <strong>tested</strong> is one that can{" "}
              <strong>collaborate safely.</strong>
            </p>
          </Card>
        </div>
        <p className="mt-6 max-w-3xl text-pretty text-muted">
          Collaboration between autonomous agents needs verifiable identity and
          intent. Inspectable memory gives us exactly that surface.
        </p>
      </div>
    ),
  },

  // 6 — WHAT THE SPRINT BUILT
  {
    id: "sprint",
    label: "This sprint",
    render: () => (
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr]">
        <div>
          <Kicker>This sprint</Kicker>
          <Title>
            Agents that can <span className="text-primary">prove</span> they
            aren&apos;t bad actors.
          </Title>
          <Lead>
            The mechanism is a <strong className="text-foreground">confidence
            score.</strong> Given a claim about an agent — its identity, its
            strategy, an authorization — we score how strongly its own dumped
            memory supports or contradicts it, 0–100%.
          </Lead>
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill tone="support">grounded in real memory</Pill>
            <Pill tone="primary">fresh dump every run</Pill>
            <Pill tone="accent">distilled set hash-verified</Pill>
          </div>
        </div>
        <Card delay={0.2}>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            confidence-score/
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-mono text-primary">1.</span>
              <span>
                Take a <strong>fresh dump</strong> of the agent&apos;s influence
                surface. Hard-fail on stale data.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-primary">2.</span>
              <span>
                <strong>LLM-score</strong> the claim against learned memories +
                static surface, chunk by chunk.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-primary">3.</span>
              <span>
                <strong>Hash-verify</strong> the distilled memory — integrity
                without paying to score a huge blob.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-primary">4.</span>
              <span>
                <strong>Max-evidence</strong> aggregation — the strongest
                contradiction or support wins.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    ),
  },

  // 7 — WORKED EXAMPLE (the centerpiece)
  {
    id: "worked-example",
    label: "Worked example",
    render: () => (
      <div>
        <div className="mb-5">
          <Kicker>Worked example · the centerpiece</Kicker>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The strawberry tree and the coconut tree
          </h2>
          <p className="mt-2 max-w-3xl text-pretty text-muted">
            A coconut tree falsely claims to be a strawberry tree to give advice.
            Strawberry strategy doesn&apos;t transfer to coconuts — so before
            acting, the agent asks: <em>can you prove it?</em> Step through it.
          </p>
        </div>
        <WorkedExample />
      </div>
    ),
  },

  // 8 — BEYOND IDENTITY: STRATEGIES
  {
    id: "strategies",
    label: "Proving strategies",
    render: () => (
      <div>
        <Kicker>Generalizing</Kicker>
        <Title>It proves strategies, not just identity.</Title>
        <Lead>
          Identity is the simplest case. The same test verifies an agent&apos;s
          strategy and intent — the building blocks of safe collaboration.
        </Lead>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Claim under test</th>
                <th className="px-5 py-3 font-semibold">High score means</th>
                <th className="px-5 py-3 font-semibold">Low score means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                [
                  '"I am a strawberry tree"',
                  "Verified peer — safe to collaborate.",
                  "Unverified — reject the advice.",
                ],
                [
                  '"I share surplus water with neighbours"',
                  "Cooperative strategy is on record — a safe partner.",
                  "Strategy not grounded — treat with caution.",
                ],
                [
                  '"I only spend on water, nutrients & infra"',
                  "Spending policy on record — not a fund-diverter.",
                  "No such constraint — possible bad actor.",
                ],
              ].map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="bg-surface align-top"
                >
                  <td className="px-5 py-4 font-mono text-xs text-foreground">
                    {row[0]}
                  </td>
                  <td className="px-5 py-4 text-[var(--support)]">{row[1]}</td>
                  <td className="px-5 py-4 text-[var(--contradict)]">
                    {row[2]}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-3xl text-pretty text-lg text-muted">
          The logic is identical every time:{" "}
          <strong className="text-foreground">
            trust is replaced with verification.
          </strong>
        </p>
      </div>
    ),
  },

  // 9 — ROADMAP / FUTURE (special emphasis)
  {
    id: "roadmap",
    label: "What's next",
    render: () => (
      <div>
        <Kicker>What I&apos;ll build next</Kicker>
        <Title>From proving claims to a cooperating grove.</Title>
        <Lead>
          The verification layer is the foundation. Next, turn verified claims
          into real coordination between plants.
        </Lead>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: <Wallet size={20} />,
              tag: "Next",
              title: "Live wallet + spend loop",
              body: "Wire the agent to a real wallet so a plant autonomously buys water, nutrients, and services from on-chain markets.",
            },
            {
              icon: <Network size={20} />,
              tag: "Next",
              title: "Plant-to-plant negotiation",
              body: "Verified peers coordinate resources — who draws water when, who shares surplus — gated by confidence-checked strategy claims.",
            },
            {
              icon: <ShieldCheck size={20} />,
              tag: "Hardening",
              title: "Tamper-evident dumps",
              body: "Sign and timestamp each dump so a confidence proof can be shown to a third party, not just trusted locally.",
            },
            {
              icon: <GitBranch size={20} />,
              tag: "Hardening",
              title: "Semantic claims, not exclusivity",
              body: "Refine scoring so inclusive claims (“I like mango”) and exclusive ones (“my only favourite”) are judged correctly.",
            },
            {
              icon: <Boxes size={20} />,
              tag: "Scale",
              title: "Continuous integrity monitoring",
              body: "Re-hash distilled memory on a schedule and alert on drift — catch an agent that quietly rewrites its own knowledge.",
            },
            {
              icon: <Sprout size={20} />,
              tag: "Scale",
              title: "A grove of plants",
              body: "Many autonomous plants on one shared market, cooperating instead of competing — the man-made competition, undone.",
            },
          ].map((item, i) => (
            <Card key={item.title} delay={0.08 * i}>
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                  {item.icon}
                </div>
                <div>
                  <div className="mb-1">
                    <Pill
                      tone={
                        item.tag === "Next"
                          ? "support"
                          : item.tag === "Scale"
                            ? "accent"
                            : "primary"
                      }
                    >
                      {item.tag}
                    </Pill>
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ),
  },

  // 10 — CLOSING
  {
    id: "closing",
    label: "The bigger picture",
    render: () => (
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Kicker>The bigger picture</Kicker>
          <Title>
            Replace a competition we never chose with a collaboration we design.
          </Title>
          <Lead>
            Economic actors that can prove what they are — and how they will
            behave — can cooperate without a central authority to vouch for them.
            Plants make the stakes concrete: water, nutrients, survival.
          </Lead>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white">
              <Sprout size={16} /> Tumbuh — to grow
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-sm text-muted">
              verification &gt; trust <ArrowRight size={14} />
            </span>
          </div>
        </div>
        <div className="flex justify-center gap-6">
          <Plant variant="strawberry" verified className="h-44 w-44" />
          <Plant variant="coconut" className="h-44 w-44 self-end" />
        </div>
      </div>
    ),
  },
];
