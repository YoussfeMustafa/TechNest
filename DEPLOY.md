# Deploy TechNest to Vercel

TechNest is deployed as two Vercel projects from this repository: an Express
serverless API from `backend` and a Next.js site from `frontend`. The backend
uses the existing Neon PostgreSQL database.

## 1. Deploy the backend project

1. In Vercel, choose **Add New... → Project** and import `YoussfeMustafa/TechNest`.
2. Name the project (for example, `technest-api`).
3. In **Configure Project**, set **Root Directory** to `backend`.
4. Set **Framework Preset** to **Other**.
5. Set **Build Command** to `npx prisma generate`.
6. Set **Output Directory** to `public`.
7. Leave the install command at its default (`npm install`).
8. Add the backend environment variables below under **Environment Variables**.
   Add them to **Production** (and Preview too if you want preview deployments
   to connect to the same services). Use your real Neon connection string and
   newly generated JWT secrets; do not put secret values in this repository.
9. Deploy. Copy the resulting backend deployment URL, without a trailing slash.

### Backend environment variables

| Name | Value | Required |
| --- | --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string for TechNest | Yes |
| `JWT_SECRET` | Long, random access-token signing secret | Yes |
| `JWT_REFRESH_SECRET` | Different long, random refresh-token signing secret | Yes |
| `NODE_ENV` | `production` | Yes |
| `CLIENT_URL` | Frontend Vercel URL, with no trailing slash | Yes; set after step 2, then redeploy |
| `BASE_URL` | Backend Vercel URL, with no trailing slash | Yes for generated upload and docs URLs |
| `UPLOAD_DIR` | `/tmp/uploads` | Yes |
| `JWT_EXPIRES_IN` | `15m` | Optional; defaults to `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Optional; defaults to `7d` |
| `PORT` | Not needed on Vercel; local default is `5000` | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | Optional; Stripe charging is not implemented by the current checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Optional; no webhook is currently configured |

Vercel supplies its own `VERCEL` environment variable. The API uses it to put
uploads in `/tmp/uploads`, the only writable location available to the function.
Files in `/tmp` are temporary and may disappear when the serverless instance is
recycled; uploaded files are **not persistent**. Use object storage for durable
uploads.

## 2. Deploy the frontend project

1. In Vercel, choose **Add New... → Project** and import the same repository
   again as a separate project (for example, `technest-store`).
2. Set **Root Directory** to `frontend`.
3. Confirm **Framework Preset** is **Next.js**.
4. Add the frontend environment variables below.
5. Set `NEXT_PUBLIC_API_URL` to the backend URL copied in step 1, followed by
   `/api/v1` (for example,
   `https://your-backend-project.vercel.app/api/v1`).
6. Deploy and copy the resulting frontend deployment URL, without a trailing
   slash.

### Frontend environment variables

| Name | Value | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://<backend-project>.vercel.app/api/v1` | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Optional; not used for live card processing by the current checkout |

## 3. Connect the deployed frontend to the API

1. Open the backend project in Vercel and go to **Settings → Environment
   Variables**.
2. Set `CLIENT_URL` to the exact frontend production URL copied in step 2,
   without a trailing slash.
3. Confirm `BASE_URL` is the exact backend project URL, without `/api`.
4. Redeploy the latest backend deployment so the CORS allowlist uses the
   production frontend URL.
5. Open the frontend URL and test browsing, login, guest-cart merging,
   checkout, orders, and profile pages.

The deployment order is important: deploy the backend first, copy its URL into
the frontend's `NEXT_PUBLIC_API_URL`, deploy the frontend, then copy the
frontend URL into the backend's `CLIENT_URL` and redeploy the backend.

The API is available at `/api/v1/*`; `/health` and `/api/docs` are also routed
to the Express application. The refresh cookie is HttpOnly and is sent with
credentialed requests. A refresh-token body fallback is also used if a browser
blocks cross-site cookies.

## Local environment and security

Use `backend/.env.example` and `frontend/.env.example` as templates for local
development. Never commit `.env` files. Production startup fails immediately
if `DATABASE_URL`, `JWT_SECRET`, or `JWT_REFRESH_SECRET` is missing.

Because the Neon database password was shared in a chat, rotate it in Neon
before deployment and update `DATABASE_URL` in Vercel with the new connection
string. Keep the rotated credential out of chat, source control, and logs.
