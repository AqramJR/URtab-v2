import { $, safeHTML, storageGet, storageSet } from './utils.js';
import { state } from './state.js';

export async function getGeoPos() {
	if (state.geoPos) return state.geoPos;
	const saved = await storageGet('saved_location');
	if (saved && saved.lat && saved.lon) {
		state.geoPos = { coords: { latitude: saved.lat, longitude: saved.lon } };
		_refreshGeoInBackground();
		return state.geoPos;
	}
	return _getLiveGeo();
}

async function _getLiveGeo() {
	try {
		const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000, maximumAge: 600000 }));
		state.geoPos = pos;
		await storageSet('saved_location', { lat: pos.coords.latitude, lon: pos.coords.longitude });
		return state.geoPos;
	} catch (e) {
		try {
			const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
			const geo = await res.json();
			if (geo.latitude && geo.longitude) {
				state.geoPos = { coords: { latitude: geo.latitude, longitude: geo.longitude } };
				await storageSet('saved_location', { lat: geo.latitude, lon: geo.longitude });
				return state.geoPos;
			}
		} catch (ipErr) {}
		throw e;
	}
}

async function _refreshGeoInBackground() {
	try {
		const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, maximumAge: 0 }));
		const { latitude: lat, longitude: lon } = pos.coords;
		const prev = state.geoPos.coords;
		const moved = Math.abs(lat - prev.latitude) > 0.01 || Math.abs(lon - prev.longitude) > 0.01;
		state.geoPos = pos;
		await storageSet('saved_location', { lat, lon });
		
		if (moved) {
			if (state.S.weatherVisible) fetchWeather();
			// Dispatches an event so the Prayer widget knows to update without being directly linked!
			window.dispatchEvent(new Event('location_changed'));
		}
	} catch {}
}

export async function fetchWeather() {
	const iEl = $('weather-icon'), tEl = $('weather-temp'), dEl = $('weather-desc'), cEl = $('weather-city'), rEl = $('weather-retry');
	if (iEl) iEl.textContent = '📡';
	if (dEl) dEl.textContent = 'Locating…';
	if (tEl) tEl.textContent = '';
	if (rEl) rEl.style.display = 'none';
	try {
		const pos = await getGeoPos();
		const { latitude: lat, longitude: lon } = pos.coords;
		const [wxRes, geoRes] = await Promise.all([
			fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`),
			fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=en`),
		]);
		const wx = await wxRes.json(), geo = await geoRes.json();
		const cw = wx.current_weather, wmo = getWMO(cw.weathercode);
		state.weatherCelsius = Math.round(cw.temperature);
		state.forecastData = wx.daily || null;
		const city = geo.city || geo.locality || geo.countryName || '';
		
		if (iEl) iEl.textContent = wmo.i;
		if (dEl) dEl.textContent = wmo.d;
		if (cEl) cEl.textContent = city;
		renderWeatherTemp();
		buildWeatherAnim(wmo.cat);
		if (state.S.weatherStyle === 'forecast') renderWeatherForecast();
	} catch {
		state.forecastData = null;
		if (iEl) iEl.textContent = '⚠️';
		if (dEl) dEl.textContent = 'Location denied';
		if (rEl) {
			rEl.style.display = '';
			const retryHandler = () => {
				rEl.removeEventListener('click', retryHandler);
				fetchWeather();
			};
			rEl.addEventListener('click', retryHandler, { once: true });
		}
	}
}

