<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🏥 NABIDH AI - Future Medical Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-blueviolet.svg)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg)](https://vitejs.dev/)

**An AI-powered medical assistant platform that provides futuristic diagnostics, personalized treatment plans, and proactive preventative care.**

[🚀 Live Demo](https://ai.studio/apps/drive/130ls-BBs9KWPDkKTznoXjwtat11K0LaY) | [📖 Documentation](./DEPLOYMENT.md) | [🔌 API Docs](./API_DOCUMENTATION.md)

</div>

---

## ✨ Features

### 🔬 Core Capabilities
- **🩺 Symptom Analysis** - AI-powered diagnosis with differential diagnosis
- **💊 Medication Identification** - Identify pills and medications from images
- **🧪 Lab Results Analysis** - Comprehensive interpretation of medical tests
- **🌿 Wellness Planning** - Personalized health and prevention strategies
- **🧬 Genomics Analysis** - DNA data interpretation and risk assessment
- **💬 Medical Chat Assistant** - Interactive AI conversations with streaming

### 🎯 Advanced Features
- **🔐 Secure Authentication** - Code-based subscription system
- **👨‍💼 Admin Dashboard** - Complete user and subscription management
- **📊 Digital Twin** - Personal health tracking and visualization
- **🌍 Arabic Language** - Full RTL support and Arabic interface
- **📱 Responsive Design** - Works seamlessly on all devices
- **🎨 Futuristic UI** - 3D backgrounds and modern glassmorphism design

---

## 🏗️ Architecture

### Technology Stack

```
Frontend:
├── React 18.2          # UI Framework
├── TypeScript 5.2      # Type Safety
├── Vite 5.2           # Build Tool
├── Three.js           # 3D Graphics
└── TailwindCSS        # Styling

Backend Services:
├── Gemini 2.0 Flash   # Primary AI Engine
├── Supabase           # PostgreSQL Database
├── DeepSeek (Optional) # Enhanced Reasoning
└── OpenAI (Optional)  # GPT-4 Fallback
```

### AI Routing Architecture

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
┌──────▼────────────────────────┐
│  Smart Router                 │
│  (geminiService.ts)           │
└──────┬────────────────────────┘
       │
       ├──► [Has Image?] ──► Gemini 2.0 Flash
       │
       ├──► [Text Only]
       │    ├──► Try DeepSeek (Logic)
       │    ├──► Try OpenAI (Language)
       │    └──► Gemini (Fallback)
       │
       └──► [Streaming Chat] ──► Gemini Native
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS)
- npm 8+ or pnpm 8+
- Gemini API key
- Supabase account

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd webapp

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Set up database
# Run backend/schema.sql in Supabase SQL Editor

# 5. Start development server
npm run dev
```

**Access the app:**
- Local: http://localhost:5173
- Network: http://YOUR_IP:5173

### Configuration

**Required Environment Variables:**
```env
API_KEY=your_gemini_api_key
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Optional (Enhanced Features):**
```env
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

---

## 📦 Project Structure

```
webapp/
├── components/              # React components
│   ├── AdminDashboard.tsx   # Admin panel
│   ├── LoginPage.tsx        # Authentication
│   ├── DigitalTwinDashboard.tsx  # Health tracking
│   ├── InputArea.tsx        # Symptom input
│   ├── ChatArea.tsx         # AI chat interface
│   └── ...                  # Other components
├── services/                # Business logic
│   ├── geminiService.ts     # AI engine
│   ├── authService.ts       # Authentication
│   ├── db.ts                # Database operations
│   ├── errorHandler.ts      # Error management
│   ├── logger.ts            # Logging system
│   └── validation.ts        # Input validation
├── backend/                 # Database
│   └── schema.sql           # PostgreSQL schema
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Main application
└── vite.config.ts           # Build configuration
```

---

## 🎮 Usage

### For Users

1. **Login** - Enter your activation code (XXXX-XXXX-XXXX)
2. **Choose Feature** - Select from diagnosis, medication, labs, wellness, genomics, or chat
3. **Input Data** - Provide symptoms, upload images, or describe your condition
4. **Get Results** - Receive AI-powered analysis and recommendations

### For Admins

1. **Access Admin Panel** - Click "Admin Login" on login page
2. **Generate Codes** - Create monthly (99 EGP) or yearly (999 EGP) subscriptions
3. **Manage Users** - View, ban, unban, renew, or delete user accounts
4. **Monitor Activity** - Track active users and system usage

**Default Admin Credentials:**
- Username: `Nabdh_Admin_27`
- Password: `P@t!ent#2025^Secure`

⚠️ **Change these in production!**

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) on database
- ✅ Environment-based secrets management
- ✅ XSS protection via input sanitization
- ✅ Session validation on critical operations
- ✅ Secure code generation with collision prevention
- ✅ Auto-freeze expired accounts
- ✅ Rate limiting on API calls

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with activation code
- [ ] Admin dashboard access
- [ ] Symptom analysis (text only)
- [ ] Symptom analysis (with image)
- [ ] Medication identification
- [ ] Lab results interpretation
- [ ] Wellness plan generation
- [ ] Genomics data upload
- [ ] Chat functionality
- [ ] User profile management
- [ ] Admin code generation
- [ ] User management (ban/unban/renew)

