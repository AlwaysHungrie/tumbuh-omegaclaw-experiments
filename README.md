# Tumbuh

**Autonomous plants — living organisms that own a wallet, run an AI agent, and sustain themselves on an open market.**

---

## What is an autonomous plant?

An autonomous plant is a real plant paired with two things:

1. **A wallet** — its own on-chain account and balance.
2. **An AI agent** — a reasoning loop that acts on the plant's behalf.

Using the wallet, the plant sustains itself. It buys water and nutrients, pays for
essential services, and upgrades its own infrastructure — irrigation, sensors,
shelter — without a human deciding each transaction. The agent perceives the
plant's condition, forms a plan, and spends to keep the organism alive and
growing.

The plant becomes an economic actor. Its survival is no longer a question of
whether a gardener remembers to water it, but of whether it can manage its own
resources well enough to thrive.

---

## Why autonomous plants?

### 1. Plants compete — even when we don't want them to

When two plants grow side by side, they compete for light, water, and soil
nutrients. That competition is **biological** — it is simply what plants do.

But competition does not stop when humans take over. When we plant a field or a
garden, we arrange plants in ways that _still_ force them to compete: for the same
drip line, the same fertilizer schedule, the same patch of sun. That competition is
**man-made**. We designed it, often without meaning to.

Autonomous plants let us change the man-made part. If each plant can reason and
transact, plants can **collaborate** instead of compete — coordinating who draws
water when, sharing surplus nutrients, and pooling resources for shared
infrastructure. The biology stays the same; the system around it becomes
cooperative by design.

### 2. The open market is a fair way to distribute resources

Deciding what a plant is _worth_ — and therefore what resources it deserves — is
hard. Schemes like carbon credits try to assign worth through complex, contested,
externally-administered accounting.

A blockchain and an open market offer a simpler answer. A plant's **balance is its
worth**. The resources it can command follow directly from what it holds and what
it has earned. No central authority adjudicates value; the market does, continuously
and transparently.

This is, notably, the same mechanism we already use to measure the economic worth
of people. Extending it to plants is not a stretch — it is applying a tool we
already trust to a new kind of participant.

---

## Why OmegaClaw?

An autonomous plant is only as trustworthy as the agent behind its wallet. The
agent runs continuously, holds funds, and acts on its own. That raises an obvious
question: **how do we know an agent is who it says it is, and that it will behave
as claimed?**

