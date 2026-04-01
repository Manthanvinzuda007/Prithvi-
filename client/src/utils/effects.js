/**
 * effects.js — Imperative animation triggers for Prithvi effect system
 * All functions create DOM elements, animate them, then clean up.
 */

// prithvi-xp-float: "+N XP 🌱" floats up from a target element
export function triggerXPFloat(targetEl, amount) {
  const el = document.createElement('div');
  el.textContent = `+${amount} XP 🌱`;
  el.className = 'prithvi-xp-float';
  const rect = targetEl
    ? targetEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
  el.style.cssText = `
    position:fixed; z-index:9999; pointer-events:none;
    left:${rect.left + rect.width / 2}px; top:${rect.top}px;
    transform: translateX(-50%);
  `;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// prithvi-confetti-burst: 30 confetti pieces explode outward
export function triggerConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const colors = ['#22c55e', '#fcd34d', '#38bdf8', '#fb7185', '#a78bfa', '#86efac'];
  Array.from({ length: 30 }).forEach((_, i) => {
    const el = document.createElement('div');
    el.className = 'prithvi-confetti-piece';
    const tx = (Math.random() - 0.5) * 300;
    const ty = -(Math.random() * 250 + 50);
    const rot = Math.random() * 720;
    el.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      left:${x}px; top:${y}px;
      width:6px; height:9px; border-radius:2px;
      background:${colors[i % 6]};
      --tx:${tx}px; --ty:${ty}px; --rot:${rot}deg;
      animation: confettiPiece 1.2s ease-out ${i * 0.02}s forwards;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
}

// prithvi-leaf-rain: 20 leaves fall from top
export function triggerLeafRain() {
  const colors = ['#22c55e', '#4ade80', '#86efac', '#fcd34d', '#15803d'];
  Array.from({ length: 20 }).forEach((_, i) => {
    const el = document.createElement('div');
    const size = Math.floor(Math.random() * 8) + 8;
    el.style.cssText = `
      position:fixed; top:-20px; z-index:9999; pointer-events:none;
      left:${Math.random() * 100}vw;
      width:${size}px; height:${size}px;
      background:${colors[i % 5]};
      border-radius:0 100% 0 100%;
      animation: rainLeaf ${1.5 + Math.random() * 1.5}s linear ${i * 0.08}s forwards;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
}

// prithvi-xp-explosion: 3 concentric rings expand outward
export function triggerXPExplosion(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const colors = ['#22c55e', '#fcd34d', '#38bdf8'];
  colors.forEach((color, i) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      width:40px; height:40px; border-radius:50%;
      border:2px solid ${color}; left:${x - 20}px; top:${y - 20}px;
      animation: xpExplosionRing 1s ease-out ${i * 0.3}s forwards;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
}

// prithvi-btn-ripple: Material ripple effect, attach to button on click
export function attachRipple(btn) {
  btn.classList.add('prithvi-btn-ripple');
  btn.addEventListener('click', (e) => {
    const circle = document.createElement('div');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.cssText = `
      width:${diameter}px; height:${diameter}px;
      left:${e.clientX - rect.left - radius}px;
      top:${e.clientY - rect.top - radius}px;
    `;
    circle.className = 'ripple-circle';
    btn.querySelector('.ripple-circle')?.remove();
    btn.appendChild(circle);
  });
}

// Score burst: add/remove class to trigger animation
export function triggerScoreBurst(el) {
  if (!el) return;
  el.classList.remove('prithvi-score-burst');
  void el.offsetWidth; // reflow
  el.classList.add('prithvi-score-burst');
  el.addEventListener('animationend', () => el.classList.remove('prithvi-score-burst'), { once: true });
}

// Badge pop: trigger on newly unlocked badge
export function triggerBadgePop(el) {
  if (!el) return;
  el.classList.remove('prithvi-badge-unlock-pop');
  void el.offsetWidth;
  el.classList.add('prithvi-badge-unlock-pop');
}
