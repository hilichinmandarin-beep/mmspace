// ===== 商店資料：老師只要改這個檔案就能換商品、顏色、教學設定 =====

const SHOP = {
  name: "喝吧!",
  slogan: "SDTCML",      // 店名下方的小字
  currency: "$",        // 美金；價錢都寫成美元，例如 4.5 = $4.50
  color: "#1f2fa8",      // 主題顏色（學生也可以在「我」頁面換）
  freeShip: 15,          // 滿多少免運
  shipFee: 2,            // 運費
};

// 學生可以選的主題顏色
const THEMES = [
  { name: "藍", color: "#1f2fa8" },
  { name: "綠", color: "#2f7d4f" },
  { name: "紅", color: "#c2412d" },
  { name: "紫", color: "#6b3fa0" },
  { name: "橘", color: "#b85c0f" },
];

// 教學設定
const TEACHING = {
  requireSentence: true, // 結帳前要用中文說出（打出）整句話
  showPinyin: false,     // 一打開就顯示拼音
  showEnglish: false,    // 一打開就顯示英文
  speakOnTap: false,     // 一打開就「點字發音」
  voiceLang: "zh-TW",    // 發音語言：zh-TW 台灣、zh-CN 大陸
};

// 老師後台：貼上 Google Apps Script 網址就能收到全班訂單（設定方法見 README.md）
// 空白 = 單機模式，訂單只存在學生自己的瀏覽器
const TEACHER = {
  scriptUrl: "",
};

// 分類（首頁上方的兩排膠囊按鈕）
const CATEGORIES = [
  { id: "tea",    name: "純茶", icon: "🍵" },
  { id: "milk",   name: "奶茶", icon: "🧋" },
  { id: "fresh",  name: "鮮奶", icon: "🥛" },
  { id: "fruit",  name: "果茶", icon: "🍋" },
  { id: "coffee", name: "咖啡", icon: "☕" },
  { id: "special",name: "特調", icon: "✨" },
];

// 輪播廣告
const BANNERS = [
  { title: "本週特價", big: "第二杯半價", sub: "奶茶、咖啡都可以", color: "#7a4a1d", emoji: "🧋☕" },
  { title: "新品上市", big: "葡萄柚綠茶", sub: "酸酸甜甜，好喝又健康", color: "#2f7d4f", emoji: "🍊🍵" },
  { title: "學生優惠", big: "滿 $15 免運", sub: "下課就能喝", color: "#2b3a8c", emoji: "🎒🥤" },
];

// 圓形快捷入口（首頁廣告下方），id 對應商品的 tags
const SHORTCUTS = [
  { id: "new",     name: "新品",     icon: "✨" },
  { id: "hot",     name: "熱銷",     icon: "🔥" },
  { id: "sale",    name: "特價",     icon: "💰", badge: "省$0.75" },
  { id: "pearl",   name: "珍珠",     icon: "⚫" },
  { id: "fruity",  name: "水果",     icon: "🍊" },
];

