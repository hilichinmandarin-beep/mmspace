// ===== 喝吧! 飲料店：畫面與購物車邏輯 =====
// 網址 #/... 決定顯示哪一頁（不需要伺服器，直接打開 index.html 就能用）

const $ = (s) => document.querySelector(s);
const view = $("#view");
const money = (n) => SHOP.currency + n;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));

// ---------- 存資料（購物車、訂單）----------
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
let cart = load("drink-cart", []);     // [{ id, qty, sugar, ice, size }]
let orders = load("drink-orders", []);

function linePrice(item) {
  const size = OPTIONS.size.find((s) => s.name === item.size) || OPTIONS.size[0];
  return byId(item.id).price + size.add;
}
function cartTotal() {
  return cart.reduce((sum, it) => sum + linePrice(it) * it.qty, 0);
}
function addToCart(id, opts = {}, qty = 1) {
  const item = {
    id: Number(id),
    sugar: opts.sugar || OPTIONS.sugar[0],
    ice: opts.ice || OPTIONS.ice[0],
    size: opts.size || OPTIONS.size[0].name,
  };
  const same = cart.find((it) => it.id === item.id && it.sugar === item.sugar && it.ice === item.ice && it.size === item.size);
  if (same) same.qty += qty; else cart.push({ ...item, qty });
  save("drink-cart", cart);
  updateBadge();
  toast(`已加入購物車：${byId(id).name}`);
}
function updateBadge() {
  const n = cart.reduce((s, it) => s + it.qty, 0);
  const b = $("#cartCount");
  b.textContent = n;
  b.hidden = n === 0;
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
}

// ---------- 共用小元件 ----------
function priceHTML(p, extra = 0) {
  const sale = p.oldPrice ? " sale" : "";
  return `<div class="price${sale}"><b>${money(p.price + extra)}</b>${p.oldPrice ? `<s>${money(p.oldPrice + extra)}</s>` : ""}</div>`;
}
function cardHTML(p) {
  return `<a class="card" href="#/product/${p.id}">
    <div class="pic">${p.emoji}<button class="add" data-add="${p.id}" aria-label="加入購物車">+</button></div>
    <div class="nm">${esc(p.name)}</div>
    ${priceHTML(p)}
  </a>`;
}
function gridHTML(list) {
  if (!list.length) return `<div class="empty"><div>🫙</div>沒有找到商品</div>`;
  return `<div class="grid">${list.map(cardHTML).join("")}</div>`;
}
function searchHTML(q = "") {
  return `<form class="search" id="searchForm">🔍<input name="q" value="${esc(q)}" placeholder="你想喝什麼？" autocomplete="off"></form>`;
}

