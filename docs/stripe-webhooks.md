# Stripe webhook testing (local)

Use the Stripe CLI to forward webhook events to your local dev server so you can test `pages/api/webhooks/stripe.ts`.

1) Install Stripe CLI: https://stripe.com/docs/stripe-cli

2) Log in and listen (forward to local webhook endpoint):

```bash
# authenticate with Stripe CLI first: stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3) Trigger a test event (from another terminal):

```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger invoice.payment_succeeded
stripe trigger checkout.session.completed
```

4) Notes
- Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set in your environment before starting the dev server.
- The webhook handler expects `orderId`, `userId`, and `serviceId` in metadata when possible; the SDK-created test events contain sample metadata — you can also create real PaymentIntents/Checkout sessions via the API and include metadata.
- To forward events from a remote Stripe account, pass `--forward-to` and ensure the CLI is authenticated for that account.
