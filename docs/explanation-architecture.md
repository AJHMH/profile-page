# Why the site is built this way

This is a personal portfolio, not a multi-tenant product. The stack choices (SvelteKit + Prisma + PostgreSQL, Prisma Studio for edits, one unauthenticated write path) exist so Aaron can ship pages and change copy without standing up a CMS, login, or editorial workflow. This page is the "why". The facts live in [the application reference](./reference.md).

## The problem

A portfolio still needs structured content: a bio, a project list, blog posts, and a way for strangers to send a message. The failure modes without a small, boring design are:

- A headless CMS (or WordPress) for a handful of rows. Extra vendor, extra auth, extra deploy.
- Markdown files in git for every copy tweak. Fine for developers, clumsy for "change my title before a call".
- A custom `/admin` app. That is a second product: sessions, CSRF, role checks, and a UI that must be kept in sync with the public site.
- Rendering blog HTML from the database with `{@html}`. One paste from an email client becomes an XSS hole on a public page.

The site also runs on Vercel serverless. Naive Postgres usage (new connection per invocation, secrets only in Vite's `$env`) fails in two different ways: connection stampedes, and a silent wrong `DATABASE_URL` in local `vite dev`.

## The approach

```
  Visitor                         Operator (you)
     │                                  │
     │ GET / /about /blog /projects     │ npm run db:studio
     │ POST /contact                    │ (or seed scripts)
     ▼                                  ▼
  SvelteKit loaders / action        Prisma Studio / Node seed
     │                                  │
     ▼                                  ▼
  PostgreSQL  ←  Prisma 7 + @prisma/adapter-pg + pg.Pool
```

**Content is three tables.** `Bio` is a singleton (`id` is always `1`). `Project` and `BlogPost` are ordinary rows. JSON columns hold nested bio data (`skillCategories`, `experience`, `siteMetadata`) so the schema does not grow a table per list.

**Edits go through Prisma Studio** (`npm run db:studio`), not through the website. There is no session cookie and no admin route. That is intentional: the operator already has database credentials. Visitors never write to those tables.

**The only public write is the contact form.** Superforms + Zod validate input. A hidden `website` field (honeypot) must stay empty. `hooks.server.ts` rate-limits `POST /contact` to 5 requests per IP per 15 minutes. HTML in the outbound email is escaped. Subject lines cannot carry CR/LF (header injection). `EMAIL_SERVICE=console` is refused when `NODE_ENV` is `production`, so a misconfigured Vercel deploy fails closed instead of "succeeding" into function logs.

**Blog bodies are plain text.** `blog/[id]/+page.svelte` prints `{data.post.content}` inside `whitespace-pre-wrap`. There is no `{@html}` in the repo. XSS via post content is not a path. The trade-off is no bold/links inside a post unless you put them in the string as characters.

**Loaders degrade instead of 500 on list pages.** Home, `/blog`, `/projects`, and `/about` catch Prisma errors and return empty data plus `dbError` (about also has a `devFallbackBio` when not in CI). The page still returns HTTP 200 so a bad local DB does not look like a crash. `DbErrorBanner` tells you to check `DATABASE_URL`.

**Prisma lives behind `process.env.DATABASE_URL` at import time.** `src/lib/server/db/index.ts` builds a `pg.Pool` when the module loads. Vite's `vite dev` puts `.env` into SvelteKit `$env/dynamic/private`, **not** into `process.env`. If you start the app with a bare `npm run dev`, the pool uses the password-less fallback string and every query fails with a SASL error. Seed scripts avoid this because `scripts/prisma-script-client.js` loads `dotenv/config`. The fix is to export `.env` into the shell before Vite. That is awkward, and it is cheaper than rewriting the client to read `$env` (Prisma and `pg` are not SvelteKit-aware).

**Rate limiting is in-memory.** A portfolio does not justify Redis for five posts per quarter. On serverless the limit is per warm isolate, so a determined bot can fan out. If that happens, the next step is a shared store (the production audit already names that). Until then, keep the Map.

**Observability is opt-in OTLP.** Hooks wrap each request in a span, Prisma `$extends` wraps queries, email send is a span. Counters (`app.http.requests`, `app.contact.submissions`, …) only leave the process when Grafana Cloud env vars are set. Logs stay in Vercel.

## Trade-offs

| Choice                              | You gain                                        | You give up                                                         |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| Prisma Studio as CMS                | Zero extra app surface; typed schema            | No preview, no draft/publish, no phone-friendly editor              |
| No public auth                      | Nothing to phish; nothing to patch for sessions | You cannot "log in to edit from a hotel" without DB access          |
| Bio JSON columns                    | Schema stays three models                       | Invalid JSON silently becomes `{}` / `[]` / defaults                |
| In-memory contact limiter           | No extra vendor                                 | Limits reset per instance; not a real WAF                           |
| Plain-text posts                    | No stored XSS                                   | No rich text unless you change the renderer                         |
| List pages return 200 on DB failure | Local/dev stays usable                          | Uptime checks that only look at status codes will not see a dead DB |
| `process.env` for Prisma            | Same client in scripts and the app              | Vite must inherit `.env` from the shell                             |

## Alternatives considered

These show up in git history, audits, and comments rather than a formal ADR folder:

- **Admin token / authenticated edit UI.** Removed. A stale `ADMIN_TOKEN` in local `.env` was called out in [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md). The current model is operator-plus-database only.
- **`EMAIL_SERVICE=smtp`.** Stubbed in `email.ts`. Nodemailer was never wired. Resend and SendGrid are the production paths.
- **Google Fonts CDN.** Replaced with self-hosted `@fontsource/*` so CSP `font-src 'self'` holds and the render path does not wait on a third-party.
- **Rendering blog HTML.** Not done. `sanitizeHtml` exists for a future that needs a tight allow-list; the detail page does not call it.

## Related

- [Application reference](./reference.md) (routes, schema, env)
- [How to manage content](./howto-manage-content.md)
- [How to configure the contact form](./howto-configure-contact.md)
- [DATABASE_CONFIG.md](../DATABASE_CONFIG.md) (pooling)
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) (Vercel)
