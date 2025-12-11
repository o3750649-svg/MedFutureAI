# 🏥 MedFutureAI - نظام التشخيص الطبي المتقدم

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Node-v18+-brightgreen" alt="Node">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB" alt="React">
</div>

## 📋 نظرة عامة

MedFutureAI هو نظام طبي متقدم مدعوم بالذكاء الاصطناعي يوفر:
- 🩺 تحليل الأعراض والتشخيص الطبي
- 💊 تعريف الأدوية والمعلومات الدوائية
- 🧪 تحليل نتائج الفحوصات المخبرية
- 🏃 خطط العافية الشخصية
- 🧬 تحليل البيانات الجينومية
- 👤 التوأم الرقمي للمريض
- 💬 مساعد طبي ذكي بالدردشة

## 🏗️ معمارية النظام

### Frontend (React + TypeScript + Vite)
- **Framework**: React 19.2 مع TypeScript
- **UI**: TailwindCSS + Three.js للخلفيات ثلاثية الأبعاد
- **AI Integration**: Google Gemini API
- **Local Storage**: البيانات الشخصية (التوأم الرقمي) تُحفظ محلياً للخصوصية

### Backend (Node.js + Express + SQLite)
- **Framework**: Express.js
- **Database**: SQLite (قاعدة بيانات سريعة ومدمجة)
- **Authentication**: Session-based auth
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcrypt

### قاعدة البيانات
تخزن البيانات التالية فقط:
- ✅ أكواد الاشتراكات ومعلومات العملاء
- ✅ حالة الحسابات (نشط/مجمد/محظور)
- ✅ تواريخ الانتهاء والتجديد
- ✅ سجلات تدقيق الأدمن

**الخصوصية محفوظة:** البيانات الطبية الشخصية تبقى على جهاز المستخدم فقط!

---

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### 1️⃣ تثبيت Frontend
```bash
# Clone المشروع
git clone https://github.com/mwr0855-rgb/MedFutureAI.git
cd MedFutureAI

# تثبيت التبعيات
npm install --legacy-peer-deps

# إعداد المتغيرات البيئية
cp .env.example .env.local
# عدّل .env.local وأضف Gemini API key
```

### 2️⃣ تثبيت Backend
```bash
# الدخول لمجلد Backend
cd backend

# تثبيت التبعيات
npm install

# إعداد المتغيرات البيئية
cp .env.example .env
# عدّل .env إذا لزم الأمر

# تهيئة قاعدة البيانات وإنشاء حساب الأدمن
npm run init-db
```

### 3️⃣ تشغيل النظام

#### طريقة 1: تشغيل كل شيء مرة واحدة
```bash
# من المجلد الرئيسي
npm run start:all
```

#### طريقة 2: تشغيل منفصل
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (في terminal جديد)
npm run dev
```

### 4️⃣ الوصول للنظام
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🔐 بيانات تسجيل الدخول للأدمن

```
Username: FutureMed_AmrX
Password: Fm@2045!MedX#99
```

⚠️ **تحذير أمني**: غيّر كلمة المرور في الإنتاج عبر تعديل `backend/.env`

---

## 📁 هيكل المشروع

```
MedFutureAI/
├── frontend/
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DigitalTwinDashboard.tsx
│   │   │   └── ...
│   │   ├── services/          # Business Logic
│   │   │   ├── api.ts         # Backend API calls
│   │   │   ├── authService.ts # Authentication
│   │   │   ├── geminiService.ts # AI Integration
│   │   │   └── dbAdapter.ts   # Compatibility layer
│   │   ├── App.tsx            # Main App
│   │   └── types.ts           # TypeScript Types
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/            # Configuration
│   │   │   ├── database.js    # SQLite setup
│   │   │   └── init-db.js     # DB initialization
│   │   ├── models/            # Data Models
│   │   │   ├── User.js
│   │   │   └── Admin.js
│   │   ├── routes/            # API Routes
│   │   │   ├── auth.js        # Authentication
│   │   │   └── admin.js       # Admin management
│   │   ├── middleware/        # Middleware
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   └── server.js          # Express server
│   ├── schema.sql             # Database schema
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🛠️ API Endpoints

### Authentication
```http
POST /api/auth/verify
POST /api/auth/admin/login
POST /api/auth/admin/logout
```

