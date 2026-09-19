import { db } from '../firebase-config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const ADMIN_USERNAME = 'ANSHSINGH7861';
const ADMIN_PASSWORD = 'ANSHSINGH7861923886';
const ADMIN_SESSION_KEY = 'ansh-admin-unlocked';
const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('#login-error');
const loginGate = document.querySelector('#admin-login');
const logoutButton = document.querySelector('#logout-button');

function setAdminAccess(isUnlocked) {
  document.body.classList.toggle('admin-locked', !isUnlocked);
  document.body.classList.toggle('admin-unlocked', isUnlocked);
  if (loginGate) loginGate.hidden = isUnlocked;
}

setAdminAccess(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#login-username').value;
  const password = document.querySelector('#login-password').value;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    loginError.textContent = '';
    loginForm.reset();
    setAdminAccess(true);
    return;
  }
  loginError.textContent = 'Username or password is incorrect.';
});

logoutButton?.addEventListener('click', () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  setAdminAccess(false);
});

const starterContent = JSON.parse(JSON.stringify(window.siteContent));
let workingContent = JSON.parse(JSON.stringify(window.siteContent));

// Deep merge: a partial cloud save must never wipe keys that exist locally
const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
function deepMerge(base, patch) {
  const out = { ...base };
  for (const key of Object.keys(patch || {})) {
    out[key] = isPlainObject(patch[key]) && isPlainObject(base?.[key]) ? deepMerge(base[key], patch[key]) : patch[key];
  }
  return out;
}
const form = document.querySelector('#admin-form');
const status = document.querySelector('#save-status');

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const getValue = (path) => path.split('.').reduce((obj, key) => obj?.[key], workingContent) ?? '';
const setValue = (path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => obj[key] ??= {}, workingContent);
  target[lastKey] = value;
};
const field = (label, path, type = 'text') => `<label>${label}<input data-path="${path}" type="${type}" value="${escapeHtml(getValue(path))}" /></label>`;

function renderSimpleFields() {
  document.querySelectorAll('[name]').forEach((input) => {
    input.dataset.path = input.name;
    if (input.name === 'pageCopy.ticker') {
      const arr = getValue(input.name);
      input.value = Array.isArray(arr) ? arr.join('\n') : '';
    } else {
      input.value = getValue(input.name);
    }
  });
}

