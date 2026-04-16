/* ============================================================
   Dough Pro Max — app.js
   All percentages are baker's percentages (relative to flour)
   ============================================================ */

'use strict';

// ── Formula Constants ─────────────────────────────────────────
const BASE_PIZZA_SIZE = 16;
const BASE_QUANTITY   = 6;
const BASE_THICKNESS  = 2.11;  // Regular

// Calibrated base flour (regular): gives 480g/ball at 6×16" regular
const BASE_FLOUR_REGULAR = 1509.797685 * (480 / 425);
// Calibrated base flour (gluten-free)
const BASE_FLOUR_GF      = 333 * 6;
// Dough factor: total dough ÷ flour at baseline
const DOUGH_FACTOR       = 2550 / 1509.797685;

// Numeric thickness values for each discrete option
const THICKNESS_VALUES = {
  thin:    1.8,
  regular: 2.11,
  thick:   2.75,
};

// Baker's percentages
const WATER_PCT    = 0.62;
const GF_WATER_PCT = 0.80;
const YEAST_PCT    = 0.004;
const SALT_PCT     = 0.025;
const SUGAR_PCT    = 0.02;   // 2%
const OIL_PCT      = 0.033;

// ── Quantity Limits (declared early for use in loadState) ─────
const QTY_MIN = 1;
const QTY_MAX = 12;

// ── State ─────────────────────────────────────────────────────
const state = {
  glutenFree: false,
  quantity:   4,
  size:       12,    // inches
  thickness:  'regular',
};

// ── Persistence ───────────────────────────────────────────────
const STORAGE_KEY = 'doughCalcState';

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      quantity:   state.quantity,
      size:       state.size,
      thickness:  state.thickness,
      glutenFree: state.glutenFree,
      wtStep:     wtIsOpen ? wtStep : null,
    }));
  } catch (e) { /* storage unavailable */ }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return null;
    if (saved.quantity   != null) state.quantity   = Math.min(Math.max(Number(saved.quantity), QTY_MIN), QTY_MAX);
    if (saved.size       != null) state.size        = Number(saved.size);
    if (saved.thickness  != null) state.thickness   = saved.thickness;
    if (saved.glutenFree != null) state.glutenFree  = Boolean(saved.glutenFree);
    return (saved.wtStep != null) ? Number(saved.wtStep) : null;
  } catch (e) {
    return null;
  }
}

// ── DOM References ─────────────────────────────────────────────
const els = {
  // Controls
  gfToggle:    document.getElementById('gf-toggle'),
  qtyDec:      document.getElementById('qty-dec'),
  qtyInc:      document.getElementById('qty-inc'),
  qtyDisplay:  document.getElementById('qty-display'),
  sizeSlider:  document.getElementById('size-slider'),
  sizeOutput:  document.getElementById('size-output'),
  sizeFill:    document.getElementById('size-fill'),
  sizeThumb:   document.getElementById('size-thumb'),
  thickGroup:  document.getElementById('thickness-group'),
  segIndicator: document.getElementById('seg-indicator'),

  // Results
  totalG:   document.getElementById('total-g'),
  ballWt:   document.getElementById('ball-weight'),
  flourG:   document.getElementById('flour-g'),
  flourOz:  document.getElementById('flour-oz'),
  waterG:   document.getElementById('water-g'),
  waterOz:  document.getElementById('water-oz'),
  saltG:    document.getElementById('salt-g'),
  saltOz:   document.getElementById('salt-oz'),
  yeastG:   document.getElementById('yeast-g'),
  yeastOz:  document.getElementById('yeast-oz'),
  oilG:     document.getElementById('oil-g'),
  oilOz:    document.getElementById('oil-oz'),
  sugarG:   document.getElementById('sugar-g'),
  sugarOz:  document.getElementById('sugar-oz'),

  // Instruction step values
  svWater: document.getElementById('sv-water'),
  svYeast: document.getElementById('sv-yeast'),
  svFlour: document.getElementById('sv-flour'),
  svOil:   document.getElementById('sv-oil'),
  svSugar: document.getElementById('sv-sugar'),
  svSalt:  document.getElementById('sv-salt'),
  svQty:   document.getElementById('sv-qty'),
  svBall:  document.getElementById('sv-ball'),

  // Walkthrough
  openWalkthrough: document.getElementById('open-walkthrough'),
  walkthrough:     document.getElementById('walkthrough'),
  wtClose:         document.getElementById('wt-close'),
  wtBack:          document.getElementById('wt-back'),
  wtNext:          document.getElementById('wt-next'),
  wtTitle:         document.getElementById('wt-title'),
  wtBody:          document.getElementById('wt-body'),
  wtIllustration:  document.getElementById('wt-illustration'),
  wtDots:          document.getElementById('wt-dots'),
  wtCount:         document.getElementById('wt-count'),
};