// 商品
//   price 現價（美金，每杯最低 $3）、oldPrice 原價（沒有特價就不寫）、tags 對應快捷入口和首頁區塊
//   look 自動畫杯子：color 飲料顏色、top 上層顏色（拿鐵分層）、bits 配料 pearl 珍珠 / fruit 水果 / pudding 布丁 / jelly 仙草
//   img  想用真的照片就寫 img: "images/檔名.jpg"，會取代畫出來的杯子
const PRODUCTS = [
  { id: 1,  name: "紅茶",         cat: "tea",     price: 3,                       tags: ["hot"],                     look: { color: "#a8501e" } },
  { id: 2,  name: "綠茶",         cat: "tea",     price: 3,                       tags: [],                          look: { color: "#cdb64e" } },
  { id: 3,  name: "烏龍茶",       cat: "tea",     price: 3.25,                    tags: [],                          look: { color: "#b7782c" } },
  { id: 4,  name: "四季春",       cat: "tea",     price: 3.25,                    tags: ["new"],                     look: { color: "#d9c25e" } },
  { id: 5,  name: "珍珠奶茶",     cat: "milk",    price: 4.5, oldPrice: 5.25,     tags: ["hot", "sale", "pearl"],    look: { color: "#c9a27e", bits: "pearl" } },
  { id: 6,  name: "奶茶",         cat: "milk",    price: 3.75,                    tags: [],                          look: { color: "#d2b18d" } },
  { id: 7,  name: "布丁奶茶",     cat: "milk",    price: 4.75,                    tags: ["hot"],                     look: { color: "#cfae8a", bits: "pudding" } },
  { id: 8,  name: "仙草奶茶",     cat: "milk",    price: 4.5,                     tags: [],                          look: { color: "#c09c78", bits: "jelly" } },
  { id: 9,  name: "珍珠鮮奶",     cat: "fresh",   price: 4.75,                    tags: ["pearl"],                   look: { color: "#f3eee4", bits: "pearl" } },
  { id: 10, name: "紅茶拿鐵",     cat: "fresh",   price: 4.75,                    tags: ["hot"],                     look: { color: "#f0e7da", top: "#a8501e" } },
  { id: 11, name: "黑糖珍珠鮮奶", cat: "fresh",   price: 5.5, oldPrice: 6.25,     tags: ["sale", "new", "pearl"],    look: { color: "#efe6d8", top: "#6b3a1c", bits: "pearl" } },
  { id: 12, name: "抹茶拿鐵",     cat: "fresh",   price: 5,                       tags: [],                          look: { color: "#f0e9dc", top: "#7aa33b" } },
  { id: 13, name: "檸檬紅茶",     cat: "fruit",   price: 3.75,                    tags: ["fruity"],                  look: { color: "#b8642a", bits: "fruit" } },
  { id: 14, name: "百香綠茶",     cat: "fruit",   price: 4,                       tags: ["fruity"],                  look: { color: "#e0b43a", bits: "fruit" } },
  { id: 15, name: "葡萄柚綠茶",   cat: "fruit",   price: 4.25,                    tags: ["fruity", "new"],           look: { color: "#e98a5e", bits: "fruit" } },
  { id: 16, name: "多多綠茶",     cat: "fruit",   price: 4,                       tags: [],                          look: { color: "#e8dc9a" } },
  { id: 17, name: "美式咖啡",     cat: "coffee",  price: 3.5,                     tags: [],                          look: { color: "#3b2416" } },
  { id: 18, name: "拿鐵",         cat: "coffee",  price: 4.5, oldPrice: 5.25,     tags: ["sale"],                    look: { color: "#efe4d4", top: "#6b4428" } },
  { id: 19, name: "冬瓜檸檬",     cat: "special", price: 3.75,                    tags: ["fruity"],                  look: { color: "#d9b56a", bits: "fruit" } },
  { id: 20, name: "芋頭鮮奶",     cat: "special", price: 5,                       tags: ["new"],                     look: { color: "#c9b2da" } },
];

// 首頁商品區塊：每一區顯示一個 tag 的商品
const SECTIONS = [
  { title: "本週熱銷", tag: "hot" },
  { title: "限時特價", tag: "sale" },
  { title: "新品上市", tag: "new" },
];

// 點飲料時的選項；pct 會在結帳練習時顯示成圖示提示（不顯示中文答案）
const OPTIONS = {
  sugar: [
    { name: "正常糖", pct: 100 }, { name: "少糖", pct: 70 }, { name: "半糖", pct: 50 },
    { name: "微糖", pct: 30 },    { name: "無糖", pct: 0 },
  ],
  ice: [
    { name: "正常冰", pct: 100 }, { name: "少冰", pct: 70 }, { name: "微冰", pct: 30 },
    { name: "去冰", pct: 0 },     { name: "熱", hot: true },
  ],
  size: [
    { name: "中杯", add: 0, mark: "M" }, { name: "大杯", add: 1, mark: "L" },
  ],
};

