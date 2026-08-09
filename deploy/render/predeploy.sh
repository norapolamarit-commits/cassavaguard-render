#!/usr/bin/env bash
set -euo pipefail

if [[ -x .venv/bin/python ]]; then
  python_cmd=.venv/bin/python
elif command -v python3 >/dev/null 2>&1; then
  python_cmd=python3
else
  python_cmd=python
fi

"$python_cmd" -m alembic upgrade head