// ── Calculation Engine ─────────────────────────────────────────
function calculate() {
  const { glutenFree, quantity, size, thickness } = state;

  const pizzaThickness = THICKNESS_VALUES[thickness];
  const baseFlour      = glutenFree ? BASE_FLOUR_GF      : BASE_FLOUR_REGULAR;
  const waterPct       = glutenFree ? GF_WATER_PCT       : WATER_PCT;

  const sizeScale      = Math.pow(size / BASE_PIZZA_SIZE, 2);
  const qtyScale       = quantity / BASE_QUANTITY;
  const thicknessScale = pizzaThickness / BASE_THICKNESS;

  const flour = baseFlour * sizeScale * qtyScale * thicknessScale;
  const water = flour * waterPct;
  const yeast = flour * YEAST_PCT;
  const salt  = flour * SALT_PCT;
  const sugar = flour * SUGAR_PCT;
  const oil   = flour * OIL_PCT;

  const totalDough = flour * DOUGH_FACTOR;
  const ballWeight = totalDough / quantity;

  return { totalDough, ballWeight, flour, water, yeast, salt, oil, sugar };
}

// ── Formatting Helpers ─────────────────────────────────────────
function toG(val, decimals = 0) {
  return decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
}

function toOz(g) {
  return (g * 0.03527).toFixed(1) + ' oz';
}

function formatBallWeight(g, oz) {
  return `${Math.round(g)}g per ball · ${(g * 0.03527).toFixed(1)} oz`;
}

// ── UI Update ──────────────────────────────────────────────────
function updateUI(results) {
  const { totalDough, ballWeight, flour, water, yeast, salt, oil, sugar } = results;

  // Helper: set text and trigger pop animation
  function set(el, text) {
    if (!el) return;
    const prev = el.textContent;
    if (prev === text) return;
    el.textContent = text;
    el.classList.remove('value-updated');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('value-updated');
  }

  set(els.totalG,  toG(totalDough));
  set(els.ballWt,  formatBallWeight(ballWeight, (ballWeight * 0.03527).toFixed(1)));

  set(els.flourG,  toG(flour));
  set(els.flourOz, toOz(flour));

  set(els.waterG,  toG(water));
  set(els.waterOz, toOz(water));

  set(els.saltG,   toG(salt, 1));
  set(els.saltOz,  toOz(salt));

  set(els.yeastG,  toG(yeast, 1));
  set(els.yeastOz, toOz(yeast));

  set(els.oilG,    toG(oil, 1));
  set(els.oilOz,   toOz(oil));

  set(els.sugarG,  toG(sugar, 1));
  set(els.sugarOz, toOz(sugar));

  // Instruction step values
  if (els.svWater) els.svWater.textContent = `${toG(water)}g`;
  if (els.svYeast) els.svYeast.textContent = `${toG(yeast, 1)}g`;
  if (els.svFlour) els.svFlour.textContent = `${toG(flour)}g`;
  if (els.svOil)   els.svOil.textContent   = `${toG(oil, 1)}g`;
  if (els.svSugar) els.svSugar.textContent = `${toG(sugar, 1)}g`;
  if (els.svSalt)  els.svSalt.textContent  = `${toG(salt, 1)}g`;
  if (els.svQty)   els.svQty.textContent   = `${state.quantity}`;
  if (els.svBall)  els.svBall.textContent  = `${Math.round(ballWeight)}g`;

  // Re-render walkthrough if open
  if (wtIsOpen) renderStep();
}

