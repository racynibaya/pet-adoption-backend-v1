# 🐾 Pet Adoption Platform — Backend API

A RESTful backend API for a **multi-shelter pet adoption platform**. Built as a portfolio project to demonstrate production-level backend engineering practices including role-based access control, multi-tenancy, business rule enforcement, and clean architecture.

---

## 📌 Project Overview

People who want to adopt pets have no easy way to browse available animals, and shelters struggle to manage adoption applications efficiently. This platform bridges that gap — allowing shelters to list pets and manage applications, while adopters can discover pets and submit proof-backed adoption requests.

### Core Loop

```
Shelter posts pet → Adopter finds pet → Adopter applies → Shelter reviews → Adoption complete
```

---

## 🧑‍🤝‍🧑 Actors

| Actor            | Role     | Description                                      |
| ---------------- | -------- | ------------------------------------------------ |
| 👤 Guest         | `PUBLIC` | Browse and discover pets without an account      |
| 🐾 Adopter       | `USER`   | Apply for pets, track applications, get notified |
| 🏠 Shelter Staff | `STAFF`  | Manage pet listings and review applications      |
| 👑 Super Admin   | `ADMIN`  | Manage shelters, users, roles, and platform      |

---

## ✨ Features

### V1 — Core (Current)

- ✅ Auth — register, login, logout with JWT (access + refresh tokens)
- ✅ Email verification on registration
- ✅ Role-based access control (USER, STAFF, ADMIN)
- ✅ Multi-shelter platform support
- ✅ Pet listings with image upload
- ✅ Search & filter pets by type, age, gender, location
- ✅ Adoption application with proof-of-care form
- ✅ Approve / reject / cancel applications
- ✅ Auto-reject other applications when one is approved
- ✅ Email notifications on application status change
- ✅ Global error handling with custom error classes
- ✅ Rate limiting & CORS configuration

### V2 — Coming Soon

- ⏳ Application history & tracking page for adopters
- ⏳ Staff dashboard per shelter
- ⏳ Super admin dashboard with platform overview
- ⏳ Pagination on pet listings

### V3 — Planned

- 🔮 Favorites / saved pets
- 🔮 Staff notes on applications
- 🔮 Analytics & reporting

---

