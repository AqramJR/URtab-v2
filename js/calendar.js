import { $, safeHTML } from './utils.js';
import { state } from './state.js';

export function renderCalendar() {
    const wrap = $('calendar-wrap');
    if (!wrap) return;
    safeHTML(wrap, '');
    const provider = state.S.calendarProvider || 'google';
    const style = state.S.calendarStyle || 'card';
    let src = '';
    if (provider === 'google') {
        const bg = style === 'glass' ? '%230a0a16' : '%230d0d1a';
        src = `https://calendar.google.com/calendar/embed?showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=AGENDA&height=380&bgcolor=${bg}&color=%237c6af7&hl=en`;
    } else {
        src = 'https://outlook.live.com/calendar/0/view/month';
    }
    const outer = document.createElement('div');
    outer.className = `cal-outer cal-${style}`;
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.className = 'cal-frame';
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('scrolling', 'no');
    outer.appendChild(frame);
    wrap.appendChild(outer);
}