function recalculate() {
  const results = calculate();
  updateUI(results);
}

// ── Slider Sync ────────────────────────────────────────────────
function syncSlider() {
  const slider = els.sizeSlider;
  const min    = Number(slider.min);
  const max    = Number(slider.max);
  const val    = Number(slider.value);
  const pct    = (val - min) / (max - min);

  els.sizeFill.style.width  = `${pct * 100}%`;
  els.sizeThumb.style.left  = `${pct * 100}%`;
  els.sizeOutput.textContent = `${val}"`;

  // Update ARIA
  slider.setAttribute('aria-valuenow',  val);
  slider.setAttribute('aria-valuetext', `${val} inches`);
}

// ── Gluten Free Toggle ─────────────────────────────────────────
els.gfToggle.addEventListener('click', () => {
  state.glutenFree = !state.glutenFree;
  els.gfToggle.setAttribute('aria-checked', String(state.glutenFree));
  recalculate();
  saveState();
});

els.gfToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    els.gfToggle.click();
  }
});

// ── Quantity Stepper ──────────────────────────────────────────
function updateQtyButtons() {
  els.qtyDec.disabled = state.quantity <= QTY_MIN;
  els.qtyInc.disabled = state.quantity >= QTY_MAX;
  els.qtyDec.setAttribute('aria-disabled', String(state.quantity <= QTY_MIN));
  els.qtyInc.setAttribute('aria-disabled', String(state.quantity >= QTY_MAX));
}

function setQuantity(val) {
  const clamped = Math.min(QTY_MAX, Math.max(QTY_MIN, val));
  if (clamped === state.quantity) return;
  state.quantity = clamped;

  // Bump animation on the value display
  els.qtyDisplay.textContent = String(clamped);
  els.qtyDisplay.classList.remove('bump');
  void els.qtyDisplay.offsetWidth;
  els.qtyDisplay.classList.add('bump');
  setTimeout(() => els.qtyDisplay.classList.remove('bump'), 300);

  updateQtyButtons();
  recalculate();
  saveState();
}

els.qtyDec.addEventListener('click', () => setQuantity(state.quantity - 1));
els.qtyInc.addEventListener('click', () => setQuantity(state.quantity + 1));

// Keyboard: hold down for rapid increment
let holdTimer = null;
let holdInterval = null;

function startHold(direction) {
  holdTimer = setTimeout(() => {
    holdInterval = setInterval(() => setQuantity(state.quantity + direction), 80);
  }, 400);
}

function stopHold() {
  clearTimeout(holdTimer);
  clearInterval(holdInterval);
  holdTimer = null;
  holdInterval = null;
}

[els.qtyDec, els.qtyInc].forEach((btn, i) => {
  const dir = i === 0 ? -1 : 1;
  btn.addEventListener('mousedown',  () => startHold(dir));
  btn.addEventListener('touchstart', () => startHold(dir), { passive: true });
  btn.addEventListener('mouseup',    stopHold);
  btn.addEventListener('mouseleave', stopHold);
  btn.addEventListener('touchend',   stopHold);
});

// ── Pizza Size Slider ──────────────────────────────────────────
els.sizeSlider.addEventListener('input', () => {
  state.size = Number(els.sizeSlider.value);
  syncSlider();
  recalculate();
  saveState();
});

