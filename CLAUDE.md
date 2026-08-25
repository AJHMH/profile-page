# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Quick start commands

```bash
# Development
npm run dev              # Vite dev server (default port 5173)

# Build and types
npm run build           # prisma generate + vite build (adapter-vercel)
npm run check           # prisma generate + svelte-kit sync + svelte-check

# Quality
npm run lint            # Prettier check + ESLint
npm run format          # Prettier --write
npm test                # Vitest run (~120 tests)
npm run test:coverage   # Vitest + coverage thresholds (used in CI)
npm run test:e2e        # Playwright (Chromium): smoke, axe, honeypot
npm run semgrep:scan    # Semgrep SAST (local; CI also loads ci-templates/rules)
npm run otel:verify     # Test OTLP connectivity to Grafana Cloud (.env.local)

# Database
npm run db:push
npm run db:migrate
npm run db:studio
npm run db:generate
npm run db:seed         # scripts/seed-projects.js
npm run db:seed:bio     # scripts/seed-bio.js

# Assets
npm run assets:og               # static/og-image.png via sharp
npm run assets:project-images   # WebP alongside JPEGs in static/projects/

npm run preview         # Preview production build
```

## Architecture

**SvelteKit 2.61.x** portfolio: server routes + Prisma (PostgreSQL). No end-user auth; content is edited via **Prisma Studio** (`npm run db:studio`).

- **Deployment**: `@sveltejs/adapter-vercel` with `runtime: 'nodejs22.x'` in `svelte.config.js`.
- **Fonts**: `@fontsource/manrope` and `@fontsource/inter` imported from `src/app.css` (no Google Fonts in `app.html`).
- **SEO**: `src/lib/components/SeoHead.svelte` — title, description, `og:image` / Twitter card (absolute URL from request origin). Default image: `/og-image.png`.
- **Images**: `projectImageSrc` / `projectWebpSrc` in `src/lib/project-image.ts`; `<picture>` via `ProjectPicture.svelte` on home featured grid, project cards, and project detail.
- **Contact**: `src/routes/contact/+page.server.ts` — Superforms + Zod (`contactFormSchema` includes honeypot `website`). `hooks.server.ts` applies security headers and **rate-limits** `POST /contact` per client IP (`src/lib/server/rate-limit.ts`).
- **Redirects**: `src/routes/bio/` exists for legacy URLs; primary about route is **`/about`**.

### Routes (high level)

```
src/routes/
  +layout.svelte / +layout.server.ts
  +page.svelte / +page.server.ts          # Home
  about/                                   # Bio / profile
  bio/                                     # Redirect → /about
  blog/ + blog/[id]/
  projects/ + projects/[id]/
  contact/
```

### Security headers

`src/hooks.server.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Deprecated `X-XSS-Protection` is **not** set (CSP covers XSS).

## Testing

- **Vitest** (`vitest.config.ts`): happy-dom, mocks for `$app/*` and `$lib/server/db` under `src/tests/mocks/`. Coverage thresholds on `src/lib/**/*.ts`.
- **Playwright** (`playwright.config.ts`, `e2e/`): `npx vite dev` on port **5174** as `webServer`. Not on the PR merge gate — runs post-merge via `.github/workflows/e2e.yml`.

## CI

Thin wrappers in `.github/workflows/` call reusable workflows from **[aaron-howard/ci-templates](https://github.com/aaron-howard/ci-templates)** (pinned at **`v1.0.0`**):

- **PR / merge gate** (`ci.yml`): Semgrep → `npm ci` → `prisma generate` → `npm audit` → lint → `npm run check` → **`npm run test:coverage`** → **`npm run build`**. Target ~3 minutes; no Playwright install.
- **Post-merge E2E** (`e2e.yml`): push to `main` and `workflow_dispatch`. Playwright smoke + axe + honeypot; Chromium cached, 15-minute job timeout.

Full pipeline diagram and rollout guide: **`docs/CI-CD.md`**.

Workflow **logic** changes belong in `ci-templates`; bump the `@v1.x.x` tag in this repo when upgrading.

## Quality, security & observability

- **Semgrep:** `config/semgrep/rules/` (architecture, security, quality, SvelteKit). CI scan via `ci-templates` reusable workflow.
- **OpenTelemetry:** `config/otel/`, `src/lib/observability/` — spans, custom metrics, Grafana dashboard in `config/grafana/`. Enable with `OTEL_EXPORTER_OTLP_*`; see `docs/OBSERVABILITY.md` and `npm run otel:verify`.
- **Dependabot:** `.github/dependabot.yml` — GitHub Actions weekly.
- **Renovate:** `renovate.json` — npm grouped updates, security alerts, patch auto-merge for devDeps. Setup: `docs/DEPENDENCY-MANAGEMENT.md`.

## AI workflow (Cursor + Claude)

- **Playbook:** `docs/AI-WORKFLOW-PLAYBOOK.md` — when to use Cursor vs Claude, CI/Semgrep/OTEL/Dependabot handoffs, Claude Project setup.
- **Blueprint progress:** `docs/BLUEPRINT-STATUS.md`
- **Cursor rule:** `.cursor/rules/ai-engineering-stack.mdc`

Claude plans and reviews; Cursor implements in the repo. Do not use GitHub Copilot for multi-repo automation.

## Documentation

Index: **`docs/README.md`**. Diataxis pages:

- `docs/tutorial-getting-started.md` — clone to running site
- `docs/howto-manage-content.md` — Prisma Studio (bio / blog / projects)
- `docs/howto-configure-contact.md` — contact email providers
- `docs/reference.md` — routes, env, schema, contact surface
- `docs/explanation-architecture.md` — why no CMS/auth; `DATABASE_URL` import-time

Also: `README.md`, `DEPLOYMENT_GUIDE.md`, `DATABASE_CONFIG.md`, `SECURITY.md`, `docs/PRODUCTION_AUDIT.md`, `docs/DESIGN_ASSETS.md`, `docs/AI-WORKFLOW-PLAYBOOK.md`, `docs/BLUEPRINT-STATUS.md`, `docs/CI-CD.md`, `docs/DEPENDENCY-MANAGEMENT.md`, `docs/OBSERVABILITY.md`, `AI-Engineering-Blueprint.md`.

## Conventions

- Svelte 5 runes: `$state`, `$derived`, `$props`, `$effect` where needed.
- Match existing Tailwind token usage from `src/app.css` `@theme`.
- Do not commit large design archives; see `docs/DESIGN_ASSETS.md`.
