name: OTP / Email auth
about: Implement or harden OTP-based email authentication and session management
title: "feat: implement OTP auth - <short description>"
labels: enhancement, auth

---

## Goal

Implement secure OTP email authentication flow for sign-up and sign-in. Use `lib/mail.ts` for sending and Prisma for persisting OTPs or one-time tokens. Ensure rate-limiting and audit logging.

## Acceptance criteria

- OTP endpoint exists at `POST /api/auth/otp/request` and `POST /api/auth/otp/verify`.
- OTPs expire after a configurable time (e.g., 10 minutes).
- Limit OTP requests per IP/email (rate-limiting).
- Successful verification issues a signed JWT cookie with secure flags.
- Unit/integration tests cover happy path and error cases.

## Notes

- See `lib/mail.ts` for SMTP usage. Update `.env.example` if new env vars are required.
