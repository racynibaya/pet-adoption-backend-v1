# 🐾 Pet Adoption Platform — Backend API

A RESTful backend API for a **multi-shelter pet adoption platform**. Built as a portfolio project demonstrating role-based access control, multi-tenancy, JWT auth with refresh token rotation, and clean feature-module architecture.

---

## 📌 Project Overview

Shelters can list pets and manage adoption applications. Adopters can browse available pets and submit structured adoption requests. Admins manage the platform.

```
Shelter posts pet → Adopter finds pet → Adopter applies → Shelter reviews → Adoption complete
```

---

## 🧑‍🤝‍🧑 Roles

| Role           | Description                                            |
|----------------|--------------------------------------------------------|
| `PUBLIC`       | Browse pets and shelters without an account            |
| `USER`         | Submit adoption requests, manage their own profile     |
| `STAFF`        | Add/manage pet listings for their shelter              |
| `ADMIN`        | Manage shelters, users, and the full platform          |

---

## ✅ Implementation Status

### Done
- JWT auth — register, login, logout, email verification, refresh token rotation
- Role-based access control (USER / STAFF / ADMIN)
- Multi-shelter platform support
- Pet listings with image upload (Staff/Admin only)
- Paginated pet list (`GET /pets`) — excludes adopted pets
- Single pet detail (`GET /pets/:id`)
- Paginated shelter list + shelter CRUD (Admin only)
- Adoption request submission with structured questionnaire
- Global error handling with typed error classes
- Rate limiting & CORS

### Stubbed (routes exist, not yet implemented)
- `PATCH /pets/:id`, `DELETE /pets/:id`, `POST /pets/:id/images`
- `GET /shelters/:id`
- Booking and Donation modules (schema only)

---

## 🏗️ Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Runtime    | Node.js + TypeScript                          |
| Framework  | Express.js v5                                 |
| ORM        | Prisma v7 (custom output path + pg adapter)   |
| Database   | PostgreSQL 16                                 |
| Auth       | JWT — access + refresh token rotation         |
| Validation | Zod                                           |
| Security   | bcrypt, httpOnly cookies, rate limiting, CORS |
| Dev Tools  | tsx, nodemon, Morgan, Docker Compose          |

---

## 📋 Prerequisites

- Node.js v18+
- Docker + Docker Compose
- npm

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/racynibaya/pet-adoption-backend-v1.git
cd pet-adoption-backend-v1
npm install
```

### 2. Set up environment files

This project uses two env files. Neither is committed to git.

**`.env`** — shared settings (copy from example):
```bash
cp .env.example .env
```

Fill in `.env`:
```env
NODE_ENV=development

POSTGRES_USER=racyn
POSTGRES_PASSWORD=secret
POSTGRES_DB=pet_adoption

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password

BASE_URL=http://localhost:3000
ADMIN_PASSWORD=Password123!
```

**`.env.development`** — local database URL:
```env
DATABASE_URL="postgresql://racyn:secret@localhost:5432/pet_adoption"
```

> **Why two files?** `DATABASE_URL` is environment-specific. `npm run dev` automatically picks up `.env.development`. On a deployment platform (Render, Railway, etc.), set `DATABASE_URL` in the platform's environment variable dashboard instead — no file needed.

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Seed the database

```bash
npx prisma db seed
```

Seeded accounts (password for all: `Password123!`):

| Role  | Email                  |
|-------|------------------------|
| Admin | `admin@petadopt.com`   |
| User  | `user1@petadopt.com`   |
| Staff | `staff1@petadopt.com`  |

### 6. Start the dev server

```bash
npm run dev
```

Server: `http://localhost:3000`  
Base route: `http://localhost:3000/api/v1`

---

## 📡 API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint                    | Access  | Description                        |
|--------|-----------------------------|---------|------------------------------------|
| `POST` | `/auth/register`            | Public  | Register a new user                |
| `POST` | `/auth/login`               | Public  | Login — returns access token + sets refresh token cookie |
| `POST` | `/auth/logout`              | Public  | Logout — clears refresh token cookie |
| `GET`  | `/auth/refresh`             | Public  | Exchange refresh token for new access token |
| `GET`  | `/auth/verify?token=`       | Public  | Verify email address               |
| `POST` | `/auth/resend-verification` | Public  | Resend verification email          |

**Token usage:**
```
Authorization: Bearer <access_token>
```

### Users — `/api/v1/users`

| Method | Endpoint    | Access                  | Description              |
|--------|-------------|-------------------------|--------------------------|
| `GET`  | `/users/me` | Authenticated + verified | Get current user profile |

### Shelters — `/api/v1/shelters`

| Method   | Endpoint        | Access     | Description            |
|----------|-----------------|------------|------------------------|
| `GET`    | `/shelters`     | Public     | Paginated shelter list |
| `POST`   | `/shelters`     | Admin only | Create a shelter       |
| `PATCH`  | `/shelters/:id` | Admin/Staff + verified | Update shelter |
| `DELETE` | `/shelters/:id` | Admin only | Delete a shelter       |

### Pets — `/api/v1/pets`

