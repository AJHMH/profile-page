# How to configure the contact form

Deliver messages from `/contact` to your inbox. In development the default is log-to-console. In production you set `EMAIL_SERVICE` to **resend** or **sendgrid** and a recipient address. SMTP is listed in `.env.example` but is **not implemented** (`sendViaSMTP` always fails).

Schema, rate limits, and status codes: [application reference](./reference.md). Design rationale: [architecture explanation](./explanation-architecture.md).

## Prerequisites

- App runs locally or on Vercel with `DATABASE_URL` (layout still loads Bio for the contact sidebar)
- For production: a Resend or SendGrid account and a verified `From` domain/address
- You will **not** use `EMAIL_SERVICE=console` on Vercel (`NODE_ENV=production` rejects it)

## Steps

### 1. Pick a provider

| Value      | Use when                                                  |
| ---------- | --------------------------------------------------------- |
| `console`  | Local only. Prints the message to the terminal.           |
| `resend`   | Production (HTTP API). Needs `RESEND_API_KEY`.            |
| `sendgrid` | Production (HTTP API). Needs `SENDGRID_API_KEY`.          |
| `smtp`     | Do not set. Returns `SMTP email service not implemented`. |

### 2. Set environment variables

Local `.env` (never commit this file):

```env
EMAIL_SERVICE="console"
CONTACT_EMAIL="you@example.com"
EMAIL_FROM="you@example.com"
```

Production (Vercel project env, Production + Preview as you need):

```env
EMAIL_SERVICE="resend"
RESEND_API_KEY="re_your_key_here"
EMAIL_FROM="you@your-verified-domain.com"
CONTACT_EMAIL="you@example.com"
```

Recipient resolution is `CONTACT_EMAIL`, then `EMAIL_TO`, then `'admin@example.com'`. If you skip both recipient vars, mail goes to that last-resort address. Set `CONTACT_EMAIL`.

`EMAIL_FROM` defaults: Resend `onboarding@resend.dev`, SendGrid `noreply@example.com`. Use a domain you have verified with the provider or the API will 4xx.

### 3. Confirm the form fields

The page posts `name`, `email`, `subject`, `message`, and a hidden `website` honeypot (`src/routes/contact/+page.svelte`). Do not add a visible "website" field. Bots that fill `#website` fail Zod with **Invalid submission** (Playwright covers this in `e2e/contact-honeypot.spec.ts`).

Limits (after trim): name 100, email 255, subject 200, message 5000. Name/email/subject cannot contain CR or LF.

### 4. Send a test in development

Export `.env` and start Vite:

```bash
set -a; . ./.env; set +a
npm run dev
```

Open `http://localhost:5173/contact`. Leave Website alone. Submit a real-looking message.

**Expected (console provider):** HTTP 200, banner `Thank you! I'll get back to you soon.`, and in the terminal:

```
=== EMAIL ===
To: you@example.com
Subject: Contact Form: …
```

The banner clears after five seconds.

### 5. Wire production

1. Set the Vercel env vars from step 2.
2. Redeploy (env changes apply on the next deployment).
3. Submit `/contact` on the live host.
4. Confirm the message in the inbox and in the provider dashboard.
5. Optional: Grafana metric `app.contact.submissions` with `outcome=success` ([OBSERVABILITY.md](./OBSERVABILITY.md)).

## Verification

- Valid submit → success banner, mail (or console log) received.
- Empty name → inline "Name is required", HTTP 400 from the action.
- Fill `#website` (DevTools or the Playwright test) → "Invalid submission".
- Sixth `POST /contact` from the same IP inside 15 minutes → **429** and `Retry-After`. Locally this is easy to hit; on Vercel it is per instance.
- `EMAIL_SERVICE=console` on Vercel → submit shows **Message delivery failed. Please try again later.** and the function log contains `EMAIL_SERVICE=console is not allowed in production`.

## Troubleshooting

| What you see                                     | Likely cause                                                              | Fix                                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Success banner but no inbox mail                 | `EMAIL_SERVICE=console`, or recipient is the fallback `admin@example.com` | Set `resend`/`sendgrid` and `CONTACT_EMAIL`                                       |
| "Message delivery failed"                        | API key missing, provider 4xx, 15s timeout, or console-in-production      | Check function logs; `RESEND_API_KEY` / `SENDGRID_API_KEY`; verified `EMAIL_FROM` |
| "Email service is not configured for production" | `console` under `NODE_ENV=production`                                     | Change `EMAIL_SERVICE`                                                            |
| "SMTP email service not implemented"             | `EMAIL_SERVICE=smtp`                                                      | Switch to resend or sendgrid                                                      |
| 429 immediately                                  | Five posts already in the 15-minute window on that isolate                | Wait for `Retry-After`, or restart the dev server (clears the in-memory map)      |
| Mail HTML shows raw tags from the visitor        | Should not happen; `escapeHtml` runs in `formatContactEmail`              | File a bug; do not strip the escape                                               |
| Layout contact details wrong                     | Bio `siteMetadata` JSON, not email env                                    | Edit Bio in Studio ([manage content](./howto-manage-content.md))                  |

Rate limiting is **not** shared across Vercel isolates. A spam wave that fans out will mostly miss the cap. That is accepted for this site until a shared store is added.

## Related

- [Application reference](./reference.md) (schema, 429, metrics)
- [Tutorial: from clone to a working page](./tutorial-getting-started.md)
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
