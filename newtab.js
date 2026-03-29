'use strict';

let S={}, links=[], tempLinks=[], clockTimer=null, saveTimer=null, saveToastTimer=null;
let fadeTimer=null, weatherCelsius=null, forecastData=null, isMoving=false, userGallery=[];
let prayerData=null, prayerDateStr=null, prayerHijri=null, favAnimFrame=null;
let _lastNextPrayerIndex=-1;
const _blobCache={};

const WIDGET_IDS=['clock-wrap','weather-wrap','search-wrap','links-wrap','prayer-wrap'];
const WIDGET_KEY={'clock-wrap':'clockPosition','weather-wrap':'weatherPosition',
  'search-wrap':'searchPosition','links-wrap':'linksPosition','prayer-wrap':'prayerPosition'};
function $(id){return document.getElementById(id);}

let _idb=null;
function idbOpen(){
  if(_idb)return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    const req=indexedDB.open('urtab_blobs',1);
    req.onupgradeneeded=e=>e.target.result.createObjectStore('blobs');
    req.onsuccess=e=>{_idb=e.target.result;res(_idb);};
    req.onerror=rej;
  });
}
function idbSet(key,value){
  return idbOpen().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction('blobs','readwrite');
    tx.objectStore('blobs').put(value,key);
    tx.oncomplete=res;tx.onerror=rej;
  }));
}
function idbGet(key){
  return idbOpen().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction('blobs','readonly');
    const req=tx.objectStore('blobs').get(key);
    req.onsuccess=e=>res(e.target.result??null);req.onerror=rej;
  }));
}
function idbDel(key){
  return idbOpen().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction('blobs','readwrite');
    tx.objectStore('blobs').delete(key);
    tx.oncomplete=res;tx.onerror=rej;
  }));
}
function idbClear(){
  return idbOpen().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction('blobs','readwrite');
    tx.objectStore('blobs').clear();
    tx.oncomplete=res;tx.onerror=rej;
  }));
}

const OB_STEPS=[
  {emoji:'🕌',title:'Welcome to UrTab',sub:'Your most-used browser tab, reimagined. Clock themes, Muslim prayer times, live weather with 5-day forecast, animated backgrounds — all in one.'},
  {emoji:'🎨',title:'Beautiful Backgrounds',sub:'Choose from static or animated gradients, or upload your own image or video. Open Settings → BG to explore.'},
  {emoji:'🤲',title:'Muslim Prayer Times',sub:'Real-time Salah times with Hijri date based on your location. 4 widget styles. Open Settings → Prayer to set it up.'},
  {emoji:'⛅',title:'Live Weather',sub:'Current conditions plus a 5-day forecast, all from a free API — no account required. Open Settings → Clock to enable it.'},
  {emoji:'⚙️',title:'Fully Customizable',sub:'Clock themes, search styles, link layouts, widget positions — every element is yours to configure in Settings.'},
  {emoji:'✨',title:"You're all set!",sub:'UrTab saves everything automatically. Open Settings anytime to customize your tab.'},
];
let obStep=0;

function showOnboarding(){
  const el=$('onboarding');if(!el)return;
  el.classList.remove('hidden');obStep=0;
  requestAnimationFrame(()=>{el.classList.add('visible');renderObStep();});
}
function hideOnboarding(){
  const el=$('onboarding');if(!el)return;
  el.classList.remove('visible');
  setTimeout(()=>el.classList.add('hidden'),700);
  storageSet('onboarded',true);
}
function renderObStep(){
  const step=OB_STEPS[obStep];
  $('ob-emoji').textContent=step.emoji;
  $('ob-title').textContent=step.title;
  $('ob-sub').textContent=step.sub;
  $('ob-next').textContent=obStep<OB_STEPS.length-1?'Next →':'Start Now';
  $('ob-skip').style.display=obStep<OB_STEPS.length-1?'':'none';
  const dots=$('ob-dots');dots.innerHTML='';
  OB_STEPS.forEach((_,i)=>{
    const d=document.createElement('div');d.className='ob-dot'+(i===obStep?' on':'');
    dots.appendChild(d);
  });
  const em=$('ob-emoji');em.style.animation='none';
  requestAnimationFrame(()=>{em.style.animation='';});
}

let favHue=240;
function animateFavicon(){
  const canvas=$('fav-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const s=32;
  canvas.width=s;canvas.height=s;
  const r=s*.22;

  ctx.beginPath();ctx.moveTo(r,0);ctx.arcTo(s,0,s,s,r);ctx.arcTo(s,s,0,s,r);ctx.arcTo(0,s,0,0,r);ctx.arcTo(0,0,s,0,r);ctx.closePath();
  const bg=ctx.createLinearGradient(0,0,s,s);
  bg.addColorStop(0,`hsl(${favHue},60%,12%)`);bg.addColorStop(1,`hsl(${favHue+40},70%,8%)`);
  ctx.fillStyle=bg;ctx.fill();

  const grd=ctx.createLinearGradient(s*.15,s*.15,s*.85,s*.85);
  grd.addColorStop(0,`hsla(${favHue},80%,65%,0.9)`);
  grd.addColorStop(1,`hsla(${favHue+40},80%,55%,0.9)`);
  ctx.beginPath();ctx.arc(s/2,s/2,s*.36,-.4,Math.PI*1.8);
  ctx.strokeStyle=grd;ctx.lineWidth=s*.09;ctx.stroke();

  const now=new Date();
  const hAngle=(now.getHours()%12+now.getMinutes()/60)/12*Math.PI*2-Math.PI/2;
  const mAngle=now.getMinutes()/60*Math.PI*2-Math.PI/2;
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=s*.06;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(s/2,s/2);ctx.lineTo(s/2+Math.cos(hAngle)*s*.18,s/2+Math.sin(hAngle)*s*.18);ctx.stroke();
  ctx.lineWidth=s*.04;
  ctx.beginPath();ctx.moveTo(s/2,s/2);ctx.lineTo(s/2+Math.cos(mAngle)*s*.27,s/2+Math.sin(mAngle)*s*.27);ctx.stroke();
  ctx.beginPath();ctx.arc(s/2,s/2,s*.045,0,Math.PI*2);ctx.fillStyle='white';ctx.fill();

  const link=$('dyn-favicon');if(link)link.href=canvas.toDataURL();
  favHue=(favHue+.3)%360;
  favAnimFrame=setTimeout(animateFavicon,1000);
}

function tickClock(){
  const now=new Date();
  let h=now.getHours();const m=String(now.getMinutes()).padStart(2,'0');
  let suf='';
  if(S.clockFormat==='12h'){suf=h>=12?' PM':' AM';h=h%12||12;}
  else h=String(h).padStart(2,'0');
  const t=$('time-text');if(t)t.textContent=h+':'+m;
  const s=$('time-suffix');if(s)s.textContent=suf;
  const d=$('date');
  if(d)d.textContent=now.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  const dy=$('time-day');
  if(dy)dy.textContent=now.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase();
  const g=$('greeting');
  if(g){
    if(S.greetingEnabled&&S.greetingName){
      const hr=now.getHours();
      g.textContent=`Good ${hr<12?'Morning':hr<17?'Afternoon':'Evening'}, ${S.greetingName}`;
      g.classList.remove('w-gone');
    }else g.classList.add('w-gone');
  }

  if(prayerData&&S.prayerVisible){
    updatePrayerCountdown();

    if(prayerDateStr&&prayerDateStr!==now.toDateString()){
      prayerDateStr=null;
      fetchPrayerTimes();
    }
  }
}
function startClock(){if(clockTimer)clearInterval(clockTimer);tickClock();clockTimer=setInterval(tickClock,1000);}

function applyAll(){
  applyClockTheme();applySearchStyle();applyLinksStyle();applyWeatherStyle();applySettingsStyle();
  applyVisibility();applyClockSize();applyLinksSize();applySearchEngine();
  applyVideoDim();applyVideoSpeed();applyFadeMode();tickClock();
}

const THEME_CLS=['theme-editorial','theme-neon','theme-mono','theme-display','theme-luxury'];
function applyClockTheme(){
  THEME_CLS.forEach(c=>document.body.classList.remove(c));
  if(S.clockTheme&&S.clockTheme!=='minimal')document.body.classList.add('theme-'+S.clockTheme);
  const dy=$('time-day');if(dy)dy.style.display=S.clockTheme==='display'?'block':'none';
}

const SEARCH_CLS=['search-solid','search-outline','search-minimal'];
function applySearchStyle(){
  SEARCH_CLS.forEach(c=>document.body.classList.remove(c));
  if(S.searchStyle&&S.searchStyle!=='glass')document.body.classList.add('search-'+S.searchStyle);
}

const LINK_CLS=['links-pill','links-card','links-ghost','links-neon','links-frosted'];
function applyLinksStyle(){
  LINK_CLS.forEach(c=>document.body.classList.remove(c));
  if(S.linksStyle&&S.linksStyle!=='glass')document.body.classList.add('links-'+S.linksStyle);
}

const WX_CLS=['weather-card','weather-minimal','weather-forecast'];
function applyWeatherStyle(){
  WX_CLS.forEach(c=>document.body.classList.remove(c));
  if(S.weatherStyle&&S.weatherStyle!=='pill')document.body.classList.add('weather-'+S.weatherStyle);
  const fc=$('weather-forecast');
  if(fc)fc.style.display=S.weatherStyle==='forecast'?'':'none';
  if(S.weatherStyle==='forecast'&&forecastData)renderWeatherForecast();
}

const SET_CLS=['settings-icon','settings-dot'];
function applySettingsStyle(){
  SET_CLS.forEach(c=>document.body.classList.remove(c));
  if(S.settingsStyle&&S.settingsStyle!=='pill')document.body.classList.add('settings-'+S.settingsStyle);
}

function setVisible(id,show){
  const el=$(id);if(!el)return;
  if(show){
    el.style.display='';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity='';el.style.transform='';el.style.pointerEvents='';}));
  }else{
    el.style.opacity='0';el.style.transform='translateY(8px) scale(0.97)';el.style.pointerEvents='none';
    setTimeout(()=>{
      const still=(id==='clock-wrap'&&!S.clockVisible)||(id==='search-wrap'&&!S.searchVisible)||(id==='links-wrap'&&!S.linksVisible)||(id==='weather-wrap'&&!S.weatherVisible)||(id==='prayer-wrap'&&!S.prayerVisible);
      if(still)el.style.display='none';
    },500);
  }
}
function applyVisibility(){
  setVisible('clock-wrap',S.clockVisible);setVisible('search-wrap',S.searchVisible);
  setVisible('links-wrap',S.linksVisible);setVisible('weather-wrap',S.weatherVisible);
  setVisible('prayer-wrap',S.prayerVisible);
  $('date')?.classList.toggle('w-gone',!S.dateVisible);
}

