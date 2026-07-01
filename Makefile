# ============================================================================
# Smart FinTech Tracker — Makefile
# ============================================================================
# Convenience targets for development, testing, and deployment.
# Usage: make <target>
# ============================================================================

.PHONY: up down restart logs build ps clean dev \
        test-backend test-ml test-all lint setup \
        prod prod-down

# ========================= Core Docker Targets ==============================

## Start all services in detached mode
up:
	docker-compose up -d

## Stop all services
down:
	docker-compose down

## Restart all services
restart:
	docker-compose down && docker-compose up -d

## Tail live logs from all containers
logs:
	docker-compose logs -f

## Build all Docker images
build:
	docker-compose build

## Show running container status
ps:
	docker-compose ps

## Stop everything and remove volumes + orphan containers
clean:
	docker-compose down --volumes --remove-orphans

# ========================= Development Workflow =============================

## Start services and immediately tail logs (main dev command)
dev:
	docker-compose up -d && docker-compose logs -f

# ========================= Testing ==========================================

## Run backend tests inside the Docker container
test-backend:
	docker-compose exec backend npm test

## Run ML service tests inside the Docker container
test-ml:
	docker-compose exec ml-service pytest

## Run all tests across all services
test-all: test-backend test-ml

# ========================= Linting ==========================================

## Run linters for all services
lint:
	@echo "🔍 Linting backend (ESLint)..."
	cd backend && npx eslint src/ --ext .js || true
	@echo ""
	@echo "🔍 Linting ML service (Ruff)..."
	cd ml-service && python -m ruff check . || true
	@echo ""
	@echo "🔍 Linting frontend (oxlint)..."
	cd frontend && npx oxlint || true
	@echo ""
	@echo "✅ Linting complete."

# ========================= Local Setup (No Docker) ==========================

## Install all dependencies locally for development without Docker
setup:
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo ""
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo ""
	@echo "🐍 Installing ML service dependencies..."
	cd ml-service && pip install -r requirements.txt
	@echo ""
	@echo "✅ All dependencies installed."

# ========================= Production =======================================

## Start production stack (uses Dockerfile.prod for all services)
prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

## Stop production stack
prod-down:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
