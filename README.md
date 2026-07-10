# BeroTrac API

BeroTrac is a hotel transparency API for tracking sales, expenses, and pending transactions across departments such as lodging, bar, kitchen, swimming, snooker, ps5, club, hall, and gym.

## Features

- Public monthly dashboard summary endpoint
- Role-based authentication with admin and regular users
- Admin-only write operations for sales, expenses, and pending records
- Pending clearing flow that reduces the monthly pending total
- Swagger documentation at /api-docs
- Docker-based PostgreSQL and Redis setup

## Environment

Create a .env file with values such as:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@postgres:5432/berotrac
REDIS_URL=redis://redis:6379
JWT_SECRET=change-this-secret
```

## Run with Docker

```bash
docker compose -f docker-compose.dev.yml up --build
```

The API will be available at http://localhost:5000 and Swagger at http://localhost:5000/api-docs.

## Main API Routes

- GET /api/v1/dashboard/summary
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/financial/sales
- POST /api/v1/financial/expenses
- POST /api/v1/financial/pending
- PATCH /api/v1/financial/pending/:id/clear

## Database migration

```bash
docker compose -f docker-compose.dev.yml exec api npx prisma migrate dev --name init
```

## Tests

```bash
npm test
```
