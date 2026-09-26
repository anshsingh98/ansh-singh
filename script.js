const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('mobile-open');
    menuButton.setAttribute('aria-expanded', isOpen);
  });
}

document.querySelectorAll('.desktop-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav?.classList.remove('mobile-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const songRow = (song, index) => `<div class="track-row"><b>${String(index + 1).padStart(2, '0')}</b><strong>${song.title} <small>${song.artist}</small></strong><span>${song.mood}</span><span>↗</span></div>`;
// Project card colour: named themes keep their classes; any other valid CSS
// colour (hex, rgb/rgba, hsl, color names, etc.) is applied inline, with the
// text colour flipped automatically for readability.
const KNOWN_PROJECT_COLORS = ['blue', 'orange', 'green'];
function projectCardColorAttrs(color) {
  const value = String(color || '').trim();
  if (!value) return { cls: '', style: '' };
  if (KNOWN_PROJECT_COLORS.includes(value.toLowerCase())) return { cls: ` project-${value.toLowerCase()}`, style: '' };
  let supports = false;
  try { supports = window.CSS && CSS.supports('background-color', value); } catch (e) { supports = false; }
  if (!supports) return { cls: '', style: '' };
  let text = '#1d1d1b';
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
    const px = ctx.getImageData(0, 0, 1, 1).data;
    const lum = (0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2]) / 255;
    text = lum > 0.55 ? '#1d1d1b' : '#f4f0e8';
  } catch (e) { /* keep default dark text */ }
  return { cls: '', style: ` style="background:${escapeHtml(value)};color:${text}"` };
}
const projectCard = (project) => { const c = projectCardColorAttrs(project.color); return `<article class="project-card${c.cls}"${c.style}><div class="project-card-top"><span>${project.number}</span><span>${project.category}</span></div><div class="project-icon">${project.name.charAt(0)}</div><h3>${project.name}</h3><p>${project.description}</p><div class="project-card-bottom"><small>${project.status}</small><a href="${project.link}" aria-label="Open ${project.name}">↗</a></div></article>`; };
const movieCard = (movie, index) => {
  const featured = index === 0 ? ' film-card-feature' : '';
  const image = movie.image ? `<img src="${movie.image}" alt="Cinema seats" />` : '';
  const details = `${movie.director} · ${movie.year}`;
  return `<article class="film-card${featured}">${image}<div class="${featured ? 'film-info' : ''}"><div class="film-number">${String(index + 1).padStart(2, '0')}</div><h3>${movie.title}</h3><p>${details}</p></div>${featured ? '' : '<span class="film-arrow">↗</span>'}</article>`;
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const resolvePath = (obj, path) => path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);

// Plain single-line editable texts
// ==== Intro overlay: fast split-curtain reveal (plays once per session) ====
(function initIntroOverlay() {
  const overlay = document.getElementById('introOverlay');
  if (!overlay) return;
  const finish = () => {
    if (!overlay.isConnected) return;
    overlay.classList.add('is-done');
    setTimeout(() => overlay.remove(), 800);
  };
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { overlay.remove(); return; }
  try {
    if (sessionStorage.getItem('introShown')) { overlay.remove(); return; }
    sessionStorage.setItem('introShown', '1');
  } catch (error) { /* private mode: just play it */ }
  window.setTimeout(finish, 1000);      // curtains split via CSS; remove node after
  window.setTimeout(() => { if (overlay.isConnected) finish(); }, 2500); // absolute safety net
})();

// ==== Play hook toast: curiosity cue that makes visitors press play ====
(function initPlayToast() {
  let shown = false;
  try { shown = !!sessionStorage.getItem('playToastShown'); } catch (error) {}
  if (shown) return;
  try { sessionStorage.setItem('playToastShown', '1'); } catch (error) {}
  const playButton = document.querySelector('.play-button');
  if (!playButton) return;
  const song = (window.siteContent && window.siteContent.featuredSong) || { title: 'Tum Tak' };
  const toast = document.createElement('button');
  toast.type = 'button';
  toast.className = 'play-toast';
  toast.innerHTML = '<span class="pt-disc">🎧</span><span><em>' + (song.title || 'Your song') + '</em> is loaded — <strong>press play</strong></span>';
  document.body.appendChild(toast);
  const hide = () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 600); };
  toast.addEventListener('click', () => { playButton.click(); hide(); });
  window.setTimeout(() => toast.classList.add('show'), 1500);
  window.setTimeout(hide, 9000);
})();

