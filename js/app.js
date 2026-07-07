import { getCollection, submitInquiry, getModeLabel, getProjectIdLabel, isRemoteMode } from './cms-api.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const state = {
  settings: {},
  menu: [],
  services: [],
  process: [],
  products: [],
  gallery: [],
  reviews: []
};

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeUrl(value = '', fallback = 'assets/project-flowdesk.svg') {
  const url = String(value || '').trim();
  if (!url) return fallback;
  if (/^(https?:\/\/|data:image\/|blob:|assets\/|\.\/assets\/)/i.test(url)) return esc(url);
  return fallback;
}

function published(items) {
  return items.filter(item => item.published !== false && item.enabled !== false);
}

function tags(value) {
  if (Array.isArray(value)) return value;
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function setText(selector, value) {
  const element = $(selector);
  if (element && value !== undefined && value !== null && value !== '') element.textContent = value;
}

function renderMenu(items) {
  const links = published(items)
    .sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999))
    .map(item => `<a href="${esc(item.href || '#kontakt')}">${esc(item.label || 'Stavka')}</a>`)
    .join('');
  $('#desktop-menu').innerHTML = links;
  $('#mobile-menu').innerHTML = links;
}

function renderServices(items) {
  $('#services-grid').innerHTML = published(items).map(service => `
    <article class="service-card reveal-up">
      <div class="service-top"><span>${esc(service.number || '')}</span><i>${esc(service.icon || '↗')}</i></div>
      <h3>${esc(service.title || '')}</h3>
      <p>${esc(service.text || '')}</p>
      <div class="tag-row">${tags(service.tags).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
    </article>
  `).join('');
}

function renderProcess(items) {
  $('#process-list').innerHTML = published(items).map(step => `
    <article class="process-step reveal-up">
      <span>${esc(step.number || '')}</span>
      <div><h3>${esc(step.title || '')}</h3><p>${esc(step.text || '')}</p></div>
      <i>↗</i>
    </article>
  `).join('');
}

function renderPortfolio(items) {
  const projects = published(items);
  $('#portfolio-story').innerHTML = projects.map((project, index) => {
    const image = safeUrl(project.image, 'assets/project-flowdesk.svg');
    const color = /^#[0-9a-f]{3,8}$/i.test(project.color || '') ? project.color : '#087cff';
    return `
      <article class="project-panel" style="--project-color:${esc(color)}">
        <div class="project-copy">
          <div class="project-count">${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</div>
          <p class="project-type">${esc(project.type || 'Digitalni proizvod')}</p>
          <h3>${esc(project.title || 'Projekt')}</h3>
          <p class="project-description">${esc(project.description || '')}</p>
          <div class="tag-row">${tags(project.tags).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
          <div class="project-stat"><i></i><span>${esc(project.stat || 'Custom digitalno rješenje')}</span></div>
        </div>
        <div class="project-visual">
          <div class="project-browser">
            <div class="project-browser-bar"><span></span><span></span><span></span></div>
            <img src="${image}" alt="${esc(project.title || 'Projekt')} prikaz projekta" loading="lazy" />
          </div>
          <div class="project-phone">
            <div class="mini-notch"></div>
            <img src="${image}" alt="${esc(project.title || 'Projekt')} mobilni prikaz" loading="lazy" />
          </div>
        </div>
      </article>`;
  }).join('');
}

function renderGallery(items) {
  $('#gallery-track').innerHTML = published(items).map((item, index) => {
    const image = safeUrl(item.image, 'assets/project-mesaco.svg');
    return `
      <article class="showcase-card reveal-up">
        <div class="showcase-number">${String(index + 1).padStart(2, '0')}</div>
        <div class="showcase-devices">
          <div class="showcase-browser"><span></span><img src="${image}" alt="${esc(item.title || 'Projekt')}" loading="lazy" /></div>
          <div class="showcase-phone"><i></i><img src="${image}" alt="${esc(item.title || 'Projekt')} na mobitelu" loading="lazy" /></div>
        </div>
        <div class="showcase-meta"><div><h3>${esc(item.title || 'Projekt')}</h3><p>${esc(item.category || 'Custom web')}</p></div><span>↗</span></div>
      </article>`;
  }).join('');
}

function renderReviews(items) {
  $('#reviews-grid').innerHTML = published(items).map(review => {
    const initials = String(review.name || 'L+').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
    return `
      <article class="review-card reveal-up">
        <div class="stars">${'★'.repeat(rating)}</div>
        <blockquote>“${esc(review.quote || '')}”</blockquote>
        <div class="review-author"><span>${esc(initials)}</span><div><strong>${esc(review.name || '')}</strong><small>${esc(review.role || '')}</small></div></div>
      </article>`;
  }).join('');
}

