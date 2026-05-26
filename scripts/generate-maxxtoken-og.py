#!/usr/bin/env python3
"""Legacy OG generator — prefer `npm run og:maxxtoken` (Playwright hero capture)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    script = ROOT / "scripts" / "capture-maxxtoken-og.mjs"
    print("Using Playwright capture for landing-accurate OG image…")
    subprocess.run(["npm", "run", "og:maxxtoken"], cwd=ROOT, check=True)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)
