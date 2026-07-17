<div align="center">

# UrTab

**A Muslim-friendly Chrome, Firefox & Edge new tab — prayer times, Quran & Hadith with audio, live weather, interactive backgrounds, and six clock themes. Zero dependencies, no account required.**

<img width="1280" height="631" alt="Main" src="https://github.com/user-attachments/assets/0b62ec41-3d36-4335-a811-5f5146cc9231" />








![Version](https://img.shields.io/badge/version-2.2-7c6af7?style=flat-square)
![Manifest](https://img.shields.io/badge/manifest-v3-5edf82?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-✓-4285F4?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-✓-FF7139?style=flat-square)
![Edge](https://img.shields.io/badge/Edge-✓-0078D4?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-d4a843?style=flat-square)

</div>

---

## Features

### 🕌 Prayer Times
- Real-time Salah times from GPS location via [Aladhan API](https://aladhan.com/prayer-times-api)
- Hijri date shown in every style
- Advances automatically as each prayer passes
- **4 widget styles:** Minimal · Bar · Card · Mosque
- **6 calculation methods:** Egyptian · Umm Al-Qura · ISNA · MWL · Karachi · Diyanet
- Auto-refreshes at midnight

### 📖 Quran & Hadith
- Random Quran verse (Arabic + English translation) or Hadith on every tab
- Arabic text with 7 selectable typefaces (Amiri, Scheherazade, Cairo, Tajawal, Lateef, Noto Naskh, System)
- **▶ Audio recitation** from 10 reciters via [everyayah.com](https://everyayah.com/)
- **10 reciters:** Mishary Alafasy · Abdul Basit (×2) · Al-Husary · Muhammad Jibreel · Abu Bakr Al-Shatri · Mohamed Al-Minshawi · Maher Al-Muaiqly · Yasser Al-Dosari · Nasser Al-Qatami
- **3 sources:** Quran only · Hadith only · Both (mixed)
- **4 widget styles:** Card · Minimal · Glass · Verse
- Cache-busted fetch — a different verse every time

### ⛅ Weather
- Current conditions + **5-day forecast** via [Open-Meteo](https://open-meteo.com/) — free, no API key
- **4 styles:** Pill · Card · Minimal · Forecast (high/low + rain probability)
- Celsius or Fahrenheit
- Location cached cross-session — loads instantly on every new tab

### 🎨 Backgrounds
- **8 static gradient presets** (Midnight · Nebula · Aurora · Ocean · Abyss · Crimson · Forest · Ember)
- **3 CSS-animated presets** — Aurora (hue-shifting), Floating Orbs (bokeh), Cascading Waves
- **5 interactive canvas presets** — react to mouse velocity and proximity:
  - Constellation Web · Gravity Grid · Orbital Swarm · Vector Field · Kinetic Mesh
- Upload your own **image** or **video** loop
  - Videos stored via IndexedDB — no base64 bloat, 16 MB loads in under a second
  - Adjustable overlay darkness and playback speed, mute/unmute

### 🕐 Clock
- **6 themes:** Minimal · Editorial · Neon · Mono · Display · Luxury
- 12h / 24h format, 4 sizes
- Optional greeting: *Good Morning / Afternoon / Evening, Name*
- Display theme supports the Anurati typeface (optional font file)
- Animated favicon — live clock hand in the browser tab

### 📅 Calendar
- Embed Google Calendar or Outlook directly on your new tab
- Uses your already-signed-in browser session — no OAuth, no keys
- **4 styles:** Card · Minimal · Glass · Bordered

### 🔍 Search & Links
- 4 search styles, 4 engines (Google · Bing · DuckDuckGo · Brave)
- 6 link styles, 3 icon sizes, fully editable shortcuts

### ⚙️ Layout
- Every widget has a **3×3 position grid**
- Auto-fade on inactivity (5–60s delay)
- Settings panel with 8 tabs, toggle open/close, `Esc` to close

---

## Installation

### Chrome / Edge

> **No build step. No npm. Just unzip and load.**

1. Download `newtab-extension.zip` from [Releases](../../releases) and unzip
2. Open Chrome → `chrome://extensions` (Edge → `edge://extensions`)
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select the unzipped folder
5. Open a new tab

### Firefox

via Firefox add-ons (under-review)

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

No tracking. No analytics. No ads. No external scripts.

---

## APIs Used

All free — no account or API key needed.

| API | Purpose |
|---|---|
| [Open-Meteo](https://open-meteo.com/) | Current weather + 7-day forecast |
| [BigDataCloud](https://www.bigdatacloud.com/) | City name from GPS coordinates |
| [Aladhan](https://aladhan.com/prayer-times-api) | Prayer times + Hijri date |
| [alquran.cloud](https://alquran.cloud/api) | Random Quran verse (Arabic + English) |
| [everyayah.com](https://everyayah.com/) | Quran audio recitation MP3s |

---


## Architecture

```
newtab-extension/
├── manifest.json     MV3 manifest (Chrome, Firefox, Edge compatible)
├── newtab.html       UI + all CSS (single file)
├── settings.js       Constants, defaults, IndexedDB helpers
├── newtab.js         All application logic + canvas engine
├── fonts/            Drop Anurati font files here
└── icons/            16 · 32 · 48 · 128 px
```

Zero external dependencies — no bundler, no framework, no node_modules.

### Cross-Browser Compatibility
A shim at the top of `newtab.js` maps `chrome.storage.*` to `browser.storage.*` when running in Firefox, where the `chrome` namespace is unavailable. The rest of the codebase uses only standard Web APIs (Canvas, IndexedDB, ResizeObserver, Fetch, Geolocation) supported in all three browsers.

### Canvas Engine (Cold-Start Fix)
The interactive canvas `applyGradient` override is initialized **before** the BG restore call in `init()`. A `startInteractiveCanvas()` wrapper retries via `requestAnimationFrame` if `window.innerWidth` is still 0 at browser startup. A `ResizeObserver` on `document.body` catches layout resolution and re-initializes the canvas if dimensions changed or particles failed to populate.

### Geolocation (Two-Stage)
1. **Instant** — serve cached coordinates from `chrome.storage.local`
2. **Background** — fresh GPS fetch; re-fetch data only if location moved >1 km

### Video Storage
Raw `File` objects stored in IndexedDB (not base64). Playback via `URL.createObjectURL()`. A 16 MB video loads in under a second.

---

## Changelog

### v2.2
- **Cold-start canvas fix** — interactive BG presets now render correctly on fresh Chrome restart; the canvas engine override is initialized before the BG restore, with a `requestAnimationFrame` retry loop for zero-width startups
- **Firefox & Edge compatibility** — `chrome.*` API shim, `browser_specific_settings` in manifest, canvas `display:block` fix
- Canvas animation loop now pauses when tab is hidden (Page Visibility API)
- Version bumped to 2.2

### v2.1
- Settings button toggles panel open/close
- 5-day weather forecast style
- 4 animated + 5 interactive canvas backgrounds
- Quote & Calendar widgets
- Panel restructured to 8 tabs (dedicated Weather tab, BG moved to first)
- Mute button slides with panel
- Arabic fonts (7 options via Google Fonts)
- 10 Quran reciters (3 broken IDs fixed, 2 new added)
- Calendar styles (Card · Minimal · Glass · Bordered)

### v2.0 — Complete rewrite
- Prayer times with 4 styles and Hijri date
- Quran & Hadith widget with Arabic text and audio
- Animated favicon
- Geolocation persisted cross-session
- Video backgrounds via IndexedDB
- Zero dependencies

### v1.0 – v1.9
- Core MV3 architecture, six clock themes, gallery, weather, search, links, onboarding

---

## License

MIT — do whatever you want, attribution appreciated.
