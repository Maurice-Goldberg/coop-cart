# CoopCart - Grocery Sharing App

A mobile-first PWA for users to keep a shared grocery list with local-first sync, auto-categorization, and deduplication.

## Architecture

- **Frontend**: React + Vite PWA with IndexedDB (Dexie)
- **Backend**: FastAPI with in-memory storage
- **Sync**: Manual "Send Update / Get Update" with room codes
- **Features**: Auto-categorization, deduplication, offline-first

## 🚀 Quick Start

### **Option 1: One-Command Setup (Recommended)**
```bash
# Setup everything and start both servers
make run
```

### **Option 2: Manual Setup**
```bash
# Run the setup script
./setup.sh

# Then start both servers
make run
```

### **Option 3: Docker Setup**
```bash
# Run with Docker Compose
make docker
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `make run` | Start both frontend and backend |
| `make run-api` | Start only backend API |
| `make run-web` | Start only frontend web |
| `make stop` | Stop all servers |
| `make logs` | Show server logs |
| `make clean` | Clean dependencies |
| `make docker` | Run with Docker |
| `make help` | Show all commands |

## Usage

1. **Create Room**: One person creates a room and gets a room code
2. **Join Room**: The other person joins using the room code
3. **Add Items**: Both can add items locally (works offline)
4. **Sync**: Press "Send Update" to sync changes with the server
5. **Auto-categorization**: Server automatically categorizes and deduplicates items

## Features

- Mobile-first PWA (installable on iOS/Android)
- Local-first with manual sync
- **AI-powered categorization** using LLMs (OpenAI, Anthropic, Cohere)
- Smart deduplication and merging
- Room-based sharing (no accounts required)
- Offline support with IndexedDB

## AI-Powered Categorization

CoopCart now supports intelligent categorization using Large Language Models (LLMs) for more accurate and flexible item categorization.

### Quick LLM Setup

```bash
# Set your LLM provider and API key
export LLM_PROVIDER=openai
export LLM_API_KEY=your-api-key-here

# Test the setup
python test_llm.py
```

**See [LLM_SETUP.md](LLM_SETUP.md) for detailed configuration instructions.**

### Benefits of LLM Categorization

- **Intelligent understanding** - Handles complex item names and variations
- **Smart deduplication** - Merges similar items across different phrasings  
- **Flexible categories** - Adapts to new item types and regional variations
- **Fallback safety** - Automatically falls back to rules-based approach if LLM fails

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Dexie (IndexedDB)
- **Backend**: FastAPI, Python 3.11+, Pydantic
- **Sync**: Custom merge algorithm with versioning
- **Categorization**: Rules-based with LLM plug-in support
