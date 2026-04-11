# ADR 002: Use Drizzle ORM
**Status**: Accepted | **Date**: 2024-01

## Decision
Drizzle ORM for database access. Schema in TypeScript, auto-generated migrations, fully typed queries.

## Consequences
- Schema in `src/lib/db/schema/`
- Run migrations: `pnpm db:migrate`
- Never write raw SQL in route handlers — use `src/lib/db/queries/`