## 🏗️ Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Runtime    | Node.js + TypeScript                          |
| Framework  | Express.js v5                                 |
| ORM        | Prisma v7                                     |
| Database   | PostgreSQL (via Docker)                       |
| Auth       | JWT — access + refresh token rotation         |
| Validation | Zod                                           |
| Security   | bcrypt, httpOnly cookies, rate limiting, CORS |
| Email      | Nodemailer                                    |
| Dev Tools  | tsx, Morgan, Docker Compose                   |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) + Docker Compose
- [npm](https://www.npmjs.com/)

---

## 🚀 Getting Started

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

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pet_adoption"
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=pet_adoption

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
BASE_URL=http://localhost:3000/api/v1
NODE_ENV=development

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-email-password
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

**Seeded accounts:**

| Role  | Email                 | Password       |
| ----- | --------------------- | -------------- |
| User  | `user1@petadopt.com`  | `Password123!` |
| Staff | `staff1@petadopt.com` | `Password123!` |
| Admin | `admin@petadopt.com`  | `Password123!` |

### 7. Start the development server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api/v1`

### Auth

| Method | Endpoint                    | Access        | Description               |
| ------ | --------------------------- | ------------- | ------------------------- |
| `POST` | `/auth/register`            | Public        | Register a new user       |
| `POST` | `/auth/login`               | Public        | Login and receive tokens  |
| `POST` | `/auth/logout`              | Authenticated | Logout and clear tokens   |
| `GET`  | `/auth/refresh`             | Public        | Refresh access token      |
| `GET`  | `/auth/verify?token=`       | Public        | Verify email address      |
| `POST` | `/auth/resend-verification` | Public        | Resend verification email |
| `GET`  | `/auth/me`                  | Authenticated | Get current user          |

### Shelters

| Method   | Endpoint        | Access     | Description            |
| -------- | --------------- | ---------- | ---------------------- |
| `GET`    | `/shelters`     | Public     | Get all shelters       |
| `GET`    | `/shelters/:id` | Public     | Get a single shelter   |
| `POST`   | `/shelters`     | Admin only | Create a new shelter   |
| `PATCH`  | `/shelters/:id` | Admin only | Update shelter details |
| `DELETE` | `/shelters/:id` | Admin only | Delete a shelter       |

### Pets

| Method   | Endpoint          | Access     | Description                           |
| -------- | ----------------- | ---------- | ------------------------------------- |
| `GET`    | `/pets`           | Public     | Get all available pets (with filters) |
| `GET`    | `/pets/:id`       | Public     | Get a single pet                      |
| `POST`   | `/pets`           | Staff only | Add a new pet listing                 |
| `PATCH`  | `/pets/:id`       | Staff only | Update pet details                    |
| `DELETE` | `/pets/:id`       | Staff only | Remove a pet listing                  |
| `POST`   | `/pets/:id/image` | Staff only | Upload pet image                      |

### Applications

| Method   | Endpoint                    | Access           | Description                 |
| -------- | --------------------------- | ---------------- | --------------------------- |
| `POST`   | `/applications`             | Adopter          | Submit adoption application |
| `GET`    | `/applications/mine`        | Adopter          | Get my applications         |
| `GET`    | `/applications/:id`         | Adopter or Staff | Get a single application    |
| `DELETE` | `/applications/:id`         | Adopter          | Cancel application          |
| `PATCH`  | `/applications/:id/approve` | Staff only       | Approve application         |
| `PATCH`  | `/applications/:id/reject`  | Staff only       | Reject application          |

### Users (Admin)

| Method   | Endpoint          | Access     | Description      |
| -------- | ----------------- | ---------- | ---------------- |
| `GET`    | `/users`          | Admin only | Get all users    |
| `PATCH`  | `/users/:id/role` | Admin only | Update user role |
| `DELETE` | `/users/:id`      | Admin only | Delete a user    |

---

## 🔐 Authentication Flow

```
Register → Verify Email → Login → Access Token + Refresh Token (httpOnly cookie)
        → Use Access Token → Token expires → Call /auth/refresh → New Access Token
```

**Using the access token:**

```
Authorization: Bearer <access_token>
```

---

## 📐 Business Rules

> **Rule 1 — Auto-reject on approval**
> When an application is approved, all other pending applications for that pet are automatically rejected and the pet status changes to `ADOPTED`.

> **Rule 2 — Cancellation policy**
> An adopter can cancel their application at any time, as long as it has not already been approved.

> **Rule 3 — No application limit**
> An adopter can apply for multiple pets simultaneously with no limit, but must submit proof they can care for each pet via the application form.

> **Rule 4 — Proof of care required**
> Every adoption application must include an `AdopterProfile` with living situation, outdoor space, other pets at home, experience, working hours, and reason to adopt.

---

## 🗃️ Data Model

```
Shelter
  └── has many Pets
  └── has many Staff (Users with STAFF role)

User
  └── has many AdoptionApplications (as adopter)
  └── may belong to a Shelter (as staff)

Pet
  └── belongs to Shelter
  └── has many AdoptionApplications
  └── Status: AVAILABLE | PENDING | ADOPTED

AdoptionApplication
  └── belongs to User (adopter)
  └── belongs to Pet
  └── has one AdopterProfile
  └── Status: PENDING | APPROVED | REJECTED | CANCELLED

AdopterProfile
  └── livingSituation
  └── hasOutdoorSpace
  └── otherPets
  └── experience
  └── workingHours
  └── reasonToAdopt
```

---

## 📁 Project Structure

```
pet-adoption-backend-v1/
├── prisma/
│   ├── schema.prisma           # Database schema & relationships
│   ├── seed.ts                 # Database seeder
│   └── migrations/             # Migration history
├── src/
│   ├── app.ts                  # Express app — middleware & routes
│   ├── server.ts               # HTTP server entry point
│   ├── config/
│   │   └── prisma.ts           # Prisma client singleton
│   ├── middlewares/
│   │   ├── cors-configurations.ts
│   │   ├── rate-limiter.ts
│   │   └── index.ts
│   ├── models/                 # Feature modules
│   │   ├── auth/               # register, login, logout, verify
│   │   ├── user/               # user management
│   │   ├── shelter/            # shelter CRUD
│   │   ├── pet/                # pet listings
│   │   └── application/        # adoption applications
│   └── utils/
│       ├── app-error.ts        # Base AppError class
│       └── error.ts            # NotFoundError, UnauthorizedError, etc.
├── docker-compose.yml
├── prisma.config.ts
├── .env.example
└── tsconfig.json
```

---

## 🛠️ Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled production build

npx prisma migrate dev   # Run database migrations
npx prisma db seed       # Seed the database
npx prisma studio        # Open visual database browser
```

---

## 🌐 Environment Variables

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `DATABASE_URL`      | PostgreSQL connection string         |
| `POSTGRES_USER`     | Docker Postgres username             |
| `POSTGRES_PASSWORD` | Docker Postgres password             |
| `POSTGRES_DB`       | Docker Postgres database name        |
| `JWT_SECRET`        | Secret key for signing access tokens |
| `BASE_URL`          | Base Route URL                       |
| `NODE_ENV`          | `development` or `production`        |

---

## 👨‍💻 Author

**Racyn Ibaya**

- GitHub: [@racynibaya](https://github.com/racynibaya)

---

## 📄 License

ISC
