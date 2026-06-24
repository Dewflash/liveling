# Liveling

Liveling is a gamified life-productivity app: complete real-life tasks to earn XP and currencies, level up, grow a digital forest, and unlock RPG and real-life rewards.

## About this project

This project was built through **vibecoding** — an exploration of what's possible when building an app primarily through conversational AI coding tools, rather than hand-writing every line. The goals were to:

- Explore the practical limits and workflow of vibecoding a full-stack app end to end.
- Learn how an AI assistant structures and reasons about project architecture (layered backend, service/repository separation, frontend component/game structure, etc.).
- Stress-test how well an AI-driven workflow holds up across a multi-week, multi-feature build.

This repo contains the application code only. Design docs, planning notes, and original art/audio assets are kept out of version control (see `.gitignore`) since they may be copyrighted or aren't meant for public distribution.

## Disclaimer

This is a personal experiment, not a production product. Don't use this code as-is for a real app or service.

Art and audio assets referenced by the code (trees, icons, music, etc.) are **not included** in this repo and may be sourced from third parties under licenses that don't permit redistribution. If you clone this repo, you'll need to supply your own assets — do not assume anything referenced here is cleared for reuse or distribution. No claim of ownership over any third-party asset is made or implied.

## Stack

- **Backend:** Python, FastAPI, SQLModel, SQLite, Alembic
- **Frontend:** React, TypeScript, Vite, Phaser

## Running locally

See [RUN_LOCAL.md](RUN_LOCAL.md) (local docs, not tracked in git) or:

```bash
# Backend
cd liveling_backend
./scripts/setup_local.sh
source .venv/bin/activate
uvicorn main:app --reload

# Frontend
cd liveling_frontend
cp .env.example .env
npm install
npm run dev
```
