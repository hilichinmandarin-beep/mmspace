// ===== 商店資料：老師只要改這個檔案就能換商品 =====

const SHOP = {
  name: "喝吧!",
  slogan: "明天送到",
  location: { code: "教室 A", label: "華語中心" },
  currency: "$",
};

// 分類（首頁上方的兩排膠囊按鈕）
const CATEGORIES = [
  { id: "tea",    name: "茶",     icon: "🍵" },
  { id: "milk",   name: "奶茶",   icon: "🧋" },
  { id: "coffee", name: "咖啡",   icon: "☕" },
  { id: "juice",  name: "果汁",   icon: "🧃" },
  { id: "soda",   name: "汽水",   icon: "🥤" },
  { id: "dairy",  name: "牛奶",   icon: "🥛" },
  { id: "water",  name: "水",     icon: "💧" },
  { id: "energy", name: "運動飲料", icon: "⚡" },
];

// 輪播廣告
const BANNERS = [
  { title: "本週特價", big: "第二杯半價", sub: "奶茶、咖啡都可以", color: "#7a4a1d", emoji: "🧋☕" },
  { title: "新品上市", big: "夏日水果茶", sub: "酸酸甜甜，好喝又健康", color: "#2f7d4f", emoji: "🍋🍑" },
  { title: "學生優惠", big: "滿 $100 免運", sub: "下課就能喝", color: "#2b3a8c", emoji: "🎒🥤" },
];

// 圓形快捷入口（首頁廣告下方）
const SHORTCUTS = [
  { id: "new",  name: "新品",   icon: "✨" },
  { id: "hot",  name: "熱銷",   icon: "🔥" },
  { id: "sale", name: "特價",   icon: "💰", badge: "省$10" },
  { id: "cold", name: "冰的",   icon: "🧊" },
  { id: "warm", name: "熱的",   icon: "♨️" },
  { id: "low",  name: "低糖",   icon: "🌿" },
];

// 商品：price 現價、oldPrice 原價（沒有特價就不寫）、tags 對應快捷入口
const PRODUCTS = [
  { id: 1,  name: "珍珠奶茶",   cat: "milk",   emoji: "🧋", price: 55, oldPrice: 65, tags: ["hot", "sale", "cold"] },
  { id: 2,  name: "鮮奶綠茶",   cat: "milk",   emoji: "🧋", price: 50, tags: ["cold"] },
  { id: 3,  name: "烏龍茶",     cat: "tea",    emoji: "🍵", price: 30, tags: ["low", "warm", "cold"] },
  { id: 4,  name: "檸檬紅茶",   cat: "tea",    emoji: "🍋", price: 35, tags: ["hot", "cold"] },
  { id: 5,  name: "水果茶",     cat: "tea",    emoji: "🍑", price: 60, tags: ["new", "cold"] },
  { id: 6,  name: "美式咖啡",   cat: "coffee", emoji: "☕", price: 45, tags: ["warm", "low"] },
  { id: 7,  name: "拿鐵",       cat: "coffee", emoji: "☕", price: 60, oldPrice: 70, tags: ["sale", "hot", "warm"] },
  { id: 8,  name: "柳橙汁",     cat: "juice",  emoji: "🍊", price: 40, tags: ["cold"] },
  { id: 9,  name: "西瓜汁",     cat: "juice",  emoji: "🍉", price: 45, tags: ["new", "cold"] },
  { id: 10, name: "可樂",       cat: "soda",   emoji: "🥤", price: 25, tags: ["hot", "cold"] },
  { id: 11, name: "雪碧",       cat: "soda",   emoji: "🥤", price: 25, oldPrice: 30, tags: ["sale", "cold"] },
  { id: 12, name: "鮮奶",       cat: "dairy",  emoji: "🥛", price: 35, tags: ["warm", "cold"] },
  { id: 13, name: "豆漿",       cat: "dairy",  emoji: "🥛", price: 25, tags: ["low", "warm"] },
  { id: 14, name: "礦泉水",     cat: "water",  emoji: "💧", price: 15, tags: ["low"] },
  { id: 15, name: "氣泡水",     cat: "water",  emoji: "🫧", price: 30, tags: ["new", "low"] },
  { id: 16, name: "運動飲料",   cat: "energy", emoji: "⚡", price: 30, tags: ["cold"] },
];

// 首頁商品區塊：每一區顯示一個 tag 的商品
const SECTIONS = [
  { title: "本週熱銷", tag: "hot" },
  { title: "限時特價", tag: "sale" },
  { title: "新品上市", tag: "new" },
];

// 點飲料時的選項
const OPTIONS = {
  sugar: ["正常糖", "少糖", "半糖", "微糖", "無糖"],
  ice:   ["正常冰", "少冰", "微冰", "去冰", "熱"],
  size:  [{ name: "中杯", add: 0 }, { name: "大杯", add: 10 }],
};
