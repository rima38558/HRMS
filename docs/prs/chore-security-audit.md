Title: chore(security): audit and harden secrets, uploads, and cookies

Summary
-------

Perform a security audit and apply hardening measures: ensure no secrets checked in, enforce secure cookies, validate uploads, and add rate-limiting to auth endpoints.

Files/changes included (planned)
- Audit report (docs/security-audit-report.md)
- Update `lib/auth.ts` / cookie helper to set `Secure`, `HttpOnly`, `SameSite` flags
- Update upload endpoint `pages/api/orders/[orderId]/upload.ts` to validate MIME type and size
- Add rate-limiter middleware and apply to auth endpoints

Testing
------
1. Run static scan for secrets (e.g., `git grep -n "AWS_SECRET\|PAYU_MERCHANT"`).
2. Run manual upload tests with invalid file types and large payloads.

Notes
-----
- Produce remediation PRs for any findings.
