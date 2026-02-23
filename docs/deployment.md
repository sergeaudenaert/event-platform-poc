# Event Platform Deployment Guide

This guide covers deployment instructions for the Event Registration Platform.

## 1. Local Development (Docker Compose)
The easiest way to run the entire stack locally is utilizing Docker Compose.

1. Ensure Docker Desktop is running.
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. The platform components will be exposed on:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`
   - PostgresDB: `http://localhost:5432`

> The initialization creates an admin user automatically (`admin@example.com` / `admin123`).

## 2. CI/CD - Google Cloud Run
A GitHub Actions workflow is provided at `.github/workflows/deploy-gcp.yml`.

> 🚀 **For a full, step-by-step walkthrough from setting up your initial Google Cloud account to triggering the final deployment pipeline, please see: [docs/gcp-deployment-guide.md](./gcp-deployment-guide.md)**.

### Secrets Required in GitHub Repository
- `GCP_PROJECT_ID`: Your Google Cloud Project ID.
- `GCP_CREDENTIALS`: A service account JSON key with Cloud Run Admin, Service Account User, and Storage Admin (for Container Registry) roles.
- `DATABASE_URL`: Hosted PostgreSQL connection string (e.g. Google Cloud SQL).
- `JWT_SECRET`: Secure string for hashing JWT tokens.

## 3. CI/CD - Azure Container Apps
A GitHub Actions workflow is provided at `.github/workflows/deploy-azure.yml`.

### Secrets Required in GitHub Repository
- `AZURE_CREDENTIALS`: Output of `az ad sp create-for-rbac --sdk-auth` with Contributor role over your resource group.
- `AZURE_REGISTRY_NAME`: The name of your Azure Container Registry.
- `AZURE_APP_DOMAIN`: The Container App Environment domain suffix (usually provided by ACA).
- `DATABASE_URL`: Hosted PostgreSQL connection string (e.g. Azure Database for PostgreSQL).
- `JWT_SECRET`: Secure string for hashing tokens.
