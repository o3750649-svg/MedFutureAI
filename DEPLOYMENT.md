# 🚀 دليل النشر الكامل - MedFutureAI

## 📋 جدول المحتويات
- [النشر السريع](#النشر-السريع)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [قاعدة البيانات](#قاعدة-البيانات)
- [SSL/HTTPS](#ssl-https)
- [المراقبة](#المراقبة)

---

## 🎯 النشر السريع

### بيانات تسجيل الدخول الافتراضية
```
Admin Username: FutureMed_AmrX
Admin Password: Fm@2045!MedX
```

⚠️ **مهم جداً**: غيّر كلمة المرور فوراً بعد النشر!

---

## 🌐 Frontend Deployment

### Option 1: Vercel (موصى به - مجاني)

```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. تسجيل الدخول
vercel login

# 3. البناء والنشر
npm run build
vercel --prod
```

**Environment Variables في Vercel:**
```env
GEMINI_API_KEY=your_actual_gemini_key
VITE_API_URL=https://your-backend-url.com/api
```

### Option 2: Netlify

```bash
# 1. تثبيت Netlify CLI
npm install -g netlify-cli

# 2. البناء
npm run build

# 3. النشر
netlify deploy --prod --dir=dist
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

### Option 3: Cloudflare Pages

```bash
# 1. Push للـ GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. اربط Cloudflare Pages بـ GitHub Repo
# 3. Build settings:
#    - Build command: npm run build
#    - Build output: dist
```

---

## 🖥️ Backend Deployment

### Option 1: Railway (أسهل وأسرع - مجاني)

1. **إنشاء حساب على Railway.app**
2. **New Project → Deploy from GitHub**
3. **اختر repo الخاص بك**
4. **إضافة Environment Variables:**
```env
NODE_ENV=production
PORT=3001
DB_PATH=./database.sqlite
ADMIN_USERNAME=FutureMed_AmrX
ADMIN_PASSWORD=YourNewSecurePassword123!
CORS_ORIGIN=https://your-frontend-url.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Deploy!**

Railway سيعطيك URL تلقائي مثل: `https://your-app.railway.app`

### Option 2: Render (مجاني مع قيود)

1. **إنشاء حساب على Render.com**
2. **New → Web Service**
3. **اختر GitHub repo**
4. **Settings:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment Variables: (نفس القائمة أعلاه)

### Option 3: VPS (Ubuntu/DigitalOcean/AWS)

#### التثبيت على Ubuntu 22.04

```bash
# 1. تحديث النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. تثبيت Nginx
sudo apt install nginx -y

# 4. رفع الكود
cd /var/www
sudo git clone https://github.com/mwr0855-rgb/MedFutureAI.git
cd MedFutureAI/backend

# 5. تثبيت التبعيات
sudo npm install --production

# 6. إعداد Environment
sudo nano .env
# املأ البيانات المطلوبة

# 7. تهيئة قاعدة البيانات
sudo npm run init-db

# 8. تثبيت PM2 لإدارة العمليات
sudo npm install -g pm2

# 9. تشغيل الـ Backend
pm2 start src/server.js --name medfuture-api
pm2 save
pm2 startup
```

#### إعداد Nginx كـ Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/medfuture
```

أضف هذا التكوين:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

تفعيل الموقع:

```bash
sudo ln -s /etc/nginx/sites-available/medfuture /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 SSL/HTTPS (Let's Encrypt)

### على VPS مع Nginx

```bash
# 1. تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. الحصول على شهادة SSL
sudo certbot --nginx -d api.yourdomain.com

# 3. التجديد التلقائي
sudo certbot renew --dry-run
```

Certbot سيضبط Nginx تلقائياً للـ HTTPS!

---

## 💾 قاعدة البيانات

### SQLite (الإعداد الحالي)

**المميزات:**
- ✅ سريع جداً
- ✅ بدون إعداد معقد
- ✅ مناسب لـ 10,000+ مستخدم
- ✅ ملف واحد سهل النسخ الاحتياطي

**النسخ الاحتياطي:**
```bash
# يومي
0 2 * * * cp /path/to/database.sqlite /backups/db-$(date +\%Y\%m\%d).sqlite

# أسبوعي (الاحتفاظ بـ 4 نسخ)
0 3 * * 0 find /backups -name "db-*.sqlite" -mtime +28 -delete
```

### الترقية لـ PostgreSQL (للتطبيقات الكبيرة)

إذا تجاوز عدد المستخدمين 50,000:

```bash
# 1. تثبيت PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 2. تثبيت pg في Node.js
cd backend
npm install pg

# 3. إنشاء قاعدة البيانات
sudo -u postgres psql
CREATE DATABASE medfutureai;
CREATE USER medfuture WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE medfutureai TO medfuture;
\q

# 4. تعديل backend/src/config/database.js
# استبدل better-sqlite3 بـ pg
```

---

## 📊 المراقبة

### Uptime Monitoring

**UptimeRobot (مجاني):**
1. سجل على uptimerobot.com
2. أضف monitor جديد
3. URL: `https://your-backend-url.com/api/health`
4. فعّل Email/SMS alerts

### Application Monitoring

**PM2 Monitoring (مجاني):**
```bash
pm2 install pm2-server-monit
pm2 monit
```

### Logs

```bash
# عرض logs حية
pm2 logs medfuture-api

# عرض آخر 100 سطر
pm2 logs medfuture-api --lines 100

# حفظ logs في ملف
pm2 logs medfuture-api >> /var/log/medfuture.log
```

---

## 🔄 التحديثات

### تحديث Frontend

```bash
# على Vercel/Netlify - تلقائي عند git push
git add .
git commit -m "Update frontend"
git push origin main
```

### تحديث Backend

```bash
# على VPS
cd /var/www/MedFutureAI
git pull origin main
cd backend
npm install --production
pm2 restart medfuture-api
```

### Rollback في حالة المشاكل

```bash
git log --oneline  # شوف آخر commits
git checkout <commit-hash>  # ارجع لـ commit معين
pm2 restart medfuture-api
```

---

## 🛡️ الأمان - Checklist

- [ ] غيّر كلمة مرور الأدمن الافتراضية
- [ ] فعّل HTTPS (SSL) على كل الدومينات
- [ ] اضبط CORS بشكل صحيح (CORS_ORIGIN في .env)
- [ ] فعّل Firewall (ufw على Ubuntu)
- [ ] استخدم Environment Variables لكل الأسرار
- [ ] فعّل rate limiting (موجود افتراضياً)
- [ ] راجع logs بشكل دوري
- [ ] اعمل نسخ احتياطية يومية
- [ ] حدّث التبعيات بشكل دوري (`npm audit fix`)

---

## 📈 Scaling (في المستقبل)

### إذا زاد الحمل:

1. **Load Balancer** - وزع الطلبات على عدة servers
2. **Redis Cache** - لتسريع الاستعلامات المتكررة
3. **CDN** - لـ static files (frontend)
4. **Database Replication** - نسخ متعددة من قاعدة البيانات
5. **Horizontal Scaling** - إضافة servers بدل تحسين server واحد

---

## 🆘 الدعم

إذا واجهت مشاكل:
1. راجع [README.md](README.md) أولاً
2. تحقق من logs: `pm2 logs medfuture-api`
3. افتح issue على GitHub
4. تواصل مع المطور: [@mwr0855-rgb](https://github.com/mwr0855-rgb)

---

<div align="center">
  <sub>Built with ❤️ by Amr AI | Deployment Guide v1.0</sub>
</div>
