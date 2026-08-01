import { $, safeHTML, storageSet } from './utils.js';

const OB_STEPS = [{
    emoji: '🕌',
    title: 'Welcome to UrTab',
    sub: 'Your most-used browser tab, reimagined. Prayer times, Quotes, Live Sports, Weather, and interactive backgrounds — all in one.'
    }, {
    emoji: '🎨',
    title: 'Beautiful Backgrounds',
    sub: 'Choose from interactive canvases, animated gradients, or upload your own image or video. Open Settings → BG to explore.'
    }, {
    emoji: '🤲',
    title: 'Muslim Prayer Times',
    sub: 'Real-time Salah times with Hijri date based on your location. 4 custom widget styles. Open Settings → Prayer to set it up.'
    }, {
    emoji: '📖',
    title: 'Quran, Hadith & Tafsir',
    sub: 'Daily verses with translations in 8 languages, Arabic/English Tafsir, and audio from 10 reciters. Open Settings → Quote.'
    }, {
    emoji: '⚽',
    title: 'Live Sports Scores',
    sub: 'Track live and upcoming matches from top football/soccer leagues directly on your tab. Open Settings → Sports.'
    }, {
    emoji: '⛅',
    title: 'Live Weather',
    sub: 'Current conditions plus a 5-day forecast, all from a free API — no account required. Open Settings → Weather.'
    }, {
    emoji: '📅',
    title: 'Calendar',
    sub: 'Embed your Google or Outlook Calendar directly on your new tab. Uses your existing session. Open Settings → Calendar.'
    }, {
    emoji: '✨',
    title: "You're all set!",
    sub: 'UrTab saves everything locally on your device. Open Settings anytime to customize your tab layout and styles.'
}];

let obStep = 0;

export function showOnboarding() {
    const el = $('onboarding');
    if (!el) return;
    el.classList.remove('hidden');
    obStep = 0;
    requestAnimationFrame(() => {
        el.classList.add('visible');
        renderObStep();
    });
}

export function hideOnboarding() {
    const el = $('onboarding');
    if (!el) return;
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('hidden'), 700);
    storageSet('onboarded', true);
}

export function renderObStep() {
    const step = OB_STEPS[obStep];
    $('ob-emoji').textContent = step.emoji;
    $('ob-title').textContent = step.title;
    $('ob-sub').textContent = step.sub;
    $('ob-next').textContent = obStep < OB_STEPS.length - 1 ? 'Next →' : 'Start Now';
    $('ob-skip').style.display = obStep < OB_STEPS.length - 1 ? '' : 'none';
    
    const dots = $('ob-dots');
    safeHTML(dots, '');
    OB_STEPS.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'ob-dot' + (i === obStep ? ' on' : '');
        dots.appendChild(d);
    });
    
    const em = $('ob-emoji');
    em.style.animation = 'none';
    requestAnimationFrame(() => {
        em.style.animation = '';
    });
}

export function initOnboarding() {
    $('ob-next')?.addEventListener('click', () => { 
        if (obStep < OB_STEPS.length - 1) { 
            obStep++; 
            renderObStep(); 
        } else {
            hideOnboarding(); 
        }
    });
    $('ob-skip')?.addEventListener('click', hideOnboarding);
}