/* ============================================================
   FONTS GUARD — triggers hero entrance animations
   ============================================================ */
(function () {
    function ready() { document.body.classList.add('fonts-loaded'); }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(ready);
    } else {
        document.addEventListener('DOMContentLoaded', ready);
    }
    setTimeout(ready, 1800); // fallback
})();


/* ============================================================
   AURORA BACKGROUND — canvas wave bands
   ============================================================ */
(function () {
    const canvas = document.getElementById('aurora');
    const ctx    = canvas.getContext('2d');
    let W, H, t  = 0;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function waveBand(yBase, amp, freq, speed, rgb, alpha) {
        const pts = [];
        for (let x = 0; x <= W; x += 6) {
            const y = yBase
                + amp * Math.sin(freq * (x / W) * Math.PI * 2 + t * speed)
                + amp * 0.4 * Math.sin(freq * 2 * (x / W) * Math.PI * 2 + t * speed * 0.7);
            pts.push([x, y]);
        }

        const grad = ctx.createLinearGradient(0, yBase - amp * 2, 0, yBase + amp * 4);
        grad.addColorStop(0,   `rgba(${rgb},0)`);
        grad.addColorStop(0.35,`rgba(${rgb},${alpha})`);
        grad.addColorStop(0.65,`rgba(${rgb},${alpha * 0.45})`);
        grad.addColorStop(1,   `rgba(${rgb},0)`);

        ctx.beginPath();
        ctx.moveTo(0, H);
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        t += 0.006;

        const mid = H * 0.26;

        waveBand(mid,            H * 0.13, 2.2, 1.0,  '255,255,255',  0.05);
        waveBand(mid - H * 0.07, H * 0.10, 3.1, 0.75, '200,200,200',  0.04);
        waveBand(mid + H * 0.06, H * 0.11, 1.9, 1.25, '160,160,160',  0.035);
        waveBand(mid - H * 0.13, H * 0.08, 2.6, 0.55, '230,230,230',  0.03);
        waveBand(mid + H * 0.11, H * 0.07, 4.0, 1.55, '120,120,120',  0.025);
        waveBand(mid - H * 0.02, H * 0.06, 5.0, 2.0,  '255,255,255',  0.02);

        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    resize();
    frame();
})();


/* ============================================================
   ROTATING TARGETING CURSOR
   ============================================================ */
const cursorDot   = document.querySelector('[data-cursor-dot]');
const cursorOuter = document.querySelector('[data-cursor-outline]');

window.addEventListener('mousemove', (e) => {
    cursorDot.style.left  = `${e.clientX}px`;
    cursorDot.style.top   = `${e.clientY}px`;

    cursorOuter.animate(
        { left: `${e.clientX}px`, top: `${e.clientY}px` },
        { duration: 420, fill: 'forwards' }
    );
});

window.addEventListener('mousedown', () => {
    cursorOuter.classList.add('is-click');
    setTimeout(() => cursorOuter.classList.remove('is-click'), 250);
});

// Magnetic targets
document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
        el.style.transform = `translate(${dx}px,${dy}px)`;
        cursorOuter.classList.add('is-magnetic');
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        cursorOuter.classList.remove('is-magnetic');
    });
});

// Non-magnetic interactives — subtle expand (nodes, misc buttons)
document.querySelectorAll('button:not([data-magnetic]), a:not([data-magnetic]), .node').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOuter.querySelector('.cursor-sizer').style.transform = 'scale(1.3)';
    });
    el.addEventListener('mouseleave', () => {
        cursorOuter.querySelector('.cursor-sizer').style.transform = '';
    });
});


/* ============================================================
   TYPEWRITER — main (i am ...)
   ============================================================ */
const phrases = [
    'not a skid',
    'reverse engineer',
    'an executor developer',
    'a bypass specialist',
    'building low level tools',
];

function makeTyper(el, list, typingMs, deleteMs, pauseMs) {
    let pi = 0, ci = 0, chars = [], del = false, pausing = false;

    function tick() {
        if (pausing) return; // wait for pause timeout

        el.textContent = chars.join('');

        if (!del && ci < list[pi].length) {
            chars.push(list[pi][ci++]);
        } else if (del && ci > 0) {
            chars.pop(); ci--;
        }

        el.textContent = chars.join('');

        if (!del && ci === list[pi].length) {
            // fully typed — pause then delete
            del = true; pausing = true;
            setTimeout(() => { pausing = false; setTimeout(tick, deleteMs()); }, pauseMs);
            return;
        }

        if (del && ci === 0) {
            chars = []; del = false;
            pi = (pi + 1) % list.length;
        }

        setTimeout(tick, del ? deleteMs() : typingMs());
    }

    setTimeout(tick, 600);
}

