# Notewise

A collaborative note-taking app with AI-powered tools, real-time presence, and rich text editing.

## Features

### Editor
- **Rich text editing** via TipTap — bold, italic, underline, strikethrough, headings (H1–H3), bullet lists, numbered lists, task lists with checkboxes, links, text color, font size, and font family
- **Note templates** — Blank, Meeting Notes, Study Notes, Journal, and Brainstorm
- **Auto-save** — changes are saved automatically with a status indicator (Saved / Saving… / Unsaved changes)
- **Editable title** — click the title to rename inline

### Organization
- **Pin notes** — pin important notes to keep them at the top
- **Delete notes** — remove notes via the three-dot menu
- **Search** — semantic vector search (pgvector) plus full-text fallback; results update as you type

### AI Tools
- **Summarize** — condenses the note into key bullet points
- **Quiz me** — generates flashcard-style Q&A from the note content
- **Rewrite & Organize** — rewrites the note with better structure and clarity
- All AI tools are powered by the Gemini API

### Voice Transcription
- **Mic transcription** — click the mic button to start recording; audio is transcribed every 8 seconds using Groq Whisper (`whisper-large-v3`) and inserted directly into the editor
- Status pill shows "Listening — transcribes every 8 s" while recording and "Transcribing…" while processing
- Only available to the note owner (grayed out with tooltip on shared links)

### Sharing & Collaboration
- **Share links** — generate a view-only or edit link for any note; recipients don't need an account
- **Real-time presence** — see who else is on the note via avatar bubbles in the toolbar
- **Live cursors** — collaborators' text cursors appear in the editor in real time with name labels
- **COLLABORATION sidebar section** — notes with 2 or more simultaneous active users appear in a dedicated section at the top of the sidebar (above Pinned and Recent)
- Presence is maintained with a 60-second heartbeat and expires after 30 minutes of inactivity
- Shared-link users get the full app UI — same sidebar, same toolbar, same glassmorphic design

### Themes
- **Light and dark mode** — toggle via the sun/moon button in the toolbar; preference is persisted per device

### UI
- Glassmorphic two-island layout — floating sidebar island + floating editor island with `backdrop-filter` blur and CSS variable theming
- Responsive presence avatars with name tooltip on hover
- Warm earthy avatar color palette

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TipTap, inline CSS with CSS variables |
| Auth | NextAuth v5 (Google OAuth) |
| Database | PostgreSQL + pgvector (Drizzle ORM) |
| Cache / Presence | Redis |
| AI — text | Google Gemini API |
| AI — transcription | Groq API (Whisper large-v3) |
| Real-time | Server-Sent Events (SSE) |
| Infra | Docker Compose (Postgres + Redis) |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker (for local Postgres + Redis)

### 1. Clone and install

```bash
git clone <repo-url>
cd notes-app/app
npm install
```

### 2. Start local services

```bash
cd ..
docker compose up -d
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/notewise
REDIS_URL=redis://localhost:6379

NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

### 4. Set up the database

```bash
cd app
npx drizzle-kit push
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── (app)/          # Authenticated routes (notes, dashboard)
│   │   ├── shared/         # Public shared-note routes
│   │   └── api/            # API routes (notes, AI, presence, share)
│   ├── components/
│   │   ├── editor/         # TipTap editor, toolbar, presence avatars, cursors
│   │   ├── layout/         # Sidebar, SidebarWrapper
│   │   └── shared/         # SharedEditor, SharedNoteClient
│   └── lib/
│       ├── db/             # Drizzle client, schema, queries
│       ├── redis.ts        # Redis client
│       └── presence.ts     # Presence color helpers
docker-compose.yml
```
