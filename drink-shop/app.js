// ===== 喝吧! 飲料店：畫面與購物車邏輯 =====
// 網址 #/... 決定顯示哪一頁（不需要伺服器，直接打開 index.html 就能用）

const view = $("#view");
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

// ---------- 狀態（存在學生自己的瀏覽器）----------
let cart = load("drink-cart", []).filter((it) => byId(it.id));  // [{ id, qty, sugar, ice, size }]
let orders = load("drink-orders", []);
let student = load("drink-student", "");
const learn = load("drink-learn", { py: TEACHING.showPinyin, en: TEACHING.showEnglish, speak: TEACHING.speakOnTap });
let practice = [];  // 結帳練習：每一杯的 { tries, hints, ok }

const MAX_QTY = 10;
const linePrice = (it) => byId(it.id).price + opt("size", it.size).add;
const cartCount = () => cart.reduce((s, it) => s + it.qty, 0);
const cartSubtotal = () => cart.reduce((s, it) => s + linePrice(it) * it.qty, 0);
const shipping = (sub) => (sub >= SHOP.freeShip ? 0 : SHOP.shipFee);

function saveCart() {
  save("drink-cart", cart);
  updateBadge();
}
function addToCart(id, opts = {}, qty = 1) {
  const item = {
    id: Number(id),
    sugar: opts.sugar || OPTIONS.sugar[0].name,
    ice: opts.ice || OPTIONS.ice[0].name,
    size: opts.size || OPTIONS.size[0].name,
  };
  const same = cart.find((it) => it.id === item.id && it.sugar === item.sugar && it.ice === item.ice && it.size === item.size);
  if (same) same.qty = Math.min(MAX_QTY, same.qty + qty); else cart.push({ ...item, qty });
  saveCart();
  toast(`已加入購物車：${byId(id).name}`);
}
function updateBadge() {
  const b = $("#cartCount");
  b.textContent = cartCount();
  b.hidden = cartCount() === 0;
}

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

// ---------- 造句練習 ----------
const NUM = ["零", "一", "兩", "三", "四", "五", "六", "七", "八", "九", "十"];
const NUM_PY = ["líng", "yì", "liǎng", "sān", "sì", "wǔ", "liù", "qī", "bā", "jiǔ", "shí"];
// 學生用簡體字輸入也算對
const S2T = { 红: "紅", 绿: "綠", 乌: "烏", 龙: "龍", 鲜: "鮮", 铁: "鐵", 柠: "檸", 无: "無", 热: "熱", 两: "兩", 头: "頭" };

