Project Plan: Legal Compliances & Payroll Services Webapp

Overview
- Company: Legal Compliances & Payroll Services
- Address: Plot No-9, Neelam Vihar, Vaidpura, Greater Noida West, Gautam Buddha Nagar, Uttar Pradesh - 203207
- Contact: Mobile - 8920060371, Email - fc.keshri@gmail.com
- Goal: Build a professional webapp where customers can register, verify via email OTP, browse and purchase consultancy and payroll services, pay via PayU India, upload required documents, and access a personal dashboard. Admin portal to manage services, laws, notifications and wage updates.

Tech Stack (recommended)
- Frontend: Next.js (TypeScript) + Tailwind CSS
- Backend / API: Next.js API routes (Node.js + TypeScript)
- Database: PostgreSQL
- ORM: Prisma
- Auth: Email OTP verification using SMTP (Nodemailer) + secure sessions (HTTP-only cookies/JWT session tokens)
- Payments: PayU India integration (server-side signature + client checkout) + tax calculation hooks
- File storage: AWS S3 or S3-compatible storage (local storage for dev)
- Hosting / Deployment: Vercel (frontend) + Railway/Render for DB and backend or full Vercel with external Postgres provider
- Dev tools: ESLint, Prettier, Husky (optional)

High-level Features / Flows
1. Public pages: Home, Services catalogue, Pricing, Laws & Notifications library, Minimum Wages page, Contact
2. Auth: Sign up (Name, Organization, Mobile, Email, Address fields). On sign-up: send email OTP; verify OTP → create user account and session. Forgot password via OTP email.
3. User dashboard: Profile, Orders (purchased services), Active service folders (upload checklist docs per service), Notifications, Billing history.
4. Service catalogue: Services with descriptions, checklist of required documents, price, tax breakdown, add-to-cart, checkout.
5. Cart & Checkout: Tax calculation (GST), payment with PayU India, webhook for payment status, order creation on success, invoice/email sent.
6. Document upload: For each purchased service allow multiple file uploads (PDF/JPG/PNG), virus scanning placeholder (manual review), stored in S3 with secure access.
7. Admin dashboard: CRUD for services, manage checklists, manage laws/notifications and minimum wage entries per state, view orders, manage clients and uploaded docs, payment reconciliation.
8. Laws & Notifications library: Admin-managed content with dates, attachments, tags, and versioning. Public search and filters by state, law type, date.

Data Model (high-level)
- User: id, name, organization, email, mobile, address fields, isVerified, createdAt
- Service: id, title, description, price, gstRate, checklistItems (JSON), active
- Cart / CartItem: userId, items
- Order: id, userId, serviceItems, amount, tax, total, paymentStatus, paymentProviderId, createdAt
- Document: id, orderId, serviceId, userId, filename, s3Key, uploadedAt
- Law/Notification: id, title, content, state, effectiveDate, tags, attachments
- MinimumWage: id, state, effectiveDate, wageJson

Milestones & Timeline (suggested)
- Week 1: Project scaffolding, authentication (email OTP), DB schema (Prisma), seed admin account
- Week 2: Service catalogue, cart, basic checkout flow (order creation, no payment yet), user dashboard skeleton
- Week 3: PayU payment integration, webhook handling, invoice/email on success
- Week 4: Document upload per order, admin dashboard basic CRUD
- Week 5: Laws & notifications library, minimum wage pages, search/filter
- Week 6: Testing, security hardening, deployment scripts, README and docs

Acceptance Criteria
- Users can register and verify email via OTP and reach dashboard
- Users can browse services, add to cart, and successfully checkout via PayU
- Orders are recorded in DB and emails sent with checklist and invoice
- Users can upload required documents per purchased service
- Admin can manage services and law library entries

Security / Compliance Notes
- Store secrets (DB, SMTP, PayU keys) in environment variables, never in repo
- Use HTTPS in production, secure cookies, CSRF protection for forms where needed
- Limit upload types and sizes; scan uploaded files before processing

Deliverables
- Full Next.js TypeScript project scaffold with Tailwind and Prisma
- `prisma/schema.prisma` initial schema and migration scripts
- Auth endpoints and email OTP flow
- Service catalogue pages, cart, checkout skeleton and PayU integration scaffold
- User dashboard with document upload support
- Admin dashboard skeleton
- `PROJECT_PLAN.md`, `README.md` with setup and run instructions

Next Steps (I'll implement next)
1. Scaffold Next.js + TypeScript + Tailwind project
2. Initialize Prisma and PostgreSQL connection
3. Implement auth (signup + email OTP) and basic user dashboard

Contact & Notes
- Payment gateway: PayU India (you may provide merchant keys & salt later)
- Email SMTP: you may provide SMTP credentials (or I can wire up a dev SMTP such as Mailtrap)

