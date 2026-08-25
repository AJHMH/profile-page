# AGENTS.md

This is a SvelteKit 2 portfolio site (Svelte 5, Vite 8, TypeScript) backed by Prisma 7 + PostgreSQL. Content (Bio, Project, BlogPost) is edited via Prisma Studio; there is no end-user auth. The contact form is the only user-facing write action and emails via a pluggable provider (`console` in dev).

Standard commands live in `package.json` scripts and `CLAUDE.md` (dev, build, check, lint, test, db:\*). Prefer those. Human-oriented docs: **[docs/README.md](docs/README.md)** (tutorial, content how-to, contact how-to, reference, architecture).

## Cursor + Claude workflow

This repo uses **Cursor Pro** for implementation and **Claude Pro** for planning, reviews, and multi-repo reasoning. Full playbook: **`docs/AI-WORKFLOW-PLAYBOOK.md`**.

| Cursor (Agent)                            | Claude                                                   |
| ----------------------------------------- | -------------------------------------------------------- |
| Code changes, refactors, tests            | Architecture and trade-offs                              |
| Semgrep violation fixes                   | Semgrep rule design                                      |
| OTEL instrumentation in code              | Grafana dashboard / alert design                         |
| `.github/workflows` wrappers in this repo | CI log diagnosis; changes in `aaron-howard/ci-templates` |
| Dependabot / Renovate branch fixes        | Dependency risk review                                   |

**CI** delegates to [aaron-howard/ci-templates](https://github.com/aaron-howard/ci-templates) at **`v1.0.0`**. **Semgrep** rules live in `config/semgrep/rules/`. **Dependencies:** Dependabot (Actions) + Renovate (npm) — `docs/DEPENDENCY-MANAGEMENT.md`. Pipeline: `docs/CI-CD.md`. Blueprint: `docs/BLUEPRINT-STATUS.md`.

## Git workflow

- **Never commit directly to `main`.** Create a new branch for every PR (one branch per change or feature).
- Branch from up-to-date `main`, push the branch, open a PR, and merge into `main` after review — do not push fixes straight to `main`.
- Use descriptive branch names (e.g. `fix/contact-rate-limit`, `docs/agents-md`, `feat/blog-tags`).

## Local development

### Node version

- `.npmrc` sets `engine-strict=true` and a transitive dep (`lint-staged`) requires Node `>=22.22.1`. Use Node 22.x (or newer). Older 22.14.x builds fail `npm install`.

### PostgreSQL (must be running)

- Start your local PostgreSQL service before `npm run dev`, `npm run db:push`, or seed scripts.
- Create a database and role matching your `.env` (see `.env.example`), then run `npm run db:push`.

### `.env` and the critical `DATABASE_URL` gotcha

- `.env` (gitignored) holds `DATABASE_URL` and typically `EMAIL_SERVICE=console` for local dev. Copy from `.env.example` if missing.
- **IMPORTANT:** `src/lib/server/db/index.ts` reads `process.env.DATABASE_URL` at module-import time. `vite dev` loads `.env` into SvelteKit's `$env/dynamic/private`, **not** into raw `process.env`. A plain `npm run dev` therefore connects with the password-less fallback string and every DB query fails with `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` (pages may still return 200 because loaders catch errors and render fallback content).
- Start any vite-dev-based command with the env exported into the process:

  **bash / zsh:**

  ```bash
  set -a; . ./.env; set +a; npm run dev
  set -a; . ./.env; set +a; npm run test:e2e
  ```

  **PowerShell:**

  ```powershell
  Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim().Trim('"')
      Set-Item -Path "Env:$name" -Value $value
    }
  }
  npm run dev
  ```

  Do **not** use `export $(grep ... .env | xargs)` — literal quotes in `.env` become part of the value and corrupt `DATABASE_URL`.

### Seeding

- `npm run db:seed` and `npm run db:seed:bio` use `scripts/prisma-script-client.js` (Prisma 7 + `adapter-pg` + `dotenv/config`), so they load `.env` automatically when run via Node. They do **not** inherit the vite-dev `process.env` gotcha above.

### Tests

- `npm test` (Vitest, ~120 tests) mocks the DB and needs no Postgres.
- `npm run test:e2e` needs Playwright Chromium (`npx playwright install chromium`) and a reachable DB (export `.env` first — Playwright spawns its own `vite dev` on 5174 and inherits the shell env). The `*-has-no-serious-axe-violations` checks on `/about`, `/projects`, `/blog` can fail on pre-existing `color-contrast` issues once real content is rendered; that is an app-level a11y concern, not an environment problem.

## Cursor Cloud specific instructions

The dependency-refresh update script (Node 22 via nvm + `npm install`) runs automatically on session start. The notes below cover non-obvious runtime setup that the update script intentionally does not handle.

### Node version

- A transitive dep (`lint-staged`) requires Node `>=22.22.1` and `.npmrc` has `engine-strict=true`, so the platform's default `/exec-daemon/node` (22.14.x) is too old and breaks `npm install`. Use nvm's Node 22 (`nvm use 22`). `~/.bashrc` already runs `nvm use 22`, so interactive shells get the right Node automatically.

### PostgreSQL (must be running)

- The app needs PostgreSQL. PostgreSQL 16 is installed in the snapshot but is not auto-started. Start it each session: `sudo pg_ctlcluster 16 main start`.
- A `portfolio` role (password `portfolio`) and `portfolio_db` database already exist in the snapshot. If they don't, recreate with:
  `sudo -u postgres psql -c "CREATE USER portfolio WITH PASSWORD 'portfolio' CREATEDB;"` and `sudo -u postgres psql -c "CREATE DATABASE portfolio_db OWNER portfolio;"`, then `npm run db:push`.

### `.env` and the critical `DATABASE_URL` gotcha

- `.env` (gitignored) holds `DATABASE_URL=postgresql://portfolio:portfolio@127.0.0.1:5432/portfolio_db?schema=public` plus `EMAIL_SERVICE=console`. It persists in the snapshot; recreate it if missing.
- See **Local development → `.env` and the critical `DATABASE_URL` gotcha`** above for the full explanation and bash export commands.

### Seeding

- On Cloud, if seed scripts fail, insert rows directly via `psql` against `portfolio_db` as a fallback.

### Tests

- Same as **Local development → Tests** above.
