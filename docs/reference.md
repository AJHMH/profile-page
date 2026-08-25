# Application reference

Public surface of **profile-page**: routes, environment variables, Prisma models, npm scripts, and the TypeScript modules other code actually imports. Facts here are taken from source. For why these choices exist, see [Why the site is built this way](./explanation-architecture.md).

## Routes

SvelteKit file routes under `src/routes/`. There is no end-user authentication. The only visitor write path is `POST /contact`.

| Path             | Files                                                         | Load behavior                                                                                                                                                                                        | Writes?          |
| ---------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `/`              | `+page.server.ts`, `+page.svelte`                             | Bio `id=1`; up to 4 projects (`featured` desc, then `id` desc); 3 latest blog posts (`date` desc). On DB failure: empty lists, `dbError: true` (banner only in `dev`).                               | no               |
| `/about`         | `about/+page.server.ts`, `about/+page.svelte`                 | Bio `id=1` mapped through `toBioProfile`. Missing row or DB error: `dbError`. In `dev` when `CI` is not `"true"`, a DB error returns `devFallbackBio` instead. Sets public cache headers on success. | no               |
| `/bio`           | `bio/+page.server.ts`                                         | Permanent redirect **308** to `/about`.                                                                                                                                                              | no               |
| `/blog`          | `blog/+page.server.ts`, `blog/+page.svelte`                   | All posts, `date` desc. Category chips are derived from loaded posts. Featured posts render in a separate grid when the filter is `all`. On DB failure: empty list + `DbErrorBanner`.                | no               |
| `/blog/[id]`     | `blog/[id]/+page.server.ts`, `blog/[id]/+page.svelte`         | `id` must be an integer `>= 1` or the load throws **404**. Content is rendered as **plain text** (`whitespace-pre-wrap`), not HTML.                                                                  | no               |
| `/projects`      | `projects/+page.server.ts`, `projects/+page.svelte`           | All projects, `id` desc. Filter chips are hardcoded: `all`, `frontend`, `backend`, `fullstack`. On DB failure: empty list + banner.                                                                  | no               |
| `/projects/[id]` | `projects/[id]/+page.server.ts`, `projects/[id]/+page.svelte` | Same integer `id` rule as blog detail.                                                                                                                                                               | no               |
| `/contact`       | `contact/+page.server.ts`, `contact/+page.svelte`             | Load: empty Superforms document from `contactFormSchema`. Action: `submitContact`.                                                                                                                   | **yes** (`POST`) |

Root layout (`+layout.server.ts`) always loads Bio `id=1` for nav/footer (`site.name`, `site.title`, `site.location`, `site.metadata`). On failure it falls back to name `Aaron Howard`, title `Full Stack Developer`, and `defaultSiteMetadata`.

Global error UI: `+error.svelte` (404 / 500 copy). Unexpected errors also hit `handleError` in `src/hooks.server.ts`, which logs the path and returns `{ message: 'Internal server error' }`.

### Detail-page status codes

`blog/[id]` and `projects/[id]` reject non-integer or `< 1` ids with **404** _before_ the `try`. Inside the `try`, a missing row calls SvelteKit `error(404, …)`, which throws. The surrounding `catch` then calls `error(500, 'Failed to load post'|'Failed to load project')`. A missing row therefore surfaces as **500** today, not 404. Cache-Control is set to `no-store` on that path.

### Cache headers

`setPublicCacheHeaders` (`src/lib/server/cache-headers.ts`) sets:

```
Cache-Control: public, max-age=60, stale-while-revalidate=300
```

Default `maxAgeSeconds` is `60`. Applied on successful loads of `/about`, `/blog`, `/projects`, and the two detail routes. List loaders that catch a DB error set `Cache-Control: no-store`. Contact is uncached (form POST).

## Environment variables

Templates live in `.env.example`. Prisma 7 reads `DATABASE_URL` from `prisma.config.ts` (not from `schema.prisma`).

