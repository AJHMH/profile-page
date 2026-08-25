# How to manage content

Edit the bio, add a blog post, or add a project. There is no web admin. Content lives in PostgreSQL and is edited with Prisma Studio (a GUI over the three tables) or the seed scripts.

When you finish, `/about`, `/blog`, and `/projects` show the new rows. For why Studio is the CMS, see [Why the site is built this way](./explanation-architecture.md). Field-level types: [application reference](./reference.md).

## Prerequisites

- **Node.js 22.22.1 or newer** (`.npmrc` sets `engine-strict=true`; older 22.x such as 22.14.x fails `npm install` because of `lint-staged`)
- PostgreSQL running, schema applied (`npm run db:push`)
- `.env` with a working `DATABASE_URL` (same database the app uses)
- Dev server started with `.env` exported into the shell (see the [getting-started tutorial](./tutorial-getting-started.md))

## Steps

### 1. Open Prisma Studio

```bash
npm run db:studio
```

Studio opens in the browser (Prisma's default port is **5555**). You should see models **Bio**, **BlogPost**, and **Project**.

### 2. Edit the bio (singleton)

1. Open **Bio**.
2. Use the row with `id` **1**. Loaders never read any other id. If the row is missing, run `npm run db:seed:bio` or create `id = 1` here.
3. Set `name`, `title`, `location`, `about`.
4. `skillCategories` is JSON. Shape: object whose values are string arrays.

   ```json
   {
   	"Languages & runtimes": ["TypeScript", "Python"],
   	"Frontend & UI": ["Svelte", "SvelteKit"]
   }
   ```

   Prisma stores `skillCategories` as JSON, so malformed JSON cannot be saved. Valid JSON with an unexpected shape (not an object of string arrays) is stored, but `parseSkillCategories` treats it as `{}` and the About skills section goes empty.

5. `experience` is a JSON array:

   ```json
   [
   	{
   		"title": "ServiceNow Administrator",
   		"company": "City of Dallas",
   		"period": "2022 - Present",
   		"description": "Platform configuration and integrations."
   	}
   ]
   ```

   Each object needs `title`, `company`, `period`, and `description` (all strings). Anything else is ignored and About shows no jobs.

6. `siteMetadata` is JSON for footer/contact:

   ```json
   {
   	"email": "you@example.com",
   	"github": "https://github.com/your-user",
   	"linkedin": "https://www.linkedin.com/in/your-user/",
   	"bluesky": "https://bsky.app/profile/your-user.bsky.social",
   	"availability": "Available for municipal automation work.",
   	"responseTime": "I typically respond within 24 hours."
   }
   ```

   `email` must be a valid email. `github` / `linkedin` / `bluesky` must be URLs. Parse failures fall back to `defaultSiteMetadata` in `src/lib/site-metadata.ts`.

7. Save the row. Reload `/about` and the header/footer.

`npm run db:seed:bio` **upserts** `id=1` with the contents of `scripts/seed-bio.js`. It overwrites whatever you typed in Studio for that row.

### 3. Add a blog post

There is no `db:seed` for posts. Create a **BlogPost** row:

| Field      | What to put                                                                               |
| ---------- | ----------------------------------------------------------------------------------------- |
| `title`    | Shown as the H1 and in `<title>`                                                          |
| `excerpt`  | Optional. Used as meta description; if empty, the title is used                           |
| `content`  | Plain text. Newlines are preserved. HTML tags display as characters, not markup           |
| `author`   | Any string. Avatars use up to two initials                                                |
| `date`     | Sort key on `/blog` and the home teaser                                                   |
| `category` | Free text. Colors/icons exist for `Development`, `Technology`, `Backend`, `CSS`, `DevOps` |
| `readTime` | Optional display string, e.g. `8 min`                                                     |
| `featured` | `true` puts it in the featured band on `/blog` when the filter is All Posts               |
| `tags`     | Postgres string array                                                                     |

Save. Open `http://localhost:5173/blog` and click through to `/blog/{id}`.

Category chips on `/blog` are computed from whatever categories exist in the loaded posts. You do not register categories in code.

### 4. Add a project

Create a **Project** row (or edit one). Category should be exactly `frontend`, `backend`, or `fullstack` if you want the `/projects` filter chips to match.

**Image path:** put the file in `static/projects/` (for example `static/projects/my-app.jpg`). Store one of these in `image`:

- `/projects/my-app.jpg` (preferred)
- `projects/my-app.jpg`
- `static/projects/my-app.jpg` (the `static/` prefix is stripped at render time)

Remote `https://…` URLs also work. After adding JPEGs, optionally generate WebP twins:

```bash
npm run assets:project-images
```

`ProjectPicture` will use the `.webp` sibling when the stored path is a local jpeg.

**Links:** `github` and `live` are shown only if `sanitizeUrl` accepts them. `javascript:` / `data:` / `vbscript:` become empty and the button disappears.

`npm run db:seed` **deletes every project** and inserts `scripts/seed-projects.js`. Do not run it against a database that holds real portfolio rows you have not copied out.

### 5. Featured placement

- **Home** (`/`): four projects, `featured` first, then newest `id`. A non-featured project can still appear if you have fewer than four featured rows.
- **Projects list**: featured rows get the large band only when the filter is All Projects.
- **Blog list**: featured posts get the large band only when the filter is All Posts.

## Verification

1. Reload `/about`. Name, title, skills, and experience match Studio.
2. Reload `/blog`. New post is first if its `date` is newest. Detail page shows the full `content`.
3. Reload `/projects`. Filter by the category you set. Image loads (or the gradient placeholder if the file is missing).
4. View source or the tab title: `SeoHead` should show `… | Aaron Howard` on inner pages.

If you see the amber **Content unavailable** banner, the loader caught a Prisma error. Fix `DATABASE_URL` and restart Vite with the env exported.

## Troubleshooting

| What you see                                                               | Likely cause                                                                       | Fix                                                                                                                                                                     |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| About looks empty / default "Aaron Howard" in the nav                      | No Bio `id=1`, or JSON failed parse                                                | Seed bio or fix JSON in Studio                                                                                                                                          |
| About in `dev` shows "Local development" and a placeholder about paragraph | DB connection failed; `devFallbackBio` kicked in                                   | Start Postgres, export `.env`, restart `npm run dev`                                                                                                                    |
| New post missing on `/blog`                                                | Connected to a different database than Studio                                      | Same `DATABASE_URL` for Studio and Vite                                                                                                                                 |
| Project image broken                                                       | Path points at `/static/projects/…` in the HTML, or file not in `static/projects/` | Store `/projects/file.jpg`; confirm the file exists under `static/projects/`                                                                                            |
| Filter chip does nothing for a project                                     | `category` is not `frontend` / `backend` / `fullstack`                             | Rename the field; chips are hardcoded                                                                                                                                   |
| Blog looks like it ignored my HTML                                         | By design                                                                          | Write plain text, or change the renderer (that is a code change)                                                                                                        |
| Seed "ate" my projects                                                     | `db:seed` runs `deleteMany`                                                        | Restore from a database backup or export. Git history can recover only projects captured in `scripts/seed-projects.js`; stop using the seed command on production data. |

## Related

- [Tutorial: from clone to a working page](./tutorial-getting-started.md)
- [Application reference](./reference.md)
- [How to configure the contact form](./howto-configure-contact.md)
