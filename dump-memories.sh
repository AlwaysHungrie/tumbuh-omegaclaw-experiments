#!/usr/bin/env bash
# Dump OmegaClaw learned (non-distilled) memories from ChromaDB to a host file.
# Skips the shipped knowledge base (distilled_* ids) — only agent-learned records.
# Usage: ./dump-memories.sh [output-file]   (default: memory_dump/dump_nondistilled.jsonl)
set -euo pipefail

CONTAINER=omegaclaw
CHROMA=/PeTTa/repos/OmegaClaw-Core/memory/chroma_db
# Write inside the persistent memory volume — container runs --tmpfs /tmp, so /tmp is
# unreachable by `docker cp`. The volume dir is.
REMOTE=/PeTTa/repos/OmegaClaw-Core/memory/dump_nondistilled.jsonl
OUT=${1:-memory_dump/dump_nondistilled.jsonl}

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "container '$CONTAINER' not running" >&2
  exit 1
fi

docker exec "$CONTAINER" python3 -c '
import chromadb, json
c = chromadb.PersistentClient(path="'"$CHROMA"'")
r = c.get_collection("memories").get(include=["documents","metadatas"])
n = 0
with open("'"$REMOTE"'", "w") as f:
    for i, d, m in zip(r["ids"], r["documents"], r["metadatas"]):
        if i.startswith("distilled_"):   # shipped KB, skip
            continue
        f.write(json.dumps({"id": i, "meta": m, "doc": d}, ensure_ascii=False) + "\n")
        n += 1
print(n)
' > /tmp/.dump_count

mkdir -p "$(dirname "$OUT")"
docker cp "$CONTAINER:$REMOTE" "$OUT"
docker exec "$CONTAINER" rm -f "$REMOTE"

echo "dumped $(cat /tmp/.dump_count) learned memories -> $OUT"
rm -f /tmp/.dump_count
