# Smart FinTech Tracker — Micro-Monorepo

[![CI Pipeline](https://github.com/<your-username>/smart-fin-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-username>/smart-fin-tracker/actions/workflows/ci.yml)

A high-performance, professional-grade financial tracking system organized as a monorepo. This application integrates a React frontend, a Node.js + Express API backend, and a Python FastAPI Machine Learning service for automated transaction categorization.

## 🏗️ Architectural Overview

The application follows a decoupled microservices architecture orchestrating 4 primary containers:

```text
                     ┌───────────────────┐
                     │   React Frontend  │ (Vite / Tailwind CSS v4)
                     └─────────┬─────────┘
                               │ (REST API)
                               ▼
                     ┌───────────────────┐
                     │  Node.js Backend  │ (Express / Mongoose)
                     └────┬──────────┬───┘
                          │          │
             (MongoDB)    │          │ (REST API)
             ┌────────────▼──┐       ▼
             │  MongoDB Database │  ┌───────────────────┐
             └───────────────┘      │    ML Service     │ (Python / FastAPI)
                                    │ (Naive Bayes /    │
                                    │  TF-IDF Classify) │
                                    └───────────────────┘
```

- **Frontend (`/frontend`)**: Built with React, Vite, Tailwind CSS v4, Lucide Icons, and Recharts. Exposes port `5173`.
- **Backend (`/backend`)**: Node.js & Express API acting as the central hub and schema layer. Exposes port `3000`.
- **ML Service (`/ml-service`)**: Python + FastAPI hosting a Multinomial Naive Bayes text classification model trained on startup to categorize transaction descriptions in real-time. Exposes port `8000`.
- **Database (`mongodb`)**: Persistent MongoDB instance for storing financial ledger data. Exposes port `27017`.

---

## ⚡ Quick Start

Ensure you have **Docker** and **Docker Compose** installed on your system.

### Running with Makefile
Convenience shortcuts are available in the root `Makefile`:

```bash
# Start all services in the background
make up

# Start and immediately tail logs (recommended for development)
make dev

# Check status of all containers
make ps

# Tail live application logs
make logs

# Stop all services
make down

# Clean all volumes and containers
make clean
```

### Running with Docker Compose directly
If you do not have `make` installed:

```bash
# Build and run containers
docker-compose up -d --build

# Shutdown containers
docker-compose down -v
```

Once running, navigate to [http://localhost:5173](http://localhost:5173) in your browser to access the FinTech Dashboard.

---

## 🧪 Testing

Run the full test suite across all services:

```bash
# Run all tests (backend + ML service)
make test-all

# Run only backend tests
make test-backend

# Run only ML service tests
make test-ml
```

### Linting

```bash
# Lint all services (ESLint, Ruff, oxlint)
make lint
```

---

## 🔄 CI/CD Pipeline

This project includes a GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`) that runs automatically on:
- Every push to `main` / `master`
- Every pull request targeting `main` / `master`

The pipeline runs **4 parallel jobs**:

| Job | Description |
|-----|-------------|
| **Backend Tests** | Installs Node 18 deps, runs `npm test` |
| **ML Tests** | Installs Python 3.10 deps, runs `pytest` |
| **Frontend Build** | Installs deps, verifies `npm run build` succeeds |
| **Docker Build** | Runs `docker compose build` to verify all Dockerfiles |

---

## 🚀 Production Deployment

Each service has a production-optimized `Dockerfile.prod` with multi-stage builds:

```bash
# Build and start the production stack
make prod

# Or use docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Stop the production stack
make prod-down
```

**Production differences:**
- **Backend**: Runs with `node` directly (no nodemon), production-only dependencies
- **ML Service**: Runs uvicorn with `--workers 4` for concurrency
- **Frontend**: Static assets served by nginx on port `80` (no Vite dev server)
- **All services**: Non-root users, health checks, smaller images via multi-stage builds
- **MongoDB**: Port not exposed to host for security

### Environment Variables

Set these before deploying to production:

| Variable | Service | Description |
|----------|---------|-------------|
| `JWT_SECRET` | Backend | Secret key for JWT token signing |
| `MONGO_URI` | Backend | MongoDB connection string |
| `NODE_ENV` | Backend | Set to `production` |
| `ML_SERVICE_URL` | Backend | Internal URL to ML service |

---

## 🛠️ Development Workflow

### Local Setup (Without Docker)

```bash
# Install all dependencies for local development
make setup
```

This runs `npm install` in both the backend and frontend directories, and `pip install -r requirements.txt` in the ml-service directory.

### With Docker (Recommended)

```bash
# 1. Start all services with hot-reloading
make dev

# 2. Edit source code — changes are reflected automatically:
#    - Backend: nodemon watches ./backend/src/
#    - Frontend: Vite HMR watches ./frontend/src/
#    - ML Service: source is bind-mounted at ./ml-service/

# 3. Run tests
make test-all

# 4. Lint your code
make lint

# 5. Stop when done
make down
```

### Project Structure

```
smart-fin-tracker/
├── .github/workflows/ci.yml    # CI/CD pipeline
├── docker-compose.yml           # Development orchestration
├── docker-compose.prod.yml      # Production overrides
├── Makefile                     # Developer shortcuts
├── backend/
│   ├── Dockerfile               # Dev image (nodemon)
│   ├── Dockerfile.prod          # Prod image (multi-stage)
│   ├── .eslintrc.json           # ESLint config
│   ├── .prettierrc              # Prettier config
│   └── src/                     # Express API source
├── ml-service/
│   ├── Dockerfile               # Dev image
│   ├── Dockerfile.prod          # Prod image (multi-stage)
│   ├── ruff.toml                # Python linter config
│   └── main.py                  # FastAPI application
└── frontend/
    ├── Dockerfile               # Dev image (Vite)
    ├── Dockerfile.prod          # Prod image (nginx)
    ├── nginx.conf               # Nginx SPA config
    └── src/                     # React application source
```

---

## 🔌 API Documentation

### Node.js Backend API (`http://localhost:3000`)
- `GET /api/health` — Checks API health status.
- `GET /api/transactions` — Retrieves all transactions, ordered chronologically.
- `POST /api/transactions` — Creates a new transaction. If `category` is omitted, it automatically requests a prediction from the ML service.
- `DELETE /api/transactions/:id` — Deletes a transaction by database ID.

### Python FastAPI ML Service (`http://localhost:8000`)
- `GET /health` — Checks ML service and model training state.
- `POST /predict` — Evaluates a text description and returns the predicted category and model confidence.
  - **Request Body**: `{ "description": "netflix monthly subscription" }`
  - **Response Body**: `{ "description": "netflix monthly subscription", "category": "Entertainment", "confidence": 0.856 }`

---

## 🧠 ML Categorization Model
The Machine Learning service automatically categorizes standard business transactions into:
- 🍽️ **Food & Dining** (e.g., Starbucks, McDonald's, UberEats)
- 🔌 **Utilities** (e.g., electricity, water, Comcast, Verizon)
- 🚗 **Transport** (e.g., Uber, Lyft, Chevron, Subway)
- 🎬 **Entertainment** (e.g., Netflix, Spotify, Steam)
- 💰 **Income** (e.g., Salary, Invoice, Dividend)

If the confidence score drops below 25%, the model marks the transaction as `Uncategorized`.
