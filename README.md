<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikit-learn&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Tests-33_Passing-brightgreen?logo=checkmarx&logoColor=white" />
</p>

# 💰 Smart FinTech Tracker

> An AI-powered financial tracking system built as a production-grade **micro-monorepo**. Features JWT authentication, real-time ML transaction categorization, interactive dashboards, and full Docker orchestration.

---

## 🎬 What It Does

1. **Register / Login** → JWT-secured auth with bcrypt password hashing
2. **Add a transaction** → Describe it (e.g. "Uber ride downtown") and optionally leave category blank
3. **AI auto-categorizes** → The Python ML service classifies it in real-time using TF-IDF + Naive Bayes
4. **Dashboard updates** → KPI cards, donut chart, bar chart, and filterable ledger update instantly
5. **Data is user-scoped** → Each user sees only their own financial data

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                           │
│                     (fintech-network bridge)                    │
│                                                                 │
│  ┌──────────────┐   REST    ┌──────────────┐   REST    ┌──────────────┐
│  │   Frontend   │ ───────→  │   Backend    │ ───────→  │  ML Service  │
│  │  React/Vite  │           │  Express.js  │           │   FastAPI    │
│  │  Tailwind v4 │           │  Mongoose    │           │  scikit-learn│
│  │  Recharts    │           │  JWT Auth    │           │  TF-IDF/NB   │
│  │  port: 5173  │           │  port: 3000  │           │  port: 8000  │
│  └──────────────┘           └──────┬───────┘           └──────────────┘
│                                    │                                    │
│                              ┌─────▼─────┐                             │
│                              │  MongoDB   │                             │
│                              │ port:27017 │                             │
│                              └───────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | ML logic (Python) is fully decoupled from web logic (Node.js) |
| **Independent Scalability** | Each service can be scaled, redeployed, or upgraded independently |
| **Unified Development** | `docker-compose up` launches the entire ecosystem in seconds |
| **Production Parity** | Dev and prod configs share the same base; `Dockerfile.prod` adds multi-stage builds |

---

## 📁 Project Structure

```text
smart-fin-tracker/
├── frontend/                          # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/                # 7 reusable UI components
│   │   │   ├── Header.jsx             # Navbar with health badges + logout
│   │   │   ├── KpiCards.jsx           # Balance / Income / Expense cards
│   │   │   ├── TransactionForm.jsx    # Add transaction with AI hint
│   │   │   ├── TransactionList.jsx    # Scrollable ledger with badges
│   │   │   ├── Filters.jsx           # Search + type + category filters
│   │   │   └── charts/
│   │   │       ├── CategoryPieChart.jsx
│   │   │       └── FlowBarChart.jsx
│   │   ├── context/AuthContext.jsx    # JWT auth state (React Context)
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx           # Login / Register (toggle)
│   │   │   └── Dashboard.jsx          # Main dashboard orchestrator
│   │   ├── services/api.js            # Axios instance + interceptors
│   │   └── constants.js               # Category colors & shared data
│   ├── Dockerfile / Dockerfile.prod   # Dev (Vite HMR) / Prod (nginx)
│   └── nginx.conf                     # SPA routing + gzip + caching
│
├── backend/                           # Node.js + Express (MVC)
│   ├── src/
│   │   ├── config/db.js               # Mongoose connection
│   │   ├── models/
│   │   │   ├── User.js                # User schema + bcrypt hooks
│   │   │   └── Transaction.js         # Transaction schema (user-scoped)
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT Bearer verification
│   │   │   ├── validate.js            # express-validator chains
│   │   │   └── errorHandler.js        # Centralized error responses
│   │   ├── routes/
│   │   │   ├── auth.js                # POST /register, /login, GET /me
│   │   │   └── transactions.js        # Full CRUD + ML auto-categorization
│   │   ├── utils/generateToken.js     # JWT signing helper
│   │   └── __tests__/                 # 20 Jest integration tests
│   ├── Dockerfile / Dockerfile.prod   # Dev (nodemon) / Prod (multi-stage)
│   ├── .eslintrc.json / .prettierrc   # Code quality configs
│   └── jest.config.js
│
├── ml-service/                        # Python + FastAPI + scikit-learn
│   ├── main.py                        # 75-sample classifier, 5 endpoints
│   ├── tests/                         # 13 pytest test cases
│   ├── Dockerfile / Dockerfile.prod   # Dev / Prod (4 uvicorn workers)
│   ├── pyproject.toml                 # Project metadata
│   └── ruff.toml                      # Python linting
│
├── docker-compose.yml                 # Dev (hot-reload + health checks)
├── docker-compose.prod.yml            # Production override
├── Makefile                           # 12 convenience commands
└── .gitignore
```

---

## ⚡ Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Launch

```bash
git clone https://github.com/deveshsy/smart-fin-tracker.git
cd smart-fin-tracker
make up        # builds + starts all 4 containers
make logs      # (optional) tail live logs
```

Open **http://localhost:5173** → Register an account → Start tracking!

