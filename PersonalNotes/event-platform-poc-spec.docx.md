

**PROJECT SPECIFICATION**

Online Event Platform — Proof of Concept

*Built with Google Firebase Studio (Antigravity)*

| Document version | 1.0 — Draft for review |
| :---- | :---- |
| **Prepared for** | Google Antigravity / Firebase Studio |
| **GitHub account** | serge\_audenaert@yahoo.com |
| **Date** | 19 February 2026 |
| **Classification** | Confidential |

# **1\. Project Overview**

This document specifies a Proof of Concept (POC) for a deployable online event registration platform. The application is intended to demonstrate end-to-end functionality, from public-facing event discovery and attendee registration to internal management tooling. The POC is to be generated using Google Firebase Studio (Antigravity) and must be production-deployable to both Google Cloud and Microsoft Azure via a GitHub-based CI/CD pipeline.

## **1.1 Goals**

* Demonstrate a working online event platform with realistic demo data

* Validate Firebase Studio's ability to generate full-stack, containerized applications

* Establish a repeatable deployment pattern across two cloud providers

* Showcase end-to-end: public registration → database persistence → management export

## **1.2 Out of Scope**

* Payment processing or paid ticketing

* Email notifications or communication workflows

* Multi-language support

* Production-grade security hardening (this is a POC)

# **2\. Application Features**

## **2.1 Public-Facing Event Platform**

The application must present a clean, modern event listing page accessible without login. The page should display at least four (4) demo events with realistic content across different categories.

**Demo Events (minimum)**

* AI & the Future of Work — full-day conference, Brussels, 200 seats

* Sustainability in Manufacturing — half-day workshop, Ghent, 50 seats

* Digital Transformation Masterclass — online webinar, unlimited seats

* Agoria Tech Summit 2025 — multi-day event, Antwerp Expo, 500 seats

**Event Card — displayed fields**

* Event title, category tag, short description

* Date, time, location (physical or online)

* Available seats / total capacity

* Register button (CTA)

## **2.2 Attendee Registration Flow**

Users who click 'Register' on an event must go through the following flow:

* Step 1 — Account creation: first name, last name, email address, password (min. 8 chars), company name (optional)

* Step 2 — Existing users: login with email \+ password instead of re-registering

* Step 3 — Event confirmation screen showing event details and a registration reference number

* A user may register for multiple events; duplicate registrations for the same event should be blocked with a clear error message

## **2.3 User Account**

* Authenticated users can view 'My Registrations' — a list of events they are registered for

* Users can cancel a registration (seat is returned to pool)

* Password reset via email token (basic implementation acceptable for POC)

## **2.4 Management Interface**

A separate, authenticated management area accessible only to admin accounts. The management interface must include the following sections:

**Event Management**

* List all events with registration count vs. capacity

* Create a new event (all fields editable)

* Edit an existing event

* Toggle event status: Draft / Published / Cancelled

**Attendee Management**

* View all registrations per event in a searchable, sortable table

* Columns: name, email, company, registration date, status

* Cancel a registration on behalf of an attendee

* Search by name or email across all events

**Excel Export**

* Export registrations for a selected event to .xlsx format

* Export all registrations across all events to a single .xlsx with one sheet per event

* Exported columns: Event Name, First Name, Last Name, Email, Company, Registration Date, Status

# **3\. Data Model**

The application must persist all data in a relational or document database (see Section 5 for technology choice). The following entities and relationships are required:

| Component | Specification |
| :---- | :---- |
| Entity: User | id, email (unique), password\_hash, first\_name, last\_name, company, role (attendee | admin), created\_at |
| Entity: Event | id, title, description, category, location, starts\_at, ends\_at, capacity, status (draft | published | cancelled), created\_at, updated\_at |
| Entity: Registration | id, user\_id (FK), event\_id (FK), registered\_at, status (confirmed | cancelled), reference\_number (unique, human-readable) |
| Constraint | Unique constraint on (user\_id, event\_id) — one registration per user per event |
| Seed data | At least 4 demo events and 1 admin account must be seeded on first run |

