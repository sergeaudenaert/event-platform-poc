# End-to-End Workflow: Local Development to Google Cloud

This document explains the full journey of our code: from writing it on your local computer using the Antigravity assistant, pushing it to GitHub, and having GitHub automatically securely deploy it to the live internet on Google Cloud.

---

## Part 1: The Three Environments
To understand how the workflow functions, it helps to understand the three distinct "computers" involved in our setup:

1. **Local Environment (Your Mac)**: Where you and the AI assistant (Antigravity) write code, run testing servers (like `docker-compose up`), and verify changes on `localhost:3000`.
2. **Source Control (GitHub)**: The central vault that permanently stores the "official" version of your codebase, tracks every change made over time (Git commits), and hosts the automation robot (GitHub Actions).
3. **Production Hosting (Google Cloud)**: The live, public-facing servers (Cloud Run and Cloud SQL) where your real users visit your website.

---

## Part 2: How We Connected Them Together

The pipeline we built acts as a secure bridge from GitHub to Google Cloud. Here is exactly what we did and what each step meant:

### 1. Enabling Google Cloud APIs
By default, Google Cloud projects are empty shells to prevent you from being billed accidentally. We had to manually turn on three internal servers to accept our application:
- **Cloud Run API**: To host the Next.js and Node.js code.
- **Artifact Registry API**: To act as a specialized Google Drive folder that only stores Docker Image files.
- **Cloud Build API**: To power the engine that converts our code into Docker Images.

### 2. Creating the Production Database (Cloud SQL)
Unlike your local computer which stores database files on your hard drive, Cloud Run is "stateless" (it destroys itself when no one is visiting your website to save money). Therefore, we needed a permanent, publicly accessible PostgreSQL database instance on Google's specialized database servers to store user registrations permanently. We exposed its network to `0.0.0.0/0` so that GitHub and Cloud Run could reach it via the unique IP address.

### 3. Creating the Service Account (The "Robot Passport")
GitHub needs permission to upload things to your Google Cloud project. Instead of giving GitHub your personal Google username and password (which is highly insecure), we created a strict "Service Account" named `github-deployer`. 
- We only gave this robot the 3 exact permissions it needed: Administer Cloud Run, Act as a Service Account, and Write to the Artifact Registry.
- We downloaded the `JSON Key` for this robot. This key acts as the unguessable password that GitHub uses to prove it is authorized to talk to Google on your behalf.

### 4. Storing GitHub Secrets
Inside GitHub's settings, we saved 4 pieces of highly sensitive information (`GCP_PROJECT_ID`, `DATABASE_URL`, `GCP_CREDENTIALS` (the JSON key), and `JWT_SECRET`). 
By saving these as "Secrets", GitHub injects them blindly into the build process without ever showing them to anyone viewing the repository's code, keeping your database passwords completely safe.

### 5. Writing the Pipeline File (`deploy-gcp.yml`)
The engine behind everything is the file we placed at `.github/workflows/deploy-gcp.yml`. This file tells GitHub: "Every single time Serge pushes new code to the `main` branch, boot up a temporary Ubuntu server, log into Google using the JSON key, build the code into Docker Containers, upload them, and update the live website."

---

## Part 3: Your Daily Developer Workflow

Now that the entire pipeline is built, pushing code changes is incredibly easy. 

Whenever you ask Antigravity to build a new feature (such as adding a "Password Reset" page), Antigravity will edit the files directly on your local Mac. You can test these out by visiting `http://localhost:3000`.

When you confirm the new feature works perfectly locally, follow these 3 steps to deploy it to the world:

### Step 1: Stage the Changes
Tell Git to prepare all the files that Antigravity recently modified:
```bash
git add .
```

### Step 2: Commit the Changes
Take a "snapshot" of the prepared files and give it a descriptive name so you remember what you changed:
```bash
git commit -m "Added password reset functionality"
```

### Step 3: Push to GitHub
Upload all the new commits from your local Mac to the central GitHub repository vault:
```bash
git push origin main
```

### What Happens Automatically Next?
The moment you hit Enter on Step 3, the following happens entirely in the background:
1. GitHub receives the new code at `origin main`.
2. The GitHub Actions robot wakes up and reads the `.github/workflows/deploy-gcp.yml` file.
3. It packages your new feature into updated Docker Containers.
4. It uses the JSON key to log into Google Cloud.
5. It uploads the new containers to the Artifact Registry.
6. It tells Cloud Run: "Swap out the old website for this brand new one!"
7. Approximately 3 minutes later, your users see the "Password Reset" page live on your `.a.run.app` domain.
