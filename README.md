## built the Ansh Singh's Corner 
- in this webiste ill share my informtaion

## Admin -> GitHub sync
When you press "Save all changes" in `/admin`, the content is saved to Firestore
through the server-side `/api/firebase-content` Vercel function and committed to
`content.js` in this repo via `/api/update-content`. Required env vars in Vercel:

- `GITHUB_TOKEN` — fine-grained PAT with **Contents: Read and write** on this repo
- `ADMIN_PASSWORD` — must match the admin panel password (guards the endpoint)
- `FIREBASE_SERVICE_ACCOUNT_JSON` — the complete Firebase service-account JSON,
  pasted as one environment-variable value. Keep it server-only; do not commit it.

The Firebase service account must have access to the `site/content` Firestore
document. Public pages read content through the server endpoint, so the service
account and Firestore credentials are never shipped to the browser.