// 詞彙表：中文 → [拼音, 英文]
// 打開「拼音」「EN」時顯示；新增商品時記得在這裡加一行
const WORDS = {
  // 介面
  "首頁": ["shǒuyè", "Home"],
  "分類": ["fēnlèi", "Categories"],
  "優惠": ["yōuhuì", "Deals"],
  "購物車": ["gòuwùchē", "Cart"],
  "我": ["wǒ", "Me"],
  "甜度": ["tiándù", "Sweetness"],
  "冰塊": ["bīngkuài", "Ice"],
  "大小": ["dàxiǎo", "Size"],
  "數量": ["shùliàng", "Quantity"],
  "飲料": ["yǐnliào", "Drink"],
  "加入購物車": ["jiārù gòuwùchē", "Add to cart"],
  "馬上買": ["mǎshàng mǎi", "Buy now"],
  "結帳": ["jiézhàng", "Check out"],
  "小計": ["xiǎojì", "Subtotal"],
  "運費": ["yùnfèi", "Delivery fee"],
  "免運": ["miǎn yùn", "Free delivery"],
  "總共": ["zǒnggòng", "Total"],
  "查看全部": ["chákàn quánbù", "See all"],
  "我的訂單": ["wǒ de dìngdān", "My orders"],
  "用中文點飲料": ["yòng Zhōngwén diǎn yǐnliào", "Order in Chinese"],
  "送出訂單": ["sòngchū dìngdān", "Place order"],
  // 首頁區塊
  "本週熱銷": ["běnzhōu rèxiāo", "Best sellers"],
  "限時特價": ["xiànshí tèjià", "Limited-time sale"],
  "新品上市": ["xīnpǐn shàngshì", "New arrivals"],
  // 分類
  "純茶": ["chún chá", "Pure tea"],
  "奶茶": ["nǎichá", "Milk tea"],
  "鮮奶": ["xiānnǎi", "Fresh milk"],
  "果茶": ["guǒchá", "Fruit tea"],
  "咖啡": ["kāfēi", "Coffee"],
  "特調": ["tèdiào", "Specials"],
  // 快捷入口
  "新品": ["xīnpǐn", "New"],
  "熱銷": ["rèxiāo", "Popular"],
  "特價": ["tèjià", "On sale"],
  "珍珠": ["zhēnzhū", "Pearls"],
  "水果": ["shuǐguǒ", "Fruit"],
  // 商品
  "紅茶": ["hóngchá", "Black tea"],
  "綠茶": ["lǜchá", "Green tea"],
  "烏龍茶": ["wūlóngchá", "Oolong tea"],
  "四季春": ["sìjìchūn", "Four Seasons tea"],
  "珍珠奶茶": ["zhēnzhū nǎichá", "Bubble milk tea"],
  "布丁奶茶": ["bùdīng nǎichá", "Pudding milk tea"],
  "仙草奶茶": ["xiāncǎo nǎichá", "Grass jelly milk tea"],
  "珍珠鮮奶": ["zhēnzhū xiānnǎi", "Bubble fresh milk"],
  "紅茶拿鐵": ["hóngchá nátiě", "Black tea latte"],
  "黑糖珍珠鮮奶": ["hēitáng zhēnzhū xiānnǎi", "Brown sugar bubble milk"],
  "抹茶拿鐵": ["mǒchá nátiě", "Matcha latte"],
  "檸檬紅茶": ["níngméng hóngchá", "Lemon black tea"],
  "百香綠茶": ["bǎixiāng lǜchá", "Passion fruit green tea"],
  "葡萄柚綠茶": ["pútáoyòu lǜchá", "Grapefruit green tea"],
  "多多綠茶": ["duōduō lǜchá", "Yakult green tea"],
  "美式咖啡": ["měishì kāfēi", "Americano"],
  "拿鐵": ["nátiě", "Latte"],
  "冬瓜檸檬": ["dōngguā níngméng", "Winter melon lemonade"],
  "芋頭鮮奶": ["yùtou xiānnǎi", "Taro fresh milk"],
  // 選項
  "正常糖": ["zhèngcháng táng", "regular sugar"],
  "少糖": ["shǎo táng", "less sugar"],
  "半糖": ["bàn táng", "half sugar"],
  "微糖": ["wéi táng", "light sugar"],
  "無糖": ["wú táng", "no sugar"],
  "正常冰": ["zhèngcháng bīng", "regular ice"],
  "少冰": ["shǎo bīng", "less ice"],
  "微冰": ["wéi bīng", "light ice"],
  "去冰": ["qù bīng", "no ice"],
  "熱": ["rè", "hot"],
  "熱的": ["rè de", "hot"],
  "中杯": ["zhōng bēi", "medium"],
  "大杯": ["dà bēi", "large"],
  // 造句
  "我要": ["wǒ yào", "I'd like"],
};
