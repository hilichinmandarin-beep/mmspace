// ===== 喝吧! 飲料店：老師的 Google 試算表 =====
// 設定步驟見 README.md「老師後台」。簡單說：
// 1. 開一個新的 Google 試算表 → 擴充功能 → Apps Script → 把這整個檔案貼上
// 2. 把下面的 TEACHER_KEY 改成你自己的密碼
// 3. 部署 → 新增部署作業 → 類型選「網頁應用程式」
//    執行身分：我；誰可以存取：所有人 → 部署 → 複製網址
// 4. 把網址貼到 data.js 的 TEACHER.scriptUrl

const TEACHER_KEY = "1234";
const HEADERS = ["時間", "學生", "內容", "杯數", "總共", "嘗試次數", "提示次數", "資料"];

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

// 學生送出訂單
function doPost(e) {
  const o = JSON.parse(e.postData.contents);
  const items = (o.items || []).map(function (it) {
    return it.name + "×" + it.qty + "（" + it.size + "・" + it.sugar + "・" + it.ice + "）";
  }).join("、");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(o.at), cell_(o.student), cell_(items), o.count, o.total, o.tries, o.hints, cell_(JSON.stringify(o))]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// 老師後台讀全部訂單（要密碼）
function doGet(e) {
  if ((e.parameter.key || "") !== TEACHER_KEY) return json_({ error: "密碼不對" });
  const rows = sheet_().getDataRange().getValues().slice(1);
  const orders = rows.map(function (r) {
    try { return JSON.parse(String(r[7]).replace(/^'/, "")); } catch (err) { return null; }
  }).filter(Boolean);
  return json_({ orders: orders });
}

// 避免學生在名字打 = 開頭變成試算表公式
function cell_(v) {
  const s = String(v == null ? "" : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