// Arrow-key enhancement (native range already handles this,
// but we sync visual and state explicitly)
els.sizeSlider.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 2 : 1;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault();
    els.sizeSlider.value = Math.max(Number(els.sizeSlider.min), Number(els.sizeSlider.value) - step);
    els.sizeSlider.dispatchEvent(new Event('input'));
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault();
    els.sizeSlider.value = Math.min(Number(els.sizeSlider.max), Number(els.sizeSlider.value) + step);
    els.sizeSlider.dispatchEvent(new Event('input'));
  }
});

// ── Thickness Segmented Control ────────────────────────────────
const segBtns = Array.from(els.thickGroup.querySelectorAll('.seg-btn'));

function positionIndicator() {
  const activeBtn = segBtns.find(b => b.dataset.value === state.thickness);
  if (!activeBtn || !els.segIndicator) return;
  els.segIndicator.style.width = `${activeBtn.offsetWidth}px`;
  // offsetLeft includes the 6px container padding; subtract so indicator sits at left:6px origin
  els.segIndicator.style.transform = `translateX(${activeBtn.offsetLeft - 6}px)`;
}

function setThickness(value) {
  if (state.thickness === value) return;
  state.thickness = value;
  segBtns.forEach((btn) => {
    const isActive = btn.dataset.value === value;
    btn.setAttribute('aria-checked', String(isActive));
    btn.classList.toggle('seg-btn--active', isActive);
    btn.tabIndex = isActive ? 0 : -1;
  });
  positionIndicator();
  recalculate();
  saveState();
}

segBtns.forEach(btn => btn.addEventListener('click', () => setThickness(btn.dataset.value)));

els.thickGroup.addEventListener('keydown', (e) => {
  const current = segBtns.findIndex(b => b.dataset.value === state.thickness);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    const next = segBtns[(current + 1) % segBtns.length];
    setThickness(next.dataset.value);
    next.focus();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = segBtns[(current - 1 + segBtns.length) % segBtns.length];
    setThickness(next.dataset.value);
    next.focus();
  }
});

