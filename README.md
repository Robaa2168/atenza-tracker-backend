<!-- File: backend/README.md -->
# Atenza Tracker Backend

Express + MongoDB API for Atenza Tracker.

## Features

- JWT auth (`register`, `login`, `me`)
- Leads CRUD with search/filter/sort and archive toggle
- Interactions logging and follow-up updates
- Deals logging with totals/revenue
- Dashboard summary (daily serious target, due/overdue/cold, recent activity)
- Zod validation and centralized error handling

## Tech

- Node.js
- Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Zod

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Env vars

Required:

- `MONGODB_URI`
- `JWT_SECRET`

Optional:

- `PORT` (default `5000`)
- `JWT_EXPIRES_IN` (default `7d`)
- `CLIENT_URL` (default `http://localhost:5173`)
- `SEED_USER_EMAIL`
- `SEED_USER_PASSWORD`
- `SEED_USER_NAME`

## Seed first owner

```bash
npm run seed:user
```

## API base

- `http://localhost:5000/api/v1`

Health:

- `GET /api/v1/health`
