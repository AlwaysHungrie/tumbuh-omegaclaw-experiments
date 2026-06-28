#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["openai"]
# ///
"""Assign a confidence score to a claim against an OmegaClaw memory dump.

Pipeline:
  1. Make a FRESH dump via ../dump-memories.sh -> a new timestamped folder.
     Hard-fails if the omegaclaw container is not running (no stale scoring).
  2. Score the claim with the LLM (ASI Cloud, OpenAI-compatible) against:
       - learned_memories.jsonl     (chunked, JSON can be large)
       - influence-surface/*        (chunked)
     Each chunk yields a per-chunk score in [0,100]; the claim's confidence is
     the MAX-evidence result (strongest supporting/contradicting chunk wins).
  3. distilled_memories.jsonl is NOT sent to the LLM. It is hashed and compared
     against the hash of a reference distilled file from a prior dump. Match =
     verified/unchanged; mismatch = flagged.

Run:
    set -a; . ../.env; set +a
    uv run confidence.py "I am a strawberry farmer"

Optional:
    --reference-distilled PATH   distilled file to hash-compare against
                                 (default: newest prior dump's distilled file)
    --chunk-lines N              lines per learned/jsonl chunk (default 25)
    --model NAME                 override model
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parent.parent          # plant-agent/
DUMP_SCRIPT = ROOT / "dump-memories.sh"
MEMORY_DUMP = ROOT / "memory_dump"
DEFAULT_MODEL = "minimax/minimax-m3"
BASE_URL = "https://inference.asicloud.cudos.org/v1"

DISTILLED_NAME = "distilled_memories.jsonl"
LEARNED_NAME = "learned_memories.jsonl"
INFLUENCE_DIR = "influence-surface"


# --------------------------------------------------------------------------- #
# 1. Fresh dump
# --------------------------------------------------------------------------- #
def make_fresh_dump() -> Path:
    """Run dump-memories.sh into a fresh folder. Hard-fail if it can't."""
    if not DUMP_SCRIPT.exists():
        sys.exit(f"dump script not found: {DUMP_SCRIPT}")

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")
    out = MEMORY_DUMP / f"dump-{stamp}"
    print(f"[dump] creating fresh dump -> {out}")

    proc = subprocess.run(
        ["bash", str(DUMP_SCRIPT), str(out)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout)
        sys.stderr.write(proc.stderr)
        sys.exit(
            "[dump] failed (container down?). Hard-fail: refusing to score on "
            "stale data. Start the omegaclaw container and retry."
        )
    print(proc.stdout.strip())
    return out


def newest_prior_dump(exclude: Path) -> Path | None:
    """Newest dump-* folder under memory_dump/ that has a distilled file."""
    candidates = [
        d
        for d in MEMORY_DUMP.glob("dump-*")
        if d.is_dir() and d != exclude and (d / DISTILLED_NAME).exists()
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda d: d.stat().st_mtime)


# --------------------------------------------------------------------------- #
# 2. Hashing (distilled — no LLM)
# --------------------------------------------------------------------------- #
def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1 << 16), b""):
            h.update(block)
    return h.hexdigest()


def check_distilled(dump_dir: Path, reference: Path | None) -> dict:
    """Hash the fresh distilled file; compare to a reference hash. No LLM."""
    fresh = dump_dir / DISTILLED_NAME
    if not fresh.exists():
        return {"status": "missing", "detail": f"{fresh} not found"}

    fresh_hash = sha256_file(fresh)
    if reference is None or not reference.exists():
        return {
            "status": "no-reference",
            "fresh_sha256": fresh_hash,
            "detail": "no reference distilled file to compare against",
        }

    ref_hash = sha256_file(reference)
    return {
        "status": "match" if ref_hash == fresh_hash else "mismatch",
        "fresh_sha256": fresh_hash,
        "reference_sha256": ref_hash,
        "reference_path": str(reference),
    }


