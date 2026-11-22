# Real Estate Marco Grivetto (`marcoimmobiliare.it`)

Sito istituzionale e catalogo immobiliare di **Marco Grivetto** (*Consulente Immobiliare — Royal Team Immobiliare*, P.IVA `10140700013`) per le sedi di **Torino** e **Asti**.

## Struttura delle Versioni

- **Versione A (`/`)** — Edizione *Belgrade Arbor Architecture & Living*
  - Hero video architettonico in apertura con preloader, sezione `#Introduction` con animazione scroll-driven su clip SVG ed ombre organiche, calcolatore di rendimento investimenti, catalogo proprietà Royal Team Immobiliare (`29` in vendita + `5` in affitto), pagine dedicate (`/chi-siamo/`, `/appartamenti-in-vendita/`, `/investi-con-noi/`, `/investimenti-immobiliari-in-corso/`, `/investimenti-immobiliari-conclusi/`, `/contatti/`, `/blog/`).
- **Versione B (`/v2/`)** — Edizione *Privy Collection* (reverse-engineered con REA da `sobha-privy-collection.com`)
  - Motore desktop a inerzia di rotella mouse + *magnetic gravity wells* (`v2/assets/js/privy-scroll.js`)
  - Header dinamico con inversione automatica chiaro/scuro (`.ui-dark` / `.ui-light`) in base alla sezione attiva
  - Video astratto *obsidian ribbons* (`v2/assets/media/ribbons.mp4`) e cursore/barra di progresso scroll
  - Trittico espansivo `#about`, manifesto word-scrub `#manifesto`, 3 mondi pinned `#mondi`, slider orizzontale sticky *I Sei Pilastri* (`#pilastri`), portfolio filtrabile completo da 34 immobili (`#catalogo` / `v2/assets/js/properties-data.js`), sedi pinned `#sedi`, modale mappa interattiva Torino/Asti e dossier contatti `grivetto.it`.

## Pubblicazione & Deploy

- **Repository GitHub**: `https://github.com/grivetto/marcoimmobiliare.it` (branch `main`, revisioni atomiche per milestone)
- **Hosting FTP TB-Hosting (`marcoimmobiliare.it`)**:
  - Root Versione A: `/www/`
  - Sottocartella Versione B: `/www/v2/`
- **Google Cloud Run (`dedonato-cicli-2026`, `europe-west1`)**:
  - Servizio principale: `real-estate-torino` (`Dockerfile` + `nginx.conf`)

## Contatti Ufficiali (`grivetto.it`)

- **Consulente**: Marco Grivetto — Royal Team Immobiliare (`P.IVA 10140700013`)
- **Ufficio Torino**: C.so Casale 319, 10132 Torino (TO)
- **Ufficio Asti**: Via Brofferio 109, 14100 Asti (AT)
- **Telefono / WhatsApp**: `+39 347 0034777` (`347.0034777`)
- **Email**: `marco@royalteam-immobiliare.it` · `marco@grivetto.it`
- **PEC**: `marcodg1@pec.it`
- **vCard**: `/marco-grivetto.vcf`
