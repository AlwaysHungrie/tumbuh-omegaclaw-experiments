#!/usr/bin/env bash
# Dump the COMPLETE OmegaClaw decision-influence surface to a host folder, so an
# operator can inspect everything that can shape a payment decision before approving.
#
# Per docs/agent-funding-trust-argument.md §1.1 / §6.1, the influence surface is:
#   - the long-term memory store (ChromaDB `memories` collection)
#   - the system prompt file(s)            memory/prompt*.txt
#   - the injected skills/tool list        src/skills.metta
#   - the static getContext scaffolding    src/loop.metta (+ src/memory.metta helpers)
#   - the episodic history trace           memory/history.metta
#   - the security policy that bounds it    profile/policy.yaml
#
# ChromaDB records split two ways:
#   - learned (non-`distilled_`) memories  -> dumped raw          (learned_memories.jsonl)
#   - distilled (`distilled_`) records     -> dumped separately   (distilled_memories.jsonl)
# The distilled set is the agent's distillation of source docs/learned memories; it is
# kept in its own file so the operator can score it apart from the raw learned corpus.
#
# Usage: ./dump-memories.sh [output-dir]
#   default output-dir: memory_dump/dump-YYYY-MM-DD
set -euo pipefail

CONTAINER=omegaclaw
CORE=/PeTTa/repos/OmegaClaw-Core
CHROMA=$CORE/memory/chroma_db

OUT=${1:-memory_dump/dump-$(date +%Y-%m-%d)}

# Static files (in-container path -> output basename) that form the rest of the surface.
# A missing file is reported, not fatal: the surface is logged honestly, not silently
# trimmed.
STATIC_FILES=(
  "memory/prompt.txt:prompt.txt"
  "src/skills.metta:skills.metta"
  "src/loop.metta:loop.metta"
  "src/memory.metta:memory.metta"
  "memory/history.metta:history.metta"
  "profile/policy.yaml:policy.yaml"
)

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "container '$CONTAINER' not running" >&2
  exit 1
fi

mkdir -p "$OUT"

# --- ChromaDB: split learned vs distilled into two files inside the container, then copy.
# Write inside the persistent memory volume — container runs --tmpfs /tmp, so /tmp is
# unreachable by `docker cp`. The volume dir is.
REMOTE_LEARNED=$CORE/memory/.dump_learned.jsonl
REMOTE_DISTILLED=$CORE/memory/.dump_distilled.jsonl

docker exec "$CONTAINER" python3 -c '
import chromadb, json
c = chromadb.PersistentClient(path="'"$CHROMA"'")
r = c.get_collection("memories").get(include=["documents","metadatas"])
nl = nd = 0
with open("'"$REMOTE_LEARNED"'", "w") as fl, \
     open("'"$REMOTE_DISTILLED"'", "w") as fd:
    for i, d, m in zip(r["ids"], r["documents"], r["metadatas"]):
        rec = json.dumps({"id": i, "meta": m, "doc": d}, ensure_ascii=False) + "\n"
        if i.startswith("distilled_"):
            fd.write(rec); nd += 1
        else:
            fl.write(rec); nl += 1
print(f"{nl} {nd}")
' > /tmp/.dump_counts

read -r N_LEARNED N_DISTILLED < /tmp/.dump_counts
rm -f /tmp/.dump_counts

docker cp "$CONTAINER:$REMOTE_LEARNED"   "$OUT/learned_memories.jsonl"
docker cp "$CONTAINER:$REMOTE_DISTILLED" "$OUT/distilled_memories.jsonl"
docker exec "$CONTAINER" rm -f "$REMOTE_LEARNED" "$REMOTE_DISTILLED"

# --- Static influence-surface files. prompt_<provider>.txt is globbed (provider varies).
mkdir -p "$OUT/influence-surface"
for pair in "${STATIC_FILES[@]}"; do
  src="${pair%%:*}"; dst="${pair##*:}"
  if docker exec "$CONTAINER" test -e "$CORE/$src"; then
    docker cp "$CONTAINER:$CORE/$src" "$OUT/influence-surface/$dst"
  else
    echo "  (missing, skipped) $src" >&2
  fi
done
# provider-specific system prompt(s): memory/prompt_<provider>.txt
for f in $(docker exec "$CONTAINER" sh -c "ls $CORE/memory/prompt_*.txt 2>/dev/null"); do
  docker cp "$CONTAINER:$f" "$OUT/influence-surface/$(basename "$f")"
done

# --- Manifest: what was captured + provenance, so the dump is self-describing.
{
  echo "OmegaClaw influence-surface dump"
  echo "generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "container: $CONTAINER"
  echo "chroma:    $CHROMA"
  echo
  echo "ChromaDB memories collection:"
  echo "  learned_memories.jsonl     $N_LEARNED records (non-distilled, raw)"
  echo "  distilled_memories.jsonl   $N_DISTILLED records (agent distillations)"
  echo
  echo "influence-surface/ (static decision inputs, per agent-funding-trust-argument §1.1):"
  ls -1 "$OUT/influence-surface"
} > "$OUT/MANIFEST.txt"

echo "dumped influence surface -> $OUT"
echo "  learned   memories: $N_LEARNED"
echo "  distilled memories: $N_DISTILLED"
echo "  static files:       $(ls -1 "$OUT/influence-surface" | wc -l | tr -d ' ')"
