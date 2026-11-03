# Expensely Finance API

A TypeScript backend for a personal finance application. It provides authenticated APIs for account access, income and expense transactions, categories, budgets, and transaction trends.

## Technology

- **Runtime:** Bun
- **HTTP framework:** Hono
- **Database:** PostgreSQL
- **Database access and migrations:** Drizzle ORM and Drizzle Kit
- **Request validation:** Zod (through `@hono/zod-validator` and project validation helpers)
- **Authentication:** JWT tokens and `bcryptjs` password hashing

## Getting started

### Requirements

- Bun
- PostgreSQL

### Install and configure

```sh
bun install
```

Set these environment variables in the environment where the app runs:

| Variable | Purpose |
| --- | --- |
| `PORT` | Port for the Bun HTTP server. |
| `NODE_ENV` | Runtime environment name. |
| `FRONTEND_URLS` | Comma-separated allowed frontend origins for CORS. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens. |

The application reads all five variables during startup. Apply the database migrations and seed default categories before using the API:

```sh
bun run migration:migrate
bun run seeds
bun run dev
```

The development server uses Bun's hot reload. The default API prefix is `/api/v1`; the listening port is controlled by `PORT`.

## API overview

All routes below are prefixed with `/api/v1`. Except for registration and login, the listed routes require an `Authorization` header containing a valid JWT (for example, `Bearer <token>`). Requests with JSON bodies are validated against the feature's Zod schema.

### Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account. Requires `name`, `email`, `password`, and `confirmPassword`; the passwords must match. |
| `POST` | `/auth/login` | Authenticate with `email` and `password`; returns a JWT token. |
| `GET` | `/auth/me` | Return the authenticated user's profile. |

Passwords must be at least eight characters. Registration requires a name of at least two characters and a valid email address.

### Categories

All category routes require authentication.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/categories/all` | List the user's categories, including available default categories. Supports pagination, search, sort order, and `filterBy=INCOME\|EXPENSE`. |
| `POST` | `/categories/create` | Create a category with `name`, `icon`, and `type` (`INCOME` or `EXPENSE`). |
| `PATCH` | `/categories/update/:categoryId` | Update one or more category fields. |
| `DELETE` | `/categories/delete/:categoryId` | Delete a category. |

Category names and icons must contain at least two characters. Default categories are seeded separately and are shared rather than owned by an individual user.

### Transactions

All transaction routes require authentication.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/transactions/all` | List transactions. Supports `page`, `limit`, `order`, `search`, `startDate`, `endDate`, `categoryId`, and `type=INCOME\|EXPENSE`. |
| `GET` | `/transactions/trend` | Return daily income and expense totals for `days` (1–365, default 30); missing dates are returned with zero totals. |
| `GET` | `/transactions/:transactionId` | Fetch a transaction by ID. |
| `POST` | `/transactions/create` | Create a transaction with `type`, positive numeric `amount`, `description`, `categoryId`, and `transactionDate`. An expense may also include nullable `budgetId`. |
| `PATCH` | `/transactions/update/:transactionId` | Update one or more transaction fields. |
| `DELETE` | `/transactions/delete/:transactionId` | Delete a transaction. |

Descriptions are limited to 100 characters. Expense transactions can be linked to a user's budget for the same category and date range; income transactions cannot be linked to a budget. The API checks that the selected budget is valid for the transaction.

### Budgets