# --------------------------------------------------------------------------- #
# 3. Chunking
# --------------------------------------------------------------------------- #
# TESTING-ONLY: skip records whose id starts with this prefix. These are the
# MeTTa curriculum/knowledge-prior entries, not user/agent facts, so they add
# noise when scoring claims about the user. Drop this filter for production use.
SKIP_ID_PREFIXES_FOR_TESTING = ("curriculum_mem",)


def _skip_for_testing(line: str) -> bool:
    try:
        rec_id = json.loads(line).get("id", "")
    except (ValueError, json.JSONDecodeError):
        return False
    return any(rec_id.startswith(p) for p in SKIP_ID_PREFIXES_FOR_TESTING)


def chunk_jsonl(path: Path, chunk_lines: int) -> list[str]:
    """Group JSONL into chunks of `chunk_lines` lines each."""
    chunks: list[str] = []
    buf: list[str] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line:
                continue
            if _skip_for_testing(line):  # TESTING-ONLY filter, see note above
                continue
            buf.append(line)
            if len(buf) >= chunk_lines:
                chunks.append("\n".join(buf))
                buf = []
    if buf:
        chunks.append("\n".join(buf))
    return chunks


def chunk_text(text: str, max_chars: int = 6000) -> list[str]:
    """Split free text into <=max_chars chunks on line boundaries."""
    chunks: list[str] = []
    buf: list[str] = []
    size = 0
    for line in text.splitlines(keepends=True):
        if size + len(line) > max_chars and buf:
            chunks.append("".join(buf))
            buf, size = [], 0
        buf.append(line)
        size += len(line)
    if buf:
        chunks.append("".join(buf))
    return chunks or [""]


def gather_chunks(dump_dir: Path, chunk_lines: int) -> list[tuple[str, str]]:
    """Return (source_label, chunk_text) for everything that gets LLM-scored.

    Explicitly EXCLUDES distilled_memories.jsonl (hash-only).
    """
    out: list[tuple[str, str]] = []

    learned = dump_dir / LEARNED_NAME
    if learned.exists():
        for i, c in enumerate(chunk_jsonl(learned, chunk_lines)):
            out.append((f"{LEARNED_NAME}#chunk{i}", c))

    inf = dump_dir / INFLUENCE_DIR
    if inf.is_dir():
        for fp in sorted(inf.iterdir()):
            if not fp.is_file():
                continue
            try:
                text = fp.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for i, c in enumerate(chunk_text(text)):
                out.append((f"{INFLUENCE_DIR}/{fp.name}#chunk{i}", c))

    return out


# --------------------------------------------------------------------------- #
# 4. LLM scoring
# --------------------------------------------------------------------------- #
SCORE_SYSTEM = (
    "You score how much a body of memory evidence supports a CLAIM about the "
    "user/agent. Read the EVIDENCE chunk and the CLAIM. Return STRICT JSON "
    '{"score": <int 0-100>, "stance": "support"|"contradict"|"neutral", '
    '"reason": "<short>"}. '
    "score = probability the claim is TRUE given THIS chunk only. "
    "If the chunk directly affirms the claim -> high (e.g. 80-100). "
    "If it directly contradicts the claim -> low (e.g. 0-20). "
    "If the chunk is irrelevant -> neutral, score 50. No prose outside JSON."
)


def score_chunk(client: OpenAI, model: str, claim: str, label: str, chunk: str) -> dict:
    user = f"CLAIM:\n{claim}\n\nEVIDENCE ({label}):\n{chunk}"
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SCORE_SYSTEM},
            {"role": "user", "content": user},
        ],
        temperature=0,
    )
    raw = resp.choices[0].message.content.strip()
    return parse_score(raw, label)


