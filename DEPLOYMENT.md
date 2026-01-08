# 🚀 NABIDH AI - Deployment & Setup Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

**NABIDH AI** is an advanced medical assistant platform powered by:
- **Gemini 2.0 Flash** (Primary AI Engine)
- **Supabase** (PostgreSQL Database)
- **React + TypeScript** (Frontend)
- **Optional**: DeepSeek & OpenAI (Enhanced capabilities)

---

## ⚙️ Prerequisites

Before you begin, ensure you have:

### Required Software
- **Node.js** 18+ (LTS recommended)
- **npm** 8+ or **pnpm** 8+
- **Git** for version control

### Required API Keys
1. **Gemini API Key** (Google AI Studio)
   - Get yours at: https://makersuite.google.com/app/apikey
   
2. **Supabase Account**
   - Sign up at: https://supabase.com
   - Create a new project

### Optional API Keys
3. **DeepSeek API** (Enhanced reasoning)
   - Get yours at: https://platform.deepseek.com/

4. **OpenAI API** (GPT-4 fallback)
   - Get yours at: https://platform.openai.com/api-keys

---

## 🔐 Environment Setup

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd webapp
```

### Step 2: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 3: Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your credentials:

```env
# ===================================
# REQUIRED CREDENTIALS
# ===================================

# Gemini API (Primary AI Engine)
API_KEY=AIzaSy...your_actual_key_here

# Supabase Configuration
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbG...your_actual_key_here

# ===================================
# OPTIONAL CREDENTIALS
# ===================================

# DeepSeek API (Enhanced Reasoning)
# DEEPSEEK_API_KEY=sk-...your_key_here

# OpenAI API (GPT-4 Fallback)
# OPENAI_API_KEY=sk-...your_key_here
```

**⚠️ SECURITY WARNING:**
- NEVER commit `.env.local` to version control
- Use environment variables on deployment platforms
- Rotate keys regularly

---

## 🗄️ Database Setup

### Step 1: Access Supabase Dashboard
1. Go to your project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to **SQL Editor**

### Step 2: Run Database Schema
1. Open `/backend/schema.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run**

### Step 3: Verify Table Creation
Check that the `users` table was created:
```sql
SELECT * FROM users;
```

### Step 4: Configure Row Level Security (RLS)
The schema automatically enables RLS. Verify policies in:
- **Authentication** → **Policies**

---

## 💻 Local Development

### Start Development Server
```bash
npm run dev
```

The app will be available at:
- **Local**: http://localhost:5173
- **Network**: http://YOUR_IP:5173

### Development Features
- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript type checking
- ✅ Real-time error overlay
- ✅ Auto-restart on file changes

### Testing Admin Access
- Username: `Nabdh_Admin_27`
- Password: `P@t!ent#2025^Secure`

---

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

Output will be in `/dist` folder.

### Deployment Platforms

#### 1. **Render.com** (Recommended)
1. Connect your GitHub repository
2. Select **Static Site** service
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables in Render dashboard
5. Deploy!

#### 2. **Vercel**
```bash
npm i -g vercel
vercel --prod
```

#### 3. **Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### 4. **Cloudflare Pages**
1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

### Environment Variables on Platforms

**Render / Vercel / Netlify:**
Add in dashboard:
```
API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails with "Heap Out of Memory"
**Solution:**
```bash
# Already fixed in package.json
NODE_OPTIONS='--max-old-space-size=1024' npm run build
```

#### 2. "API_KEY is missing" Error
**Solution:**
- Ensure `.env.local` exists
- Check for typos in variable names
- Restart dev server after adding keys

#### 3. Supabase Connection Fails
**Solution:**
- Verify Supabase URL and key
- Check if project is paused (free tier)
- Ensure RLS policies are configured

#### 4. Gemini API Errors
**Possible Causes:**
- Invalid API key
- Quota exceeded
- Model name incorrect (use `gemini-2.0-flash-exp`)

**Solution:**
```bash
# Verify API key works:
curl https://generativelanguage.googleapis.com/v1beta/models \
  -H "x-goog-api-key: YOUR_API_KEY"
```

#### 5. Build is Too Slow
**Solution:**
- Build is optimized but may take 2-3 minutes
- Uses code splitting and tree shaking
- Production build includes minification

---

## 🔒 Security Best Practices

### 1. Environment Variables
✅ **DO:**
- Use platform environment variables in production
- Rotate API keys every 3-6 months
- Use separate keys for dev/staging/prod

❌ **DON'T:**
- Commit `.env.local` to Git
- Share keys in chat/email
- Use production keys in development

### 2. Database Security
✅ **Enabled:**
- Row Level Security (RLS)
- Anon key for public queries only
- Service role for admin operations

✅ **Recommended:**
- Enable Supabase email notifications
- Set up database backups
- Monitor usage in Supabase dashboard

### 3. Admin Access
✅ **Required:**
- Change default admin credentials
- Use strong passwords (20+ characters)
- Enable 2FA on Supabase account

### 4. API Rate Limiting
✅ **Implemented:**
- Error handling for quota exceeded
- Retry logic with exponential backoff
- User session validation

---

## 📊 Monitoring & Maintenance

### Check System Health
1. **Supabase Dashboard** → Database → Logs
2. **API Usage** → Check Gemini quota
3. **Error Logs** → Browser console in production

### Regular Maintenance Tasks
- [ ] Weekly: Check Supabase storage usage
- [ ] Monthly: Review error logs
- [ ] Quarterly: Rotate API keys
- [ ] Yearly: Update dependencies

---

## 📚 Additional Resources

### Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

### Support
- **Technical Issues**: Check `/services/errorHandler.ts` logs
- **Database Issues**: Supabase Dashboard → Logs
- **API Issues**: Check browser Network tab

---

## 🎉 Success Checklist

Before going live, verify:

- [ ] ✅ All environment variables configured
- [ ] ✅ Database schema deployed
- [ ] ✅ RLS policies enabled
- [ ] ✅ Admin credentials changed
- [ ] ✅ Test login with activation code
- [ ] ✅ Test all AI features (diagnosis, meds, labs)
- [ ] ✅ Verify mobile responsiveness
- [ ] ✅ Check browser console for errors
- [ ] ✅ Set up monitoring/alerts
- [ ] ✅ Document custom configurations

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-08 | Complete system overhaul, Gemini 2.0, enhanced error handling |
| 1.5.0 | 2025-12-15 | Added admin dashboard, subscription system |
| 1.0.0 | 2025-11-01 | Initial release |

---

**Built with ❤️ by Amr Ai**

For more information, visit: [Your Website/Docs URL]
