// ⚠️ كل الاعدادات هنا بدل متغيرات Vercel. ارفع المشروع على GitHub Private فقط!
export const config = {
  databaseUrl: "postgresql://neondb_owner:npg_te9QPkjmYCB8@ep-shy-cake-bdnf8to9.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require",
  sessionSecret: "Ihb8271whwgGhgkwuwvhwitt88skwagkeuyegah2874", // لو غيّرته بعدين المفاتيح المحفوظة ما هتتفتحش
  cronSecret: "Xk9mQ2vLp7RtZ4wN8cBf3HjA6sD1",
  admin: { username: "adminyoussef", password: "50666900yuyu" }, // أول أدمن (يتعمل بالـ seed)
  virtualsms: {
    baseUrl: "https://api.virtualsms.de/stubs/handler_api",
    apiKey: "ceZW5sJKgbnS085oUcnX5Rf30DNZyVCM",
    poolProvider: "", // اختياري
  },
  activationMinutes: 20,
  markupPercent: 20, // هامش ربحك فوق سعر المزوّد
  currency: "$",
  secureCookies: false,
};
