# ADR 001: Use Next.js App Router
**Status**: Accepted | **Date**: 2024-01

## Decision
Use Next.js 15 with App Router for full-stack framework. Gives us server components, API routes, streaming, and `output: standalone` for Docker.

## Consequences
- API routes live in `src/app/api/`
- Auth handled by NextAuth.js v5 (built for App Router)
- `output: standalone` in next.config.ts enables minimal Docker image