All budget routes require authentication.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/budget/all` | List budgets with pagination, search, sort order, and optional `categoryId`. |
| `GET` | `/budget/:budgetId` | Fetch one budget. |
| `POST` | `/budget/create` | Create a budget with `name`, `description`, positive `amount`, `startDate`, `endDate`, and `categoryId`. |
| `PATCH` | `/budget/update/:budgetId` | Update one or more budget fields. |
| `DELETE` | `/budget/delete/:budgetId` | Delete a budget. |

Budget dates must be valid, and the end date cannot precede the start date. Budgets are associated with expense categories. A unique constraint prevents duplicate budgets for the same user, category, and date range.

### Common listing behavior

Category, transaction, and budget lists are paginated. The default page is `1`, the default page size is `25`, and the default ordering is descending by creation time. List responses include pagination metadata such as total count, current page, total pages, and next/previous pages where available.

## Project structure

```text
src/
  app.ts                  Hono app, CORS, API prefix, and route registration
  index.ts                Bun server entry point and top-level error handling
  config/                 PostgreSQL pool/Drizzle connection and CORS setup
  constants/              API version, HTTP codes, messages, and query defaults
  controllers/            HTTP request parsing and response formatting
  db/
    schema/               Drizzle table definitions and transaction enum
    helpers/              Shared timestamp column definitions
    reset.ts              Database reset utility
  middlewares/            JWT authentication and JSON body validation
  routes/                 Hono route declarations by feature
  seeds/                  Default income and expense categories
  services/               Database queries and feature business rules
  types/                  Shared service parameter types
  utils/                  Environment, JWT, pagination, and validation helpers
  validations/            Zod schemas for request payloads
drizzle/                  Generated PostgreSQL migration files and snapshots
drizzle.config.ts         Drizzle Kit schema and migration configuration
```

### Feature modules

- **Auth:** `auth.route.ts` maps registration and login to `auth.controller.ts`. `auth.service.ts` checks for duplicate email addresses, hashes passwords, verifies login credentials, and issues tokens. `user.service.ts` retrieves the signed-in user's profile without exposing the password hash.
- **Categories:** `categories.route.ts`, `categories.controller.ts`, and `category.service.ts` implement category CRUD, ownership checks, listing filters, and pagination. Default categories are rows with no owning user and `isDefault=true`.
- **Transactions:** `transaction.route.ts`, `transactions.controller.ts`, and `transaction.service.ts` implement CRUD, filtering, pagination, daily trend aggregation, and budget association rules.
- **Budgets:** `budget.route.ts`, `budget.controller.ts`, and `budget.service.ts` implement CRUD, category association, duplicate/date checks, and paginated listing.
- **Database:** `db/schema.ts` re-exports the models for users, categories, transactions, budgets, and AI insights. `config/db.ts` creates the PostgreSQL pool and Drizzle client. Migrations are stored in `drizzle/`.
- **Shared infrastructure:** `app.ts` attaches the `/api/v1` prefix and CORS middleware. `auth.middleware.ts` verifies the bearer token and places its user payload in the Hono context. Validation schemas live in `validations/`; reusable parsing, pagination, constants, and helpers live in `utils/` and `constants/`.

## Data model

- **Users:** name, unique email, password hash, and a three-character currency code (default `PKR`).
- **Categories:** name, icon, `INCOME`/`EXPENSE` type, default flag, and optional owner. A category's transactions and budgets reference it.
- **Transactions:** amount, type, description, transaction date, user, category, and optional budget. Amounts use PostgreSQL numeric precision with two decimal places.
- **Budgets:** name, description, amount, date range, owner, and expense category.
- **AI insights:** JSON details, insight type, optional user/category associations, and a start/end date range. The schema is present for storing insight records.

Foreign keys cascade deletes for related user, category, budget, transaction, and insight records as configured in the schema. Transaction dates and amounts are indexed for common user-scoped queries.

## Database commands

| Command | Description |
| --- | --- |
| `bun run migration` | Generate a migration from the current Drizzle schema. |
| `bun run migration:migrate` | Apply pending migrations. |
| `bun run migration:reset` | Run the project reset utility, then apply migrations. **This resets database state.** |
| `bun run seeds` | Insert or refresh the default categories. |

## Notes

- The health/root endpoint is `GET /api/v1/` and returns a success message.
- CORS allowed origins come from `FRONTEND_URLS`; separate multiple origins with commas.
- The seed operation is repeatable: existing default category rows have their icons refreshed, and missing rows are inserted.