# **4\. Codebase Requirements**

## **4.1 Repository**

| Component | Specification |
| :---- | :---- |
| Platform | GitHub — private repository |
| Account | serge\_audenaert@yahoo.com |
| Repository name | event-platform-poc (suggested) |
| Default branch | main |
| Branch strategy | main (production), dev (development), feature/\* branches for new work |

## **4.2 Repository Structure**

The repository must be structured as a monorepo with clear separation of concerns:

* /frontend — UI application (React or Next.js recommended)

* /backend — API server (Node.js / Express or FastAPI)

* /db — Database migrations and seed scripts

* /docker — Dockerfiles and docker-compose.yml

* /.github/workflows — CI/CD pipeline definitions

* /docs — Deployment guides (see Section 6\)

* /scripts — Utility scripts (export, seeding, etc.)

* README.md — Quick-start guide at root level

## **4.3 Containerization**

The entire application stack must be containerized using Docker. A docker-compose.yml at the root must allow any developer to run the full application locally with a single command:

| Component | Specification |
| :---- | :---- |
| Command | docker compose up \--build |
| Services | frontend, backend (API), database, (optional) reverse proxy |
| Database | PostgreSQL 16 (recommended) or MongoDB 7 |
| Environment config | All secrets via .env file; .env.example provided in repo |
| Port mapping | Frontend: 3000, Backend API: 4000, DB: 5432 (or 27017\) |
| Healthchecks | All services must define Docker healthchecks |
| Volume | Named volume for database persistence across restarts |

# **5\. Technology Stack**

Firebase Studio should select appropriate technologies. The following are recommendations; deviations are acceptable if justified by the generated output:

| Component | Specification |
| :---- | :---- |
| Frontend | React 18+ with Next.js 14 (App Router) or Vite — TypeScript preferred |
| UI Components | shadcn/ui or Tailwind CSS for clean, responsive design |
| Backend | Node.js with Express or Fastify; alternatively Python FastAPI |
| Authentication | JWT-based sessions; bcrypt for password hashing |
| Database | PostgreSQL 16 with Prisma ORM (or Drizzle); alternatively MongoDB with Mongoose |
| Excel Export | exceljs (Node.js) or openpyxl (Python) |
| Containerization | Docker \+ Docker Compose v2 |
| CI/CD | GitHub Actions |
| Cloud targets | Google Cloud Run (GCP) and Azure Container Apps (ACA) |

# **6\. Deployment**

## **6.1 CI/CD Pipeline (GitHub Actions)**

Two separate GitHub Actions workflow files must be provided in /.github/workflows/:

| Component | Specification |
| :---- | :---- |
| deploy-gcp.yml | Triggered on push to main. Builds Docker images, pushes to Google Artifact Registry, deploys to Google Cloud Run. |
| deploy-azure.yml | Triggered on push to main. Builds Docker images, pushes to Azure Container Registry, deploys to Azure Container Apps. |
| Secrets required | Stored as GitHub repository secrets — see Section 6.4 |

## **6.2 Google Cloud Deployment**

The /docs/deploy-gcp.md file must provide step-by-step instructions covering:

* Prerequisites: gcloud CLI installed and authenticated, project created

* Enable required APIs: Cloud Run, Artifact Registry, Cloud SQL

* Create Artifact Registry repository for Docker images

* Set up Cloud SQL (PostgreSQL) instance and retrieve connection string

* Configure GitHub secrets: GCP\_PROJECT\_ID, GCP\_SA\_KEY (service account JSON), GCP\_REGION

* First-time deployment command sequence

* How to trigger subsequent deployments (push to main)

* How to access the deployed application URL

## **6.3 Azure Deployment**

The /docs/deploy-azure.md file must provide step-by-step instructions covering:

* Prerequisites: Azure CLI installed and authenticated, subscription active

* Create Resource Group, Container Registry, and Container Apps Environment

* Set up Azure Database for PostgreSQL (Flexible Server)

