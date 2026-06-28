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

## Pitfalls

- LLM 401 → wrong key for the provider. The key must match the provider: an **ASI Cloud**
  key uses `-p ASICloud` + `ASI_API_KEY` (not OpenRouter, not MiniMax-native).
- Bot silent → bad `TG_BOT_TOKEN`, or first message wasn't `auth <secret>`.
- `OMEGACLAW_AUTH_SECRET` defaults to `0000` if unset — always set a strong one.
- Autonomous + shell-capable: keep in container, no host access.
