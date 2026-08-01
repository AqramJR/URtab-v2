import { $, safeHTML } from './utils.js';
import { state } from './state.js';
import { QUOTE_STYLE_DEFS, renderQuote, quoteData } from './quran.js';
import { prayerData, renderPrayer } from './prayer.js';
import { renderCalendar } from './calendar.js';
import { SPORTS_STYLES_DEF } from './sports.js';

const THEMES = [
	{ id: 'minimal', label: 'Minimal', bg: '#0c0c18', tCSS: 'font-weight:200;letter-spacing:-1px', dCSS: 'letter-spacing:3px', t: '14:30', d: 'MON 22 FEB' },
	{ id: 'editorial', label: 'Editorial', bg: '#0c0810', tCSS: 'font-family:Georgia,serif;font-weight:700;letter-spacing:4px', dCSS: 'font-family:Georgia,serif;font-style:italic', t: '14:30', d: 'Mon, Feb 22' },
	{ id: 'neon', label: 'Neon', bg: '#000820', tCSS: 'font-family:Courier New,mono;color:#0ff;text-shadow:0 0 8px #0ff', dCSS: 'color:#f0f;letter-spacing:5px', t: '14:30', d: 'MONDAY' },
	{ id: 'mono', label: 'Mono', bg: '#071207', tCSS: 'font-family:Courier New,mono;letter-spacing:5px;color:rgba(180,220,180,.9)', dCSS: 'font-family:Courier New,mono;color:rgba(150,200,150,.6)', t: '14:30', d: 'MONDAY' },
	{ id: 'display', label: 'Display', bg: '#100c20', tCSS: "font-family:'Anurati','Orbitron',Impact,sans-serif;font-size:22px;letter-spacing:4px", dCSS: 'font-style:italic;font-family:Georgia,serif', t: 'SUNDAY', d: '22 Feb · 14:30' },
	{ id: 'luxury', label: 'Luxury', bg: '#0a080a', tCSS: 'font-weight:100;letter-spacing:10px', dCSS: 'letter-spacing:7px;opacity:.4', t: '14:30', d: 'MON 22 FEB' }
];

const SEARCH_STYLES = [
	{ id: 'glass', label: 'Glass', html: `<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:50px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>` },
	{ id: 'solid', label: 'Solid', html: `<div style="background:rgba(10,10,28,.75);border:1px solid rgba(255,255,255,.1);border-radius:50px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>` },
	{ id: 'outline', label: 'Outline', html: `<div style="border:1.5px solid rgba(255,255,255,.35);border-radius:50px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>` },
	{ id: 'minimal', label: 'Minimal', html: `<div style="border-bottom:1px solid rgba(255,255,255,.3);padding:5px 4px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>` }
];

const LINK_STYLES = [
	{ id: 'glass', label: 'Glass', html: `<div style="width:26px;height:26px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px">📧</div>` },
	{ id: 'pill', label: 'Pill', html: `<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:50px;padding:4px 8px 4px 5px;display:flex;align-items:center;gap:4px;font-size:12px">📧<span style="font-size:9px;color:rgba(255,255,255,.65)">Gmail</span></div>` },
	{ id: 'card', label: 'Card', html: `<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:7px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:13px">📧<span style="font-size:7px;color:rgba(255,255,255,.55)">Gmail</span></div>` },
	{ id: 'ghost', label: 'Ghost', html: `<div style="font-size:22px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))">📧</div>` },
	{ id: 'neon', label: 'Neon', html: `<div style="width:26px;height:26px;border:1.5px solid rgba(124,106,247,.55);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px rgba(124,106,247,.25)">📧</div>` },
	{ id: 'frosted', label: 'Frosted', html: `<div style="width:26px;height:26px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,.25)">📧</div>` }
];

const WEATHER_STYLES = [
	{ id: 'pill', label: 'Pill', html: `<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:6px 14px;display:flex;align-items:center;gap:8px"><span style="font-size:20px">⛅</span><span style="font-size:13px;font-weight:200">22°C</span></div>` },
	{ id: 'card', label: 'Card', html: `<div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:10px"><span style="font-size:26px">⛅</span><div><div style="font-size:16px;font-weight:100">22°C</div><div style="font-size:9px;opacity:.5">Partly cloudy</div></div></div>` },
	{ id: 'minimal', label: 'Minimal', html: `<div style="display:flex;align-items:center;gap:8px"><span style="font-size:22px">⛅</span><span style="font-size:18px;font-weight:200">22°C</span></div>` },
	{ id: 'forecast', label: 'Forecast', html: `<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:8px 12px;min-width:140px"><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:6px;opacity:.6"><span>⛅ 22°C · Partly cloudy</span></div><div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;justify-content:space-between;font-size:9px"><span>Mon</span><span>☀️</span><span style="color:rgba(255,255,255,.4)">16° 24°</span></div><div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(124,106,247,.8)"><span>Tue</span><span>🌧</span><span>13° 18°</span></div><div style="display:flex;justify-content:space-between;font-size:9px"><span>Wed</span><span>⛅</span><span style="color:rgba(255,255,255,.4)">15° 21°</span></div></div></div>` }
];

