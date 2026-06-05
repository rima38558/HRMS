name: Security audit and hardening
about: Audit secrets, uploads, cookies, and rate-limits; propose fixes
title: "chore(security): audit and harden app"
labels: security, audit

---

## Goal

Perform a focused security review covering secrets management, upload validation, cookie/session settings, CORS, and rate-limiting on auth endpoints.

## Acceptance criteria

- Confirm no secrets or credentials are checked into the repo.
- `.env.example` lists all required variables and real secrets are not present.
- Cookie flags: `Secure`, `HttpOnly`, `SameSite` set appropriately.
- File upload endpoints validate file type/size and use least-privilege S3 policies.
- Rate-limiting or throttling exists for auth-related endpoints.
- Produce a short remediation plan or PRs addressing any findings.
