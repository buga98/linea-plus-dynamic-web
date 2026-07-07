// Linea+ je spojen na CENTRALNI Dynamic Web Starter / Builder.
// 1) SITE_ID je dobiven u builderu.
// 2) U firebaseConfig zalijepi Web app config centralnog Firebase projekta.
//
// Koristimo isključivo postojeće Builder putanje:
// projects/{SITE_ID}/news       -> naslovnica, meni, usluge, proces i recenzije
// projects/{SITE_ID}/products   -> portfolio projekti
// projects/{SITE_ID}/gallery    -> galerija webova
// projects/{SITE_ID}/inquiries  -> kontakt upiti
// projects/{SITE_ID}/admins/{uid}

export const SITE_ID = 'linea-plus-nqq7d';

export const firebaseConfig = {
  apiKey: 'PASTE_FIREBASE_API_KEY',
  authDomain: 'dinamickewebstranice-e64d0.firebaseapp.com',
  projectId: 'dinamickewebstranice-e64d0',
  storageBucket: 'dinamickewebstranice-e64d0.firebasestorage.app',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_APP_ID'
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith('PASTE_') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.startsWith('PASTE_') &&
  firebaseConfig.messagingSenderId &&
  !firebaseConfig.messagingSenderId.startsWith('PASTE_') &&
  firebaseConfig.appId &&
  !firebaseConfig.appId.startsWith('PASTE_') &&
  SITE_ID &&
  !SITE_ID.startsWith('PASTE_')
);

const SITE_OVERRIDE_KEY = 'linea_plus_site_id_override';

export function getSiteId() {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('site');

  if (fromUrl) {
    localStorage.setItem(SITE_OVERRIDE_KEY, fromUrl);
    return fromUrl;
  }

  return localStorage.getItem(SITE_OVERRIDE_KEY) || SITE_ID;
}
