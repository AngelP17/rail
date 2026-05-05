# HMAX-Lite: Panama Metro Digital Twin
# ======================================

.PHONY: help up down build dev-backend dev-frontend lint test clean

help: ## Show this help message
	@echo "HMAX-Lite — Available Commands"
	@echo "=============================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start full stack with Docker Compose
	cd hmax-lite && docker-compose up --build

down: ## Stop Docker Compose stack
	cd hmax-lite && docker-compose down

build: ## Build production Docker images
	cd hmax-lite && docker-compose build

dev-backend: ## Run backend in development mode
	cd hmax-lite/backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

dev-frontend: ## Run frontend in development mode
	cd hmax-lite/frontend && npm run dev

lint-frontend: ## Lint frontend code
	cd hmax-lite/frontend && npm run lint

lint-backend: ## Check backend code style
	cd hmax-lite/backend && python -m compileall .

build-frontend: ## Build frontend for production
	cd hmax-lite/frontend && npm run build

test-frontend: ## Run frontend tests (if available)
	cd hmax-lite/frontend && echo "No frontend tests configured yet"

test-backend: ## Run backend tests
	cd hmax-lite/backend && source venv/bin/activate && pytest -v

test: test-backend ## Run all tests

verify: lint-frontend lint-backend build-frontend test-backend ## Full verification pipeline

clean: ## Clean build artifacts and caches
	cd hmax-lite/frontend && rm -rf dist node_modules/.cache
	cd hmax-lite/backend && find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	cd hmax-lite/backend && rm -rf .pytest_cache
