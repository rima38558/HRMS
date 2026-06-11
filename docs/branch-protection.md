# Branch protection and required status checks

Recommended branch protection settings for this repository (set via GitHub UI or CLI):

- Protect the default branch (e.g., `main` or your default branch).
- Require status checks to pass before merging. Add the `CI` workflow as a required check.
- Require pull request reviews before merging (1 or 2 reviewers).
- Enforce linear history (optional) and restrict who can push to the branch.

Using GitHub CLI to enable a minimal protection policy (example):

```bash
# Replace <owner> and <repo> and <branch>
gh api --method PUT /repos/<owner>/<repo>/branches/<branch>/protection -f required_status_checks='{"strict":true,"contexts":["CI"]}' -f enforce_admins=true -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}'
```

Notes
- The CLI command requires `gh` to be authenticated and the user to have admin rights on the repo.
- After enabling protection, update repository collaborators and CODEOWNERS as needed.
