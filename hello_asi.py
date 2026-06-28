#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["openai"]
# ///
"""Minimal hello-world against the ASI Cloud inference endpoint.

ASI Cloud exposes an OpenAI-compatible API, so the key is NOT tied to
OmegaClaw agents — it works for general chat completions.

Run:
    pip install openai
    python hello_asi.py
"""
import os
import sys

from openai import OpenAI


def main() -> None:
    api_key = os.environ.get("ASI_API_KEY")
    if not api_key:
        sys.exit("ASI_API_KEY not set. Source your .env first.")

    client = OpenAI(
        api_key=api_key,
        base_url="https://inference.asicloud.cudos.org/v1",
    )

    resp = client.chat.completions.create(
        model="minimax/minimax-m3",
        messages=[{"role": "user", "content": "hello"}],
    )
    print(resp.choices[0].message.content)


if __name__ == "__main__":
    main()
