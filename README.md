# Production Ready API - Auth, JWT, API Keys

A type-safe REST API for a small library domain, built with Hono and TypeScript. It is a practical backend foundation for learning and extending production-oriented API patterns: validated input, PostgreSQL persistence, password hashing, JWT authentication, hashed API keys, and role-based authorization.

## What this project does

The API manages authors and books. Anyone can read authors and books, while mutations are protected by API keys. Users can register and sign in with an email and password, create API keys using a short-lived JWT, and use those keys to make protected requests.

Book ownership is enforced: standard users can edit or delete only books they created; administrators can edit or delete any book. Authors, users, books, and API keys are persisted in PostgreSQL through Drizzle ORM migrations.

## Tech stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Runtime | Node.js | Runs the API server |
| Framework | [Hono](https://hono.dev/) | Lightweight, typed HTTP routing and middleware |
| Language | TypeScript | Static typing across routes, validation, and data access |
| Validation | [Zod](https://zod.dev/) + `@hono/standard-validator` | Validates and coerces request data |
| Database | PostgreSQL 18 | Persistent relational data store |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe schema definitions, queries, relations, and migrations |
| Local database | Docker Compose | Runs PostgreSQL locally |
| Authentication | JWT (`HS256`) | Short-lived login token for API-key management |
| Authorization | Custom Hono middleware | Validates `X-API-Key` and attaches the authenticated user |
| Cryptography | Node.js `crypto` | `scrypt` password hashing, timing-safe comparison, SHA-256 API-key hashing |

## Core security model

- Passwords are never stored in plain text. They are hashed with `scrypt`, a random 16-byte salt, and checked with a timing-safe comparison.
- Login returns a JWT signed with `JWT_SECRET`. Tokens currently expire after **5 minutes**.
- API keys are generated from 32 random bytes. Only their SHA-256 hash and an eight-character display prefix are stored in the database.
- The complete API key is returned **only once**, when it is created. Save it immediately.
- API key ownership is checked before deletion, preventing one user from deleting another user's keys.
- `X-API-Key` middleware protects create, update, and delete operations for authors and books.
- Book updates/deletions are scoped to the creator unless the authenticated user has the `admin` role.

## Project structure

```text
src/
├── index.ts                 # Server bootstrap and route mounting
├── data/env.ts              # Zod-validated environment configuration
├── routes/
│   ├── auth.ts              # Registration and JWT login
│   ├── apikey.ts            # API-key list/create/delete (JWT protected)
│   ├── author.ts            # Public reads and API-key-protected mutations
│   └── book.ts              # Public reads and role-aware mutations
├── middleware/auth.ts       # X-API-Key authentication middleware
├── lib/crypto.ts            # Password and API-key cryptography helpers
└── db/
    ├── schemas/             # Drizzle table definitions
    ├── schema.ts            # Schema exports
    ├── relations.ts         # Table relations
    └── migrations/          # Generated SQL migrations
```

## Data model

| Entity | Key fields | Relationships |
| --- | --- | --- |
| Users | `id`, `email`, `passwordHash`, `role` (`user` or `admin`) | Has many API keys and created books |
| API keys | `id`, `name`, `keyHash`, `keyPrefix`, `userId` | Belongs to one user |
| Authors | `id`, `name`, `birthday`, `createdAt` | Has many books |
| Books | `id`, `title`, `description`, `publishDate`, `pageCount`, `authorId`, `addedBy` | Belongs to an author and the user who added it |

## Getting started

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop or Docker Engine with Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root. It is ignored by Git.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library
DB_USER=postgres
DB_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-secret
```

Generate a safe JWT secret, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Apply database migrations

The repository includes generated migrations. Apply them with:

```bash
npx drizzle-kit migrate
```

When you change a Drizzle schema, generate a new migration first:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. Start the API

```bash
npm run dev
```

The server starts at `http://localhost:3000` by default.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode with `tsx` |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm run start` | Run the compiled build |
| `npx drizzle-kit generate` | Generate a migration from schema changes |
| `npx drizzle-kit migrate` | Apply pending database migrations |

## API reference

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | None | Create a user with email and password |
| `POST` | `/auth/login` | None | Verify credentials and receive a JWT |

Register request:

```json
{
  "email": "reader@example.com",
  "password": "secure-password"
}
```

The registration password must be at least eight characters. Login returns:

```json
{
  "token": "<jwt>"
}
```

### API keys

All API-key management endpoints require this header:

```http
Authorization: Bearer <jwt>
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api-keys` | List the authenticated user's key metadata |
| `POST` | `/api-keys` | Create an API key; the raw key is returned once |
| `DELETE` | `/api-keys/:id` | Delete one of the authenticated user's API keys |

Create-key request:

```json
{
  "name": "Local development"
}
```

### Authors

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/authors` | Public | List authors |
| `GET` | `/authors/:id` | Public | Fetch one author |
| `POST` | `/authors` | API key | Create an author |
| `PUT` | `/authors/:id` | API key | Update an author |
| `DELETE` | `/authors/:id` | API key | Delete an author |

### Books

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/books` | Public | List books, including their author |
| `GET` | `/books/:id` | Public | Fetch a book, including its author |
| `POST` | `/books` | API key | Create a book for an existing author |
| `PUT` | `/books/:id` | API key | Update a book you created, or any book as admin |
| `DELETE` | `/books/:id` | API key | Delete a book you created, or any book as admin |

Protected author and book requests use:

```http
X-API-Key: <api-key>
```

Example book creation body:

```json
{
  "title": "Designing APIs",
  "description": "A practical example record.",
  "publishDate": "2026-01-01T00:00:00.000Z",
  "pageCount": 240,
  "authorId": "<author-uuid>"
}
```

## Suggested request flow

1. `POST /auth/register` to create a user.
2. `POST /auth/login` to obtain the five-minute JWT.
3. `POST /api-keys` with `Authorization: Bearer <jwt>` and save the returned raw key.
4. Send `X-API-Key: <api-key>` to create an author or book.
5. Use public `GET` routes to retrieve authors and books.

## API testing

The project was developed alongside [Requestly](https://requestly.com/), a free API client suitable for local, staging, and production requests. Useful collection variables include:

- `baseUrl` — switch between local and deployed API URLs.
- `jwt` — populate after a successful login response.
- `apiKey` — populate after creating an API key.
- `lastId` — reuse the resource ID returned by create requests.

Postman, Bruno, Insomnia, curl, or any HTTP client work equally well.

## Current scope and next steps

This repository is a strong production-oriented learning baseline. Before deploying a public production service, consider adding refresh tokens, rate limiting, centralized error handling, request logging/observability, CORS configuration, API-key expiry/rotation, pagination, automated tests, CI, and a managed PostgreSQL deployment with TLS.

## License

No license has been specified yet. Add one before distributing or accepting outside contributions.
