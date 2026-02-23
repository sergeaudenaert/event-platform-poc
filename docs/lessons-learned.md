# Technical Memo: Lessons Learned & Troubleshooting Summary

This document outlines the key initial setup mistakes, build failures, and runtime bugs encountered during the containerization and integration of the Event Platform POC (Next.js 14, Node/Express, PostgreSQL, Prisma), along with their resolutions. 

Reference this memo for future projects to avoid these common pitfalls.

---

## 1. Next.js App Router: Server Components vs. Client Components in Docker
**The Mistake:** 
Attempting to fetch API data from `http://localhost:4000/api` inside a default Next.js Server Component (e.g., `src/app/page.tsx`).

**The Problem:** 
When running in an isolated Docker container, `localhost` refers to the *frontend* container itself, not the host machine. The server-side code could not reach the *backend* container, causing silent fetch failures and rendering empty states ("No events found").

**The Fix:**
- **Option A (What we did):** Convert the component to a Client Component using `"use client";` at the top of the file, and manage state with `useEffect`. Client components fetch data from the user's physical web browser, which correctly resolves `localhost:4000` to the Docker host's exposed port.
- **Option B (Alternative for Server Components):** Use the Docker compose service name for internal routing: `http://backend:4000/api` when fetching on the server.

---

## 2. Next.js App Router: Accessing Dynamic URL Parameters
**The Mistake:** 
Passing and extracting `params` directly as a prop inside a dynamically routed Client Component (`src/app/events/[id]/page.tsx`).

**The Problem:** 
In Next.js 14 App Router, dynamic `params` handling within Client Components can cause type errors or "Event not found" issues if the `id` is evaluated as a Promise or unavailable during the initial render lifecycle on the client.

**The Fix:** 
Import and utilize the `useParams()` hook from `next/navigation`. This ensures the dynamic segments are safely and reactively extracted on the client.
```tsx
import { useParams } from 'next/navigation';
// ... inside component:
const params = useParams();
const id = params?.id as string;
```

---

## 3. Prisma ORM: Alpine Linux Compatibility
**The Mistake:** 
Using `node:20-alpine` as the base Docker image without accounting for Prisma's native engine dependencies.

**The Problem:** 
Prisma's Query Engine relies on OpenSSL and C standard libraries (`glibc`). Alpine Linux uses `musl` libc. When the container boots, Prisma crashes with "failed to detect the libssl/openssl version".

**The Fix:**
1. Explicitly install `openssl` via the package manager in all Alpine Dockerfile stages: `RUN apk add --no-cache openssl`.
2. Explicitly define the Alpine architecture in `schema.prisma` under the generator block:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl", "linux-musl-openssl-3.0.x"]
}
```

---

## 4. Prisma ORM: Database Initialization Logic
**The Mistake:** 
Configuring `docker-compose.yml` to run `npx prisma migrate deploy && npm run seed` on startup for a fresh database without pre-generated migration files.

**The Problem:** 
`migrate deploy` applies existing migration histories from the `prisma/migrations` folder. Since we didn't use `migrate dev` locally to generate these folders, the tool found "No pending migrations", resulting in the seed script crashing because the actual database tables (`User`, `Event`) didn't exist yet.

**The Fix:** 
For rapid prototyping or local environments lacking a migration history, use `npx prisma db push`. This command forcefully syncs the Prisma schema state directly to the database, creating the tables immediately so the subsequent `seed` script succeeds.

---

## 5. TypeScript & Express.js: Strict Typing on HTTP Requests 
**The Mistake:** 
Assuming `req.params.id` or `req.query.eventId` are always plain strings in a strict TypeScript environment.

**The Problem:** 
In Express definitions, query parameters can technically be arrays (`string | string[] | QueryString.ParsedQs | QueryString.ParsedQs[]`). Assigning these dynamically into Prisma queries (which strictly expect a `string`) causes `tsc` compilation to fail during the Docker `npm run build` step.

**The Fix:** 
Explicitly cast parameters to strings before usage when building the routes:
```typescript
const id = req.params.id as string;
const eventId = req.query.eventId as string;
```
