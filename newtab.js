import { $, safeHTML, sleep, storageGet, storageSet, idbGet, idbSet, idbDel, idbClear } from './js/utils.js';
import { state } from './js/state.js';
import { fetchSports, startSportsTimer, stopSportsTimer } from './js/sports.js';
import { fetchWeather, renderWeatherTemp, renderWeatherForecast } from './js/weather.js';
import { fetchPrayerTimes } from './js/prayer.js';
import { fetchQuote, renderQuote, applyArabicFont, stopQuoteAudio, quoteData } from './js/quran.js';
import { renderCalendar } from './js/calendar.js';
import { initInteractiveBackgrounds, startInteractiveCanvas, stopInteractiveCanvas, activeInteractiveMode } from './js/backgrounds.js';
import {
    buildThemeSwatches, buildSearchStyleSwatches, buildLinkStyleSwatches,
    buildWeatherStyleSwatches, buildSettingsStyleSwatches, buildPrayerStyleSwatches,
    buildQuoteStyleSwatches, buildCalendarStyleSwatches, buildSportsStyleSwatches
} from './js/settings-ui.js';
import { animateFavicon, stopFavicon, tickClock, startClock, stopClock, applyClockTheme, applyClockSize, favAnimFrame } from './js/clock.js';
import { showOnboarding, initOnboarding } from './js/onboarding.js';
import { renderLinks, applyLinksSize, applyLinksStyle } from './js/links.js';

'use strict';

let S = {}, links = [], tempLinks = [], saveTimer = null, saveToastTimer = null;
let fadeTimer = null, isMoving = false, userGallery = [];
const _blobCache = {};

const WIDGET_IDS = ['clock-wrap', 'weather-wrap', 'search-wrap', 'links-wrap', 'prayer-wrap', 'quote-wrap', 'calendar-wrap', 'sports-wrap'];
const WIDGET_KEY = {
    'clock-wrap': 'clockPosition',
    'weather-wrap': 'weatherPosition',
    'search-wrap': 'searchPosition',
    'links-wrap': 'linksPosition',
    'prayer-wrap': 'prayerPosition',
    'quote-wrap': 'quotePosition',
    'calendar-wrap': 'calendarPosition',
    'sports-wrap': 'sportsPosition'
};

function applyAll() {
    applyClockTheme();
    applySearchStyle();
    applyLinksStyle();
    applyWeatherStyle();
    applySettingsStyle();
    applyVisibility();
    applyClockSize();
    applyLinksSize();
    applySearchEngine();
    applyVideoDim();
    applyVideoSpeed();
    applyFadeMode();
    tickClock();
}

const SEARCH_CLS = ['search-solid', 'search-outline', 'search-minimal'];
function applySearchStyle() {
    SEARCH_CLS.forEach(c => document.body.classList.remove(c));
    if (S.searchStyle && S.searchStyle !== 'glass')
    document.body.classList.add('search-' + S.searchStyle);
}

const WX_CLS = ['weather-card', 'weather-minimal', 'weather-forecast'];
function applyWeatherStyle() {
    WX_CLS.forEach(c => document.body.classList.remove(c));
    if (S.weatherStyle && S.weatherStyle !== 'pill')
    document.body.classList.add('weather-' + S.weatherStyle);
    const fc = $('weather-forecast');
    if (fc) fc.style.display = S.weatherStyle === 'forecast' ? '' : 'none';
    if (S.weatherStyle === 'forecast' && state.forecastData)
    renderWeatherForecast();
}

const SET_CLS = ['settings-icon', 'settings-dot'];
function applySettingsStyle() {
    SET_CLS.forEach(c => document.body.classList.remove(c));
    if (S.settingsStyle && S.settingsStyle !== 'pill')
    document.body.classList.add('settings-' + S.settingsStyle);
}

