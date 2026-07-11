const DEFAULT_LINKS = [
	{ emoji: '📧', label: 'Gmail',    url: 'https://mail.google.com' },
	{ emoji: '📅', label: 'Calendar', url: 'https://calendar.google.com' },
	{ emoji: '▶️', label: 'YouTube',  url: 'https://youtube.com' },
	{ emoji: '🐦', label: 'X',        url: 'https://x.com' },
	{ emoji: '💼', label: 'LinkedIn', url: 'https://linkedin.com' },
	{ emoji: '📰', label: 'News',     url: 'https://news.google.com' },
];

const DEFAULT_SETTINGS = {
	clockVisible:    true,
	dateVisible:     true,
	clockFormat:     '24h',
	clockSize:       'large',
	clockTheme:      'minimal',
	greetingEnabled: false,
	greetingName:    '',
	searchVisible:   true,
	searchEngine:    'google',
	searchStyle:     'glass',
	linksVisible:    true,
	linksSize:       'medium',
	linksStyle:      'glass',
	weatherVisible:  false,
	weatherUnit:     'C',
	weatherStyle:    'pill',
	prayerVisible:   false,
	prayerStyle:     'minimal',
	prayerMethod:    5,
	prayerPosition:  'bottom-right',
	quoteVisible:    false,
	quoteSource:     'quran',
	quoteStyle:      'card',
	arabicFont:      'amiri',
	quranReciter:    'Alafasy_128kbps',
	quotePosition:   'bottom-center',
	calendarVisible: false,
	calendarProvider:'google',
	calendarStyle:   'card',
	calendarPosition:'center-right',
	settingsStyle:   'pill',
	clockPosition:   'top-center',
	searchPosition:  'center',
	linksPosition:   'bottom-center',
	weatherPosition: 'top-right',
	bgType:          'gradient',
	bgGradientIndex: 0,
	bgActiveKey:     null,
	videoMuted:      true,
	videoDim:        40,
	videoSpeed:      1.0,
	autoFade:        false,
	autoFadeDelay:   10,
};

const PRESET_GRADIENTS = [
	{ bg:'linear-gradient(135deg,#0c0c18 0%,#131326 50%,#0c1420 100%)',              name:'Midnight' },
	{ bg:'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',              name:'Nebula'   },
	{ bg:'linear-gradient(135deg,#1a0533 0%,#2d1b69 55%,#11998e 100%)',              name:'Aurora'   },
	{ bg:'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',              name:'Ocean'    },
	{ bg:'linear-gradient(135deg,#1e3a5f 0%,#0a1628 60%,#0e2342 100%)',              name:'Abyss'    },
	{ bg:'linear-gradient(135deg,#200122 0%,#6f0000 100%)',                           name:'Crimson'  },
	{ bg:'linear-gradient(135deg,#093028 0%,#237a57 100%)',                           name:'Forest'   },
	{ bg:'linear-gradient(135deg,#2c1810 0%,#6b3a2a 50%,#8b4513 100%)',              name:'Ember'    },
	
	// The 3 CSS Animated Presets
	{ bg:'linear-gradient(135deg,#1a0533,#2d1b69,#11998e,#0a1a2e)',          name:'Aurora',         anim:'anim-aurora' },
	{ bg:'radial-gradient(circle at 30% 30%, rgba(124,106,247,0.6), transparent), #080812', name:'Floating Orbs',  anim:'anim-orbs'   },
	{ bg:'radial-gradient(ellipse at 50% 100%, rgba(124,106,247,0.5), transparent), #060610',name:'Waves', anim:'anim-waves'  },
	
	// The 5 Interactive Canvas Presets
	{ bg:'#06060c', name:'Constellation Web', anim:'anim-constellation', interactive:'constellation' },
	{ bg:'#06060c', name:'Gravity Grid',      anim:'anim-gravity',       interactive:'gravity' },
	{ bg:'#06060c', name:'Orbital Swarm',     anim:'anim-swarm',         interactive:'swarm' },
	{ bg:'#06060c', name:'Vector Field',      anim:'anim-field',         interactive:'field' },
	{ bg:'#06060c', name:'Kinetic Mesh',      anim:'anim-mesh',          interactive:'mesh' },
];

