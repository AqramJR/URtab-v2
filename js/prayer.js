import { $, safeHTML } from './utils.js';
import { state } from './state.js';
import { getGeoPos } from './weather.js';

export let prayerData = null;
let prayerDateStr = null;
let prayerHijri = null;
let _lastNextPrayerIndex = -1;

const PRAYER_NAMES = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const PRAYER_NAMES_AR = ['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'];
const PRAYER_KEYS = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const PRAYER_ICONS = ['🌙','🌅','☀️','🌤','🌇','🌃'];

export async function fetchPrayerTimes() {
	const wrap = $('prayer-wrap');
	if (!wrap) return;
	safeHTML(wrap, `<div style="font-size:11px;color:rgba(255,255,255,.4);padding:12px 16px;letter-spacing:1px">🕌 Locating…</div>`);
	try {
		const pos = await getGeoPos();
		const { latitude: lat, longitude: lon } = pos.coords;
		const today = new Date();
		prayerDateStr = today.toDateString();
		const ts = Math.floor(today.getTime() / 1000);
		const res = await fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&method=${state.S.prayerMethod || 5}`);
		const json = await res.json();
		if (json.code !== 200) throw new Error('Bad response');
		prayerData = json.data.timings;
		_lastNextPrayerIndex = -1;
		
		const h = json.data.date?.hijri;
		if (h) prayerHijri = { day: h.day, month: h.month.en, monthAr: h.month.ar, year: h.year };
		else prayerHijri = null;
		
		renderPrayer();
	} catch (e) {
		if (wrap) {
			safeHTML(wrap, '');
			const errDiv = document.createElement('div');
			errDiv.style.cssText = 'font-size:11px;color:rgba(255,120,80,.7);padding:12px 16px;cursor:pointer';
			errDiv.textContent = '⚠️ Prayer times unavailable — tap to retry';
			errDiv.addEventListener('click', () => fetchPrayerTimes());
			wrap.appendChild(errDiv);
		}
	}
}

export function getNextPrayer() {
	if (!prayerData) return null;
	const now = new Date();
	const nowMins = now.getHours() * 60 + now.getMinutes();
	for (let i = 0; i < PRAYER_KEYS.length; i++) {
		const key = PRAYER_KEYS[i];
		const t = prayerData[key];
		if (!t) continue;
		const mins = timeToMins(t);
		if (mins > nowMins) return { index: i, key, name: PRAYER_NAMES[i], nameAr: PRAYER_NAMES_AR[i], icon: PRAYER_ICONS[i], time: t, mins };
	}
	return { index: 0, key: 'Fajr', name: 'Fajr', nameAr: 'الفجر', icon: '🌙', time: prayerData['Fajr'], mins: timeToMins(prayerData['Fajr']) + 1440 };
}

function timeToMins(t) {
	if(!t) return 0;
	const [h,m] = t.split(':').map(Number);
	return h*60+m;
}

export function formatCountdown(diffMins) {
	if (diffMins < 1) return 'Now';
	const h = Math.floor(diffMins / 60), m = diffMins % 60;
	if (h > 0) return `in ${h}h ${m}m`;
	return `in ${m}m`;
}

export function fmt12(t24) {
	if (!t24) return '';
	const [h, m] = t24.split(':').map(Number);
	const suf = h >= 12 ? 'PM' : 'AM';
	const h12 = h % 12 || 12;
	return `${h12}:${String(m).padStart(2, '0')} ${suf}`;
}

export function renderPrayer() {
	const wrap = $('prayer-wrap');
	if (!wrap || !prayerData) return;
	const style = state.S.prayerStyle || 'minimal';
	const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
	const next = getNextPrayer();
	
	_lastNextPrayerIndex = next ? next.index : -1;
	safeHTML(wrap, '');
	wrap.className = wrap.className.split(' ').filter(c => !c.startsWith('style-')).join(' ');
	
	if (style === 'minimal') renderPrayerMinimal(wrap, next, nowMins);
	else if (style === 'bar') renderPrayerBar(wrap, next, nowMins);
	else if (style === 'card') renderPrayerCard(wrap, next, nowMins);
	else if (style === 'mosque') renderPrayerMosque(wrap, next, nowMins);
}

export function hijriStr() {
	if (!prayerHijri) return '';
	return `${prayerHijri.day} ${prayerHijri.month} ${prayerHijri.year} AH`;
}

export function renderPrayerMinimal(wrap, next, nowMins) {
	wrap.classList.add('style-minimal');
	if (!next) { safeHTML(wrap, '<span style="opacity:.4">--</span>'); return; }
	const diffMins = Math.max(0, Math.round(next.mins - nowMins));
	const hDate = hijriStr();
	safeHTML(wrap, `
		<span class="prayer-minimal-icon">${next.icon}</span>
		<div class="prayer-minimal-info">
		${hDate ? `<div class="prayer-minimal-hijri">${hDate}</div>` : ''}
		<div class="prayer-minimal-name">${next.name}</div>
		<div class="prayer-minimal-time">${state.S.clockFormat === '12h' ? fmt12(next.time) : next.time}</div>
		<div class="prayer-minimal-countdown">${formatCountdown(diffMins)}</div>
		</div>
	`);
}

export function renderPrayerBar(wrap, next, nowMins) {
	wrap.classList.add('style-bar');
	const hdr = document.createElement('div');
	hdr.className = 'prayer-bar-header';
	const hDate = hijriStr();
	safeHTML(hdr, `
		<span class="prayer-bar-title">🕌 Prayer Times${hDate ? `<span class="prayer-bar-hijri">${hDate}</span>` : ''}</span>
		${next ? `<span class="prayer-bar-next">Next: ${next.name}</span>` : ''}
	`);
	wrap.appendChild(hdr);
	
	const pills = document.createElement('div');
	pills.className = 'prayer-bar-pills';
	PRAYER_KEYS.forEach((key, i) => {
		const t = prayerData[key];
		if (!t) return;
		const mins = timeToMins(t);
		const passed = mins < nowMins;
		const isNext = next && next.index === i;
		const pill = document.createElement('div');
		pill.className = 'prayer-pill' + (isNext ? ' active-prayer' : passed ? ' passed' : '');
		safeHTML(pill, `<span class="prayer-pill-icon">${PRAYER_ICONS[i]}</span><span class="prayer-pill-name">${PRAYER_NAMES[i]}</span><span class="prayer-pill-time">${state.S.clockFormat === '12h' ? fmt12(t) : t}</span>`);
		pills.appendChild(pill);
	});
	wrap.appendChild(pills);
}

export function renderPrayerCard(wrap, next, nowMins) {
	wrap.classList.add('style-card');
	const hdr = document.createElement('div');
	hdr.className = 'prayer-card-header';
	const hDate = hijriStr();
	safeHTML(hdr, `
		<span class="prayer-card-title">🕌 Prayer Times</span>
		<span class="prayer-card-date">
		<span class="prayer-card-greg">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
		${hDate ? `<span class="prayer-card-hijri">${hDate}</span>` : ''}
		</span>
	`);
	wrap.appendChild(hdr);
	
	const list = document.createElement('div');
	list.className = 'prayer-card-list';
	PRAYER_KEYS.forEach((key, i) => {
		const t = prayerData[key];
		if (!t) return;
		const mins = timeToMins(t);
		const passed = mins < nowMins;
		const isNext = next && next.index === i;
		const row = document.createElement('div');
		row.className = 'prayer-card-row' + (isNext ? ' active-prayer' : passed ? ' passed' : '');
		safeHTML(row, `
			<span class="prow-icon">${PRAYER_ICONS[i]}</span>
			<span class="prow-name">${PRAYER_NAMES[i]}</span>
			<span class="prow-name-ar">${PRAYER_NAMES_AR[i]}</span>
			<span class="prow-time">${state.S.clockFormat === '12h' ? fmt12(t) : t}</span>
			${isNext ? '<span class="prow-badge">Next</span>' : ''}
		`);
		list.appendChild(row);
	});
	wrap.appendChild(list);
}

export function renderPrayerMosque(wrap, next, nowMins) {
	wrap.classList.add('style-mosque');
	if (next) {
		const diffMins = Math.max(0, Math.round(next.mins - nowMins));
		const hDate = hijriStr();
		const hero = document.createElement('div');
		hero.className = 'prayer-mosque-hero';
		safeHTML(hero, `
			<div class="prayer-mosque-crescent">☽</div>
			${hDate ? `<div class="prayer-mosque-hijri">${hDate}</div>` : ''}
			<div class="prayer-mosque-next-label">Next Prayer</div>
			<div class="prayer-mosque-next-name">${next.nameAr}</div>
			<div class="prayer-mosque-next-name-en">${next.name}</div>
			<div class="prayer-mosque-next-time">${state.S.clockFormat === '12h' ? fmt12(next.time) : next.time}</div>
			<div class="prayer-mosque-countdown">${formatCountdown(diffMins)}</div>
		`);
		wrap.appendChild(hero);
	}
	
	const row = document.createElement('div');
	row.className = 'prayer-mosque-row';
	PRAYER_KEYS.forEach((key, i) => {
		const t = prayerData[key];
		if (!t) return;
		const mins = timeToMins(t);
		const passed = mins < nowMins;
		const isNext = next && next.index === i;
		const cell = document.createElement('div');
		cell.className = 'prayer-mosque-cell' + (isNext ? ' now' : passed ? ' done' : '');
		safeHTML(cell, `<span class="prayer-mosque-cell-icon">${PRAYER_ICONS[i]}</span><span class="prayer-mosque-cell-name">${PRAYER_NAMES[i]}</span><span class="prayer-mosque-cell-time">${(prayerData[key] || '').slice(0, 5)}</span>`);
		row.appendChild(cell);
	});
	wrap.appendChild(row);
}

export function updatePrayerCountdown() {
	const next = getNextPrayer();
	if (!next) return;
	if (next.index !== _lastNextPrayerIndex) {
		_lastNextPrayerIndex = next.index;
		renderPrayer();
		return;
	}
	const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
	const diffMins = Math.max(0, Math.round(next.mins - nowMins));
	const cd = document.querySelector('.prayer-minimal-countdown,.prayer-mosque-countdown');
	if (cd) cd.textContent = formatCountdown(diffMins);
}
export function checkPrayerDayTick() {
	if (!prayerData || !state.S.prayerVisible) return;
	updatePrayerCountdown();
	const nowStr = new Date().toDateString();
	if (prayerDateStr && prayerDateStr !== nowStr) {
		prayerDateStr = null;
		fetchPrayerTimes();
	}
}