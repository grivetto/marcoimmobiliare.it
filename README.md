# Real Estate Marco Grivetto (`marcoimmobiliare.it`)

Sito istituzionale e catalogo immobiliare di **Marco Grivetto** (*Consulente Immobiliare — Royal Team Immobiliare*, P.IVA `10140700013`) per le sedi di **Torino** e **Asti**, ottimizzato sia per desktop sia per dispositivi mobili.

## Struttura delle Versioni

- **Versione A (`/`)** — Edizione *Belgrade Arbor Architecture & Living*
  - Hero video architettonico in apertura con preloader, sezione `#Introduction` adattiva (clip SVG ridimensionati su mobile per massima leggibilità), calcolatore di rendimento investimenti, banner privacy compatto mobile-first e catalogo proprietà Royal Team Immobiliare (`29` in vendita + `5` in affitto) su tutte le 8 pagine (`/`, `/chi-siamo/`, `/appartamenti-in-vendita/`, `/investi-con-noi/`, `/investimenti-immobiliari-in-corso/`, `/investimenti-immobiliari-conclusi/`, `/contatti/`, `/blog/`).
- **Versione B (`/v2/`)** — Edizione *Privy Collection* (reverse-engineered con REA da `sobha-privy-collection.com`)
  - Motore desktop a inerzia di rotella mouse + *magnetic gravity wells* (`v2/assets/js/privy-scroll.js`)
  - Su mobile (`<= 960px` / dispositivi touch): scroll nativo fluido, header compatto su singola riga, indizi tattili ("Scorri verso il basso" / "Scorri lateralmente"), carousel orizzontale con scroll-snap sui *Sei Pilastri*, tab catalogo scorrevoli e campi form `16px` anti-zoom iOS.
  - Header dinamico con inversione automatica chiaro/scuro (`.ui-dark` / `.ui-light`), video astratto *obsidian ribbons*, portfolio filtrabile completo da 34 immobili (`#catalogo`), sedi pinned `#sedi`, modale mappa Torino/Asti e dossier contatti `grivetto.it`.

## Pubblicazione Automatica (GitHub Actions -> FTP)

Ogni `push` sul branch `main` attiva automaticamente il workflow [`.github/workflows/deploy-ftp.yml`](.github/workflows/deploy-ftp.yml):
- Esegue [`.github/scripts/deploy_ftp.py`](.github/scripts/deploy_ftp.py) usando i secret cifrati del repository (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`).
- Pubblica in `/www/` i file statici modificati rispetto al commit precedente (o l'intero sito se avviato manualmente via `workflow_dispatch` con `full_sync: true`), verificando la dimensione esatta in byte tramite `FTP SIZE` e controllando `HTTP 200` su `https://www.marcoimmobiliare.it/` e `https://www.marcoimmobiliare.it/v2/`.
- Specchiato inoltre su Google Cloud Run (`dedonato-cicli-2026`, `europe-west1`, servizio `real-estate-torino`).

## Contatti Ufficiali (`grivetto.it`)

- **Consulente**: Marco Grivetto — Royal Team Immobiliare (`P.IVA 10140700013`)
- **Ufficio Torino**: C.so Casale 319, 10132 Torino (TO)
- **Ufficio Asti**: Via Brofferio 109, 14100 Asti (AT)
- **Telefono / WhatsApp**: `+39 347 0034777` (`347.0034777`)
- **Email**: `marco@royalteam-immobiliare.it` · `marco@grivetto.it`
- **PEC**: `marcodg1@pec.it`
- **vCard**: `/marco-grivetto.vcf`
