# Flowlee Frontend

React single-page application built with Vite and TypeScript for the Flowlee platform. Features onboarding flows, OIDC authentication via Auth0, and a modular feature-based architecture.

## Prerequisites

- **Node.js** 20 or later
- **npm** (included with Node.js)

## Local Setup

```bash
# 1. Clone the repository
git clone git@github.com:flowlee/frontend.git
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables below)

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Vite dev server with HMR at `http://localhost:5173` |
| Build | `npm run build` | Type-check and build production bundle to `dist/` |
| Preview | `npm run preview` | Serve the production build locally for testing |

## Environment Variables

All variables are prefixed with `VITE_` and exposed to the client at build time.

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.flowlee.com` |
| `VITE_AUTH_AUTHORITY` | Auth0 tenant URL | `https://flowlee.us.auth0.com` |
| `VITE_AUTH_CLIENT_ID` | Auth0 application client ID | `aBcDeFgHiJkLmNoPqRsTuVwXyZ` |
| `VITE_AUTH_AUDIENCE` | Auth0 API audience identifier | `https://api.flowlee.com` |

See `.env.example` for a ready-to-copy template.

## Deployment

The application builds to static assets in `dist/` and is deployed to **AWS S3 + CloudFront** via a GitHub Actions pipeline. The pipeline deploys across four stages:

1. **flowlee-dev** — auto-deploys on merge to `main`
2. **flowlee-test** — manual approval required
3. **flowlee-preprod** — manual approval required
4. **flowlee-prod** — manual approval required

Each stage uses its own set of environment variables and AWS resources. See `docs/deployment.md` for full details on infrastructure, approval gates, and rollback procedures.