function renderRepeater(id, collection, type) {
  const container = document.querySelector(`#${id}`);
  const items = collection.split('.').reduce((obj, key) => obj?.[key], workingContent) || [];
  const templates = {
    skills: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields">${field('Skill name', `${collection}.${index}.title`)}${field('Details', `${collection}.${index}.details`)}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove skill">×</button></article>`,
    projects: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields repeat-fields-three">${field('Project name', `${collection}.${index}.name`)}${field('Category', `${collection}.${index}.category`)}${field('Status', `${collection}.${index}.status`)}${field('Description', `${collection}.${index}.description`)}${field('Colour theme (any CSS colour: red, #ff8800, rgba(66,135,245,.9), hsl(120,60%,70%)…)', `${collection}.${index}.color`)}${field('Project link', `${collection}.${index}.link`, 'url')}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove project">×</button></article>`,
    songs: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields repeat-fields-three">${field('Song title', `${collection}.${index}.title`)}${field('Artist', `${collection}.${index}.artist`)}${field('Mood', `${collection}.${index}.mood`)}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove song">×</button></article>`,
    movies: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields repeat-fields-three">${field('Movie title', `${collection}.${index}.title`)}${field('Director', `${collection}.${index}.director`)}${field('Year', `${collection}.${index}.year`)}${field('Poster image URL', `${collection}.${index}.image`, 'url')}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove movie">×</button></article>`,
    extraSections: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields">${field('Section title', `${collection}.${index}.title`)}${field('Section text', `${collection}.${index}.text`)}${field('Image URL (optional)', `${collection}.${index}.image`, 'url')}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove section">×</button></article>`
  };
  container.innerHTML = items.map(templates[type]).join('') || '<p class="empty-repeat">Nothing here yet. Add your first one below.</p>';
}

function renderAll() {
  renderSimpleFields();
  renderRepeater('skills-editor', 'profile.skills', 'skills');
  renderRepeater('projects-editor', 'projects', 'projects');
  renderRepeater('songs-editor', 'songs', 'songs');
  renderRepeater('movies-editor', 'movies', 'movies');
  renderRepeater('sections-editor', 'pageCopy.extraSections', 'extraSections');
}

// Pull cloud content to prepopulate the editor
async function loadRemoteAdminContent() {
  status.textContent = 'Checking cloud for saved changes...';
  try {
    const snap = await getDoc(doc(db, 'site', 'content'));
    if (snap.exists()) {
      workingContent = deepMerge(workingContent, snap.data());
      renderAll();
      status.textContent = 'Cloud data synced';
      status.className = 'saved-message';
    } else {
      status.textContent = 'Using initial starter data';
    }
  } catch (err) {
    status.textContent = 'Could not fetch cloud data: ' + err.message;
  }
}

form.addEventListener('input', (event) => {
  const input = event.target.closest('[data-path]');
  if (!input) return;
  if (input.dataset.path === 'pageCopy.ticker') {
    setValue('pageCopy.ticker', input.value.split('\n').map((s) => s.trim()).filter(Boolean));
  } else {
    setValue(input.dataset.path, input.value);
  }
});

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  if (addButton) {
    const collectionName = addButton.dataset.add;
    if (collectionName === 'extraSections') workingContent.pageCopy.extraSections.push({ title: 'New section', text: 'Write something here.', image: '' });
    else if (collectionName === 'skills') workingContent.profile.skills.push({ title: 'New skill', details: 'Add details' });
    else if (collectionName === 'projects') workingContent.projects.push({ name: 'New project', category: 'New category', number: String(workingContent.projects.length + 1).padStart(2, '0'), description: 'Describe this project.', status: 'Concept / building', color: 'blue', link: '#' });
    else if (collectionName === 'songs') workingContent.songs.push({ title: 'New song', artist: 'Artist name', mood: 'Your mood' });
    else if (collectionName === 'movies') workingContent.movies.push({ title: 'New movie', director: 'Director name', year: '2026', image: '' });
    renderAll();
  }
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) {
    const collection = removeButton.dataset.remove === 'extraSections' ? workingContent.pageCopy.extraSections : removeButton.dataset.remove === 'skills' ? workingContent.profile.skills : workingContent[removeButton.dataset.remove];
    collection.splice(Number(removeButton.dataset.index), 1);
    renderAll();
  }
});

// Sync the saved content into the real content.js in the GitHub repo
async function syncContentToGithub() {
  const response = await fetch('/api/update-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: workingContent, password: ADMIN_PASSWORD })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data.changed;
}

document.querySelector('#save-button').addEventListener('click', async () => {
  status.textContent = 'Saving live to cloud...';
  status.className = '';
  try {
    await setDoc(doc(db, 'site', 'content'), workingContent);
    status.textContent = 'Saved live to cloud! Syncing to GitHub...';
    try {
      const changed = await syncContentToGithub();
      status.textContent = changed ? 'Saved live to cloud and committed to GitHub!' : 'Saved live to cloud! GitHub was already up to date.';
      status.className = 'saved-message';
    } catch (ghErr) {
      status.className = 'login-error';
      status.textContent = 'Saved live to cloud, but the GitHub commit failed: ' + ghErr.message;
    }
  } catch (err) {
    status.textContent = 'Cloud save failed: ' + err.message;
    status.className = 'login-error';
  }
});

document.querySelector('#reset-button').addEventListener('click', async () => {
  if (!window.confirm('Reset all saved edits back to the starter content in the database?')) return;
  workingContent = JSON.parse(JSON.stringify(starterContent));
  try {
    await setDoc(doc(db, 'site', 'content'), workingContent);
    status.textContent = 'Starter content restored on cloud! Syncing to GitHub...';
    try {
      const changed = await syncContentToGithub();
      status.textContent = changed ? 'Starter content restored on cloud and GitHub!' : 'Starter content restored on cloud! GitHub was already up to date.';
      status.className = 'saved-message';
    } catch (ghErr) {
      status.className = 'login-error';
      status.textContent = 'Starter content restored on cloud, but the GitHub commit failed: ' + ghErr.message;
    }
  } catch (err) {
    status.textContent = 'Database reset failed: ' + err.message;
  }
  renderAll();
});

document.querySelector('#export-button').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(workingContent, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ansh-site-content-backup.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector('#import-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    try {
      workingContent = JSON.parse(reader.result);
      renderAll();
      status.textContent = 'Backup loaded. Click "Save all changes" to push live.';
    } catch {
      status.textContent = 'Invalid JSON backup file.';
    }
  });
  reader.readAsText(file);
});

renderAll();
loadRemoteAdminContent();
