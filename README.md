# PocKit

**Pocket Project Management Toolkit** — a pocket-sized, shared project management app. Plan projects, track tasks on kanban boards, keep your own personal to-do board, and discuss work in comments. One shared space: every signed-in (and approved) member sees every project, can be assigned tasks, and can comment.

Built with Next.js (App Router), TypeScript, Prisma + PostgreSQL, shadcn/ui and Tailwind CSS v4, with a few [Aceternity UI](https://ui.aceternity.com) flourishes (animated sidebar, split-flap landing hero, gradient buttons).

## ✨ Features

- **Landing page** — public marketing page with an animated split-flap board and gradient call-to-action buttons.
- **Projects & boards** — create/archive projects; drag tasks across kanban columns (Backlog → Todo → In Progress → In Review → Done).
- **My Tasks** — every task assigned to you, across all projects.
- **My Items** — a private, personal kanban board only you can see.
- **Members & Admin** — member directory; admins approve new sign-ups and manage roles.
- **Comments** — threaded discussion on every task.
- **Dark / light mode**, responsive layout, animated collapsible sidebar.

## 🛠️ Tech stack

| Area      | Choice                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Framework | [Next.js 15 (App Router)](https://nextjs.org/)                                                        |
| Language  | [TypeScript](https://www.typescriptlang.org/)                                                         |
| Database  | [PostgreSQL](https://www.postgresql.org/) + [Prisma 7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| UI        | [shadcn/ui](https://ui.shadcn.com/) + [Aceternity UI](https://ui.aceternity.com/)                     |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com/)                                                           |
| Auth      | Mock auth (bcrypt + `iron-session`) — designed to swap for Auth.js                                    |
| DnD       | [@dnd-kit](https://dndkit.com/)                                                                       |

## 🚀 Local setup

### 1. Install

```bash
pnpm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill it in:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/pockit"
SESSION_PASSWORD="a-strong-secret-at-least-32-characters-long"   # openssl rand -base64 32
ADMIN_EMAIL="you@example.com"      # bootstrap admin (created by the seed)
ADMIN_PASSWORD="change-me"
ADMIN_NAME="Administrator"
# Optional: used for SEO/OpenGraph absolute URLs
NEXT_PUBLIC_SITE_URL="https://your-app.vercel.app"
```

> **Prisma 7 note:** the datasource in `prisma/schema.prisma` has no `url`. The connection string is read by the CLI via `prisma.config.ts` and at runtime through the `@prisma/adapter-pg` driver adapter in `lib/db.ts`.

### 3. Database (migrate + generate + seed)

Run these **in order**:

```bash
pnpm prisma migrate dev      # creates tables AND generates the Prisma client
pnpm seed                    # demo users, projects, tasks, comments + your admin
```

`pnpm prisma generate` is run automatically by `migrate dev`; run it on its own only after changing the schema without a migration or after a fresh install.

The seed creates 4 demo users — `ada@pockit.dev`, `linus@pockit.dev`, `grace@pockit.dev`, `alan@pockit.dev` — all with password **`demo1234`**, plus the admin from your `.env`.

### 4. Run

```bash
pnpm dev
```

Open <http://localhost:3000>.

## ☁️ Deploying to Vercel (free / Hobby tier)

PocKit runs comfortably on Vercel's free **Hobby** plan. You need a hosted Postgres database — [Neon](https://neon.tech) has a generous free tier and pairs perfectly with the `@prisma/adapter-pg` driver adapter PocKit already uses.

### 1. Create a database (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled** connection string (it contains `-pooler`).
2. Keep `?sslmode=require` on the URL.

### 2. Import the repo into Vercel

1. Push this repo to GitHub.
2. In Vercel → **Add New… → Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected). Build command and output are auto-configured.

### 3. Set environment variables (Project → Settings → Environment Variables)

| Variable               | Value                                                 |
| ---------------------- | ----------------------------------------------------- |
| `DATABASE_URL`         | Your Neon **pooled** connection string                |
| `SESSION_PASSWORD`     | A 32+ char secret (`openssl rand -base64 32`)         |
| `ADMIN_EMAIL`          | Your bootstrap admin email                            |
| `ADMIN_PASSWORD`       | Your bootstrap admin password                         |
| `ADMIN_NAME`           | e.g. `Administrator`                                  |
| `NEXT_PUBLIC_SITE_URL` | Your deployment URL, e.g. `https://pockit.vercel.app` |

### 4. Prisma generate on every build — already configured

Vercel caches dependencies, so the Prisma client must be regenerated at build time. This is **already wired up** in `package.json`:

```jsonc
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```

No action needed — included here so you know why it's there.

### 5. Apply the schema to the production database

Migrations don't run automatically on Vercel. After the first deploy (or from your machine, pointed at the Neon URL):

```bash
DATABASE_URL="<neon-url>" pnpm prisma migrate deploy
DATABASE_URL="<neon-url>" pnpm seed        # optional: demo data + admin
```

### 6. Deploy

Push to your default branch — Vercel builds and deploys automatically. Visit your URL, sign in with the admin account, and approve members from **/admin**.

### Free-tier notes

- **Neon** free tier scales the database to zero when idle; the first request after a cold start may take a second.
- **Vercel Hobby** is for non-commercial use, with serverless function execution limits that are fine for this app.
- The pooled Neon URL avoids exhausting connections from serverless functions — always use it for `DATABASE_URL` on Vercel.

## 📁 Project structure

```
app/
  page.tsx              public PocKit landing page
  (auth)/               login, signup
  (app)/                guarded app: dashboard, my-items, projects, members, admin
components/
  pm/                   app sidebar, landing hero, brand, board, dialogs, …
  ui/                   shadcn/ui primitives
  ui/aceternity/        Aceternity components (sidebar, text-flipping-board,
                        hover-border-gradient, input, label)
lib/                    auth, db, schemas, constants
prisma/                 schema, seed
server/                 queries (read) + actions (write)
```

## 📄 License

See [LICENSE.md](./LICENSE.md). PocKit is built on the open-source Circle UI template by lndev-ui.
