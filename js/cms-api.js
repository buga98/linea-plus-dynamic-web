import { SITE_ID, firebaseConfig, getSiteId, isFirebaseConfigured } from './firebase-config.js';
import { DEFAULTS } from './default-data.js';

const LOCAL_PREFIX = 'linea_plus_cms_';
const DEMO_ADMIN_KEY = 'linea_plus_admin_demo';
const ORDERED_COLLECTIONS = new Set(['menu', 'services', 'process', 'products', 'gallery', 'reviews']);
const NEWS_TYPES = { settings: 'settings', menu: 'menu', services: 'service', process: 'process', reviews: 'review' };

let firebaseReadyPromise = null;
let firebaseServices = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `item-${Date.now()}`;
}

function localKey(collectionName) {
  return `${LOCAL_PREFIX}${getSiteId()}_${collectionName}`;
}

function localRead(collectionName) {
  const raw = localStorage.getItem(localKey(collectionName));
  if (raw) {
    try { return JSON.parse(raw); } catch { localStorage.removeItem(localKey(collectionName)); }
  }
  const defaults = clone(DEFAULTS[collectionName] || []);
  localStorage.setItem(localKey(collectionName), JSON.stringify(defaults));
  return defaults;
}

function localWrite(collectionName, value) {
  localStorage.setItem(localKey(collectionName), JSON.stringify(value));
}

async function initFirebase() {
  if (!isFirebaseConfigured) return null;
  if (firebaseServices) return firebaseServices;

  const [{ initializeApp }, firestore, auth, storage] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js')
  ]);

  const app = initializeApp(firebaseConfig);
  firebaseServices = {
    app,
    db: firestore.getFirestore(app),
    auth: auth.getAuth(app),
    storage: storage.getStorage(app),
    fs: firestore,
    authFns: auth,
    st: storage
  };
  return firebaseServices;
}

async function firebase() {
  if (!firebaseReadyPromise) {
    firebaseReadyPromise = initFirebase().catch(error => {
      console.warn('[Linea+ CMS] Firebase nije dostupan.', error);
      return null;
    });
  }
  return firebaseReadyPromise;
}

function physicalCollection(collectionName) {
  return NEWS_TYPES[collectionName] ? 'news' : collectionName;
}

function sitePath(collectionName) {
  return ['projects', getSiteId(), physicalCollection(collectionName)];
}

function filterLogicalCollection(collectionName, items) {
  const expectedType = NEWS_TYPES[collectionName];
  if (!expectedType) return items;
  return items.filter(item => item.contentType === expectedType);
}


function collectionRef(fb, collectionName) {
  return fb.fs.collection(fb.db, ...sitePath(collectionName));
}

function docRef(fb, collectionName, id) {
  return fb.fs.doc(fb.db, ...sitePath(collectionName), id);
}

export function getModeLabel() {
  return isFirebaseConfigured ? `Centralni Firebase · ${getSiteId()}` : 'Lokalni pregled · Firebase config nije zalijepljen';
}

export function getProjectIdLabel() {
  return getSiteId() || SITE_ID;
}

export function isRemoteMode() {
  return isFirebaseConfigured;
}

export async function getCollection(collectionName) {
  const fb = await firebase();
  let items;

  if (!fb) {
    items = localRead(collectionName);
  } else {
    try {
      const snapshot = await fb.fs.getDocs(collectionRef(fb, collectionName));
      items = filterLogicalCollection(collectionName, snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      if (!items.length && DEFAULTS[collectionName]) items = clone(DEFAULTS[collectionName]);
    } catch (error) {
      console.warn(`[Linea+ CMS] Ne mogu učitati ${collectionName}.`, error);
      items = clone(DEFAULTS[collectionName] || []);
    }
  }

  const normalized = items.map(item => normalizeItem(collectionName, item));
  return ORDERED_COLLECTIONS.has(collectionName)
    ? normalized.sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999))
    : normalized.sort(sortNewest);
}

export async function getItem(collectionName, id) {
  const fb = await firebase();
  if (!fb) return localRead(collectionName).map(item => normalizeItem(collectionName, item)).find(item => item.id === id) || null;
  const snapshot = await fb.fs.getDoc(docRef(fb, collectionName, id));
  return snapshot.exists() ? normalizeItem(collectionName, { id: snapshot.id, ...snapshot.data() }) : null;
}

export async function saveItem(collectionName, payload) {
  const item = prepareForSave(collectionName, payload);
  const fb = await firebase();

  if (!fb) {
    const items = localRead(collectionName);
    const index = items.findIndex(existing => existing.id === item.id);
    if (index >= 0) items[index] = item;
    else items.unshift(item);
    localWrite(collectionName, items);
    return normalizeItem(collectionName, item);
  }

  await fb.fs.setDoc(docRef(fb, collectionName, item.id), item, { merge: true });
  return normalizeItem(collectionName, item);
}

export async function deleteItem(collectionName, id) {
  const fb = await firebase();
  if (!fb) {
    localWrite(collectionName, localRead(collectionName).filter(item => item.id !== id));
    return true;
  }
  await fb.fs.deleteDoc(docRef(fb, collectionName, id));
  return true;
}

export async function seedDefaults() {
  for (const collectionName of ['settings', 'menu', 'services', 'process', 'products', 'gallery', 'reviews']) {
    for (const item of DEFAULTS[collectionName] || []) await saveItem(collectionName, item);
  }
  return true;
}

export async function submitInquiry(payload) {
  return saveItem('inquiries', {
    id: `upit-${Date.now()}`,
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
    message: String(payload.message || '').trim(),
    budget: String(payload.budget || '').trim(),
    type: String(payload.type || 'kontakt').trim(),
    createdAt: new Date().toISOString(),
    status: 'novo'
  });
}