### Browser Testing
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 📈 Performance Optimizations

### Build Optimizations
- ✅ Code splitting (vendor, three, gemini, supabase)
- ✅ Tree shaking for unused code removal
- ✅ Minification with Terser
- ✅ Lazy loading for components
- ✅ Asset compression

### Runtime Optimizations
- ✅ React.memo for component memoization
- ✅ useCallback for function memoization
- ✅ Debounced input handlers
- ✅ Optimized re-renders
- ✅ Efficient state management

### Memory Management
- ✅ Increased heap size for builds (1GB)
- ✅ Garbage collection optimizations
- ✅ Resource cleanup on unmount

---

## 🐛 Known Issues & Solutions

### Issue: Build fails with heap out of memory
**Solution:** Already fixed in `package.json` with `--max-old-space-size=1024`

### Issue: Gemini API quota exceeded
**Solution:** Implement request queuing or upgrade to paid tier

### Issue: Slow build times
**Expected:** Production builds take 2-3 minutes due to optimizations

See [DEPLOYMENT.md - Troubleshooting](./DEPLOYMENT.md#-troubleshooting) for more.

---

## 📚 Documentation

- **[🚀 Deployment Guide](./DEPLOYMENT.md)** - Complete setup and deployment instructions
- **[🔌 API Documentation](./API_DOCUMENTATION.md)** - Comprehensive API reference
- **[📊 Database Schema](./backend/schema.sql)** - PostgreSQL table definitions

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm start        # Start production server
```

### Code Quality

- TypeScript for type safety
- ESLint for linting (configured)
- Prettier for formatting
- Component-based architecture
- Separation of concerns

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary and confidential.

**Copyright © 2026 Amr Ai. All rights reserved.**

---

## 🙏 Acknowledgments

- **Google Gemini** - Advanced AI capabilities
- **Supabase** - Reliable database infrastructure
- **React Community** - Excellent ecosystem
- **Three.js** - Stunning 3D graphics

---

## 📞 Support

- **Technical Issues**: Check error logs in browser console
- **Database Issues**: Supabase Dashboard → Logs
- **API Issues**: Verify API keys and quotas

---

## 🗺️ Roadmap

### Version 2.1 (Planned)
- [ ] Multi-language support (English, French)
- [ ] Voice input for symptoms
- [ ] PDF report export
- [ ] Email notifications
- [ ] Payment gateway integration

### Version 3.0 (Future)
- [ ] Mobile app (React Native)
- [ ] Telemedicine integration
- [ ] Electronic health records (EHR)
- [ ] AI model fine-tuning
- [ ] Blockchain for data security

---

<div align="center">

**Built with ❤️ by [Amr Ai](https://github.com/amr-ai)**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/your-repo/issues) · [Request Feature](https://github.com/your-repo/issues) · [Documentation](./DEPLOYMENT.md)

</div>
