# Documentation

This folder is the documentation index for **profile-page**, a SvelteKit portfolio (home, about, projects, blog, contact) backed by PostgreSQL and Prisma.

New writing follows [Diataxis](https://diataxis.fr/): tutorials teach, how-tos get a job done, reference lists the facts, explanations say why.

## Start here

| If you want to…                           | Read                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Run the site for the first time           | [Tutorial: from clone to a working page](./tutorial-getting-started.md) |
| Edit bio, blog posts, or projects         | [How to manage content](./howto-manage-content.md)                      |
| Deliver contact-form mail in production   | [How to configure the contact form](./howto-configure-contact.md)       |
| Look up a route, env var, or schema field | [Application reference](./reference.md)                                 |
| Understand why there is no CMS or login   | [Why the site is built this way](./explanation-architecture.md)         |

## Also in this repo

| Document                                               | What it covers                                       |
| ------------------------------------------------------ | ---------------------------------------------------- |
| [README.md](../README.md)                              | Feature list, scripts, high-level structure          |
| [CLAUDE.md](../CLAUDE.md)                              | Commands and conventions for AI assistants           |
| [AGENTS.md](../AGENTS.md)                              | Cloud/local gotchas (`DATABASE_URL`, Postgres, Node) |
| [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)          | GitHub + Vercel deploy                               |
| [DATABASE_CONFIG.md](../DATABASE_CONFIG.md)            | Connection pooling by provider                       |
| [SECURITY.md](../SECURITY.md)                          | Vulnerability reporting                              |
| [CI-CD.md](./CI-CD.md)                                 | GitHub Actions → `ci-templates@v1.0.0`               |
| [OBSERVABILITY.md](./OBSERVABILITY.md)                 | OpenTelemetry → Grafana Cloud                        |
| [DEPENDENCY-MANAGEMENT.md](./DEPENDENCY-MANAGEMENT.md) | Dependabot + Renovate                                |
| [DESIGN_ASSETS.md](./DESIGN_ASSETS.md)                 | Keep large design zips out of git                    |
| [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md)           | Snapshot audit (2026-06-12)                          |
| [AI-WORKFLOW-PLAYBOOK.md](./AI-WORKFLOW-PLAYBOOK.md)   | Cursor vs Claude handoff                             |
| [BLUEPRINT-STATUS.md](./BLUEPRINT-STATUS.md)           | AI Engineering Blueprint progress                    |

## Diataxis map

```text
                  practical                         theoretical
                 ┌──────────────────────────────────────────────┐
  learning       │ Tutorial: getting started                    │
                 │ Explanation: architecture                    │
                 ├──────────────────────────────────────────────┤
  working        │ How-to: manage content                       │
                 │ How-to: configure contact                    │
                 │ Reference: routes, env, schema, APIs         │
                 └──────────────────────────────────────────────┘
```