function setVisible(id, show) {
    const el = $(id);
    if (!el) return;
    if (show) {
        el.style.display = '';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.opacity = '';
            el.style.transform = '';
            el.style.pointerEvents = '';
        }));
    } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px) scale(0.97)';
        el.style.pointerEvents = 'none';
        setTimeout(() => {
            const still = (id === 'clock-wrap' && !S.clockVisible) || (id === 'search-wrap' && !S.searchVisible) || (id === 'links-wrap' && !S.linksVisible) || (id === 'weather-wrap' && !S.weatherVisible) || (id === 'prayer-wrap' && !S.prayerVisible) || (id === 'quote-wrap' && !S.quoteVisible) || (id === 'calendar-wrap' && !S.calendarVisible) || (id === 'sports-wrap' && !S.sportsVisible);
            if (still) el.style.display = 'none';
        }, 500);
    }
}

function applyVisibility() {
    setVisible('clock-wrap', S.clockVisible);
    setVisible('search-wrap', S.searchVisible);
    setVisible('links-wrap', S.linksVisible);
    setVisible('weather-wrap', S.weatherVisible);
    setVisible('prayer-wrap', S.prayerVisible);
    setVisible('quote-wrap', S.quoteVisible);
    setVisible('calendar-wrap', S.calendarVisible);
    setVisible('sports-wrap', S.sportsVisible);
    $('date')?.classList.toggle('w-gone', !S.dateVisible);
}

function applySearchEngine() {
    const E = {
        google: { action: 'https://www.google.com/search', p: 'q' },
        bing: { action: 'https://www.bing.com/search', p: 'q' },
        ddg: { action: 'https://duckduckgo.com/', p: 'q' },
        brave: { action: 'https://search.brave.com/search', p: 'q' }
    };
    const e = E[S.searchEngine] || E.google;
    const form = $('search-form'), inp = $('search-input');
    if (form) form.action = e.action;
    if (inp) inp.name = e.p;
}

function showBgLayer(type) {
    const img = $('bg-image'), vid = $('bg-video'), snd = $('sound-btn'), spd = $('speed-row');
    if (img) {
        img.style.display = 'none';
        img.classList.remove('loaded');
    }
    if (vid) {
        vid.style.display = 'none';
        vid.classList.remove('loaded');
    }
    if (snd) snd.classList.remove('visible');
    if (spd) spd.style.opacity = '0.35';
    
    if (type === 'image' && img) {
        img.style.display = 'block';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (img.complete && img.naturalWidth) img.classList.add('loaded');
        }));
    } else if (type === 'video' && vid) {
        vid.style.display = 'block';
        if (snd) snd.classList.add('visible');
        if (spd) spd.style.opacity = '';
    }
    if (type === 'image' || type === 'video') {
        const cv = $('bg-canvas');
        if (cv) cv.style.display = 'none';
        stopInteractiveCanvas();
    }
}

function applyGradient(i) {
    const p = PRESET_GRADIENTS[i] || PRESET_GRADIENTS[0];
    const fg = $('bg-fallback');
    if (!fg) return;
    fg.className = fg.className.replace(/anim-\S+/g, '').trim();
    
    if (p.anim) {
        fg.style.background = '';
        fg.style.transition = 'none';
        fg.classList.add(p.anim);
    } else {
        fg.style.transition = '';
        fg.style.background = p.bg;
    }
    
    const canvas = $('bg-canvas');
    if (!canvas) return;
    
    stopInteractiveCanvas();
    if (p.interactive) {
        canvas.style.display = 'block';
        startInteractiveCanvas(canvas, p.interactive);
    } else {
        canvas.style.display = 'none';
    }
}

function applyVideoDim() {
    const d = $('video-dim');
    if (d) d.style.opacity = (parseInt(S.videoDim) || 0) / 100;
}

function applyVideoSpeed() {
    const v = $('bg-video');
    if (v && v.src) v.playbackRate = parseFloat(S.videoSpeed) || 1;
}

function loadImageIntoDOM(src) {
    const img = $('bg-image');
    if (!img) return;
    img.classList.remove('loaded');
    img.onload = () => img.classList.add('loaded');
    img.src = src;
    showBgLayer('image');
}

