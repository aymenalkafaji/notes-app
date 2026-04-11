# Notes App

A smart, AI-powered notes app built with Next.js, PostgreSQL, and Docker.

## Quick start

```bash
cp .env.example .env        # fill in your secrets
docker compose up --build   # start everything
open http://localhost:3000
```

## Tech stack

- **Frontend/Backend**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL 16 + pgvector
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js v5
- **Cache/sessions**: Redis 7
- **AI**: Anthropic Claude + OpenAI (Whisper + embeddings)
- **Containers**: Docker + Docker Compose

## Development

```bash
docker compose up -d              # start containers in background
docker compose logs -f app        # stream app logs
docker compose exec app pnpm db:migrate   # run migrations
docker compose exec app pnpm test         # run tests
```

## Docs

- [Architecture decisions](docs/adr/)
- [API reference](docs/api/)
# notes-app
