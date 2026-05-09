# 🐾 Pet Adoption Platform — Backend API

A RESTful backend API for a multi-shelter pet adoption platform. Built as a portfolio project to demonstrate production-level backend engineering practices.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js v5
- **ORM:** Prisma v7
- **Database:** PostgreSQL (via Docker)
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Validation:** Zod
- **Other:** Cookie-parser, Morgan, CORS, Rate Limiting

---

## Features

- ✅ JWT authentication with access & refresh token rotation
- ✅ Email verification flow (one-time token)
- ✅ Role-based access control — `USER`, `STAFF`, `ADMIN`
- ✅ Multi-shelter support
- ✅ Pet listings per shelter
- ✅ Adoption request management
- ✅ Global error handling with custom error classes
- ✅ Rate limiting & CORS configuration
- ✅ Database seeding with realistic data (100 users, 5 shelters, 100 pets)

---

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) + Docker Compose
- [npm](https://www.npmjs.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/racynibaya/pet-adoption-backend-v1.git
cd pet-adoption-backend-v1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pet_adoption"
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=pet_adoption

JWT_SECRET=your-super-secret-jwt-key
BASE_URL=http://localhost:3000/api/v1
NODE_ENV=development
```

### 4. Start the database

```bash
docker compose up -d
```

### 5. Run migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
npx prisma db seed
```

This creates:

- 👥 100 regular users
- 👤 5 shelter staff accounts
- 🏠 5 shelters
- 🐾 100 pets (dogs, cats, rabbits)

**Seeded credentials:**
| Role | Email | Password |
|------|-------|----------|
| User | `user1@petadopt.com` | `Password123!` |
| Staff | `staff1@petadopt.com` | `Password123!` |

### 7. Start the development server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## API Reference

### Base URL

```
http://localhost:3000/api/v1
```

### Auth

| Method | Endpoint                    | Access        | Description               |
| ------ | --------------------------- | ------------- | ------------------------- |
| `POST` | `/auth/register`            | Public        | Register a new user       |
| `POST` | `/auth/login`               | Public        | Login and receive tokens  |
| `POST` | `/auth/logout`              | Authenticated | Logout and clear tokens   |
| `GET`  | `/auth/refresh`             | Public        | Refresh access token      |
| `GET`  | `/auth/verify?token=`       | Public        | Verify email address      |
| `POST` | `/auth/resend-verification` | Public        | Resend verification email |

### Shelters

| Method   | Endpoint        | Access        | Description            |
| -------- | --------------- | ------------- | ---------------------- |
| `GET`    | `/shelters`     | Public        | Get all shelters       |
| `POST`   | `/shelters`     | Admin only    | Create a new shelter   |
| `PATCH`  | `/shelters/:id` | Admin / Staff | Update shelter details |
| `DELETE` | `/shelters/:id` | Admin only    | Delete a shelter       |

### Pets

| Method   | Endpoint           | Access     | Description            |
| -------- | ------------------ | ---------- | ---------------------- |
| `GET`    | `/pets`            | Public     | Get all available pets |
| `GET`    | `/pets/:id`        | Public     | Get a single pet       |
| `POST`   | `/pets`            | Staff only | Add a new pet listing  |
| `PATCH`  | `/pets/:id`        | Staff only | Update pet details     |
| `DELETE` | `/pets/:id`        | Staff only | Remove a pet listing   |
| `POST`   | `/pets/:id/images` | Staff only | Upload pet image       |

---

## Authentication Flow

```
Register → Verify Email → Login → Receive Access Token + Refresh Token (httpOnly cookie)
         → Use Access Token in Authorization header → Token expires → Use Refresh endpoint
```

**Using the access token:**

```
Authorization: Bearer <access_token>
```

---

## Project Structure

```
pet-adoption-backend-v1/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeder
│   └── migrations/          # Migration history
├── src/
│   ├── app.ts               # Express app setup
│   ├── server.ts            # HTTP server entry point
│   ├── config/
│   │   └── prisma.ts        # Prisma client instance
│   ├── middlewares/
│   │   ├── cors-configurations.ts
│   │   ├── rate-limiter.ts
│   │   └── index.ts
│   ├── models/              # Feature modules (routes, controller, service, types)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── shelter/
│   │   └── pet/
│   └── utils/
│       ├── app-error.ts     # Base error class
│       └── error.ts         # Custom error types
├── docker-compose.yml
├── .env.example
├── prisma.config.ts
└── tsconfig.json
```

---

## Database Schema

```
User ──────────────── Shelter (owner)
  │                      │
  │                   ShelterStaff (junction)
  │                      │
  └──── AdoptionRequest ──┤
                          │
                         Pet ────── Booking
```

### Roles

| Role    | Permissions                                      |
| ------- | ------------------------------------------------ |
| `USER`  | Browse pets, submit adoption requests            |
| `STAFF` | Manage pets and applications for their shelter   |
| `ADMIN` | Full platform access — manage shelters and users |

### Pet Status

| Status      | Meaning                                |
| ----------- | -------------------------------------- |
| `AVAILABLE` | Open for adoption applications         |
| `PENDING`   | Has an active application under review |
| `ADOPTED`   | Successfully adopted                   |

---

## Business Rules

- An adopter can apply for multiple pets simultaneously with no limit
- When an application is **approved**, all other pending applications for that pet are **auto-rejected**
- An adopter can **cancel** their application at any time (unless already approved)
- Pet listings are **soft deleted** — data is preserved in the database

---

## Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to dist/
npm run start      # Run compiled production build

npx prisma migrate dev     # Run migrations
npx prisma db seed         # Seed the database
npx prisma studio          # Open Prisma Studio (visual DB browser)
```

---

## Environment Variables

| Variable            | Description                                | Example                                    |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| `DATABASE_URL`      | PostgreSQL connection string               | `postgresql://user:pass@localhost:5432/db` |
| `POSTGRES_USER`     | Docker Postgres username                   | `user`                                     |
| `POSTGRES_PASSWORD` | Docker Postgres password                   | `pass`                                     |
| `POSTGRES_DB`       | Docker Postgres database name              | `pet_adoption`                             |
| `JWT_SECRET`        | Secret key for signing JWTs                | `your-secret-key`                          |
| `BASE_URL`          | Base URL for email verification links      | `http://localhost:3000/api/v1`             |
| `NODE_ENV`          | Environment (`development` / `production`) | `development`                              |

---

## Author

**Racyn Ibaya**

- GitHub: [@racynibaya](https://github.com/racynibaya)

---

## License

ISC
