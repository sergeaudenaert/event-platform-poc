Here's your specification document, structured across 10 sections:

**What's covered:**

1. **Project Overview** — goals, scope, and what's explicitly out of scope
2. **Application Features** — public event listing with 4 seeded demo events, full registration flow (account creation, login, duplicate blocking), user account page, and management interface with Excel export
3. **Data Model** — Users, Events, Registrations with constraints and seed requirements
4. **Codebase Requirements** — GitHub private repo structure, monorepo layout (`/frontend`, `/backend`, `/db`, `/docker`, `/.github/workflows`, `/docs`)
5. **Technology Stack** — Next.js + Tailwind + shadcn/ui, Node/Express, PostgreSQL + Prisma, exceljs, Docker Compose
6. **Deployment** — Two GitHub Actions workflows (`deploy-gcp.yml`, `deploy-azure.yml`), plus a full table of required GitHub secrets and step-by-step instructions expected in `/docs/deploy-gcp.md` and `/docs/deploy-azure.md`
7. **Non-Functional Requirements** — responsiveness, API docs, security basics, logging
8. **Acceptance Criteria** — 10 concrete, verifiable checkboxes
9. **Suggested Prompt** — a ready-to-paste prompt for Firebase Studio to kickstart generation
10. **Contact & Repository** — your GitHub account, repo name, and preferred cloud regions (Belgium/West Europe)