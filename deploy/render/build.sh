#!/usr/bin/env bash
set -euo pipefail

if [[ -x .venv/bin/python ]]; then
  python_cmd=.venv/bin/python
elif command -v python3 >/dev/null 2>&1; then
  python_cmd=python3
else
  python_cmd=python
fi

"$python_cmd" -m pip install --upgrade pip
"$python_cmd" -m pip install -r requirements.txt

test -s frontend/dist/app.js
test -s frontend/dist/app.css

# Fail the deploy if a committed runtime model is missing, tampered with, or has
# an incompatible ONNX/sklearn contract. Training data and training environments
# are intentionally not part of the deployment bundle.
"$python_cmd" backend/training/verify_artifacts.py --require-cnn --include-fusion
"$python_cmd" backend/training/quality_gate.py