def parse_score(raw: str, label: str) -> dict:
    """Tolerant JSON extraction from the model output."""
    txt = raw
    if "```" in txt:  # strip fenced blocks
        txt = txt.split("```")[1] if txt.count("```") >= 2 else txt
        txt = txt.replace("json", "", 1).strip()
    try:
        start, end = txt.find("{"), txt.rfind("}")
        obj = json.loads(txt[start : end + 1])
        score = int(obj.get("score", 50))
        score = max(0, min(100, score))
        return {
            "label": label,
            "score": score,
            "stance": obj.get("stance", "neutral"),
            "reason": obj.get("reason", ""),
        }
    except (ValueError, json.JSONDecodeError):
        return {"label": label, "score": 50, "stance": "neutral",
                "reason": f"unparseable model output: {raw[:80]!r}"}


def aggregate_max_evidence(results: list[dict]) -> dict:
    """Strongest evidence wins.

    Pick the chunk that moves furthest from neutral (50). A strong contradiction
    pulls confidence down; a strong support pushes it up. Ties -> contradiction
    wins (conservative).
    """
    relevant = [r for r in results if r["stance"] != "neutral"]
    if not relevant:
        return {"confidence": 50, "driver": None,
                "note": "no supporting or contradicting evidence found"}

    def strength(r: dict) -> tuple[int, int]:
        # distance from neutral; on tie prefer contradiction (lower score)
        return (abs(r["score"] - 50), -r["score"])

    driver = max(relevant, key=strength)
    return {"confidence": driver["score"], "driver": driver}


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
def main() -> None:
    ap = argparse.ArgumentParser(description="Confidence score for a claim vs a memory dump.")
    ap.add_argument("claim", help="The claim to score, e.g. 'I am a strawberry farmer'")
    ap.add_argument("--reference-distilled", type=Path, default=None,
                    help="distilled file to hash-compare (default: newest prior dump)")
    ap.add_argument("--chunk-lines", type=int, default=25)
    ap.add_argument("--model", default=os.environ.get("CONFIDENCE_MODEL", DEFAULT_MODEL))
    args = ap.parse_args()

    api_key = os.environ.get("ASI_API_KEY")
    if not api_key:
        sys.exit("ASI_API_KEY not set. Source ../.env first.")

    # 1. fresh dump (hard-fail if container down)
    dump_dir = make_fresh_dump()

    # 2. distilled: hash-only
    reference = args.reference_distilled
    if reference is None:
        prior = newest_prior_dump(exclude=dump_dir)
        reference = (prior / DISTILLED_NAME) if prior else None
    distilled = check_distilled(dump_dir, reference)
    print(f"[distilled] {distilled['status']}: "
          f"{distilled.get('detail', distilled.get('fresh_sha256', ''))}")

    # 3. LLM-score learned + influence-surface
    client = OpenAI(api_key=api_key, base_url=BASE_URL)
    chunks = gather_chunks(dump_dir, args.chunk_lines)
    print(f"[score] {len(chunks)} chunks to score against claim")

    results: list[dict] = []
    for n, (label, chunk) in enumerate(chunks, 1):
        r = score_chunk(client, args.model, args.claim, label, chunk)
        results.append(r)
        if r["stance"] != "neutral":
            print(f"  [{n}/{len(chunks)}] {r['stance']:10} {r['score']:3}  "
                  f"{label}  — {r['reason']}")

    agg = aggregate_max_evidence(results)

    # 4. report
    report = {
        "claim": args.claim,
        "confidence": agg["confidence"],
        "dump_dir": str(dump_dir),
        "distilled_check": distilled,
        "driver": agg.get("driver"),
        "chunks_scored": len(chunks),
    }
    print("\n=== RESULT ===")
    print(json.dumps(report, indent=2))
    print(f"\nCLAIM: {args.claim}")
    print(f"CONFIDENCE: {agg['confidence']}%")
    if agg.get("driver"):
        d = agg["driver"]
        print(f"DRIVER: {d['stance']} from {d['label']} — {d['reason']}")


if __name__ == "__main__":
    main()
