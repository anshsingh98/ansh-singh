const starterContent = JSON.parse(JSON.stringify(window.siteContent));
let workingContent = JSON.parse(JSON.stringify(window.siteContent));
const form = document.querySelector('#admin-form');
const status = document.querySelector('#save-status');

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const getValue = (path) => path.split('.').reduce((object, key) => object?.[key], workingContent) ?? '';
const setValue = (path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((object, key) => object[key] ??= {}, workingContent);
  target[lastKey] = value;
};
const field = (label, path, type = 'text') => `<label>${label}<input data-path="${path}" type="${type}" value="${escapeHtml(getValue(path))}" /></label>`;

function renderSimpleFields() {
  document.querySelectorAll('[name]').forEach((input) => {
    input.dataset.path = input.name;
    input.value = getValue(input.name);
  });
}

function renderRepeater(id, collection, type) {
  const container = document.querySelector(`#${id}`);
  const items = collection.split('.').reduce((object, key) => object?.[key], workingContent) || [];
  const templates = {
    skills: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields">${field('Skill name', `${collection}.${index}.title`)}${field('Details', `${collection}.${index}.details`)}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove skill">×</button></article>`,
    projects: (item, index) => `<article class="repeat-card"><div class="repeat-number">${String(index + 1).padStart(2, '0')}</div><div class="repeat-fields repeat-fields-three">${field('Project name', `${collection}.${index}.name`)}${field('Category', `${collection}.${index}.category`)}${field('Status', `${collection}.${index}.status`)}${field('Description', `${collection}.${index}.description`)}${field('Colour theme', `${collection}.${index}.color`)}${field('Project link', `${collection}.${index}.link`, 'url')}</div><button type="button" class="remove-button" data-remove="${collection}" data-index="${index}" aria-label="Remove project">×</button></article>`,
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

function collectionAtPath(path) {
  return path.split('.').reduce((object, key) => object[key], workingContent);
}

form.addEventListener('input', (event) => {
  const input = event.target.closest('[data-path]');
  if (input) setValue(input.dataset.path, input.value);
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

document.querySelector('#save-button').addEventListener('click', () => {
  localStorage.setItem('ansh-site-content', JSON.stringify(workingContent));
  status.textContent = 'Saved just now';
  status.className = 'saved-message';
});
document.querySelector('#reset-button').addEventListener('click', () => {
  if (!window.confirm('Reset all saved edits to the starter content?')) return;
  workingContent = JSON.parse(JSON.stringify(starterContent));
  localStorage.removeItem('ansh-site-content');
  renderAll();
  status.textContent = 'Starter content restored';
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
    try { workingContent = JSON.parse(reader.result); renderAll(); status.textContent = 'Backup loaded. Save to apply it.'; } catch { status.textContent = 'That backup file is not valid JSON.'; }
  });
  reader.readAsText(file);
});

renderAll();