const POSITIONS_ORDER = [
	'top-left','top-center','top-right',
	'center-left','center','center-right',
	'bottom-left','bottom-center','bottom-right',
];

const CLOCK_SIZES = {
	small:  { time:'clamp(28px,3.5vw,48px)', day:'clamp(38px,5vw,64px)',   date:'10px', greeting:'10px' },
	medium: { time:'clamp(42px,6vw,78px)',   day:'clamp(56px,8vw,100px)',  date:'12px', greeting:'11px' },
	large:  { time:'clamp(60px,10vw,115px)', day:'clamp(80px,13vw,160px)', date:'13px', greeting:'13px' },
	xlarge: { time:'clamp(82px,14vw,162px)', day:'clamp(110px,18vw,220px)',date:'16px', greeting:'14px' },
};

const LINK_SIZES = {
	small:  { icon:'40px', emoji:'17px', label:'10px', gap:'8px',  radius:'10px' },
	medium: { icon:'54px', emoji:'22px', label:'11px', gap:'10px', radius:'14px' },
	large:  { icon:'70px', emoji:'28px', label:'12px', gap:'12px', radius:'18px' },
};

const PRAYER_NAMES    = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const PRAYER_NAMES_AR = ['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'];
const PRAYER_KEYS     = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const PRAYER_ICONS    = ['🌙','🌅','☀️','🌤','🌇','🌃'];

const WMO_MAP = {
	0:{i:'☀️',d:'Clear',cat:'clear'},1:{i:'🌤',d:'Mainly clear',cat:'partly'},
	2:{i:'⛅',d:'Partly cloudy',cat:'partly'},3:{i:'☁️',d:'Overcast',cat:'cloudy'},
	45:{i:'🌫',d:'Foggy',cat:'fog'},48:{i:'🌫',d:'Icy fog',cat:'fog'},
	51:{i:'🌦',d:'Drizzle',cat:'rain'},53:{i:'🌦',d:'Drizzle',cat:'rain'},
	55:{i:'🌧',d:'Heavy drizzle',cat:'rain'},61:{i:'🌧',d:'Light rain',cat:'rain'},
	63:{i:'🌧',d:'Rain',cat:'rain'},65:{i:'🌧',d:'Heavy rain',cat:'rain'},
	71:{i:'🌨',d:'Light snow',cat:'snow'},73:{i:'❄️',d:'Snow',cat:'snow'},
	75:{i:'❄️',d:'Heavy snow',cat:'snow'},77:{i:'🌨',d:'Snow grains',cat:'snow'},
	80:{i:'🌦',d:'Showers',cat:'rain'},81:{i:'🌧',d:'Showers',cat:'rain'},
	82:{i:'⛈',d:'Violent showers',cat:'storm'},85:{i:'🌨',d:'Snow showers',cat:'snow'},
	95:{i:'⛈',d:'Thunderstorm',cat:'storm'},96:{i:'⛈',d:'Hail storm',cat:'storm'},
	99:{i:'⛈',d:'Hail storm',cat:'storm'},
};
function getWMO(code){ return WMO_MAP[code]||WMO_MAP[Math.floor(code/10)*10]||{i:'🌡',d:'Unknown',cat:'clear'}; }

function storageGet(k){ return new Promise(r=>chrome.storage.local.get(k,res=>r(res[k]??null))); }
function storageSet(k,v){ return new Promise(r=>chrome.storage.local.set({[k]:v},r)); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function captureVideoThumbnail(blobUrl){
	return new Promise(resolve=>{
		const v=document.createElement('video');
		v.muted=true;v.preload='metadata';v.src=blobUrl;
		const snap=()=>{
			try{const c=document.createElement('canvas');c.width=160;c.height=100;c.getContext('2d').drawImage(v,0,0,160,100);resolve(c.toDataURL('image/jpeg',.7));}
			catch{resolve(null);}
		};
		v.onloadedmetadata=()=>{v.currentTime=Math.min(0.5,v.duration||0);};
		v.onseeked=snap;
		v.onerror=()=>resolve(null);
		setTimeout(()=>resolve(null),8000);
	});
}

function timeToMins(t){ if(!t)return 0; const [h,m]=t.split(':').map(Number); return h*60+m; }