const SETTINGS_STYLES = [
	{ id: 'pill', label: 'Pill', html: `<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:6px 14px;display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,.6)">⚙ Settings</div>` },
	{ id: 'icon', label: 'Icon Only', html: `<div style="width:34px;height:34px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px">⚙</div>` },
	{ id: 'dot', label: 'Dot', html: `<div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.2)"></div>` }
];

const PRAYER_STYLES_DEF = [
	{ id: 'minimal', label: 'Minimal', html: `<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:6px 14px;display:flex;align-items:center;gap:8px;font-size:11px"><span>🌙</span><span style="font-weight:200">Asr · 15:45</span><span style="color:#d4a843;font-size:9px">in 2h</span></div>` },
	{ id: 'bar', label: 'Bar', html: `<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 10px;display:flex;gap:4px"><span style="font-size:9px;text-align:center">🌙<br><span style="color:rgba(255,255,255,.4)">Fajr</span></span><span style="font-size:9px;text-align:center;color:rgba(124,106,247,.9)">☀️<br>Dhuhr</span><span style="font-size:9px;text-align:center">🌤<br><span style="color:rgba(255,255,255,.4)">Asr</span></span></div>` },
	{ id: 'card', label: 'Card', html: `<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:8px 12px;min-width:110px"><div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:4px">🕌 PRAYER TIMES</div><div style="font-size:10px;display:flex;justify-content:space-between;margin-bottom:2px"><span>🌙 Fajr</span><span style="opacity:.7">05:12</span></div><div style="font-size:10px;display:flex;justify-content:space-between;color:rgba(212,168,67,.9)"><span>☀️ Asr</span><span>15:45</span></div></div>` },
	{ id: 'mosque', label: 'Mosque', html: `<div style="background:linear-gradient(135deg,rgba(15,10,35,.9),rgba(30,20,60,.9));border:1px solid rgba(124,106,247,.25);border-radius:16px;padding:10px 14px;text-align:center"><div style="font-size:14px;margin-bottom:2px">☽</div><div style="font-size:9px;opacity:.4;letter-spacing:2px">NEXT</div><div style="font-size:12px;font-weight:200">العصر</div><div style="font-size:9px;color:#d4a843">15:45 · in 2h</div></div>` }
];

