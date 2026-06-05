PR: https://github.com/rima38558/HRMS/pull/1

QA Summary (local dev server: http://localhost:3001)

- Server: `npm run dev` (Next.js 14) — ran on port 3001 (3000 in use)
- Pages verified visually and screenshot-captured:
  - `/` (Home)
  - `/services`
  - `/contact`
  - `/auth/login`

Notes:
- No runtime server errors observed in the dev terminal during checks.
- Contact form fields were filled during an automated QA run; the Send button could not be triggered programmatically in the current environment, so no network submission was performed.
- `/services` currently renders static/sample content; server-side data requires a configured `DATABASE_URL` to test fully.

Screenshots:
- Screenshots were captured locally during the QA session. I can add them to `demo/screenshots/` and push a small commit attaching them to this PR if you approve.

Request:
- Do you want me to push the screenshots into `demo/screenshots/` and attach them to PR #1 now? (I will create the files, commit, and push.)

If yes — I will proceed to create `demo/screenshots/*` files and push a commit to `feature/site-pages` and add a PR comment referencing them.

If no — I will instead post this QA summary as a PR comment and leave the screenshots only locally.