// ── Walkthrough ────────────────────────────────────────────────
const WALKTHROUGH_STEPS = [
  {
    img: 'assets/icons/Thermometer.png',
    title: 'Chill Your Water',
    getBody: (r) => `You need <strong>${toG(r.water)}g</strong> of water cooled to below <strong>60°F (15°C)</strong>. Cold water slows yeast activity during mixing so the dough doesn't over-ferment. Use a thermometer if you have one — tap-cold is usually fine.`,
  },
  {
    img: 'assets/icons/Whisk.png',
    title: 'Dissolve the Yeast',
    getBody: (r) => `Pour your cold water into a bowl and sprinkle in <strong>${toG(r.yeast, 1)}g</strong> of active dry yeast. Stir gently for about 30 seconds until dissolved. No blooming needed — it activates in the cold.`,
  },
  {
    img: 'assets/icons/FlourOil.png',
    title: 'Add Flour & Olive Oil',
    getBody: (r) => `Add <strong>${toG(r.flour)}g</strong> of flour and <strong>${toG(r.oil, 1)}g</strong> of olive oil to the water-yeast mixture. Mix on low for 2 minutes until a shaggy dough forms. Don't over-mix yet.`,
  },
  {
    img: 'assets/icons/SaltSugar.png',
    title: 'Add Sugar & Salt',
    getBody: (r) => `While still on low, sprinkle in <strong>${toG(r.sugar, 1)}g</strong> of sugar and <strong>${toG(r.salt, 1)}g</strong> of salt. Adding salt after the flour prevents it from directly contacting and killing the yeast.`,
  },
  {
    img: 'assets/icons/Mixer.png',
    title: 'Mix Until Smooth',
    getBody: () => `Increase to medium and mix for <strong>10 minutes</strong> until the dough is smooth, elastic, and pulls cleanly away from the sides. It should feel soft but not sticky. This builds the gluten structure.`,
  },
  {
    img: 'assets/icons/Rest.png',
    title: 'Rest the Dough',
    getBody: () => `Cover the bowl tightly with plastic wrap and let the dough rest at room temperature for <strong>1–3 hours</strong>. It will puff slightly. This first rest relaxes the gluten and improves extensibility.`,
  },
  {
    img: 'assets/icons/Scale.png',
    title: 'Divide Into Balls',
    getBody: (r) => `Turn the dough onto a clean surface and divide evenly into <strong>${r.qty} pieces</strong>, each about <strong>${Math.round(r.ballWeight)}g</strong>. Use a kitchen scale for accuracy. Shape each piece into a tight ball by pulling the surface taut and pinching the seam underneath.`,
  },
  {
    img: 'assets/icons/Jar.png',
    title: 'Into Oiled Containers',
    getBody: () => `Place each dough ball into a lightly oiled container — a deli container or small bowl works great. Coat the top of each ball with a thin film of oil so it doesn't dry out, then cover tightly with a lid or plastic wrap.
      <div class="bonus-tip" role="note" style="margin-top:1rem;">
        <span class="bonus-tip__label"><img src="assets/icons/Lightbulb.png" alt="" class="tip-icon"> Pro Tip</span>
        <p class="bonus-tip__text">Want to freeze dough for later? Instead of a container, lightly oil each ball, wrap tightly in plastic wrap, and place in the freezer. When ready to use, remove the plastic wrap, place in a lightly oiled container, and move to the fridge for <strong>3 days</strong> before baking.</p>
      </div>`,
  },
  {
    img: 'assets/icons/Fridge.png',
    title: 'Cold Ferment',
    getBody: () => `Refrigerate for <strong>1–3 days</strong>. This slow cold ferment is where the magic happens — yeast develops complex flavor and the gluten relaxes for an open, airy crumb. <strong>3 days is the sweet spot.</strong>`,
  },
  {
    img: 'assets/icons/Bake.png',
    title: 'Ready to Bake',
    getBody: () => `Pull the dough out of the fridge and rest at room temperature for <strong>3–4 hours</strong> before baking — cold dough tears instead of stretches.
      <div class="bonus-tip" role="note" style="margin-top:1rem;">
        <span class="bonus-tip__label"><img src="assets/icons/Lightbulb.png" alt="" class="tip-icon"> Pro Tip</span>
        <p class="bonus-tip__text">Preheat a baking steel in your oven at <strong>525°F</strong> for at least 45 minutes. In the last 2–3 minutes, switch to broil for a charred, pizzeria-style top.</p>
      </div>`,
  },
];

let wtStep   = 0;
let wtIsOpen = false;

function renderStep() {
  const step = WALKTHROUGH_STEPS[wtStep];
  const r    = calculate(); // always live — never stale

  // Illustration — render inside the neumorphic ring
  els.wtIllustration.innerHTML = `<div class="wt-illus-ring"><img src="${step.img}" alt="" style="width:60%;height:60%;object-fit:contain;"></div>`;

  // Title & body
  els.wtTitle.textContent = step.title;
  els.wtBody.innerHTML    = step.getBody({ ...r, qty: state.quantity });

  // Step count
  els.wtCount.textContent = `Step ${wtStep + 1} of ${WALKTHROUGH_STEPS.length}`;

  // Dots
  Array.from(els.wtDots.children).forEach((dot, i) => {
    dot.classList.toggle('is-active', i === wtStep);
  });

  // Nav button states
  els.wtBack.disabled = false;
  els.wtBack.setAttribute('aria-disabled', 'false');
  els.wtNext.textContent = wtStep === WALKTHROUGH_STEPS.length - 1 ? 'Done' : 'Next';
}