function loadVideoIntoDOM(src) {
    const vid = $('bg-video');
    if (!vid) return;
    vid.classList.remove('loaded');
    vid.muted = (S.videoMuted !== false);
    vid.src = src;
    vid.oncanplay = () => {
        vid.classList.add('loaded');
        vid.playbackRate = parseFloat(S.videoSpeed) || 1;
    };
    vid.load();
    vid.play().catch(() => {});
    showBgLayer('video');
    updateSoundBtn();
}

function updateSoundBtn() {
    const v = $('bg-video');
    if (!v) return;
    const on = $('snd-on'), off = $('snd-off');
    if (on) on.style.display = v.muted ? 'none' : '';
    if (off) off.style.display = v.muted ? '' : 'none';
}

function placeAllWidgets() {
    WIDGET_IDS.forEach(id => {
        const el = $(id), pos = S[WIDGET_KEY[id]], zone = $('zone-' + pos);
        if (el && zone) {
            if (el.parentElement !== zone) zone.appendChild(el);
            alignToZone(el, zone);
        }
    });
    document.querySelectorAll('.zone').forEach(reorderZone);
}

function reorderZone(zone) {
    Array.from(zone.children).sort((a, b) => (WIDGET_IDS.indexOf(a.id) ?? 99) - (WIDGET_IDS.indexOf(b.id) ?? 99)).forEach(c => zone.appendChild(c));
}

async function moveWidget(id, newPos) {
    const el = $(id), zone = $('zone-' + newPos);
    if (!el || !zone || el.parentElement === zone) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.92)';
    await sleep(230);
    zone.appendChild(el);
    alignToZone(el, zone);
    reorderZone(zone);
    el.style.opacity = '';
    el.style.transform = '';
}

function alignToZone(el, zone) {
    const col = zone.dataset.col;
    if (el.id === 'clock-wrap') el.style.textAlign = col === 'left' ? 'left' : col === 'right' ? 'right' : 'center';
    if (el.id === 'links-wrap') el.style.justifyContent = col === 'left' ? 'flex-start' : col === 'right' ? 'flex-end' : 'center';
    if (el.id === 'weather-wrap' || el.id === 'prayer-wrap') {
        el.style.marginLeft = col === 'right' ? 'auto' : '';
        el.style.marginRight = col === 'left' ? 'auto' : '';
    }
}

function applyFadeMode() {
    clearTimeout(fadeTimer);
    document.body.classList.remove('faded');
    if (S.autoFade) resetFadeTimer();
}

function resetFadeTimer() {
    clearTimeout(fadeTimer);
    document.body.classList.remove('faded');
    if (!S.autoFade) return;
    fadeTimer = setTimeout(() => {
        if (!document.body.classList.contains('panel-open')) document.body.classList.add('faded');
    }, (S.autoFadeDelay || 10) * 1000);
}

async function buildGallery() {
    const grid = $('full-gallery');
    if (!grid) return;
    safeHTML(grid, '');
    PRESET_GRADIENTS.forEach((p, i) => {
        const isAct = S.bgType === 'gradient' && S.bgGradientIndex === i;
        const item = document.createElement('div');
        item.className = 'gal-item' + (isAct ? ' active' : '');
        item.style.background = p.bg;
        const liveTag = p.anim ? '<span class="gal-live">✦</span>' : '';
        safeHTML(item, `<div class="gal-check">✓</div><div class="gal-label">${p.name}${liveTag}</div>`);
        item.addEventListener('click', () => {
            S.bgType = 'gradient';
            S.bgGradientIndex = i;
            applyGradient(i);
            showBgLayer('gradient');
            buildGallery();
            scheduleSave();
        });
        grid.appendChild(item);
    });
    for (const entry of userGallery) {
        const isAct = S.bgType === entry.type && S.bgActiveKey === entry.dataKey;
        const item = document.createElement('div');
        item.className = 'gal-item user-item' + (isAct ? ' active' : '');
        item.style.cssText = 'background:#1a1a2e;background-size:cover;background-position:center';
        if (entry.thumb) item.style.backgroundImage = `url(${entry.thumb})`;
        safeHTML(item, `<div class="gal-check">✓</div><div class="gal-label">${entry.type === 'video' ? '▶ Video' : '🖼 Image'}</div><div class="gal-del">×</div>`);
        item.querySelector('.gal-del').addEventListener('click', async e => {
            e.stopPropagation();
            await deleteUserEntry(entry);
        });
        item.addEventListener('click', () => activateUserEntry(entry));
        grid.appendChild(item);
    }
    const addImg = document.createElement('div');
    addImg.className = 'gal-add';
    safeHTML(addImg, `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Add Image</span>`);
    addImg.addEventListener('click', () => $('file-image-input').click());
    grid.appendChild(addImg);
    const addVid = document.createElement('div');
    addVid.className = 'gal-add';
    safeHTML(addVid, `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><span>Add Video</span>`);
    addVid.addEventListener('click', () => $('file-video-input').click());
    grid.appendChild(addVid);
}