| Variable                              | Required                                               | Default / fallback                                                            | Effect                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                        | Runtime queries, `db:*`, Vite if you want real content | `postgresql://localhost:5432/postgres?schema=public` (password-less) if unset | Prisma + `pg` Pool connection string. **Must be in `process.env` for Vite**, not only SvelteKit `$env`. See the [getting-started tutorial](./tutorial-getting-started.md) and [architecture](./explanation-architecture.md). |
| `EMAIL_SERVICE`                       | Production contact                                     | `"console"`                                                                   | `console` \| `resend` \| `sendgrid` \| `smtp`. Unknown values fail send. `smtp` is a stub and always returns an error. `console` is **rejected** when `NODE_ENV === 'production'`.                                           |
| `CONTACT_EMAIL`                       | Production contact                                     | —                                                                             | Recipient. First choice in `submitContact`.                                                                                                                                                                                  |
| `EMAIL_TO`                            | Production contact                                     | —                                                                             | Recipient if `CONTACT_EMAIL` is unset.                                                                                                                                                                                       |
| (neither of the two above)            | —                                                      | `'admin@example.com'`                                                         | Last-resort recipient. Do not ship that.                                                                                                                                                                                     |
| `EMAIL_FROM`                          | Resend / SendGrid                                      | Resend: `onboarding@resend.dev`; SendGrid: `noreply@example.com`              | `From` address.                                                                                                                                                                                                              |
| `RESEND_API_KEY`                      | When `EMAIL_SERVICE=resend`                            | —                                                                             | Bearer token for `https://api.resend.com/emails`. Missing key throws.                                                                                                                                                        |
| `SENDGRID_API_KEY`                    | When `EMAIL_SERVICE=sendgrid`                          | —                                                                             | Bearer token for `https://api.sendgrid.com/v3/mail/send`. Missing key throws.                                                                                                                                                |
| `EMAIL_SMTP_*`                        | —                                                      | —                                                                             | Documented in `.env.example` only. `sendViaSMTP` is **not implemented**.                                                                                                                                                     |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`  | Optional                                               | unset                                                                         | Grafana Cloud traces. See [OBSERVABILITY.md](./OBSERVABILITY.md).                                                                                                                                                            |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS`   | With traces                                            | unset                                                                         | Typically `Authorization=Basic <base64>`.                                                                                                                                                                                    |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` | Optional                                               | unset                                                                         | Grafana Cloud metrics.                                                                                                                                                                                                       |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS`  | With metrics                                           | unset                                                                         | Same Basic auth pattern.                                                                                                                                                                                                     |
| `CI`                                  | CI                                                     | unset                                                                         | When `"true"`, `/about` does **not** use `devFallbackBio` on DB failure.                                                                                                                                                     |
| `NODE_ENV`                            | set by Node/Vite                                       | —                                                                             | Prisma query logging (`query`/`warn` in development). Blocks `EMAIL_SERVICE=console` in production.                                                                                                                          |

Recipient resolution in `src/lib/server/contact.ts`:

```
CONTACT_EMAIL || EMAIL_TO || 'admin@example.com'
```

## Prisma models

Source: `prisma/schema.prisma`. Tables are mapped: `bio`, `blog_post`, `project`. Datasource URL is in `prisma.config.ts`. Generator `binaryTargets`: `native` and `rhel-openssl-3.0.x` (Vercel Linux).

### Bio (singleton)

| Field             | Type                    | Notes                                                                                                                  |
| ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `id`              | `Int` `@id @default(1)` | Always `1`. Seed and loaders hard-code that id.                                                                        |
| `name`            | `String`                | Display name (layout + about).                                                                                         |
| `title`           | `String`                | Job title / headline.                                                                                                  |
| `location`        | `String`                | Shown in layout and contact.                                                                                           |
| `about`           | `String`                | Long bio. Home uses the first 160 characters as a tagline.                                                             |
| `skillCategories` | `Json` `@default("{}")` | Object of category name → `string[]`. Parsed by `parseSkillCategories`; invalid JSON becomes `{}`.                     |
| `experience`      | `Json?`                 | Array of `{ title, company, period, description }`. Invalid JSON becomes `[]`.                                         |
| `siteMetadata`    | `Json` `@default("{}")` | Public contact/social. Parsed by `parseSiteMetadata` (Zod). Unknown/invalid values fall back to `defaultSiteMetadata`. |
| `updatedAt`       | `DateTime` `@updatedAt` | Auto.                                                                                                                  |

`siteMetadata` keys (all optional on parse; defaults fill gaps): `email`, `phone` (max 50), `github` (URL), `linkedin` (URL), `bluesky` (URL), `availability` (max 500), `responseTime` (max 200).

