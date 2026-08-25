# From clone to a working page

You will clone **profile-page**, point it at PostgreSQL, seed the bio and sample projects, and open the site in a browser. By the end you have a running SvelteKit app on `http://localhost:5173` with real `/about` and `/projects` data.

SvelteKit is the app framework (file-based routes in `src/routes/`). Prisma is the database toolkit (schema in `prisma/schema.prisma`). PostgreSQL holds Bio, Project, and BlogPost rows.

## What you'll need

- **Node.js 22.x**, 22.22.1 or newer (`.npmrc` sets `engine-strict=true`; older 22.14.x fails `npm install` because of `lint-staged`)
- **npm 10+**
- **PostgreSQL 12+** listening locally (Cloud snapshot: `sudo pg_ctlcluster 16 main start`)
- Git

If you only want unit tests, skip Postgres: `npm test` mocks the database. This tutorial is for the running site.

## Step 1: Clone and install

```bash
git clone https://github.com/aaron-howard/profile-page.git
cd profile-page
nvm use 22   # if nvm is installed; otherwise use any Node 22.22.1+
npm install
```

`postinstall` runs `prisma generate`. You now have `node_modules` and a generated Prisma client. You have not started a server yet.

## Step 2: Create `.env` and apply the schema

Copy the template and set a real connection string (user, password, host, database must exist):

```bash
cp .env.example .env
```

Edit `.env` so at least these are set (use your actual role and database):

```env
DATABASE_URL="postgresql://portfolio:portfolio@127.0.0.1:5432/portfolio_db?schema=public"
EMAIL_SERVICE="console"
```

Do not wrap the URL in extra quotes when you later `source` the file; `.env.example` already uses quotes, and `set -a; . ./.env; set +a` handles them. Do **not** use `export $(grep … | xargs)`: the quotes become part of the password and Postgres auth fails.

Create the database if needed, then push the Prisma schema (tables `bio`, `blog_post`, `project`):

```bash
npm run db:push
```

Success looks like Prisma reporting the database is in sync. If this errors, PostgreSQL is down, the URL is wrong, or the role cannot create tables. Fix `DATABASE_URL` before continuing.

Cloud snapshot shortcut if the role is missing:

```bash
sudo -u postgres psql -c "CREATE USER portfolio WITH PASSWORD 'portfolio' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE portfolio_db OWNER portfolio;"
```

## Step 3: Seed content and start the app

Seed scripts load `.env` themselves via `dotenv`. The Vite dev server does **not**, unless the variables are already in the process environment.

```bash
npm run db:seed:bio
npm run db:seed
set -a; . ./.env; set +a
npm run dev
```

You should see Vite's local URL, default **http://localhost:5173**.

Open that URL. You should get:

- Home: name/title from Bio, up to four projects, empty blog teasers (there is no blog seed)
- `/about`: full bio, skill groups, experience
- `/projects`: the seed catalog (this command **wipes** existing projects first)
- `/contact`: form; a submit with `EMAIL_SERVICE=console` prints `=== EMAIL ===` in the same terminal

If the home hero looks generic and `/about` shows a "Connect your database" experience block, Vite started **without** `DATABASE_URL` in `process.env`. Stop the server and start it again with the `set -a; . ./.env; set +a` lines. The failure in the terminal is usually `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`. Pages can still return HTTP 200 because loaders catch the error.

## What you built

A local portfolio against your Postgres: Bio `id=1` from `scripts/seed-bio.js`, projects from `scripts/seed-projects.js`, contact mail logging to the console.

Next:

1. Add a blog post in Prisma Studio: [How to manage content](./howto-manage-content.md)
2. Point contact at Resend or SendGrid: [How to configure the contact form](./howto-configure-contact.md)
3. Look up routes and env vars: [Application reference](./reference.md)
4. Deploy: [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

Optional checks on the same machine:

```bash
npm test                 # Vitest, no Postgres
npx playwright install chromium
set -a; . ./.env; set +a
npm run test:e2e         # Playwright on port 5174; needs DB for real content
```

The axe specs in E2E assert **all** violations (not only `serious`). Real seeded content can fail `color-contrast` on `/about`, `/projects`, or `/blog`; that is an app contrast issue, not a broken install.
