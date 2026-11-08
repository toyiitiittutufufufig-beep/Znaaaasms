// عدّل القوائم دي حسب اللي مزوّدك بيدعمه (اكواد الخدمات والدول بتاعة sms-activate)
export const SERVICES = [
  { code: "wa", name: "WhatsApp" }, { code: "tg", name: "Telegram" },
  { code: "fb", name: "Facebook" }, { code: "ig", name: "Instagram" },
  { code: "go", name: "Google / Gmail" }, { code: "tw", name: "Twitter / X" },
  { code: "ds", name: "Discord" }, { code: "lf", name: "TikTok" },
  { code: "fu", name: "Snapchat" }, { code: "ub", name: "Uber" },
  { code: "am", name: "Amazon" }, { code: "ot", name: "Any other" },
];

export const COUNTRIES = [
  { id: "0", name: "Russia", iso: "RU" }, { id: "1", name: "Ukraine", iso: "UA" },
  { id: "2", name: "Kazakhstan", iso: "KZ" }, { id: "3", name: "China", iso: "CN" },
  { id: "4", name: "Philippines", iso: "PH" }, { id: "6", name: "Indonesia", iso: "ID" },
  { id: "7", name: "Malaysia", iso: "MY" }, { id: "8", name: "Kenya", iso: "KE" },
  { id: "10", name: "Vietnam", iso: "VN" }, { id: "12", name: "USA", iso: "US" },
  { id: "15", name: "Poland", iso: "PL" }, { id: "16", name: "United Kingdom", iso: "GB" },
  { id: "19", name: "Nigeria", iso: "NG" }, { id: "21", name: "Egypt", iso: "EG" },
  { id: "22", name: "India", iso: "IN" }, { id: "31", name: "South Africa", iso: "ZA" },
  { id: "33", name: "Colombia", iso: "CO" }, { id: "36", name: "Canada", iso: "CA" },
  { id: "37", name: "Morocco", iso: "MA" }, { id: "43", name: "Germany", iso: "DE" },
  { id: "48", name: "Netherlands", iso: "NL" }, { id: "52", name: "Thailand", iso: "TH" },
  { id: "53", name: "Saudi Arabia", iso: "SA" }, { id: "54", name: "Mexico", iso: "MX" },
  { id: "56", name: "Spain", iso: "ES" }, { id: "58", name: "Algeria", iso: "DZ" },
  { id: "60", name: "Bangladesh", iso: "BD" }, { id: "62", name: "Turkey", iso: "TR" },
  { id: "66", name: "Pakistan", iso: "PK" }, { id: "73", name: "Brazil", iso: "BR" },
  { id: "78", name: "France", iso: "FR" }, { id: "86", name: "Italy", iso: "IT" },
];

export const flag = (iso: string) =>
  iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
export const serviceName = (c: string) => SERVICES.find((s) => s.code === c)?.name ?? c;
export const countryOf = (id: string) => COUNTRIES.find((c) => c.id === id);
