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

<!-- PR marker: feature branch update -->