// ---------- 各頁面 ----------
const pages = {
  // 首頁
  home() {
    return `
      ${searchHTML()}
      <div class="chips">
        ${CATEGORIES.map((c) => `<a class="chip" href="#/category/${c.id}"><i>${c.icon}</i>${esc(c.name)}</a>`).join("")}
      </div>
      <div class="banners" id="banners">
        ${BANNERS.map((b) => `<div class="banner" style="background:${b.color}">
          <span class="tag">${esc(b.title)}</span>
          <div class="big">${esc(b.big)}</div>
          <div>${esc(b.sub)}</div>
          <div class="emo">${b.emoji}</div>
        </div>`).join("")}
      </div>
      <div class="dots" id="dots">${BANNERS.map((_, i) => `<b class="${i ? "" : "on"}"></b>`).join("")}</div>
      <div class="shortcuts">
        ${SHORTCUTS.map((s) => `<a class="sc" href="#/tag/${s.id}">${s.badge ? `<em>${esc(s.badge)}</em>` : ""}<i>${s.icon}</i>${esc(s.name)}</a>`).join("")}
      </div>
      ${SECTIONS.map((sec) => `
        <div class="sec-head"><h2>${esc(sec.title)}</h2><a class="more" href="#/tag/${sec.tag}">查看全部</a></div>
        <div class="row">${PRODUCTS.filter((p) => p.tags.includes(sec.tag)).map(cardHTML).join("")}</div>
      `).join("")}
    `;
  },

  // 分類頁
  category(catId = CATEGORIES[0].id) {
    const list = PRODUCTS.filter((p) => p.cat === catId);
    return `
      <h1 class="page-title">分類</h1>
      <div class="cat-layout">
        <div class="cat-side">
          ${CATEGORIES.map((c) => `<a href="#/category/${c.id}" class="${c.id === catId ? "on" : ""}"><span>${c.icon}</span>${esc(c.name)}</a>`).join("")}
        </div>
        <div>${gridHTML(list)}</div>
      </div>`;
  },

  // 快捷入口 / 查看全部
  tag(tagId) {
    const sc = SHORTCUTS.find((s) => s.id === tagId);
    const title = sc ? sc.name : (SECTIONS.find((s) => s.tag === tagId) || {}).title || "商品";
    return `<h1 class="page-title">${sc ? sc.icon + " " : ""}${esc(title)}</h1>${gridHTML(PRODUCTS.filter((p) => p.tags.includes(tagId)))}`;
  },

  // 優惠頁
  deals() {
    return `<h1 class="page-title">💰 優惠</h1>${gridHTML(PRODUCTS.filter((p) => p.oldPrice))}`;
  },

  // 搜尋結果
  search(q = "") {
    q = decodeURIComponent(q);
    const list = PRODUCTS.filter((p) => p.name.includes(q));
    return `${searchHTML(q)}<h1 class="page-title">「${esc(q)}」的搜尋結果</h1>${gridHTML(list)}`;
  },

  // 商品詳細頁：選甜度、冰塊、大小、數量
  product(id) {
    const p = byId(id);
    if (!p) return `<div class="empty"><div>❓</div>找不到這個商品</div>`;
    const pills = (name, list) => `<div class="pills" data-opt="${name}">${list.map((o, i) => {
      const label = typeof o === "string" ? o : `${o.name}${o.add ? ` +${money(o.add)}` : ""}`;
      const value = typeof o === "string" ? o : o.name;
      return `<button type="button" data-value="${esc(value)}" class="${i ? "" : "on"}">${esc(label)}</button>`;
    }).join("")}</div>`;
    return `
      <div class="detail" data-id="${p.id}">
        <div class="hero">${p.emoji}</div>
        <h1>${esc(p.name)}</h1>
        ${priceHTML(p)}
        <div class="opt"><h3>甜度</h3>${pills("sugar", OPTIONS.sugar)}</div>
        <div class="opt"><h3>冰塊</h3>${pills("ice", OPTIONS.ice)}</div>
        <div class="opt"><h3>大小</h3>${pills("size", OPTIONS.size)}</div>
        <div class="opt"><h3>數量</h3>
          <div class="qty"><button type="button" data-qty="-1">−</button><b id="qty">1</b><button type="button" data-qty="1">+</button></div>
        </div>
        <div class="buybar">
          <button class="btn ghost" id="addBtn">加入購物車</button>
          <button class="btn" id="buyBtn">馬上買</button>
        </div>
      </div>`;
  },

  // 購物車
  cart() {
    if (!cart.length) return `<h1 class="page-title">購物車</h1><div class="empty"><div>🛒</div>購物車是空的<br><br><a class="more" href="#/">去逛逛</a></div>`;
    const sub = cartTotal();
    const ship = sub >= 100 ? 0 : 20;
    return `
      <h1 class="page-title">購物車</h1>
      ${cart.map((it, i) => {
        const p = byId(it.id);
        return `<div class="line">
          <div class="pic">${p.emoji}</div>
          <div class="info"><b>${esc(p.name)}</b><small>${esc(it.size)}・${esc(it.sugar)}・${esc(it.ice)}</small>${money(linePrice(it))}</div>
          <div class="qty"><button data-line="${i}" data-d="-1">−</button><b>${it.qty}</b><button data-line="${i}" data-d="1">+</button></div>
        </div>`;
      }).join("")}
      <div class="summary">
        <p><span>小計</span><span>${money(sub)}</span></p>
        <p><span>運費</span><span>${ship ? money(ship) : "免運"}</span></p>
        <p class="total"><span>總共</span><span>${money(sub + ship)}</span></p>
        <button class="btn" id="checkout" style="width:100%;margin-top:10px">結帳</button>
      </div>`;
  },

  // 我的：個人資料、訂單紀錄
  me() {
    return `
      <div class="profile"><div class="avatar">🧑‍🎓</div><div><b>同學</b><br><small>${esc(SHOP.location.label)}</small></div></div>
      <h2 class="sec-head" style="font-size:1.15rem">我的訂單</h2>
      ${orders.length ? `<div class="menu">${orders.map((o) => `<div><span>${esc(o.time)}・${o.count} 杯</span><b>${money(o.total)}</b></div>`).join("")}</div>`
        : `<div class="empty"><div>🧾</div>還沒有訂單</div>`}
      <div class="menu">
        <a href="#/cart"><span>🛒 購物車</span><span>›</span></a>
        <a href="#/deals"><span>💰 優惠</span><span>›</span></a>
      </div>`;
  },
};

