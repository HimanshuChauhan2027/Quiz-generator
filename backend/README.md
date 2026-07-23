# Quiz Generator — Backend

A simple Node.js + Express backend for the Quiz Generator app. Built for a
college placement interview, so it focuses on the core features and keeps
the code easy to read and explain.

## Features

- User registration & login (JWT + bcrypt)
- AI quiz generation with Gemini 2.5 Flash
- Submit a quiz attempt and calculate the score
- Quiz history per user
- Simple leaderboard by difficulty
- Basic quiz CRUD (create, edit, delete, duplicate, browse public quizzes)

## Tech Stack

- **Express** – HTTP server and routing
- **Sequelize** – ORM (SQLite by default, Postgres if you set `DATABASE_URL`)
- **jsonwebtoken** – JWT auth
- **bcryptjs** – password hashing
- **@google/genai** – Gemini API SDK
- **multer** – profile picture uploads

## Project Structure

```
backend/
  config/        # database + Gemini client setup
  controllers/    # request handlers (the actual logic)
  middleware/     # auth check, file upload, error handler
  models/         # Sequelize models: User, Quiz, Score
  routes/         # Express routers, one per resource
  services/       # Gemini prompt/call, quiz saving
  utils/          # small helpers (JWT sign/verify, async wrapper)
  server.js
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the environment file and fill in your values:
   ```
   cp .env.example .env
   ```
   You need a `GEMINI_API_KEY` (get one at https://aistudio.google.com/apikey)
   and a `JWT_SECRET` (any long random string).
3. Start the server:
   ```
   npm start
   ```
   or, for auto-restart on file changes:
   ```
   npm run dev
   ```

The server runs on `http://localhost:5000` by default. On startup it
automatically creates the SQLite database file (`database.sqlite`) and the
three tables (User, Quiz, Score) — no manual migration needed.

To use Postgres instead of SQLite, just set `DATABASE_URL` in `.env`,
e.g. `postgres://user:password@localhost:5432/quizdb`.

## API Overview

| Method | Route                              | Auth | Description                     |
|--------|-------------------------------------|------|----------------------------------|
| POST   | /api/auth/register                  | -    | Create an account                |
| POST   | /api/auth/login                     | -    | Log in (form-urlencoded body)    |
| GET    | /api/auth/me                        | Yes  | Current user profile             |
| PATCH  | /api/auth/me                        | Yes  | Update username                  |
| POST   | /api/auth/change-password           | Yes  | Change password                  |
| POST   | /api/auth/me/avatar, /me/cover       | Yes  | Upload profile pictures          |
| DELETE | /api/auth/delete-account            | Yes  | Delete account and its data      |
| POST   | /api/auth/forgot-password, /reset-password | -  | Password reset flow (token logged to console instead of emailed) |
| POST   | /api/generate/quiz                  | Yes  | Generate a quiz with Gemini      |
| GET    | /api/quizzes/                       | -    | List all quizzes                 |
| POST   | /api/quizzes/                       | Yes  | Create a quiz (editor)           |
| GET    | /api/quizzes/:id                    | -    | Get one quiz                     |
| PUT    | /api/quizzes/:id                    | Yes  | Update your own quiz             |
| DELETE | /api/quizzes/:id                    | Yes  | Delete your own quiz             |
| GET    | /api/quizzes/browse/public          | -    | Browse public quizzes            |
| GET    | /api/quizzes/leaderboard/:difficulty| -    | Top scores for a difficulty      |
| GET    | /api/quizzes/stats/global            | -    | Platform-wide stats              |
| GET    | /api/editor/my-quizzes              | Yes  | Quizzes you created              |
| GET    | /api/editor/templates               | -    | Starter quiz templates           |
| POST   | /api/editor/quiz/:id/duplicate       | Yes  | Duplicate a quiz                 |
| POST   | /api/scores/:quizId                 | Yes  | Start/record a quiz attempt      |
| PUT    | /api/scores/:scoreId                | Yes  | Update an attempt (finalize)     |
| GET    | /api/scores/user/history             | Yes  | Your quiz history                |
| GET    | /api/scores/latest/:quizId           | Yes  | Your latest attempt on a quiz    |
| GET    | /api/scores/attempt/:scoreId         | Yes  | A specific attempt               |
| DELETE | /api/scores/:scoreId                 | Yes  | Delete an attempt                |
| GET    | /api/users/stats                     | Yes  | Your personal stats & streak     |

