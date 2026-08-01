import { $ } from './utils.js';
import { state } from './state.js';
import { checkPrayerDayTick } from './prayer.js';

export let clockTimer = null;
export let favAnimFrame = null;
let favHue = 240;

const CLOCK_SIZES = {
    small: { time: 'clamp(48px, 8vw, 80px)', date: '11px', greeting: '11px', day: 'clamp(50px, 9vw, 100px)' },
    medium: { time: 'clamp(56px, 9.5vw, 100px)', date: '12px', greeting: '12px', day: 'clamp(60px, 11vw, 130px)' },
    large: { time: 'clamp(64px, 11vw, 118px)', date: '13px', greeting: '13px', day: 'clamp(72px, 13vw, 160px)' },
    xlarge: { time: 'clamp(72px, 13vw, 140px)', date: '15px', greeting: '15px', day: 'clamp(84px, 15vw, 190px)' }
};

export function animateFavicon() {
    const canvas = $('fav-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = 32;
    canvas.width = s;
    canvas.height = s;
    const r = s * .22;
    
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(s, 0, s, s, r);
    ctx.arcTo(s, s, 0, s, r);
    ctx.arcTo(0, s, 0, 0, r);
    ctx.arcTo(0, 0, s, 0, r);
    ctx.closePath();
    const bg = ctx.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, `hsl(${favHue},60%,12%)`);
    bg.addColorStop(1, `hsl(${favHue + 40},70%,8%)`);
    ctx.fillStyle = bg;
    ctx.fill();
    
    const grd = ctx.createLinearGradient(s * .15, s * .15, s * .85, s * .85);
    grd.addColorStop(0, `hsla(${favHue},80%,65%,0.9)`);
    grd.addColorStop(1, `hsla(${favHue + 40},80%,55%,0.9)`);
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * .36,  - .4, Math.PI * 1.8);
    ctx.strokeStyle = grd;
    ctx.lineWidth = s * .09;
    ctx.stroke();
    
    const now = new Date();
    const hAngle = (now.getHours() % 12 + now.getMinutes() / 60) / 12 * Math.PI * 2 - Math.PI / 2;
    const mAngle = now.getMinutes() / 60 * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = s * .06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s / 2, s / 2);
    ctx.lineTo(s / 2 + Math.cos(hAngle) * s * .18, s / 2 + Math.sin(hAngle) * s * .18);
    ctx.stroke();
    ctx.lineWidth = s * .04;
    ctx.beginPath();
    ctx.moveTo(s / 2, s / 2);
    ctx.lineTo(s / 2 + Math.cos(mAngle) * s * .27, s / 2 + Math.sin(mAngle) * s * .27);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * .045, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    const link = $('dyn-favicon');
    if (link) link.href = canvas.toDataURL();
    favHue = (favHue + .3) % 360;
    favAnimFrame = setTimeout(animateFavicon, 1000);
}

export function stopFavicon() {
    if (favAnimFrame) {
        clearTimeout(favAnimFrame);
        favAnimFrame = null;
    }
}

export function tickClock() {
    const S = state.S;
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    let suf = '';
    if (S.clockFormat === '12h') {
        suf = h >= 12 ? ' PM' : ' AM';
        h = h % 12 || 12;
    } else h = String(h).padStart(2, '0');
    
    const t = $('time-text');
    if (t) t.textContent = h + ':' + m;
    const s = $('time-suffix');
    if (s) s.textContent = suf;
    const d = $('date');
    if (d) d.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    const dy = $('time-day');
    if (dy) dy.textContent = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const g = $('greeting');
    if (g) {
        if (S.greetingEnabled && S.greetingName) {
            const hr = now.getHours();
            g.textContent = `Good ${hr < 12 ? 'Morning' : hr < 17 ? 'Afternoon' : 'Evening'}, ${S.greetingName}`;
            g.classList.remove('w-gone');
        } else g.classList.add('w-gone');
    }
    
    checkPrayerDayTick();
}

export function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    tickClock();
    clockTimer = setInterval(tickClock, 1000);
}

export function stopClock() {
    if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
    }
}

export function applyClockTheme() {
    const THEME_CLS = ['theme-editorial', 'theme-neon', 'theme-mono', 'theme-display', 'theme-luxury'];
    THEME_CLS.forEach(c => document.body.classList.remove(c));
    if (state.S.clockTheme && state.S.clockTheme !== 'minimal')
    document.body.classList.add('theme-' + state.S.clockTheme);
    const dy = $('time-day');
    if (dy) dy.style.display = state.S.clockTheme === 'display' ? 'block' : 'none';
}

export function applyClockSize() {
    const sz = CLOCK_SIZES[state.S.clockSize] || CLOCK_SIZES.large;
    const t = $('time'), d = $('date'), g = $('greeting'), dy = $('time-day');
    if (t) t.style.fontSize = sz.time;
    if (d) d.style.fontSize = sz.date;
    if (g) g.style.fontSize = sz.greeting;
    if (dy) dy.style.fontSize = sz.day;
}