| Method | Endpoint    | Access             | Description                                      |
|--------|-------------|--------------------|--------------------------------------------------|
| `GET`  | `/pets`     | Public             | Paginated list — excludes adopted pets           |
| `GET`  | `/pets/:id` | Public             | Single pet with images and shelter               |
| `POST` | `/pets`     | Staff/Admin + verified | Create pet listing with images (multipart) |

**Pagination params** (both `GET /pets` and `GET /shelters`):

| Param   | Default | Max | Description       |
|---------|---------|-----|-------------------|
| `page`  | `1`     | —   | Page number       |
| `limit` | `10`    | `100` | Results per page |

### Adoption Requests — `/api/v1/adoption-requests`

| Method | Endpoint             | Access                  | Description                    |
|--------|----------------------|-------------------------|--------------------------------|
| `POST` | `/adoption-requests` | Authenticated + verified | Submit an adoption application |

The request body requires a structured questionnaire about the applicant's living situation, experience, and household.

---

## 🔐 Auth Flow

```
Register → Verify Email → Login
                            ↓
              Access Token (Authorization header)
              Refresh Token (httpOnly cookie)
                            ↓
              Token expires → GET /auth/refresh → new Access Token
```

---

## 🗃️ Data Model (simplified)

```
User
  ├── role: USER | STAFF | ADMIN
  ├── many AdoptionRequests (as adopter)
  ├── many ShelterStaff memberships
  └── many Shelters (as owner)

Shelter
  ├── owner: User
  ├── many ShelterStaff
  └── many Pets

Pet
  ├── belongs to Shelter
  ├── status: AVAILABLE | PENDING | ADOPTED
  ├── many PetImages
  └── many AdoptionRequests

AdoptionRequest
  ├── belongs to User + Pet
  ├── status: PENDING | REVIEWING | APPROVED | REJECTED | CANCELLED
  └── inline questionnaire fields (homeType, hasYard, householdSize, etc.)
```

**Key cascade rules:**
- Deleting a `Pet` or `Shelter` that has adoption history is blocked (`onDelete: Restrict`)
- Deleting a `User` cascades through their adoption requests
- `PetImage` and `ShelterStaff` cascade-delete with their parent

---

## 📁 Project Structure

```
pet-adoption-backend-v1/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Dev seed (~16 users, 30 pets)
│   └── seed-perf.ts        # Performance seed (1 000 users, 1 000 pets)
├── scripts/
│   └── load-test.ts        # autocannon HTTP load test
├── src/
│   ├── app.ts              # Express app — middleware & routes
│   ├── server.ts           # HTTP server entry point
│   ├── config/
│   │   └── prisma.ts       # Prisma client singleton + dotenv cascade
│   ├── middlewares/
│   │   ├── cors-configurations.ts
│   │   ├── rate-limiter.ts
│   │   └── index.ts
│   ├── models/             # Feature modules
│   │   ├── auth/
│   │   ├── user/
│   │   ├── shelter/
│   │   ├── pet/
│   │   └── adoption-request/
│   └── utils/
│       ├── app-error.ts    # Base AppError class
│       └── error.ts        # BadRequestError, NotFoundError, etc.
├── prisma.config.ts        # Prisma v7 config
├── .env.example
├── .env                    # Shared settings (not committed)
├── .env.development        # Local DATABASE_URL (not committed)
└── tsconfig.json
```

---

## 🛠️ Scripts

```bash
npm run dev              # Start dev server with hot reload (NODE_ENV=development)
npm run build            # Compile TypeScript → dist/
npm run start            # Run production build (NODE_ENV=production)

npm run perf:seed        # Seed 1 000 users + 1 000 pets for load testing
npm run perf:test        # Run autocannon load test (server must be running)

npx prisma migrate dev   # Apply pending migrations
npx prisma db seed       # Run dev seed
npx prisma studio        # Open visual DB browser
```

**Seed the production database** (from local machine):
```bash
DATABASE_URL='your-production-url' npx prisma migrate deploy
DATABASE_URL='your-production-url' npx prisma db seed
```

---

## 🌐 Environment Variables

| Variable            | File                | Description                              |
|---------------------|---------------------|------------------------------------------|
| `DATABASE_URL`      | `.env.development`  | PostgreSQL connection string             |
| `NODE_ENV`          | `.env`              | `development` or `production`            |
| `POSTGRES_USER`     | `.env`              | Docker Postgres username                 |
| `POSTGRES_PASSWORD` | `.env`              | Docker Postgres password                 |
| `POSTGRES_DB`       | `.env`              | Docker Postgres database name            |
| `JWT_SECRET`        | `.env`              | Secret for signing access tokens         |
| `JWT_REFRESH_SECRET`| `.env`              | Secret for signing refresh tokens        |
| `SMTP_HOST`         | `.env`              | Email host                               |
| `SMTP_PORT`         | `.env`              | Email port                               |
| `SMTP_USER`         | `.env`              | Email address                            |
| `SMTP_PASS`         | `.env`              | Email app password                       |
| `BASE_URL`          | `.env`              | Server base URL                          |
| `ADMIN_PASSWORD`    | `.env`              | Password used for the seeded admin user  |

---

## 👨‍💻 Author

**Racyn Ibaya**
- GitHub: [@racynibaya](https://github.com/racynibaya)

---

## 📄 License

ISC
