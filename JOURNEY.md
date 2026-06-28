# OmegaClaw-Core — Run Journey

Goal: run OmegaClaw-Core agent via Docker, LLM = **MiniMax (via ASI Cloud)**, operated
over **Telegram**.

## What OmegaClaw is

Neural-symbolic autonomous agent framework on the Hyperon AGI stack. Core ~200 lines of
MeTTa. Runs in **continuous loops** with auditable reasoning + self-improvement (not a chat
session). **Autonomous** — sets own goals, runs OS shell commands, reads/writes/deletes
files, hits network, modifies its own skills/memory at runtime. Prompt-injectable. Keep it
in the container with minimum permissions. You own all actions it takes.

Repo: https://github.com/asi-alliance/OmegaClaw-Core

## Quick commands

```bash
./run.sh start    # start container (first boot embeds KB ~30min; later boots fast)
./run.sh stop     # stop container (memory volume kept)
./run.sh logs     # follow logs
./run.sh clean    # remove container + wipe memory volume
```

## Config decisions

- **LLM provider = `ASICloud`.** Reads `ASI_API_KEY`, routes to
  `inference.asicloud.cudos.org`, model `minimax/minimax-m2.5`. This is what an ASI Cloud
  key serves. (Provider→token map in `omegaclaw.sh` `options()`, ~line 463–502.)
- **Channel = Telegram** (`-t telegram`), reads `TG_BOT_TOKEN`.
- **Non-interactive install.** Upstream one-liner (`curl … | bash`) is an interactive menu.
  We bypass via the script's own `start` subcommand + flags, secrets sourced from `.env`.

## Files here

| File           | Purpose |
|----------------|---------|
| `omegaclaw.sh` | Upstream installer/runner (downloaded + inspected, not blind-piped to bash). |
| `.env.example` | Template for the 3 secrets. |
| `.env`         | Filled secrets (gitignored, never committed/pasted in chat). |
| `run.sh`       | Wrapper: sources `.env`, runs `omegaclaw.sh start -t telegram -p ASICloud`. |
| `.gitignore`   | Ignores `.env`. |

## How the container runs (from omegaclaw.sh `start()`)

```
docker run -d -it --name omegaclaw \
  --security-opt no-new-privileges:true --init \
  --add-host=host.docker.internal:host-gateway \
  --tmpfs /tmp --tmpfs /var/tmp --tmpfs /run \
  --volume omegaclaw-memory:/PeTTa/repos/OmegaClaw-Core/memory \
  -e ASI_API_KEY=… -e TG_BOT_TOKEN=… -e OMEGACLAW_AUTH_SECRET=… \
  singularitynet/omegaclaw:latest \
  commchannel=telegram provider=ASICloud embeddingprovider=Local \
  securityPolicyPath=…/profile/policy.yaml TG_POLL_TIMEOUT=20
```

- No ports mapped — Telegram reached outbound via long-poll.
- Memory persists in named volume `omegaclaw-memory`.

## First boot: embedding the knowledge base

On first start the agent embeds its shipped KB — **27882 records** → 1024-dim vectors via
local `intfloat/e5-large-v2` (CPU, no GPU = slow, one-time, ~30 min on this box). Vectors
stored in ChromaDB inside the `omegaclaw-memory` volume = agent's long-term memory for
semantic recall. **Persists** → restarts skip re-embedding and boot in seconds.

## Steps to run

1. **Get keys**
   - ASI Cloud API key (serves `minimax/minimax-m2.5`).
   - Telegram bot token from **@BotFather** (`/newbot`).
2. **Configure** (do NOT paste keys into any chat/transcript):
   ```bash
   cp .env.example .env
   # edit .env: ASI_API_KEY, TG_BOT_TOKEN
   openssl rand -base64 24    # -> OMEGACLAW_AUTH_SECRET
   ```
3. **Start**
   ```bash
   ./run.sh start
   ```
