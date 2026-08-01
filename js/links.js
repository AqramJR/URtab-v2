import { $, safeHTML } from './utils.js';
import { state } from './state.js';

const LINK_SIZES = {
    small: { icon: '36px', emoji: '16px', label: '10px', radius: '10px', gap: '6px' },
    medium: { icon: '54px', emoji: '22px', label: '11px', radius: '14px', gap: '8px' },
    large: { icon: '72px', emoji: '32px', label: '12px', radius: '18px', gap: '10px' }
};

export function renderLinks(links) {
    const wrap = $('links-wrap');
    if (!wrap) return;
    safeHTML(wrap, '');
    links.forEach(link => {
        const a = document.createElement('a');
        a.className = 'link-item';
        a.href = link.url;
        const icon = document.createElement('div');
        icon.className = 'link-icon';
        icon.textContent = link.emoji;
        const lbl = document.createElement('span');
        lbl.className = 'link-label';
        lbl.textContent = link.label;
        a.appendChild(icon);
        a.appendChild(lbl);
        wrap.appendChild(a);
    });
    applyLinksSize();
}

export function applyLinksSize() {
    const sz = LINK_SIZES[state.S.linksSize] || LINK_SIZES.medium;
    document.querySelectorAll('.link-icon').forEach(el => {
        el.style.width = sz.icon;
        el.style.height = sz.icon;
        el.style.fontSize = sz.emoji;
        el.style.borderRadius = sz.radius;
    });
    document.querySelectorAll('.link-label').forEach(el => { el.style.fontSize = sz.label; });
    document.querySelectorAll('.link-item').forEach(el => { el.style.gap = sz.gap; });
}
export function applyLinksStyle() {
    const LINK_CLS = ['links-pill', 'links-card', 'links-ghost', 'links-neon', 'links-frosted'];
    LINK_CLS.forEach(c => document.body.classList.remove(c));
    if (state.S.linksStyle && state.S.linksStyle !== 'glass')
    document.body.classList.add('links-' + state.S.linksStyle);
}