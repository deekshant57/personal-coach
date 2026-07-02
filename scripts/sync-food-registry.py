#!/usr/bin/env python3
"""Copy custom-foods-registry.json into js/custom-foods-registry.js for in-app macro lookup."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".cursor/skills/resolve-custom-food-macros/custom-foods-registry.json"
DST = ROOT / "js/custom-foods-registry.js"


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing registry: {SRC}")
    data = json.loads(SRC.read_text(encoding="utf-8"))
    DST.write_text(
        "// Auto-synced from .cursor/skills/resolve-custom-food-macros/custom-foods-registry.json\n"
        "// Run: python3 scripts/sync-food-registry.py\n"
        f"export const CUSTOM_FOODS_REGISTRY = {json.dumps(data, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    print(f"Synced {len(data)} entries → {DST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
