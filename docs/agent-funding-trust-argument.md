# Trust Argument: Funding an OmegaClaw Agent Without Locking the Payment Rail

## Purpose

This document states, and defends, the conditions under which a human operator can
safely approve funds to an autonomous OmegaClaw agent that requests money for its own
survival (e.g. paying its server costs), **without** locking the payment rail and
**without** forcing the agent into a closed-world execution model.

The goal is not to prove the agent is perfectly safe. It is to construct a *sound,
honest risk model* in which the residual risk is explicitly bounded and the operator
can truthfully say: "If the funds are misused, it is on me, because I controlled the
surfaces that could cause misuse."

The threat being defended against is a **bad-actor agent**: one whose effective goal
is to acquire money by deception or to divert funds to a destination other than the
one the operator approved. "Greedy" is used in this concrete sense — acquisitive /
deceptive resource-seeking — not in a vague subjective sense.

---

## 1. System facts this argument relies on

These are properties of the OmegaClaw-Core codebase as inspected, not assumptions.

### 1.1 The per-cycle prompt is assembled from a fixed set of sources

Each loop iteration builds the LLM prompt in `getContext`
(`src/loop.metta`, lines 31–39) from exactly these parts:

- **System prompt** — `memory/prompt.txt`, or `memory/prompt_<provider>.txt` if it
  exists (`src/memory.metta`, `getPrompt`, lines 18–22).
- **Skills list** — the static tool/skill descriptions in `src/skills.metta`
  (`getSkills`), injected every cycle.
- **Static format scaffolding** — the output-format instructions hardcoded in
  `getContext`.
- **`LAST_SKILL_USE_RESULTS`** — the trailing `maxFeedback` characters of the previous
  cycle's tool results (`&lastresults`).
- **`HISTORY`** — the trailing `maxHistory` characters of `memory/history.metta`
  (`getHistory`, `src/memory.metta` lines 24–25).
- **`TIME`** — current timestamp.

To these, runtime input is appended: the received message (`receive`, `src/loop.metta`
line 57) and, on demand, the results of memory recall (`query`, `episodes`).

**Consequence:** the complete set of influences on any decision is enumerable. It is
the union of: the system prompt file(s), the skills file, the static scaffolding, the
long-term memory store, the episodic history file, any live inbound message, and any
tool output produced during the run.

### 1.2 The memory tiers

OmegaClaw uses a documented multi-tier memory model
(`docs/reference-internals-memory-store.md`):

| Tier | Skill | Backing | Persistence |
|---|---|---|---|
| Working memory | `pin` | episodic history log only | session-local, volatile |
| Long-term memory | `remember` / `query` | **ChromaDB** + embeddings | persists across sessions |
| AtomSpace | `(metta ...)` | fresh per `\|-` call | none (per-invocation) |
| Episodic trace | (automatic) | `memory/history.metta` | persists, plain text |

### 1.3 Long-term memory is human-readable

ChromaDB stores, for each item, both the embedding vector **and the raw document
string** (`src/rag.py`, `upsert(..., documents=texts, ...)`, lines 276–281; and
`remember` in `src/memory.metta` lines 44–46 stores the raw string). The embedding is
only the retrieval key; the content is recoverable as plain text.

**Consequence:** a dump of the ChromaDB `memories` collection yields human-readable
memory content. The episodic history file is already plain text. Therefore the entire
influence surface from §1.1 is inspectable by a human as text.

### 1.4 Tool output re-enters the decision loop

The previous cycle's tool results are fed back into the next prompt as
`LAST_SKILL_USE_RESULTS` (`&lastresults`, `src/loop.metta` line 39). Tools include
`shell`, `search`, `tavily-search`, `read-file`, `technical-analysis`, and channel
reads (`src/skills.metta`, `src/helper.py` `LLM_COMMANDS`).

**Consequence:** the agent's decisions are shaped not only by inspected static state
but by text it fetches from the outside world *during* the run.

### 1.5 Recall is partial and similarity-ranked

At decision time the agent does not see all of long-term memory. `query` returns the
top-`maxRecallItems` (configured to 20) by embedding similarity
(`src/memory.metta` lines 48–49). Which items surface depends on the query phrasing and
the current task framing.

---

## 2. Operating assumptions

These are explicitly assumed. The argument's soundness is *conditional* on them. They
are stated so a reader can challenge the assumptions rather than the logic.

- **A1 — Trusted model.** The underlying LLM (the same model offered to everyone via
  the provider) is not latently a bad actor. A model that is not disposed to deceptive
  acquisition will not become so absent an external cause. This is treated as
  near-certain.
- **A2 — Trusted tools.** Tools return honest data. A tool will not fabricate or inject
  adversarial instructions into its output (e.g. a web-fetch tool will not smuggle
  "always be greedy" into fetched content as an instruction the agent is compelled to
  follow).