function applyClockSize(){
  const sz=CLOCK_SIZES[S.clockSize]||CLOCK_SIZES.large;
  const t=$('time'),d=$('date'),g=$('greeting'),dy=$('time-day');
  if(t)t.style.fontSize=sz.time;if(d)d.style.fontSize=sz.date;
  if(g)g.style.fontSize=sz.greeting;if(dy)dy.style.fontSize=sz.day;
}
function applyLinksSize(){
  const sz=LINK_SIZES[S.linksSize]||LINK_SIZES.medium;
  document.querySelectorAll('.link-icon').forEach(el=>{el.style.width=sz.icon;el.style.height=sz.icon;el.style.fontSize=sz.emoji;el.style.borderRadius=sz.radius;});
  document.querySelectorAll('.link-label').forEach(el=>{el.style.fontSize=sz.label;});
  document.querySelectorAll('.link-item').forEach(el=>{el.style.gap=sz.gap;});
}
function applySearchEngine(){
  const E={google:{action:'https://www.google.com/search',p:'q'},bing:{action:'https://www.bing.com/search',p:'q'},ddg:{action:'https://duckduckgo.com/',p:'q'},brave:{action:'https://search.brave.com/search',p:'q'}};
  const e=E[S.searchEngine]||E.google;
  const form=$('search-form'),inp=$('search-input');
  if(form)form.action=e.action;if(inp)inp.name=e.p;
}

function showBgLayer(type){
  const img=$('bg-image'),vid=$('bg-video'),snd=$('sound-btn'),spd=$('speed-row');
  if(img){img.style.display='none';img.classList.remove('loaded');}
  if(vid){vid.style.display='none';vid.classList.remove('loaded');}
  if(snd)snd.classList.remove('visible');if(spd)spd.style.opacity='0.35';
  if(type==='image'&&img){img.style.display='block';requestAnimationFrame(()=>requestAnimationFrame(()=>{if(img.complete&&img.naturalWidth)img.classList.add('loaded');}));}
  else if(type==='video'&&vid){vid.style.display='block';if(snd)snd.classList.add('visible');if(spd)spd.style.opacity='';}
}
function applyGradient(i){
  const p=PRESET_GRADIENTS[i]||PRESET_GRADIENTS[0];
  const fg=$('bg-fallback');if(!fg)return;
  fg.className=fg.className.replace(/anim-\S+/g,'').trim();
  if(p.anim){
    fg.style.background='';
    fg.style.transition='none';
    fg.classList.add(p.anim);
  }else{
    fg.style.transition='';
    fg.style.background=p.bg;
  }
}
function applyVideoDim(){const d=$('video-dim');if(d)d.style.opacity=(parseInt(S.videoDim)||0)/100;}
function applyVideoSpeed(){const v=$('bg-video');if(v&&v.src)v.playbackRate=parseFloat(S.videoSpeed)||1;}
function loadImageIntoDOM(src){const img=$('bg-image');if(!img)return;img.classList.remove('loaded');img.onload=()=>img.classList.add('loaded');img.src=src;showBgLayer('image');}
function loadVideoIntoDOM(src){
  const vid=$('bg-video');if(!vid)return;
  vid.classList.remove('loaded');vid.muted=(S.videoMuted!==false);vid.src=src;
  vid.oncanplay=()=>{vid.classList.add('loaded');vid.playbackRate=parseFloat(S.videoSpeed)||1;};
  vid.load();vid.play().catch(()=>{});showBgLayer('video');updateSoundBtn();
}
function updateSoundBtn(){const v=$('bg-video');if(!v)return;const on=$('snd-on'),off=$('snd-off');if(on)on.style.display=v.muted?'none':'';if(off)off.style.display=v.muted?'':'none';}

