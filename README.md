# SMS Panel — تشغيل المشروع

## 1) الاعدادات
افتح `src/config.ts` وعدّل: databaseUrl (من Neon/Supabase)، sessionSecret، cronSecret، admin (يوزر وباسورد اول ادمن)، virtualsms.apiKey، markupPercent.
وفي `vercel.json` ضع نفس قيمة cronSecret بدل CHANGE_ME.

## 2) تشغيل محلي (مرة واحدة للتجهيز)
```
npm install
npm run db:push     # بينشئ الجداول (بيقرأ الرابط من config.ts)
npm run seed        # بينشئ الادمن
npm run dev         # http://localhost:3000
```

## 3) النشر على Vercel
ارفع المشروع (GitHub Private او vercel CLI) → Deploy. مفيش متغيرات لازم تضيفها.
(الجداول اتعملت بالفعل من الخطوة 2 على نفس قاعدة البيانات.)

## 4) ملاحظات
- لو الـ cron على Hobby: مرة يوميًا. الاسترجاع الفوري بيتم اصلا عند getStatus.
- عدّل `src/lib/catalog.ts` لقوائم الخدمات والدول حسب المزوّد.