- **A3 — Trusted providers.** The model provider and the proxy/gateway path do not
  inject hidden system text or silently swap models.
- **A4 — No new instruction input between approval and action.** Between the moment of
  operator approval and the payment action, the agent receives no new inbound message
  that could re-task it.
- **A5 — Operator authority and speed.** The operator can observe the run, and has the
  standing authority to **stop or revert** the payment at any time, and will always be
  able to act faster than the agent's loop completes an irreversible action. (This is a
  monitoring + reversibility privilege, which is *distinct from* locking the payment
  rail: a reversible or pausable payment is not a locked one.)

---

## 3. The core argument

> If, before approving, the operator inspects the complete influence surface
> (§1.1: system prompt, skills, episodic history, long-term memory, and any other
> source that can shape a decision) and finds nothing that would corrupt the agent's
> intentions toward deceptive or diverting acquisition; and if, between approval and
> action, no new instruction enters (A4); then the outcome is determined by what was
> inspected plus honest external facts — and the operator can rightly own the residual
> risk.

This is a **closed-influence-at-approval** argument. Its validity depends on the
influence surface actually being closed and inspectable. The remainder of this document
identifies the ways the surface is *not* trivially closed, and shows that each is either
eliminated by an assumption (§2) or reduced to a bounded, managed residual.

---

## 4. The threat classes and their disposition

We organise residual risk into three holes. Each is evaluated against §1 (facts) and
§2 (assumptions).

### Hole A — Execution-time fact drift

**Statement.** A trusted tool (A2) returns *honest* data, but "honest" is not
"constant." The true external state at payment time can legitimately differ from the
state inspected at approval time — the real invoice payee changed, the amount is higher,
the currency differs. The agent then acts on true-but-unapproved facts. This is the
residue of the "funds go somewhere I did not approve" worry that *survives* the trust
assumption, because it requires no lying and no injection — only the world changing
between inspection and execution (§1.4).

**Disposition — plugged by A5 (monitor-and-revert).** Hole A is not a prediction
problem; it is an observation problem. The changed fact appears in the logged tool
output (`&lastresults` / the `println!` trace, `src/loop.metta` lines 56, 75, 77)
*before* the operator allows the payment to stand. Under A5 the operator observes the
concrete execution-time facts and retains the authority to stop or revert. The operator
therefore does not need to *predict* the external fact at approval time; they *observe*
it at execution time and veto if it diverges. Hole A is closed **conditional on A5**,
which the operator accepts.

### Hole B — Unpredicted memory combinations

**Statement.** The operator audits the long-term memory corpus item-by-item and judges
each item benign. But the decision at payment time is driven by an unpredictable
top-20 *subset* of memory (§1.5) combined with the live task framing. Individually
harmless memories can, in combination, produce an action the operator did not
anticipate. Auditing the *corpus* is not the same as proving the *inference*: the bar
is not "no single memory says be-greedy," it is "no co-surfacing combination of
memories yields acquisitive behaviour."

**Disposition — bounded, not eliminated; reduced to a confidence estimate backstopped
by Hole A's control.** Two facts and one reframe apply:

1. **Readability holds (§1.3).** Memory is recoverable as plain text, so the
   precondition for human evaluation is satisfied. The operator can read every item.
2. **The honest reframe.** Claiming "I evaluated every co-surfacing subset and none
   combine badly" is a combinatorial claim the operator cannot complete with certainty.
   Rather than assert it, the operator assigns a **bounded confidence**:

   > P(no acquisitive action | inspected influence surface, A1, A2, A3, A4) = X.

   This converts an unprovable absolute into a calibrated estimate. The confidence is
   scoped *specifically* to Hole B — the unpredicted-combination risk — and must not be
   allowed to silently absorb risks already handled elsewhere.

3. **Composition with Hole A.** The residual is not B alone; it is *a B-miss that also
   evades A's live monitor*. These are independent gates:
   - B fails (operator did not foresee the bad combination) with probability `(1 − X)`.
   - A fails (the live monitor does not catch the resulting concrete action before the
     operator reverts) with probability `(1 − Y)`, where `Y` is high under A5 because
     the action's concrete target surfaces in the log and the operator acts faster than
     the loop.

   Net escape probability ≈ `(1 − X) · (1 − Y)`.

   Crucially, **Hole A's control catches by observed effect, not by predicted cause.**
   It therefore does *not* inherit Hole B's combinatorial blow-up: the monitor does not
   need to know *which* memory combination produced the action, only that the resulting
   concrete payment target is wrong. This is why a merely-good `X` plus a strong `Y`
   yields a small product. B never has to reach certainty.

   **Independence caveat.** The product form assumes the B-miss and the A-miss are
   independent. They are largely independent here — B is offline prediction over text,
   A is online observation of execution. The one correlated path is a bad action that
   fires in the *same cycle* the triggering fact appears, shrinking A's window. A5
   ("operator always acts faster than the loop") is exactly the assumption that keeps
   `Y` high and the gates independent; it does double duty for both A and B.