async function activateUserEntry(entry) {
    S.bgType = entry.type;
    S.bgActiveKey = entry.dataKey;
    if (entry.type === 'video') {
        let url = _blobCache[entry.dataKey];
        if (!url) {
            if (entry.storageType === 'idb') {
                const blob = await idbGet(entry.dataKey);
                if (!blob) {
                    S.bgType = 'gradient';
                    S.bgGradientIndex = 0;
                    applyGradient(0);
                    showBgLayer('gradient');
                    return;
                }
                url = URL.createObjectURL(blob);
            } else {
                const data = await storageGet(entry.dataKey);
                if (!data) {
                    S.bgType = 'gradient';
                    S.bgGradientIndex = 0;
                    applyGradient(0);
                    showBgLayer('gradient');
                    return;
                }
                url = data;
            }
            _blobCache[entry.dataKey] = url;
        }
        loadVideoIntoDOM(url);
    } else {
        const data = await storageGet(entry.dataKey);
        if (!data) return;
        loadImageIntoDOM(data);
    }
    scheduleSave();
    buildGallery();
}

async function deleteUserEntry(entry) {
    if (S.bgType === entry.type && S.bgActiveKey === entry.dataKey) {
        S.bgType = 'gradient';
        S.bgGradientIndex = 0;
        S.bgActiveKey = null;
        applyGradient(0);
        showBgLayer('gradient');
    }
    if (_blobCache[entry.dataKey]) {
        URL.revokeObjectURL(_blobCache[entry.dataKey]);
        delete _blobCache[entry.dataKey];
    }
    if (entry.storageType === 'idb') {
        await idbDel(entry.dataKey);
    } else {
        await new Promise(r => chrome.storage.local.remove(entry.dataKey, r));
    }
    userGallery = userGallery.filter(e => e.dataKey !== entry.dataKey);
    await storageSet('user_gallery_index', userGallery);
    buildGallery();
    scheduleSave();
}

async function handleFileUpload(file, type) {
    if (!file) return;
    const grid = $('full-gallery');
    const prog = document.createElement('div');
    prog.className = 'gal-progress';
    safeHTML(prog, '<div class="gal-prog-bar"></div><span>Processing…</span>');
    if (grid) grid.prepend(prog);
    
    const id = 'user_' + Date.now(), dataKey = 'bg_user_' + id;
    let thumb = null;
    
    if (type === 'image') {
        const dataUrl = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = e => res(e.target.result);
            r.onerror = rej;
            r.readAsDataURL(file);
        });
        thumb = await resizeImageThumb(dataUrl);
        prog?.remove();
        try {
            await storageSet(dataKey, dataUrl);
        } catch {
            alert('Image too large for storage. Try a smaller file.');
            return;
        }
        const entry = { id, type: 'image', thumb, dataKey };
        userGallery.push(entry);
        await storageSet('user_gallery_index', userGallery);
        await activateUserEntry(entry);
    } else {
        const blobUrl = URL.createObjectURL(file);
        thumb = await captureVideoThumbnail(blobUrl);
        prog?.remove();
        try {
            await idbSet(dataKey, file);
        } catch {
            URL.revokeObjectURL(blobUrl);
            alert('Video too large for storage.');
            return;
        }
        const entry = { id, type: 'video', thumb, dataKey, storageType: 'idb' };
        userGallery.push(entry);
        await storageSet('user_gallery_index', userGallery);
        S.bgType = 'video';
        S.bgActiveKey = dataKey;
        _blobCache[dataKey] = blobUrl;
        loadVideoIntoDOM(blobUrl);
        scheduleSave();
        buildGallery();
    }
}