export function renderWeatherForecast() {
	const wrap = $('weather-wrap');
	if (!wrap || !state.forecastData || state.S.weatherStyle !== 'forecast') return;
	let fc = $('weather-forecast');
	if (!fc) {
		fc = document.createElement('div');
		fc.id = 'weather-forecast';
		wrap.appendChild(fc);
	}
	const days = state.forecastData.time?.slice(0, 5) || [];
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	safeHTML(fc, days.map((dateStr, idx) => {
		const d = new Date(dateStr + 'T00:00:00');
		const label = idx === 0 ? 'Today' : dayNames[d.getDay()];
		const wmo = getWMO(state.forecastData.weathercode[idx]);
		const hi = tempDisplay(Math.round(state.forecastData.temperature_2m_max[idx]));
		const lo = tempDisplay(Math.round(state.forecastData.temperature_2m_min[idx]));
		const rain = state.forecastData.precipitation_probability_max[idx] || 0;
		return `<div class="fc-row${idx === 0 ? ' fc-today' : ''}">
		<span class="fc-day">${label}</span>
		<span class="fc-icon">${wmo.i}</span>
		<span class="fc-desc">${wmo.d}</span>
		<span class="fc-rain">${rain > 0 ? `💧${rain}%` : ''}</span>
		<span class="fc-temps"><span class="fc-hi">${hi}</span><span class="fc-lo">${lo}</span></span>
		</div>`;
	}).join(''));
}

function tempDisplay(c) {
	const v = state.S.weatherUnit === 'F' ? Math.round(c * 9 / 5 + 32) : c;
	return `${v}°`;
}

export function renderWeatherTemp() {
	if (state.weatherCelsius === null) return;
	const el = $('weather-temp');
	if (!el) return;
	const val = state.S.weatherUnit === 'F' ? Math.round(state.weatherCelsius * 9 / 5 + 32) : state.weatherCelsius;
	el.textContent = `${val}°${state.S.weatherUnit}`;
	if (state.S.weatherStyle === 'forecast' && state.forecastData) renderWeatherForecast();
}

function buildWeatherAnim(cat) {
	const anim = $('weather-anim'), wrap = $('weather-wrap');
	if (!anim || !wrap) return;
	safeHTML(anim, '');
	wrap.className = wrap.className.replace(/wx-\w+/g, '').trim();
	if (cat === 'clear') {
		wrap.classList.add('wx-clear');
		for (let i = 0; i < 8; i++) {
			const r = document.createElement('div');
			r.className = 'wx-ray';
			r.style.cssText = `top:50%;left:20px;transform:rotate(${i * 45}deg);animation-duration:${2 + i * .2}s;animation-delay:${i * .25}s`;
			anim.appendChild(r);
		}
	} else if (cat === 'rain' || cat === 'storm') {
		if (cat === 'storm') wrap.classList.add('wx-storm');
		for (let i = 0; i < (cat === 'storm' ? 12 : 18); i++) {
			const d = document.createElement('div');
			d.className = 'wx-drop';
			d.style.cssText = `left:${Math.random() * 100}%;height:${8 + Math.random() * 10}px;animation-duration:${.5 + Math.random() * .5}s;animation-delay:${ - Math.random() * 1.2}s;opacity:${.4 + Math.random() * .4};top:0`;
			anim.appendChild(d);
		}
		if (cat === 'storm') {
			const l = document.createElement('div');
			l.className = 'wx-lightning';
			l.textContent = '⚡';
			l.style.cssText = 'right:10px;top:4px;font-size:18px;animation-duration:3s;animation-delay:1s';
			anim.appendChild(l);
		}
	} else if (cat === 'snow') {
		for (let i = 0; i < 14; i++) {
			const s = document.createElement('div');
			s.className = 'wx-snow';
			s.style.cssText = `left:${Math.random() * 100}%;width:${3 + Math.random() * 4}px;height:${3 + Math.random() * 4}px;animation-duration:${2 + Math.random() * 2}s;animation-delay:${ - Math.random() * 3}s;opacity:${.5 + Math.random() * .4};top:0`;
			anim.appendChild(s);
		}
	} else {
		for (let i = 0; i < 3; i++) {
			const c = document.createElement('div');
			c.className = 'wx-cloud';
			const w = 40 + i * 20;
			c.style.cssText = `width:${w}px;height:${w * .6}px;top:${4 + i * 12}px;left:-${w}px;animation-duration:${12 + i * 6}s;animation-delay:${ - i * 4}s;opacity:${.12 + i * .04}`;
			anim.appendChild(c);
		}
	}
}