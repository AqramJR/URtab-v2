<div align="center">

# UrTab

**A Muslim-friendly Chrome, Firefox & Edge new tab — prayer times, Quran & Hadith with audio, live weather, interactive backgrounds, and six clock themes. Zero dependencies, no account required.**

<img width="1280" height="631" alt="Main" src="https://github.com/user-attachments/assets/0b62ec41-3d36-4335-a811-5f5146cc9231" />








![Version](https://img.shields.io/badge/version-2.2-7c6af7?style=flat-square)
![Manifest](https://img.shields.io/badge/manifest-v3-5edf82?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-✓-4285F4?style=flat-square)
[![Get it on Firefox Add-ons](https://img.shields.io/badge/Firefox_Add--ons-FF7139?style=social&logo=firefox-browser)](https://addons.mozilla.org/en-US/firefox/addon/urtab-v2/)
[![Microsoft Edge](https://custom-icon-badges.demolab.com/badge/Microsoft%20Edge-2771D8?logo=edge-white&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/urtab/naijigggkakgcjoemeigkpofcnmkmihb)
![License](https://img.shields.io/badge/license-MIT-d4a843?style=flat-square)

</div>

---

## Features

### 🕌 Prayer Times
- Real-time Salah times from GPS via [Aladhan API](https://aladhan.com/prayer-times-api) — free, no key
- Hijri date shown in every style; advances automatically as each prayer passes
- **4 styles:** Minimal · Bar · Card · Mosque
- **6 calculation methods:** Egyptian · Umm Al-Qura · ISNA · MWL · Karachi · Diyanet
- IP-based location fallback if GPS is denied

### 📖 Quran, Hadith & Tafsir
- Random Quran verse or Hadith on every tab; Arabic text + English translation
- **Tafsir** (تفسير): tap 📖 to expand — Arabic (Muyassar) or English (Maududi)
- **Audio recitation** from 10 reciters via [everyayah.com](https://everyayah.com/)
- Play a single verse or stream an entire Surah start-to-finish with next-ayah preloading
- Navigate verse-by-verse (❮ ❯) or jump to Surah start (⏮)
- **30 curated Hadith** baked in locally — instant, no API call
- **7 Arabic typefaces:** Amiri · Scheherazade · Cairo · Tajawal · Lateef · Noto Naskh · System
- **4 widget styles:** Card · Minimal · Glass · Verse
- **10 reciters:** Mishary Alafasy · Abdul Basit (×2) · Al-Husary · Muhammad Jibreel · Abu Bakr Al-Shatri · Mohamed Al-Minshawi · Maher Al-Muaiqly · Yasser Al-Dosari · Nasser Al-Qatami

### ⚽ Live Sports Scores
- Live and upcoming football matches via [ESPN's free public API](https://site.api.espn.com/)
- **14 leagues:** Premier League · La Liga · Bundesliga · Serie A · Ligue 1 · MLS · Champions League · Europa League · World Cup · Copa América · Saudi Pro League · Egyptian Premier · Eredivisie · Primeira Liga
- Team logos link to ESPN team pages
- **3 widget styles:** Card · Bar · Minimal
- Refreshes every 60 seconds; live matches show pulsing red dot + match clock

### ⛅ Weather
- Current conditions + **5-day forecast** via [Open-Meteo](https://open-meteo.com/) — free, no key
- **4 styles:** Pill · Card · Minimal · Forecast (high/low + rain probability)
- Celsius or Fahrenheit; location cached cross-session for instant loads
- IP-based fallback if GPS is denied

### 🎨 Backgrounds (16 total)
- **8 static gradients:** Midnight · Nebula · Aurora · Ocean · Abyss · Crimson · Forest · Ember
- **3 CSS-animated:** Aurora (hue-shifting) · Floating Orbs (bokeh) · Cascading Waves
- **5 interactive canvas** — react to mouse velocity & proximity:
  - Constellation Web · Gravity Grid · Orbital Swarm · Vector Field · Kinetic Mesh
  - Liquid Metal · Aurora Curtain · Neon Rain · Sand Dunes *(4 additional)*
- Upload custom **image** or **video** (stored in IndexedDB — no base64 bloat)
- Video: adjustable overlay darkness, playback speed, mute/unmute

### 🕐 Clock
- **6 themes:** Minimal · Editorial · Neon · Mono · Display · Luxury
- 12h / 24h · 4 sizes · Optional greeting
- Display theme supports the Anurati typeface (optional, see Fonts)
- Animated favicon — live clock hand in the browser tab

### 📅 Calendar
- Embed Google Calendar or Outlook on your new tab
- Uses your existing signed-in session — no OAuth, no API key
- **4 styles:** Card · Minimal · Glass · Bordered

### 🔍 Search & Links
- 4 search styles · 4 engines (Google · Bing · DuckDuckGo · Brave)
- 6 link styles · 3 icon sizes · Fully editable shortcuts

### ⚙️ Layout
- Every widget has a **3×3 position grid**
- Auto-fade on inactivity (5–60s) · Settings panel: 8 tabs, toggle open/close, `Esc` to close

---

## Installation

### Chrome / Brave

1. Download `newtab-extension.zip` from [Releases](../../releases) and unzip
2. Open Chrome → `chrome://extensions` (Edge → `edge://extensions`)
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select the unzipped folder
5. Open a new tab

### Firefox
[![Firefox](https://img.shields.io/badge/Firefox-FF7139?logo=firefoxbrowser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/urtab-v2/)
### Microsoft Edge
[![Microsoft Edge](https://custom-icon-badges.demolab.com/badge/Microsoft%20Edge-2771D8?logo=edge-white&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/urtab/naijigggkakgcjoemeigkpofcnmkmihb)

---

## Screenshots
https://github.com/user-attachments/assets/55174dfd-2ce8-4ae8-8aeb-3f645810ed57

<img width="450" height="890" alt="sWeather" src="https://github.com/user-attachments/assets/22de0057-55a8-45b8-825a-c11b7532e813" />
<img width="450" height="890" alt="Search" src="https://github.com/user-attachments/assets/a12ac759-b0c9-4e4e-8a1c-4aceeaa17c61" />
<img width="450" height="890" alt="Quote" src="https://github.com/user-attachments/assets/fa8ca091-2ca0-4957-9859-66723440efff" />
<img width="450" height="890" alt="Prayer" src="https://github.com/user-attachments/assets/2e8bd84f-c807-4101-808a-eee2112fcfdd" />
<img width="450" height="890" alt="Clock" src="https://github.com/user-attachments/assets/eaafa45f-e2f8-48c2-a656-29bd68fa862f" />
<img width="450" height="890" alt="background" src="https://github.com/user-attachments/assets/02333e8b-248a-4257-baec-714effc7314e" />
<img width="286" height="268" alt="weather" src="https://github.com/user-attachments/assets/ebcd46b4-3847-4873-a22a-5891336094ec" />




---

## Permissions

| Permission | Why |
|---|---|
| `storage` | Settings, backgrounds, links, cached location |
| `geolocation` | Prayer times and weather |

No tracking. No analytics. No ads. No external scripts loaded at runtime.

---

## APIs Used — All Free, No Account Needed

| API | Purpose |
|---|---|
| [Open-Meteo](https://open-meteo.com/) | Current weather + 7-day forecast |
| [BigDataCloud](https://www.bigdatacloud.com/) | City name from coordinates + IP fallback location |
| [Aladhan](https://aladhan.com/prayer-times-api) | Prayer times + Hijri date |
| [alquran.cloud](https://alquran.cloud/api) | Quran verses, translations, tafsir |
| [everyayah.com](https://everyayah.com/) | Quran audio recitation MP3s |
| [ESPN (public)](https://site.api.espn.com/) | Live football scores, schedules, team logos |

---

## Architecture

```
newtab-extension/
├── manifest.json     MV3 — Chrome, Firefox & Edge compatible
├── newtab.html       Full UI + CSS (single file)
├── settings.js       Constants, defaults, storage & IndexedDB helpers
├── newtab.js         All application logic + canvas engine
├── fonts/            Drop Anurati font files here
└── icons/            16 · 32 · 48 · 128 px
```

Zero external JS dependencies — no bundler, no npm, no frameworks.

**Cross-browser:** A shim at the top of `newtab.js` maps `chrome.storage.*` → `browser.storage.*` in Firefox. All other APIs (Canvas, IndexedDB, Fetch, Geolocation, ResizeObserver) are standard Web APIs supported in all three browsers.

**Video storage:** Raw `File` objects in IndexedDB — no base64 encoding. A 50 MB video loads in under a second via `URL.createObjectURL()`.

**Canvas cold-start:** The `applyGradient` override is initialized before the BG restore call. A `startInteractiveCanvas()` wrapper retries via `requestAnimationFrame` if `window.innerWidth` is 0 at startup.

---

## Changelog

### v2.3.1
- Quran Surah playback — stream entire surah start-to-finish with next-ayah preloading
- Verse navigation buttons (❮ prev, ❯ next, ⏮ surah start)
- Tafsir fetched alongside the verse in one API call (no extra request)
- Live sports scores with team logo links to ESPN pages
- 14 football leagues
- 4 additional interactive canvas backgrounds (Liquid Metal, Aurora Curtain, Neon Rain, Sand Dunes)
- IP-based geolocation fallback if GPS denied
- Firefox `data_collection_permissions` field added to manifest
- Sports timer corrected to 60s (was incorrectly 10s)
- Fixed: `isSurahPlaying`, `nextQuoteAudio`, `preloadNextAudio` were undeclared
- Fixed: duplicate `fetchWeather()` call on init

### v2.2
- Cold-start canvas fix
- Firefox & Edge compatibility (API shim, manifest)
- Canvas pauses when tab is hidden

### v2.1
- Quote & Calendar widgets; 5-day weather forecast
- 4 animated + 5 interactive canvas backgrounds
- Settings panel restructured to 8 tabs
- Tafsir support; 10 Quran reciters

### v2.0 — Complete rewrite
- Prayer times, Quran & Hadith, animated favicon
- Video backgrounds via IndexedDB
- Zero dependencies

---

## License

MIT — do whatever you want, attribution appreciated.


MIT — do whatever you want, attribution appreciated.
