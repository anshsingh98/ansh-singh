import { db } from './firebase-config.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

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
const projectCard = (project) => `<article class="project-card project-${project.color}"><div class="project-card-top"><span>${project.number}</span><span>${project.category}</span></div><div class="project-icon">${project.name.charAt(0)}</div><h3>${project.name}</h3><p>${project.description}</p><div class="project-card-bottom"><small>${project.status}</small><a href="${project.link}" aria-label="Open ${project.name}">↗</a></div></article>`;
const movieCard = (movie, index) => {
  const featured = index === 0 ? ' film-card-feature' : '';
  const image = movie.image ? `<img src="${movie.image}" alt="Cinema seats" />` : '';
  const details = `${movie.director} · ${movie.year}`;
  return `<article class="film-card${featured}">${image}<div class="${featured ? 'film-info' : ''}"><div class="film-number">${String(index + 1).padStart(2, '0')}</div><h3>${movie.title}</h3><p>${details}</p></div>${featured ? '' : '<span class="film-arrow">↗</span>'}</article>`;
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const resolvePath = (obj, path) => path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);

// Plain single-line editable texts
// ==== Intro overlay: plays once per session before the page reveals ====
(function initIntroOverlay() {
  const overlay = document.getElementById('introOverlay');
  if (!overlay) return;
  const finish = () => {
    if (!overlay.isConnected) return;
    overlay.classList.add('is-done');
    setTimeout(() => overlay.remove(), 950);
  };
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { overlay.remove(); return; }
  try {
    if (sessionStorage.getItem('introShown')) { overlay.remove(); return; }
    sessionStorage.setItem('introShown', '1');
  } catch (error) { /* private mode: just play it */ }
  window.setTimeout(finish, 1300);      // matches the CSS build-up timing
  window.setTimeout(() => { if (overlay.isConnected) finish(); }, 3000); // absolute safety net
})();

function applyDataTexts(content) {
  document.querySelectorAll('[data-text]').forEach((el) => {
    const value = resolvePath(content, el.dataset.text);
    if (typeof value === 'string') el.textContent = value;
  });
}

// Headings stored as plain text ("main\naccent line") -> keeps the two-font accent automatically
function headingHtml(text) {
  if (!text) return '';
  const parts = String(text).split('\n');
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

function renderSite(content) {
  if (!content) return;
  applyDataTexts(content);
  applyDataHeadings(content);
  buildTicker(content);
  const profile = { email: '', whatsapp: '', name: 'Ansh', intro: '', currently: 'figuring it out', photo: '', aboutParagraphs: ['', ''], skills: [], ...(content.profile || {}) };
  const brand = { companyName: 'Deepika App Developers', shortName: 'DAD', companyEmail: '', ownerLabel: 'Founder & owner', founded: '2026', description: '', tagline: '', ...(content.brand || {}) };
  const site = content.site || { name: "Ansh Singh's Corner", shortName: 'AS', title: "Ansh Singh's Corner" };
  const copy = content.pageCopy || {};
  const faviconUrl = new URL('favicon.svg', import.meta.url).href;

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

  document.querySelectorAll('[data-copy="homeAboutHeading"]').forEach((el) => { el.textContent = copy.homeAboutHeading || el.textContent; });
  document.querySelectorAll('[data-copy="homeAboutFirst"]').forEach((el) => { el.textContent = copy.homeAboutFirst || el.textContent; });
  document.querySelectorAll('[data-copy="homeAboutSecond"]').forEach((el) => { el.textContent = copy.homeAboutSecond || el.textContent; });
  document.querySelectorAll('[data-copy="projectsNote"]').forEach((el) => { el.textContent = copy.projectsNote || el.textContent; });
  document.querySelectorAll('[data-copy="favouritesHeading"]').forEach((el) => { el.textContent = copy.favouritesHeading || el.textContent; });
  document.querySelectorAll('[data-copy="favouritesIntro"]').forEach((el) => { el.textContent = copy.favouritesIntro || el.textContent; });
  document.querySelectorAll('[data-copy="songsHeading"]').forEach((el) => { el.textContent = copy.songsHeading || el.textContent; });
  document.querySelectorAll('[data-copy="songsIntro"]').forEach((el) => { el.textContent = copy.songsIntro || el.textContent; });
  document.querySelectorAll('[data-copy="moviesHeading"]').forEach((el) => { el.textContent = copy.moviesHeading || el.textContent; });
  document.querySelectorAll('[data-copy="moviesIntro"]').forEach((el) => { el.textContent = copy.moviesIntro || el.textContent; });

  const pageType = document.body.dataset.page;
  if (pageType === 'favourites') {
    document.querySelector('.subpage-hero h1').textContent = copy.favouritesHeading || 'Things I love.';
    document.querySelector('.subpage-hero .hero-intro').textContent = copy.favouritesIntro || '';
  }
  if (pageType === 'songs') {
    document.querySelector('.subpage-hero h1').textContent = copy.songsHeading || 'Every song has a place.';
    document.querySelector('.subpage-hero .hero-intro').textContent = copy.songsIntro || '';
  }
  if (pageType === 'movies') {
    document.querySelector('.subpage-hero h1').textContent = copy.moviesHeading || 'Stories I return to.';
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
// Content is fetched on page load and re-rendered in real time whenever the
// admin saves, so every visitor sees the same shared content.
async function syncRemoteContent() {
  try {
    const docRef = doc(db, 'site', 'content');
    onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        window.siteContent = { ...window.siteContent, ...snap.data() };
        renderSite(window.siteContent);
        window.__revealRescan && window.__revealRescan();
      }
    }, (error) => {
      console.warn('Firestore connection failed; using local starter content:', error);
    });
  } catch (error) {
    console.warn('Firestore connection failed; using local starter content:', error);
  }
}
syncRemoteContent();

document.querySelector('.play-button')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  button.classList.toggle('is-playing');
  button.querySelector('.play-icon').textContent = button.classList.contains('is-playing') ? 'Ⅱ' : '▶';
  button.lastChild.textContent = button.classList.contains('is-playing') ? ' Playing now' : ' Play this one';
});


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