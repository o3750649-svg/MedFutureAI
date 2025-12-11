# 🚀 دليل النشر على Render - MedFutureAI

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر مشروع MedFutureAI على منصة Render باستخدام قاعدة بيانات Supabase PostgreSQL.

---

## ⚙️ المتطلبات الأساسية

### 1. حساب Render
- قم بإنشاء حساب مجاني على [Render.com](https://render.com)
- اربط حسابك بـ GitHub

### 2. قاعدة بيانات Supabase
- حساب على [Supabase](https://supabase.com)
- قاعدة بيانات PostgreSQL جاهزة
- رابط الاتصال (DATABASE_URL)

### 3. مفاتيح API
- **GEMINI_API_KEY**: من [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OPENAI_API_KEY** (اختياري): من [OpenAI Platform](https://platform.openai.com)
- **DEEPSEEK_API_KEY** (اختياري): من [DeepSeek](https://deepseek.com)

---

## 🔐 المتغيرات البيئية المطلوبة

### للـ Backend Service

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@host:5432/database
ADMIN_USERNAME=Nabd_Admin_27
ADMIN_PASSWORD=P@t!ent#2025^Secure
CORS_ORIGIN=https://futuredoc-ai-amr.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### للـ Frontend Service

```env
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📝 خطوات النشر

### الخطوة 1: تحضير المشروع

```bash
# 1. استنساخ المشروع
git clone https://github.com/mwr0855-rgb/MedFutureAI.git
cd MedFutureAI

# 2. تشغيل سكريبت الإعداد
./setup-deployment.sh

# 3. التأكد من عمل كل شيء محلياً
npm run start:all
```

### الخطوة 2: رفع المشروع إلى GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### الخطوة 3: إعداد Backend على Render

1. سجل الدخول إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط **"New +"** → **"Web Service"**
3. اربط مستودع GitHub الخاص بك
4. املأ الإعدادات:
   - **Name**: `futuredoc-ai-amr-backend`
   - **Region**: `Oregon` (أو الأقرب لك)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

5. أضف المتغيرات البيئية (انظر القسم أعلاه)
6. اضغط **"Create Web Service"**

### الخطوة 4: إعداد Frontend على Render

1. اضغط **"New +"** → **"Static Site"**
2. اربط نفس المستودع
3. املأ الإعدادات:
   - **Name**: `futuredoc-ai-amr-frontend`
   - **Region**: `Oregon`
   - **Branch**: `main`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`

4. أضف المتغيرات البيئية:
   ```
   NODE_ENV=production
   GEMINI_API_KEY=your_key_here
   ```

5. اضغط **"Create Static Site"**

### الخطوة 5: تهيئة قاعدة البيانات

بعد نشر الـ Backend بنجاح، قم بتهيئة قاعدة البيانات:

```bash
# استخدم Render Shell أو قم بتشغيل هذا الأمر عبر SSH
cd backend && npm run init-postgres-db
```

أو يمكنك تشغيل SQL مباشرة في Supabase:

```sql
-- انسخ محتوى backend/schema-postgres.sql
-- والصقه في SQL Editor في Supabase
```

---

## 🔧 استكشاف الأخطاء وحلها

### خطأ: "vite: not found"
**السبب**: Frontend يحاول التشغيل في وضع التطوير بدلاً من البناء  
**الحل**: تأكد من أن `render.yaml` يستخدم:
- `type: static` للـ Frontend
- `buildCommand: npm install --legacy-peer-deps && npm run build`

### خطأ: "DATABASE_URL not found"
**السبب**: المتغير البيئي غير محدد  
**الحل**: 
1. اذهب إلى Render Dashboard
2. افتح الـ Backend Service
3. اذهب إلى "Environment"
4. أضف `DATABASE_URL` بالقيمة الصحيحة

### خطأ: "Connection refused"
**السبب**: Backend لم يبدأ بعد أو هناك خطأ في البناء  
**الحل**:
1. تحقق من الـ Logs في Render Dashboard
2. تأكد من تثبيت جميع التبعيات
3. تحقق من صحة `DATABASE_URL`

### خطأ: "CORS Policy"
**السبب**: Frontend و Backend على نطاقات مختلفة  
**الحل**: تأكد من أن `CORS_ORIGIN` في Backend يطابق رابط Frontend

---

## 📊 مراقبة الأداء

### Health Checks
- Backend: `https://your-backend.onrender.com/api/health`
- يجب أن يعيد: `{"success": true, "message": "Backend is running"}`

### Logs
- افتح Service في Render Dashboard
- اذهب إلى "Logs" tab
- راقب الأخطاء والتحذيرات

---

## 🔄 التحديثات والصيانة

### تحديث الكود
```bash
# 1. قم بالتعديلات المطلوبة
git add .
git commit -m "Update description"
git push origin main

# 2. Render سيقوم بالنشر تلقائياً (Auto Deploy)
```

### نسخ احتياطي لقاعدة البيانات
```bash
# في Supabase Dashboard
# اذهب إلى Database → Backups
# قم بإنشاء نسخة احتياطية يدوية
```

---

## 🎯 نصائح مهمة

1. **استخدم Free Tier بحكمة**: الـ Free Tier على Render ينام بعد 15 دقيقة من عدم النشاط
2. **SSL تلقائي**: Render يوفر شهادات SSL مجانية
3. **المتغيرات السرية**: لا تضع المفاتيح السرية في الكود، استخدم Environment Variables
4. **المراقبة**: راقب الـ Logs بانتظام لاكتشاف المشاكل مبكراً
5. **النسخ الاحتياطي**: قم بعمل نسخ احتياطية دورية لقاعدة البيانات

---

## 📞 الدعم والمساعدة

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/mwr0855-rgb/MedFutureAI/issues

---

## ✅ قائمة التحقق النهائية

- [ ] قاعدة البيانات Supabase معدة وجاهزة
- [ ] جميع المتغيرات البيئية محددة بشكل صحيح
- [ ] Backend Service يعمل ويستجيب لـ /api/health
- [ ] Frontend Site يتم بناؤه بنجاح
- [ ] CORS معد بشكل صحيح
- [ ] حساب Admin تم إنشاؤه في قاعدة البيانات
- [ ] اختبار تسجيل الدخول والوظائف الأساسية

---

<div align="center">
  <sub>Built with ❤️ by Amr AI</sub>
</div>