const twEl = document.getElementById('typewriter-text');
makeTyper(
    twEl,
    phrases,
    () => 38 + Math.random() * 18,   // typing:  38–56 ms
    () => 22 + Math.random() * 12,   // deleting: 22–34 ms
    1300                              // pause after complete phrase
);


/* ============================================================
   GLITCH EFFECT
   ============================================================ */
const glitchEl = document.querySelector('.glitch-text');

function glitch() {
    if (!glitchEl) return;
    glitchEl.classList.add('is-glitching');
    setTimeout(() => glitchEl.classList.remove('is-glitching'), 340);
}

function scheduleGlitch() {
    setTimeout(() => {
        glitch();
        if (Math.random() > 0.55) setTimeout(glitch, 140);
        scheduleGlitch();
    }, 4000 + Math.random() * 7000);
}
scheduleGlitch();


/* ============================================================
   ONE-LINER — second typewriter below the main one
   ============================================================ */
const oneLiners = [
    'building stable execution environments',
    'probably debugging something low-level right now',
    'reverse engineering anti-tamper systems since 2023',
];

const olEl = document.getElementById('one-liner-text');
makeTyper(
    olEl,
    oneLiners,
    () => 32 + Math.random() * 14,   // typing:  32–46 ms (faster than main)
    () => 16 + Math.random() * 10,   // deleting: 16–26 ms
    2200                              // longer pause so it reads fully
);


/* ============================================================
   LOCAL TIME
   ============================================================ */
function updateTime() {
    const now  = new Date();
    let h      = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const pad  = n => String(n).padStart(2, '0');
    document.getElementById('local-time').textContent =
        `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
}
setInterval(updateTime, 1000);
updateTime();


/* ============================================================
   MOCK VIEW COUNTER
   ============================================================ */
let views = 2943;
const vEl = document.getElementById('view-count');
setInterval(() => {
    if (Math.random() > 0.7) {
        views += Math.floor(Math.random() * 3) + 1;
        vEl.textContent = views.toLocaleString();
    }
}, 5000);


/* ============================================================
   SCROLL REVEAL
   ============================================================ */
if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-item').forEach(el => obs.observe(el));

    const tagsEl = document.querySelector('.skills-tags');
    if (tagsEl) {
        const tagsObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('is-visible'); tagsObs.unobserve(e.target); }
            });
        }, { threshold: 0.25 });
        tagsObs.observe(tagsEl);
    }
} else {
    document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('is-visible'));
    const t = document.querySelector('.skills-tags');
    if (t) t.classList.add('is-visible');
}


/* ============================================================
   TIMELINE / PROJECTS — single entry
   ============================================================ */
const projects = [
    {
        title:   'project mark',
        role:    'Creator',
        date:    '2025 – Present',
        link:    'https://github.com/vasuxd3v/project-mark',
        desc:    'A personal project exploring deep systems-level work, custom tooling, and unconventional engineering. Built entirely from scratch.',
    },
];

const nodesEl   = document.getElementById('timeline-nodes');
const expTitle  = document.getElementById('exp-title');
const expCo     = document.getElementById('exp-company');
const expDate   = document.getElementById('exp-date');
const expLink   = document.getElementById('exp-link');
const expDesc   = document.getElementById('exp-desc');
const expCur    = document.getElementById('exp-current');
const prevBtn   = document.getElementById('prev-btn');
const nextBtn   = document.getElementById('next-btn');
let activeIdx   = 0;

projects.forEach((p, i) => {
    const node = document.createElement('div');
    node.className = 'node' + (i === 0 ? ' active' : '');
    node.innerHTML = `<div class="node-dot"></div>
        <div class="node-label">${p.title.substring(0, 12)}${p.title.length > 12 ? '..' : ''}</div>`;
    node.addEventListener('click', () => setActive(i));
    nodesEl.appendChild(node);
});

function setActive(idx) {
    document.querySelectorAll('.node').forEach((n, i) =>
        n.classList.toggle('active', i === idx));

    const p   = projects[idx];
    const card = document.querySelector('.experience-card');
    card.style.animation = 'none';
    card.offsetHeight;

    expTitle.textContent = p.role;
    expCo.textContent    = p.title;
    expDate.textContent  = p.date;
    expLink.href         = p.link;
    expDesc.textContent  = p.desc;
    expCur.textContent   = `${idx + 1}/${projects.length}`;
    card.style.animation = 'fadeUp 0.4s forwards ease-out';
    activeIdx = idx;
}

setActive(0);

prevBtn.addEventListener('click', () => { if (activeIdx > 0) setActive(activeIdx - 1); });
nextBtn.addEventListener('click', () => { if (activeIdx < projects.length - 1) setActive(activeIdx + 1); });


/* ============================================================
   SCROLL DOWN
   ============================================================ */
document.getElementById('scroll-down-btn').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});


