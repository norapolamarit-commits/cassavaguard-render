#!/usr/bin/env python3
"""CassavaGuard AI launcher.

    python3 serve.py                     # http://127.0.0.1:8800
    PORT=9000 python3 serve.py
    python3 serve.py --verify-runtime    # Render fail-fast check + warm models

Serves both the FastAPI backend and the (build-free) React frontend.
Interactive API docs at /api/docs.
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import uvicorn


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run CassavaGuard AI")
    parser.add_argument(
        "--verify-runtime",
        action="store_true",
        help=(
            "validate and warm all Render AI heads in this process before "
            "binding the HTTP port"
        ),
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    if args.verify_runtime:
        # Import only for deployment startup. Local development keeps its normal
        # lazy-loading behaviour, while Render reuses these warmed module singletons
        # when Uvicorn imports backend.main below.
        from deploy.render.verify_runtime import verify_runtime

        runtime_status = verify_runtime()
        print(f"  Runtime models   → {runtime_status['status']} (warmed in-process)")

    port = int(os.environ.get("PORT", "8800"))
    print(f"\n  🌿 CassavaGuard AI  →  http://127.0.0.1:{port}")
    print(f"     API docs        →  http://127.0.0.1:{port}/api/docs\n")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
