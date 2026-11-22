const DHIKR = [
  { id: "subhanallah", arabic: "سُبْحَانَ ٱللَّٰه", translit: "SubhanAllah", target: 33 },
  { id: "alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰه", translit: "Alhamdulillah", target: 33 },
  { id: "allahuakbar", arabic: "ٱللَّٰهُ أَكْبَر", translit: "Allahu Akbar", target: 34 },
  { id: "istighfar", arabic: "أَسْتَغْفِرُ ٱللَّٰه", translit: "Astaghfirullah", target: 100 },
  { id: "salawat", arabic: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّد", translit: "Salawat", target: 100 }
];

const THEMES = [
  { id: "emerald",  color: "#15685c", meta: "#0b3d3a" },
  { id: "midnight", color: "#3a2f8f", meta: "#14123a" },
  { id: "rose",     color: "#9b2f68", meta: "#4a1230" },
  { id: "sunset",   color: "#b5481f", meta: "#3d1a0f" },
  { id: "ocean",    color: "#0f7a9c", meta: "#06304a" }
];

const KEY = "dhikr-counter-v1";
const RING = 2 * Math.PI * 120; // matches the SVG circle radius
const todayStr = () => new Date().toISOString().slice(0, 10);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.counts) return saved;
  } catch (e) {}
  return { selected: DHIKR[0].id, date: todayStr(), counts: {}, targets: {}, history: [], vibrate: true, theme: "emerald" };
}

let state = loadState();
if (!state.theme) state.theme = "emerald";

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}

// Archive yesterday's counts and start fresh when the date changes.
function rollOverIfNewDay() {
  const today = todayStr();
  if (state.date === today) return;
  const total = Object.values(state.counts).reduce((a, b) => a + b, 0);
  if (total > 0) {
    state.history.unshift({ date: state.date, total, counts: { ...state.counts } });
    state.history = state.history.slice(0, 14);
  }
  state.date = today;
  state.counts = {};
  save();
}

const current = () => DHIKR.find(d => d.id === state.selected) || DHIKR[0];
const getCount = () => state.counts[current().id] || 0;
const getTarget = () => state.targets[current().id] || current().target;

const $ = id => document.getElementById(id);

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const t = THEMES.find(x => x.id === state.theme) || THEMES[0];
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t.meta);
}

function renderThemes() {
  const box = $("themes");
  box.innerHTML = "";
  THEMES.forEach(t => {
    const b = document.createElement("button");
    b.style.background = t.color;
    b.setAttribute("aria-label", t.id + " theme");
    b.className = t.id === state.theme ? "active" : "";
    b.onclick = () => { state.theme = t.id; save(); applyTheme(); renderThemes(); };
    box.appendChild(b);
  });
}

/* ---------- Render ---------- */
let lastDhikr = null;

function render() {
  const d = current();
  const count = getCount();
  const target = getTarget();
  const progress = Math.min(count / target, 1);

  $("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  $("count").textContent = count;
  $("target").textContent = "/ " + target;
  $("targetInput").value = target;
  $("vibrate").checked = state.vibrate;
  $("tap").classList.toggle("done", count >= target);
  $("bar").style.strokeDasharray = RING;
  $("bar").style.strokeDashoffset = RING * (1 - progress);

  // Replay the text animation only when the dhikr changes.
  if (lastDhikr !== d.id) {
    $("arabic").textContent = d.arabic;
    $("transliteration").textContent = d.translit;
    ["arabic", "transliteration"].forEach(id => {
      const el = $(id);
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
    lastDhikr = d.id;
  }

  const status = $("status");
  const msg = count >= target ? "Target reached. Keep going if you like." : "";
  if (status.textContent !== msg) {
    status.textContent = msg;
    status.classList.toggle("show", !!msg);
  }

  $("picker").innerHTML = "";
  DHIKR.forEach(item => {
    const b = document.createElement("button");
    b.textContent = item.translit;
    b.className = item.id === d.id ? "active" : "";
    b.onclick = () => { state.selected = item.id; save(); render(); };
    $("picker").appendChild(b);
  });

  const list = $("historyList");
  list.innerHTML = "";
  if (state.history.length === 0) {
    list.innerHTML = "<li><span>No history yet</span></li>";
  }
  state.history.slice(0, 7).forEach(h => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${h.date}</span><span>${h.total} total</span>`;
    list.appendChild(li);
  });
}

/* ---------- Animations ---------- */
function popCount() {
  const el = $("count");
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

function ripple(e) {
  const btn = $("tap");
  const rect = btn.getBoundingClientRect();
  const hasPoint = e.clientX || e.clientY;
  const x = hasPoint ? e.clientX - rect.left : rect.width / 2;
  const y = hasPoint ? e.clientY - rect.top : rect.height / 2;
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.left = x + "px";
  r.style.top = y + "px";
  btn.appendChild(r);
  r.addEventListener("animationend", () => r.remove());
}

function floatPlus() {
  const p = document.createElement("span");
  p.className = "plus";
  p.textContent = "+1";
  $("tapWrap").appendChild(p);
  p.addEventListener("animationend", () => p.remove());
}

function confetti() {
  const colors = ["#ffd37a", "#ffffff", "#7de3ff", "#ffb3c7", "#b9a8ff", "#7fd49a"];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 90;
    s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.1 + "s";
    $("tapWrap").appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
}

function buzz(ms) {
  if (state.vibrate && navigator.vibrate) navigator.vibrate(ms);
}

/* ---------- Events ---------- */
$("tap").addEventListener("click", e => {
  rollOverIfNewDay();
  const id = current().id;
  state.counts[id] = getCount() + 1;
  save();
  render();

  ripple(e);
  popCount();
  floatPlus();

  const reached = state.counts[id] === getTarget();
  if (reached) confetti();
  buzz(reached ? [80, 60, 80] : 15);
});

$("undo").addEventListener("click", () => {
  const id = current().id;
  if (getCount() > 0) { state.counts[id] = getCount() - 1; save(); render(); }
});

$("reset").addEventListener("click", () => {
  if (getCount() === 0 || confirm("Reset this dhikr to 0?")) {
    state.counts[current().id] = 0;
    save();
    render();
  }
});

$("targetInput").addEventListener("change", e => {
  const v = parseInt(e.target.value, 10);
  if (v > 0) { state.targets[current().id] = v; save(); render(); }
});

$("vibrate").addEventListener("change", e => { state.vibrate = e.target.checked; save(); });

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) { rollOverIfNewDay(); render(); }
});

applyTheme();
renderThemes();
rollOverIfNewDay();
render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
