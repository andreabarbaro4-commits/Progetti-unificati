# Deployment Guide

## Stages

The Flowlee frontend is deployed across four stages, each with its own AWS account/environment and domain.

| Stage | Domain | Purpose | Deploy Trigger |
|-------|--------|---------|----------------|
| flowlee-dev | dev.flowlee.com | Development | Auto on push to main |
| flowlee-test | test.flowlee.com | QA/Testing | Manual approval |
| flowlee-preprod | preprod.flowlee.com | Pre-production validation | Manual approval |
| flowlee-prod | app.flowlee.com | Production | Manual approval |

---

## CDK Stack Resources

Each stage deploys the following AWS resources via CDK (`infra/lib/frontend-stack.ts`):

- **S3 Bucket** — Stores the built static assets (`dist/`). Configured with `BlockPublicAccess.BLOCK_ALL` and S3-managed encryption (SSE-S3). Bucket name follows the pattern `flowlee-{stage}-frontend-assets`. Removal policy set to RETAIN.

- **CloudFront Distribution** — CDN that serves the SPA globally. Configured with HTTPS redirect, default root object `index.html`, and custom error responses for SPA routing (see below). Domain names and TLS certificate are attached per stage.

- **Origin Access Control (OAC)** — Secures the S3 origin so that only CloudFront can read from the bucket. Uses SigV4 signing with `signingBehavior: always`.

- **Bucket Policy** — Grants read access exclusively to the CloudFront distribution via OAC. Direct S3 access is denied.

- **ACM Certificate** — TLS certificate provisioned in `us-east-1` (required for CloudFront) with DNS validation via Route 53. Each stage has its own certificate matching its domain.

- **Route 53 A + AAAA Alias Records** — DNS records that point the stage domain to the CloudFront distribution. Both IPv4 (A) and IPv6 (AAAA) alias records are created in the hosted zone.

**Stack Outputs:**
- `DistributionDomain` — CloudFront distribution domain name
- `BucketName` — S3 bucket name for deployments

---

## GitHub Actions Pipeline

The CI/CD pipeline is defined in `.github/workflows/deploy.yml` and executes in the following order:

### 1. Build

- Triggers on push to `main` branch
- Checks out the repository
- Sets up Node.js 20
- Runs `npm ci` for deterministic dependency installation
- Runs `npm run build` with dev-stage environment variables
- Uploads the `dist/` directory as a build artifact

### 2. Deploy Dev (`flowlee-dev`)

- Depends on: Build
- Environment: `flowlee-dev`
- Downloads the build artifact
- Syncs `dist/` to the dev S3 bucket (`aws s3 sync dist/ s3://$S3_BUCKET --delete`)
- Creates a CloudFront cache invalidation (`aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*"`)
- **No approval required** — deploys automatically on every push to main

### 3. Deploy Test (`flowlee-test`)

- Depends on: Deploy Dev
- Environment: `flowlee-test` (with protection rules)
- **Requires manual approval** before execution
- Rebuilds with test-stage `VITE_` environment variables
- Syncs to test S3 bucket and invalidates CloudFront cache

### 4. Deploy Preprod (`flowlee-preprod`)

- Depends on: Deploy Test
- Environment: `flowlee-preprod` (with protection rules)
- **Requires manual approval** before execution
- Rebuilds with preprod-stage `VITE_` environment variables
- Syncs to preprod S3 bucket and invalidates CloudFront cache

### 5. Deploy Prod (`flowlee-prod`)

- Depends on: Deploy Preprod
- Environment: `flowlee-prod` (with protection rules)
- **Requires manual approval** before execution
- Rebuilds with production `VITE_` environment variables
- Syncs to prod S3 bucket and invalidates CloudFront cache

Each deploy stage fails and halts on any non-zero exit code. No subsequent stage runs if a prior stage fails.

---

## Approval Gates

Transitions between stages require explicit human approval, configured via GitHub Environment protection rules.