### Admin Management
```http
GET  /api/admin/users           # Get all users
POST /api/admin/generate-code   # Generate subscription code
POST /api/admin/ban/:code       # Ban user
POST /api/admin/unban/:code     # Unban user
POST /api/admin/renew/:code     # Renew subscription
DELETE /api/admin/user/:code    # Delete user
GET  /api/admin/audit-logs      # Get audit logs
```

---

## 🔒 الأمان والخصوصية

### المميزات الأمنية
- ✅ Helmet.js للحماية من الثغرات الشائعة
- ✅ CORS للتحكم في الوصول
- ✅ Rate Limiting لمنع هجمات DDoS
- ✅ bcrypt لتشفير كلمات المرور
- ✅ Input validation للحماية من SQL Injection
- ✅ Session-based authentication
- ✅ Audit logs لتتبع إجراءات الأدمن

### سياسة الخصوصية
1. **البيانات الطبية الشخصية**: تُخزن فقط على جهاز المستخدم (localStorage)
2. **بيانات الاشتراك**: في قاعدة البيانات (الاسم، الكود، التواريخ فقط)
3. **حق المسح**: يمكن للمستخدم حذف بياناته بالكامل
4. **لا بيع للبيانات**: البيانات لا تُباع لأطراف ثالثة

---

## 🚢 النشر للإنتاج

### Frontend (Vercel / Netlify / Cloudflare Pages)

#### Vercel
```bash
npm run build
vercel --prod
```

#### Environment Variables
```env
VITE_API_URL=https://your-backend-api.com/api
GEMINI_API_KEY=your_production_key
```

### Backend (VPS / Cloud / Railway)

#### على VPS (Ubuntu/Debian)
```bash
# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# رفع الكود
git clone https://github.com/mwr0855-rgb/MedFutureAI.git
cd MedFutureAI/backend

# التثبيت
npm install --production

# إعداد Environment
nano .env  # عدّل المتغيرات

# تشغيل بـ PM2 (Process Manager)
npm install -g pm2
pm2 start src/server.js --name medfuture-api
pm2 save
pm2 startup
```

#### Railway.app (أسرع طريقة)
1. Push الكود لـ GitHub
2. اربط Railway بـ GitHub
3. اختر المشروع
4. ضع Environment Variables
5. Deploy!

### قاعدة البيانات في الإنتاج
- **للتطبيقات الصغيرة**: SQLite (سريع ومدمج)
- **للتطبيقات الكبيرة**: انقل لـ PostgreSQL أو MySQL
  ```bash
  npm install pg  # for PostgreSQL
  # عدّل database.js للاتصال بـ PostgreSQL
  ```

---

## 📊 المراقبة والصيانة

### Logs
```bash
# Backend logs
cd backend
pm2 logs medfuture-api

# Database backup
cp database.sqlite backups/database-$(date +%Y%m%d).sqlite
```

### تحديث النظام
```bash
git pull origin main
cd backend && npm install
pm2 restart medfuture-api
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتصل Frontend بـ Backend
**الحل:**
```bash
# تأكد من تشغيل Backend
cd backend && npm run dev

# تحقق من VITE_API_URL في .env.local
echo $VITE_API_URL  # يجب أن يكون http://localhost:3001/api
```

### المشكلة: خطأ في قاعدة البيانات
**الحل:**
```bash
cd backend
rm database.sqlite  # احذف القاعدة القديمة
npm run init-db     # أعد التهيئة
```

### المشكلة: خطأ CORS
**الحل:**
عدّل `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت **MIT License** - راجع ملف [LICENSE](LICENSE) للتفاصيل

---

## 👨‍💻 المطور

**Amr AI (mwr0855-rgb)**
- GitHub: [@mwr0855-rgb](https://github.com/mwr0855-rgb)
- Project: [MedFutureAI](https://github.com/mwr0855-rgb/MedFutureAI)

---

## 🙏 الشكر والتقدير

- **Google Gemini AI** - للذكاء الاصطناعي الطبي
- **React** - لـ UI framework
- **Express.js** - للـ backend
- **SQLite** - لقاعدة البيانات
- **المجتمع المفتوح المصدر** - للأدوات المذهلة

---

<div align="center">
  <sub>Built with ❤️ by Amr AI</sub>
</div>
