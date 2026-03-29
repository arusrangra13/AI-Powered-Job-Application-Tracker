# 🚀 AI-Powered Job Application Tracker

A full-stack web application to track and manage job applications with AI-powered resume matching.

## Features

- 📋 **Kanban Board** — Drag-and-drop applications across Applied, Interview, Offer, Rejected
- 🤖 **AI Resume Analyzer** — NLP-based resume/job-description matching with spaCy + HuggingFace
- 📊 **Dashboard** — Stats, response rate gauge, recent activity
- 🔔 **Reminders** — Deadline and interview schedule tracking
- 💼 **Job Management** — Full CRUD for job listings
- 🔐 **Auth** — JWT-based authentication

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| AI/NLP | Python FastAPI + spaCy + HuggingFace |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push

# Frontend
cd ../frontend
npm install

# NLP Service (optional)
cd ../nlp-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Start Services

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — NLP Service (optional)
cd nlp-service && uvicorn main:app --reload
```

Visit **http://localhost:3000**

### Docker (All Services)

```bash
docker-compose up --build
```

Visit **http://localhost:3000**

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobtracker
JWT_SECRET=your-secret-key
NLP_SERVICE_URL=http://localhost:8000
PORT=5000
```

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/jobs
POST   /api/jobs
GET    /api/applications
POST   /api/applications
PUT    /api/applications/:id/status
POST   /api/analyze/resume
GET    /api/dashboard/stats
GET    /api/reminders
POST   /api/reminders
```

> **Note:** The NLP service includes a smart keyword-based fallback when the Python service is unavailable, ensuring the app always works.
