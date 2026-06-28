#!/usr/bin/env bash
# Run OmegaClaw-Core via Docker: MiniMax M3 (OpenRouter) + Telegram channel.
# Usage: ./run.sh start | stop | clean | logs
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy .env.example -> .env and fill keys." >&2
  exit 1
fi
set -a; source .env; set +a

: "${ASI_API_KEY:?set ASI_API_KEY in .env}"
: "${TG_BOT_TOKEN:?set TG_BOT_TOKEN in .env}"
: "${OMEGACLAW_AUTH_SECRET:?set OMEGACLAW_AUTH_SECRET in .env}"
IMAGE="${IMAGE:-singularitynet/omegaclaw:latest}"

case "${1:-start}" in
  start)
    exec ./omegaclaw.sh start \
      -t telegram \
      -p ASICloud \
      -s "$OMEGACLAW_AUTH_SECRET" \
      -d "$IMAGE"
    ;;
  stop)  exec ./omegaclaw.sh stop ;;
  clean) exec ./omegaclaw.sh clean ;;
  logs)  exec docker logs -f omegaclaw ;;
  *) echo "Usage: $0 {start|stop|clean|logs}" >&2; exit 1 ;;
esac
