# CoopCart - Grocery Sharing App

A mobile-first PWA for users to keep a shared grocery list with local-first sync, auto-categorization, and deduplication.

## Architecture

- **Frontend**: React + Vite PWA with IndexedDB (Dexie)
- **Backend**: FastAPI with in-memory storage
- **Sync**: Manual "Send Update / Get Update" with room codes
- **Features**: Auto-categorization, deduplication, offline-first

## Quick Start

### Terminal A (API)
```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal B (Web)
```bash
cd apps/web
npm install
echo 'VITE_API_BASE=http://127.0.0.1:8000' > .env
npm run dev -- --host 0.0.0.0 --port 5173
```

## Usage

1. **Create Room**: One person creates a room and gets a room code
2. **Join Room**: The other person joins using the room code
3. **Add Items**: Both can add items locally (works offline)
4. **Sync**: Press "Send Update" to sync changes with the server
5. **Auto-categorization**: Server automatically categorizes and deduplicates items

## Features

- Mobile-first PWA (installable on iOS/Android)
- Local-first with manual sync
- Auto-categorization of grocery items
- Deduplication of similar items
- Room-based sharing (no accounts required)
- Offline support with IndexedDB

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Dexie (IndexedDB)
- **Backend**: FastAPI, Python 3.11+, Pydantic
- **Sync**: Custom merge algorithm with versioning
- **Categorization**: Rules-based with LLM plug-in support
