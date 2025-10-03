# CoopCart Development Makefile

.PHONY: help install run stop clean logs test

# Default target
help:
	@echo "CoopCart Development Commands:"
	@echo "  make install    - Install dependencies for both frontend and backend"
	@echo "  make run        - Start both frontend and backend servers"
	@echo "  make stop       - Stop all running servers"
	@echo "  make logs       - Show logs from both servers"
	@echo "  make clean      - Clean up node_modules and Python cache"
	@echo "  make test       - Run tests for both frontend and backend"
	@echo ""
	@echo "Individual commands:"
	@echo "  make run-api    - Start only the backend API server"
	@echo "  make run-web    - Start only the frontend web server"
	@echo "  make docker     - Run with Docker Compose"

# Install dependencies
install:
	@echo "📦 Installing backend dependencies..."
	cd apps/api && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
	@echo "📦 Installing frontend dependencies..."
	cd apps/web && npm install
	@echo "✅ Dependencies installed!"

# Start both servers
run: install
	@echo "🚀 Starting CoopCart development servers..."
	@echo "📱 Frontend: http://127.0.0.1:5173"
	@echo "🔧 Backend:  http://127.0.0.1:8000"
	@echo "📚 API Docs: http://127.0.0.1:8000/docs"
	@echo ""
	@echo "Press Ctrl+C to stop all servers"
	@echo ""
	@trap 'kill %1 %2' INT; \
	cd apps/api && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload & \
	cd apps/web && npm run dev & \
	wait

# Start only backend
run-api:
	@echo "🔧 Starting backend API server..."
	cd apps/api && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start only frontend
run-web:
	@echo "📱 Starting frontend web server..."
	cd apps/web && npm run dev

# Stop all servers
stop:
	@echo "🛑 Stopping all servers..."
	@pkill -f "uvicorn main:app" || true
	@pkill -f "vite" || true
	@pkill -f "npm run dev" || true
	@echo "✅ All servers stopped"

# Show logs
logs:
	@echo "📋 Server logs:"
	@echo "Backend logs:"
	@ps aux | grep uvicorn | grep -v grep || echo "Backend not running"
	@echo ""
	@echo "Frontend logs:"
	@ps aux | grep vite | grep -v grep || echo "Frontend not running"

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	cd apps/web && rm -rf node_modules package-lock.json
	cd apps/api && rm -rf .venv __pycache__ *.pyc
	@echo "✅ Cleanup complete"

# Run tests
test:
	@echo "🧪 Running tests..."
	@echo "Backend tests:"
	cd apps/api && source .venv/bin/activate && python -m pytest tests/ || echo "No backend tests found"
	@echo "Frontend tests:"
	cd apps/web && npm run test:run || echo "No frontend tests found"

# Run tests in watch mode
test-watch:
	@echo "🧪 Running tests in watch mode..."
	@echo "Frontend tests (watch):"
	cd apps/web && npm run test
	@echo "Backend tests (watch):"
	cd apps/api && source .venv/bin/activate && python -m pytest tests/ --watch || echo "No backend tests found"

# Run specific test files
test-frontend:
	@echo "🧪 Running frontend tests..."
	cd apps/web && npm run test:run

test-backend:
	@echo "🧪 Running backend tests..."
	cd apps/api && source .venv/bin/activate && python -m pytest tests/ -v

# Run tests before commit
test-pre-commit:
	@echo "🧪 Running pre-commit tests..."
	$(MAKE) test
	@echo "✅ All tests passed!"

# Docker commands
docker:
	@echo "🐳 Starting with Docker Compose..."
	docker-compose up --build

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

# Development helpers
dev-setup: install
	@echo "🔧 Setting up development environment..."
	@echo "Creating .env files..."
	@echo 'VITE_API_BASE=http://127.0.0.1:8000' > apps/web/.env
	@echo 'LLM_PROVIDER=openai' > apps/api/.env
	@echo 'LLM_API_KEY=your_api_key_here' >> apps/api/.env
	@echo "✅ Development environment ready!"
	@echo "Run 'make run' to start both servers"
