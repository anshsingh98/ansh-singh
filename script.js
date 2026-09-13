const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');
const content = window.siteContent;

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

if (content) {
  const { profile, brand } = content;
  const copy = content.pageCopy || {};
  document.querySelectorAll('[data-email-link]').forEach((link) => {
    link.href = `mailto:${profile.email}`;
  });
  document.querySelectorAll('[data-company-email-link]').forEach((link) => {
    link.href = `mailto:${brand.companyEmail}`;
  });
  document.querySelectorAll('[data-brand-short]').forEach((element) => { element.textContent = brand.shortName; });
  document.querySelectorAll('[data-brand-name]').forEach((element) => { element.textContent = brand.companyName; });
  document.querySelectorAll('[data-brand-name-heading]').forEach((element) => { element.innerHTML = brand.companyName.replace(' App Developers', ' App<br><em>Developers.</em>'); });
  document.querySelectorAll('.wordmark span').forEach((element) => { element.textContent = brand.shortName; });
  document.querySelectorAll('.wordmark strong').forEach((element) => { element.textContent = brand.companyName; });
  document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = `${profile.name}.`; });
  document.querySelectorAll('[data-profile-role]').forEach((element) => { element.textContent = profile.role; });
  document.querySelectorAll('[data-profile-intro]').forEach((element) => { element.textContent = profile.intro; });
  document.querySelectorAll('[data-profile-photo]').forEach((element) => { element.src = profile.photo; });
  document.querySelectorAll('[data-profile-currently]').forEach((element) => { element.textContent = profile.currently; });
  const aboutHeading = document.querySelector('[data-about-heading]');
  if (aboutHeading) aboutHeading.textContent = profile.aboutHeading;
  const aboutParagraphs = document.querySelectorAll('[data-about-paragraph-one], [data-about-paragraph-two]');
  if (aboutParagraphs[0]) aboutParagraphs[0].textContent = profile.aboutParagraphs[0];
  if (aboutParagraphs[1]) aboutParagraphs[1].textContent = profile.aboutParagraphs[1];
  document.querySelectorAll('[data-brand-tagline]').forEach((element) => { element.textContent = brand.tagline; });
  document.querySelectorAll('[data-brand-description]').forEach((element) => { element.textContent = brand.description; });
  document.querySelectorAll('[data-brand-owner-label]').forEach((element) => { element.textContent = brand.ownerLabel; });
  document.querySelectorAll('[data-brand-founded]').forEach((element) => { element.textContent = `EST. ${brand.founded}`; });
  document.querySelectorAll('[data-copy="homeAboutHeading"]').forEach((element) => { element.textContent = copy.homeAboutHeading || element.textContent; });
  document.querySelectorAll('[data-copy="homeAboutFirst"]').forEach((element) => { element.textContent = copy.homeAboutFirst || element.textContent; });
  document.querySelectorAll('[data-copy="homeAboutSecond"]').forEach((element) => { element.textContent = copy.homeAboutSecond || element.textContent; });
  document.querySelectorAll('[data-copy="projectsNote"]').forEach((element) => { element.textContent = copy.projectsNote || element.textContent; });
  document.querySelectorAll('[data-copy="favouritesHeading"]').forEach((element) => { element.textContent = copy.favouritesHeading || element.textContent; });
  document.querySelectorAll('[data-copy="favouritesIntro"]').forEach((element) => { element.textContent = copy.favouritesIntro || element.textContent; });
  document.querySelectorAll('[data-copy="songsHeading"]').forEach((element) => { element.textContent = copy.songsHeading || element.textContent; });
  document.querySelectorAll('[data-copy="songsIntro"]').forEach((element) => { element.textContent = copy.songsIntro || element.textContent; });
  document.querySelectorAll('[data-copy="moviesHeading"]').forEach((element) => { element.textContent = copy.moviesHeading || element.textContent; });
  document.querySelectorAll('[data-copy="moviesIntro"]').forEach((element) => { element.textContent = copy.moviesIntro || element.textContent; });
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
  if (projectList) projectList.innerHTML = content.projects.map(projectCard).join('');

  const extraSections = document.querySelector('#extra-sections');
  if (extraSections) {
    extraSections.innerHTML = (copy.extraSections || []).map((section, index) => `<section class="extra-content-section section-pad"><div class="section-label"><span>${String(index + 5).padStart(2, '0')}</span><i></i><span>${section.title}</span></div><div class="extra-content-grid"><h2>${section.title}</h2><p>${section.text}</p>${section.image ? `<img src="${section.image}" alt="${section.title}" />` : ''}</div></section>`).join('');
  }

  const skillsList = document.querySelector('#skills-list');
  if (skillsList) skillsList.innerHTML = profile.skills.map((skill, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${skill.title}</strong><small>${skill.details}</small></div>`).join('');

  const homeSongs = document.querySelector('#home-song-list');
  if (homeSongs) homeSongs.innerHTML = content.songs.slice(0, 3).map(songRow).join('');

  const fullSongs = document.querySelector('#full-song-list');
  if (fullSongs) fullSongs.insertAdjacentHTML('beforeend', content.songs.map(songRow).join(''));

  const homeMovies = document.querySelector('#home-movie-list');
  if (homeMovies) homeMovies.innerHTML = content.movies.slice(0, 3).map(movieCard).join('');

  const fullMovies = document.querySelector('#full-movie-list');
  if (fullMovies) fullMovies.innerHTML = content.movies.map(movieCard).join('');

  const featuredSong = content.featuredSong;
  document.querySelectorAll('[data-feature-song]').forEach((element) => { element.textContent = featuredSong.title; });
  document.querySelectorAll('[data-feature-artist]').forEach((element) => { element.textContent = featuredSong.artist; });
  const songCount = document.querySelector('#song-count');
  if (songCount) songCount.textContent = `${content.songs.length} songs, no skips.`;
  const movieCount = document.querySelector('#movie-count');
  if (movieCount) movieCount.textContent = `${content.movies.length} films, many feelings.`;
}

document.querySelector('.play-button')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  button.classList.toggle('is-playing');
  button.querySelector('.play-icon').textContent = button.classList.contains('is-playing') ? 'Ⅱ' : '▶';
  button.lastChild.textContent = button.classList.contains('is-playing') ? ' Playing now' : ' Play this one';
});
