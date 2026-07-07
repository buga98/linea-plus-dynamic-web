# Linea+ dynamic web

Premium scrollytelling javna stranica + vlastiti Mini CMS admin za projekt:

```js
export const SITE_ID = 'linea-plus-nqq7d';
```

## Što je uključeno

- responsive scrollytelling web za desktop i mobitel
- dinamički glavni meni
- dinamička naslovnica i O nama tekstovi
- usluge i proces rada
- portfolio projekata s desktop + mobilnim mockupom
- galerija webova
- recenzije
- kontakt forma koja sprema upite
- admin na `/admin/`
- upload originalnih slika bez kompresije
- lokalni demo način dok Firebase config nije unesen
- Vercel konfiguracija bez build koraka

## 1. Firebase config

Otvori:

```text
js/firebase-config.js
```

`SITE_ID` je već upisan. Zamijeni samo placeholder vrijednosti:

```js
apiKey: 'PASTE_FIREBASE_API_KEY',
messagingSenderId: 'PASTE_SENDER_ID',
appId: 'PASTE_APP_ID'
```

Firebase projekt ostaje centralni:

```text
dinamickewebstranice-e64d0
```

## 2. Firestore putanje

Web namjerno koristi samo kolekcije koje već postoje u centralnom Dynamic Web Starteru:

```text
projects/linea-plus-nqq7d/news
projects/linea-plus-nqq7d/products
projects/linea-plus-nqq7d/gallery
projects/linea-plus-nqq7d/inquiries
projects/linea-plus-nqq7d/admins/{uid}
```

Unutar `news` kolekcije polje `contentType` razdvaja naslovnicu, meni, usluge, proces i recenzije. `products` je Linea+ portfolio. Zbog toga nisu potrebne nove kolekcije ni dodatna Firestore pravila. Detalji su u `FIREBASE_STRUCTURE.txt`.

## 3. Lokalno pokretanje

Nemoj otvarati `index.html` dvostrukim klikom jer stranica koristi JavaScript module.

U VS Codeu možeš koristiti Live Server ili terminal:

```bash
python -m http.server 5173
```

Windows alternativa:

```bash
py -m http.server 5173
```

Otvori:

```text
http://localhost:5173
```

Admin:

```text
http://localhost:5173/admin/
```

Bez pravog Firebase configa admin radi u lokalnom demo načinu i podatke sprema u localStorage preglednika.

## 4. Originalne slike

Admin ne radi resize, kompresiju ni WebP konverziju. Odabrana datoteka sprema se u originalnom formatu u:

```text
uploads/linea-plus-nqq7d/portfolio/...
uploads/linea-plus-nqq7d/gallery/...
```

## 5. GitHub i Vercel

`index.html` mora ostati u rootu repozitorija. Projekt nema build korak. Nakon pusha importaj repozitorij u Vercel i ostavi Framework Preset na `Other`, a Output Directory praznim.
