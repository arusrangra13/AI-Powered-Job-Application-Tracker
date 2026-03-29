# 🚀 AI-Powered Job Application Tracker

> A full-stack web application that helps you track job applications, analyze resume-job fit with AI, and stay on top of your job search — all in one place.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Manual Setup](#manual-setup)
  - [Docker Setup](#docker-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [CI/CD](#-cicd)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Managing a job search across multiple platforms is chaotic. This app centralizes everything — from tracking where you applied, to understanding how well your resume matches a job description — using a smart NLP engine powered by **spaCy** and **HuggingFace Transformers**.

Whether you're actively job hunting or passively exploring opportunities, this tracker gives you clarity, structure, and AI-backed insights.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📋 **Kanban Board** | Drag-and-drop applications across `Applied`, `Interview`, `Offer`, and `Rejected` stages |
| 🤖 **AI Resume Analyzer** | NLP-based resume ↔ job description matching using spaCy + HuggingFace Transformers |
| 📊 **Dashboard** | Visual stats including application counts, response rate gauge, and recent activity feed |
| 🔔 **Reminders** | Track interview schedules and application deadlines so nothing slips through |
| 💼 **Job Management** | Full CRUD for job listings — add, edit, update status, and delete |
| 🔐 **Authentication** | Secure JWT-based login and registration |
| 🐳 **Docker Support** | One-command setup for all services via Docker Compose |
| ⚙️ **Smart Fallback** | Keyword-based resume matching fallback when the Python NLP service is unavailable |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 + Prisma ORM |
| **AI / NLP** | Python, FastAPI, spaCy, HuggingFace Transformers |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│             React 18 + Vite + Tailwind CSS              │
│                    localhost:3000                        │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────────┐
│                    Backend API                          │
│              Node.js + Express.js                       │
│                    localhost:5000                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Prisma ORM                          │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │                    │ HTTP
          ┌───────────────▼──────┐   ┌─────────▼──────────┐
          │     PostgreSQL       │   │   NLP Microservice  │
          │       Port 5432      │   │  FastAPI + spaCy    │
          └──────────────────────┘   │  + HuggingFace      │
                                     │    localhost:8000   │
                                     └────────────────────-┘
```

The backend communicates with a separate **Python FastAPI microservice** for NLP tasks. If the NLP service is down, a keyword-matching fallback ensures the app remains fully functional.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js 18+](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/)
- [PostgreSQL 15+](https://www.postgresql.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) *(optional, for containerized setup)*

---

### Manual Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/arusrangra13/AI-Powered-Job-Application-Tracker.git
cd AI-Powered-Job-Application-Tracker
```

#### 2. Backend Setup

```bash
cd backend
cp .env.example .env        # Fill in your environment variables
npm install
npx prisma generate
npx prisma db push
npm run dev                 # Starts on http://localhost:5000
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev                 # Starts on http://localhost:3000
```

#### 4. NLP Service Setup *(Optional — app works without it)*

```bash
cd ../nlp-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload   # Starts on http://localhost:8000
```

---

### Docker Setup

The easiest way to spin up all three services at once:

```bash
docker-compose up --build
```

Visit **http://localhost:3000** — all services will be running.

To stop all services:

```bash
docker-compose down
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory. Use `backend/.env.example` as a template.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/jobtracker` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-super-secret-key` |
| `NLP_SERVICE_URL` | Base URL for the Python NLP service | `http://localhost:8000` |
| `PORT` | Port for the Express backend | `5000` |

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | List all job listings |
| `POST` | `/api/jobs` | Create a new job listing |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applications` | Get all applications for current user |
| `POST` | `/api/applications` | Add a new application |
| `PUT` | `/api/applications/:id/status` | Update application status |

### AI / Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze/resume` | Analyze resume vs job description match |

### Dashboard & Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Get dashboard statistics |
| `GET` | `/api/reminders` | List all reminders |
| `POST` | `/api/reminders` | Create a new reminder |

> All protected routes require `Authorization: Bearer <token>` in the request header.

---

## 📁 Project Structure

```
AI-Powered-Job-Application-Tracker/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
├── backend/
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── middleware/     # Auth middleware, error handling
│   │   └── controllers/    # Business logic
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   └── hooks/          # Custom React hooks
│   └── package.json
├── nlp-service/
│   ├── main.py             # FastAPI app entry point
│   └── requirements.txt
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ⚙️ CI/CD

This project uses **GitHub Actions** for automated workflows. Pipelines are defined in `.github/workflows/` and can be configured for:

- Linting and testing on pull requests
- Building Docker images on merge to `main`
- Deploying to your cloud provider of choice

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style and include meaningful commit messages.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ by <a href="https://github.com/arusrangra13">arusrangra13</a></p>
