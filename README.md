Legal Compliances & Payroll Services — Webapp

Quick start

1. Install dependencies

```bash
cd "c:/xampp/htdocs/Legal Compliance & Payroll Services"
npm install
```

2. Create environment

```bash
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL, SMTP and PayU keys
```

3. Initialize Prisma and database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run dev server

```bash
npm run dev
```

Project structure
- `pages/` — Next.js pages and API routes
- `prisma/schema.prisma` — Prisma schema
- `lib/` — helpers (Prisma client, mail helper)

Next steps
- Configure SMTP credentials and integrate `lib/mail.ts` using Nodemailer
- Implement OTP verification endpoint and secure session management
- Seed services and implement service catalogue pages
- Add PayU integration for checkout and webhooks

Admin seed & demo
- Create a local admin user and get a demo JWT token:

```bash
npm run create-admin
```

This prints a JWT token. To use it in the browser for demoing admin pages:

1. Open DevTools → Application → Cookies for `http://localhost:3000`.
2. Add a cookie named `token` with the printed JWT value and path `/`.
3. Visit the admin pages: `/admin/laws` and `/admin/minimum-wages`.

Notes: This token is for local development only. In production, use the normal signup + OTP flow.

Demo screenshots
- I created sample entries and captured admin-page screenshots during a local demo. If you run the demo script, you may see a runtime warning in the browser about server/client HTML mismatch for date formatting depending on your locale — this doesn't block functionality but can be fixed by rendering dates consistently (e.g., using the same `toLocaleDateString` format on server and client or rendering dates purely client-side).

Files created by tools
- `scripts/create_admin.js` — creates/updates an admin user, writes `.admin_token`, and can create sample Law/MinimumWage entries when run with `CREATE_SAMPLE_LAW=1` and/or `CREATE_SAMPLE_WAGE=1`.

Example: create admin + sample data

```bash
# create admin + sample law + sample minimum wage
set CREATE_SAMPLE_LAW=1&& set CREATE_SAMPLE_WAGE=1&& npm run create-admin
```

Development tips
- **Linting:** Run `npm run lint` to check for issues and `npm run lint:fix` to auto-fix where possible.
- **Formatting:** Run `npm run format` to apply Prettier formatting across the project.

## Production deploy checklist

Follow these steps when preparing a production deployment:

- Create a production database and set `DATABASE_URL`.
- Provision SMTP credentials and set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
- Provision PayU (or your payment gateway) credentials and set `PAYU_MERCHANT_ID`, `PAYU_MERCHANT_KEY`, and `PAYU_MERCHANT_SALT`.
- Provision S3 (or other storage) and set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_S3_BUCKET`.
- Set `JWT_SECRET` to a secure random value; do not use the development default.
- Ensure `NODE_ENV=production` and build the app (`npm run build`).
- Configure environment variables securely in your hosting platform (GitHub Actions secrets, Vercel environment variables, etc.).
- Run `npx prisma migrate deploy` (or the appropriate Prisma migrate command) against the production database and verify migrations.
- Configure and verify webhooks (PayU webhook URL, signing/verification) and test with sandbox keys.
- Verify file upload permissions and validate uploads server-side.
- Run smoke tests: signup/login, create an order, checkout flow, webhook handling, and admin pages.

## Required environment variables

A minimal list of environment variables (see `.env.example`):

- `DATABASE_URL` — Prisma database connection string.
- `JWT_SECRET` — secret used to sign JWT tokens.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — SMTP settings for sending OTP / notifications.
- `PAYU_MERCHANT_ID`, `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, `PAYU_ENV` — PayU credentials and environment.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` — S3 credentials for file uploads.
- `VERCEL_TOKEN` — optional token used by CI to deploy to Vercel.

Notes
- Do not commit real secrets to the repository. Use a `.env` file locally and keep it out of version control; ensure `.gitignore` contains `.env` entries.
- For CI, add secrets via GitHub repository settings (Settings → Secrets → Actions) or via your deployment provider's secret store.

<!-- PR marker: feature branch update -->