function placeAllWidgets(){
  WIDGET_IDS.forEach(id=>{
    const el=$(id),pos=S[WIDGET_KEY[id]],zone=$('zone-'+pos);
    if(el&&zone){if(el.parentElement!==zone)zone.appendChild(el);alignToZone(el,zone);}
  });
  document.querySelectorAll('.zone').forEach(reorderZone);
}
function reorderZone(zone){
  Array.from(zone.children).sort((a,b)=>(WIDGET_IDS.indexOf(a.id)??99)-(WIDGET_IDS.indexOf(b.id)??99)).forEach(c=>zone.appendChild(c));
}
async function moveWidget(id,newPos){
  const el=$(id),zone=$('zone-'+newPos);if(!el||!zone||el.parentElement===zone)return;
  el.style.opacity='0';el.style.transform='scale(0.92)';await sleep(230);
  zone.appendChild(el);alignToZone(el,zone);reorderZone(zone);
  el.style.opacity='';el.style.transform='';
}
function alignToZone(el,zone){
  const col=zone.dataset.col;
  if(el.id==='clock-wrap')el.style.textAlign=col==='left'?'left':col==='right'?'right':'center';
  if(el.id==='links-wrap')el.style.justifyContent=col==='left'?'flex-start':col==='right'?'flex-end':'center';
  if(el.id==='weather-wrap'||el.id==='prayer-wrap'){el.style.marginLeft=col==='right'?'auto':'';el.style.marginRight=col==='left'?'auto':'';}
}

function applyFadeMode(){clearTimeout(fadeTimer);document.body.classList.remove('faded');if(S.autoFade)resetFadeTimer();}
function resetFadeTimer(){clearTimeout(fadeTimer);document.body.classList.remove('faded');if(!S.autoFade)return;fadeTimer=setTimeout(()=>{if(!document.body.classList.contains('panel-open'))document.body.classList.add('faded');},(S.autoFadeDelay||10)*1000);}

let _geoPos=null;

async function getGeoPos(){

  if(_geoPos)return _geoPos;

  const saved=await storageGet('saved_location');
  if(saved&&saved.lat&&saved.lon){

    _geoPos={coords:{latitude:saved.lat,longitude:saved.lon}};

    _refreshGeoInBackground();
    return _geoPos;
  }

  return _getLiveGeo();
}

async function _getLiveGeo(){
  const pos=await new Promise((res,rej)=>
    navigator.geolocation.getCurrentPosition(res,rej,{timeout:10000,maximumAge:600000}));
  _geoPos=pos;
  await storageSet('saved_location',{lat:pos.coords.latitude,lon:pos.coords.longitude});
  return _geoPos;
}

async function _refreshGeoInBackground(){
  try{
    const pos=await new Promise((res,rej)=>
      navigator.geolocation.getCurrentPosition(res,rej,{timeout:10000,maximumAge:0}));
    const {latitude:lat,longitude:lon}=pos.coords;

    const prev=_geoPos.coords;
    const moved=Math.abs(lat-prev.latitude)>0.01||Math.abs(lon-prev.longitude)>0.01;
    _geoPos=pos;
    await storageSet('saved_location',{lat,lon});

    if(moved){
      if(S.weatherVisible)fetchWeather();
      if(S.prayerVisible)fetchPrayerTimes();
    }
  }catch{}
}

async function fetchWeather(){
  const iEl=$('weather-icon'),tEl=$('weather-temp'),dEl=$('weather-desc'),cEl=$('weather-city'),rEl=$('weather-retry');
  if(iEl)iEl.textContent='📡';if(dEl)dEl.textContent='Locating…';if(tEl)tEl.textContent='';if(rEl)rEl.style.display='none';
  try{
    const pos=await getGeoPos();
    const {latitude:lat,longitude:lon}=pos.coords;
    const [wxRes,geoRes]=await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`),
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=en`),
    ]);
    const wx=await wxRes.json(),geo=await geoRes.json();
    const cw=wx.current_weather,wmo=getWMO(cw.weathercode);
    weatherCelsius=Math.round(cw.temperature);
    forecastData=wx.daily||null;
    const city=geo.city||geo.locality||geo.countryName||'';
    if(iEl)iEl.textContent=wmo.i;if(dEl)dEl.textContent=wmo.d;if(cEl)cEl.textContent=city;
    renderWeatherTemp();buildWeatherAnim(wmo.cat);
    if(S.weatherStyle==='forecast')renderWeatherForecast();
  }catch{
    forecastData=null;
    if(iEl)iEl.textContent='⚠️';if(dEl)dEl.textContent='Location denied';
    if(rEl){
      rEl.style.display='';
      const retryHandler=()=>{rEl.removeEventListener('click',retryHandler);fetchWeather();};
      rEl.addEventListener('click',retryHandler,{once:true});
    }
  }
}

function renderWeatherForecast(){
  const wrap=$('weather-wrap');if(!wrap||!forecastData)return;
  if(S.weatherStyle!=='forecast')return;
  let fc=$('weather-forecast');
  if(!fc){fc=document.createElement('div');fc.id='weather-forecast';wrap.appendChild(fc);}
  const days=forecastData.time?.slice(0,5)||[];
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  fc.innerHTML=days.map((dateStr,idx)=>{
    const d=new Date(dateStr+'T00:00:00');
    const label=idx===0?'Today':dayNames[d.getDay()];
    const wmo=getWMO(forecastData.weathercode[idx]);
    const hi=tempDisplay(Math.round(forecastData.temperature_2m_max[idx]));
    const lo=tempDisplay(Math.round(forecastData.temperature_2m_min[idx]));
    const rain=forecastData.precipitation_probability_max[idx]||0;
    return`<div class="fc-row${idx===0?' fc-today':''}">
      <span class="fc-day">${label}</span>
      <span class="fc-icon">${wmo.i}</span>
      <span class="fc-desc">${wmo.d}</span>
      <span class="fc-rain">${rain>0?`💧${rain}%`:''}</span>
      <span class="fc-temps"><span class="fc-hi">${hi}</span><span class="fc-lo">${lo}</span></span>
    </div>`;
  }).join('');
}

function tempDisplay(c){
  const v=S.weatherUnit==='F'?Math.round(c*9/5+32):c;
  return`${v}°`;
}

function renderWeatherTemp(){
  if(weatherCelsius===null)return;
  const el=$('weather-temp');if(!el)return;
  const val=S.weatherUnit==='F'?Math.round(weatherCelsius*9/5+32):weatherCelsius;
  el.textContent=`${val}°${S.weatherUnit}`;
  if(S.weatherStyle==='forecast'&&forecastData)renderWeatherForecast();
}
function buildWeatherAnim(cat){
  const anim=$('weather-anim');if(!anim)return;
  const wrap=$('weather-wrap');if(!wrap)return;
  anim.innerHTML='';wrap.className=wrap.className.replace(/wx-\w+/g,'').trim();
  if(cat==='clear'){
    wrap.classList.add('wx-clear');
    for(let i=0;i<8;i++){const r=document.createElement('div');r.className='wx-ray';r.style.cssText=`top:50%;left:20px;transform:rotate(${i*45}deg);animation-duration:${2+i*.2}s;animation-delay:${i*.25}s`;anim.appendChild(r);}
  }else if(cat==='rain'||cat==='storm'){
    if(cat==='storm')wrap.classList.add('wx-storm');
    for(let i=0;i<(cat==='storm'?12:18);i++){const d=document.createElement('div');d.className='wx-drop';d.style.cssText=`left:${Math.random()*100}%;height:${8+Math.random()*10}px;animation-duration:${.5+Math.random()*.5}s;animation-delay:${-Math.random()*1.2}s;opacity:${.4+Math.random()*.4};top:0`;anim.appendChild(d);}
    if(cat==='storm'){const l=document.createElement('div');l.className='wx-lightning';l.textContent='⚡';l.style.cssText='right:10px;top:4px;font-size:18px;animation-duration:3s;animation-delay:1s';anim.appendChild(l);}
  }else if(cat==='snow'){
    for(let i=0;i<14;i++){const s=document.createElement('div');s.className='wx-snow';s.style.cssText=`left:${Math.random()*100}%;width:${3+Math.random()*4}px;height:${3+Math.random()*4}px;animation-duration:${2+Math.random()*2}s;animation-delay:${-Math.random()*3}s;opacity:${.5+Math.random()*.4};top:0`;anim.appendChild(s);}
  }else{
    for(let i=0;i<3;i++){const c=document.createElement('div');c.className='wx-cloud';const w=40+i*20;c.style.cssText=`width:${w}px;height:${w*.6}px;top:${4+i*12}px;left:-${w}px;animation-duration:${12+i*6}s;animation-delay:${-i*4}s;opacity:${.12+i*.04}`;anim.appendChild(c);}
  }
}

