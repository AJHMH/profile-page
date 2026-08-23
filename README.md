# Personal Portfolio Website

A modern, responsive personal portfolio website built with **SvelteKit**, **Svelte 5**, **TypeScript**, and **Tailwind CSS v4**. Features a blog, project showcase, and contact form—all powered by PostgreSQL and Prisma ORM.

## ✨ Features

- **Modern Tech Stack**: SvelteKit 2.61.x, Svelte 5, TypeScript, Tailwind CSS v4, Vite 8
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Multiple Sections**: Home, About (`/about`; `/bio` redirects there), Projects (list + detail), Blog (list + detail), Contact
- **Database-Driven Content**: PostgreSQL with Prisma ORM for all content
- **Type-Safe Validation**: Zod schemas with Superforms for forms
- **Comprehensive Testing**: Vitest (~120 tests) with coverage thresholds; Playwright smoke + axe + contact honeypot E2E
- **CI/CD Pipeline**: Shared [ci-templates@v1.0.0](https://github.com/aaron-howard/ci-templates/releases/tag/v1.0.0) — see [docs/CI-CD.md](docs/CI-CD.md)
- **Observability**: OpenTelemetry → Grafana Cloud — [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md)
- **Dependency updates**: Dependabot (Actions) + Renovate (npm) — [docs/DEPENDENCY-MANAGEMENT.md](docs/DEPENDENCY-MANAGEMENT.md)
- **Pre-commit Hooks**: Husky + lint-staged for local quality gates
- **SEO**: `SeoHead` titles/descriptions, Open Graph / Twitter image (`static/og-image.png`, regenerate via `npm run assets:og`)
- **Error Handling**: Centralized error utilities with user-friendly messages
- **Security**: CSP and security headers in `hooks.server.ts`, in-memory rate limiting on `POST /contact`, honeypot field on the contact form, input sanitization

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** (configured in `engines` field)
- **npm 10+** or **pnpm**
- **PostgreSQL 12+** (required for database features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd profile-page
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_db"
   ```

   See `.env.example` for all available options.

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173`

## 📚 Available Scripts

### Development

```bash
npm run dev              # Start dev server at http://localhost:5173
npm run preview          # Preview production build locally
```

### Code Quality

```bash
npm run lint            # Run ESLint and Prettier check
npm run format          # Auto-format code with Prettier
npm run check           # Type check with svelte-check
npm run check:watch     # Watch mode type checking
```

### Testing

```bash
npm test                # Run full Vitest suite (~120 tests)
npm run test:watch      # Watch mode for tests
npm run test:unit       # Run unit tests only
npm run test:coverage   # Test coverage report (used in CI)
npm run test:e2e        # Playwright: smoke routes + axe + honeypot
npm run test:integration    # Run integration tests
npm run test:components     # Run component tests
```

### Database

```bash
npm run db:push         # Push schema changes to database
npm run db:migrate      # Run database migrations interactively
npm run db:studio       # Open Prisma Studio GUI (content management)
npm run db:generate     # Generate Prisma client
npm run db:seed         # Seed projects from scripts/seed-projects.js
npm run db:seed:bio     # Upsert bio/profile from scripts/seed-bio.js
```

### Assets

```bash
npm run assets:og               # Regenerate static/og-image.png (1200×630) via sharp
npm run assets:project-images   # Write WebP alongside JPEGs in static/projects/
```

See [docs/DESIGN_ASSETS.md](docs/DESIGN_ASSETS.md) for guidance on large design binaries in git.

### Production

```bash
npm run build           # Build for production (includes Prisma generate)
```

On **Windows**, the Vercel adapter may fail at the symlink step without elevated permissions or Developer Mode; **GitHub Actions** (Linux) and Vercel builds are the supported verification paths if local `npm run build` errors with `EPERM` on `.vercel/output`.

## 📁 Project Structure

```
src/
├── routes/                          # SvelteKit pages and routes
│   ├── +layout.svelte              # Root layout
│   ├── +layout.server.ts           # Root layout server load
│   ├── +page.svelte                # Home page
│   ├── +error.svelte               # Global error page
│   ├── about/                    # About page (primary bio URL)
│   ├── bio/                      # Redirects to /about
│   ├── blog/                       # Blog posts page
│   ├── projects/                   # Projects showcase
│   └── contact/                    # Contact form page
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   └── index.ts           # Prisma client singleton
│   │   ├── error-handler.ts       # Centralized error handling
│   │   ├── email.ts               # Email utilities
│   │   └── sanitize-utils.ts      # Input sanitization utilities
│   ├── schemas.ts                 # Zod validation schemas
│   └── types.ts                   # TypeScript interfaces
├── hooks.server.ts                 # SvelteKit server hooks (security headers)
├── app.css                         # Global Tailwind CSS
└── app.html                        # HTML template
prisma/
├── schema.prisma                   # Database schema (Bio, BlogPost, Project)
└── migrations/                     # Database migration history
```

## 🗄️ Database Schema

**Models** (in `prisma/schema.prisma`):

- **Bio** (singleton): Personal profile, title, location, about, skills, and work experience
- **BlogPost**: Blog posts with title, excerpt, content, category, tags, featured status
- **Project**: Portfolio projects with title, description, technologies, links, featured status

## 🎨 Content Management

All content is managed through **Prisma Studio** — no authentication required, no web interface needed:

```bash
npm run db:studio
```

This opens a GUI where you can:

- Edit your bio/profile
- Create and manage blog posts
- Manage your portfolio projects
- Preview changes instantly

## 🔐 Security

- **Input Sanitization**: User input sanitized for display and email
- **Form Validation**: Zod + Superforms; honeypot (`website`) must stay empty
- **CSP**: Configured in `svelte.config.js` (self-hosted fonts; no Google Fonts domains)
- **Contact abuse**: `POST /contact` rate-limited per IP in `hooks.server.ts` (in-memory; fine for a portfolio)
- **Error Handling**: Sensitive errors hidden from users, logged internally
- **CSRF Protection**: Built into SvelteKit

## ✅ Testing

Vitest covers sanitization, schemas, utilities, error handling, integration (e.g. contact action), and components, with coverage thresholds on `src/lib/**/*.ts`. Playwright runs smoke navigation, axe checks on main routes, and a honeypot rejection flow on `/contact`.

Run tests with:

```bash
npm test              # Vitest (same cases as CI unit gate)
npm run test:coverage # Coverage report (CI)
npm run test:e2e      # Playwright (CI; requires Chromium install)
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
4. Deploy

See `DEPLOYMENT_GUIDE.md` for:

- Connection pooling setup for serverless
- Vercel Postgres integration
- Environment configuration for production

### Other Platforms

The project works on any platform supporting SvelteKit:

- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted servers

## 🔄 Git Workflow

**Pre-commit hooks** (via Husky):

- Lint-staged checks only modified files
- Runs Prettier and ESLint on commits
- Fast (<5 seconds)

**Pre-push hooks** (via Husky):

- Type-check (svelte-check)
- Unit tests only
- Catches issues before remote

**CI/CD** (GitHub Actions):

- Lint & format check
- Type check
- `npm audit` (moderate threshold)
- Vitest with coverage (single run; no duplicate `npm test` step)
- Playwright (Chromium) smoke + axe + honeypot
- Production build (`@sveltejs/adapter-vercel`, Node **22.x** runtime on Vercel)

All quality gates must pass before merging to main.

## 🛠️ Tech Stack

| Layer      | Technology                                                                       |
| ---------- | -------------------------------------------------------------------------------- |
| Frontend   | Svelte 5.x, SvelteKit 2.61.x, TypeScript                                         |
| Styling    | Tailwind CSS v4 (forms, typography plugins); Manrope & Inter via `@fontsource/*` |
| Build      | Vite 8.x                                                                         |
| Database   | PostgreSQL 12+                                                                   |
| ORM        | Prisma 7.x                                                                       |
| Validation | Zod + sveltekit-superforms                                                       |
| Testing    | Vitest 4.x, Playwright, @axe-core/playwright, Testing Library                    |
| Quality    | ESLint, Prettier, svelte-check                                                   |
| Hooks      | Husky + lint-staged                                                              |
| Deployment | Vercel (`@sveltejs/adapter-vercel`, `runtime: 'nodejs22.x'`)                     |

## 📖 Documentation

- **CLAUDE.md** - Architecture overview and quick commands for Claude Code
- **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
- **DATABASE_CONFIG.md** - Connection pooling and production database setup
- **docs/PRODUCTION_AUDIT.md** — Production readiness notes
- **docs/DESIGN_ASSETS.md** — Keep large design zips out of the repo

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint && npm run check && npm test` locally
4. Commit and push (pre-commit/pre-push hooks will validate)
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using SvelteKit, Svelte 5, and Tailwind CSS**
