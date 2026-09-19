// Vercel serverless function: commits the site content from the admin panel
// straight to the GitHub repo, so the repo files are always the source of
// truth. Commits BOTH:
//   1. content.js   -> the runtime data file
//   2. index.html   -> the same content baked into the static HTML
//
// Required environment variables (set in Vercel -> Project -> Settings -> Env):
//   GITHUB_TOKEN    - a token with Contents read/write on this repo
//   ADMIN_PASSWORD  - must match the admin panel password (extra guard)
// Optional:
//   GITHUB_OWNER (default anshsingh98), GITHUB_REPO (default ansh-singh),
//   GITHUB_BRANCH (default main), CONTENT_PATH (default content.js),
//   HTML_PATH (default index.html)

const OWNER = process.env.GITHUB_OWNER || 'anshsingh98';
const REPO = process.env.GITHUB_REPO || 'ansh-singh';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONTENT_PATH = process.env.CONTENT_PATH || 'content.js';
const HTML_PATH = process.env.HTML_PATH || 'index.html';
const API = 'https://api.github.com';

function buildFile(content) {
  return `/* EDIT THIS FILE to personalize the website. Keep the same field names when adding items. */
/* NOTE: this file is auto-synced from the admin panel. Manual edits here are */
/* overwritten the next time you press "Save all changes" in /admin.          */
window.siteContent = ${JSON.stringify(content, null, 2)};
`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

// *asterisks* -> accent <em> words (same rules as the live site)
function accentHtml(line) {
  const safe = escapeHtml(String(line).trim());
  return safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function resolvePath(obj, path) {
  return String(path).split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

// Headings: *asterisks* mark accent words; line breaks become <br>.
// (Mirrors headingHtml() in script.js.)
function headingHtml(text) {
  if (!text) return '';
  const lines = String(text).split('\n');
  if (lines.some((line) => /\*[^*]+\*/.test(line))) return lines.map(accentHtml).join('<br>');
  const first = escapeHtml(lines[0] || '');
  if (lines.length < 2) return first;
  const words = (lines[1] || '').trim().split(/\s+/);
  const accent = escapeHtml(words.pop() || '');
  const lead = escapeHtml(words.join(' '));
  return `${first}<br>${lead ? lead + ' ' : ''}<em>${accent}</em>`;
}

// Bake the saved content into the static index.html so crawlers and
// no-JS visitors see the real copy, matching what script.js renders live.
function bakeIntoHtml(html, content) {
  let out = html;

  // headings: <h2 data-heading="pageCopy.x">...</h2>
  out = out.replace(/(<([a-z0-9]+)\b[^>]*\bdata-heading="([^"]+)"[^>]*>)([\s\S]*?)<\/\2>/gi, (match, open, tag, path) => {
    const value = resolvePath(content, path);
    if (typeof value !== 'string') return match;
    return `${open}${headingHtml(value)}</${tag}>`;
  });

  // text: <p data-text="pageCopy.x">...</p> (elements are leaf nodes)
  out = out.replace(/(<([a-z0-9]+)\b[^>]*\bdata-text="([^"]+)"[^>]*>)([\s\S]*?)<\/\2>/gi, (match, open, tag, path) => {
    const value = resolvePath(content, path);
    if (typeof value !== 'string') return match;
    return `${open}${accentHtml(value)}</${tag}>`;
  });

  // currently-doing label
  out = out.replace(/(<span\b[^>]*\bdata-profile-currently[^>]*>)[\s\S]*?(<\/span>)/i, (match, open, close) => {
    const value = resolvePath(content, 'profile.currently');
    return typeof value === 'string' ? `${open}${escapeHtml(value)}${close}` : match;
  });

  // brand name / short logo name
  if (content && content.brand) {
    out = out.replace(/(<span\b[^>]*\bdata-brand-short[^>]*>)[\s\S]*?(<\/span>)/gi, (m, o, c) => `${o}${escapeHtml(content.brand.shortName || '')}${c}`);
    out = out.replace(/(<(strong|span)\b[^>]*\bdata-brand-name\b[^>]*>)[\s\S]*?<\/\2>/gi, (m, o, tag) => `${o}${escapeHtml(content.brand.companyName || '')}</${tag}>`);
  }

  // contact links
  const email = resolvePath(content, 'brand.companyEmail');
  if (typeof email === 'string' && email) {
    out = out.replace(/(<a\b[^>]*\bdata-company-email-link\b[^>]*href=")[^"]*(")/gi, (m, o, c) => `${o}mailto:${email}${c}`);
  }
  const whatsapp = String(resolvePath(content, 'profile.whatsapp') || '').replace(/\D/g, '');
  if (whatsapp) {
    out = out.replace(/(<a\b[^>]*\bdata-whatsapp-link\b[^>]*href=")[^"]*(")/gi, (m, o, c) => `${o}https://wa.me/${whatsapp}${c}`);
  }

  return out;
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

async function commitFile(path, fileContent, message) {
  const existing = await github(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(BRANCH)}`);
  const current = Buffer.from(existing.content || '', 'base64').toString('utf8');
  if (current === fileContent) return { changed: false, sha: null };
  const commit = await github(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(fileContent, 'utf8').toString('base64'),
      sha: existing.sha,
      branch: BRANCH
    })
  });
  return { changed: true, sha: commit?.commit?.sha || null };
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
    const contentResult = await commitFile(CONTENT_PATH, buildFile(content), 'Update content from admin panel');

    // Re-fetch (post-commit) so we bake into the fresh index.html, then commit it too
    let htmlResult = { changed: false, sha: null };
    try {
      const htmlFile = await github(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(HTML_PATH)}?ref=${encodeURIComponent(BRANCH)}`);
      const html = Buffer.from(htmlFile.content || '', 'base64').toString('utf8');
      const baked = bakeIntoHtml(html, content);
      if (baked !== html) {
        const commit = await github(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(HTML_PATH)}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: 'Bake admin content into index.html',
            content: Buffer.from(baked, 'utf8').toString('base64'),
            sha: htmlFile.sha,
            branch: BRANCH
          })
        });
        htmlResult = { changed: true, sha: commit?.commit?.sha || null };
      }
    } catch (htmlError) {
      // content.js is already committed; report the HTML issue but don't fail the save
      return res.status(200).json({ ok: true, changed: contentResult.changed, commit: contentResult.sha, html: { changed: false, error: htmlError.message } });
    }

    return res.status(200).json({ ok: true, changed: contentResult.changed || htmlResult.changed, commit: contentResult.sha, html: htmlResult });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}