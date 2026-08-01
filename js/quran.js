import { $, safeHTML } from './utils.js';
import { state } from './state.js';

export let quoteData = null;
export let quoteAudio = null;
export let quoteAudioPlaying = false;
let isSurahPlaying = false;
let nextQuoteAudio = null;

export const HADITH_LIST = [
	{ ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", text: "The best of you are those who learn the Quran and teach it.", source: "Sahih al-Bukhari 5027" },
	{ ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", text: "A Muslim is one from whose tongue and hands the Muslims are safe.", source: "Sahih al-Bukhari 10" },
	{ ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih al-Bukhari 13" },
	{ ar: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", text: "The strong man is not one who wrestles others down. The strong man is the one who controls himself when angry.", source: "Sahih al-Bukhari 6114" },
	{ ar: "الطَّهُورُ شَطْرُ الْإِيمَانِ", text: "Cleanliness is half of faith.", source: "Sahih Muslim 223" },
	{ ar: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", text: "Allah does not look at your appearance or wealth, but He looks at your hearts and deeds.", source: "Sahih Muslim 2564" },
	{ ar: "يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا", text: "Make things easy, do not make them difficult. Give glad tidings, do not drive people away.", source: "Sahih al-Bukhari 69" },
	{ ar: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", text: "The most beloved deeds to Allah are those done consistently, even if they are small.", source: "Sahih al-Bukhari 6465" },
	{ ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", source: "Sahih al-Bukhari 6018" },
	{ ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", text: "Verily, with hardship comes ease.", source: "Quran 94:6" },
	{ ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", text: "Smiling at your brother is charity.", source: "Jami at-Tirmidhi 1956" },
	{ ar: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ", text: "Allah is gentle and loves gentleness in all matters.", source: "Sahih al-Bukhari 6927" },
	{ ar: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", text: "Every act of kindness is charity.", source: "Sahih al-Bukhari 2891" },
	{ ar: "اعْقِلْهَا وَتَوَكَّلْ", text: "Tie your camel, then put your trust in Allah.", source: "Jami at-Tirmidhi 2517" },
	{ ar: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ", text: "Whoever is not grateful to people is not grateful to Allah.", source: "Sunan Abi Dawud 4811" }
];

export const ARABIC_FONTS = [
	{ id: 'system', name: 'System Arabic', css: 'serif' },
	{ id: 'amiri', name: 'Amiri', css: "'Amiri', serif", url: 'https://fonts.googleapis.com/css2?family=Amiri&display=swap' },
	{ id: 'scheherazade', name: 'Scheherazade', css: "'Scheherazade New', serif", url: 'https://fonts.googleapis.com/css2?family=Scheherazade+New&display=swap' },
	{ id: 'cairo', name: 'Cairo', css: "'Cairo', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Cairo&display=swap' },
	{ id: 'tajawal', name: 'Tajawal', css: "'Tajawal', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Tajawal&display=swap' },
	{ id: 'lateef', name: 'Lateef', css: "'Lateef', serif", url: 'https://fonts.googleapis.com/css2?family=Lateef&display=swap' },
	{ id: 'noto', name: 'Noto Naskh', css: "'Noto Naskh Arabic', serif", url: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap' }
];

export const QUOTE_STYLE_DEFS = [
	{ id: 'card', name: 'Card' },
	{ id: 'minimal', name: 'Minimal' },
	{ id: 'glass', name: 'Glass' },
	{ id: 'verse', name: 'Verse' }
];

export const QURAN_RECITERS = [
	{ id: 'Alafasy_128kbps', name: 'Mishary Alafasy' },
	{ id: 'Abdul_Basit_Mujawwad_128kbps', name: 'Abdul Basit (Mujawwad)' },
	{ id: 'Abdul_Basit_Murattal_192kbps', name: 'Abdul Basit (Murattal)' },
	{ id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary' },
	{ id: 'Muhammad_Jibreel_128kbps', name: 'Muhammad Jibreel' },
	{ id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'Abu Bakr Al-Shatri' },
	{ id: 'Minshawy_Murattal_128kbps', name: 'Mohamed Al-Minshawi' },
	{ id: 'MaherAlMuaiqly128kbps', name: 'Maher Al-Muaiqly' },
	{ id: 'Yasser_Ad-Dussary_128kbps', name: 'Yasser Al-Dosari' },
	{ id: 'Nasser_Alqatami_128kbps', name: 'Nasser Al-Qatami' }
];

export function applyArabicFont() {
	const id = state.S.arabicFont || 'amiri';
	const def = ARABIC_FONTS.find(f => f.id === id) || ARABIC_FONTS[1];
	if (def.url) {
		let lk = document.getElementById('arabic-font-link');
		if (!lk) {
			lk = document.createElement('link');
			lk.id = 'arabic-font-link';
			lk.rel = 'stylesheet';
			document.head.appendChild(lk);
		}
		lk.href = def.url;
	}
	let st = document.getElementById('arabic-font-style');
	if (!st) {
		st = document.createElement('style');
		st.id = 'arabic-font-style';
		document.head.appendChild(st);
	}
	st.textContent = `.quote-arabic{font-family:${def.css}!important}`;
}

export function preloadNextAudio(surah, ayah, reciter) {
	const s = String(surah).padStart(3, '0');
	const a = String(ayah).padStart(3, '0');
	const url = `https://everyayah.com/data/${reciter}/${s}${a}.mp3`;
	nextQuoteAudio = new Audio();
	nextQuoteAudio.preload = 'auto'; 
	nextQuoteAudio.src = url;
	nextQuoteAudio.load();
}

export async function fetchQuote(keepSameAyah = false){
	const wrap=$('quote-wrap'); if(!wrap) return;
	
	const inner = wrap.querySelector('.quote-inner');
	if (inner && !keepSameAyah) {
		inner.style.transition = 'opacity 0.3s ease';
		inner.style.opacity = '0.3';
	} else if (!keepSameAyah) {
		safeHTML(wrap,`<div class="quote-loading">✦</div>`);
	}
	
	const src=state.S.quoteSource||'quran';
	if(src==='hadith'){
		if(!keepSameAyah || !quoteData || quoteData.type !== 'hadith') {
			const h=HADITH_LIST[Math.floor(Math.random()*HADITH_LIST.length)];
			quoteData={type:'hadith',ar:h.ar,text:h.text,source:h.source};
		}
		renderQuote(); return;
	}
	try{
		const bust=Date.now();
		const trans = state.S.quoteTrans || 'en.asad';
		const tafsirEd = state.S.tafsirLang === 'en' ? 'en.maududi' : 'ar.muyassar';
		
		let baseData;
		if(keepSameAyah && quoteData && quoteData.type === 'quran') {
			const r = await fetch(`https://api.alquran.cloud/v1/ayah/${quoteData.surah}:${quoteData.ayah}/editions/quran-simple,${trans},${tafsirEd}`);
			const j = await r.json();
			baseData = j.data;
		} else {
			const r = await fetch(`https://api.alquran.cloud/v1/ayah/random/editions/quran-simple,${trans},${tafsirEd}?_=${bust}`);
			const j = await r.json();
			baseData = j.data;
		}
		
		const ar = baseData[0], en = baseData[1], taf = baseData[2];
		const surah = ar.surah.number;
		const ayah = ar.numberInSurah;
		const ref = `${ar.surah.englishName} • ${surah}:${ayah}`;
		
		if(src==='both'&&!keepSameAyah&&Math.random()<0.4){
			const h=HADITH_LIST[Math.floor(Math.random()*HADITH_LIST.length)];
			quoteData={type:'hadith',ar:h.ar,text:h.text,source:h.source};
		}else{
			quoteData={
				type:'quran', arabic:ar.text, text:en.text, tafsir:taf.text, ref, 
				surah, ayah, totalAyahs: ar.surah.numberOfAyahs
			};
		}
		renderQuote();
	}catch(err){
		if(src!=='quran'){
			if(!keepSameAyah) {
				const h=HADITH_LIST[Math.floor(Math.random()*HADITH_LIST.length)];
				quoteData={type:'hadith',ar:h.ar,text:h.text,source:h.source};
			}
			renderQuote();
		}else{
			safeHTML(wrap,`<div class="quote-error" id="quote-retry">⚠ Tap to retry</div>`);
			$('quote-retry')?.addEventListener('click',()=>fetchQuote(false),{once:true});
		}
	}
}

export async function fetchSpecificAyah(surah, ayah, autoplay = false) {
	const wrap = $('quote-wrap'); if (!wrap) return;
	
	const inner = wrap.querySelector('.quote-inner');
	if (inner) {
		inner.style.transition = 'opacity 0.3s ease';
		inner.style.opacity = '0.3';
	} else {
		safeHTML(wrap, `<div class="quote-loading">✦</div>`);
	}
	
	try {
		const bust = Date.now();
		const trans = state.S.quoteTrans || 'en.asad';
		const tafsirEd = state.S.tafsirLang === 'en' ? 'en.maududi' : 'ar.muyassar';
		
		const r = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-simple,${trans},${tafsirEd}?_=${bust}`);
		const j = await r.json();
		if (j.code !== 200 || !j.data) throw new Error('bad');
		
		const ar = j.data[0], en = j.data[1], taf = j.data[2];
		const ref = `${ar.surah.englishName} • ${ar.surah.number}:${ar.numberInSurah}`;
		
		quoteData = {
			type: 'quran', arabic: ar.text, text: en.text, tafsir: taf.text, ref: ref,
			surah: ar.surah.number, ayah: ar.numberInSurah, totalAyahs: ar.surah.numberOfAyahs
		};
		renderQuote();
		
		if (autoplay) {
			toggleQuoteAudio(quoteData.surah, quoteData.ayah, state.S.quranReciter || 'Alafasy_128kbps');
		}
	} catch (e) {
		isSurahPlaying = false;
		fetchQuote(); 
	}
}

export function renderQuote(){
	const wrap=$('quote-wrap'); if(!wrap||!quoteData) return;
	
	if (!isSurahPlaying) stopQuoteAudio();
	
	applyArabicFont();
	const q=quoteData;
	const style=state.S.quoteStyle||'card'; 
	const isQuran=q.type==='quran';
	const reciter=state.S.quranReciter||'Alafasy_128kbps';
	
	const arabicBlock=`<div class="quote-arabic">${isQuran?q.arabic:q.ar}</div>`;
	const transBlock=isQuran?`<div class="quote-text">${q.text}</div>`:`<div class="quote-text">"${q.text}"</div>`;
	const refBlock=`<span class="quote-ref">${isQuran?q.ref:q.source}</span>`;
	
	var btnCls = 'quote-play-btn';
	var prevBtn = isQuran ? `<button class="${btnCls}" id="quote-prev" title="Previous Ayah">❮</button>` : '';
	var playStartBtn = isQuran ? `<button class="${btnCls}" id="quote-play-start" title="Play Surah From Start">⏮</button>` : '';
	var playBtn = isQuran ? `<button class="${btnCls}" id="quote-play" title="Play This Verse">▶</button>` : '';
	var playSurahBtn = isQuran ? `<button class="${btnCls}" id="quote-play-surah" title="Play From Here">▶▶</button>` : '';
	var stopBtn = isQuran ? `<button class="${btnCls}" id="quote-stop" title="Stop Audio">■</button>` : '';
	var nextAyahBtn = isQuran ? `<button class="${btnCls}" id="quote-next-ayah" title="Next Ayah">❯</button>` : '';
	var tafsirBtn = isQuran ? `<button class="${btnCls}" id="quote-tafsir" title="تفسير">📖</button>` : '';
	var randomBtn = `<button class="${btnCls}" id="quote-next" title="Random">↻</button>`;
	
	const typeTag=`<span class="quote-type-tag">${isQuran?'قرآن':'حديث'}</span>`;
	const actions = `<div class="quote-actions">${prevBtn}${playStartBtn}${playBtn}${playSurahBtn}${stopBtn}${nextAyahBtn}${tafsirBtn}${randomBtn}</div>`;
	const footer = `<div class="quote-footer">${refBlock}${actions}</div>`;
	const tafsirBox = isQuran ? `<div class="tafsir-box" id="tafsir-box" style="display:none; margin-top:10px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.2); font-size:12px; color:rgba(255,255,255,0.85); max-height:120px; overflow-y:auto; direction:rtl; text-align:right;"></div>` : '';
	
	let html = '';
	if (style === 'minimal') {
		html = `<div class="quote-inner quote-minimal" style="opacity: 1; transition: opacity 0.4s ease;">
		${arabicBlock}
		${footer}
		${tafsirBox}
		</div>`;
	} else { 
		html = `<div class="quote-inner quote-${style}" style="opacity: 1; transition: opacity 0.4s ease;">
		${typeTag}
		${arabicBlock}
		${transBlock}
		${footer}
		${tafsirBox}
		</div>`;
	}
	
	safeHTML(wrap,html);
	
	$('quote-play')?.addEventListener('click', function(){ 
		isSurahPlaying = false; 
		toggleQuoteAudio(q.surah, q.ayah, reciter); 
	});
	
	$('quote-play-surah')?.addEventListener('click', function(){ 
		isSurahPlaying = true;
		stopQuoteAudio();
		toggleQuoteAudio(q.surah, q.ayah, reciter); 
	});
	
	$('quote-play-start')?.addEventListener('click', function() {
		isSurahPlaying = true; 
		stopQuoteAudio();
		fetchSpecificAyah(q.surah, 1, true); 
	});
	
	$('quote-stop')?.addEventListener('click', function(){ 
		isSurahPlaying = false;
		stopQuoteAudio(); 
	});
	
	$('quote-prev')?.addEventListener('click', function() {
		if (q.ayah > 1) {
			isSurahPlaying = false; stopQuoteAudio();
			fetchSpecificAyah(q.surah, q.ayah - 1);
		}
	});
	
	$('quote-next-ayah')?.addEventListener('click', function() {
		if (!q.totalAyahs || q.ayah < q.totalAyahs) {
			isSurahPlaying = false; stopQuoteAudio();
			fetchSpecificAyah(q.surah, q.ayah + 1);
		}
	});
	
	$('quote-tafsir')?.addEventListener('click', function(){
		var box = $('tafsir-box');
		if (!box) return;
		if (box.style.display !== 'none') {
			box.style.display = 'none';
		} else {
			box.style.display = 'block';
			if (q.tafsir) {
				safeHTML(box, `<div style="font-weight:bold; color:#d4a843; margin-bottom:4px;">التفسير:</div><div>${q.tafsir}</div>`);
			} else {
				safeHTML(box, `<div style="color:rgba(255,255,255,0.5);">التفسير غير متوفر حالياً.</div>`);
			}
		}
	});
	
	$('quote-next')?.addEventListener('click', function(){
		isSurahPlaying = false; stopQuoteAudio();
		fetchQuote(false);
	});
	
	if (quoteAudioPlaying) {
		updatePlayBtn('■');
	}
}

export function toggleQuoteAudio(surah, ayah, reciter){
	if(quoteAudio && quoteAudioPlaying && !isSurahPlaying){
		stopQuoteAudio();
		return;
	}
	const s = String(surah).padStart(3, '0');
	const a = String(ayah).padStart(3, '0');
	const url = `https://everyayah.com/data/${reciter}/${s}${a}.mp3`;
	
	if(!quoteAudio || quoteAudio.src !== url){
		if(quoteAudio) {
			quoteAudio.pause();
			quoteAudio.currentTime = 0;
		}
		
		if (nextQuoteAudio && nextQuoteAudio.src === url) {
			quoteAudio = nextQuoteAudio;
		} else {
			quoteAudio = new Audio(url);
		}
		nextQuoteAudio = null; 
		
		quoteAudio.onended = () => {
			quoteAudioPlaying = false;
			updatePlayBtn('▶');
			
			if (isSurahPlaying && quoteData && quoteData.type === 'quran') {
				if (quoteData.ayah < (quoteData.totalAyahs || 999)) {
					let nextAyah = quoteData.ayah + 1;
					let nextSurah = quoteData.surah;
					
					fetchSpecificAyah(nextSurah, nextAyah, false);
					toggleQuoteAudio(nextSurah, nextAyah, reciter);
				} else {
					isSurahPlaying = false;
				}
			}
		};
		quoteAudio.onerror = () => {
			quoteAudioPlaying = false;
			isSurahPlaying = false;
			updatePlayBtn('▶');
		};
	}
	
	quoteAudio.play().then(() => {
		quoteAudioPlaying = true;
		updatePlayBtn('■');
		
		if (isSurahPlaying && quoteData && quoteData.type === 'quran') {
			preloadNextAudio(surah, ayah + 1, reciter);
		}
	}).catch(() => {
		isSurahPlaying = false;
	});
}

export function stopQuoteAudio(){
	if(quoteAudio){quoteAudio.pause();quoteAudio.currentTime=0;}
	quoteAudioPlaying=false;
	updatePlayBtn('▶');
}

export function updatePlayBtn(icon){
	const b=$('quote-play');
	if(b)b.textContent=icon;
}