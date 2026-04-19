# Resource Allocation Backend

A modular Node.js + TypeScript backend for managing resources and bookings.

This API supports creating and listing resources, creating and listing bookings, and deleting bookings, with validation, structured JSON responses, and centralized error handling.

## Overview

This project is designed for resource allocation workflows where users need to:

- Register resources with type and capacity
- Create bookings for a specific resource and date
- View current resources and bookings
- Remove bookings by ID

The codebase follows a layered architecture:

- `route` layer for endpoint mapping
- `controller` layer for request/response handling
- `service` layer for business logic and data access
- Prisma ORM for PostgreSQL interaction

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express 5
- ORM: Prisma
- Database: PostgreSQL
- Build tool: tsup
- Dev runner: tsx
- Linting: ESLint
- Env management: dotenv
- Utilities: cors, cookie-parser, http-status

## Core Features

- Modular feature-based structure (`resource`, `booking`)
- Resource management
  - Create resource
  - List all resources
- Booking management
  - Create booking
  - List all bookings
  - Delete booking by ID
- Input validation in controllers
- Business validation in services
  - Verifies resource existence before booking
  - Rejects invalid or past booking dates
- Uniform API response format via shared response helper
- Global error handling middleware
- Prisma client generated into `src/generated/prisma`
- CORS configuration for frontend integration

## API Endpoints

Base URL: `http://localhost:<PORT>/api`

### Resource

- `POST /resources` - Create a resource
- `GET /resources` - Get all resources

Example create payload:

```json
{
  "name": "Conference Room A",
  "type": "ROOM",
  "capacity": 12
}
```

### Booking

- `POST /bookings` - Create a booking
- `GET /bookings` - Get all bookings
- `DELETE /bookings/:id` - Delete a booking

Example create payload:

```json
{
  "resourceId": "<resource-id>",
  "requestedBy": "nirob",
  "bookingDate": "2026-04-21T10:00:00.000Z"
}
```

## Project Structure

```text
resource-allocation-backend/
├── prisma/
│   ├── migrations/
│   └── schema/
│       ├── schema.prisma
│       ├── resource.prisma
│       ├── booking.prisma
│       └── enums.prisma
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── app/
│   │   ├── config/
│   │   ├── errorHelpers/
│   │   ├── interfaces/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── module/
│   │   │   ├── booking/
│   │   │   └── resource/
│   │   ├── routes/
│   │   └── shared/
│   └── generated/
│       └── prisma/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── prisma.config.ts
└── eslint.config.mjs
```

## Environment Variables

Create a `.env` file in project root with:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
FRONTEND_URL=http://localhost:3000
```

Required variables:

- `PORT`
- `DATABASE_URL`
- `FRONTEND_URL`

## Setup and Run

### 1. Clone and install

```bash
git clone <your-repository-url>
cd resource-allocation-backend
npm install
```

### 2. Configure environment

Create `.env` using the sample shown above.

### 3. Generate Prisma client

```bash
npm run generate
```

### 4. Run database migrations

```bash
npm run migrate
```

### 5. Start development server

```bash
npm run dev
```

Server runs on:

`http://localhost:<PORT>`

## Production Commands

Build and run:

```bash
npm run build
npm start
```

## NPM Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build TypeScript into `dist`
- `npm start` - Start compiled server from `dist/server.js`
- `npm run lint` - Run ESLint
- `npm run migrate` - Run Prisma migrations in development
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio
- `npm run push` - Push Prisma schema to database
- `npm run pull` - Pull database schema into Prisma

## Response and Error Format

Success response:

```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

## Current Scope and Next Improvements

Current implementation focuses on core resource and booking workflows.

Recommended next enhancements:

- Authentication and authorization for protected booking actions
- Pagination and filtering for list endpoints
- Request schema validation (e.g., Zod/Joi)
- Automated tests (unit + integration)
- API documentation (OpenAPI/Swagger)
- Docker setup for consistent deployment

## License

ISC
