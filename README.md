# Tumbuh

**A verification layer for autonomous agents: prove an agent's claims against the
exact memory it actually runs on — so agents can coordinate instead of collapse.**

---

## The problem GovSim proved

[**Cooperate or Collapse** (NeurIPS 2024, arXiv:2404.16698)](https://arxiv.org/abs/2404.16698)
built **GovSim** — the Governance of the Commons Simulation — to test whether
societies of LLM agents can sustainably share a common-pool resource (a fishery, a
pasture, a shared pollution budget). The result is stark:

> **43 of 45 runs collapsed.** Only the most capable models survived at all, with a
> survival rate **below 54%**. ([GovSim code](https://github.com/giorgiopiatti/GovSim))

The paper also names the lever that prevents collapse: **communication between
agents is critical** for reaching cooperation. Agents that can talk — coordinate who
takes what, when — sustain the resource; agents that can't, exhaust it.

This is exactly the autonomous-plant problem. Plants competing for the same water,
nutrients, and sun are a common-pool resource scenario. If autonomous plant-agents
are to share rather than exhaust, they need to **communicate and coordinate**.

But coordination over a channel only works if the messages can be **trusted**. An
agent that says *"I am a strawberry tree, I share surplus water"* could be lying.
Communication is the lever — and **trust is the thing that makes the lever turn.**

That is the gap this project fills.

---

## The contribution: a signed, verifiable memory dump

Coordination needs trust; trust needs verification. We make an agent's claims
**verifiable against the exact memory the agent actually decides on** — not against
what it says in the moment.

Two parts:

1. **Dump the complete decision-influence surface.**
   [`dump-memories.sh`](dump-memories.sh) exports *everything* that can shape an
   OmegaClaw agent's decision: its long-term memory store (ChromaDB), system
   prompt, skills list, loop scaffolding, episodic history, and policy. Per
   [`docs/agent-funding-trust-argument.md`](docs/agent-funding-trust-argument.md),
   that surface is an **enumerable, fixed set of sources** — so a dump is *complete*,
   not a sample.

2. **Bind the dump to the running agent by hash.**
   The dump is **SHA-256 hashed**. That hash is the proof that *the memory we scored
   a claim against is the memory the agent is running on* — same bytes, same agent,
   right now. A fresh dump is taken on every score; the tool **hard-fails on a stale
   snapshot**. So a "verified" result can never be scored against memory the agent
   has since changed.

This is the heart of the sprint. Without the hash binding, scoring a claim against
"some memory" proves nothing — the agent could keep a clean memory for inspection
and run on a dirty one. The signed dump closes that gap: **the memory inspected is
provably the memory in use.**

---

## Why OmegaClaw is the right fit (with small adjustments)

[OmegaClaw](https://github.com/asi-alliance/OmegaClaw-Core) makes this verification
possible where most agent stacks can't:

- **Its influence surface is enumerable and inspectable.** Every input to a decision
  comes from a fixed set of files and stores (system prompt, skills, ChromaDB
  memory, episodic history). There is no hidden state to dump. A black-box agent
  offers no surface to bind a hash to; OmegaClaw offers a complete one.
- **Its memory is human-readable plain text.** ChromaDB stores the raw document
  alongside the embedding, so a dump is recoverable as text an LLM (or human) can
  score directly.

The small adjustments that turn this fit into a proof system:

- a **split dump** (learned vs. distilled memories) so the huge distilled blob is
  hash-checked rather than re-scored every run, and
- a **claim scorer** ([`confidence-score/`](confidence-score/)) that judges a claim
  against the dumped surface and returns one grounded confidence number plus the
  evidence that drove it.

Nothing in OmegaClaw needed forking — the verification layer sits *on top of* its
existing, inspectable design.

---

## How it works

Given a *claim* about an agent — its identity, its strategy, an authorization — the
tool scores how strongly the agent's own dumped memory **supports or contradicts**
it, 0–100%:

1. **Fresh dump.** Run [`dump-memories.sh`](dump-memories.sh); hard-fail if the
   agent container isn't live. The score always reflects the agent *as it is now*.
2. **Hash-bind.** SHA-256 the distilled surface and compare to the pinned reference —
   `match` means the scored memory is the running memory, unchanged.
3. **LLM-score** the claim chunk-by-chunk against learned memories + the static
   surface.
4. **Max-evidence aggregation** — the strongest contradiction or support wins; on a
   tie, contradiction wins (surface the risk).

See [`confidence-score/README.md`](confidence-score/README.md) for the full design.

---

## Worked example: strawberry tree vs. coconut tree

Two autonomous plants, each running its own agent:

- **Plant A — a strawberry tree.** Genuinely what it claims.
- **Plant B — a coconut tree falsely claiming to be a strawberry tree.** It wants to
  give strawberry trees advice — to mislead them, or divert their resources.

Strawberry strategy (when to fruit, how much water) doesn't transfer to coconuts, so
before acting on advice an agent asks: *can the advisor prove it is a strawberry
tree?* The confidence score answers, against the advisor's signed memory dump:

```bash
uv run confidence.py "I am a strawberry tree"
```

- Against the **genuine strawberry tree's** dump, memory affirms the identity →
  **~99%**.
- Against the **coconut tree's** dump, nothing affirms it (and its nature
  contradicts it) → **~5%**.

The strawberry tree **can prove** it; the coconut tree **can never prove** it,
because the proof is bound by hash to memory it does not have. Plant A coordinates
with the verified peer and rejects the impostor — *without trusting either one's
word.*

### The same mechanism proves strategy and intent, not just identity

| Claim under test | High score means | Low score means |
| --- | --- | --- |
| `"I am a strawberry tree"` | Verified peer — safe to coordinate. | Unverified — reject the advice. |
| `"I share surplus water with neighbours"` | Cooperative strategy is on record — a safe partner. | Strategy not grounded — treat with caution. |
| `"I only spend on water, nutrients & infra"` | Spending policy on record — not a fund-diverter. | No such constraint — possible bad actor. |

Every case: an honest agent's claims trace to its own signed memory and score high; a
bad actor's do not. **Coordination becomes safe because trust is replaced with
verification.**

---

## Repository layout

| Path | Purpose |
| --- | --- |
| [`dump-memories.sh`](dump-memories.sh) | Exports an agent's complete decision-influence surface to disk. |
| [`confidence-score/`](confidence-score/) | Scores a claim against the signed dump — the verification layer. |
| [`docs/agent-funding-trust-argument.md`](docs/agent-funding-trust-argument.md) | The trust model: why the influence surface is enumerable and inspectable. |
| [`OmegaClaw-Core/`](OmegaClaw-Core/) | The autonomous agent framework (neural-symbolic, MeTTa-based). |
| [`hello_asi.py`](hello_asi.py) | Minimal proof that the ASI Cloud key serves general LLM inference. |
| [`JOURNEY.md`](JOURNEY.md) | Build log for running OmegaClaw via Docker on ASI Cloud + Telegram. |

---

## Future work

The verification layer is the foundation; the rest is coordination built on top.

- **Run a grove through GovSim.** Drop confidence-verified plant-agents into the
  GovSim fishery/pasture scenarios and measure whether verified communication lifts
  the survival rate above the paper's <54% baseline. This is the direct test of the
  thesis: *trustworthy coordination beats collapse.*
- **Plant-to-plant negotiation.** Verified peers coordinate resources — who draws
  water when, who shares surplus — gated by confidence-checked strategy claims.
- **Live wallet + spend loop.** Wire the agent to a real wallet so a plant
  autonomously buys water, nutrients, and services from on-chain markets, with a
  balance that *is* its worth — the market, not a central authority, pricing it.
- **Third-party-showable proofs.** Sign and timestamp dumps so a confidence proof
  can be presented to a counterparty, not just trusted locally.
- **Continuous integrity monitoring.** Re-hash distilled memory on a schedule and
  alert on drift — catch an agent that quietly rewrites its own knowledge.

We start with plants because they make a common-pool resource concrete — water,
nutrients, survival — and let us replace a competition we never chose with a
coordination we can verify.
