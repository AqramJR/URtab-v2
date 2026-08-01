import { $ } from './utils.js';

export let activeInteractiveMode = null;
export let bgAnimFrame = null;

let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000 };
let particles = [];
let gridPoints = [];

export function initInteractiveBackgrounds() {
    window.addEventListener('mousemove', e => {
        mouse.vx = e.clientX - mouse.lastX;
        mouse.vy = e.clientY - mouse.lastY;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
	});
	
    const canvasResizeObserver = new ResizeObserver(() => {
        const canvas = $('bg-canvas');
        if (!canvas || !activeInteractiveMode) return;
        const { w, h } = getCanvasDimensions();
        if (w < 10 || h < 10) return;
        if (canvas.width !== w || canvas.height !== h || particles.length + gridPoints.length === 0) {
            canvas.width = w;
            canvas.height = h;
            initInteractiveCanvas(canvas, activeInteractiveMode);
		}
	});
    canvasResizeObserver.observe(document.body);
}

export function getCanvasDimensions() {
    const w = window.innerWidth || document.documentElement.clientWidth || screen.width || 1920;
    const h = window.innerHeight || document.documentElement.clientHeight || screen.height || 1080;
    return { w, h };
}

export function startInteractiveCanvas(canvas, mode) {
    if (bgAnimFrame) {
        cancelAnimationFrame(bgAnimFrame);
        bgAnimFrame = null;
	}
    activeInteractiveMode = mode;
    const { w, h } = getCanvasDimensions();
    if (w < 10 || h < 10) {
        requestAnimationFrame(() => startInteractiveCanvas(canvas, mode));
        return;
	}
    canvas.width = w;
    canvas.height = h;
    initInteractiveCanvas(canvas, mode);
}

export function stopInteractiveCanvas() {
    if (bgAnimFrame) {
        cancelAnimationFrame(bgAnimFrame);
        bgAnimFrame = null;
	}
    activeInteractiveMode = null;
    particles = [];
    gridPoints = [];
}

/* =========================================================
	CUT YOUR ENTIRE "function initInteractiveCanvas(canvas, mode) { ... }"
	BLOCK FROM newtab.js AND PASTE IT ALL RIGHT HERE!
========================================================= */

