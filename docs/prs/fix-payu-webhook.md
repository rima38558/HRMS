Title: fix(payu): webhook verification and idempotency

Summary
-------

Harden the PayU webhook endpoint: verify signatures, add idempotency keys, record processed event IDs, and improve error handling and retry behavior.

Files included (planned)
- `pages/api/payments/payu/webhook.ts` — verify signature and ensure idempotent processing
- `lib/payu.ts` — helper for signature verification and payload parsing
- Tests or local webhook simulator under `tests/payments/payu-webhook.spec.ts`

Testing
------
1. Use PayU sandbox keys in `.env.local`.
2. Run webhook simulator to POST signed payloads and verify single processing.

Notes
-----
- Use `PAYU_MERCHANT_SALT` and configured signing algorithm to validate incoming webhook payloads.
- Store processed event IDs in DB to skip duplicates.
