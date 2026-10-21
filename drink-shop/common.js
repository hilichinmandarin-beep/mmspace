// ===== 商店和老師後台共用的小工具 =====

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = (n) => SHOP.currency + n;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));
const opt = (group, name) => OPTIONS[group].find((o) => o.name === name) || OPTIONS[group][0];

// ---------- 存資料（localStorage 不能用時也不會壞）----------
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ---------- 主題顏色 ----------
function applyTheme(color) {
  document.documentElement.style.setProperty("--theme", color || SHOP.color);
}

// ---------- 中文字 + 拼音 + 英文 ----------
// t("珍珠奶茶") 會產生可以顯示拼音、英文，也可以點了發音的文字
function t(zh) {
  const w = WORDS[zh];
  return `<span class="t" data-say="${esc(zh)}"><span class="zh">${esc(zh)}</span>${
    w ? `<small class="py">${esc(w[0])}</small><small class="en">${esc(w[1])}</small>` : ""
  }</span>`;
}
const py = (zh) => (WORDS[zh] || [zh])[0];
const en = (zh) => (WORDS[zh] || [, zh])[1];

// ---------- 發音 ----------
const synth = window.speechSynthesis;
function say(text) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TEACHING.voiceLang;
  const voices = synth.getVoices();
  u.voice = voices.find((v) => v.lang.replace("_", "-") === TEACHING.voiceLang) || voices.find((v) => v.lang.startsWith("zh")) || null;
  u.rate = 0.85;
  synth.speak(u);
}

// ---------- 商品圖：有照片用照片，沒有就畫一杯飲料 ----------
let cupSeq = 0;
function cupSVG(look = {}) {
  const id = "cup" + ++cupSeq;
  const c = look.color || "#c9a27e";
  const bits = {
    pearl: [[38, 86], [46, 89], [54, 87], [62, 89], [42, 80], [50, 82], [58, 80], [66, 84], [34, 90]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#2b1a12"/>`).join(""),
    fruit: [[40, 62, "#f5d442"], [58, 74, "#f2a33a"], [46, 84, "#f5d442"]]
      .map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="7" fill="${f}" stroke="#fff8" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2" fill="#fff8"/>`).join(""),
    pudding: `<rect x="34" y="76" width="32" height="16" rx="3" fill="#f2c14e"/><rect x="34" y="76" width="32" height="4" rx="2" fill="#a8641e"/>`,
    jelly: [[36, 84], [46, 80], [56, 85], [64, 79], [42, 89]]
      .map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.5" fill="#2e2a24"/>`).join(""),
  }[look.bits] || "";
  return `<svg viewBox="0 0 100 100" class="cup" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="M25 30 H75 L69 95 H31 Z"/></clipPath></defs>
    <rect x="55" y="2" width="6" height="40" rx="3" transform="rotate(12 58 22)" fill="var(--straw)"/>
    <g clip-path="url(#${id})">
      <rect x="0" y="0" width="100" height="100" fill="#ffffff55"/>
      <rect x="0" y="36" width="100" height="70" fill="${c}"/>
      ${look.top ? `<path d="M0 36 H100 V54 Q75 60 50 54 T0 56 Z" fill="${look.top}"/>` : ""}
      ${bits}
      <rect x="30" y="30" width="6" height="64" fill="#ffffff40"/>
    </g>
    <path d="M25 30 H75 L69 95 H31 Z" fill="none" stroke="#00000022" stroke-width="1.5"/>
    <path d="M22 30 Q50 14 78 30 Z" fill="#ffffffcc" stroke="#00000022" stroke-width="1.5"/>
    <rect x="21" y="28" width="58" height="5" rx="2.5" fill="#ffffff" stroke="#00000022" stroke-width="1"/>
  </svg>`;
}
function picHTML(p) {
  return p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">` : cupSVG(p.look);
}

// ---------- 訂單文字 ----------
function itemText(it) {
  return `${it.name}×${it.qty}（${it.size}・${it.sugar}・${it.ice}）`;
}
