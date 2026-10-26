// ===== 老師後台：看全班訂單 =====
// 有設定 TEACHER.scriptUrl → 從 Google 試算表讀全班訂單
// 沒設定 → 單機模式，只看得到這台電腦（這個瀏覽器）的訂單

const online = !!TEACHER.scriptUrl;
let timer;

$("#shopName").textContent = SHOP.name;
applyTheme(load("drink-theme", SHOP.color));
$("#key").value = load("drink-teacher-key", "");
$("#keyBox").hidden = !online;
$("#mode").innerHTML = online
  ? "已連到 Google 試算表，會看到全班的訂單。"
  : "目前是<b>單機模式</b>：只看得到這台電腦的訂單。想收到全班的訂單，請照 <code>README.md</code> 設定 Google 試算表，再把網址貼到 <code>data.js</code> 的 <code>TEACHER.scriptUrl</code>。";

async function fetchOrders() {
  if (!online) return load("drink-orders", []);
  const key = $("#key").value;
  save("drink-teacher-key", key);
  const res = await fetch(`${TEACHER.scriptUrl}?key=${encodeURIComponent(key)}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.orders;
}

async function refresh() {
  try {
    let orders = await fetchOrders();
    if ($("#today").checked) {
      const today = new Date().toDateString();
      orders = orders.filter((o) => new Date(o.at).toDateString() === today);
    }
    orders.sort((a, b) => b.at.localeCompare(a.at));
    show(orders);
  } catch (err) {
    $("#totals").textContent = "讀不到訂單：" + err.message;
  }
}

function table(el, head, rows, empty) {
  const cls = (h) => (h.endsWith("#") ? ' class="num"' : "");
  el.innerHTML = `<tr>${head.map((h) => `<th${cls(h)}>${esc(h.replace("#", ""))}</th>`).join("")}</tr>` +
    (rows.length ? rows.map((r) => `<tr>${r.map((c, i) => `<td${cls(head[i])}>${c}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${head.length}">${empty}</td></tr>`);
}

function show(orders) {
  const cups = orders.reduce((s, o) => s + o.count, 0);
  const total = orders.reduce((s, o) => s + o.total, 0);
  $("#totals").innerHTML = `共 <b>${orders.length}</b> 筆訂單・<b>${cups}</b> 杯・<b>${money(total)}</b>`;

  // 要做的飲料：同樣的飲料、大小、甜度、冰塊合在一起
  const drinks = {};
  orders.forEach((o) => o.items.forEach((it) => {
    const k = [it.name, it.size, it.sugar, it.ice].join("|");
    drinks[k] = (drinks[k] || 0) + it.qty;
  }));
  table($("#drinks"), ["飲料", "大小", "甜度", "冰塊", "杯數#"],
    Object.entries(drinks).sort(([a], [b]) => a.localeCompare(b, "zh-Hant"))
      .map(([k, n]) => [...k.split("|").map(esc), n]),
    "還沒有訂單");

  // 學生：買了幾杯、說了幾次才對、用了幾次提示
  const students = {};
  orders.forEach((o) => {
    const s = (students[o.student] ||= { orders: 0, cups: 0, total: 0, tries: 0, hints: 0 });
    s.orders++; s.cups += o.count; s.total += o.total; s.tries += o.tries || 0; s.hints += o.hints || 0;
  });
  table($("#students"), ["學生", "訂單#", "杯數#", "花費#", "嘗試次數#", "提示次數#"],
    Object.entries(students).map(([name, s]) => [esc(name), s.orders, s.cups, money(s.total), s.tries, s.hints]),
    "還沒有學生下單");

  table($("#orders"), ["時間", "學生", "內容", "總共#", "嘗試#", "提示#"],
    orders.map((o) => [
      esc(new Date(o.at).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })),
      esc(o.student),
      o.items.map((it) => esc(itemText(it))).join("<br>"),
      money(o.total), o.tries || 0, o.hints || 0,
    ]),
    "還沒有訂單");
}

$("#refresh").addEventListener("click", refresh);
$("#today").addEventListener("change", refresh);
$("#key").addEventListener("keydown", (e) => { if (e.key === "Enter") refresh(); });
$("#auto").addEventListener("change", (e) => {
  clearInterval(timer);
  if (e.target.checked) timer = setInterval(refresh, 15000);
});
refresh();
