import { $, safeHTML } from './utils.js';
import { state } from './state.js';

export const SPORTS_STYLES_DEF = [
	{ id: 'card', label: 'Card', html: `<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;min-width:140px"><span style="font-size:16px">🔴</span><div style="text-align:center"><div style="font-size:14px;font-weight:bold;color:white">2 - 1</div><div style="font-size:8px;color:#ff3b30;font-weight:bold">LIVE</div></div><span style="font-size:16px">🔵</span></div>` },
	{ id: 'bar', label: 'Bar', html: `<div style="background:rgba(255,255,255,.04);border-bottom:2px solid #7c6af7;padding:6px 12px;display:flex;gap:12px;align-items:center"><span style="font-size:12px">🔴 RMA</span><span style="font-size:14px;font-weight:bold;color:white">2 - 1</span><span style="font-size:12px">FCB 🔵</span></div>` },
	{ id: 'minimal', label: 'Minimal', html: `<div style="display:flex;gap:10px;align-items:center"><span style="font-size:12px">RMA</span><span style="font-size:14px;font-weight:bold;color:white">2 - 1</span><span style="font-size:12px">FCB</span></div>` }
];

export async function fetchSports() {
    const wrap = $('sports-wrap');
    if (!wrap) return;
    
    if (wrap.children.length === 0 || wrap.querySelector('#sports-retry')) {
        safeHTML(wrap, `<div style="font-size:11px;color:rgba(255,255,255,.4);text-align:center;padding:10px;">⚽ Loading Matches…</div>`);
    }
    
    const league = state.S.sportsLeague || 'uefa.champions';
    try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`);
        const json = await res.json();
        
        if (!json.events || json.events.length === 0) {
            safeHTML(wrap, `<div style="font-size:11px;color:rgba(255,255,255,.4);text-align:center;">No upcoming matches</div>`);
            return;
        }
        
        const match = json.events[0];
        const comp = match.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        const status = match.status.type.state;
        
        const dateObj = new Date(match.date);
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        renderSportsCard(wrap, json.leagues[0].name, home, away, status, timeStr, dateStr, match.status.type.shortDetail);
    } catch (e) {
        if (wrap && (wrap.children.length === 0 || wrap.textContent.includes('Loading Matches'))) {
            safeHTML(wrap, `<div style="font-size:11px;color:rgba(255,120,80,.7);text-align:center;cursor:pointer;" id="sports-retry">⚠️ Matches unavailable — tap to retry</div>`);
            $('sports-retry')?.addEventListener('click', fetchSports, { once: true });
        }
    }
}

export function renderSportsCard(wrap, leagueName, home, away, status, timeStr, dateStr, statusDetail) {
    wrap.className = 'sports-' + (state.S.sportsStyle || 'card');
    
    let centerBlock = '';
    if (status === 'in') {
        centerBlock = `<span class="sports-live-badge">${statusDetail}</span><span class="sports-time" style="font-size: 22px; margin-top: 4px;">${home.score} - ${away.score}</span>`;
    } else if (status === 'post') {
        centerBlock = `<span style="font-size: 10px; color: rgba(255,255,255,0.4);">FT</span><span class="sports-time" style="font-size: 20px;">${home.score} - ${away.score}</span><span class="sports-date">${dateStr}</span>`;
    } else {
        centerBlock = `<span class="sports-time">${timeStr}</span><span class="sports-date">${dateStr}</span>`;
    }
    
    const homeLink = home.team.links?.[0]?.href || '#';
    const awayLink = away.team.links?.[0]?.href || '#';
    
    const html = `
    <div class="sports-header"><span>⚽ ${leagueName}</span><span>${status === 'in' ? '🔴 Live' : 'Upcoming'}</span></div>
    <div class="sports-match">
        <a href="${homeLink}" target="_blank" class="sports-team" title="View ${home.team.name} on ESPN">
            <img src="${home.team.logo}" alt="${home.team.abbreviation}" onerror="this.style.display='none'"/>
            <span class="sports-team-name">${home.team.abbreviation || home.team.shortDisplayName}</span>
        </a>
        <div class="sports-score-time">${centerBlock}</div>
        <a href="${awayLink}" target="_blank" class="sports-team" title="View ${away.team.name} on ESPN">
            <img src="${away.team.logo}" alt="${away.team.abbreviation}" onerror="this.style.display='none'"/>
            <span class="sports-team-name">${away.team.abbreviation || away.team.shortDisplayName}</span>
        </a>
    </div>`;
    safeHTML(wrap, html);
}

export function startSportsTimer() {
    if (state.sportsTimer) clearInterval(state.sportsTimer);
    if (state.S.sportsVisible) {
        fetchSports();
        state.sportsTimer = setInterval(fetchSports, 60000); 
    }
}

export function stopSportsTimer() {
    if (state.sportsTimer) {
        clearInterval(state.sportsTimer);
        state.sportsTimer = null;
    }
}