function applySettings(settings) {
  state.settings = settings || {};
  setText('#hero-eyebrow', settings.heroEyebrow);
  setText('#hero-line-1', settings.heroLine1);
  setText('#hero-accent', settings.heroAccent);
  setText('#hero-line-3', settings.heroLine3);
  setText('#hero-lead', settings.heroLead);
  setText('#about-kicker', settings.aboutKicker);
  setText('#about-before', settings.aboutBefore);
  setText('#about-accent', settings.aboutAccent);
  setText('#about-after', settings.aboutAfter);
  setText('#about-text', settings.aboutText);
  setText('#contact-before', settings.contactBefore);
  setText('#contact-accent', settings.contactAccent);
  setText('#contact-text', settings.contactText);

  const email = settings.email || 'info@linea-plus.hr';
  const emailLink = $('#contact-email');
  emailLink.innerHTML = `${esc(email)} <span>↗</span>`;
  emailLink.href = `mailto:${email}`;

  const phone = settings.phone || '+385 99 000 0000';
  const phoneLink = $('#contact-phone');
  phoneLink.innerHTML = `${esc(phone)} <span>↗</span>`;
  phoneLink.href = `tel:${phone.replace(/[^+\d]/g, '')}`;
  setText('#contact-location', settings.location);
}

function renderAll() {
  renderMenu(state.menu);
  renderServices(state.services);
  renderProcess(state.process);
  renderPortfolio(state.products);
  renderGallery(state.gallery);
  renderReviews(state.reviews);
  applySettings(state.settings);
  initRevealObservers();
  initInteractiveTargets();
}

let revealObserver;
function initRevealObservers() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  }

  $$('.reveal-up:not(.is-observed), .split-reveal:not(.is-observed)').forEach(element => {
    element.classList.add('is-observed');
    revealObserver.observe(element);
  });
}

function initNavigation() {
  const toggle = $('.menu-toggle');
  const panel = $('.mobile-panel');

  const close = () => {
    toggle.classList.remove('is-open');
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = !panel.classList.contains('is-open');
    toggle.classList.toggle('is-open', isOpen);
    panel.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  panel.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
}

function initScrollEffects() {
  const progress = $('.scroll-progress span');
  const header = $('.site-header');
  const heroStage = $('.hero-stage');
  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    header.classList.toggle('is-scrolled', scrollY > 24);

    if (heroStage && innerWidth > 800 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroStage.style.transform = `translate3d(0, ${Math.min(scrollY * 0.105, 82)}px, 0) rotateY(${Math.min(scrollY * 0.006, 1.8)}deg)`;
    }
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

let pointerInitialized = false;
function initPointerEffects() {
  if (pointerInitialized || !matchMedia('(pointer:fine)').matches) return;
  pointerInitialized = true;
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  const animate = () => {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animate);
  };
  animate();
}

function initInteractiveTargets() {
  if (!matchMedia('(pointer:fine)').matches) return;
  $$('a:not([data-pointer]), button:not([data-pointer]), .service-card:not([data-pointer]), .showcase-card:not([data-pointer])').forEach(element => {
    element.dataset.pointer = 'true';
    element.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
    element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  });

  $$('.magnetic:not([data-magnetic])').forEach(element => {
    element.dataset.magnetic = 'true';
    element.addEventListener('mousemove', event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('mouseleave', () => { element.style.transform = ''; });
  });
}

function initContactForm() {
  const form = $('#contact-form');
  const status = $('.form-status');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = $('button[type="submit"]', form);
    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = 'Šaljem upit...';
    button.disabled = true;

    try {
      await submitInquiry(data);
      form.reset();
      status.textContent = isRemoteMode()
        ? 'Upit je poslan. Javljamo se uskoro.'
        : 'Upit je spremljen u lokalnom testnom načinu. Nakon Firebase povezivanja dolazit će u admin.';
    } catch (error) {
      console.error(error);
      status.textContent = `Slanje nije uspjelo. Javite se na ${state.settings.email || 'info@linea-plus.hr'}.`;
    } finally {
      button.disabled = false;
    }
  });
}

async function loadContent() {
  const [settings, menu, services, process, products, gallery, reviews] = await Promise.all([
    getCollection('settings'),
    getCollection('menu'),
    getCollection('services'),
    getCollection('process'),
    getCollection('products'),
    getCollection('gallery'),
    getCollection('reviews')
  ]);

  state.settings = settings.find(item => item.id === 'settings-main') || settings[0] || {};
  state.menu = menu;
  state.services = services;
  state.process = process;
  state.products = products;
  state.gallery = gallery;
  state.reviews = reviews;
  renderAll();
}

async function boot() {
  initNavigation();
  initScrollEffects();
  initPointerEffects();
  initContactForm();
  $('#current-year').textContent = new Date().getFullYear();
  $('#cms-status').textContent = `${getModeLabel()} · SITE_ID: ${getProjectIdLabel()}`;

  try {
    await loadContent();
  } catch (error) {
    console.error('[Linea+] Sadržaj nije učitan.', error);
    $('#cms-status').textContent = `Greška sadržaja · SITE_ID: ${getProjectIdLabel()}`;
  }
}

boot();
