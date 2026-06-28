"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Brain,
  Sprout,
  Eye,
  ShieldCheck,
  Network,
  Fingerprint,
  Hash,
  MessageSquare,
  TrendingDown,
  GitBranch,
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
            Agents that can{" "}
            <span className="text-primary">prove their claims.</span>
          </Title>
          <Lead>
            A verification layer for autonomous agents. Bind an agent&apos;s
            claims to the <strong className="text-foreground">exact memory it
            actually runs on</strong> — so agents can coordinate instead of
            collapse.
          </Lead>
          <div className="mt-7 flex flex-wrap gap-2">
            <Pill tone="accent">
              <ShieldCheck size={13} /> Verifiable claims
            </Pill>
            <Pill tone="primary">
              <Hash size={13} /> Signed memory dump
            </Pill>
            <Pill tone="support">
              <Network size={13} /> Safe coordination
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
            <Plant variant="strawberry" verified className="h-64 w-64" />
          </motion.div>
        </div>
      </div>
    ),
  },

  // 2 — THE PROBLEM: GOVSIM
  {
    id: "govsim",
    label: "The problem",
    render: () => (
      <div>
        <Kicker>The problem · proven</Kicker>
        <Title>LLM agent societies collapse the commons.</Title>
        <Lead>
          <strong className="text-foreground">GovSim</strong> (Cooperate or
          Collapse, NeurIPS 2024) put societies of LLM agents on a shared
          resource — a fishery, a pasture. The result is stark.
        </Lead>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card delay={0.1} className="bg-surface-2">
            <TrendingDown size={22} className="text-[var(--contradict)]" />
            <h3 className="mt-3 text-3xl font-bold">43 / 45</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              runs <strong>collapsed</strong> — the agents exhausted the shared
              resource.
            </p>
          </Card>
          <Card delay={0.18} className="bg-surface-2">
            <Sprout size={22} className="text-[var(--contradict)]" />
            <h3 className="mt-3 text-3xl font-bold">&lt; 54%</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              best survival rate — and only for the most capable models.
            </p>
          </Card>
          <Card delay={0.26} className="bg-primary-soft ring-1 ring-primary/30">
            <MessageSquare size={22} className="text-primary-strong" />
            <h3 className="mt-3 font-bold text-primary-strong">
              Communication is the lever
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-primary-strong">
              The paper&apos;s finding: agents that{" "}
              <strong>coordinate</strong> sustain the resource. Those that
              can&apos;t, exhaust it.
            </p>
          </Card>
        </div>
        <p className="mt-6 max-w-3xl text-pretty text-muted">
          Plants competing for the same water and sun{" "}
          <em>are</em> a common-pool resource. To share rather than exhaust, the
          agents must coordinate.
        </p>
      </div>
    ),
  },

  // 3 — THE GAP: COORDINATION NEEDS TRUST
  {
    id: "gap",
    label: "The gap",
    render: () => (
      <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <Kicker>The gap</Kicker>
          <Title>
            Coordination is the lever.{" "}
            <span className="text-primary">Trust turns it.</span>
          </Title>
          <Lead>
            Agents coordinate by sending messages. But a message —{" "}
            <em>&quot;I&apos;m a strawberry tree, I share surplus water&quot;</em>{" "}
            — is just a claim. It could be a lie.
          </Lead>
          <Card delay={0.2} className="mt-6 border-l-4 border-l-accent">
            <p className="text-pretty leading-relaxed">
              Communication enables cooperation only if the messages can be{" "}
              <strong>trusted.</strong> Without verification, one bad actor
              poisons the channel and the commons collapses anyway.
            </p>
          </Card>
        </div>
        <Card delay={0.15}>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            the chain
          </p>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Sprout size={18} className="text-primary" /> Survive the commons
            </li>
            <li className="flex items-center gap-3 pl-2">
              <ArrowRight size={14} className="text-muted" /> needs{" "}
              <strong>coordination</strong>
            </li>
            <li className="flex items-center gap-3 pl-2">
              <ArrowRight size={14} className="text-muted" /> needs{" "}
              <strong>trusted messages</strong>
            </li>
            <li className="flex items-center gap-3 pl-2">
              <ArrowRight size={14} className="text-muted" /> needs{" "}
              <strong className="text-primary-strong">verifiable claims</strong>
            </li>
          </ul>
          <p className="mt-5 text-sm text-muted">
            This project builds the last link.
          </p>
        </Card>
      </div>
    ),
  },

  // 4 — WHY OMEGACLAW IS THE RIGHT FIT
  {
    id: "omegaclaw",
    label: "Why OmegaClaw",
    render: () => (
      <div>
        <Kicker>The substrate</Kicker>
        <Title>Why OmegaClaw fits — with small adjustments.</Title>
        <Lead>
          Verifying a claim against memory needs an agent whose memory you can
          fully capture. Most stacks are black boxes. OmegaClaw isn&apos;t.
        </Lead>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card delay={0.1}>
            <Eye size={22} className="text-primary" />
            <h3 className="mt-3 font-bold">Enumerable influence surface</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Every input to a decision comes from a fixed set — prompt, skills,
              ChromaDB memory, episodic history. No hidden state. A dump is{" "}
              <strong>complete</strong>, not a sample.
            </p>
          </Card>
          <Card delay={0.18}>
            <Brain size={22} className="text-primary" />
            <h3 className="mt-3 font-bold">Human-readable memory</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              ChromaDB stores the raw document beside the embedding — recoverable
              as plain text an LLM can score directly.
            </p>
          </Card>
        </div>
        <Card delay={0.28} className="mt-4 bg-accent-soft ring-1 ring-accent/30">
          <p className="text-sm font-semibold text-accent">
            The small adjustments
          </p>
          <p className="mt-1.5 text-pretty leading-relaxed text-foreground/80">
            A <strong>split dump</strong> (hash the huge distilled blob, score
            the rest) and a <strong>claim scorer</strong> on top. Nothing forked
            — the layer sits on OmegaClaw&apos;s existing inspectable design.
          </p>
        </Card>
      </div>
    ),
  },

  // 5 — THE CONTRIBUTION: SIGNED DUMP
  {
    id: "signed-dump",
    label: "Signed dump",
    render: () => (
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr]">
        <div>
          <Kicker>The contribution · the heart of it</Kicker>
          <Title>
            A <span className="text-primary">signed</span> memory dump.
          </Title>
          <Lead>
            Scoring a claim against <em>some</em> memory proves nothing — the
            agent could keep a clean memory for show and run on a dirty one. The
            hash closes that gap.
          </Lead>
          <Card delay={0.2} className="mt-6 bg-primary-soft">
            <p className="text-pretty leading-relaxed text-primary-strong">
              The SHA-256 hash proves{" "}
              <strong>
                the memory we scored is the memory the agent is running on
              </strong>{" "}
              — same bytes, same agent, right now.
            </p>
          </Card>
        </div>
        <Card delay={0.15}>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            every run
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <Hash size={18} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <strong>Fresh dump</strong> of the full influence surface.
                Hard-fail on a stale snapshot.
              </span>
            </li>
            <li className="flex gap-3">
              <Fingerprint
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />
              <span>
                <strong>Hash-bind</strong> the distilled surface to the running
                agent — <span className="font-mono">match</span> = unchanged.
              </span>
            </li>
            <li className="flex gap-3">
              <Brain size={18} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <strong>LLM-score</strong> the claim chunk-by-chunk against the
                bound memory.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />
              <span>
                <strong>Max-evidence</strong> wins; on a tie, contradiction wins.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    ),
  },

  // 6 — WORKED EXAMPLE
  {
    id: "worked-example",
    label: "Worked example",
    render: () => (
      <div>
        <div className="mb-5">
          <Kicker>Worked example</Kicker>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The strawberry tree and the coconut tree
          </h2>
          <p className="mt-2 max-w-3xl text-pretty text-muted">
            A coconut tree falsely claims to be a strawberry tree to give advice.
            Strawberry strategy doesn&apos;t transfer to coconuts — so before
            acting, the agent asks: <em>can you prove it?</em>
          </p>
        </div>
        <WorkedExample />
      </div>
    ),
  },

  // 7 — STRATEGIES TABLE
  {
    id: "strategies",
    label: "Beyond identity",
    render: () => (
      <div>
        <Kicker>Generalizing</Kicker>
        <Title>It proves strategy and intent, not just identity.</Title>
        <Lead>
          The same test verifies the claims coordination actually depends on —
          who shares, who only spends on what.
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
                  "Verified peer — safe to coordinate.",
                  "Unverified — reject the advice.",
                ],
                [
                  '"I share surplus water with neighbours"',
                  "Cooperative strategy on record — a safe partner.",
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
          <strong className="text-foreground">
            Trust is replaced with verification
          </strong>{" "}
          — so the channel stays clean and the commons survives.
        </p>
      </div>
    ),
  },

  // 8 — FUTURE WORK
  {
    id: "future",
    label: "What's next",
    render: () => (
      <div>
        <Kicker>Future work</Kicker>
        <Title>From proving claims to surviving the commons.</Title>
        <Lead>
          The verification layer is the foundation. Everything else — the live
          economy, the autonomous-plant vision — builds on a trusted channel.
        </Lead>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: <TrendingDown size={20} />,
              tag: "The test",
              title: "Run a grove through GovSim",
              body: "Drop confidence-verified plant-agents into GovSim's fishery/pasture and measure whether verified communication beats the paper's <54% survival baseline.",
            },
            {
              icon: <Network size={20} />,
              tag: "Coordination",
              title: "Plant-to-plant negotiation",
              body: "Verified peers coordinate resources — who draws water when, who shares surplus — gated by confidence-checked strategy claims.",
            },
            {
              icon: <Wallet size={20} />,
              tag: "Economy",
              title: "Live wallet + spend loop",
              body: "A plant buys its own water, nutrients & services on-chain. Its balance is its worth — the market prices it, not a central authority.",
            },
            {
              icon: <GitBranch size={20} />,
              tag: "Hardening",
              title: "Third-party-showable proofs",
              body: "Sign and timestamp dumps so a confidence proof can be presented to a counterparty, not just trusted locally.",
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
                        item.tag === "The test"
                          ? "accent"
                          : item.tag === "Coordination"
                            ? "support"
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

  // 9 — CLOSING
  {
    id: "closing",
    label: "The bigger picture",
    render: () => (
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Kicker>The bigger picture</Kicker>
          <Title>Verifiable claims keep the commons alive.</Title>
          <Lead>
            GovSim showed agent societies collapse without trusted coordination.
            A signed memory dump makes claims verifiable — so agents can
            coordinate without trusting each other&apos;s word. Plants make the
            stakes concrete: water, nutrients, survival.
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