### BlogPost

| Field      | Type                        | Notes                                                                                                                                                  |
| ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`       | `Int` autoincrement         | URL segment `/blog/{id}`.                                                                                                                              |
| `title`    | `String`                    | SEO title on the detail page.                                                                                                                          |
| `excerpt`  | `String?`                   | SEO description fallback is `title`.                                                                                                                   |
| `content`  | `String`                    | Plain text in the UI. HTML is **not** interpreted.                                                                                                     |
| `author`   | `String`                    | Initials via `getAuthorInitials` (first letters, max 2).                                                                                               |
| `date`     | `DateTime`                  | List sort key. Format `en-US` long date. Invalid dates render as `Invalid date`.                                                                       |
| `category` | `String`                    | Free string. Known color/icon keys: `Development`, `Technology`, `Backend`, `CSS`, `DevOps`. Anything else uses defaults (`#655d58`, icon `document`). |
| `readTime` | `String?`                   | Display-only (for example `"5 min"`).                                                                                                                  |
| `featured` | `Boolean` `@default(false)` | Featured grid on `/blog` when filter is `all`.                                                                                                         |
| `tags`     | `String[]`                  | Postgres text array.                                                                                                                                   |

There is **no** blog seed script. Posts are created in Prisma Studio (or SQL).

### Project

| Field          | Type                        | Notes                                                                                                                                                                                                                   |
| -------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `Int` autoincrement         | URL `/projects/{id}`.                                                                                                                                                                                                   |
| `title`        | `String`                    |                                                                                                                                                                                                                         |
| `description`  | `String`                    |                                                                                                                                                                                                                         |
| `image`        | `String?`                   | Path or `https://` URL. Local files live in `static/projects/` and are served at `/projects/...`. `static/` prefix is stripped. Legacy typo `/projects/service-certifiy.jpg` remaps to `/projects/service-certify.jpg`. |
| `technologies` | `String[]`                  |                                                                                                                                                                                                                         |
| `category`     | `String`                    | Filter on `/projects` expects `frontend`, `backend`, or `fullstack`. Other values still list but only match `all`. Colors/icons exist for those three; others use defaults.                                             |
| `github`       | `String?`                   | Passed through `sanitizeUrl` (rejects `javascript:`, `data:`, `vbscript:`).                                                                                                                                             |
| `live`         | `String?`                   | Same sanitizer.                                                                                                                                                                                                         |
| `featured`     | `Boolean` `@default(false)` | Featured band on `/projects` when filter is `all`. Home takes 4 rows ordered featured-first, not "featured only".                                                                                                       |

`npm run db:seed` (`scripts/seed-projects.js`) **deletes all projects** then inserts the seed list. `npm run db:seed:bio` upserts Bio `id=1` and does not touch posts or projects.

## Contact form

Schema: `src/lib/schemas.ts` → `contactFormSchema` (Zod 4). Superforms adapter: `src/lib/server/superforms-zod4.ts`. Submit path: `submitContact` in `src/lib/server/contact.ts`.

| Field     | Constraints                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `name`    | Required, trim, max **100**, no CR/LF.                                        |
| `email`   | Required, Zod `.email()`, max **255**, trim, **lowercased**, no CR/LF.        |
| `subject` | Required, trim, max **200**, no CR/LF.                                        |
| `message` | Required, trim, max **5000**. Newlines allowed.                               |
| `website` | Honeypot. Default `''`. Max length **0**. Any value → `"Invalid submission"`. |

After validation, name/email/subject/message are run through `stripHtmlTags` + trim. Outbound HTML uses `escapeHtml`. Email subject is `Contact Form: ${subject}` with CR/LF replaced by spaces.

### Outcomes

| Situation                                   | HTTP                       | What the UI shows                                                                       |
| ------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| Zod validation failure (including honeypot) | **400**                    | Field errors (`$errors.*`). Honeypot: "Invalid submission".                             |
| Send succeeded                              | 200 + Superforms `message` | `"Thank you! I'll get back to you soon."` (cleared after 5s). Metric `outcome=success`. |
| Send returned `{ success: false }`          | 200 + Superforms `message` | `"Message delivery failed. Please try again later."` Metric `outcome=delivery_error`.   |
| Thrown error in submit                      | **400**                    | `handleFormError` text (`Unable to process your request…` in production).               |
| Rate limit                                  | **429**                    | Body `Too many requests. Please try again later.` Header `Retry-After` (seconds).       |