async function resizeImageThumb(dataUrl) {
    return new Promise(r => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = 160;
            c.height = 100;
            c.getContext('2d').drawImage(img, 0, 0, 160, 100);
            r(c.toDataURL('image/jpeg', .7));
        };
        img.onerror = () => r(null);
        img.src = dataUrl;
    });
}

function captureVideoThumbnail(url) {
    return new Promise(r => {
        const v = document.createElement('video');
        v.muted = true; v.autoplay = true; v.playsInline = true; v.src = url;
        v.onloadeddata = () => {
            v.currentTime = v.duration ? Math.min(1, v.duration / 2) : 1;
        };
        v.onseeked = () => {
            const c = document.createElement('canvas');
            c.width = 160; c.height = 100;
            c.getContext('2d').drawImage(v, 0, 0, 160, 100);
            r(c.toDataURL('image/jpeg', .7));
        };
        v.onerror = () => r(null);
    });
}

function openPanel() {
    document.body.classList.add('panel-open');
    clearTimeout(fadeTimer);
    document.body.classList.remove('faded');
    syncForm();
    buildGallery();
    buildThemeSwatches(applyClockTheme, scheduleSave);
    buildSearchStyleSwatches(applySearchStyle, scheduleSave);
    buildLinkStyleSwatches(applyLinksStyle, scheduleSave);
    buildWeatherStyleSwatches(applyWeatherStyle, scheduleSave);
    buildSettingsStyleSwatches(applySettingsStyle, scheduleSave);
    buildPrayerStyleSwatches(scheduleSave);
    buildQuoteStyleSwatches(scheduleSave);
    buildCalendarStyleSwatches(scheduleSave);
    buildSportsStyleSwatches(scheduleSave);
}

function closePanel() {
    document.body.classList.remove('panel-open');
    if (S.autoFade) resetFadeTimer();
}

function syncForm() {
    ['clockVisible', 'dateVisible', 'greetingEnabled', 'searchVisible', 'linksVisible', 'weatherVisible', 'autoFade', 'prayerVisible', 'quoteVisible', 'calendarVisible', 'sportsVisible'].forEach(k => {
        const el = $(k);
        if (el) el.checked = !!S[k];
    });
    ['clockFormat', 'clockSize', 'searchEngine', 'videoSpeed', 'linksSize', 'weatherUnit', 'prayerMethod', 'quoteSource', 'quoteStyle', 'arabicFont', 'quranReciter', 'calendarProvider', 'calendarStyle', 'sportsLeague'].forEach(k => {
        const el = $(k);
        if (el) el.value = S[k];
    });
    const gn = $('greetingName');
    if (gn) gn.value = S.greetingName || '';
    const dimEl = $('videoDim'), dimV = $('videoDim-val');
    if (dimEl) {
        dimEl.value = S.videoDim;
        if (dimV) dimV.textContent = S.videoDim + '%';
    }
    const fdEl = $('autoFadeDelay'), fdV = $('autoFadeDelay-val');
    if (fdEl) {
        fdEl.value = S.autoFadeDelay;
        if (fdV) fdV.textContent = S.autoFadeDelay + 's';
    }
    buildPositionGrids();
}