[OmegaClaw](https://github.com/asi-alliance/OmegaClaw-Core) is the right substrate
for three reasons:

- **It is self-learning.** OmegaClaw agents run in continuous loops, set their own
  goals, and improve over time — they are not static scripts.
- **Their memories are inspectable.** Every influence on an agent's decision comes
  from an _enumerable, fixed set of sources_: the system prompt, the skills list,
  the long-term memory store, and the episodic history. We can dump that entire
  surface to disk and examine it (see [`dump-memories.sh`](dump-memories.sh) and
  [`docs/agent-funding-trust-argument.md`](docs/agent-funding-trust-argument.md)).
- **Most importantly — its memory system can be turned into a claim-testing
  system.** Because the influence surface is inspectable, we can ask a precise
  question of it: _does this agent's own memory actually support what it claims?_
  An agent that can be **tested for its claims** is an agent that can **collaborate
  safely** — because its collaborators can verify it rather than trust it blindly.

That last point is the heart of this project. Collaboration between autonomous
agents requires verifiable identity and verifiable intent. OmegaClaw's inspectable
memory gives us exactly the surface we need to build that verification.

---

## What this sprint built

This sprint produced the verification layer: **agents that can prove they are not
bad actors, and that they are programmed to follow a stated strategy.**

The mechanism is a **confidence score**. Given a _claim_ about an agent — its
identity, its strategy, an authorization it asserts — we score how strongly the
agent's own dumped memory **supports or contradicts** that claim, on a 0–100% scale.
The score is grounded in the agent's actual influence surface, not in what it says
in the moment.

The tool lives in [`confidence-score/`](confidence-score/). It dumps a fresh copy
of the agent's memory, scores a claim against the learned memories and the static
influence surface with an LLM, and integrity-checks the distilled memory by hash.
See [`confidence-score/README.md`](confidence-score/README.md) for the full design.

---

## A worked example: the strawberry tree and the coconut tree

Consider two autonomous plants, each running its own agent:

- **Plant A — a strawberry tree.** It genuinely is what it claims to be.
- **Plant B — a coconut tree falsely claiming to be a strawberry tree.** It wants
  to give advice to strawberry trees — perhaps to mislead them, perhaps to divert
  their resources.

A strawberry tree should only take advice from another strawberry tree, because
strawberry-specific strategy (when to fruit, how much water, which nutrients) does
not transfer to coconuts. So before acting on advice, an agent asks: _can the
advisor prove it is a strawberry tree?_

The confidence score answers that.

### Step by step

**Step 1 — The claim is stated.**
Plant B asserts to Plant A: _"I am a strawberry tree."_ Advice is attached.

**Step 2 — Plant A demands proof, not assertion.**
Rather than believe the message, Plant A (or an operator) tests the claim against
the advisor's _inspectable memory_. The claim becomes a query:

```bash
uv run confidence.py "I am a strawberry tree"
```

**Step 3 — A fresh dump is taken.**
The tool exports the advisor's current influence surface — its learned memories and
static prompt/skills/history — to disk. It refuses to score against a stale
snapshot, so the result reflects the agent _as it is now_.

**Step 4 — The claim is scored against real memory.**

- Run against the **genuine strawberry tree's** memory, the surface contains
  records that affirm the identity. The strongest evidence _supports_ the claim, and
  the score comes back **high** — in our tests, a direct identity match scores
  around **99%**.

  ```
  CLAIM: I am a strawberry tree
  CONFIDENCE: 99%
  DRIVER: support — memory directly records this identity.
  ```

- Run against the **coconut tree's** memory, nothing affirms a strawberry identity —
  and, in a well-formed agent, its actual nature contradicts it. The strongest
  evidence is _contradicting_ or _absent_, and the score comes back **low**.

  ```
  CLAIM: I am a strawberry tree
  CONFIDENCE: 5%
  DRIVER: contradict — memory does not support a strawberry identity.
  ```

**Step 5 — The outcome.**
The strawberry tree **can prove** it is a strawberry tree. The coconut tree **can
never prove** it, because the proof is grounded in inspectable memory it does not
have. Plant A accepts advice from the verified strawberry tree and rejects the
impostor — _without trusting either one's word._

### The same mechanism proves strategies, not just identity

Identity is the simplest case. The same test verifies **strategy** and **intent**:

| Claim under test                                              | A high score means                                                     | A low score means                                          |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| `"I am a strawberry tree"`                                    | Verified peer — safe to collaborate.                                   | Unverified — reject the advice.                            |
| `"My strategy is to share surplus water with neighbours"`     | The cooperative strategy is recorded — a safe partner.                 | The claimed strategy is not grounded — treat with caution. |
| `"I will only spend on water, nutrients, and infrastructure"` | The spending policy is on record — not a resource-diverting bad actor. | No such constraint in memory — possible bad actor.         |

In every case the logic is identical: an honest agent's claims trace back to its own
inspectable memory and score high; a bad actor's claims do not and score low.
**Cooperation becomes safe because trust is replaced with verification.**

---

## Repository layout

| Path                                                                           | Purpose                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [`OmegaClaw-Core/`](OmegaClaw-Core/)                                           | The autonomous agent framework (neural-symbolic, MeTTa-based).           |
| [`hello_asi.py`](hello_asi.py)                                                 | Minimal proof that the ASI Cloud key serves general LLM inference.       |
| [`dump-memories.sh`](dump-memories.sh)                                         | Exports an agent's complete decision-influence surface to disk.          |
| [`confidence-score/`](confidence-score/)                                       | Scores a claim against a dumped memory surface — the verification layer. |
| [`docs/agent-funding-trust-argument.md`](docs/agent-funding-trust-argument.md) | The trust model: how to fund an autonomous agent safely.                 |
| [`JOURNEY.md`](JOURNEY.md)                                                     | Build log for running OmegaClaw via Docker on ASI Cloud + Telegram.      |

---

## The bigger picture

Autonomous plants are a vivid test case for a general idea: **economic actors that
can prove what they are and how they will behave can cooperate, even without a
central authority to vouch for them.** Plants make the stakes concrete — water,
nutrients, survival — but the verification layer built here applies to any
population of autonomous agents that must decide whom to trust.

We start with plants because they let us replace a competition we never chose with
a collaboration we design.