function initInteractiveCanvas(canvas, mode) {
	const ctx = canvas.getContext('2d');
	particles = [];
	gridPoints = [];
	
	if (mode === 'constellation' || mode === 'swarm' || mode === 'mesh') {
		let count = Math.floor((canvas.width * canvas.height) / 12000);
		if (mode === 'swarm')
		count = 110;
		if (mode === 'mesh')
		count = Math.floor((canvas.width * canvas.height) / 14000);
		count = Math.max(count, 50);
		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * (mode === 'swarm' ? 1.5 : 0.8),
				vy: (Math.random() - 0.5) * (mode === 'swarm' ? 1.5 : 0.8),
				radius: mode === 'mesh' ? 1.5 : (Math.random() * 2 + 1),
				color: mode === 'swarm'
				? `hsl(${Math.random() * 60 + 230}, 80%, 65%)`
				: 'rgba(180, 200, 255, 0.7)'
			});
		}
	}
	
	if (mode === 'gravity' || mode === 'field') {
		const spacing = mode === 'field' ? 32 : 35;
		const cols = Math.ceil(canvas.width / spacing) + 1;
		const rows = Math.ceil(canvas.height / spacing) + 1;
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < rows; j++) {
				gridPoints.push({
					baseX: i * spacing,
					baseY: j * spacing,
					x: i * spacing,
					y: j * spacing
				});
			}
		}
	}
	
	if (mode === 'liquid') {
		const count = Math.max(6, Math.floor((canvas.width * canvas.height) / 80000));
		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.6,
				vy: (Math.random() - 0.5) * 0.6,
				r: 80 + Math.random() * 120,
				hue: 220 + Math.random() * 100,
				phase: Math.random() * Math.PI * 2,
			});
		}
	}
	
	if (mode === 'curtain') {
		const cols = Math.ceil(canvas.width / 18);
		for (let i = 0; i < cols; i++) {
			gridPoints.push({
				x: i * 18 + 9,
				phase: Math.random() * Math.PI * 2,
				speed: 0.004 + Math.random() * 0.006,
				amp: 18 + Math.random() * 32,
				hue: 180 + Math.random() * 160,
				ripple: 0,
				rippleY: 0,
			});
		}
	}
	
	if (mode === 'neonrain') {
		const count = Math.max(60, Math.floor(canvas.width / 14));
		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height - canvas.height,
				speed: 3 + Math.random() * 5,
				len: 20 + Math.random() * 60,
				hue: Math.random() < 0.6 ? 270 + Math.random() * 30 : 180 + Math.random() * 20,
				alpha: 0.3 + Math.random() * 0.6,
				drift: 0,
			});
		}
	}
	
	if (mode === 'sand') {
		const count = Math.max(800, Math.floor((canvas.width * canvas.height) / 1800));
		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: 0,
				vy: 0,
				baseVx: (Math.random() - 0.5) * 0.3,
				radius: 0.8 + Math.random() * 1.2,
				hue: 35 + Math.random() * 25,
				alpha: 0.3 + Math.random() * 0.5,
			});
		}
	}
	
	function loop() {
		if (!activeInteractiveMode)
		return;
		
		const bgColors = {
			constellation: '#05050a',
			gravity: '#04040a',
			swarm: '#04040c',
			field: '#04040a',
			mesh: '#05050a',
			liquid: '#03030a',
			curtain: '#010108',
			neonrain: '#02020c',
			sand: '#05040e',
		};
		ctx.fillStyle = bgColors[mode] || '#05050a';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		// ==========================================
		// 1. CONSTELLATION WEB
		// ==========================================
		if (mode === 'constellation') {
			particles.forEach((p, i) => {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > canvas.width)
				p.vx *= -1;
				if (p.y < 0 || p.y > canvas.height)
				p.vy *= -1;
				
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fill();
				
				const distMouse = Math.hypot(mouse.x - p.x, mouse.y - p.y);
				if (distMouse < 180) {
					ctx.strokeStyle = `rgba(124, 106, 247, ${1 - distMouse / 180})`;
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(mouse.x, mouse.y);
					ctx.stroke();
					p.x -= (mouse.x - p.x) * 0.003;
					p.y -= (mouse.y - p.y) * 0.003;
				}
				
				for (let j = i + 1; j < particles.length; j++) {
					let p2 = particles[j];
					let dist = Math.hypot(p2.x - p.x, p2.y - p.y);
					if (dist < 100) {
						ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 100) * 0.25})`;
						ctx.lineWidth = 0.8;
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.stroke();
					}
				}
			});
		}
		
		// ==========================================
		// 2. GRAVITY GRID
		// ==========================================
		else if (mode === 'gravity') {
			gridPoints.forEach(p => {
				const dx = mouse.x - p.baseX;
				const dy = mouse.y - p.baseY;
				const dist = Math.hypot(dx, dy);
				const maxDist = 220;
				
				if (dist < maxDist && mouse.x > 0) {
					const force = Math.pow((1 - dist / maxDist), 2);
					p.x = p.baseX + dx * force * 0.35;
					p.y = p.baseY + dy * force * 0.35;
					} else {
					p.x += (p.baseX - p.x) * 0.1;
					p.y += (p.baseY - p.y) * 0.1;
				}
				
				const warpAmount = Math.hypot(p.x - p.baseX, p.y - p.baseY);
				const radius = warpAmount > 1 ? 2.2 : 1;
				const alpha = Math.min(1, 0.2 + warpAmount * 0.05);
				
				ctx.fillStyle = warpAmount > 5
				? `rgba(124, 106, 247, ${alpha})`
				: `rgba(255, 255, 255, ${alpha})`;
				
				ctx.beginPath();
				ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
				ctx.fill();
			});
		}
		
		// ==========================================
		// 3. ORBITAL SWARM
		// ==========================================
		else if (mode === 'swarm') {
			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0)
				p.x = canvas.width;
				if (p.x > canvas.width)
				p.x = 0;
				if (p.y < 0)
				p.y = canvas.height;
				if (p.y > canvas.height)
				p.y = 0;
				
				const dx = mouse.x - p.x;
				const dy = mouse.y - p.y;
				const dist = Math.hypot(dx, dy);
				
				if (dist < 280 && mouse.x > 0) {
					const force = (1 - dist / 280) * 0.5;
					p.vx += (dx / dist) * force;
					p.vy += (dy / dist) * force;
					p.vx += (-dy / dist) * force * 1.2;
					p.vy += (dx / dist) * force * 1.2;
				}
				
				p.vx *= 0.98;
				p.vy *= 0.98;
				const speed = Math.hypot(p.vx, p.vy);
				ctx.strokeStyle = p.color;
				ctx.lineWidth = Math.min(3, speed * 0.8 + 1);
				ctx.lineCap = 'round';
				
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
				ctx.stroke();
			});
		}
		
		// ==========================================
		// 4. VECTOR FIELD
		// ==========================================
		else if (mode === 'field') {
			gridPoints.forEach(p => {
				const dx = mouse.x - p.x;
				const dy = mouse.y - p.y;
				const dist = Math.hypot(dx, dy);
				const angle = mouse.x > 0 ? Math.atan2(dy, dx) : 0;
				const maxDist = 240;
				
				const length = dist < maxDist && mouse.x > 0 ? 14 : 8;
				const alpha = dist < maxDist && mouse.x > 0 ? Math.min(1, 0.25 + (1 - dist / maxDist) * 0.75) : 0.2;
				
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(angle);
				
				ctx.strokeStyle = dist < 120 && mouse.x > 0
				? `rgba(124, 106, 247, ${alpha})`
				: `rgba(255, 255, 255, ${alpha})`;
				ctx.lineWidth = dist < 120 && mouse.x > 0 ? 2 : 1;
				ctx.lineCap = 'round';
				
				ctx.beginPath();
				ctx.moveTo(-length / 2, 0);
				ctx.lineTo(length / 2, 0);
				
				if (dist < 180 && mouse.x > 0) {
					ctx.fillStyle = `rgba(94, 223, 130, ${alpha})`;
					ctx.fillRect(length / 2 - 2, -1.5, 3, 3);
				}
				ctx.stroke();
				ctx.restore();
			});
		}
		
		// ==========================================
		// 5. KINETIC MESH
		// ==========================================
		else if (mode === 'mesh') {
			particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > canvas.width)
				p.vx *= -1;
				if (p.y < 0 || p.y > canvas.height)
				p.vy *= -1;
				
				const dx = p.x - mouse.x;
				const dy = p.y - mouse.y;
				const dist = Math.hypot(dx, dy);
				if (dist < 150 && mouse.x > 0) {
					p.x += (dx / dist) * 1.5;
					p.y += (dy / dist) * 1.5;
				}
				
				ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fill();
			});
			
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					for (let k = j + 1; k < particles.length; k++) {
						const p1 = particles[i],
						p2 = particles[j],
						p3 = particles[k];
						const d1 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
						const d2 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
						const d3 = Math.hypot(p3.x - p1.x, p3.y - p1.y);
						
						if (d1 < 85 && d2 < 85 && d3 < 85) {
							const centerX = (p1.x + p2.x + p3.x) / 3;
							const centerY = (p1.y + p2.y + p3.y) / 3;
							const distMouse = Math.hypot(mouse.x - centerX, mouse.y - centerY);
							
							if (distMouse < 220 && mouse.x > 0) {
								const alpha = (1 - distMouse / 220) * 0.4;
								ctx.fillStyle = `rgba(124, 106, 247, ${alpha})`;
								ctx.strokeStyle = `rgba(94, 223, 130, ${alpha * 1.5})`;
								ctx.lineWidth = 0.8;
								
								ctx.beginPath();
								ctx.moveTo(p1.x, p1.y);
								ctx.lineTo(p2.x, p2.y);
								ctx.lineTo(p3.x, p3.y);
								ctx.closePath();
								ctx.fill();
								ctx.stroke();
								} else if (d1 < 55 && d2 < 55 && d3 < 55) {
								ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
								ctx.lineWidth = 0.5;
								ctx.beginPath();
								ctx.moveTo(p1.x, p1.y);
								ctx.lineTo(p2.x, p2.y);
								ctx.lineTo(p3.x, p3.y);
								ctx.closePath();
								ctx.stroke();
							}
						}
					}
				}
			}
		}
		
		// ==========================================
		// 6. LIQUID METAL
		// ==========================================
		else if (mode === 'liquid') {
			const t = performance.now() * 0.001;
			particles.forEach(p => {
				p.phase += 0.008;
				p.x += p.vx + Math.sin(p.phase * 0.7) * 0.4;
				p.y += p.vy + Math.cos(p.phase * 0.5) * 0.4;
				if (p.x < -p.r)
				p.x = canvas.width + p.r;
				if (p.x > canvas.width + p.r)
				p.x = -p.r;
				if (p.y < -p.r)
				p.y = canvas.height + p.r;
				if (p.y > canvas.height + p.r)
				p.y = -p.r;
				
				if (mouse.x > 0) {
					const dx = mouse.x - p.x,
					dy = mouse.y - p.y;
					const dist = Math.hypot(dx, dy);
					if (dist < 260) {
						const f = (1 - dist / 260) * 0.018;
						p.vx += dx * f;
						p.vy += dy * f;
					}
				}
				p.vx *= 0.96;
				p.vy *= 0.96;
				
				const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
				grd.addColorStop(0, `hsla(${p.hue}, 70%, 75%, 0.18)`);
				grd.addColorStop(0.4, `hsla(${p.hue + 30}, 80%, 55%, 0.10)`);
				grd.addColorStop(1, `hsla(${p.hue + 60}, 60%, 30%, 0)`);
				ctx.fillStyle = grd;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fill();
			});
			
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const a = particles[i],
					b = particles[j];
					const dx = b.x - a.x,
					dy = b.y - a.y;
					const dist = Math.hypot(dx, dy);
					const bridge = (a.r + b.r) * 0.75;
					if (dist < bridge) {
						const alpha = (1 - dist / bridge) * 0.35;
						const mx = (a.x + b.x) / 2,
						my = (a.y + b.y) / 2;
						const g = ctx.createRadialGradient(mx, my, 0, mx, my, bridge * 0.5);
						g.addColorStop(0, `hsla(${(a.hue + b.hue) / 2}, 75%, 65%, ${alpha})`);
						g.addColorStop(1, `hsla(${(a.hue + b.hue) / 2}, 60%, 40%, 0)`);
						ctx.fillStyle = g;
						ctx.beginPath();
						ctx.arc(mx, my, bridge * 0.5, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}
		}
		
		// ==========================================
		// 7. AURORA CURTAIN
		// ==========================================
		else if (mode === 'curtain') {
			const t = performance.now() * 0.001;
			const H = canvas.height;
			
			gridPoints.forEach(col => {
				col.phase += col.speed;
				
				if (mouse.x > 0) {
					const dx = mouse.x - col.x;
					if (Math.abs(dx) < 120) {
						col.ripple = (1 - Math.abs(dx) / 120) * 3.0;
						col.rippleY = mouse.y;
					}
				}
				col.ripple *= 0.93;
				
				const segments = 60;
				const segH = H / segments;
				
				for (let s = 0; s < segments; s++) {
					const yTop = s * segH;
					const yBot = yTop + segH + 1;
					const progress = s / segments;
					
					const wave = Math.sin(col.phase + progress * 4.5) * col.amp;
					const rippleWave = col.rippleY > 0
					? Math.sin((yTop - col.rippleY) * 0.03 + t * 4) * col.ripple * 12 * (1 - Math.abs(yTop - col.rippleY) / H)
					: 0;
					
					const xOffset = wave + rippleWave;
					const nextProgress = (s + 1) / segments;
					const nextWave = Math.sin(col.phase + nextProgress * 4.5) * col.amp;
					const nextRipple = col.rippleY > 0
					? Math.sin((yBot - col.rippleY) * 0.03 + t * 4) * col.ripple * 12 * (1 - Math.abs(yBot - col.rippleY) / H)
					: 0;
					const xOffsetNext = nextWave + nextRipple;
					
					const brightness = 0.35 + Math.sin(col.phase + progress * 3) * 0.2;
					const alpha = brightness * (0.4 + Math.sin(col.phase * 1.3 + progress * 2) * 0.25);
					const hShift = Math.sin(col.phase * 0.5 + progress) * 40;
					
					ctx.strokeStyle = `hsla(${col.hue + hShift}, 85%, 65%, ${Math.max(0, alpha)})`;
					ctx.lineWidth = 10;
					ctx.lineCap = 'round';
					ctx.beginPath();
					ctx.moveTo(col.x + xOffset, yTop);
					ctx.lineTo(col.x + xOffsetNext, yBot);
					ctx.stroke();
				}
			});
		}
		
		// ==========================================
		// 8. NEON RAIN
		// ==========================================
		else if (mode === 'neonrain') {
			particles.forEach(p => {
				if (mouse.x > 0) {
					const dx = mouse.x - p.x;
					const dy = mouse.y - p.y;
					const dist = Math.hypot(dx, dy);
					if (dist < 200) {
						const push = (1 - dist / 200) * 3.5;
						p.drift += (-dx / dist) * push * 0.4;
					}
				}
				p.drift *= 0.92;
				p.x += p.drift;
				p.y += p.speed;
				
				if (p.y > canvas.height + p.len) {
					p.y = -p.len - Math.random() * 100;
					p.x = Math.random() * canvas.width;
					p.drift = 0;
				}
				if (p.x < -10)
				p.x = canvas.width + 10;
				if (p.x > canvas.width + 10)
				p.x = -10;
				
				const grd = ctx.createLinearGradient(p.x, p.y - p.len, p.x, p.y);
				grd.addColorStop(0, `hsla(${p.hue}, 100%, 65%, 0)`);
				grd.addColorStop(0.7, `hsla(${p.hue}, 100%, 70%, ${p.alpha * 0.6})`);
				grd.addColorStop(1, `hsla(${p.hue}, 100%, 85%, ${p.alpha})`);
				ctx.strokeStyle = grd;
				ctx.lineWidth = 1.5;
				ctx.lineCap = 'round';
				ctx.shadowColor = `hsl(${p.hue}, 100%, 65%)`;
				ctx.shadowBlur = 6;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y - p.len);
				ctx.lineTo(p.x, p.y);
				ctx.stroke();
				ctx.shadowBlur = 0;
				
				if (Math.random() < 0.004) {
					ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${p.alpha})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
					ctx.fill();
				}
			});
		}
		// ==========================================
		// 9. SAND DUNES
		// ==========================================
		else if (mode === 'sand') {
			const t = performance.now() * 0.0004;
			particles.forEach(p => {
				const windX = Math.sin(t + p.y * 0.004) * 0.5 + 0.3;
				const windY = Math.cos(t * 0.7 + p.x * 0.003) * 0.15;
				
				if (mouse.x > 0) {
					const dx = p.x - mouse.x,
					dy = p.y - mouse.y;
					const dist = Math.hypot(dx, dy);
					if (dist < 180) {
						const blast = (1 - dist / 180) * 5;
						p.vx += (dx / dist) * blast;
						p.vy += (dy / dist) * blast;
					}
				}
				
				p.vx = p.vx * 0.88 + (windX + p.baseVx) * 0.12;
				p.vy = p.vy * 0.88 + windY * 0.12;
				p.x += p.vx;
				p.y += p.vy;
				
				if (p.x < 0)
				p.x = canvas.width;
				if (p.x > canvas.width)
				p.x = 0;
				if (p.y < 0)
				p.y = canvas.height;
				if (p.y > canvas.height)
				p.y = 0;
				
				const speedMag = Math.hypot(p.vx, p.vy);
				const lit = Math.min(1, speedMag * 0.4);
				ctx.fillStyle = `hsla(${p.hue}, 40%, ${30 + lit * 40}%, ${p.alpha})`;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fill();
			});
		}
		
		mouse.vx *= 0.5;
		mouse.vy *= 0.5;
		bgAnimFrame = requestAnimationFrame(loop);
	} // <--- CORRECTLY CLOSES loop()
	
	loop(); // <--- STARTS THE LOOP
} // <--- CORRECTLY CLOSES initInteractiveCanvas()