function openWalkthrough() {
  wtStep   = 0;
  wtIsOpen = true;
  els.walkthrough.classList.add('is-open');
  els.walkthrough.removeAttribute('aria-hidden');
  renderStep();
  // Move focus to dialog container (not a button) so no button gets a focus ring
  // unless the user is actively keyboarding
  els.walkthrough.focus({ preventScroll: true });
  // Trap body scroll
  document.body.style.overflow = 'hidden';
}

function closeWalkthrough() {
  wtIsOpen = false;
  els.walkthrough.classList.remove('is-open');
  els.walkthrough.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  els.openWalkthrough.focus();
  saveState(); // clears saved wtStep (wtIsOpen is now false)
}

// Build dots once
(function buildDots() {
  WALKTHROUGH_STEPS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'wt-dot' + (i === 0 ? ' is-active' : '');
    els.wtDots.appendChild(dot);
  });
})();

els.openWalkthrough.addEventListener('click', openWalkthrough);

els.wtClose.addEventListener('click', closeWalkthrough);

els.wtNext.addEventListener('click', () => {
  if (wtStep < WALKTHROUGH_STEPS.length - 1) {
    wtStep++;
    renderStep();
    saveState();
  } else {
    closeWalkthrough();
  }
});

els.wtBack.addEventListener('click', () => {
  if (wtStep > 0) {
    wtStep--;
    renderStep();
    saveState();
  } else {
    closeWalkthrough();
  }
});

// Close on Escape, arrow-key navigation
els.walkthrough.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeWalkthrough(); return; }
  if (e.key === 'ArrowRight' && wtStep < WALKTHROUGH_STEPS.length - 1) { wtStep++; renderStep(); saveState(); }
  if (e.key === 'ArrowLeft'  && wtStep > 0)                             { wtStep--; renderStep(); saveState(); }
});

// Swipe left/right navigation
let _swipeStartX = null;
els.walkthrough.addEventListener('touchstart', (e) => {
  _swipeStartX = e.touches[0].clientX;
}, { passive: true });

els.walkthrough.addEventListener('touchend', (e) => {
  if (_swipeStartX === null) return;
  const dx = e.changedTouches[0].clientX - _swipeStartX;
  _swipeStartX = null;
  if (Math.abs(dx) < 50) return; // ignore small movements
  if (dx < 0 && wtStep < WALKTHROUGH_STEPS.length - 1) { wtStep++; renderStep(); saveState(); }
  else if (dx < 0 && wtStep === WALKTHROUGH_STEPS.length - 1) { closeWalkthrough(); }
  else if (dx > 0 && wtStep > 0)                              { wtStep--; renderStep(); saveState(); }
  else if (dx > 0 && wtStep === 0)                            { closeWalkthrough(); }
}, { passive: true });

// ── Init ───────────────────────────────────────────────────────
function init() {
  // Restore persisted state before syncing UI
  const savedWtStep = loadState();

  // Sync DOM inputs from (possibly restored) state
  els.sizeSlider.value = state.size;
  els.qtyDisplay.textContent = String(state.quantity);
  els.gfToggle.setAttribute('aria-checked', String(state.glutenFree));

  syncSlider();
  updateQtyButtons();
  // Fully sync segmented control & indicator from JS state (don't trust HTML initial attrs)
  segBtns.forEach((btn) => {
    const isActive = btn.dataset.value === state.thickness;
    btn.setAttribute('aria-checked', String(isActive));
    btn.classList.toggle('seg-btn--active', isActive);
    btn.tabIndex = isActive ? 0 : -1;
  });
  // Measure now, then re-measure after fonts load (Google Fonts changes button widths)
  positionIndicator();
  document.fonts.ready.then(positionIndicator);
  recalculate();

  // Restore walkthrough if user was mid-flow
  if (savedWtStep !== null) {
    openWalkthrough();     // sets wtStep = 0, shows overlay
    wtStep = savedWtStep;  // override with saved step
    renderStep();          // re-render at the correct step
  }
}

// Reposition indicator if window is resized
window.addEventListener('resize', positionIndicator);

init();
