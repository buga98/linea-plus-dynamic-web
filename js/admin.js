import {
  getCollection,
  saveItem,
  deleteItem,
  seedDefaults,
  loginAdmin,
  logoutAdmin,
  getAdminUser,
  getModeLabel,
  getProjectIdLabel,
  uploadAsset
} from './cms-api.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const collections = ['settings', 'menu', 'services', 'process', 'products', 'gallery', 'reviews', 'inquiries'];
const titles = {
  dashboard: 'Početak', settings: 'Naslovnica', menu: 'Dinamički meni', services: 'Usluge',
  process: 'Proces rada', products: 'Portfolio', gallery: 'Galerija webova', reviews: 'Recenzije', inquiries: 'Upiti'
};
const singular = {
  settings: 'postavke', menu: 'stavku menija', services: 'uslugu', process: 'korak procesa',
  products: 'projekt', gallery: 'prikaz weba', reviews: 'recenziju', inquiries: 'upit'
};

const schemas = {
  settings: [
    section('Brend i kontakt'),
    field('brandName', 'Naziv brenda', 'text', { required: true }),
    field('email', 'Kontakt email', 'email', { required: true }),
    field('phone', 'Telefon', 'text'),
    field('location', 'Lokacija / način rada', 'text'),
    section('Naslovnica'),
    field('heroEyebrow', 'Mali naslov iznad hero naslova', 'text'),
    field('heroLine1', 'Hero — prvi red', 'text'),
    field('heroAccent', 'Hero — plavi red', 'text'),
    field('heroLine3', 'Hero — treći red', 'text'),
    field('heroLead', 'Hero opis', 'textarea', { full: true }),
    section('O nama'),
    field('aboutKicker', 'Uvodna rečenica', 'text', { full: true }),
    field('aboutBefore', 'Naslov prije naglaska', 'text'),
    field('aboutAccent', 'Naglašeni dio naslova', 'text'),
    field('aboutAfter', 'Naslov poslije naglaska', 'text', { full: true }),
    field('aboutText', 'O nama tekst', 'textarea', { full: true }),
    section('Kontakt sekcija'),
    field('contactBefore', 'Kontakt naslov — prvi red', 'text'),
    field('contactAccent', 'Kontakt naslov — naglašeni red', 'text'),
    field('contactText', 'Kontakt opis', 'textarea', { full: true }),
    field('instagram', 'Instagram link', 'url'),
    field('linkedin', 'LinkedIn link', 'url')
  ],
  menu: [
    field('label', 'Naziv stavke', 'text', { required: true }),
    field('href', 'Link / sidro', 'text', { required: true, placeholder: '#portfolio' }),
    field('order', 'Redoslijed', 'number', { value: 1 }),
    field('published', 'Prikaži u meniju', 'checkbox', { value: true })
  ],
  services: [
    field('number', 'Broj', 'text', { placeholder: '01' }),
    field('title', 'Naziv usluge', 'text', { required: true }),
    field('text', 'Opis usluge', 'textarea', { full: true, required: true }),
    field('tags', 'Oznake, odvojene zarezom', 'text', { full: true, placeholder: 'UX/UI, Scrollytelling, Mini CMS' }),
    field('icon', 'Ikona / znak', 'text', { placeholder: '↗' }),
    field('order', 'Redoslijed', 'number', { value: 1 }),
    field('published', 'Prikaži na webu', 'checkbox', { value: true })
  ],
  process: [
    field('number', 'Broj', 'text', { placeholder: '01' }),
    field('title', 'Naziv koraka', 'text', { required: true }),
    field('text', 'Opis koraka', 'textarea', { full: true, required: true }),
    field('order', 'Redoslijed', 'number', { value: 1 }),
    field('published', 'Prikaži na webu', 'checkbox', { value: true })
  ],
  products: [
    field('title', 'Naziv projekta', 'text', { required: true }),
    field('type', 'Vrsta projekta', 'text', { placeholder: 'Brand web + Mini CMS' }),
    field('description', 'Opis projekta', 'textarea', { full: true, required: true }),
    field('image', 'Screenshot / glavna slika', 'image', { full: true }),
    field('color', 'Boja projekta', 'color', { value: '#087cff' }),
    field('tags', 'Tehnologije / oznake, odvojene zarezom', 'text', { full: true, placeholder: 'Web, Firebase, Mini CMS' }),
    field('stat', 'Glavni rezultat', 'text', { full: true, placeholder: '100% dinamičan sadržaj' }),
    field('order', 'Redoslijed', 'number', { value: 1 }),
    field('published', 'Prikaži na webu', 'checkbox', { value: true }),
    field('featured', 'Istaknuti projekt', 'checkbox', { value: true })
  ],
  gallery: [
    field('title', 'Naziv prikaza', 'text', { required: true }),
    field('category', 'Kategorija', 'text', { placeholder: 'Web + Mini CMS' }),
    field('image', 'Screenshot pune kvalitete', 'image', { full: true }),
    field('order', 'Redoslijed', 'number', { value: 1 }),
    field('published', 'Prikaži na webu', 'checkbox', { value: true })
  ],
  reviews: [
    field('quote', 'Tekst recenzije', 'textarea', { full: true, required: true }),
    field('name', 'Ime klijenta', 'text', { required: true }),
    field('role', 'Funkcija / firma', 'text'),
    field('rating', 'Ocjena 1–5', 'number', { value: 5, min: 1, max: 5 }),
    field('order', 'Redoslijed', 'number', { value: 1 }),
    field('published', 'Prikaži na webu', 'checkbox', { value: true })
  ]
};

