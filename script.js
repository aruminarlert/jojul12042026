let highestZ = 1;
const resetters = [];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- bling-bling ---------- */
const glyphs = ['✦', '✧', '♥', '★'];
const colors = ['#ff7fb0', '#ffc94d', '#8fcf6a', '#ff5fa2'];
let live = 0;
let lastSpark = 0;

function spark(x, y, spread = 30, fall = 140, dur = 900) {
  if (reduce || live > 45) return;
  const s = document.createElement('span');
  s.className = 'sp';
  s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
  s.style.cssText =
    `left:${x}px;top:${y}px;color:${colors[(Math.random() * colors.length) | 0]};` +
    `font-size:${10 + Math.random() * 12}px;` +
    `--dx:${(Math.random() - 0.5) * spread * 2}px;` +
    `--dy:${fall * (0.6 + Math.random() * 0.8)}px;` +
    `animation-duration:${dur}ms`;
  live++;
  s.addEventListener('animationend', () => { s.remove(); live--; });
  document.body.appendChild(s);
}

// hujan kilau pelan dari atas layar
setInterval(() => {
  if (!document.hidden) {
    spark(Math.random() * window.innerWidth, -10, 25, window.innerHeight * 0.8, 4500 + Math.random() * 2000);
  }
}, 700);

/* ---------- musik ---------- */
const music = new Audio('./lovefool.mp3');
music.loop = true;
music.volume = 0.6;
const musicBtn = document.getElementById('music');
let musicOn = false;

function playMusic() {
  music.play().then(() => {
    musicOn = true;
    musicBtn.classList.remove('off');
  }).catch(() => {});
}
// browser hanya mengizinkan audio setelah ada sentuhan pertama
function firstTouch(e) {
  if (e.target.closest('#music')) return;
  document.removeEventListener('pointerdown', firstTouch);
  playMusic();
}
document.addEventListener('pointerdown', firstTouch);

musicBtn.addEventListener('click', () => {
  document.removeEventListener('pointerdown', firstTouch);
  if (musicOn) {
    music.pause();
    musicOn = false;
    musicBtn.classList.add('off');
  } else {
    playMusic();
  }
});

document.querySelectorAll('.paper').forEach((paper) => {
  let x = 0, y = 0;
  let startX = 0, startY = 0, originX = 0, originY = 0;
  let dragging = false;
  const rot = (Math.random() * 16 - 8).toFixed(1);

  const draw = () => {
    paper.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg)`;
  };
  draw();

  resetters.push(() => {
    x = 0;
    y = 0;
    paper.style.zIndex = '';
    draw();
  });

  paper.addEventListener('pointerdown', (e) => {
    if (dragging || e.target.closest('a')) return;
    dragging = true;
    paper.setPointerCapture(e.pointerId);
    paper.style.zIndex = ++highestZ;
    paper.classList.add('drag');
    startX = e.clientX;
    startY = e.clientY;
    originX = x;
    originY = y;
    const n = paper.classList.contains('heart') ? 14 : 6;
    for (let i = 0; i < n; i++) spark(e.clientX, e.clientY, 60, 170, 1000);
  });

  paper.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    // batas agar kertas tidak keluar dari layar
    const limX = window.innerWidth / 2;
    const limY = window.innerHeight / 2;
    x = Math.max(-limX, Math.min(limX, originX + e.clientX - startX));
    y = Math.max(-limY, Math.min(limY, originY + e.clientY - startY));
    draw();
    const now = performance.now();
    if (now - lastSpark > 60) {
      lastSpark = now;
      spark(e.clientX, e.clientY);
    }
  });

  const stop = () => {
    dragging = false;
    paper.classList.remove('drag');
  };
  paper.addEventListener('pointerup', stop);
  paper.addEventListener('pointercancel', stop);
  paper.addEventListener('contextmenu', (e) => e.preventDefault());
});

document.getElementById('reset').addEventListener('click', () => {
  highestZ = 1;
  resetters.forEach((fn) => fn());
});