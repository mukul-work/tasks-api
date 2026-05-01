# TaskAPI

A production-grade full-stack task management application built with **Node.js + Express + PostgreSQL** on the backend and **Next.js 16** on the frontend. Features JWT authentication, role-based access control, and a full task CRUD system.

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Validation:** Zod
- **Docs:** Swagger UI (OpenAPI 3.0)

### Frontend
- **Framework:** Next.js 16 (App Router) + TypeScript
- **HTTP:** Native fetch API
- **Styling:** CSS Variables + IBM Plex Mono

---

## Project Structure

```
task-api/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── prisma.ts
│   │   │   └── swagger.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   └── task.repository.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── task.service.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   ├── utils/
│   │   │   ├── hash.ts
│   │   │   ├── jwt.ts
│   │   │   └── validators/
│   │   │       ├── auth.validator.ts
│   │   │       └── task.validator.ts
│   │   └── app.ts
│   ├── openapi.yaml
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── Navbar.tsx
    │   ├── TaskCard.tsx
    │   └── TaskForm.tsx
    ├── lib/
    │   ├── api.ts
    │   └── auth.ts
    ├── types/
    │   └── index.ts
    ├── .env.local.example
    └── package.json
```

---

## Features

- **JWT Authentication** — access token (15m) + refresh token (7d) with auto-refresh on 401
- **Role-Based Access Control** — `USER` and `ADMIN` roles enforced at the service layer
- **Task CRUD** — create, read, update, delete with ownership enforcement
- **Pagination + Filtering** — paginated task list with `completed` filter
- **Zod Validation** — all inputs validated with structured error responses
- **Swagger UI** — interactive API docs at `/api/docs`
- **Global Error Handling** — operational vs unexpected errors, clean JSON responses

### RBAC Matrix

| Action | USER | ADMIN |
|---|---|---|
| `GET /tasks` | Own tasks only | All tasks |
| `GET /tasks/:id` | Own task only | Any task |
| `POST /tasks` | Creates for self | Creates for self |
| `PATCH /tasks/:id` | Own task only | Any task |
| `DELETE /tasks/:id` | Own task only | Any task |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mukul-work/tasks-api.git
cd tasks-api
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_api_db"
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Run migrations and generate Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`
Swagger UI at `http://localhost:5000/api/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

`.env.local` contents:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, receive tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tasks` | List tasks (paginated) |
| `GET` | `/api/v1/tasks/:id` | Get task by ID |
| `POST` | `/api/v1/tasks` | Create task |
| `PATCH` | `/api/v1/tasks/:id` | Update task |
| `DELETE` | `/api/v1/tasks/:id` | Delete task |

### Query Parameters (GET /tasks)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `completed` | boolean | — | Filter by completion status |

### Response Shape

```json
// Success
{ "status": "success", "data": { ... } }

// Error
{ "status": "error", "message": "..." }

// Validation error
{
  "status": "error",
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email address" }]
}
```

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role { USER ADMIN }
```

---

## Promoting a User to ADMIN

```bash
cd backend
npx prisma studio
```

Open `http://localhost:5555` → Users table → set `role` to `ADMIN` → save.

---

## Scripts

### Backend

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
```

### Frontend

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
```

---


## Author

**Mukul Kashyap**
[github.com/mukul-work](https://github.com/mukul-work) · [mukulkashyap.com](https://mukulkashyap.com)