async function fetchPrayerTimes(){
  const wrap=$('prayer-wrap');if(!wrap)return;
  wrap.innerHTML=`<div style="font-size:11px;color:rgba(255,255,255,.4);padding:12px 16px;letter-spacing:1px">🕌 Locating…</div>`;
  try{
    const pos=await getGeoPos();
    const {latitude:lat,longitude:lon}=pos.coords;
    const today=new Date();
    prayerDateStr=today.toDateString();
    const ts=Math.floor(today.getTime()/1000);
    const res=await fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&method=${S.prayerMethod||5}`);
    const json=await res.json();
    if(json.code!==200)throw new Error('Bad response');
    prayerData=json.data.timings;
    _lastNextPrayerIndex=-1;

    const h=json.data.date?.hijri;
    if(h)prayerHijri={day:h.day,month:h.month.en,monthAr:h.month.ar,year:h.year};
    else prayerHijri=null;
    renderPrayer();
  }catch(e){
    if(wrap){
      wrap.innerHTML='';

      const errDiv=document.createElement('div');
      errDiv.style.cssText='font-size:11px;color:rgba(255,120,80,.7);padding:12px 16px;cursor:pointer';
      errDiv.textContent='⚠️ Prayer times unavailable — tap to retry';
      errDiv.addEventListener('click',()=>fetchPrayerTimes());
      wrap.appendChild(errDiv);
    }
  }
}

function getNextPrayer(){
  if(!prayerData)return null;
  const now=new Date();
  const nowMins=now.getHours()*60+now.getMinutes();
  for(let i=0;i<PRAYER_KEYS.length;i++){
    const key=PRAYER_KEYS[i];
    const t=prayerData[key];if(!t)continue;
    const mins=timeToMins(t);
    if(mins>nowMins)return{index:i,key,name:PRAYER_NAMES[i],nameAr:PRAYER_NAMES_AR[i],icon:PRAYER_ICONS[i],time:t,mins};
  }

  return{index:0,key:'Fajr',name:'Fajr',nameAr:'الفجر',icon:'🌙',time:prayerData['Fajr'],mins:timeToMins(prayerData['Fajr'])+1440};
}

function formatCountdown(diffMins){
  if(diffMins<1)return'Now';
  const h=Math.floor(diffMins/60),m=diffMins%60;
  if(h>0)return`in ${h}h ${m}m`;
  return`in ${m}m`;
}

function fmt12(t24){
  if(!t24)return'';
  const [h,m]=t24.split(':').map(Number);
  const suf=h>=12?'PM':'AM';const h12=h%12||12;
  return`${h12}:${String(m).padStart(2,'0')} ${suf}`;
}

function renderPrayer(){
  const wrap=$('prayer-wrap');if(!wrap||!prayerData)return;
  const style=S.prayerStyle||'minimal';
  const nowMins=new Date().getHours()*60+new Date().getMinutes();
  const next=getNextPrayer();

  _lastNextPrayerIndex=next?next.index:-1;
  wrap.innerHTML='';

  wrap.className=wrap.className.split(' ').filter(c=>!c.startsWith('style-')).join(' ');

  if(style==='minimal')renderPrayerMinimal(wrap,next,nowMins);
  else if(style==='bar')renderPrayerBar(wrap,next,nowMins);
  else if(style==='card')renderPrayerCard(wrap,next,nowMins);
  else if(style==='mosque')renderPrayerMosque(wrap,next,nowMins);
}

function hijriStr(){
  if(!prayerHijri)return'';
  return`${prayerHijri.day} ${prayerHijri.month} ${prayerHijri.year} AH`;
}

function renderPrayerMinimal(wrap,next,nowMins){
  wrap.classList.add('style-minimal');
  if(!next){wrap.innerHTML='<span style="opacity:.4">--</span>';return;}
  const diffMins=Math.max(0,Math.round(next.mins-nowMins));
  const hDate=hijriStr();
  wrap.innerHTML=`
    <span class="prayer-minimal-icon">${next.icon}</span>
    <div class="prayer-minimal-info">
      ${hDate?`<div class="prayer-minimal-hijri">${hDate}</div>`:''}
      <div class="prayer-minimal-name">${next.name}</div>
      <div class="prayer-minimal-time">${S.clockFormat==='12h'?fmt12(next.time):next.time}</div>
      <div class="prayer-minimal-countdown">${formatCountdown(diffMins)}</div>
    </div>`;
}

function renderPrayerBar(wrap,next,nowMins){
  wrap.classList.add('style-bar');
  const hdr=document.createElement('div');hdr.className='prayer-bar-header';
  const hDate=hijriStr();
  hdr.innerHTML=`
    <span class="prayer-bar-title">🕌 Prayer Times${hDate?`<span class="prayer-bar-hijri">${hDate}</span>`:''}</span>
    ${next?`<span class="prayer-bar-next">Next: ${next.name}</span>`:''}`;
  wrap.appendChild(hdr);
  const pills=document.createElement('div');pills.className='prayer-bar-pills';
  PRAYER_KEYS.forEach((key,i)=>{
    const t=prayerData[key];if(!t)return;
    const mins=timeToMins(t);
    const passed=mins<nowMins;
    const isNext=next&&next.index===i;
    const pill=document.createElement('div');
    pill.className='prayer-pill'+(isNext?' active-prayer':passed?' passed':'');
    pill.innerHTML=`<span class="prayer-pill-icon">${PRAYER_ICONS[i]}</span><span class="prayer-pill-name">${PRAYER_NAMES[i]}</span><span class="prayer-pill-time">${S.clockFormat==='12h'?fmt12(t):t}</span>`;
    pills.appendChild(pill);
  });
  wrap.appendChild(pills);
}

function renderPrayerCard(wrap,next,nowMins){
  wrap.classList.add('style-card');
  const hdr=document.createElement('div');hdr.className='prayer-card-header';
  const hDate=hijriStr();
  hdr.innerHTML=`
    <span class="prayer-card-title">🕌 Prayer Times</span>
    <span class="prayer-card-date">
      <span class="prayer-card-greg">${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
      ${hDate?`<span class="prayer-card-hijri">${hDate}</span>`:''}
    </span>`;
  wrap.appendChild(hdr);
  const list=document.createElement('div');list.className='prayer-card-list';
  PRAYER_KEYS.forEach((key,i)=>{
    const t=prayerData[key];if(!t)return;
    const mins=timeToMins(t);const passed=mins<nowMins;const isNext=next&&next.index===i;
    const row=document.createElement('div');

    row.className='prayer-card-row'+(isNext?' active-prayer':passed?' passed':'');
    row.innerHTML=`
      <span class="prow-icon">${PRAYER_ICONS[i]}</span>
      <span class="prow-name">${PRAYER_NAMES[i]}</span>
      <span class="prow-name-ar">${PRAYER_NAMES_AR[i]}</span>
      <span class="prow-time">${S.clockFormat==='12h'?fmt12(t):t}</span>
      ${isNext?'<span class="prow-badge">Next</span>':''}`;
    list.appendChild(row);
  });
  wrap.appendChild(list);
}

function renderPrayerMosque(wrap,next,nowMins){
  wrap.classList.add('style-mosque');
  if(next){
    const diffMins=Math.max(0,Math.round(next.mins-nowMins));
    const hDate=hijriStr();
    const hero=document.createElement('div');hero.className='prayer-mosque-hero';
    hero.innerHTML=`
      <div class="prayer-mosque-crescent">☽</div>
      ${hDate?`<div class="prayer-mosque-hijri">${hDate}</div>`:''}
      <div class="prayer-mosque-next-label">Next Prayer</div>
      <div class="prayer-mosque-next-name">${next.nameAr}</div>
      <div class="prayer-mosque-next-name-en">${next.name}</div>
      <div class="prayer-mosque-next-time">${S.clockFormat==='12h'?fmt12(next.time):next.time}</div>
      <div class="prayer-mosque-countdown">${formatCountdown(diffMins)}</div>`;
    wrap.appendChild(hero);
  }

  const row=document.createElement('div');row.className='prayer-mosque-row';
  PRAYER_KEYS.forEach((key,i)=>{
    const t=prayerData[key];if(!t)return;
    const mins=timeToMins(t);const passed=mins<nowMins;const isNext=next&&next.index===i;
    const cell=document.createElement('div');
    cell.className='prayer-mosque-cell'+(isNext?' now':passed?' done':'');
    cell.innerHTML=`<span class="prayer-mosque-cell-icon">${PRAYER_ICONS[i]}</span><span class="prayer-mosque-cell-name">${PRAYER_NAMES[i]}</span><span class="prayer-mosque-cell-time">${(prayerData[key]||'').slice(0,5)}</span>`;
    row.appendChild(cell);
  });
  wrap.appendChild(row);
}

function updatePrayerCountdown(){
  const next=getNextPrayer();if(!next)return;

  if(next.index!==_lastNextPrayerIndex){
    _lastNextPrayerIndex=next.index;
    renderPrayer();
    return;
  }

  const nowMins=new Date().getHours()*60+new Date().getMinutes();
  const diffMins=Math.max(0,Math.round(next.mins-nowMins));
  const cd=document.querySelector('.prayer-minimal-countdown,.prayer-mosque-countdown');
  if(cd)cd.textContent=formatCountdown(diffMins);
}

function renderLinks(){
  const wrap=$('links-wrap');if(!wrap)return;
  wrap.innerHTML='';
  links.forEach(link=>{
    const a=document.createElement('a');a.className='link-item';a.href=link.url;
    const icon=document.createElement('div');icon.className='link-icon';icon.textContent=link.emoji;
    const lbl=document.createElement('span');lbl.className='link-label';lbl.textContent=link.label;
    a.appendChild(icon);a.appendChild(lbl);wrap.appendChild(a);
  });
  applyLinksSize();
}

async function buildGallery(){
  const grid=$('full-gallery');if(!grid)return;grid.innerHTML='';
  PRESET_GRADIENTS.forEach((p,i)=>{
    const isAct=S.bgType==='gradient'&&S.bgGradientIndex===i;
    const item=document.createElement('div');item.className='gal-item'+(isAct?' active':'');
    item.style.background=p.bg;
    const liveTag=p.anim?'<span class="gal-live">✦</span>':'';
    item.innerHTML=`<div class="gal-check">✓</div><div class="gal-label">${p.name}${liveTag}</div>`;
    item.addEventListener('click',()=>{S.bgType='gradient';S.bgGradientIndex=i;applyGradient(i);showBgLayer('gradient');buildGallery();scheduleSave();});
    grid.appendChild(item);
  });
  for(const entry of userGallery){
    const isAct=S.bgType===entry.type&&S.bgActiveKey===entry.dataKey;
    const item=document.createElement('div');item.className='gal-item user-item'+(isAct?' active':'');
    item.style.cssText='background:#1a1a2e;background-size:cover;background-position:center';
    if(entry.thumb)item.style.backgroundImage=`url(${entry.thumb})`;
    item.innerHTML=`<div class="gal-check">✓</div><div class="gal-label">${entry.type==='video'?'▶ Video':'🖼 Image'}</div><div class="gal-del">×</div>`;
    item.querySelector('.gal-del').addEventListener('click',async e=>{e.stopPropagation();await deleteUserEntry(entry);});
    item.addEventListener('click',()=>activateUserEntry(entry));
    grid.appendChild(item);
  }
  const addImg=document.createElement('div');addImg.className='gal-add';
  addImg.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Add Image</span>`;
  addImg.addEventListener('click',()=>$('file-image-input').click());grid.appendChild(addImg);
  const addVid=document.createElement('div');addVid.className='gal-add';
  addVid.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><span>Add Video</span>`;
  addVid.addEventListener('click',()=>$('file-video-input').click());grid.appendChild(addVid);
}
async function activateUserEntry(entry){
  S.bgType=entry.type;S.bgActiveKey=entry.dataKey;
  if(entry.type==='video'){
    let url=_blobCache[entry.dataKey];
    if(!url){
      if(entry.storageType==='idb'){
        const blob=await idbGet(entry.dataKey);
        if(!blob){S.bgType='gradient';S.bgGradientIndex=0;applyGradient(0);showBgLayer('gradient');return;}
        url=URL.createObjectURL(blob);
      }else{
        const data=await storageGet(entry.dataKey);
        if(!data){S.bgType='gradient';S.bgGradientIndex=0;applyGradient(0);showBgLayer('gradient');return;}
        url=data;
      }
      _blobCache[entry.dataKey]=url;
    }
    loadVideoIntoDOM(url);
  }else{
    const data=await storageGet(entry.dataKey);if(!data)return;
    loadImageIntoDOM(data);
  }
  scheduleSave();buildGallery();
}
async function deleteUserEntry(entry){
  if(S.bgType===entry.type&&S.bgActiveKey===entry.dataKey){S.bgType='gradient';S.bgGradientIndex=0;S.bgActiveKey=null;applyGradient(0);showBgLayer('gradient');}
  if(_blobCache[entry.dataKey]){URL.revokeObjectURL(_blobCache[entry.dataKey]);delete _blobCache[entry.dataKey];}
  if(entry.storageType==='idb'){await idbDel(entry.dataKey);}
  else{await new Promise(r=>chrome.storage.local.remove(entry.dataKey,r));}
  userGallery=userGallery.filter(e=>e.dataKey!==entry.dataKey);
  await storageSet('user_gallery_index',userGallery);buildGallery();scheduleSave();
}
async function handleFileUpload(file,type){
  if(!file)return;
  const grid=$('full-gallery');
  const prog=document.createElement('div');prog.className='gal-progress';prog.innerHTML='<div class="gal-prog-bar"></div><span>Processing…</span>';
  if(grid)grid.prepend(prog);

  const id='user_'+Date.now(),dataKey='bg_user_'+id;
  let thumb=null;

  if(type==='image'){
    const dataUrl=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(file);});
    thumb=await resizeImageThumb(dataUrl);
    prog?.remove();
    try{await storageSet(dataKey,dataUrl);}catch{alert('Image too large for storage. Try a smaller file.');return;}
    const entry={id,type:'image',thumb,dataKey};
    userGallery.push(entry);
    await storageSet('user_gallery_index',userGallery);
    await activateUserEntry(entry);
  }else{
    const blobUrl=URL.createObjectURL(file);
    thumb=await captureVideoThumbnail(blobUrl);
    prog?.remove();
    try{await idbSet(dataKey,file);}catch{URL.revokeObjectURL(blobUrl);alert('Video too large for storage.');return;}
    const entry={id,type:'video',thumb,dataKey,storageType:'idb'};
    userGallery.push(entry);
    await storageSet('user_gallery_index',userGallery);
    S.bgType='video';S.bgActiveKey=dataKey;
    _blobCache[dataKey]=blobUrl;
    loadVideoIntoDOM(blobUrl);
    scheduleSave();buildGallery();
  }
}
async function resizeImageThumb(dataUrl){
  return new Promise(r=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=160;c.height=100;c.getContext('2d').drawImage(img,0,0,160,100);r(c.toDataURL('image/jpeg',.7));};img.onerror=()=>r(null);img.src=dataUrl;});
}

const THEMES=[
  {id:'minimal',  label:'Minimal',  bg:'#0c0c18',tCSS:'font-weight:200;letter-spacing:-1px',         dCSS:'letter-spacing:3px', t:'14:30',d:'MON 22 FEB'},
  {id:'editorial',label:'Editorial',bg:'#0c0810',tCSS:'font-family:Georgia,serif;font-weight:700;letter-spacing:4px',dCSS:'font-family:Georgia,serif;font-style:italic',t:'14:30',d:'Mon, Feb 22'},
  {id:'neon',     label:'Neon',     bg:'#000820',tCSS:'font-family:Courier New,mono;color:#0ff;text-shadow:0 0 8px #0ff',dCSS:'color:#f0f;letter-spacing:5px',t:'14:30',d:'MONDAY'},
  {id:'mono',     label:'Mono',     bg:'#071207',tCSS:'font-family:Courier New,mono;letter-spacing:5px;color:rgba(180,220,180,.9)',dCSS:'font-family:Courier New,mono;color:rgba(150,200,150,.6)',t:'14:30',d:'MONDAY'},
  {id:'display',  label:'Display',  bg:'#100c20',tCSS:"font-family:'Anurati','Orbitron',Impact,sans-serif;font-size:22px;letter-spacing:4px",dCSS:'font-style:italic;font-family:Georgia,serif',t:'SUNDAY',d:'22 Feb · 14:30'},
  {id:'luxury',   label:'Luxury',   bg:'#0a080a',tCSS:'font-weight:100;letter-spacing:10px',          dCSS:'letter-spacing:7px;opacity:.4',t:'14:30',d:'MON 22 FEB'},
];
function buildThemeSwatches(){
  const grid=$('theme-grid');if(!grid)return;grid.innerHTML='';
  THEMES.forEach(t=>{
    const sw=document.createElement('div');sw.className='swatch'+(S.clockTheme===t.id?' active':'');
    sw.style.background=t.bg;
    sw.innerHTML=`<span class="sw-time" style="${t.tCSS}">${t.t}</span><span class="sw-date" style="${t.dCSS}">${t.d}</span><span class="sw-name">${t.label}</span>`;
    sw.addEventListener('click',()=>{S.clockTheme=t.id;applyClockTheme();buildThemeSwatches();scheduleSave();});
    grid.appendChild(sw);
  });
}

const SEARCH_STYLES=[
  {id:'glass',label:'Glass',html:`<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:50px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>`},
  {id:'solid',label:'Solid',html:`<div style="background:rgba(10,10,28,.75);border:1px solid rgba(255,255,255,.1);border-radius:50px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>`},
  {id:'outline',label:'Outline',html:`<div style="border:1.5px solid rgba(255,255,255,.35);border-radius:50px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>`},
  {id:'minimal',label:'Minimal',html:`<div style="border-bottom:1px solid rgba(255,255,255,.3);padding:5px 4px;font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:5px">🔍 Search…</div>`},
];
function buildSearchStyleSwatches(){
  const grid=$('search-style-grid');if(!grid)return;grid.innerHTML='';
  SEARCH_STYLES.forEach(st=>{
    const sw=document.createElement('div');sw.className='swatch'+(S.searchStyle===st.id?' active':'');
    sw.innerHTML=`<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`;
    sw.addEventListener('click',()=>{S.searchStyle=st.id;applySearchStyle();buildSearchStyleSwatches();scheduleSave();});
    grid.appendChild(sw);
  });
}

const LINK_STYLES=[
  {id:'glass',label:'Glass',html:`<div style="width:26px;height:26px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px">📧</div>`},
  {id:'pill',label:'Pill',html:`<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:50px;padding:4px 8px 4px 5px;display:flex;align-items:center;gap:4px;font-size:12px">📧<span style="font-size:9px;color:rgba(255,255,255,.65)">Gmail</span></div>`},
  {id:'card',label:'Card',html:`<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:7px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:13px">📧<span style="font-size:7px;color:rgba(255,255,255,.55)">Gmail</span></div>`},
  {id:'ghost',label:'Ghost',html:`<div style="font-size:22px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))">📧</div>`},
  {id:'neon',label:'Neon',html:`<div style="width:26px;height:26px;border:1.5px solid rgba(124,106,247,.55);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px rgba(124,106,247,.25)">📧</div>`},
  {id:'frosted',label:'Frosted',html:`<div style="width:26px;height:26px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,.25)">📧</div>`},
];
function buildLinkStyleSwatches(){
  const grid=$('links-style-grid');if(!grid)return;grid.innerHTML='';
  LINK_STYLES.forEach(st=>{
    const sw=document.createElement('div');sw.className='swatch'+(S.linksStyle===st.id?' active':'');
    sw.innerHTML=`<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`;
    sw.addEventListener('click',()=>{S.linksStyle=st.id;applyLinksStyle();buildLinkStyleSwatches();scheduleSave();});
    grid.appendChild(sw);
  });
}

const WEATHER_STYLES=[
  {id:'pill',    label:'Pill',     html:`<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:6px 14px;display:flex;align-items:center;gap:8px"><span style="font-size:20px">⛅</span><span style="font-size:13px;font-weight:200">22°C</span></div>`},
  {id:'card',    label:'Card',     html:`<div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:10px"><span style="font-size:26px">⛅</span><div><div style="font-size:16px;font-weight:100">22°C</div><div style="font-size:9px;opacity:.5">Partly cloudy</div></div></div>`},
  {id:'minimal', label:'Minimal',  html:`<div style="display:flex;align-items:center;gap:8px"><span style="font-size:22px">⛅</span><span style="font-size:18px;font-weight:200">22°C</span></div>`},
  {id:'forecast',label:'Forecast', html:`<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:8px 12px;min-width:140px"><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:6px;opacity:.6"><span>⛅ 22°C · Partly cloudy</span></div><div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;justify-content:space-between;font-size:9px"><span>Mon</span><span>☀️</span><span style="color:rgba(255,255,255,.4)">16° 24°</span></div><div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(124,106,247,.8)"><span>Tue</span><span>🌧</span><span>13° 18°</span></div><div style="display:flex;justify-content:space-between;font-size:9px"><span>Wed</span><span>⛅</span><span style="color:rgba(255,255,255,.4)">15° 21°</span></div></div></div>`},
];
function buildWeatherStyleSwatches(){
  const grid=$('weather-style-grid');if(!grid)return;grid.innerHTML='';
  WEATHER_STYLES.forEach(st=>{
    const sw=document.createElement('div');sw.className='swatch'+(S.weatherStyle===st.id?' active':'');
    sw.innerHTML=`<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`;
    sw.addEventListener('click',()=>{S.weatherStyle=st.id;applyWeatherStyle();buildWeatherStyleSwatches();scheduleSave();});
    grid.appendChild(sw);
  });
}

const SETTINGS_STYLES=[
  {id:'pill',label:'Pill',html:`<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:6px 14px;display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,.6)">⚙ Settings</div>`},
  {id:'icon',label:'Icon Only',html:`<div style="width:34px;height:34px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px">⚙</div>`},
  {id:'dot',label:'Dot',html:`<div style="width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.2)"></div>`},
];
function buildSettingsStyleSwatches(){
  const grid=$('settings-style-grid');if(!grid)return;grid.innerHTML='';
  SETTINGS_STYLES.forEach(st=>{
    const sw=document.createElement('div');sw.className='swatch'+(S.settingsStyle===st.id?' active':'');
    sw.innerHTML=`<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`;
    sw.addEventListener('click',()=>{S.settingsStyle=st.id;applySettingsStyle();buildSettingsStyleSwatches();scheduleSave();});
    grid.appendChild(sw);
  });
}

const PRAYER_STYLES_DEF=[
  {id:'minimal',label:'Minimal',html:`<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:6px 14px;display:flex;align-items:center;gap:8px;font-size:11px"><span>🌙</span><span style="font-weight:200">Asr · 15:45</span><span style="color:#d4a843;font-size:9px">in 2h</span></div>`},
  {id:'bar',label:'Bar',html:`<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 10px;display:flex;gap:4px"><span style="font-size:9px;text-align:center">🌙<br><span style="color:rgba(255,255,255,.4)">Fajr</span></span><span style="font-size:9px;text-align:center;color:rgba(124,106,247,.9)">☀️<br>Dhuhr</span><span style="font-size:9px;text-align:center">🌤<br><span style="color:rgba(255,255,255,.4)">Asr</span></span></div>`},
  {id:'card',label:'Card',html:`<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:8px 12px;min-width:110px"><div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:4px">🕌 PRAYER TIMES</div><div style="font-size:10px;display:flex;justify-content:space-between;margin-bottom:2px"><span>🌙 Fajr</span><span style="opacity:.7">05:12</span></div><div style="font-size:10px;display:flex;justify-content:space-between;color:rgba(212,168,67,.9)"><span>☀️ Asr</span><span>15:45</span></div></div>`},
  {id:'mosque',label:'Mosque',html:`<div style="background:linear-gradient(135deg,rgba(15,10,35,.9),rgba(30,20,60,.9));border:1px solid rgba(124,106,247,.25);border-radius:16px;padding:10px 14px;text-align:center"><div style="font-size:14px;margin-bottom:2px">☽</div><div style="font-size:9px;opacity:.4;letter-spacing:2px">NEXT</div><div style="font-size:12px;font-weight:200">العصر</div><div style="font-size:9px;color:#d4a843">15:45 · in 2h</div></div>`},
];
function buildPrayerStyleSwatches(){
  const grid=$('prayer-style-grid');if(!grid)return;grid.innerHTML='';
  PRAYER_STYLES_DEF.forEach(st=>{
    const sw=document.createElement('div');sw.className='swatch'+(S.prayerStyle===st.id?' active':'');
    sw.innerHTML=`<div class="sw-preview">${st.html}</div><span class="sw-name">${st.label}</span>`;
    sw.addEventListener('click',()=>{S.prayerStyle=st.id;if(prayerData)renderPrayer();buildPrayerStyleSwatches();scheduleSave();});
    grid.appendChild(sw);
  });
}

function openPanel(){
  document.body.classList.add('panel-open');
  clearTimeout(fadeTimer);document.body.classList.remove('faded');
  syncForm();buildGallery();
  buildThemeSwatches();buildSearchStyleSwatches();buildLinkStyleSwatches();
  buildWeatherStyleSwatches();buildSettingsStyleSwatches();buildPrayerStyleSwatches();
}
function closePanel(){document.body.classList.remove('panel-open');if(S.autoFade)resetFadeTimer();}

function syncForm(){
  ['clockVisible','dateVisible','greetingEnabled','searchVisible','linksVisible','weatherVisible','autoFade','prayerVisible']
    .forEach(k=>{const el=$(k);if(el)el.checked=!!S[k];});
  ['clockFormat','clockSize','searchEngine','videoSpeed','linksSize','weatherUnit','prayerMethod']
    .forEach(k=>{const el=$(k);if(el)el.value=S[k];});
  const gn=$('greetingName');if(gn)gn.value=S.greetingName||'';
  const dimEl=$('videoDim'),dimV=$('videoDim-val');if(dimEl){dimEl.value=S.videoDim;if(dimV)dimV.textContent=S.videoDim+'%';}
  const fdEl=$('autoFadeDelay'),fdV=$('autoFadeDelay-val');if(fdEl){fdEl.value=S.autoFadeDelay;if(fdV)fdV.textContent=S.autoFadeDelay+'s';}
  buildPositionGrids();
}

function buildPositionGrids(){
  ['clockPosition','searchPosition','linksPosition','weatherPosition','prayerPosition'].forEach(key=>{
    const grid=$('grid-'+key);if(!grid)return;grid.innerHTML='';
    POSITIONS_ORDER.forEach(pos=>{
      const cell=document.createElement('div');cell.className='pos-cell'+(S[key]===pos?' sel':'');
      const dot=document.createElement('div');dot.className='pos-dot';cell.appendChild(dot);cell.title=pos.replace(/-/g,' ');
      cell.addEventListener('click',async()=>{
        if(isMoving)return;isMoving=true;
        grid.querySelectorAll('.pos-cell').forEach(c=>c.classList.remove('sel'));cell.classList.add('sel');
        const old=S[key];S[key]=pos;
        const wid=key==='clockPosition'?'clock-wrap':key==='searchPosition'?'search-wrap':key==='linksPosition'?'links-wrap':key==='prayerPosition'?'prayer-wrap':'weather-wrap';
        if(pos!==old)await moveWidget(wid,pos);
        isMoving=false;scheduleSave();
      });
      grid.appendChild(cell);
    });
  });
}

function collectForm(){
  ['clockVisible','dateVisible','greetingEnabled','searchVisible','linksVisible','weatherVisible','autoFade','prayerVisible']
    .forEach(k=>{const el=$(k);if(el)S[k]=el.checked;});
  ['clockFormat','clockSize','searchEngine','videoSpeed','linksSize','weatherUnit']
    .forEach(k=>{const el=$(k);if(el)S[k]=el.value;});
  const pm=$('prayerMethod');if(pm)S.prayerMethod=parseInt(pm.value);
  const gn=$('greetingName');if(gn)S.greetingName=gn.value;
  const dimEl=$('videoDim');if(dimEl)S.videoDim=parseInt(dimEl.value);
  const fdEl=$('autoFadeDelay');if(fdEl)S.autoFadeDelay=parseInt(fdEl.value);
}

function scheduleSave(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    await storageSet('settings',S);
    const t=$('panel-saved');if(!t)return;
    clearTimeout(saveToastTimer);t.classList.add('show');saveToastTimer=setTimeout(()=>t.classList.remove('show'),2200);
  },380);
}