function buildPositionGrids() {
    ['clockPosition', 'searchPosition', 'linksPosition', 'weatherPosition', 'prayerPosition', 'quotePosition', 'calendarPosition', 'sportsPosition'].forEach(key => {
        const grid = $('grid-' + key);
        if (!grid) return;
        safeHTML(grid, '');
        POSITIONS_ORDER.forEach(pos => {
            const cell = document.createElement('div');
            cell.className = 'pos-cell' + (S[key] === pos ? ' sel' : '');
            const dot = document.createElement('div');
            dot.className = 'pos-dot';
            cell.appendChild(dot);
            cell.title = pos.replace(/-/g, ' ');
            cell.addEventListener('click', async() => {
                if (isMoving) return;
                isMoving = true;
                grid.querySelectorAll('.pos-cell').forEach(c => c.classList.remove('sel'));
                cell.classList.add('sel');
                const old = S[key];
                S[key] = pos;
                const wid = key === 'clockPosition' ? 'clock-wrap' : key === 'searchPosition' ? 'search-wrap' : key === 'linksPosition' ? 'links-wrap' : key === 'prayerPosition' ? 'prayer-wrap' : key === 'quotePosition' ? 'quote-wrap' : key === 'calendarPosition' ? 'calendar-wrap' : key === 'sportsPosition' ? 'sports-wrap' : 'weather-wrap';
                if (pos !== old) await moveWidget(wid, pos);
                isMoving = false;
                scheduleSave();
            });
            grid.appendChild(cell);
        });
    });
}

function collectForm() {
    ['clockVisible', 'dateVisible', 'greetingEnabled', 'searchVisible', 'linksVisible', 'weatherVisible', 'autoFade', 'prayerVisible', 'quoteVisible', 'calendarVisible', 'sportsVisible'].forEach(k => {
        const el = $(k);
        if (el) S[k] = el.checked;
    });
    ['clockFormat', 'clockSize', 'searchEngine', 'videoSpeed', 'linksSize', 'weatherUnit', 'quoteSource', 'quoteStyle', 'arabicFont', 'quranReciter', 'calendarProvider', 'calendarStyle', 'sportsLeague'].forEach(k => {
        const el = $(k);
        if (el) S[k] = el.value;
    });
    const pm = $('prayerMethod');
    if (pm) S.prayerMethod = parseInt(pm.value);
    const gn = $('greetingName');
    if (gn) S.greetingName = gn.value;
    const dimEl = $('videoDim');
    if (dimEl) S.videoDim = parseInt(dimEl.value);
    const fdEl = $('autoFadeDelay');
    if (fdEl) S.autoFadeDelay = parseInt(fdEl.value);
}

function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async() => {
        await storageSet('settings', S);
        const t = $('panel-saved');
        if (!t) return;
        clearTimeout(saveToastTimer);
        t.classList.add('show');
        saveToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    }, 380);
}

function openLinksModal() {
    tempLinks = links.map(l => ({ ...l }));
    renderLinksEditor();
    $('links-modal').classList.add('open');
}

function closeLinksModal() {
    $('links-modal').classList.remove('open');
}

function renderLinksEditor() {
    const ed = $('links-editor');
    if (!ed) return;
    safeHTML(ed, '');
    tempLinks.forEach((link, i) => {
        const row = document.createElement('div');
        row.className = 'link-row';
        const ei = document.createElement('input');
        ei.type = 'text'; ei.className = 'ie'; ei.placeholder = '😀'; ei.value = link.emoji;
        ei.addEventListener('input', () => { tempLinks[i].emoji = ei.value; });
        const li = document.createElement('input');
        li.type = 'text'; li.placeholder = 'Label'; li.value = link.label;
        li.addEventListener('input', () => { tempLinks[i].label = li.value; });
        const ui = document.createElement('input');
        ui.type = 'text'; ui.placeholder = 'https://…'; ui.value = link.url;
        ui.addEventListener('input', () => { tempLinks[i].url = ui.value; });
        const db = document.createElement('button');
        db.className = 'del-btn'; db.textContent = '×';
        db.addEventListener('click', () => { tempLinks.splice(i, 1); renderLinksEditor(); });
        row.appendChild(ei); row.appendChild(li); row.appendChild(ui); row.appendChild(db);
        ed.appendChild(row);
    });
}

