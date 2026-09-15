// Vercel serverless function: commits the site content from the admin panel
// straight to content.js in the GitHub repo (so the repo file is always the
// source of truth, and new visitors never see a stale-content flash).
//
// Required environment variables (set in Vercel -> Project -> Settings -> Env):
//   GITHUB_TOKEN    - a token with Contents read/write on this repo
//   ADMIN_PASSWORD  - must match the admin panel password (extra guard)
// Optional:
//   GITHUB_OWNER (default anshsingh98), GITHUB_REPO (default ansh-singh),
//   GITHUB_BRANCH (default main), CONTENT_PATH (default content.js)

const OWNER = process.env.GITHUB_OWNER || 'anshsingh98';
const REPO = process.env.GITHUB_REPO || 'ansh-singh';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONTENT_PATH = process.env.CONTENT_PATH || 'content.js';
const API = 'https://api.github.com';

function buildFile(content) {
  return `/* EDIT THIS FILE to personalize the website. Keep the same field names when adding items. */
/* NOTE: this file is auto-synced from the admin panel. Manual edits here are */
/* overwritten the next time you press "Save all changes" in /admin.          */
window.siteContent = ${JSON.stringify(content, null, 2)};
`;
}

async function github(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${data.message || 'unknown error'}`);
  }
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { content, password } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid content object' });
  }
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN is not configured on the server' });
  }

  try {
    const file = buildFile(content);
    const existing = await github(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(CONTENT_PATH)}?ref=${encodeURIComponent(BRANCH)}`);
    const current = Buffer.from(existing.content || '', 'base64').toString('utf8');
    if (current === file) {
      return res.status(200).json({ ok: true, changed: false, commit: null });
    }
    const commit = await github(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(CONTENT_PATH)}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Update content from admin panel`,
        content: Buffer.from(file, 'utf8').toString('base64'),
        sha: existing.sha,
        branch: BRANCH
      })
    });
    return res.status(200).json({ ok: true, changed: true, commit: commit?.commit?.sha || null });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}