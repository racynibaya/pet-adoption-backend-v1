# Pet Adoption Backend v1

A backend API for a pet adoption platform built with Node.js, TypeScript, Express, and Prisma.

## Features

- User authentication and authorization
- Pet management (CRUD operations)
- Booking system for pet visits
- Adoption request handling
- Shelter and staff management
- JWT-based authentication
- PostgreSQL database with Prisma ORM

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Containerization**: Docker Compose

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (or use Docker Compose for local setup)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd pet-adoption-backend-v1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DB=pet_adoption_db
   DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/pet_adoption_db"
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the PostgreSQL database using Docker Compose:

   ```bash
   docker-compose up -d
   ```

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

## Running the Application

### Development

```bash
npm run dev
```

This starts the server with nodemon for hot reloading on `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user info

## Database Schema

The application uses the following main models:

- **User**: Users of the platform (with roles: USER, STAFF, ADMIN)
- **Pet**: Pets available for adoption (statuses: PENDING, AVAILABLE, ADOPTED)
- **Booking**: Pet visit bookings (statuses: PENDING, APPROVED, REJECTED, CANCELLED)
- **AdoptionRequest**: Adoption requests (statuses: PENDING, REVIEWING, APPROVED, REJECTED, CANCELLED)
- **Shelter**: Animal shelters
- **ShelterStaff**: Staff members associated with shelters

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npx prisma migrate dev` - Run database migrations in development
- `npx prisma db seed` - Seed the database with initial data
- `npx prisma studio` - Open Prisma Studio for database visualization

## Project Structure

```
src/
├── app.ts                 # Express app setup
├── server.ts              # HTTP server
├── config/
│   └── prisma.ts          # Prisma client configuration
├── controllers/           # Route handlers
├── models/                # Business logic and routes
│   ├── auth/              # Authentication module
│   └── user/              # User management module
├── utils/                 # Utility functions
│   ├── app-error.ts       # Custom error class
│   └── error.ts           # Error handling utilities
└── @types/                # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema
├── seed.ts                # Database seeding script
└── migrations/            # Database migrations

generated/                 # Generated Prisma client
```