let state = { active: 'dashboard' };
for (const name of collections) state[name] = [];
let editing = null;

init();

function field(name, label, type = 'text', options = {}) {
  return { kind: 'field', name, label, type, ...options };
}
function section(label) { return { kind: 'section', label }; }

async function init() {
  $('[data-mode]').textContent = getModeLabel();
  $('[data-project-id]').textContent = `SITE_ID: ${getProjectIdLabel()}`;
  bindLogin();
  bindGlobalActions();
  const user = await getAdminUser();
  if (user) await showAdmin();
}

function bindLogin() {
  $('[data-login-form]').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = $('[data-login-message]');
    const button = $('button[type="submit"]', form);
    message.textContent = 'Prijavljujem...';
    button.disabled = true;
    try {
      await loginAdmin(form.email.value.trim(), form.password.value);
      await showAdmin();
      toast('Prijava uspješna.');
    } catch (error) {
      message.textContent = error.message || 'Prijava nije uspjela.';
    } finally {
      button.disabled = false;
    }
  });
}

function bindGlobalActions() {
  $$('[data-tab]').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));
  $('[data-logout]').addEventListener('click', async () => { await logoutAdmin(); location.reload(); });
  $('[data-seed]').addEventListener('click', async () => {
    if (!confirm('Vratiti početni Linea+ sadržaj u sve kolekcije? Postojeći zapisi s istim ID-em bit će prepisani.')) return;
    try {
      await seedDefaults();
      await refresh();
      toast('Početni sadržaj je spremljen.');
    } catch (error) { toast(error.message || 'Spremanje nije uspjelo.'); }
  });
  $('[data-close-modal]').addEventListener('click', closeModal);
  $('[data-modal]').addEventListener('click', event => { if (event.target.matches('[data-modal]')) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
}

async function showAdmin() {
  $('[data-login]').classList.add('hidden');
  $('[data-admin]').classList.remove('hidden');
  await refresh();
}

async function refresh() {
  const values = await Promise.all(collections.map(name => getCollection(name)));
  collections.forEach((name, index) => { state[name] = values[index]; });
  renderAllViews();
}

function setTab(tab) {
  state.active = tab;
  $$('[data-tab]').forEach(button => button.classList.toggle('is-active', button.dataset.tab === tab));
  $$('.view').forEach(view => view.classList.toggle('hidden', view.dataset.view !== tab));
  $('[data-title]').textContent = titles[tab] || 'Početak';
}

function renderAllViews() {
  renderDashboard();
  renderSettings();
  renderCollectionView('menu', 'Stavke glavnog menija', 'Uredi nazive, sidra i redoslijed navigacije.', 'Nova stavka menija');
  renderCollectionView('services', 'Usluge i rješenja', 'Dodaj sve što Linea+ nudi klijentima.', 'Nova usluga');
  renderCollectionView('process', 'Proces rada', 'Objasni klijentu kako od ideje dolazite do lansiranja.', 'Novi korak');
  renderCollectionView('products', 'Portfolio aplikacija', 'Projekti se prikazuju kao veliki desktop i mobilni mockupovi.', 'Novi projekt');
  renderCollectionView('gallery', 'Galerija webova', 'Dodaj originalne screenshote. Slike se ne komprimiraju.', 'Novi prikaz');
  renderCollectionView('reviews', 'Recenzije klijenata', 'Dodaj izjave, ime, funkciju i ocjenu.', 'Nova recenzija');
  renderInquiries();
}

function renderDashboard() {
  const view = $('[data-view="dashboard"]');
  view.innerHTML = `
    <div class="quick-grid">
      ${quickCard('fa-laptop-code', 'Dodaj projekt', 'Portfolio s desktop i mobilnim prikazom.', 'Novi projekt', 'products')}
      ${quickCard('fa-mobile-screen', 'Dodaj screenshot', 'Originalna slika bez kompresije.', 'Nova slika', 'gallery')}
      ${quickCard('fa-star', 'Dodaj recenziju', 'Društveni dokaz koji gradi povjerenje.', 'Nova recenzija', 'reviews')}
      ${quickCard('fa-layer-group', 'Dodaj uslugu', 'Nova usluga odmah se pojavljuje na webu.', 'Nova usluga', 'services')}
    </div>
    <div class="metrics">
      <div class="metric"><strong>${state.products.length}</strong><span>Portfolio projekti</span></div>
      <div class="metric"><strong>${state.gallery.length}</strong><span>Galerijski prikazi</span></div>
      <div class="metric"><strong>${state.reviews.length}</strong><span>Recenzije</span></div>
      <div class="metric"><strong>${state.inquiries.length}</strong><span>Upiti klijenata</span></div>
    </div>
    <div class="panel">
      <div class="panel-head"><div><h2>Kako Linea+ CMS radi?</h2><p>Odaberi sekciju, dodaj ili uredi zapis i klikni Spremi. Javni web čita sadržaj iz projekta <b>${esc(getProjectIdLabel())}</b>.</p></div></div>
      <div class="steps mini">
        <div><b>1</b><span>Naslovnica mijenja glavne tekstove i kontakt.</span></div>
        <div><b>2</b><span>Portfolio i galerija koriste originalne slike.</span></div>
        <div><b>3</b><span>Upiti iz kontakt forme dolaze ovdje.</span></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><div><h2>Zadnji upiti</h2><p>Brzi pregled novih potencijalnih klijenata.</p></div><button class="btn" data-go="inquiries"><i class="fa-solid fa-inbox"></i> Svi upiti</button></div>
      ${renderInquiryTable(state.inquiries.slice(0, 5))}
    </div>`;
  bindCrud(view);
  $('[data-go="inquiries"]', view)?.addEventListener('click', () => setTab('inquiries'));
}

function quickCard(icon, title, text, button, collection) {
  return `<div class="quick-card"><i class="fa-solid ${icon}"></i><h3>${esc(title)}</h3><p>${esc(text)}</p><button class="btn primary small" data-add="${collection}"><i class="fa-solid fa-plus"></i> ${esc(button)}</button></div>`;
}

function renderSettings() {
  const view = $('[data-view="settings"]');
  const settings = state.settings.find(item => item.id === 'settings-main') || state.settings[0];
  view.innerHTML = `
    <div class="panel">
      <div class="panel-head"><div><h2>Naslovnica i kontakt</h2><p>Ovdje mijenjaš glavne prodajne poruke, O nama tekst i kontakt podatke.</p></div><button class="btn primary" data-edit="settings" data-id="${esc(settings?.id || 'settings-main')}"><i class="fa-solid fa-pen"></i> Uredi naslovnicu</button></div>
      <div class="content-card"><div class="content-card__body"><p class="eyebrow">Hero naslov</p><h3>${esc(settings?.heroLine1 || 'Ne radimo samo web.')} ${esc(settings?.heroAccent || 'Gradimo razlog')} ${esc(settings?.heroLine3 || 'da vas zapamte.')}</h3><p>${esc(settings?.heroLead || '')}</p><div class="meta-row"><span class="pill">${esc(settings?.email || '')}</span><span class="pill">${esc(settings?.phone || '')}</span></div></div></div>
    </div>`;
  bindCrud(view);
}

function renderCollectionView(collection, heading, description, addLabel) {
  const view = $(`[data-view="${collection}"]`);
  view.innerHTML = `
    <div class="panel">
      <div class="panel-head"><div><h2>${esc(heading)}</h2><p>${esc(description)}</p></div><button class="btn primary" data-add="${collection}"><i class="fa-solid fa-plus"></i> ${esc(addLabel)}</button></div>
      ${renderCards(collection, state[collection])}
    </div>`;
  bindCrud(view);
}

function renderCards(collection, items) {
  if (!items.length) return '<div class="empty-card">Još nema zapisa. Klikni gumb za dodavanje.</div>';
  return `<div class="content-grid">${items.map(item => card(collection, item)).join('')}</div>`;
}

function card(collection, item) {
  const image = item.image ? `<div class="content-card__img"><img src="${safeImage(item.image)}" alt="" /></div>` : '';
  const title = item.title || item.label || item.name || `Zapis ${item.id}`;
  let body = '';
  let meta = '';

  if (collection === 'menu') {
    body = item.href || '';
    meta = `<span class="pill">Red ${Number(item.order) || 1}</span>${publishedPill(item)}`;
  } else if (collection === 'services') {
    body = item.text || '';
    meta = `<span class="pill">${esc(item.number || '')}</span><span class="pill">Red ${Number(item.order) || 1}</span>${publishedPill(item)}`;
  } else if (collection === 'process') {
    body = item.text || '';
    meta = `<span class="pill">${esc(item.number || '')}</span><span class="pill">Red ${Number(item.order) || 1}</span>${publishedPill(item)}`;
  } else if (collection === 'products') {
    body = item.description || '';
    meta = `<span class="pill red">${esc(item.type || 'Projekt')}</span><span class="pill">Red ${Number(item.order) || 1}</span>${publishedPill(item)}`;
  } else if (collection === 'gallery') {
    body = item.category || '';
    meta = `<span class="pill">Red ${Number(item.order) || 1}</span>${publishedPill(item)}`;
  } else if (collection === 'reviews') {
    body = item.quote || '';
    meta = `<span class="pill red">${'★'.repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))}</span><span class="pill">${esc(item.role || '')}</span>${publishedPill(item)}`;
  }

  return `<article class="content-card">${image}<div class="content-card__body"><h3>${esc(title)}</h3><p>${esc(short(body, 150))}</p><div class="meta-row">${meta}</div><div class="actions"><button class="btn small" data-edit="${collection}" data-id="${esc(item.id)}"><i class="fa-solid fa-pen"></i> Uredi</button><button class="btn small danger" data-delete="${collection}" data-id="${esc(item.id)}"><i class="fa-solid fa-trash"></i> Obriši</button></div></div></article>`;
}

function publishedPill(item) {
  return item.published === false ? '<span class="pill">Skriveno</span>' : '<span class="pill green">Objavljeno</span>';
}

function renderInquiries() {
  const view = $('[data-view="inquiries"]');
  view.innerHTML = `
    <div class="panel">
      <div class="panel-head"><div><h2>Upiti potencijalnih klijenata</h2><p>Poruke iz kontakt forme. Najnoviji upit je prvi.</p></div></div>
      ${renderInquiryTable(state.inquiries)}
    </div>`;
  bindCrud(view);
}

function renderInquiryTable(items) {
  if (!items.length) return '<div class="empty-card">Još nema upita.</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Vrijeme</th><th>Ime</th><th>Kontakt</th><th>Projekt</th><th>Poruka</th><th>Akcija</th></tr></thead><tbody>${items.map(item => `<tr><td>${esc(formatDate(item.createdAt))}</td><td><b>${esc(item.name || '-')}</b></td><td>${item.email ? `<a href="mailto:${esc(item.email)}">${esc(item.email)}</a>` : '-'}<br>${item.phone ? `<a href="tel:${esc(item.phone)}">${esc(item.phone)}</a>` : ''}</td><td>${esc(item.type || '-')}</td><td>${esc(short(item.message || '', 130))}</td><td><button class="icon-btn" data-delete="inquiries" data-id="${esc(item.id)}" title="Obriši"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('')}</tbody></table></div>`;
}

function bindCrud(root) {
  $$('[data-add]', root).forEach(button => button.addEventListener('click', () => openEditor(button.dataset.add)));
  $$('[data-edit]', root).forEach(button => button.addEventListener('click', () => openEditor(button.dataset.edit, button.dataset.id)));
  $$('[data-delete]', root).forEach(button => button.addEventListener('click', () => removeRecord(button.dataset.delete, button.dataset.id)));
}

async function removeRecord(collection, id) {
  if (!confirm(`Obrisati ${singular[collection] || 'zapis'}?`)) return;
  try {
    await deleteItem(collection, id);
    await refresh();
    toast('Zapis je obrisan.');
  } catch (error) { toast(error.message || 'Brisanje nije uspjelo.'); }
}

function openEditor(collection, id = '') {
  if (!schemas[collection]) return;
  const item = id ? state[collection].find(record => record.id === id) : null;
  editing = { collection, item: item || null };
  $('[data-modal-kicker]').textContent = titles[collection] || 'Zapis';
  $('[data-modal-title]').textContent = item ? `Uredi ${singular[collection]}` : `Dodaj ${singular[collection]}`;
  $('[data-editor-form]').innerHTML = buildForm(collection, item || {});
  bindEditorForm(collection, item || {});
  $('[data-modal]').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function buildForm(collection, item) {
  const fields = schemas[collection];
  let html = '<div class="form-grid">';
  let sectionOpen = false;

  for (const spec of fields) {
    if (spec.kind === 'section') {
      if (sectionOpen) html += '</div></div>';
      html += `<div class="form-section field full"><h3>${esc(spec.label)}</h3><div class="form-grid">`;
      sectionOpen = true;
      continue;
    }
    html += renderField(spec, item[spec.name]);
  }
  if (sectionOpen) html += '</div></div>';
  html += '</div>';
  html += `<input type="hidden" name="id" value="${esc(item.id || '')}" /><div class="form-actions"><button class="btn" type="button" data-cancel>Odustani</button><button class="btn primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Spremi</button></div><div class="message" data-editor-message></div>`;
  return html;
}

function renderField(spec, rawValue) {
  const value = rawValue ?? spec.value ?? '';
  const classes = `field ${spec.full ? 'full' : ''}`;
  const required = spec.required ? 'required' : '';
  const placeholder = spec.placeholder ? `placeholder="${esc(spec.placeholder)}"` : '';
  const min = spec.min !== undefined ? `min="${spec.min}"` : '';
  const max = spec.max !== undefined ? `max="${spec.max}"` : '';

  if (spec.type === 'checkbox') {
    const checked = rawValue === undefined ? spec.value !== false : rawValue !== false;
    return `<div class="field ${spec.full ? 'full' : ''}"><label>${esc(spec.label)}</label><div class="check-row"><label><input name="${spec.name}" type="checkbox" ${checked ? 'checked' : ''} /> Da</label></div></div>`;
  }

  if (spec.type === 'textarea') {
    return `<div class="${classes}"><label>${esc(spec.label)}</label><textarea name="${spec.name}" ${required} ${placeholder}>${esc(value)}</textarea></div>`;
  }

  if (spec.type === 'image') {
    const src = value ? safeImage(value) : '../assets/project-flowdesk.svg';
    return `<div class="field full"><label>${esc(spec.label)}</label><div class="image-uploader"><div class="image-preview"><img src="${src}" data-image-preview alt="Pregled slike" /><div><b>Originalna datoteka, bez kompresije</b><span>Možeš odabrati JPG, PNG, WebP, GIF ili SVG. U Firebase Storage sprema se original koji odabereš.</span><div class="progress"><i data-upload-progress></i></div><small data-upload-label>${value ? 'Trenutna slika je postavljena.' : 'Još nije odabrana slika.'}</small></div></div><label class="upload-box"><input type="file" name="${spec.name}File" accept="image/*" /><div><strong>Odaberi originalnu sliku</strong><span>Klikni ili povuci datoteku ovdje.</span></div></label><div class="field image-url-row"><label>Ili zalijepi URL / lokalnu putanju</label><input name="${spec.name}" type="text" value="${esc(value)}" placeholder="assets/projekt.svg ili https://..." /></div></div></div>`;
  }

  return `<div class="${classes}"><label>${esc(spec.label)}</label><input name="${spec.name}" type="${spec.type}" value="${esc(value)}" ${required} ${placeholder} ${min} ${max} /></div>`;
}

function bindEditorForm(collection, original) {
  const form = $('[data-editor-form]');
  $('[data-cancel]', form).addEventListener('click', closeModal);
  const fileInput = $('input[type="file"]', form);
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const preview = $('[data-image-preview]', form);
      preview.src = URL.createObjectURL(file);
      $('[data-upload-label]', form).textContent = `${file.name} · ${formatBytes(file.size)} · čuva se original`;
    });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = $('button[type="submit"]', form);
    const message = $('[data-editor-message]', form);
    button.disabled = true;
    message.textContent = 'Spremam...';

    try {
      const payload = collectPayload(collection, form, original);
      if (fileInput?.files?.[0]) {
        const folder = collection === 'products' ? 'portfolio' : collection;
        payload.image = await uploadAsset(fileInput.files[0], folder, progress => {
          $('[data-upload-progress]', form).style.width = `${progress.percent || 0}%`;
          $('[data-upload-label]', form).textContent = progress.label || 'Upload...';
        });
      }
      await saveItem(collection, payload);
      closeModal();
      await refresh();
      toast('Promjena je spremljena.');
    } catch (error) {
      console.error(error);
      message.textContent = error.message || 'Spremanje nije uspjelo.';
    } finally {
      button.disabled = false;
    }
  });
}

function collectPayload(collection, form, original) {
  const payload = { ...original };
  for (const spec of schemas[collection]) {
    if (spec.kind !== 'field') continue;
    const control = form.elements[spec.name];
    if (!control) continue;
    if (spec.type === 'checkbox') payload[spec.name] = control.checked;
    else if (spec.type === 'number') payload[spec.name] = Number(control.value) || 0;
    else payload[spec.name] = control.value.trim();
  }
  payload.id = form.elements.id.value || original.id || '';
  return payload;
}

function closeModal() {
  $('[data-modal]').classList.remove('is-open');
  document.body.style.overflow = '';
  editing = null;
}

function toast(text) {
  const element = $('[data-toast]');
  element.textContent = text;
  element.classList.add('is-visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('is-visible'), 2800);
}

function esc(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function short(value = '', length = 120) {
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}
function safeImage(value = '') {
  const url = String(value || '').trim();
  if (/^assets\//i.test(url)) return esc(`../${url}`);
  if (/^\.\/assets\//i.test(url)) return esc(`.${url}`);
  if (/^(https?:\/\/|data:image\/|blob:|\.\.\/)/i.test(url)) return esc(url);
  return '../assets/project-flowdesk.svg';
}
function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
function formatBytes(bytes = 0) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}