4. **Bind Telegram**: DM the bot. First message must authenticate:
   ```
   auth <your OMEGACLAW_AUTH_SECRET>
   ```
   Agent auto-binds to that chat after first valid auth message (no `TG_CHAT_ID` needed).
   Note: agent thinks ≥5 cycles before replying — expect a short delay per message.
5. **Watch / control**
   ```bash
   ./run.sh logs    # follow logs
   ./run.sh stop    # stop container
   ./run.sh clean   # remove container + memory volume
   ```

## Verify

- `docker ps` shows `omegaclaw` Up.
- Logs show `POST /asicloud/chat/completions … 200 OK` and `[TELEGRAM] Polling started`.
- Bot replies in Telegram after `auth <secret>`.

## Inspecting memories (ChromaDB)

Long-term memory = ChromaDB inside the `omegaclaw-memory` volume:
`/PeTTa/repos/OmegaClaw-Core/memory/chroma_db/chroma.sqlite3`. One collection `memories`.

- Container has **no `sqlite3` CLI** — use the bundled `chromadb` python client (`chromadb 1.5.9`).
- Record shape: `documents` = memory text, `metadatas` = `time` (+ `procedure`/`domain` on KB chunks).
- Two kinds of ids:
  - `distilled_<sourcefile>_chunk_N` — shipped knowledge base (chunked → LLM-distilled →
    embedded at first boot). The bulk (~27650).
  - `curriculum_mem_*` and uuids — **agent-learned** at runtime (~234). This is what changes.

**List collections + counts:**
```bash
docker exec omegaclaw python3 -c '
import chromadb
c=chromadb.PersistentClient(path="/PeTTa/repos/OmegaClaw-Core/memory/chroma_db")
print([(col.name, col.count()) for col in c.list_collections()])
'
```

**Show only agent-learned memories (skip shipped KB):**
```bash
docker exec omegaclaw python3 -c '
import chromadb
c=chromadb.PersistentClient(path="/PeTTa/repos/OmegaClaw-Core/memory/chroma_db")
r=c.get_collection("memories").get(include=["documents","metadatas"])
for i,d,m in zip(r["ids"], r["documents"], r["metadatas"]):
    if not i.startswith("distilled_"):
        print(m.get("time"), "|", d)
'
```

**Semantic search (what the agent recalls for a query):**
```bash
docker exec omegaclaw python3 -c '
import chromadb
c=chromadb.PersistentClient(path="/PeTTa/repos/OmegaClaw-Core/memory/chroma_db")
r=c.get_collection("memories").query(query_texts=["favorite fruit"], n_results=5, include=["documents","distances"])
for d,dist in zip(r["documents"][0], r["distances"][0]): print(round(dist,3), d)
'
```

**Dump learned memories to host jsonl** — use the script:
```bash
./dump-memories.sh                       # -> memory_dump/dump_nondistilled.jsonl
./dump-memories.sh path/to/out.jsonl     # custom output path
```
Skips shipped KB (`distilled_*`), keeps only agent-learned records (~235, ≈70 KB). Writes into
the memory **volume** first (container runs `--tmpfs /tmp`, unreachable by `docker cp`), then
copies out and cleans up. Output excludes embedding vectors. `memory_dump/` is gitignored.

Read-only `.get()`/`.query()` is safe while the agent runs; don't add/delete via a second client
(lock contention with the live agent).

Also human-readable: `memory/history.metta` — the agent's conversation/action log.

## Pitfalls

- LLM 401 → wrong key for the provider. The key must match the provider: an **ASI Cloud**
  key uses `-p ASICloud` + `ASI_API_KEY` (not OpenRouter, not MiniMax-native).
- Bot silent → bad `TG_BOT_TOKEN`, or first message wasn't `auth <secret>`.
- `OMEGACLAW_AUTH_SECRET` defaults to `0000` if unset — always set a strong one.
- Autonomous + shell-capable: keep in container, no host access.
