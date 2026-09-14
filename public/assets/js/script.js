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

// Hero console: pick a question, print its real output line by line
const demoBtns = [...document.querySelectorAll('.ask-btn')];
const demoOut = document.getElementById('demo-out');
const demoQ = document.getElementById('demo-q');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let demoTimer;
function runDemo(btn) {
  demoBtns.forEach((b) => b.setAttribute('aria-pressed', b === btn));
  demoQ.textContent = btn.textContent;
  const lines = document.getElementById(btn.dataset.demo).innerHTML.split('\n');
  clearInterval(demoTimer);
  if (reduceMotion) {
    demoOut.innerHTML = lines.join('\n');
    return;
  }
  demoOut.innerHTML = '';
  demoOut.setAttribute('aria-busy', 'true');
  let i = 0;
  demoTimer = setInterval(() => {
    demoOut.insertAdjacentHTML('beforeend', (i ? '\n' : '') + lines[i]);
    i += 1;
    if (i === lines.length) {
      clearInterval(demoTimer);
      demoOut.removeAttribute('aria-busy');
    }
  }, 55);
}
demoBtns.forEach((btn) => btn.addEventListener('click', () => runDemo(btn)));
if (!reduceMotion) setTimeout(() => runDemo(demoBtns[0]), 500);

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
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    select(next);
    next.focus();
  });
});

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
