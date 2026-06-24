#!/usr/bin/env bash
set -euo pipefail

python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Local setup complete."
echo "Run backend: source .venv/bin/activate && uvicorn main:app --reload"
echo "Run tests: source .venv/bin/activate && pytest -q"
