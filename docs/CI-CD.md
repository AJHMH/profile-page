# CI/CD Architecture

Workflows are defined locally in `.github/workflows/`. The former reusable
workflow reference at `aaron-howard/ci-templates@v1.0.0` is unavailable; GitHub
rejected those workflows before starting any jobs. Local steps restore the
validation and security scans without depending on that repository.

## Pipeline

| Stage   | Trigger                              | Checks                                                                                                      |
| ------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| CI      | Pull request, push to `main`, manual | Clean install, dependency audit, formatting/ESLint, Svelte type checks, coverage tests, production build    |
| Semgrep | Pull request, push to `main`, manual | Registry packs `p/ci`, `p/typescript`, `p/nodejs` and `config/semgrep/rules`; SARIF upload to code scanning |
| E2E     | Pull request, push to `main`, manual | Playwright Chromium smoke, accessibility and honeypot tests, against a disposable PostgreSQL                |
| Deploy  | Push to `main`                       | Existing Vercel Git integration                                                                             |

Pull requests report the job names the `main` ruleset requires:
`Lint, Type Check, Test, Build`, `Semgrep Security Scan` and `e2e`. Pushes to
`main` report the same jobs as `main: Lint, Type Check, Test, Build`,
`main: Semgrep Security Scan` and `main: e2e`, so AIOS can tell its main
checks from its PR checks; it matches checks by job name.

CI and E2E use Node 22 to match the application runtime. Semgrep fails on
findings; dependency audit fails at moderate severity or higher. Coverage
thresholds are defined in `vitest.config.ts`.

## Local parity

```bash
npm ci
npm audit --audit-level=moderate
npm run lint
npm run check
npm run test:coverage
npm run build
npm run semgrep:scan
npm run test:e2e
```

In CI, E2E runs against a disposable PostgreSQL service container, with the
schema created by `prisma db push`; it never uses the `DATABASE_URL` repository
secret. Export the database environment for local E2E runs as described in
`AGENTS.md`.
The honeypot test rejects the submission before email delivery; CI uses the
console email provider.

## Manual runs and maintenance

Use Actions → CI or E2E → Run workflow. Keep `package.json` scripts as the
validation contract. Dependabot updates GitHub Actions references through
`.github/dependabot.yml`; npm update policy lives in `renovate.json`.

When restoring shared workflows in the future, verify that the referenced
repository, tag and workflow files are accessible from this repository before
switching back to wrappers.
