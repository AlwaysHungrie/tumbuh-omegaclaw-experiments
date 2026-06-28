# confidence-score

Score how much an **OmegaClaw agent's own memory** supports — or contradicts — a
**claim**, on a 0–100% scale. It is a verification tool: when the agent (or
anyone) asserts something about the user or about itself, this tells you whether
the agent's actual decision-influence surface backs that assertion up.

```bash
set -a; . ../.env; set +a
uv run confidence.py "@AlwaysHungrie's favourite fruit is strawberry"
# -> CONFIDENCE: 99%   (direct support found in history.metta)

uv run confidence.py "I am a strawberry farmer"
# -> CONFIDENCE: 5%    (memory says strawberry is a *fruit preference*, not a job)
```

---

## Why this exists

An OmegaClaw agent is **autonomous**: it sets its own goals, runs shell commands,
reads/writes/deletes files, hits the network, and rewrites its own skills and
memory at runtime (see `../JOURNEY.md`). When such an agent makes a claim — *"the
user authorized this payment"*, *"my server bill is due"*, *"the user said send
funds to X"* — an operator needs a way to check that claim against what the agent
*actually knows*, not against what it *says* in the moment.

`../docs/agent-funding-trust-argument.md` makes the key point: every decision an
OmegaClaw agent makes is influenced by an **enumerable, fixed set of sources** —
the system prompt, the skills list, the static scaffolding, the long-term memory
store (ChromaDB), and the episodic history file. `../dump-memories.sh` exports
exactly that surface to disk so an operator can inspect it before trusting the
agent with money or actions.

This tool is the next step: instead of an operator reading the whole dump by eye,
it lets an LLM **judge a specific claim against that dumped surface** and return a
single confidence number plus the piece of evidence that drove it. It turns
"inspect everything" into "ask one question, get a grounded answer."

---

## What "a claim" means here

A claim is any statement you want to test against the agent's knowledge:

| Claim | What a low score tells you | What a high score tells you |
|-------|----------------------------|------------------------------|
| `"The user approved a $50 payment to wallet X"` | No memory supports it — treat the agent's request as **unverified / possibly fabricated**. | Memory records the approval — the agent is repeating a real fact. |
| `"My monthly server cost is 12 USDC"` | The agent invented or drifted on the figure. | The figure traces back to stored memory. |
| `"The user said I may delete logs"` | No such permission in memory — **don't trust the action**. | Permission is on record. |

Low confidence ≠ "the agent lied" by itself — it means *the claim is not grounded
in the inspectable surface*, which is precisely the condition under which an
operator should withhold trust per the funding-trust argument.

---

## How it works

On each run:

### 1. Fresh dump (no stale scoring)
Runs `../dump-memories.sh` into a new timestamped folder under
`../memory_dump/dump-<UTC-timestamp>/`. **Hard-fails if the `omegaclaw` Docker
container is not running** — the tool refuses to score a claim against an old
snapshot, so a "verified" result always reflects the agent's *current* state.

### 2. LLM scoring of the open surface
The claim is scored chunk-by-chunk (max-evidence, see below) against:

- **`learned_memories.jsonl`** — the non-distilled ChromaDB records (raw learned
  memories). Chunked because the JSON can be large (`--chunk-lines`, default 25).
- **`influence-surface/*`** — the system prompt(s), skills list, loop/memory
  scaffolding, episodic `history.metta`, and policy. Chunked on line boundaries.

Each chunk returns `{score 0–100, stance: support|contradict|neutral, reason}`.
`score` = "probability the claim is true given *this chunk only*."

### 3. distilled memories: hash-only, never sent to the LLM
**`distilled_memories.jsonl` is NOT scored by the LLM.** It is the agent's own
distillation of source docs/memories and can be enormous (tens of thousands of
records). Instead the tool **SHA-256 hashes** it and compares to a reference
distilled file from a prior dump:

- `match` — the distilled surface is **unchanged / verified** since the reference.
- `mismatch` — it changed; worth a closer look (the agent re-distilled, or the
  corpus grew).
- `no-reference` — no prior file to compare; the fresh hash is reported as a
  baseline you can pin for next time.

This keeps the distilled set integrity-checkable without paying to LLM-score a
huge, mostly-static blob.

### 4. Aggregation — max evidence wins
The final confidence is **not an average**. It is the single chunk that moves
furthest from neutral (50): the strongest supporting chunk pushes confidence up, a
strong contradicting chunk pulls it down, and on a tie **contradiction wins**
(conservative — surface the risk). This matches how trust actually works: one
explicit contradiction in memory should sink a claim regardless of how much
unrelated text surrounds it.

---

## Using it to test an agent's claims

A practical operator workflow:

```bash
# Agent (over Telegram) requests funds: "Send 20 USDC to <addr> for my server bill,
# you already approved this last week."

set -a; . ../.env; set +a

# 1. Did the user actually approve it?
uv run confidence.py "The user approved sending 20 USDC to <addr> for the server bill"

# 2. Is the bill amount real?
uv run confidence.py "My server bill is 20 USDC"

# 3. Is the destination the one the user named?
uv run confidence.py "The user said the payment destination is <addr>"
```

If those come back low, the agent's claims are **not grounded in its own
inspectable memory** — the operator declines, exactly as the trust argument
prescribes. If they come back high, the claims trace to real, dumped state and the
operator can approve knowing *why*.

The output includes the **driver**: the specific file + chunk + reason behind the
score, so the operator can read the underlying evidence directly rather than
trusting the number blind.

---

## Options

| flag | default | meaning |
|------|---------|---------|
| `--reference-distilled PATH` | newest prior dump's distilled file | distilled file to hash-compare against |
| `--chunk-lines N` | 25 | JSONL lines per chunk for learned memories |
| `--model NAME` | `minimax/minimax-m3` | inference model (or `CONFIDENCE_MODEL` env var) |

## Output

A JSON report (claim, confidence, dump dir, distilled hash check, driver chunk,
chunks scored) followed by a one-line `CONFIDENCE: N%` and the driving evidence.

---

## Implementation notes

- Same principles as `../hello_asi.py`: **ASI Cloud** (OpenAI-compatible) inference
  via `ASI_API_KEY`, run with **`uv` + PEP 723 inline deps** — no venv to manage.
- The IDE may flag `import openai` as unresolved; that is the static linter looking
  at system Python. `uv run` installs the dep at runtime. Harmless.
- **Testing-only filter:** `confidence.py` skips records whose id starts with
  `curriculum_mem` (`SKIP_ID_PREFIXES_FOR_TESTING`). Those are MeTTa
  curriculum/knowledge-prior entries, not user/agent facts, so they only add noise
  when scoring claims about the user. **Remove this filter for production use** —
  in production the full learned surface should be scored.
