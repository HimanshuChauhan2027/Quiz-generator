# 🧠 Quiz Generator

A full-stack app for generating AI-powered quizzes, taking them, and tracking
your scores on a leaderboard.

This version of the project has been trimmed down to its core features —
originally built for a college placement interview, so the backend stays
simple and easy to walk through.

## Features

- User registration & login (JWT + bcrypt)
- Generate quizzes on any topic using Gemini 2.5 Flash
- Take a quiz and get your score calculated automatically
- Personal quiz history and stats
- Simple leaderboard by difficulty
- Create your own quizzes in the editor, browse public quizzes

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, Sequelize (SQLite by default, Postgres optional)
- **AI**: Google Gemini 2.5 Flash (`@google/genai`)
- **Auth**: JWT + bcrypt

## Project Structure

```
quiz-generator/            # Next.js frontend
quiz-generator-backend/    # Express backend (see its README for details)
```

## Quick Start (local, no Docker)

**Backend**
```bash
cd quiz-generator-backend
npm install
cp .env.example .env   # fill in GEMINI_API_KEY and JWT_SECRET
npm start
```

**Frontend**
```bash
cd quiz-generator
npm install
cp .env.example .env.local   # NEXT_PUBLIC_BASE_URL=http://localhost:5000/api
npm run dev
```

Open http://localhost:3000.

## What changed from the original project

The backend was rewritten from Python/FastAPI to Node/Express and trimmed to
just what's needed for a quiz app: auth, quiz generation, scoring, history,
and a leaderboard. Friends, notifications, and admin roles were removed to
keep the codebase small enough to explain end-to-end in an interview. See
`quiz-generator-backend/README.md` for the full breakdown.
