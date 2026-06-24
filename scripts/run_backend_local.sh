#!/usr/bin/env bash
set -euo pipefail

cd /Users/kevinyongcj/Programming/Liveling/liveling_backend
source .venv/bin/activate
uvicorn main:app --reload