// ---------- 路由：讀網址、畫頁面 ----------
function render() {
  const [, page = "", arg] = location.hash.split("/");
  const name = pages[page] ? page : "home";
  view.innerHTML = pages[name](arg);
  const tab = name === "tag" || name === "search" || name === "product" ? "" : name;
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
  window.scrollTo(0, 0);
  if (name === "home") watchBanners();
}

function watchBanners() {
  const box = $("#banners");
  const dots = [...$("#dots").children];
  box.addEventListener("scroll", () => {
    const i = Math.round(box.scrollLeft / box.firstElementChild.offsetWidth);
    dots.forEach((d, j) => d.classList.toggle("on", i === j));
  });
}

// ---------- 點擊事件（用事件委派，所有頁面共用）----------
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { e.preventDefault(); addToCart(add.dataset.add); return; }

  const pill = e.target.closest(".pills button");
  if (pill) {
    pill.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === pill));
    return;
  }

  const q = e.target.closest("[data-qty]");
  if (q) {
    const el = $("#qty");
    el.textContent = Math.max(1, Number(el.textContent) + Number(q.dataset.qty));
    return;
  }

  if (e.target.closest("#addBtn, #buyBtn")) {
    const box = $(".detail");
    const pick = (name) => box.querySelector(`[data-opt="${name}"] .on`).dataset.value;
    addToCart(box.dataset.id, { sugar: pick("sugar"), ice: pick("ice"), size: pick("size") }, Number($("#qty").textContent));
    if (e.target.closest("#buyBtn")) location.hash = "#/cart";
    return;
  }

  const line = e.target.closest("[data-line]");
  if (line) {
    const it = cart[line.dataset.line];
    it.qty += Number(line.dataset.d);
    if (it.qty <= 0) cart.splice(line.dataset.line, 1);
    save("drink-cart", cart);
    updateBadge();
    render();
    return;
  }

  if (e.target.closest("#checkout")) {
    const sub = cartTotal();
    orders.unshift({
      time: new Date().toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      count: cart.reduce((s, it) => s + it.qty, 0),
      total: sub + (sub >= 100 ? 0 : 20),
      items: cart,
    });
    cart = [];
    save("drink-orders", orders);
    save("drink-cart", cart);
    updateBadge();
    toast("訂單成功！謝謝你 🎉");
    location.hash = "#/me";
    return;
  }

  if (e.target.closest("#loc")) toast(`送到：${SHOP.location.label}`);
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "searchForm") return;
  e.preventDefault();
  const q = e.target.q.value.trim();
  if (q) location.hash = `#/search/${encodeURIComponent(q)}`;
});

// ---------- 開始 ----------
$("#shopName").textContent = SHOP.name;
$("#shopSlogan").textContent = SHOP.slogan + " ›";
$("#loc").innerHTML = `📍 ${esc(SHOP.location.code)}<small>${esc(SHOP.location.label)}</small>`;
document.title = SHOP.name + " 飲料店";
updateBadge();
window.addEventListener("hashchange", render);
render();