### Rate limit

`checkRateLimit` in `src/lib/server/rate-limit.ts`, called from `hooks.server.ts` only when `POST` and path is `/contact`.

| Option        | Default                               |
| ------------- | ------------------------------------- |
| Key           | `contact:${event.getClientAddress()}` |
| `maxRequests` | **5**                                 |
| `windowMs`    | **15 × 60 × 1000** (15 minutes)       |

In-memory `Map` per Node process. On Vercel each warm isolate has its own map.

### Email providers (`src/lib/server/email.ts`)

| `EMAIL_SERVICE`     | Behavior                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| `console` (default) | Logs to stdout. Blocked in production.                                       |
| `resend`            | POST Resend API, 15s abort timeout.                                          |
| `sendgrid`          | POST SendGrid v3, 15s abort timeout.                                         |
| `smtp`              | Always `{ success: false, error: 'SMTP email service not implemented. …' }`. |
| anything else       | `{ success: false, error: 'Unknown email service: …' }`.                     |

## Security headers and CSP

`src/hooks.server.ts` `applySecurityHeaders` on every response (including 429):

| Header                   | Value                                      |
| ------------------------ | ------------------------------------------ |
| `X-Content-Type-Options` | `nosniff`                                  |
| `X-Frame-Options`        | `DENY`                                     |
| `Referrer-Policy`        | `strict-origin-when-cross-origin`          |
| `Permissions-Policy`     | `geolocation=(), microphone=(), camera=()` |

`X-XSS-Protection` is not set. HSTS is left to the host (Vercel).

CSP (`svelte.config.js`, `kit.csp.mode: 'auto'`):

| Directive     | Sources                     |
| ------------- | --------------------------- |
| `default-src` | `'self'`                    |
| `script-src`  | `'self'`                    |
| `style-src`   | `'self'`, `'unsafe-inline'` |
| `img-src`     | `'self'`, `data:`, `https:` |
| `font-src`    | `'self'`                    |
| `connect-src` | `'self'`                    |

Fonts are `@fontsource/manrope` and `@fontsource/inter` from `src/app.css`. Adapter: `@sveltejs/adapter-vercel` with `runtime: 'nodejs22.x'`.

## npm scripts

From `package.json`:

| Script                                                              | What it runs                                                                                                                                                          |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dev`                                                               | `node --experimental-strip-types --import ./config/otel/init.ts` then Vite `dev`                                                                                      |
| `build`                                                             | `prisma generate && vite build`                                                                                                                                       |
| `preview`                                                           | `vite preview`                                                                                                                                                        |
| `check`                                                             | `prisma generate` + `svelte-kit sync` + `svelte-check`                                                                                                                |
| `lint`                                                              | Prettier check + ESLint                                                                                                                                               |
| `format`                                                            | Prettier write                                                                                                                                                        |
| `lint:oxlint`                                                       | Oxlint                                                                                                                                                                |
| `test`                                                              | `vitest run` (happy-dom; DB mocked)                                                                                                                                   |
| `test:watch` / `test:unit` / `test:integration` / `test:components` | Vitest subsets                                                                                                                                                        |
| `test:coverage`                                                     | Vitest + v8. Thresholds on `src/lib/**/*.ts`: lines 80, functions 80, branches 75, statements 80. Excludes `types.ts`, `observability/**`, `db/index.ts`, `email.ts`. |
| `test:e2e`                                                          | Playwright Chromium, app on **127.0.0.1:5174**                                                                                                                        |
| `db:push`                                                           | `prisma db push`                                                                                                                                                      |
| `db:migrate`                                                        | `prisma migrate dev`                                                                                                                                                  |
| `db:studio`                                                         | Prisma Studio                                                                                                                                                         |
| `db:generate`                                                       | `prisma generate`                                                                                                                                                     |
| `db:seed`                                                           | `scripts/seed-projects.js` (wipes `project`)                                                                                                                          |
| `db:seed:bio`                                                       | `scripts/seed-bio.js` (upsert Bio `id=1`)                                                                                                                             |
| `assets:og`                                                         | Write `static/og-image.png` 1200×630                                                                                                                                  |
| `assets:project-images`                                             | WebP siblings for JPEGs in `static/projects/`                                                                                                                         |
| `semgrep:scan`                                                      | Semgrep packs + `config/semgrep/rules`                                                                                                                                |
| `otel:verify`                                                       | `scripts/test-otlp.mjs`                                                                                                                                               |
| `fallow`                                                            | Dead-code scan                                                                                                                                                        |

Git hooks: `.husky/pre-commit` → `lint-staged`. `.husky/pre-push` → `npm run check && npm run test:unit`.

Playwright (`playwright.config.ts`): `npx vite dev --port 5174 --strictPort --host 127.0.0.1`. Specs: `e2e/smoke.spec.ts` (routes `/`, `/about`, `/projects`, `/blog`, `/contact`; document title; axe with **all** violations, not only `serious`), `e2e/contact-honeypot.spec.ts`.

## TypeScript modules (public helpers)

### `$lib/server/sanitize-utils`

| Function               | Behavior                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `escapeHtml(text)`     | `& < > " '` → entities. Used in contact HTML email.                                                                                                            |
| `stripHtmlTags(text)`  | `sanitize-html` with no allowed tags, then entity decode (`&amp;` last).                                                                                       |
| `sanitizeText(text)`   | Strip tags then escape.                                                                                                                                        |
| `sanitizeHtml(html)`   | Allow `p,b,i,em,strong,a,ul,ol,li,br,span,div,img`; `a` href/name/target; `img` src/alt/width/height; schemes `http`/`https`/`mailto` (`img` http/https only). |
| `sanitizeEmail(email)` | Strip tags, trim, lower, simple `local@domain` regex; else `''`.                                                                                               |
| `sanitizeUrl`          | Re-export from `$lib/url`.                                                                                                                                     |

### `$lib/url`

`sanitizeUrl(url)`: trim; empty → `''`; `javascript:`, `data:`, `vbscript:` → `''`; otherwise the trimmed string. Client-safe (no `$env` / Prisma).

### `$lib/project-image`

- `projectImageSrc(path)` → absolute site path or `https://` URL, or `null`.
- `projectWebpSrc(path)` → same path with `.webp` for local `.jpg`/`.jpeg` only; `null` for remote URLs.

### `$lib/bio-profile`

- `parseSkillCategories` / `parseExperience` / `toBioProfile(bio)`.

### `$lib/site-metadata`

- `parseSiteMetadata(raw)` → Zod parse merged onto `defaultSiteMetadata`.
- `defaultSiteMetadata` holds the layout fallbacks when Bio JSON is missing or invalid.

### `$lib/blog-utils` / `$lib/project-utils`

Category color/icon maps and `formatBlogDate`, `getAuthorInitials`, `safeProjectUrl`.

### `$lib/components/SeoHead.svelte`

Props: `title` (string), `description?` (default portfolio sentence), `ogImagePath?` (`undefined` → `/og-image.png`; `null` → omit image tags). Document title becomes `{title} \| Aaron Howard` unless `title` already contains `Aaron Howard`. `og:image` is an absolute URL from `page.url.origin`.

### Observability counters

Defined in `src/lib/observability/app-metrics.ts`. Full setup: [OBSERVABILITY.md](./OBSERVABILITY.md).

| Metric                    | Labels                                                         | When                          |
| ------------------------- | -------------------------------------------------------------- | ----------------------------- |
| `app.http.requests`       | `http.method`, `route.id`, `http.status_code`                  | Every request after `resolve` |
| `app.http.errors`         | `route.id` (and `source=handleError` for unhandled)            | HTTP 5xx or `handleError`     |
| `app.rate_limit.exceeded` | `route.id`                                                     | Contact 429                   |
| `app.contact.submissions` | `outcome`: `success` \| `validation_error` \| `delivery_error` | Contact submit path           |

Prisma queries emit spans `db.{model}.{operation}`. Email send emits `email.send` (attribute `email.domain` only, not the address).

## Related

- [Tutorial: from clone to a working page](./tutorial-getting-started.md)
- [How to manage content](./howto-manage-content.md)
- [How to configure the contact form](./howto-configure-contact.md)
- [Why the site is built this way](./explanation-architecture.md)