function sentence(it) {
  const p = byId(it.id);
  const ice = it.ice === "熱" ? "熱的" : it.ice;
  const cups = NUM[it.qty] + "杯";
  return {
    // [要檢查的部分, 學生句子裡要出現的字]
    parts: [["我要", "我要"], ["數量", cups], ["飲料", p.name], ["大小", it.size], ["甜度", it.sugar], ["冰塊", it.ice]],
    zh: `我要${cups}${p.name}，${it.size}、${it.sugar}、${ice}。`,
    py: `Wǒ yào ${NUM_PY[it.qty]} bēi ${py(p.name)}, ${py(it.size)}, ${py(it.sugar)}, ${py(ice)}.`,
    en: `I'd like ${it.qty} ${en(p.name)}, ${en(it.size)}, ${en(it.sugar)}, ${en(ice)}.`,
  };
}
function normalize(s) {
  return s
    .replace(/[\s，、。,.!！?？;；:：「」"']/g, "")
    .replace(/./g, (ch) => S2T[ch] || ch)
    .replace(/10/g, "十")
    .replace(/\d/g, (d) => NUM[d]);
}
function checkSentence(it, input) {
  const said = normalize(input);
  return sentence(it).parts.map(([label, word]) => ({ label, ok: said.includes(normalize(word)) }));
}

// ---------- 共用小元件 ----------
function priceHTML(p) {
  return `<div class="price${p.oldPrice ? " sale" : ""}"><b>${money(p.price)}</b>${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</div>`;
}
function cardHTML(p) {
  return `<a class="card" href="#/product/${p.id}">
    <div class="pic">${picHTML(p)}<button class="add" data-add="${p.id}" aria-label="加入購物車">+</button></div>
    <div class="nm">${t(p.name)}</div>
    ${priceHTML(p)}
  </a>`;
}
function gridHTML(list) {
  if (!list.length) return `<div class="empty"><div>🫙</div>沒有找到商品</div>`;
  return `<div class="grid">${list.map(cardHTML).join("")}</div>`;
}
function searchHTML(q = "") {
  return `<form class="search" id="searchForm">🔍<input name="q" value="${esc(q)}" placeholder="你想喝什麼？可以打中文、拼音、英文" autocomplete="off"></form>`;
}
const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ\s']/g, "").toLowerCase();
function matches(p, q) {
  const w = WORDS[p.name] || ["", ""];
  return p.name.includes(q) || plain(w[0]).includes(plain(q)) || w[1].toLowerCase().includes(q.toLowerCase());
}

// ---------- 各頁面 ----------
const pages = {
  // 首頁
  home() {
    return `
      ${searchHTML()}
      <div class="chips">
        ${CATEGORIES.map((c) => `<a class="chip" href="#/category/${c.id}"><i>${c.icon}</i>${t(c.name)}</a>`).join("")}
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
        ${SHORTCUTS.map((s) => `<a class="sc" href="#/tag/${s.id}">${s.badge ? `<em>${esc(s.badge)}</em>` : ""}<i>${s.icon}</i>${t(s.name)}</a>`).join("")}
      </div>
      ${SECTIONS.map((sec) => `
        <div class="sec-head"><h2>${t(sec.title)}</h2><a class="more" href="#/tag/${sec.tag}">${t("查看全部")}</a></div>
        <div class="row">${PRODUCTS.filter((p) => p.tags.includes(sec.tag)).map(cardHTML).join("")}</div>
      `).join("")}
    `;
  },

  // 分類頁
  category(catId = CATEGORIES[0].id) {
    return `
      <h1 class="page-title">${t("分類")}</h1>
      <div class="cat-layout">
        <div class="cat-side">
          ${CATEGORIES.map((c) => `<a href="#/category/${c.id}" class="${c.id === catId ? "on" : ""}"><span>${c.icon}</span>${t(c.name)}</a>`).join("")}
        </div>
        <div>${gridHTML(PRODUCTS.filter((p) => p.cat === catId))}</div>
      </div>`;
  },

  // 快捷入口 / 查看全部
  tag(tagId) {
    const sc = SHORTCUTS.find((s) => s.id === tagId);
    const title = sc ? sc.name : (SECTIONS.find((s) => s.tag === tagId) || { title: "飲料" }).title;
    return `<h1 class="page-title">${sc ? sc.icon + " " : ""}${t(title)}</h1>${gridHTML(PRODUCTS.filter((p) => p.tags.includes(tagId)))}`;
  },

  // 優惠頁
  deals() {
    return `<h1 class="page-title">💰 ${t("優惠")}</h1>${gridHTML(PRODUCTS.filter((p) => p.oldPrice))}`;
  },

  // 搜尋結果：中文、拼音（不用聲調）、英文都可以
  search(q = "") {
    q = decodeURIComponent(q);
    return `${searchHTML(q)}<h1 class="page-title">「${esc(q)}」的搜尋結果</h1>${gridHTML(PRODUCTS.filter((p) => matches(p, q)))}`;
  },

  // 商品詳細頁：選甜度、冰塊、大小、數量
  product(id) {
    const p = byId(id);
    if (!p) return `<div class="empty"><div>❓</div>找不到這個商品</div>`;
    const pills = (group) => `<div class="pills" data-opt="${group}">${OPTIONS[group].map((o, i) =>
      `<button type="button" data-value="${esc(o.name)}" class="${i ? "" : "on"}">${t(o.name)}${o.add ? ` +${money(o.add)}` : ""}</button>`
    ).join("")}</div>`;
    return `
      <div class="detail" data-id="${p.id}">
        <div class="hero pic">${picHTML(p)}</div>
        <div class="detail-info">
        <div class="title-row"><h1>${t(p.name)}</h1><button class="speak-btn" data-speak="${esc(p.name)}" aria-label="發音">🔊</button></div>
        ${priceHTML(p)}
        <div class="opt"><h3>${t("甜度")}</h3>${pills("sugar")}</div>
        <div class="opt"><h3>${t("冰塊")}</h3>${pills("ice")}</div>
        <div class="opt"><h3>${t("大小")}</h3>${pills("size")}</div>
        <div class="opt"><h3>${t("數量")}</h3>
          <div class="qty"><button type="button" data-qty="-1">−</button><b id="qty">1</b><button type="button" data-qty="1">+</button></div>
        </div>
        <div class="buybar">
          <button class="btn ghost" id="addBtn">${t("加入購物車")}</button>
          <button class="btn" id="buyBtn">${t("馬上買")}</button>
        </div>
        </div>
      </div>`;
  },

  // 購物車
  cart() {
    if (!cart.length) return `<h1 class="page-title">${t("購物車")}</h1><div class="empty"><div>🛒</div>購物車是空的<br><br><a class="more" href="#/">去逛逛</a></div>`;
    const sub = cartSubtotal();
    const ship = shipping(sub);
    return `
      <h1 class="page-title">${t("購物車")}</h1>
      <div class="split"><div class="split-main">
      ${cart.map((it, i) => {
        const p = byId(it.id);
        return `<div class="line">
          <a class="pic" href="#/product/${p.id}">${picHTML(p)}</a>
          <div class="info"><b>${t(p.name)}</b><small>${t(it.size)}・${t(it.sugar)}・${t(it.ice)}</small>${money(linePrice(it))}</div>
          <div class="qty"><button data-line="${i}" data-d="-1">−</button><b>${it.qty}</b><button data-line="${i}" data-d="1">+</button></div>
        </div>`;
      }).join("")}
      </div>
      <div class="split-side summary">
        <p><span>${t("小計")}</span><span>${money(sub)}</span></p>
        <p><span>${t("運費")}</span><span>${ship ? money(ship) : t("免運")}</span></p>
        <p class="total"><span>${t("總共")}</span><span>${money(sub + ship)}</span></p>
        <a class="btn block" href="#/checkout">${t("結帳")}</a>
      </div></div>`;
  },

  // 結帳：用中文點飲料
  checkout() {
    if (!cart.length) return pages.cart();
    practice = cart.map(() => ({ tries: 0, hints: 0, ok: !TEACHING.requireSentence, used: {} }));
    const sub = cartSubtotal();
    return `
      <h1 class="page-title">📝 ${t("用中文點飲料")}</h1>
      ${TEACHING.requireSentence ? `<p class="note">看圖片，用中文說出或打出你要的飲料。${SR ? "可以按 🎤 用說的。" : ""}</p>` : ""}
      <div class="split">
      ${TEACHING.requireSentence ? `<div class="split-main">${cart.map(practiceHTML).join("")}</div>` : ""}
      <div class="split-side">
      <label class="namebox"><span>你的名字</span><input id="studentName" value="${esc(student)}" placeholder="例如：王小明" autocomplete="name"></label>
      <div class="summary">
        ${cart.map((it) => `<p><span>${esc(byId(it.id).name)} ×${it.qty}</span><span>${money(linePrice(it) * it.qty)}</span></p>`).join("")}
        <p class="total"><span>${t("總共")}</span><span>${money(sub + shipping(sub))}</span></p>
        <button class="btn block" id="placeOrder">${t("送出訂單")}</button>
        <p class="note" id="orderNote"></p>
      </div>
      </div></div>`;
  },

  // 我的：名字、訂單紀錄、外觀
  me() {
    const status = (o) => o.sent === true ? `<small class="ok">✅ 已送給老師</small>`
      : o.sent === false ? `<small class="warn">⚠️ 還沒送到老師 <button class="link" data-resend="${o.id}">再送一次</button></small>` : "";
    return `<div class="me-grid">
      <div class="me-profile profile">
        <div class="avatar">🧑‍🎓</div>
        <label class="namebox flat"><span>你的名字</span><input id="studentName" value="${esc(student)}" placeholder="例如：王小明"></label>
      </div>
      <div class="me-orders">
      <div class="sec-head"><h2>${t("我的訂單")}</h2></div>
      ${orders.length ? `<div class="menu">${orders.map((o) => `<div class="order">
          <div><b>${esc(new Date(o.at).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</b>・${o.count} 杯
            <small>${o.items.map((it) => esc(itemText(it))).join("<br>")}</small>${status(o)}</div>
          <b>${money(o.total)}</b>
        </div>`).join("")}</div>`
        : `<div class="empty"><div>🧾</div>還沒有訂單</div>`}
      </div>
      <div class="me-look">
      <div class="sec-head"><h2>外觀</h2></div>
      <div class="swatches">
        ${THEMES.map((th) => `<button data-theme-color="${th.color}" style="--c:${th.color}" aria-label="${esc(th.name)}"><i></i>${esc(th.name)}</button>`).join("")}
      </div>
      <div class="menu">
        <a href="teacher.html"><span>👩‍🏫 老師後台</span><span>›</span></a>
      </div>
      </div></div>`;
  },
};

function practiceHTML(it, i) {
  const p = byId(it.id);
  const ice = opt("ice", it.ice);
  return `<div class="practice" data-i="${i}">
    <div class="cue">
      <div class="pic">${picHTML(p)}</div>
      <div class="cue-tags">
        <span class="big">×${it.qty}</span>
        <span title="大小">🥤 ${opt("size", it.size).mark}</span>
        <span title="甜度">🍬 ${opt("sugar", it.sugar).pct}%</span>
        <span title="冰塊">${ice.hot ? "♨️" : `🧊 ${ice.pct}%`}</span>
      </div>
    </div>
    <div class="answer-row">
      <input class="say-input" placeholder="我要……" autocomplete="off">
      ${SR ? `<button class="round" data-mic="${i}" aria-label="用說的">🎤</button>` : ""}
      <button class="btn" data-check="${i}">檢查</button>
    </div>
    <div class="feedback"></div>
    <div class="hints">
      <button data-hint="py">💡 拼音</button>
      <button data-hint="en">💡 English</button>
      <button data-hint="listen">🔊 聽一聽</button>
      <button data-hint="answer">👀 看答案</button>
    </div>
    <div class="hint-out"></div>
  </div>`;
}

// ---------- 路由：讀網址、畫頁面 ----------
function render() {
  const [, page = "", arg] = location.hash.split("/");
  const name = pages[page] ? page : "home";
  view.innerHTML = pages[name](arg);
  const tab = name === "checkout" ? "cart" : name;
  $$(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
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

// ---------- 結帳練習的動作 ----------
function checkPractice(i) {
  const card = $(`.practice[data-i="${i}"]`);
  const st = practice[i];
  const input = $(".say-input", card).value.trim();
  if (!input) { $(".say-input", card).focus(); return; }
  st.tries++;
  const result = checkSentence(cart[i], input);
  st.ok = result.every((r) => r.ok);
  $(".feedback", card).innerHTML = st.ok
    ? `<b class="ok">✅ 答對了！${st.tries === 1 && !st.hints ? "太棒了！" : ""}</b>`
    : result.map((r) => `<span class="${r.ok ? "ok" : "bad"}">${r.ok ? "✓" : "✗"} ${t(r.label)}</span>`).join("");
  card.classList.toggle("done", st.ok);
  if (st.ok) {
    $(".say-input", card).disabled = true;
    say(sentence(cart[i]).zh);
    const next = $(".practice:not(.done) .say-input");
    if (next) next.focus();
  }
}
function showHint(card, kind) {
  const i = Number(card.dataset.i);
  const st = practice[i];
  const s = sentence(cart[i]);
  if (!st.used[kind]) { st.used[kind] = true; st.hints++; }
  if (kind === "listen") { say(s.zh); return; }
  const text = { py: s.py, en: s.en, answer: s.zh }[kind];
  const out = $(".hint-out", card);
  if (!$(`[data-kind="${kind}"]`, out)) out.insertAdjacentHTML("beforeend", `<div data-kind="${kind}">${esc(text)}</div>`);
}
function listen(i) {
  const card = $(`.practice[data-i="${i}"]`);
  const btn = $("[data-mic]", card);
  const rec = new SR();
  rec.lang = TEACHING.voiceLang;
  rec.interimResults = true;
  btn.classList.add("rec");
  rec.onresult = (e) => {
    $(".say-input", card).value = [...e.results].map((r) => r[0].transcript).join("");
    if (e.results[e.results.length - 1].isFinal) checkPractice(i);
  };
  rec.onerror = () => toast("沒聽清楚，再說一次");
  rec.onend = () => btn.classList.remove("rec");
  rec.start();
}

// ---------- 送出訂單 ----------
function placeOrder() {
  const nameInput = $("#studentName");
  student = nameInput.value.trim();
  save("drink-student", student);
  if (!student) { toast("請寫你的名字"); nameInput.focus(); return; }
  const left = practice.findIndex((st) => !st.ok);
  if (left >= 0) {
    $("#orderNote").textContent = "每一杯都要用中文說對，才能送出喔！";
    $(`.practice[data-i="${left}"] .say-input`).focus();
    return;
  }
  const sub = cartSubtotal();
  const order = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    at: new Date().toISOString(),
    student,
    items: cart.map((it) => ({ name: byId(it.id).name, qty: it.qty, size: it.size, sugar: it.sugar, ice: it.ice, price: linePrice(it) })),
    count: cartCount(),
    total: sub + shipping(sub),
    tries: practice.reduce((s, st) => s + st.tries, 0),
    hints: practice.reduce((s, st) => s + st.hints, 0),
    sent: TEACHER.scriptUrl ? false : null,  // null = 單機模式
  };
  orders.unshift(order);
  save("drink-orders", orders);
  cart = [];
  saveCart();
  sendOrder(order);
  toast("訂單成功！謝謝你 🎉");
  location.hash = "#/me";
}

// 送到老師的 Google 試算表（no-cors：送得出去就算成功）
function sendOrder(order) {
  if (!TEACHER.scriptUrl) return;
  const { sent, ...data } = order;
  fetch(TEACHER.scriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(data) })
    .then(() => { order.sent = true; })
    .catch(() => { order.sent = false; })
    .finally(() => {
      save("drink-orders", orders);
      if (location.hash === "#/me") render();
    });
}

// ---------- 點擊事件（用事件委派，所有頁面共用）----------
document.addEventListener("click", (e) => {
  const el = (s) => e.target.closest(s);

  // 點字發音模式：點到有中文的地方就唸出來（不影響原本的動作）
  if (document.body.classList.contains("speak") && el("[data-say]")) say(el("[data-say]").dataset.say);

  if (el("[data-learn]")) {
    const k = el("[data-learn]").dataset.learn;
    learn[k] = !learn[k];
    save("drink-learn", learn);
    applyLearn();
    return;
  }
  if (el("[data-speak]")) { say(el("[data-speak]").dataset.speak); return; }
  if (el("[data-add]")) { e.preventDefault(); addToCart(el("[data-add]").dataset.add); return; }

  if (el(".pills button")) {
    const pill = el(".pills button");
    $$("button", pill.parentElement).forEach((b) => b.classList.toggle("on", b === pill));
    return;
  }
  if (el("[data-qty]")) {
    const q = $("#qty");
    q.textContent = Math.min(MAX_QTY, Math.max(1, Number(q.textContent) + Number(el("[data-qty]").dataset.qty)));
    return;
  }
  if (el("#addBtn, #buyBtn")) {
    const box = $(".detail");
    const pick = (group) => $(`[data-opt="${group}"] .on`, box).dataset.value;
    addToCart(box.dataset.id, { sugar: pick("sugar"), ice: pick("ice"), size: pick("size") }, Number($("#qty").textContent));
    if (el("#buyBtn")) location.hash = "#/cart";
    return;
  }
  if (el("[data-line]")) {
    const b = el("[data-line]");
    const it = cart[b.dataset.line];
    it.qty = Math.min(MAX_QTY, it.qty + Number(b.dataset.d));
    if (it.qty <= 0) cart.splice(b.dataset.line, 1);
    saveCart();
    render();
    return;
  }

  if (el("[data-check]")) { checkPractice(Number(el("[data-check]").dataset.check)); return; }
  if (el("[data-hint]")) { showHint(el(".practice"), el("[data-hint]").dataset.hint); return; }
  if (el("[data-mic]")) { listen(Number(el("[data-mic]").dataset.mic)); return; }
  if (el("#placeOrder")) { placeOrder(); return; }

  if (el("[data-resend]")) {
    const o = orders.find((x) => x.id === el("[data-resend]").dataset.resend);
    if (o) { sendOrder(o); toast("再送一次…"); }
    return;
  }
  if (el("[data-theme-color]")) {
    const c = el("[data-theme-color]").dataset.themeColor;
    save("drink-theme", c);
    applyTheme(c);
    return;
  }
  if (el("#loc")) toast(`送到：${SHOP.location.label}`);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList.contains("say-input")) {
    checkPractice(Number(e.target.closest(".practice").dataset.i));
  }
});

document.addEventListener("change", (e) => {
  if (e.target.id === "studentName") {
    student = e.target.value.trim();
    save("drink-student", student);
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "searchForm") return;
  e.preventDefault();
  const q = e.target.q.value.trim();
  if (q) location.hash = `#/search/${encodeURIComponent(q)}`;
});

function applyLearn() {
  document.body.classList.toggle("show-py", !!learn.py);
  document.body.classList.toggle("show-en", !!learn.en);
  document.body.classList.toggle("speak", !!learn.speak);
  $$("[data-learn]").forEach((b) => b.classList.toggle("on", !!learn[b.dataset.learn]));
}

// ---------- 開始 ----------
$("#shopName").textContent = SHOP.name;
$("#shopSlogan").textContent = SHOP.slogan;
$("#loc").innerHTML = `📍 ${esc(SHOP.location.code)}<small>${esc(SHOP.location.label)}</small>`;
$("#tabbar").innerHTML = [["home", "#/", "🏠", "首頁"], ["category", "#/category", "📋", "分類"], ["deals", "#/deals", "💰", "優惠"], ["cart", "#/cart", "🛒", "購物車"], ["me", "#/me", "🙂", "我"]]
  .map(([tab, href, icon, label]) => `<a href="${href}" data-tab="${tab}"><span class="ic">${icon}</span>${t(label)}</a>`).join("");
document.title = SHOP.name + " 飲料店";
applyTheme(load("drink-theme", SHOP.color));
applyLearn();
updateBadge();
if (synth) synth.getVoices();  // 先載入語音清單
window.addEventListener("hashchange", render);
render();
