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
# Render serves the active 5-class CNN bundle. Legacy auxiliary models were
# trained against the previous B2 feature contract and are deliberately
# disabled, so verify only the deployable B3 artifact here.
"$python_cmd" backend/training/verify_artifacts.py --cnn-only
"$python_cmd" backend/training/quality_gate.py