export function buildThemeSwatches(applyClockTheme, scheduleSave) {
    const grid = $('theme-grid');
    if (!grid) return;
    safeHTML(grid, '');
    THEMES.forEach(t => {
        const sw = document.createElement('div');
        sw.className = 'swatch' + (state.S.clockTheme === t.id ? ' active' : '');
        sw.style.background = t.bg;
        safeHTML(sw, `<span class="sw-time" style="${t.tCSS}">${t.t}</span><span class="sw-date" style="${t.dCSS}">${t.d}</span><span class="sw-name">${t.label}</span>`);
        sw.addEventListener('click', () => {
            state.S.clockTheme = t.id;
            applyClockTheme();
            buildThemeSwatches(applyClockTheme, scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildSearchStyleSwatches(applySearchStyle, scheduleSave) {
    const grid = $('search-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    SEARCH_STYLES.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch' + (state.S.searchStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`);
        sw.addEventListener('click', () => {
            state.S.searchStyle = st.id;
            applySearchStyle();
            buildSearchStyleSwatches(applySearchStyle, scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildLinkStyleSwatches(applyLinksStyle, scheduleSave) {
    const grid = $('links-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    LINK_STYLES.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch' + (state.S.linksStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`);
        sw.addEventListener('click', () => {
            state.S.linksStyle = st.id;
            applyLinksStyle();
            buildLinkStyleSwatches(applyLinksStyle, scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildWeatherStyleSwatches(applyWeatherStyle, scheduleSave) {
    const grid = $('weather-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    WEATHER_STYLES.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch' + (state.S.weatherStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`);
        sw.addEventListener('click', () => {
            state.S.weatherStyle = st.id;
            applyWeatherStyle();
            buildWeatherStyleSwatches(applyWeatherStyle, scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildSettingsStyleSwatches(applySettingsStyle, scheduleSave) {
    const grid = $('settings-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    SETTINGS_STYLES.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch' + (state.S.settingsStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`);
        sw.addEventListener('click', () => {
            state.S.settingsStyle = st.id;
            applySettingsStyle();
            buildSettingsStyleSwatches(applySettingsStyle, scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildPrayerStyleSwatches(scheduleSave) {
    const grid = $('prayer-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    PRAYER_STYLES_DEF.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch' + (state.S.prayerStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`);
        sw.addEventListener('click', () => {
            state.S.prayerStyle = st.id;
            if (prayerData) renderPrayer();
            buildPrayerStyleSwatches(scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildQuoteStyleSwatches(scheduleSave) {
    const grid = $('quote-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    const PREVIEWS = {
        card: `<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 10px;max-width:130px"><div style="font-size:11px;direction:rtl;color:#c9a84c;margin-bottom:4px;font-family:serif">بِسْمِ اللَّهِ</div><div style="font-size:8px;color:rgba(255,255,255,.5);font-style:italic">In the name of Allah</div><div style="font-size:7px;color:rgba(255,255,255,.3);margin-top:4px">Al-Fatiha • 1:1</div></div>`,
        minimal: `<div style="max-width:130px;padding:4px 0"><div style="font-size:13px;direction:rtl;color:#c9a84c;font-family:serif;text-align:center;margin-bottom:4px">بِسْمِ اللَّهِ</div><div style="font-size:7px;color:rgba(255,255,255,.3);text-align:center">Al-Fatiha • 1:1</div></div>`,
        glass: `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:8px 10px;max-width:130px;backdrop-filter:blur(8px);box-shadow:0 4px 24px rgba(0,0,0,.3)"><div style="font-size:11px;direction:rtl;color:#c9a84c;margin-bottom:4px;font-family:serif">بِسْمِ اللَّهِ</div><div style="font-size:8px;color:rgba(255,255,255,.45);font-style:italic">In the name of Allah</div></div>`,
        verse: `<div style="max-width:130px;padding:6px;border-left:2px solid rgba(124,106,247,.6)"><div style="font-size:13px;direction:rtl;color:#c9a84c;font-family:serif;margin-bottom:4px">بِسْمِ اللَّهِ</div><div style="font-size:8px;color:rgba(255,255,255,.45);font-style:italic">In the name of Allah</div><div style="font-size:7px;color:rgba(124,106,247,.7);margin-top:4px">Al-Fatiha • 1:1</div></div>`
	};
    QUOTE_STYLE_DEFS.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch-wide' + (state.S.quoteStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${PREVIEWS[st.id] || ''}</div><div class="sw-label">${st.name}</div>`);
        sw.addEventListener('click', () => {
            state.S.quoteStyle = st.id;
            if (quoteData) renderQuote();
            buildQuoteStyleSwatches(scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildCalendarStyleSwatches(scheduleSave) {
    const grid = $('calendar-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    const STYLES = [
		{ id: 'card', label: 'Card', preview: `<div style="background:rgba(10,10,22,.55);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:6px 8px;font-size:8px;color:rgba(255,255,255,.5)"><div style="color:var(--acc);margin-bottom:3px;font-size:9px">● Calendar</div><div>9:00 Fajr</div><div>14:00 Meeting</div></div>` },
		{ id: 'minimal', label: 'Minimal', preview: `<div style="padding:4px 0;font-size:8px;color:rgba(255,255,255,.5)"><div style="color:var(--acc);margin-bottom:3px;font-size:9px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px">Calendar</div><div>9:00 Fajr</div><div>14:00 Meeting</div></div>` },
		{ id: 'glass', label: 'Glass', preview: `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:6px 8px;backdrop-filter:blur(8px);font-size:8px;color:rgba(255,255,255,.5)"><div style="color:var(--acc);margin-bottom:3px;font-size:9px">● Calendar</div><div>9:00 Fajr</div><div>14:00 Meeting</div></div>` },
		{ id: 'verse', label: 'Bordered', preview: `<div style="border-left:2px solid var(--acc);padding:4px 8px;font-size:8px;color:rgba(255,255,255,.5)"><div style="color:var(--acc);margin-bottom:3px;font-size:9px">Calendar</div><div>9:00 Fajr</div><div>14:00 Meeting</div></div>` }
    ];
    STYLES.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch-wide' + (state.S.calendarStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview">${st.preview}</div><div class="sw-label">${st.label}</div>`);
        sw.addEventListener('click', () => {
            state.S.calendarStyle = st.id;
            if (state.S.calendarVisible) renderCalendar();
            buildCalendarStyleSwatches(scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}

export function buildSportsStyleSwatches(scheduleSave) {
    const grid = $('sports-style-grid');
    if (!grid) return;
    safeHTML(grid, '');
    SPORTS_STYLES_DEF.forEach(st => {
        const sw = document.createElement('div');
        sw.className = 'swatch-wide' + (state.S.sportsStyle === st.id ? ' active' : '');
        safeHTML(sw, `<div class="sw-preview" style="justify-content:center">${st.html}</div><div class="sw-label">${st.label}</div>`);
        sw.addEventListener('click', () => {
            state.S.sportsStyle = st.id;
            if ($('sports-wrap')) $('sports-wrap').className = 'sports-' + st.id;
            buildSportsStyleSwatches(scheduleSave);
            scheduleSave();
		});
        grid.appendChild(sw);
	});
}