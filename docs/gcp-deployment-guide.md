# Google Cloud Deployment Guide

This guide provides step-by-step instructions on how to take your repository (`https://github.com/sergeaudenaert/event-platform-poc`) and deploy it to Google Cloud Run using the included GitHub Actions CI/CD pipeline.

## Prerequisites
1. A Google Cloud account with an active billing linked.
2. The `gcloud` CLI installed locally ([Download Here](https://cloud.google.com/sdk/docs/install)), or you can use the Google Cloud Console in your browser.
3. Your code is pushed to your GitHub repository on the `main` branch.

---

## Step 1: Create a Google Cloud Project
1. Log into the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown near the top-left and select **New Project**.
3. Name your project (e.g., `event-platform-poc`).
4. Note your **Project ID**. You will need this later.

## Step 2: Enable Required APIs
You must enable the APIs that allow Cloud Run and the Container Registry to operate.
Using the Cloud Console search bar, find and enable the following:
- **Cloud Run API**
- **Cloud Build API**
- **Artifact Registry API** (or Container Registry API)

*(Alternatively, via CLI: `gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com`)*

## Step 3: Create a Cloud SQL PostgreSQL Database
Since the web app is containerized/stateless, you need a hosted Postgres database.
1. In the console, search for **SQL** and select **Create Instance**.
2. Choose **PostgreSQL**.
3. Set an **Instance ID** and a **Password** for the default `postgres` user. Keep this password safe.
4. Set the database version to **PostgreSQL 15**.
5. *Important for POC*: Choose a lightweight machine type (e.g., Shared core) to save costs.
6. Once the instance is created, go to the **Databases** tab inside the instance cover page, and create a new database explicitly named `eventsdb`.
7. Go to **Connections** > **Networking**:
   - Check **Public IP**.
   - Under **Authorized networks**, click **Add network**. Enter `0.0.0.0/0` (This allows global access for POC purposes. In production, use Cloud Run VPC Connectors).

**Construct your Database URL:**
Format: `postgresql://postgres:YOUR_PASSWORD@YOUR_DATABASE_PUBLIC_IP:5432/eventsdb?schema=public`

## Step 4: Create a Service Account for GitHub Actions
GitHub needs permission to push Docker images and deploy Cloud Run revisions on your behalf.
1. In the console, go to **IAM & Admin** > **Service Accounts**.
2. Click **Create Service Account**, name it `github-actions-deployer`, and click Create.
3. Grant this account the following roles:
   - **Cloud Run Admin**
   - **Service Account User**
   - **Storage Admin** (Legacy GCR) OR **Artifact Registry Writer**
4. Finish creating the account.
5. In the Service Accounts list, click the 3 dots next to your new account -> **Manage keys**.
6. **Add Key** -> **Create new key** -> **JSON**.
7. Keep this downloaded file extremely secure.

## Step 5: Configure GitHub Secrets
Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**. 
Click **New repository secret** and add exactly these four:

1. **`GCP_PROJECT_ID`**: 
   - Value: The Project ID noted in Step 1.
2. **`GCP_CREDENTIALS`**: 
   - Value: The raw, exact contents of the JSON file you downloaded in Step 4.
3. **`DATABASE_URL`**: 
   - Value: The connection string you constructed at the end of Step 3.
4. **`JWT_SECRET`**: 
   - Value: Any random, long, secure string of characters (e.g., `my-super-secret-key-39218d`).

## Step 6: Trigger the Deployment
Because your `.github/workflows/deploy-gcp.yml` is configured to run `on: push: branches: - main`, all you need to do is push a change to the `main` branch.

1. Once the secrets are in place, make a tiny commit (e.g., editing a README).
   ```bash
   git commit --allow-empty -m "Trigger Google Cloud Deployment"
   git push origin main
   ```
2. In GitHub, go to the **Actions** tab.
3. Watch the `Deploy to Google Cloud Run` action run. It will:
   - Build backend and frontend Docker containers natively.
   - Push them to the Google Container Registry.
   - Deploy backend to Cloud Run with the Secure Database and JWT Strings.
   - Deploy frontend to Cloud Run pointing to the new dynamic backend URL.

## Step 7: Database Initialization
When the backend first deploys via GitHub actions, Cloud Run boots the container which will execute our standard `docker-compose` startup command: `npx prisma db push && npm run seed && npm start`.
This will seamlessly format your fresh Cloud SQL database with the Prisma tables and immediately seed the default `admin@example.com` account!

**Visit the resulting Frontend Cloud Run URL provided at the end of the GitHub Action logs!**
