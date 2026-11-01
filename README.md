# 📱 DEVOTEE INDIA - Mobile Number OSINT Framework

> **Open Source Intelligence Framework for Mobile Number Investigation**  
> 78+ Manual Techniques · 9 Categories · Ethical OSINT

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![OSINT](https://img.shields.io/badge/OSINT-Framework-orange)
![Manual](https://img.shields.io/badge/Manual-100%25-red)

---

OSINT framework designed specifically for **mobile number investigation**. Unlike automated tools, this framework provides **manual investigation techniques** that give you full control, accuracy, and transparency in every step.

> ⚠️ **Ethical Use Only** — For legitimate security research, consent-based investigations, and educational purposes only.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔢 **78+ Techniques** | Comprehensive investigation methods |
| 📂 **9 Categories** | Well-organized technical sections |
| 🖱️ **One-Click Copy** | Click any tool name to copy its link |
| 🔍 **Real-Time Search** | Filter techniques instantly |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| 🎨 **Modern UI** | Clean dark theme with smooth animations |
| 💾 **Local Storage** | Save your investigation notes |
| 🔍 **Offline Number Lookup** | Local `/api/lookup`: country, carrier, line type, formats, timezones — no identity data |
| 🛠️ **Optional Toolchain** | Install GHunt, Spiderfoot, recon-ng and PhoneInfoga locally with one command |
| 🔓 **100% Open Source** | No hidden code, completely transparent |

---

## 📋 Investigation Categories

| # | Category | Techniques |
|---|----------|------------|
| 1 | 📡 Technical & Telephony Data | 8 |
| 2 | 👤 Contact Syncing & Caller ID Apps | 8 |
| 3 | 💬 Messengers & VoIP Apps | 16 |
| 4 | 💰 Financial & Business Data | 7 |
| 5 | 🌐 Social Media & Search Engines | 14 |
| 6 | 💀 Breach Data & Source Code | 8 |
| 7 | 🔐 Google Account & Password Recovery | 6 |
| 8 | 📍 Geolocation Paid Services | 5 |
| 9 | 🤖 Automated OSINT Tools | 6 |

**Total: 78+ Investigation Techniques**

---

## 🛠️ Techniques Included

### 📡 Technical & Telephony Data
- Area Code Lookup (Wikipedia)
- HLR Research (smsc.ru/testhlr)
- IMSI Catcher / War Driving
- Provider Information
- Wi-Fi Hotspot Tracking (WiGLE)
- Cell Tower Geolocation (OpenCellID)

### 👤 Contact Syncing & Caller ID Apps
- Truecaller Search
- Sync.me Search
- Showcaller Search
- Whoscall Search
- Username Search (whatsmyname.app)

### 💬 Messengers & VoIP Apps
- WhatsApp Profile Check
- Telegram Search
- Signal Check
- Face Search (Pimeyes, FaceCheck)
- Reverse Image Search
- Viber, Skype, Discord Search

### 💰 Financial & Business Data
- PayPal Status Check
- Open Corporates Search
- MCA India Search
- Google Pay / PhonePe / PayTM

### 🌐 Social Media & Search Engines
- Facebook, Instagram, Twitter, LinkedIn
- Google Dorks (filetype, intitle, inurl)
- Bing, Yandex, DuckDuckGo
- Image EXIF Data Extraction

### 💀 Breach Data & Source Code
- Dehashed, IntelX, Snusbase
- LeakCheck.io
- PublicWWW Source Code Search
- Archive.org Wayback Machine

### 🔐 Google Account & Password Recovery
- GAIA ID Extraction
- Google Reviews Search
- GHunt Tool

### 📍 Geolocation Services
- GeoCell.mobi, CellTrack.nl
- Grabify IP Logger

### 🤖 Automated OSINT Tools
- PhoneInfoga, Spiderfoot, Maltego
- IntelTechniques Telephone Tool

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Edge, Safari)
- VS Code (for development) or any text editor

### Installation

There is no build step and no third-party dependency to install: the framework is a static
HTML/CSS/JS site. You only need a local web server so the one-click "copy link" feature
has a secure origin for the browser clipboard API.

```bash
# Clone the repository
git clone https://github.com/sebastisnzoth/Mobile-Number-Osint-Framework.git

# Navigate to project directory
cd Mobile-Number-Osint-Framework

# Install (no dependencies are downloaded; this just validates the project)
npm install

# Verify the installation (files, 78 techniques, 9 categories, every feature)
npm run setup

# Start the local server
npm start
```

Open **http://localhost:3000** in your browser.

`npm run setup` is the one-command installer check: it validates the Node runtime, confirms every
required file exists, counts the 9 categories and 78 techniques in `script.js`, and verifies that
all advertised features (search, copy, notes, lookup API and UI, consent guardrail, keyboard
shortcut, responsive layout, server, toolchain scripts) are wired up. It exits with an error if
anything is missing. `npm start` also serves the local `/api/*` endpoints described below.

> `npm start` runs `server.mjs`, a zero-dependency Node static server. Set a different
> port with `PORT=8080 npm start`, or a different bind address with `HOST=127.0.0.1 npm start`.

**Alternatives** (any static server works):

```bash
# Python 3
python3 -m http.server 3000 --bind 0.0.0.0

# Node / npx
npx serve -l 3000 .
```

Opening `index.html` directly from disk (`file://`) also renders the page, but browsers may
block clipboard access there, so the one-click "copy link" feature is unreliable.

> The page loads Font Awesome icons and the Inter font from public CDNs, so an internet
> connection is needed for the full styling; all framework data itself is local.

---

## 🧭 Usage

1. Click **Let's Investigate** on the landing page.
2. Browse the 9 categories, or press `⌘K` / `Ctrl+K` to focus the search field and filter
   techniques in real time.
3. Click any tool name to copy its link to the clipboard.
4. Click **Notes** (or press `Esc` to close the panel) to write investigation notes. They are
   saved automatically in your browser's `localStorage` — nothing is uploaded — and can be
   downloaded as a `.txt` file or cleared.
5. Use **Number lookup** to type a phone number, tick the consent checkbox and press
   **Analyze**. Results come from the local API: prefix metadata only, no identity lookup.
   The panel also shows which local OSINT tools are installed.

---

## 📦 What is (and is not) in this repository

This is a **manual investigation framework**: a local catalog of techniques and links, plus a
small local server. It contains `index.html`, `style.css`, `script.js`, `logo.png`,
`server.mjs` (static files + local API) and the `scripts/` installers. It does **not** include:

- a database or any service that identifies a person (no name, address or owner lookup);
- scraping of third-party sites or automated mass lookups;
- the external tools listed in the categories (PhoneInfoga, Spiderfoot, Maltego, GHunt,
  recon-ng, Truecaller, etc.) **bundled** with the site. They are outbound links you open
  yourself — or, for the open-source ones, you can install them locally (see below). Some of
  them are paid or require an account.

All 78 technique records live in `techniquesData` inside `script.js`. To add or edit a
technique, change that object — no build step is needed, just refresh the page.

---

## 🔍 Offline number lookup (local API)

`npm start` also exposes a small, zero-dependency API. It derives **non-identifying metadata
from the number prefix only**, using `libphonenumber` when the optional toolchain is installed
or an embedded calling-code table otherwise. By default **no request leaves the machine**.

| Endpoint | Description |
|---|---|
| `GET /api/health` | Service status and active lookup engine |
| `GET /api/tools` | Status of the optional local OSINT toolchain |
| `GET /api/lookup?number=...&region=BR&consent=true` | Offline metadata for a number |

```bash
curl 'http://localhost:3000/api/lookup?number=%2B5548999991234&consent=true'
# { "e164": "+5548999991234", "region": "BR", "carrier": ..., "line_type": "mobile", ... }
```

- `consent=true` (or the UI checkbox) is **required** — the API returns `403` without it.
- Invalid input → `400`, unparseable number → `422`, more than 30 requests/minute per IP → `429`.
- The response contains E.164, country/region, carrier, line type, validity, timezones and
  formats. It **never** returns a name, address or identity.
- Set `NUMVERIFY_ACCESS_KEY` to enable the optional Numverify adapter; without it the response
  reports the provider as not configured (and needs outbound internet to work).
- `.git`, `node_modules`, `tools/.venv` and `tools/.cache` are blocked from static serving.

The web UI includes a **Number lookup** panel with the form, the consent checkbox, a results
grid and a live status of the local toolchain.

---

## 🛠️ Optional: install the external OSINT tools locally

Some techniques link to standalone tools (PhoneInfoga, GHunt, Spiderfoot, recon-ng). They are
**not** bundled with the site, but can be installed next to it with one command:

```bash
npm run tools:install   # installs into ignored folders under tools/
source tools/env.sh     # adds the generated commands to your PATH
npm run tools:check     # verifies that every command really responds
```

`GHunt`, `Spiderfoot` and `recon-ng` get isolated Python virtualenvs; an offline
`number-info` helper (libphonenumber metadata) is included and is reused by `/api/lookup`;
`PhoneInfoga` is installed from the official release binary when the network allows it,
otherwise its source is staged and the command uses a clearly-labelled offline fallback.
Maltego, Lampyre and the IntelTechniques tool are proprietary/web-only and cannot be
installed. See **[tools/README.md](tools/README.md)** for details, commands and limitations.

---

## ✅ Verify everything

```bash
npm run setup          # app: files, 78 techniques, 9 categories, every feature
npm run tools:install  # optional local OSINT toolchain (idempotent)
npm run tools:check    # each CLI command responds + web API health
```

---

## ⚠️ Disclaimer

For legitimate security research, consent-based investigations and education only.
Always comply with applicable privacy laws and platform terms of service.