async function init() {
    initInteractiveBackgrounds();
    window.addEventListener('location_changed', () => {
        if (S.prayerVisible) fetchPrayerTimes();
    });
    
    const savedS = await storageGet('settings');
    S = Object.assign({}, DEFAULT_SETTINGS, savedS || {});
    state.S = S;
    links = (await storageGet('quick_links')) || DEFAULT_LINKS;
    userGallery = (await storageGet('user_gallery_index')) || [];
    
    placeAllWidgets();

    // --- ENGINE STARTER & BACKGROUND LOADER ---
    if (S.bgType === 'image' && S.bgActiveKey) {
        const d = await storageGet(S.bgActiveKey);
        if (d) loadImageIntoDOM(d);
        else S.bgType = 'gradient';
    } else if (S.bgType === 'video' && S.bgActiveKey) {
        const entry = userGallery.find(e => e.dataKey === S.bgActiveKey);
        if (entry?.storageType === 'idb') {
            const blob = await idbGet(S.bgActiveKey);
            if (blob) {
                const url = URL.createObjectURL(blob);
                _blobCache[S.bgActiveKey] = url;
                loadVideoIntoDOM(url);
            } else S.bgType = 'gradient';
        } else {
            const d = await storageGet(S.bgActiveKey);
            if (d) loadVideoIntoDOM(d);
            else S.bgType = 'gradient';
        }
    }
    
    applyGradient(S.bgGradientIndex || 0);
    if (S.bgType === 'gradient') showBgLayer('gradient');
    
    applyAll();
    renderLinks(links);
    startClock();
    animateFavicon();
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopFavicon();
            stopClock();
            stopSportsTimer();
            stopInteractiveCanvas();
        } else {
            if (!favAnimFrame) animateFavicon();
            startClock();
            if (S.sportsVisible) startSportsTimer();
            if (activeInteractiveMode) {
                const canvas = $('bg-canvas');
                if (canvas) startInteractiveCanvas(canvas, activeInteractiveMode);
            }
        }
    });
    
    $('quoteVisible')?.addEventListener('change', () => { collectForm(); applyVisibility(); if (S.quoteVisible && !quoteData) fetchQuote(); scheduleSave(); });
    $('quoteSource')?.addEventListener('change', () => { collectForm(); if (S.quoteVisible) fetchQuote(); scheduleSave(); });
    $('quoteStyle')?.addEventListener('change', () => { collectForm(); if (quoteData) renderQuote(); scheduleSave(); });
    $('arabicFont')?.addEventListener('change', () => { collectForm(); applyArabicFont(); if (quoteData) renderQuote(); scheduleSave(); });
    $('quranReciter')?.addEventListener('change', () => { collectForm(); stopQuoteAudio(); if (quoteData?.type === 'quran') renderQuote(); scheduleSave(); });
    $('calendarVisible')?.addEventListener('change', () => { collectForm(); applyVisibility(); if (S.calendarVisible) renderCalendar(); scheduleSave(); });
    $('calendarProvider')?.addEventListener('change', () => { collectForm(); if (S.calendarVisible) renderCalendar(); scheduleSave(); });
    $('calendarStyle')?.addEventListener('change', () => { collectForm(); if (S.calendarVisible) renderCalendar(); scheduleSave(); });
    
    if (S.weatherVisible) fetchWeather();
    if (S.prayerVisible) fetchPrayerTimes();
    if (S.quoteVisible) fetchQuote(); else applyArabicFont();
    if (S.calendarVisible) renderCalendar();
    if (S.sportsVisible) startSportsTimer();
    
    requestAnimationFrame(() => {
        const l = $('loader');
        if (l) { l.classList.add('done'); setTimeout(() => l.remove(), 1100); }
    });
    
    const onboarded = await storageGet('onboarded');
    if (!onboarded) setTimeout(showOnboarding, 900);
    initOnboarding();
    
    ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(ev => {
        document.addEventListener(ev, () => { if (S.autoFade) resetFadeTimer(); }, { passive: true });
    });
    
    $('show-ob-btn')?.addEventListener('click', () => { closePanel(); setTimeout(showOnboarding, 300); });
    $('settings-btn').addEventListener('click', () => { if (document.body.classList.contains('panel-open')) closePanel(); else openPanel(); });
    $('panel-close').addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
    
    document.querySelectorAll('.p-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.p-page').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $('tab-' + tab.dataset.tab)?.classList.add('active');
        });
    });
    
    function onChange() { collectForm(); applyAll(); scheduleSave(); }
    ['clockVisible', 'dateVisible', 'greetingEnabled', 'searchVisible', 'linksVisible', 'autoFade'].forEach(k => $(k)?.addEventListener('change', onChange));
    ['clockFormat', 'clockSize', 'searchEngine', 'videoSpeed', 'linksSize'].forEach(k => $(k)?.addEventListener('change', onChange));
    $('greetingName')?.addEventListener('input', onChange);
    $('weatherVisible')?.addEventListener('change', () => { collectForm(); applyAll(); fetchWeather(); scheduleSave(); });
    $('weatherUnit')?.addEventListener('change', () => { collectForm(); renderWeatherTemp(); scheduleSave(); });
    $('prayerVisible')?.addEventListener('change', () => { collectForm(); applyVisibility(); if (S.prayerVisible && !prayerData) fetchPrayerTimes(); scheduleSave(); });
    $('prayerMethod')?.addEventListener('change', () => { collectForm(); if (S.prayerVisible) fetchPrayerTimes(); scheduleSave(); });
    
    const dimSl = $('videoDim'), dimVl = $('videoDim-val');
    dimSl?.addEventListener('input', () => { S.videoDim = parseInt(dimSl.value); if (dimVl) dimVl.textContent = dimSl.value + '%'; applyVideoDim(); scheduleSave(); });
    const fdSl = $('autoFadeDelay'), fdVl = $('autoFadeDelay-val');
    fdSl?.addEventListener('input', () => { S.autoFadeDelay = parseInt(fdSl.value); if (fdVl) fdVl.textContent = fdSl.value + 's'; if (S.autoFade) resetFadeTimer(); scheduleSave(); });
    
    $('file-image-input')?.addEventListener('change',e=>{handleFileUpload(e.target.files[0],'image');e.target.value='';});
    $('file-video-input')?.addEventListener('change',e=>{handleFileUpload(e.target.files[0],'video');e.target.value='';});
    $('sound-btn')?.addEventListener('click',()=>{const v=$('bg-video');if(!v)return;v.muted=!v.muted;S.videoMuted=v.muted;updateSoundBtn();scheduleSave();});
    $('open-links-modal-btn')?.addEventListener('click',openLinksModal);
    $('lm-cancel')?.addEventListener('click',closeLinksModal);
    $('links-modal')?.addEventListener('click',e=>{if(e.target===$('links-modal'))closeLinksModal();});
    $('add-link-btn')?.addEventListener('click',()=>{tempLinks.push({emoji:'🔗',label:'New Link',url:'https://'});renderLinksEditor();});
    $('lm-save')?.addEventListener('click',async()=>{links=tempLinks.filter(l=>l.url.trim()&&l.url!=='https://');await storageSet('quick_links',links);renderLinks(links);closeLinksModal();});
    
    $('r-all')?.addEventListener('click', async () => {
        if(!confirm('Reset all settings to default?')) return;
        await chrome.storage.local.clear();
        await idbClear();
        window.location.reload();
    });
    
    $('sportsVisible')?.addEventListener('change',()=>{ collectForm(); applyVisibility(); if(S.sportsVisible) startSportsTimer(); else stopSportsTimer(); scheduleSave(); });
    $('sportsLeague')?.addEventListener('change',()=>{ collectForm(); if(S.sportsVisible) startSportsTimer(); scheduleSave(); });
    $('sportsStyle')?.addEventListener('change',()=>{ collectForm(); if(S.sportsVisible) fetchSports(); scheduleSave(); });
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn?.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.copy);
            const oldTxt = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('acc');
            setTimeout(() => { btn.textContent = oldTxt; btn.classList.remove('acc'); }, 2000);
        });
    });
}

document.addEventListener('DOMContentLoaded',init);