* Configure GitHub secrets: AZURE\_CREDENTIALS (service principal JSON), AZURE\_SUBSCRIPTION\_ID, AZURE\_RG, ACR\_LOGIN\_SERVER, ACR\_USERNAME, ACR\_PASSWORD

* First-time deployment command sequence

* How to trigger subsequent deployments (push to main)

* How to access the deployed application URL

## **6.4 Required GitHub Secrets**

| Secret Name | Cloud | Description |
| :---- | :---- | :---- |
| GCP\_PROJECT\_ID | GCP | Google Cloud project identifier |
| GCP\_SA\_KEY | GCP | Service account key JSON (base64) |
| GCP\_REGION | GCP | Deployment region (e.g. europe-west1) |
| AZURE\_CREDENTIALS | Azure | Service principal JSON for az login |
| AZURE\_SUBSCRIPTION\_ID | Azure | Azure subscription GUID |
| AZURE\_RG | Azure | Resource group name |
| ACR\_LOGIN\_SERVER | Azure | Container Registry login server URL |
| ACR\_USERNAME | Azure | Container Registry username |
| ACR\_PASSWORD | Azure | Container Registry password |
| DATABASE\_URL | Both | Full DB connection string (set per environment) |
| JWT\_SECRET | Both | Random 256-bit secret for JWT signing |

# **7\. Non-Functional Requirements**

| Component | Specification |
| :---- | :---- |
| Responsiveness | Application must be usable on desktop and mobile (min. 375px viewport) |
| Loading time | Initial page load under 3 seconds on a standard connection |
| Accessibility | Basic WCAG 2.1 AA compliance for public pages |
| API | RESTful JSON API; all endpoints documented in /docs/api.md or via Swagger/OpenAPI |
| Error handling | Friendly error messages on all forms; HTTP errors returned as structured JSON |
| Logging | Application logs to stdout (Docker-compatible); no file-based logging |
| Security basics | Passwords hashed (bcrypt, cost ≥ 12); JWT expiry 24h; admin routes protected by role check |

# **8\. Acceptance Criteria**

The POC is considered complete when ALL of the following can be verified:

* A visitor can browse events without logging in

* A new user can create an account and register for an event in under 3 minutes

* An existing user can log in and see their registrations

* Registering twice for the same event shows a clear error

* An admin can log into the management interface

* An admin can create a new event and see it appear on the public page

* An admin can export registrations for an event as a valid .xlsx file

* docker compose up \--build starts the full application locally

* A push to the main branch triggers the GitHub Actions pipeline

* The application is accessible at a public URL on both GCP and Azure after deployment

# **9\. Suggested Prompt for Firebase Studio**

Use the following prompt (or a refined version) when initiating the project in Google Firebase Studio / Antigravity:

| Build a full-stack, containerized online event registration platform as a monorepo. Frontend: Next.js 14 (App Router) with Tailwind CSS and shadcn/ui. Backend: Node.js \+ Express REST API. Database: PostgreSQL with Prisma ORM. Authentication: JWT with bcrypt. Excel export: exceljs library. Seed 4 demo events and 1 admin account. Include: public event listing, user registration \+ login, event registration flow, management dashboard (CRUD events, view/cancel registrations, .xlsx export). Containerize with Docker Compose (services: frontend :3000, backend :4000, postgres :5432). Provide GitHub Actions workflows for Cloud Run (GCP) and Azure Container Apps deployment. Store all secrets as environment variables. Document deployment steps in /docs/. |
| :---- |

# **10\. Contact & Repository**

| Component | Specification |
| :---- | :---- |
| GitHub account | serge\_audenaert@yahoo.com |
| Repository visibility | Private |
| Repository name (suggested) | event-platform-poc |
| Primary cloud region (GCP) | europe-west1 (Belgium) |
| Primary cloud region (Azure) | West Europe (Netherlands) |

*This document should be committed to the repository root as SPECIFICATION.md or SPECIFICATION.docx for reference throughout development.*