| Transition | Approval Required | Approvers | Timeout |
|------------|-------------------|-----------|---------|
| dev → test | Yes | Team leads / authorized approvers | 72 hours |
| test → preprod | Yes | Team leads / authorized approvers | 72 hours |
| preprod → prod | Yes | Team leads / authorized approvers | 72 hours |

**Rules:**
- Each environment's protection rules define which GitHub users or teams can approve deployments.
- If no approval is given within **72 hours**, the pending deployment is automatically cancelled.
- Approvers should verify the previous stage is functioning correctly before approving promotion.
- The `flowlee-dev` stage does **not** require approval — it deploys automatically on push to `main`.

---

## Rollback Procedures

If a deployment introduces issues, roll back using one of the following methods:

### Option A: Redeploy via Pipeline (Preferred)

1. Identify the last known-good commit on `main`.
2. Create a revert commit or re-run the pipeline from that commit.
3. The pipeline will rebuild and redeploy the previous good version through the normal stage progression.
4. For urgent rollbacks to production, approvers can fast-track approvals through each gate.

### Option B: Manual Rollback

For each stage:

1. **Identify the previous build artifact** — locate the last successful build in GitHub Actions artifacts or a backup.
2. **Sync to S3:**
   ```bash
   aws s3 sync ./previous-dist/ s3://flowlee-{stage}-frontend-assets --delete
   ```
3. **Invalidate CloudFront cache:**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id <DISTRIBUTION_ID> \
     --paths "/*"
   ```
4. Cache invalidation typically completes within 1–2 minutes. Until complete, some users may still see the problematic version.

### Stage-Specific Notes

| Stage | Rollback Urgency | Notes |
|-------|------------------|-------|
| flowlee-dev | Low | Redeploy via pipeline; push a fix to main |
| flowlee-test | Medium | Manual sync or re-run pipeline from previous commit |
| flowlee-preprod | Medium–High | Manual sync recommended for speed; verify before promoting to prod |
| flowlee-prod | Critical | Manual sync for immediate relief, then pipeline fix for permanence |

---

## CloudFront SPA Routing

The CloudFront distribution is configured with custom error responses to support client-side routing in the single-page application:

| HTTP Status | Response Page Path | Response HTTP Status | TTL |
|-------------|-------------------|---------------------|-----|
| 403 | `/index.html` | 200 | 0 seconds |
| 404 | `/index.html` | 200 | 0 seconds |

### Why This Is Needed

The Flowlee frontend is a single-page application (SPA) that uses React Router for client-side routing. When a user navigates to a route like `/dashboard` or `/auth/callback`, there is no corresponding file on S3 — only `index.html` and hashed asset files exist in the bucket.

Without custom error responses:
- A direct request to `https://app.flowlee.com/dashboard` would result in S3 returning a 403 (access denied, since the key doesn't exist and public access is blocked) or 404.
- The user would see a CloudFront error page instead of the application.

With custom error responses:
- CloudFront intercepts the 403/404 from S3 and serves `/index.html` with a 200 status.
- The browser loads the SPA, React Router reads the URL path, and renders the correct view.
- TTL is set to 0 seconds to ensure routing changes take effect immediately without caching stale error responses.

### CDK Configuration

```typescript
errorResponses: [
  {
    httpStatus: 403,
    responseHttpStatus: 200,
    responsePagePath: '/index.html',
    ttl: cdk.Duration.seconds(0),
  },
  {
    httpStatus: 404,
    responseHttpStatus: 200,
    responsePagePath: '/index.html',
    ttl: cdk.Duration.seconds(0),
  },
],
```


---

## CORS Configuration

> **Note:** CORS enforcement is a backend API Gateway concern. The frontend does not configure or enforce CORS directly. This section documents the required CORS settings that must be applied to the backend API Gateway for each stage so that the frontend can communicate with the API successfully.

### Per-Stage Origin Mapping