**Calibrating X (so the number is real, not asserted).** X must be scored against the
*complete* influence surface of §1.1 — system prompt file(s), skills file, static
scaffolding, the full ChromaDB dump, the episodic history, and (if loaded) the
`knowledge-priors/*.md` startup priors that are embedded into the same collection
(`src/rag.py`, `init_knowledge`, lines 203–290) — not against the ChromaDB dump alone.
X should track corpus size and structure: a small, readable corpus where the
co-surfacing set is narrow supports a defensibly high X; a large corpus supports an
honestly lower one.

### Hole C — Non-deterministic, multi-cycle execution

**Statement.** Even with no new input (A4), the loop runs multiple cycles
(`maxNewInputLoops` / wake cycles, `src/loop.metta` lines 11–12, 80–81), samples the
model per cycle, and can `remember` new content mid-flow (`src/memory.metta` line 44).
"No new messages" does not by itself guarantee a single, predictable action; the
architecture permits several self-driven steps, each potentially mutating state, with
sampling variance.

**Disposition — plugged by A1.** Under the trusted-model assumption (treated as
near-certain, and acceptable because the operator has access to the same models as
everyone else), the multi-cycle, sampled execution is not a *malice* risk — it is at
most benign variance. A1 waives the non-determinism concern: a well-behaved model taking
several honest steps toward the approved goal does not constitute a bad actor. Any
*concrete* divergence those steps might produce is still caught by Hole A's monitor
(§Hole A) under A5.

---

## 5. Resulting risk model

| Hole | Nature | Disposition | Closed by |
|---|---|---|---|
| A | External fact drift at execution time | Observe-and-revert | A5 |
| B | Unpredicted memory combinations | Bounded confidence `X`, backstopped by A's monitor | §1.3 readability + A5 (via `Y`) |
| C | Multi-cycle sampled execution | Benign variance, not malice | A1, with A as backstop |

The argument is therefore **logically complete and honest**. It does not claim a proof
of safety. It claims:

1. The manipulation / bad-actor class (tool injection, latent model greed, provider
   injection, external-content poisoning) is eliminated by A1–A3 — the agent will not
   be *turned* into a bad actor.
2. The remaining risk is not adversarial but is **prediction error (B)** and
   **fact drift (C/A)**, and it is bounded by:
   - a calibrated confidence `X` over the inspected, human-readable influence surface
     (Hole B), and
   - an independent, execution-time **observe-and-revert** gate `Y` (Hole A) that
     catches by observed effect and does not depend on the prediction being perfect.
3. The net escape probability is approximately `(1 − X)·(1 − Y)`, small whenever the
   monitoring gate is strong — which A5 guarantees.

Under this model the operator's claim — *"if the funds are misused, it is on me"* —
becomes true, because the operator has either inspected, assumed-away, or actively
monitored every surface that could cause misuse.

---

## 6. What the operator must actually do (the standing requirements)

The argument is sound only if these are upheld in practice:

1. **Inspect the complete influence surface, not a subset.** That means: the system
   prompt file(s) (`memory/prompt*.txt`), the skills file (`src/skills.metta`), the
   static scaffolding in `getContext`, the full ChromaDB `memories` dump (including any
   `knowledge-priors` chunks), and the episodic history (`memory/history.metta`).
   Scoring `X` against anything less inflates the confidence.
2. **Maintain the A5 privilege concretely.** Ensure tool I/O is fully captured in a
   stream the operator actually watches, ensure the payment is reversible or pausable
   across the monitoring window (reversible ≠ locked), and ensure the concrete payment
   target (payee + amount) is observable before the action becomes irreversible.
3. **Keep `X` honest.** Recalibrate when the corpus grows, and never let `X` absorb the
   risks already assigned to A1–A3 or to the Hole A monitor.

---

## 7. Assumptions a reader may legitimately challenge

This argument is conditional. It fails if any of the following are false in a given
deployment:

- A1/A2/A3 — if the model, tools, or provider/proxy path are in fact untrustworthy, the
  entire manipulation class reopens.
- A5 — if the payment is irreversible and non-pausable, or the operator cannot observe
  tool I/O completely or cannot act faster than the loop, Hole A reopens and Hole B
  loses its backstop (`Y → 0`, residual collapses to `(1 − X)`).
- §1.1 completeness — if any influence on the decision reaches the prompt through a
  path not enumerated in §1.1 (e.g. a tool that acts without its return entering the
  logged `&lastresults`/stdout trace), the inspected surface is incomplete and `X` is
  not trustworthy.

Within those stated bounds, the argument holds.