### All Make Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services in background |
| `make dev` | Start + tail logs (recommended) |
| `make down` | Stop all services |
| `make restart` | Down + Up |
| `make logs` | Follow live container logs |
| `make ps` | Show container status |
| `make build` | Rebuild all images |
| `make clean` | Remove containers + volumes |
| `make test-all` | Run backend + ML tests |
| `make test-backend` | Run Jest tests only |
| `make test-ml` | Run pytest tests only |
| `make lint` | Lint all services |
| `make prod` | Start production stack |
| `make prod-down` | Stop production stack |

---

## 🔌 API Reference

### Auth Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ✗ | Create account → returns JWT |
| `POST` | `/api/auth/login` | ✗ | Login → returns JWT |
| `GET` | `/api/auth/me` | ✓ | Get authenticated user profile |

### Transaction Endpoints (`/api/transactions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/transactions` | ✓ | List user's transactions (sorted by date) |
| `POST` | `/api/transactions` | ✓ | Create transaction (AI categorizes if no category) |
| `PUT` | `/api/transactions/:id` | ✓ | Update a transaction |
| `DELETE` | `/api/transactions/:id` | ✓ | Delete a transaction |

### ML Service Endpoints (`:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service status + model state |
| `GET` | `/categories` | List all known categories |
| `POST` | `/predict` | Classify a single description |
| `POST` | `/batch-predict` | Classify multiple descriptions |
| `POST` | `/retrain` | Retrain model with new labeled data |

<details>
<summary><b>Example: ML Prediction Request</b></summary>

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"description": "netflix monthly subscription"}'
```

```json
{
  "description": "netflix monthly subscription",
  "category": "Entertainment",
  "confidence": 0.8767
}
```
</details>

---

## 🧠 ML Classification Model

**Algorithm:** TF-IDF Vectorizer → Multinomial Naive Bayes Pipeline

**Training Data:** 75 labeled samples across 7 categories:

| Category | Examples | Color |
|----------|----------|-------|
| 🍽️ Food & Dining | Starbucks, McDonald's, UberEats, Whole Foods | `#f59e0b` |
| 🔌 Utilities | Electric bill, Comcast, Verizon phone | `#3b82f6` |
| 🚗 Transport | Uber, Lyft, Chevron gas, Metro transit | `#8b5cf6` |
| 🎬 Entertainment | Netflix, Spotify, Steam, AMC theaters | `#ec4899` |
| 🛍️ Shopping | Amazon, Target, Nike, Best Buy | `#f97316` |
| 🏥 Healthcare | CVS pharmacy, Dr. appointment, dental | `#14b8a6` |
| 💰 Income | Salary, freelance invoice, dividends | `#10b981` |

**Persistence:** Model is saved to disk via `joblib`. On container restart it loads from cache instead of retraining. The `/retrain` endpoint accepts new labeled data to improve accuracy.

**Confidence Threshold:** Predictions below 25% confidence are automatically labeled `Uncategorized`.

---

## 🧪 Testing

**33 automated tests** across 2 services:

| Service | Framework | Tests | Coverage |
|---------|-----------|-------|----------|
| Backend | Jest + Supertest | 20 | Auth (8) + Transactions (12) |
| ML Service | pytest + httpx | 13 | All 5 endpoints + edge cases |

```bash
# Run everything
make test-all

# Individual suites
make test-backend   # Jest integration tests
make test-ml        # pytest test suite
```

---

## 🔒 Security Features

- **JWT Authentication** — Token-based auth with 30-day expiry via `jsonwebtoken`
- **Password Hashing** — bcrypt with automatic salt rounds via `bcryptjs`
- **User-Scoped Data** — MongoDB queries filter by authenticated user ID
- **Input Validation** — `express-validator` chains on all endpoints
- **Auto-Logout** — Axios interceptor clears tokens on 401 responses
- **Production Hardening** — Non-root Docker users, unexposed DB ports, health checks

---

## 🚀 Production Deployment

```bash
# Build and start production stack
make prod

# Uses multi-stage Dockerfiles:
# - Frontend: Vite build → nginx:alpine (~25MB image)
# - Backend: Node.js without devDependencies
# - ML Service: uvicorn with 4 workers
```

### Environment Variables

| Variable | Service | Description | Required |
|----------|---------|-------------|----------|
| `JWT_SECRET` | Backend | JWT signing secret | ✓ |
| `MONGO_URI` | Backend | MongoDB connection string | ✓ |
| `NODE_ENV` | Backend | Set to `production` | ✓ |
| `ML_SERVICE_URL` | Backend | Internal URL to ML service | ✓ |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | SPA with HMR |
| **UI Components** | Lucide React, Recharts | Icons + data visualization |
| **Backend** | Node.js, Express 4, Mongoose 8 | REST API + ORM |
| **Auth** | jsonwebtoken, bcryptjs | JWT + password hashing |
| **Validation** | express-validator | Request body validation |
| **ML** | FastAPI, scikit-learn, pandas | Text classification API |
| **Database** | MongoDB 7 | Document storage |
| **DevOps** | Docker Compose, GitHub Actions | Container orchestration + CI |
| **Linting** | ESLint + Prettier, Ruff, oxlint | Code quality |
| **Testing** | Jest + Supertest, pytest + httpx | Integration tests |

---

## 📄 License

MIT — free to use, modify, and distribute.
