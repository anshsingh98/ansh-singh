## built the Ansh Singh's Corner 
- in this webiste ill share my informtaion

## Admin -> GitHub sync
When you press "Save all changes" in `/admin`, the content is saved to Firestore
(instant for visitors) AND committed to `content.js` in this repo via
`/api/update-content` (Vercel function). Required env vars in Vercel:

- `GITHUB_TOKEN` — fine-grained PAT with **Contents: Read and write** on this repo
- `ADMIN_PASSWORD` — must match the admin panel password (guards the endpoint)
