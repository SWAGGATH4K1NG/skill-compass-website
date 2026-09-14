// Theme toggle (dark by default, choice remembered per browser)
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
function paintThemeButton() {
  const dark = root.dataset.theme !== 'light';
  themeBtn.innerHTML = `<i class="ph ${dark ? 'ph-sun' : 'ph-moon'}"></i>`;
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  paintThemeButton();
});
paintThemeButton();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Terminal output: each line becomes a block, so a wrapped line keeps a hanging indent.
function lineHTML(line) {
  const indent = line.match(/^ */)[0].length;
  return `<span class="ln" style="--in:${indent}">${line || ' '}</span>`;
}
function renderLines(el, lines) {
  clearInterval(el.typer);
  el.classList.remove('is-typing');
  el.innerHTML = lines.map(lineHTML).join('');
}
// Prints lines one at a time (all at once under reduced motion), then calls done.
function typeLines(el, lines, done) {
  if (reduceMotion) {
    renderLines(el, lines);
    if (done) done();
    return;
  }
  clearInterval(el.typer);
  el.innerHTML = '';
  el.classList.add('is-typing');
  let i = 0;
  el.typer = setInterval(() => {
    el.insertAdjacentHTML('beforeend', lineHTML(lines[i]));
    i += 1;
    if (i === lines.length) {
      clearInterval(el.typer);
      el.classList.remove('is-typing');
      if (done) done();
    }
  }, 55);
}

// Hero console: pick a question, print its real output
const demoBtns = [...document.querySelectorAll('.ask-btn')];
const demoOut = document.getElementById('demo-out');
const demoQ = document.getElementById('demo-q');
const demoNote = document.getElementById('demo-note');
const demoStatus = document.getElementById('demo-status');
// The first answer ships pre-rendered in the HTML and is not retyped on load (keeps LCP fast).
renderLines(demoOut, demoOut.innerHTML.split('\n'));
// Screen readers get the whole answer once it has finished printing, not line by line.
function runDemo(btn) {
  demoBtns.forEach((b) => b.setAttribute('aria-pressed', b === btn));
  demoQ.textContent = btn.textContent;
  demoNote.textContent = btn.dataset.note;
  demoStatus.textContent = '';
  const template = document.getElementById(btn.dataset.demo);
  typeLines(demoOut, template.innerHTML.split('\n'), () => {
    demoStatus.textContent = `${btn.textContent} ${template.content.textContent}`;
  });
}
demoBtns.forEach((btn) => btn.addEventListener('click', () => runDemo(btn)));

// Comparison: both answers print like the hero console, on first view and on each tab change
const sideSources = new Map();
document.querySelectorAll('.side pre').forEach((pre) => {
  const lines = pre.innerHTML.split('\n');
  sideSources.set(pre, lines);
  renderLines(pre, lines);
});
function playPanel(panel) {
  panel.querySelectorAll('.side').forEach((side) => {
    const pre = side.querySelector('pre');
    const list = side.querySelector('ul');
    if (!reduceMotion) list.classList.add('is-pending');
    typeLines(pre, sideSources.get(pre), () => list.classList.remove('is-pending'));
  });
}
let panelWatcher;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const firstPanel = document.querySelector('.panel:not([hidden])');
  firstPanel.querySelectorAll('.side').forEach((side) => {
    side.querySelector('pre').innerHTML = '';
    side.querySelector('ul').classList.add('is-pending');
  });
  panelWatcher = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    panelWatcher.disconnect();
    playPanel(firstPanel);
  }, { threshold: 0.2 });
  panelWatcher.observe(firstPanel);
}

// Nav Install button: show it once the hero buttons have scrolled away
const navInstall = document.querySelector('.nav-install');
const heroCta = document.querySelector('.hero-cta');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    navInstall.classList.toggle('is-shown', !entry.isIntersecting && entry.boundingClientRect.top < 0);
  }).observe(heroCta);
} else {
  navInstall.classList.add('is-shown');
}

// Nav: mark the link of the section crossing the middle of the viewport
const navLinks = new Map(
  [...document.querySelectorAll('.nav-links a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a])
);
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a, id) => {
        const on = id === entry.target.id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -54% 0px' });
  document.querySelectorAll('body > header, body > section, body > footer').forEach((el) => spy.observe(el));
}

// Tabs
const tabs = [...document.querySelectorAll('[role="tab"]')];
function select(tab) {
  if (panelWatcher) panelWatcher.disconnect();
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) playPanel(panel);
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', (e) => {
    const moves = { ArrowRight: i + 1, ArrowLeft: i - 1 + tabs.length, Home: 0, End: tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = tabs[moves[e.key] % tabs.length];
    select(next);
    next.focus();
  });
});

// Install: show the command for the visitor's OS (Windows gets --copy)
const osBtns = [...document.querySelectorAll('.os-btn')];
function selectOS(os) {
  osBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.os === os));
  document.querySelectorAll('[data-os-panel]').forEach((el) => {
    el.hidden = el.dataset.osPanel !== os;
  });
}
osBtns.forEach((b) => b.addEventListener('click', () => selectOS(b.dataset.os)));
const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.userAgent;
if (/win/i.test(platform)) selectOS('win');

// Copy buttons
document.querySelectorAll('.copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Select and copy';
    }
    setTimeout(() => (btn.textContent = 'Copy'), 1600);
  });
});

// Stagger groups: each child reveals a beat after the previous one
document.querySelectorAll('.stagger').forEach((group) => {
  [...group.children].forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--i', i);
  });
});

// Reveal sections as they scroll into view
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}