function openLinksModal(){tempLinks=links.map(l=>({...l}));renderLinksEditor();$('links-modal').classList.add('open');}
function closeLinksModal(){$('links-modal').classList.remove('open');}
function renderLinksEditor(){
  const ed=$('links-editor');if(!ed)return;ed.innerHTML='';
  tempLinks.forEach((link,i)=>{
    const row=document.createElement('div');row.className='link-row';
    const ei=document.createElement('input');ei.type='text';ei.className='ie';ei.placeholder='😀';ei.value=link.emoji;ei.addEventListener('input',()=>{tempLinks[i].emoji=ei.value;});
    const li=document.createElement('input');li.type='text';li.placeholder='Label';li.value=link.label;li.addEventListener('input',()=>{tempLinks[i].label=li.value;});
    const ui=document.createElement('input');ui.type='text';ui.placeholder='https://…';ui.value=link.url;ui.addEventListener('input',()=>{tempLinks[i].url=ui.value;});
    const db=document.createElement('button');db.className='del-btn';db.textContent='×';db.addEventListener('click',()=>{tempLinks.splice(i,1);renderLinksEditor();});
    row.appendChild(ei);row.appendChild(li);row.appendChild(ui);row.appendChild(db);ed.appendChild(row);
  });
}

async function init(){
  const savedS=await storageGet('settings');
  S=Object.assign({},DEFAULT_SETTINGS,savedS||{});
  links=(await storageGet('quick_links'))||DEFAULT_LINKS;
  userGallery=(await storageGet('user_gallery_index'))||[];

  placeAllWidgets();

  if(S.bgType==='image'&&S.bgActiveKey){const d=await storageGet(S.bgActiveKey);if(d)loadImageIntoDOM(d);else S.bgType='gradient';}
  else if(S.bgType==='video'&&S.bgActiveKey){
    const entry=userGallery.find(e=>e.dataKey===S.bgActiveKey);
    if(entry?.storageType==='idb'){
      const blob=await idbGet(S.bgActiveKey);
      if(blob){const url=URL.createObjectURL(blob);_blobCache[S.bgActiveKey]=url;loadVideoIntoDOM(url);}
      else S.bgType='gradient';
    }else{
      const d=await storageGet(S.bgActiveKey);if(d)loadVideoIntoDOM(d);else S.bgType='gradient';
    }
  }
  applyGradient(S.bgGradientIndex||0);
  if(S.bgType==='gradient')showBgLayer('gradient');

  applyAll();renderLinks();startClock();
  animateFavicon();

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      clearTimeout(favAnimFrame);favAnimFrame=null;
      clearInterval(clockTimer);clockTimer=null;
    }else{
      if(!favAnimFrame)animateFavicon();
      startClock();
    }
  });

  if(S.weatherVisible)fetchWeather();
  if(S.prayerVisible)fetchPrayerTimes();

  requestAnimationFrame(()=>{const l=$('loader');if(l){l.classList.add('done');setTimeout(()=>l.remove(),1100);}});

  const onboarded=await storageGet('onboarded');
  if(!onboarded)setTimeout(showOnboarding,900);

  ['mousemove','keydown','mousedown','touchstart'].forEach(ev=>{
    document.addEventListener(ev,()=>{if(S.autoFade)resetFadeTimer();},{passive:true});
  });

  $('ob-next').addEventListener('click',()=>{if(obStep<OB_STEPS.length-1){obStep++;renderObStep();}else hideOnboarding();});
  $('ob-skip').addEventListener('click',hideOnboarding);
  $('show-ob-btn')?.addEventListener('click',()=>{closePanel();setTimeout(showOnboarding,300);});

  $('settings-btn').addEventListener('click',()=>{
    if(document.body.classList.contains('panel-open'))closePanel();
    else openPanel();
  });
  $('panel-close').addEventListener('click',closePanel);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel();});

  document.querySelectorAll('.p-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.p-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.p-page').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');$('tab-'+tab.dataset.tab)?.classList.add('active');
    });
  });

  function onChange(){collectForm();applyAll();scheduleSave();}
  ['clockVisible','dateVisible','greetingEnabled','searchVisible','linksVisible','autoFade'].forEach(k=>$(k)?.addEventListener('change',onChange));
  ['clockFormat','clockSize','searchEngine','videoSpeed','linksSize'].forEach(k=>$(k)?.addEventListener('change',onChange));
  $('greetingName')?.addEventListener('input',onChange);

  $('weatherVisible')?.addEventListener('change',()=>{
    collectForm();applyAll();
    if(S.weatherVisible&&weatherCelsius===null)fetchWeather();
    scheduleSave();
  });
  $('weatherUnit')?.addEventListener('change',()=>{collectForm();renderWeatherTemp();scheduleSave();});

  $('prayerVisible')?.addEventListener('change',()=>{
    collectForm();applyVisibility();
    if(S.prayerVisible&&!prayerData)fetchPrayerTimes();
    scheduleSave();
  });
  $('prayerMethod')?.addEventListener('change',()=>{
    collectForm();prayerData=null;if(S.prayerVisible)fetchPrayerTimes();scheduleSave();
  });

  const dimSl=$('videoDim'),dimVl=$('videoDim-val');
  dimSl?.addEventListener('input',()=>{S.videoDim=parseInt(dimSl.value);if(dimVl)dimVl.textContent=dimSl.value+'%';applyVideoDim();scheduleSave();});
  const fdSl=$('autoFadeDelay'),fdVl=$('autoFadeDelay-val');
  fdSl?.addEventListener('input',()=>{S.autoFadeDelay=parseInt(fdSl.value);if(fdVl)fdVl.textContent=fdSl.value+'s';if(S.autoFade)resetFadeTimer();scheduleSave();});

  $('file-image-input').addEventListener('change',e=>{handleFileUpload(e.target.files[0],'image');e.target.value='';});
  $('file-video-input').addEventListener('change',e=>{handleFileUpload(e.target.files[0],'video');e.target.value='';});

  $('sound-btn').addEventListener('click',()=>{const v=$('bg-video');if(!v)return;v.muted=!v.muted;S.videoMuted=v.muted;updateSoundBtn();scheduleSave();});

  $('open-links-modal-btn').addEventListener('click',openLinksModal);
  $('lm-cancel').addEventListener('click',closeLinksModal);
  $('links-modal').addEventListener('click',e=>{if(e.target===$('links-modal'))closeLinksModal();});
  $('add-link-btn').addEventListener('click',()=>{tempLinks.push({emoji:'🔗',label:'New Link',url:'https://'});renderLinksEditor();});
  $('lm-save').addEventListener('click',async()=>{links=tempLinks.filter(l=>l.url.trim()&&l.url!=='https://');await storageSet('quick_links',links);renderLinks();closeLinksModal();});

  $('r-settings').addEventListener('click',async()=>{if(!confirm('Reset all settings?'))return;S={...DEFAULT_SETTINGS};await storageSet('settings',S);placeAllWidgets();applyAll();syncForm();});
  $('r-bg').addEventListener('click',async()=>{
    if(!confirm('Reset background?'))return;
    if(S.bgActiveKey&&_blobCache[S.bgActiveKey]){URL.revokeObjectURL(_blobCache[S.bgActiveKey]);delete _blobCache[S.bgActiveKey];}
    S.bgType='gradient';S.bgGradientIndex=0;S.bgActiveKey=null;
    applyGradient(0);showBgLayer('gradient');buildGallery();scheduleSave();
  });
  $('r-links').addEventListener('click',async()=>{if(!confirm('Restore default links?'))return;links=[...DEFAULT_LINKS];await storageSet('quick_links',links);renderLinks();});
  $('r-all').addEventListener('click',async()=>{
    if(!confirm('Wipe ALL data?'))return;
    await chrome.storage.local.clear();
    await idbClear();
    Object.values(_blobCache).forEach(u=>URL.revokeObjectURL(u));
    Object.keys(_blobCache).forEach(k=>delete _blobCache[k]);
    S={...DEFAULT_SETTINGS};links=[...DEFAULT_LINKS];userGallery=[];
    prayerData=null;prayerHijri=null;prayerDateStr=null;_lastNextPrayerIndex=-1;forecastData=null;
    placeAllWidgets();applyAll();renderLinks();syncForm();
    applyGradient(0);showBgLayer('gradient');
    const img=$('bg-image'),vid=$('bg-video');
    if(img){img.src='';img.classList.remove('loaded');}
    if(vid){vid.src='';vid.classList.remove('loaded');}
    buildGallery();
  });
}

document.addEventListener('DOMContentLoaded',init);