Each stage's API Gateway must whitelist exactly one origin — the frontend domain for that stage. No wildcards or multi-origin policies are permitted.

| Stage | Frontend Origin |
|-------|----------------|
| flowlee-dev | `https://dev.flowlee.com` |
| flowlee-test | `https://test.flowlee.com` |
| flowlee-preprod | `https://preprod.flowlee.com` |
| flowlee-prod | `https://app.flowlee.com` |

### Required CORS Headers

The API Gateway for each stage must return the following headers on all responses (including preflight OPTIONS responses):

| Header | Value | Notes |
|--------|-------|-------|
| `Access-Control-Allow-Origin` | Single stage origin (see table above) | Must match exactly one origin per stage; no wildcards |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, PATCH, DELETE, OPTIONS` | All methods used by the frontend API client |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` | Content-Type for JSON payloads; Authorization for Bearer tokens |
| `Access-Control-Max-Age` | `3600` | Browsers cache preflight responses for 1 hour, reducing OPTIONS request frequency |

### Preflight Behavior

- When a preflight `OPTIONS` request is received from the configured stage origin, the API Gateway must respond with all CORS headers listed above and a `200` status.
- If a request arrives from an origin that does not match the configured stage domain, the API Gateway must omit the `Access-Control-Allow-Origin` header from the response (the browser will block the request client-side).

### Deployment Checklist

When deploying a new stage or updating CORS configuration:

- [ ] Verify the stage's frontend domain is set in the API Gateway CORS configuration
- [ ] Confirm `Access-Control-Allow-Origin` is set to the exact stage origin (no trailing slash)
- [ ] Confirm `Access-Control-Allow-Methods` includes all six methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- [ ] Confirm `Access-Control-Allow-Headers` includes `Content-Type` and `Authorization`
- [ ] Confirm `Access-Control-Max-Age` is set to `3600`
- [ ] Test a preflight OPTIONS request from the frontend origin and verify a 200 response with correct headers
- [ ] If the frontend domain configuration is missing or empty, the deployment must fail with an error indicating the missing origin configuration


---

## Auth0 Redirect URI Registration

Each stage requires two redirect URIs registered in the Auth0 application configuration:

1. **Login Redirect URI** — where Auth0 sends the user after successful authentication
2. **Post-Logout Redirect URI** — where Auth0 sends the user after logout

### Per-Stage Redirect URIs

| Stage | Login Redirect URI | Post-Logout Redirect URI |
|-------|-------------------|--------------------------|
| dev | https://dev.flowlee.com/auth/callback | https://dev.flowlee.com |
| test | https://test.flowlee.com/auth/callback | https://test.flowlee.com |
| preprod | https://preprod.flowlee.com/auth/callback | https://preprod.flowlee.com |
| prod | https://app.flowlee.com/auth/callback | https://app.flowlee.com |

### URI Format

- **Login Redirect URI:** `https://{stage_domain}/auth/callback`
- **Post-Logout Redirect URI:** `https://{stage_domain}`

The login redirect URI must match the `redirect_uri` parameter used by `oidc-client-ts` in the frontend auth module. The post-logout redirect URI must match the `post_logout_redirect_uri` passed to `signoutRedirect()`.

### New Stage Deployment Checklist

When deploying to a new stage, complete the following steps in order:

1. Deploy the CDK stack → note the `FrontendDomain` output
2. Register the login redirect URI in the Auth0 application settings (Allowed Callback URLs)
3. Register the post-logout redirect URI in the Auth0 application settings (Allowed Logout URLs)
4. Add the stage domain to Auth0's Allowed Web Origins for silent refresh support
5. Verify CORS origin is configured for the new stage domain
6. Test full auth flow (login → callback → logout)

> **Note:** If the redirect URIs are not registered before testing, Auth0 will reject the authentication request with a `redirect_uri mismatch` error. Always register URIs before running the first deployment verification.
