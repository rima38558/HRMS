<!-- Describe the purpose of this PR in one short sentence -->

Summary
-------

What changed and why:

- 

Checklist
---------
- [ ] I have added or updated tests for any new behavior
- [ ] Linting and formatting are passing (run `npm run lint` / `npm run format`)
- [ ] I updated `README.md` or added docs where relevant
- [ ] I added or updated environment variables in `.env.example` if needed
- [ ] For production changes, I added steps to the Production deploy checklist

High-priority review items
-------------------------
- OTP / auth endpoints: security, rate-limiting, token expiry
- PayU integration: webhook signature verification, idempotency, error handling
- File uploads: validate file types and sizes, S3 permissions
- Secrets: ensure no credentials are committed

How to test
-----------
Describe manual steps to validate changes (e.g., run seed, run dev server, create admin user, run checkout flow).