export async function uploadAsset(file, folder = 'uploads', onProgress = null) {
  if (!file) return '';
  if (!/^image\//i.test(file.type || '')) throw new Error('Odaberi slikovnu datoteku.');
  if (file.size > 35 * 1024 * 1024) throw new Error('Slika je veća od 35 MB.');

  onProgress?.({ percent: 8, label: `Originalna slika: ${formatBytes(file.size)}` });
  const fb = await firebase();

  if (!fb) {
    const dataUrl = await blobToDataUrl(file);
    onProgress?.({ percent: 100, label: 'Spremljeno lokalno za pregled.' });
    return dataUrl;
  }

  const originalName = file.name || 'slika';
  const extension = (originalName.match(/\.[a-zA-Z0-9]+$/)?.[0] || '.jpg').toLowerCase();
  const safeBase = originalName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'slika';
  const path = `uploads/${getSiteId()}/${folder}/${Date.now()}-${safeBase}${extension}`;
  const ref = fb.st.ref(fb.storage, path);
  const task = fb.st.uploadBytesResumable(ref, file, {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      originalName,
      originalSize: String(file.size || 0),
      storedAs: 'original-no-compression'
    }
  });

  return new Promise((resolve, reject) => {
    task.on('state_changed', snapshot => {
      const ratio = snapshot.totalBytes ? snapshot.bytesTransferred / snapshot.totalBytes : 0;
      const percent = Math.round(10 + ratio * 85);
      onProgress?.({ percent, label: `Upload originalne slike... ${percent}%` });
    }, reject, async () => {
      onProgress?.({ percent: 100, label: 'Originalna slika je spremljena.' });
      resolve(await fb.st.getDownloadURL(task.snapshot.ref));
    });
  });
}

export async function loginAdmin(email, password) {
  const fb = await firebase();
  if (!fb) {
    if (!email || !password) throw new Error('Upiši email i lozinku.');
    const demoUser = { email, demo: true, siteId: getSiteId() };
    sessionStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify(demoUser));
    return demoUser;
  }

  const credential = await fb.authFns.signInWithEmailAndPassword(fb.auth, email, password);
  const adminSnapshot = await fb.fs.getDoc(fb.fs.doc(fb.db, 'projects', getSiteId(), 'admins', credential.user.uid));

  if (!adminSnapshot.exists()) {
    await fb.authFns.signOut(fb.auth);
    throw new Error('Ovaj korisnik nema pristup Linea+ projektu u Builderu.');
  }

  const role = adminSnapshot.data()?.role || 'viewer';
  if (!['admin', 'editor'].includes(role)) {
    await fb.authFns.signOut(fb.auth);
    throw new Error('Korisnik nema ovlasti za uređivanje sadržaja.');
  }
  return credential.user;
}

export async function logoutAdmin() {
  const fb = await firebase();
  if (!fb) {
    sessionStorage.removeItem(DEMO_ADMIN_KEY);
    return true;
  }
  await fb.authFns.signOut(fb.auth);
  return true;
}

export async function getAdminUser() {
  const fb = await firebase();
  if (!fb) return JSON.parse(sessionStorage.getItem(DEMO_ADMIN_KEY) || 'null');

  return new Promise(resolve => {
    const unsubscribe = fb.authFns.onAuthStateChanged(fb.auth, async user => {
      unsubscribe();
      if (!user) return resolve(null);
      try {
        const adminSnapshot = await fb.fs.getDoc(fb.fs.doc(fb.db, 'projects', getSiteId(), 'admins', user.uid));
        if (!adminSnapshot.exists()) return resolve(null);
        const role = adminSnapshot.data()?.role || 'viewer';
        resolve(['admin', 'editor'].includes(role) ? user : null);
      } catch {
        resolve(null);
      }
    });
  });
}

function prepareForSave(collectionName, payload) {
  const now = new Date().toISOString();
  const item = { ...payload };
  item.id = item.id || slugify(item.title || item.name || item.label || item.email || Date.now());
  item.updatedAt = now;
  item.createdAt = item.createdAt || now;

  if (NEWS_TYPES[collectionName]) item.contentType = NEWS_TYPES[collectionName];
  if (ORDERED_COLLECTIONS.has(collectionName)) item.order = Number(item.order) || 1;
  if (['menu', 'services', 'process', 'products', 'gallery', 'reviews'].includes(collectionName)) item.published = item.published !== false;
  if (['services', 'products'].includes(collectionName)) item.tags = normalizeTags(item.tags);
  if (collectionName === 'reviews') item.rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
  if (collectionName === 'settings') item.id = 'settings-main';
  if (NEWS_TYPES[collectionName] && !item.id.startsWith(`${NEWS_TYPES[collectionName]}-`)) {
    item.id = `${NEWS_TYPES[collectionName]}-${item.id}`;
  }
  return item;
}

function normalizeItem(collectionName, item) {
  const normalized = { ...item };
  normalized.id = normalized.id || slugify(normalized.title || normalized.name || normalized.label || Date.now());
  if (['services', 'products'].includes(collectionName)) normalized.tags = normalizeTags(normalized.tags);
  if (collectionName === 'reviews') normalized.rating = Math.max(1, Math.min(5, Number(normalized.rating) || 5));
  return normalized;
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(tag => String(tag).trim()).filter(Boolean);
  return String(value || '').split(',').map(tag => tag.trim()).filter(Boolean);
}

function sortNewest(a, b) {
  return String(b.createdAt || b.updatedAt || '').localeCompare(String(a.createdAt || a.updatedAt || ''));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}
