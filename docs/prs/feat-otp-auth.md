Title: feat: implement OTP email authentication

Summary
-------

This branch implements the OTP-based email authentication flow (request + verify endpoints), issues secure JWT cookies on success, and includes rate-limiting and tests.

Files included (planned)
- `pages/api/auth/otp/request.ts` — send OTP email and store OTP (or hashed token)
- `pages/api/auth/otp/verify.ts` — verify OTP and issue JWT cookie
- Updates to `lib/mail.ts` usage for OTP templates
- Tests: `tests/auth/otp.spec.ts`

Testing
------
1. Copy `.env.example` to `.env.local` and set SMTP creds.
2. Run `npm run dev` and POST to `/api/auth/otp/request` and `/api/auth/otp/verify`.

Notes
-----
- Ensure `JWT_SECRET` is set in environment.
- Add rate-limiting (IP/email) to `request` endpoint to avoid abuse.