function applyDataTexts(content) {
  document.querySelectorAll('[data-text]').forEach((el) => {
    const value = resolvePath(content, el.dataset.text);
    if (typeof value === 'string') el.innerHTML = accentHtml(value);
  });
}

// Headings stored as plain text. Two ways to get the two-font (Playfair) accent:
//   1. *asterisks* around any word(s) -> those words render in the accent font, anywhere
//   2. legacy: two lines -> the last word of the second line gets the accent automatically
function accentHtml(line) {
  const safe = escapeHtml(line.trim());
  if (!/\*[^*]+\*/.test(safe)) return safe;
  return safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
function headingHtml(text) {
  if (!text) return '';
  const lines = String(text).split('\n');
  if (lines.some((line) => /\*[^*]+\*/.test(line))) {
    return lines.map(accentHtml).join('<br>');
  }
  const parts = lines;
  const first = escapeHtml(parts[0] || '');
  if (parts.length < 2) return first;
  const words = (parts[1] || '').trim().split(/\s+/);
  const accent = escapeHtml(words.pop() || '');
  const lead = escapeHtml(words.join(' '));
  return `${first}<br>${lead ? lead + ' ' : ''}<em>${accent}</em>`;
}
function applyDataHeadings(content) {
  document.querySelectorAll('[data-heading]').forEach((el) => {
    const value = resolvePath(content, el.dataset.heading);
    if (typeof value === 'string') el.innerHTML = headingHtml(value);
  });
}

// Ticker marquee rebuilt from editable phrases
function buildTicker(content) {
  const track = document.querySelector('.ticker-track');
  const phrases = content?.pageCopy?.ticker;
  if (!track || !Array.isArray(phrases) || !phrases.length) return;
  track.innerHTML = [...phrases, ...phrases].map((p) => `${escapeHtml(p)}<b>✳</b>`).join('');
}

// Deep merge: a partial cloud save must never wipe keys that exist locally
const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
function deepMerge(base, patch) {
  const out = { ...base };
  for (const key of Object.keys(patch || {})) {
    out[key] = isPlainObject(patch[key]) && isPlainObject(base?.[key]) ? deepMerge(base[key], patch[key]) : patch[key];
  }
  return out;
}

function renderSite(content) {
  if (!content) return;
  applyDataTexts(content);
  applyDataHeadings(content);
  buildTicker(content);
  const profile = { email: '', whatsapp: '', name: 'Ansh', intro: '', currently: 'figuring it out', photo: '', aboutParagraphs: ['', ''], skills: [], ...(content.profile || {}) };
  const brand = { companyName: 'Deepika App Developers', shortName: 'DAD', companyEmail: '', ownerLabel: 'Founder & owner', founded: '2026', description: '', tagline: '', ...(content.brand || {}) };
  const site = content.site || { name: "Ansh Singh's Corner", shortName: 'AS', title: "Ansh Singh's Corner" };
  const copy = content.pageCopy || {};
  const faviconUrl = new URL('images/favicon.svg', import.meta.url).href;

  if (!document.querySelector('link[data-site-favicon]')) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = faviconUrl;
    favicon.dataset.siteFavicon = 'true';
    document.head.appendChild(favicon);
  }

  document.querySelectorAll('[data-email-link]').forEach((link) => { link.href = `mailto:${profile.email}`; });
  const waNumber = String(profile.whatsapp || '').replace(/[^0-9]/g, '');
  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => { if (waNumber) link.href = `https://wa.me/${waNumber}`; });
  document.querySelectorAll('[data-company-email-link]').forEach((link) => { link.href = `mailto:${brand.companyEmail}`; });
  document.querySelectorAll('[data-brand-short]').forEach((el) => { el.textContent = brand.shortName; });
  document.querySelectorAll('[data-brand-name]').forEach((el) => { el.textContent = brand.companyName; });
  document.querySelectorAll('[data-brand-name-heading]').forEach((el) => { el.innerHTML = brand.companyName.replace(' App Developers', ' App<br><em>Developers.</em>'); });

  document.querySelectorAll('.wordmark span').forEach((el) => {
    el.textContent = '';
    el.setAttribute('aria-label', site.shortName);
    el.style.backgroundImage = `url("${faviconUrl}")`;
    el.style.backgroundSize = 'cover';
  });
  document.querySelectorAll('.wordmark strong').forEach((el) => { el.textContent = site.name; });
  if (site.title && document.body.dataset.page !== 'admin') document.title = site.title;

  document.querySelectorAll('[data-profile-name]').forEach((el) => { el.textContent = `${profile.name}.`; });
  document.querySelectorAll('[data-profile-role]').forEach((el) => { el.textContent = profile.role; });
  document.querySelectorAll('[data-profile-intro]').forEach((el) => { el.textContent = profile.intro; });
  document.querySelectorAll('[data-profile-photo]').forEach((el) => { el.src = profile.photo; });
  document.querySelectorAll('[data-profile-currently]').forEach((el) => { el.textContent = profile.currently; });

  const aboutHeading = document.querySelector('[data-about-heading]');
  if (aboutHeading) aboutHeading.textContent = profile.aboutHeading;
  const aboutParagraphs = document.querySelectorAll('[data-about-paragraph-one], [data-about-paragraph-two]');
  if (aboutParagraphs[0]) aboutParagraphs[0].textContent = profile.aboutParagraphs[0];
  if (aboutParagraphs[1]) aboutParagraphs[1].textContent = profile.aboutParagraphs[1];

  document.querySelectorAll('[data-brand-tagline]').forEach((el) => { el.textContent = brand.tagline; });
  document.querySelectorAll('[data-brand-description]').forEach((el) => { el.textContent = brand.description; });
  document.querySelectorAll('[data-brand-owner-label]').forEach((el) => { el.textContent = brand.ownerLabel; });
  document.querySelectorAll('[data-brand-founded]').forEach((el) => { el.textContent = `EST. ${brand.founded}`; });

  document.querySelectorAll('[data-copy="homeAboutHeading"]').forEach((el) => { el.innerHTML = copy.homeAboutHeading ? headingHtml(copy.homeAboutHeading) : el.innerHTML; });
  document.querySelectorAll('[data-copy="homeAboutFirst"]').forEach((el) => { el.textContent = copy.homeAboutFirst || el.textContent; });
  document.querySelectorAll('[data-copy="homeAboutSecond"]').forEach((el) => { el.textContent = copy.homeAboutSecond || el.textContent; });
  document.querySelectorAll('[data-copy="projectsNote"]').forEach((el) => { el.textContent = copy.projectsNote || el.textContent; });
  document.querySelectorAll('[data-copy="favouritesHeading"]').forEach((el) => { el.innerHTML = copy.favouritesHeading ? headingHtml(copy.favouritesHeading) : el.innerHTML; });
  document.querySelectorAll('[data-copy="favouritesIntro"]').forEach((el) => { el.textContent = copy.favouritesIntro || el.textContent; });
  document.querySelectorAll('[data-copy="songsHeading"]').forEach((el) => { el.innerHTML = copy.songsHeading ? headingHtml(copy.songsHeading) : el.innerHTML; });
  document.querySelectorAll('[data-copy="songsIntro"]').forEach((el) => { el.textContent = copy.songsIntro || el.textContent; });
  document.querySelectorAll('[data-copy="moviesHeading"]').forEach((el) => { el.innerHTML = copy.moviesHeading ? headingHtml(copy.moviesHeading) : el.innerHTML; });
  document.querySelectorAll('[data-copy="moviesIntro"]').forEach((el) => { el.textContent = copy.moviesIntro || el.textContent; });

  const pageType = document.body.dataset.page;
  if (pageType === 'favourites') {
    document.querySelector('.subpage-hero h1').innerHTML = copy.favouritesHeading ? headingHtml(copy.favouritesHeading) : 'Things I love.';
    document.querySelector('.subpage-hero .hero-intro').textContent = copy.favouritesIntro || '';
  }
  if (pageType === 'songs') {
    document.querySelector('.subpage-hero h1').innerHTML = copy.songsHeading ? headingHtml(copy.songsHeading) : 'Every song has a place.';
    document.querySelector('.subpage-hero .hero-intro').textContent = copy.songsIntro || '';
  }
  if (pageType === 'movies') {
    document.querySelector('.subpage-hero h1').innerHTML = copy.moviesHeading ? headingHtml(copy.moviesHeading) : 'Stories I return to.';
    document.querySelector('.subpage-hero .hero-intro').textContent = copy.moviesIntro || '';
  }

  const projectList = document.querySelector('#project-list');
  if (projectList && content.projects) projectList.innerHTML = content.projects.map(projectCard).join('');

  const extraSections = document.querySelector('#extra-sections');
  if (extraSections) {
    extraSections.innerHTML = (copy.extraSections || []).map((section, index) => `<section class="extra-content-section section-pad"><div class="section-label"><span>${String(index + 5).padStart(2, '0')}</span><i></i><span>${section.title}</span></div><div class="extra-content-grid"><h2>${section.title}</h2><p>${section.text}</p>${section.image ? `<img src="${section.image}" alt="${section.title}" />` : ''}</div></section>`).join('');
  }

  const skillsList = document.querySelector('#skills-list');
  if (skillsList && profile.skills) skillsList.innerHTML = profile.skills.map((skill, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${skill.title}</strong><small>${skill.details}</small></div>`).join('');

  const homeSongs = document.querySelector('#home-song-list');
  if (homeSongs && content.songs) homeSongs.innerHTML = content.songs.slice(0, 3).map(songRow).join('');

  const fullSongs = document.querySelector('#full-song-list');
  if (fullSongs && content.songs) {
    const header = fullSongs.querySelector('.list-header');
    fullSongs.innerHTML = '';
    if (header) fullSongs.appendChild(header);
    fullSongs.insertAdjacentHTML('beforeend', content.songs.map(songRow).join(''));
  }

  const homeMovies = document.querySelector('#home-movie-list');
  if (homeMovies && content.movies) homeMovies.innerHTML = content.movies.slice(0, 3).map(movieCard).join('');

  const fullMovies = document.querySelector('#full-movie-list');
  if (fullMovies && content.movies) fullMovies.innerHTML = content.movies.map(movieCard).join('');

  const featuredSong = content.featuredSong || (content.songs && content.songs[0]);
  if (featuredSong) {
    document.querySelectorAll('[data-feature-song]').forEach((el) => { el.textContent = featuredSong.title; });
    document.querySelectorAll('[data-feature-artist]').forEach((el) => { el.textContent = featuredSong.artist; });
  }

  const songCount = document.querySelector('#song-count');
  if (songCount && content.songs) songCount.textContent = `${content.songs.length} songs, no skips.`;
  const movieCount = document.querySelector('#movie-count');
  if (movieCount && content.movies) movieCount.textContent = `${content.movies.length} films, many feelings.`;
}

// 1. Render immediate local content first
renderSite(window.siteContent);

// 2. Sync live content from the shared Cloud Firestore database.
async function syncRemoteContent() {
  try {
    const response = await fetch('/api/firebase-content');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    if (data.content) {
      window.siteContent = deepMerge(window.siteContent, data.content);
      renderSite(window.siteContent);
      window.__revealRescan && window.__revealRescan();
    }
  } catch (error) {
    console.warn('Firestore connection failed; using local starter content:', error);
  }
}
syncRemoteContent();

// ==== Sticky Spotify-style music player for the featured song ====
(function initMusicPlayer() {
  const playButton = document.querySelector('.play-button');
  if (!playButton) return;
  const playIcon = playButton.querySelector('.play-icon');
  let bar = null, timeline = null, progress = null, currentEl = null, totalEl = null, toggleBtn = null, hintEl = null, seeking = false;

  const setCardPlaying = (on) => {
    playButton.classList.toggle('is-playing', on);
    if (playIcon) playIcon.textContent = on ? 'Ⅱ' : '▶';
    if (playButton.lastChild) playButton.lastChild.textContent = on ? ' Playing now' : ' Play this one';
  };
  const fmt = (s) => {
    if (!isFinite(s) || s < 0) return '0:00';
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };
  const songSrc = (song) => (song && song.src) ? song.src : 'src/tum-tak.mp3';

  // Pre-buffer the song during page load so play() is instant on click
  let audio = new Audio(songSrc((window.siteContent && window.siteContent.featuredSong)));
  audio.preload = 'auto';
  audio.dataset.src = songSrc((window.siteContent && window.siteContent.featuredSong));
  audio.load();
  playButton.addEventListener('pointerenter', () => audio.load(), { once: false });

  function buildPlayer() {
    const cover = document.querySelector('.album-cover img');
    bar = document.createElement('div');
    bar.className = 'mini-player';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Music player');
    bar.innerHTML =
      '<div class="mp-art">' + (cover ? '<img src="' + cover.src + '" alt="">' : '') + '</div>' +
      '<div class="mp-info"><strong class="mp-title"></strong><span class="mp-artist"></span>' +
      '<span class="mp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>' +
      '<button class="mp-toggle" aria-label="Play or pause">▶</button>' +
      '<div class="mp-timeline-wrap"><div class="mp-times"><span class="mp-current">0:00</span><span class="mp-total">0:00</span></div>' +
      '<div class="mp-timeline" aria-hidden="true"><div class="mp-progress"><span class="mp-knob"></span></div></div></div>' +
      '<button class="mp-close" aria-label="Close player">✕</button>' +
      '<div class="mp-hint"></div>';
    document.body.appendChild(bar);
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('mp-open')));
    timeline = bar.querySelector('.mp-timeline');
    progress = bar.querySelector('.mp-progress');
    currentEl = bar.querySelector('.mp-current');
    totalEl = bar.querySelector('.mp-total');
    toggleBtn = bar.querySelector('.mp-toggle');
    hintEl = bar.querySelector('.mp-hint');
    bar.querySelector('.mp-close').addEventListener('click', () => {
      if (audio) audio.pause();
      bar.classList.remove('mp-open', 'mp-error');
      document.body.classList.remove('mp-active');
      setCardPlaying(false);
    });
    toggleBtn.addEventListener('click', () => togglePlay());
    timeline.addEventListener('pointerdown', (e) => {
      seeking = true;
      try { timeline.setPointerCapture(e.pointerId); } catch (err) {}
      seekTo(e.clientX);
    });
    timeline.addEventListener('pointermove', (e) => { if (seeking) seekTo(e.clientX); });
    timeline.addEventListener('pointerup', () => { seeking = false; });
    timeline.addEventListener('pointercancel', () => { seeking = false; });
  }

  function wireAudio() {
    audio.addEventListener('play', () => {
      bar.classList.add('is-playing');
      toggleBtn.textContent = 'Ⅱ';
      setCardPlaying(true);
    });
    audio.addEventListener('pause', () => {
      bar.classList.remove('is-playing');
      toggleBtn.textContent = '▶';
      setCardPlaying(false);
    });
    audio.addEventListener('timeupdate', () => {
      if (seeking || !audio.duration) return;
      progress.style.width = (audio.currentTime / audio.duration) * 100 + '%';
      currentEl.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => { totalEl.textContent = fmt(audio.duration); });
    audio.addEventListener('ended', () => { audio.currentTime = 0; audio.pause(); });
    audio.addEventListener('error', () => {
      bar.classList.add('mp-error');
      hintEl.textContent = '🎧 Add your song at ' + songSrc() + ' to hear it';
      toggleBtn.textContent = '▶';
      setCardPlaying(false);
    });
  }

  function seekTo(clientX) {
    if (!audio || !audio.duration) return;
    const rect = timeline.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    progress.style.width = pct * 100 + '%';
    currentEl.textContent = fmt(audio.currentTime);
  }

  function togglePlay(force) {
    if (!audio) return;
    const shouldPlay = force === undefined ? audio.paused : force;
    if (shouldPlay) audio.play().catch(() => {});
    else audio.pause();
  }

  playButton.addEventListener('click', () => {
    const song = (window.siteContent && window.siteContent.featuredSong) || { title: 'Tum Tak', artist: 'Javed Ali, AR Rahman' };
    if (!bar) {
      buildPlayer();
      wireAudio();
    }
    bar.querySelector('.mp-title').textContent = song.title || 'Featured song';
    bar.querySelector('.mp-artist').textContent = song.artist || '';
    const src = songSrc(song);
    if (audio.dataset.src !== src) { audio.dataset.src = src; audio.src = src; audio.load(); }
    bar.classList.add('mp-open');
    document.body.classList.add('mp-active');
    togglePlay(true);
  });
})();


// ==== Safe scroll-reveal + micro-animations (guarded by html.js-anim) ====
(function initAnimations() {
  document.documentElement.classList.add('js-anim');
  const selectors = [
    '.intro-grid', '.section-heading', '.company-intro', '.company-description',
    '.company-meta', '.project-card', '.feature-music', '.list-header', '.track-row',
    '.film-card', '.work-intro', '.skills > div', '.footer-top', '.footer-bottom',
    '.music-feature-copy', '.now-section .company-intro', '.connect-section .section-heading',
    '.now-section .section-heading', '.top-list'
  ].join(',');
  const tagAll = () => {
    document.querySelectorAll(selectors).forEach((el) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      const siblings = Array.from(el.parentElement ? el.parentElement.children : [])
        .filter((c) => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
    });
  };
  tagAll();
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    window.__revealRescan = () => {
      tagAll();
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));
    };
  }
  const revealAll = () => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  if (io) window.__revealRescan();
  else revealAll();
  // Safety net: anything still hidden after 1.4s that's near the viewport shows anyway
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.2) el.classList.add('is-visible');
    });
  }, 1400);
  // Absolute fallback: never leave content hidden

// ==== Ambient parallax: hero art, stamp and scribble drift as you scroll ====
(function initParallax() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const art = document.querySelector('.hero-art');
  const stamp = document.querySelector('.hero-stamp');
  const scribble = document.querySelector('.scribble');
  if (!art && !stamp && !scribble) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (art) art.style.translate = `0 ${y * 0.06}px`;
      if (scribble) scribble.style.translate = `0 ${y * -0.09}px`;
      if (stamp) stamp.style.translate = `0 ${y * 0.12}px`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ==== Mouse tilt: portrait gently follows the cursor on desktop ====
(function initTilt() {
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frame = document.querySelector('.portrait-frame');
  const wrap = frame ? frame.parentElement : null;
  if (!frame || !wrap) return;
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    frame.style.transform = `rotate(3deg) translate(${(dx * 12).toFixed(1)}px, ${(dy * 12).toFixed(1)}px)`;
  });
  wrap.addEventListener('mouseleave', () => { frame.style.transform = ''; });
})();
  setTimeout(revealAll, 4000);
})();

// ==== Dark mode: light is ALWAYS the default & first mode ====
// Choice is remembered, but a fresh visitor always gets the light theme.
(function initTheme() {
  const KEY = 'as-theme';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  function syncToggles() {
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
      btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  // circular wipe from the toggle button; new theme is revealed underneath
  function sweep(x, y, toDark) {
    const s = document.createElement('div');
    s.className = 'theme-sweep';
    s.style.setProperty('--sx', x + 'px');
    s.style.setProperty('--sy', y + 'px');
    s.style.setProperty('--sc', toDark ? '#141310' : '#f4f0e8');
    document.body.appendChild(s);
    requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('grow')));
    setTimeout(() => {
      root.setAttribute('data-theme', toDark ? 'dark' : 'light');
      syncToggles();
      s.classList.add('fade');
      setTimeout(() => s.remove(), 700);
    }, 660);
  }

  function introToast() {
    let seen = true;
    try { seen = localStorage.getItem(KEY + '-intro') === '1'; } catch (e) { seen = true; }
    if (seen) return;
    try { localStorage.setItem(KEY + '-intro', '1'); } catch (e) {}
    const t = document.createElement('div');
    t.className = 'theme-intro';
    t.textContent = '☾ dark mode unlocked — tap again anytime';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 4200);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle');
    if (!btn) return;
    const toDark = !isDark();
    try { localStorage.setItem(KEY, toDark ? 'dark' : 'light'); } catch (err) {}
    if (reduced) {
      root.setAttribute('data-theme', toDark ? 'dark' : 'light');
      syncToggles();
      return;
    }
    const r = btn.getBoundingClientRect();
    sweep(r.left + r.width / 2, r.top + r.height / 2, toDark);
    if (toDark) introToast();
  });

  syncToggles();
})();
