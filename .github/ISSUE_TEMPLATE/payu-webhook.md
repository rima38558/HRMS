name: PayU webhook hardening
about: Verify and harden PayU webhook handling, add idempotency and tests
title: "fix(payu): webhook verification and idempotency"
labels: bug, payments

---

## Goal

Ensure the PayU webhook endpoint validates signatures, processes events idempotently, and handles retries gracefully.

## Acceptance criteria

- Webhook verifies PayU signature using `PAYU_MERCHANT_SALT` / signing algorithm.
- Processed events are recorded with idempotency keys to avoid duplicate handling.
- Webhook responds with proper HTTP status codes to allow retries.
- Add e2e test or a local test harness to simulate webhook calls.

## Notes

- Check `pages/api/payments/payu/webhook.ts` for existing scaffold and extend accordingly.
