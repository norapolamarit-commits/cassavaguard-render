#!/usr/bin/env bash
set -euo pipefail

# Verify the explicit production serving policy and all review-only runtime heads
# before binding the public port. A missing model fails the deploy instead of
# silently changing the diagnosis path.
if [[ -x .venv/bin/python ]]; then
  python_cmd=.venv/bin/python
elif command -v python3 >/dev/null 2>&1; then
  python_cmd=python3
else
  python_cmd=python
fi

# Verify and warm the models inside the same process that serves requests. Running
# verify_runtime.py as a separate command would load every ONNX/sklearn artifact and
# immediately discard those sessions before Uvicorn starts.
exec "$python_cmd" serve.py --verify-runtime
