# ⚡ Quick Start Guide - MedFutureAI

## 🎯 Get Running in 5 Minutes!

### Prerequisites
```bash
Node.js 18+ installed
Git installed
```

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/mwr0855-rgb/MedFutureAI.git
cd MedFutureAI

# 2. Install Frontend dependencies
npm install --legacy-peer-deps

# 3. Install Backend dependencies
cd backend
npm install
cd ..

# 4. Setup environment files
cp .env.example .env.local
cp backend/.env.example backend/.env

# 5. Initialize the database
cd backend
npm run init-db
cd ..
```

---

## 🔑 Configure API Keys

### Frontend (.env.local)
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:3001/api
```

**Get Gemini API Key**: https://makersuite.google.com/app/apikey

### Backend (backend/.env)
Already configured! But you should change the admin password:
```env
ADMIN_PASSWORD=YourNewSecurePassword123!
```

---

## 🚀 Run the Application

### Option 1: Run Everything (Recommended)
```bash
npm run start:all
```

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (new terminal)
npm run dev
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🔐 Login Credentials

### Admin Dashboard
```
Username: FutureMed_AmrX
Password: Fm@2045!MedX
```

⚠️ **Security**: Change this password immediately in production!

---

## 📱 Using the System

### 1. Admin Login
1. Click "مدخل الإدارة" (Admin Portal) on login page
2. Enter admin credentials
3. Generate subscription codes for users

### 2. Generate User Code
1. Enter customer name
2. Choose plan (Monthly 99 EGP / Yearly 999 EGP)
3. Copy the generated code
4. Give code to customer

### 3. User Login
1. User enters their subscription code
2. System activates on first use
3. User can access all medical features

### 4. Medical Features
- 🩺 **Symptom Analysis**: Describe symptoms, get AI diagnosis
- 💊 **Medication ID**: Scan/describe medicine for info
- 🧪 **Lab Results**: Upload lab reports for analysis
- 🏃 **Wellness Plans**: Get personalized health plans
- 🧬 **Genomics**: Analyze genetic data
- 👤 **Digital Twin**: Track health metrics
- 💬 **AI Chat**: Ask medical questions

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:3001/api/health

# Admin login
curl -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"FutureMed_AmrX","password":"Fm@2045!MedX"}'
```

### Test Frontend
1. Open http://localhost:5173
2. Should see login page
3. Try admin login
4. Generate a test code
5. Logout and login with user code

---

## 🐛 Common Issues

### Issue: Backend won't start
**Solution**:
```bash
cd backend
rm database.sqlite
npm run init-db
npm start
```

### Issue: Frontend can't connect to backend
**Solution**:
Check `.env.local`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Issue: Admin login fails
**Solution**:
Password is: `Fm@2045!MedX` (without #99)

### Issue: CORS errors
**Solution**:
Check `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

---

## 📚 Next Steps

1. ✅ Read [README.md](README.md) for full documentation
2. ✅ Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
3. ✅ Review [CHANGELOG.md](CHANGELOG.md) for version history
4. ✅ Customize the system for your needs
5. ✅ Deploy to production!

---

## 🎓 Learn More

### Project Structure
```
MedFutureAI/
├── frontend/                 # React app
│   ├── components/          # UI components
│   ├── services/            # API & business logic
│   └── App.tsx             # Main app
├── backend/                 # Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Data models
│   │   └── server.js       # Main server
│   └── database.sqlite     # SQLite DB
└── README.md               # Documentation
```

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js + SQLite
- **AI**: Google Gemini
- **UI**: TailwindCSS + Three.js

---

## 💡 Tips

1. **Development**: Use `npm run start:all` to run both servers
2. **Production**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Database**: Auto-created on first run
4. **Backups**: Copy `backend/database.sqlite` regularly
5. **Updates**: `git pull && npm install`

---

## 🆘 Need Help?

- 📖 **Full Docs**: [README.md](README.md)
- 🚀 **Deploy Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 **Report Bug**: [GitHub Issues](https://github.com/mwr0855-rgb/MedFutureAI/issues)
- 💬 **Questions**: Open a discussion on GitHub

---

<div align="center">
  <sub>Ready to revolutionize healthcare! 🏥✨</sub>
  <br>
  <sub>Built with ❤️ by Amr AI</sub>
</div>
