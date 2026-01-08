# 🔌 NABIDH AI - API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Services Architecture](#services-architecture)
- [AI Services](#ai-services)
- [Database Services](#database-services)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

---

## 📖 Overview

NABIDH AI uses a **hybrid AI architecture** that intelligently routes requests between multiple AI providers:

```
User Request → Router → [Gemini | DeepSeek | OpenAI] → Response
```

### Routing Logic
1. **Image/File Analysis** → Always uses Gemini (best multimodal)
2. **Text-Only Requests** → Tries DeepSeek → OpenAI → Gemini (fallback)
3. **Streaming Chat** → Always uses Gemini (native streaming support)

---

## 🔐 Authentication

### User Authentication Flow

```typescript
// 1. User Login
const result = await loginUser(activationCode);

// 2. Session Verification (runs on every app load)
const isValid = await checkUserSession();

// 3. Get User Info
const userName = getUserName();
const userProfile = getUserProfile();

// 4. Logout
logoutUser();
```

### Session Management

Sessions are stored in `localStorage` and verified against the database on every critical action.

**Session Structure:**
```typescript
{
  code: string;           // Activation code
  ownerName: string;      // User's name
  expiryDate: string;     // ISO date string
}
```

### Admin Authentication

```typescript
// Admin login
const success = adminLogin(username, password);

// Check if logged in
const isAdmin = isAdminLoggedIn();

// Logout
adminLogout();
```

**Default Credentials** (⚠️ Change in production):
- Username: `Nabdh_Admin_27`
- Password: `P@t!ent#2025^Secure`

---

## 🏗️ Services Architecture

### File Structure
```
services/
├── geminiService.ts      # Main AI engine
├── authService.ts        # Authentication logic
├── db.ts                 # Database operations
├── supabaseClient.ts     # Supabase connection
├── validation.ts         # Input validation
├── geminiSchemas.ts      # AI response schemas
├── errorHandler.ts       # Error management
├── logger.ts             # Logging system
└── pdfService.ts         # PDF generation
```

---

## 🤖 AI Services

### 1. Symptom Analysis

Analyzes user symptoms and provides diagnosis, treatment plan, and recommendations.

```typescript
import { analyzeSymptoms } from './services/geminiService';

// Text-only analysis
const result = await analyzeSymptoms("صداع شديد ودوخة", null);

// With image
const imageFile: File = ...; // from file input
const result = await analyzeSymptoms("طفح جلدي", imageFile);
```

**Response Schema:**
```typescript
interface AnalysisResult {
  primaryDiagnosis: {
    title: string;
    details: string;
  };
  differentialDiagnosis: Array<{
    title: string;
    likelihood: string;
    rationale: string;
  }>;
  medicationPlan: {
    title: string;
    disclaimer: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      notes: string;
    }>;
  };
  herbalRemediesPlan?: {
    title: string;
    disclaimer: string;
    remedies: Array<{
      name: string;
      usage: string;
      notes: string;
    }>;
  };
  treatmentPlan: {
    title: string;
    steps: string[];
  };
  prevention: {
    title: string;
    recommendations: string[];
  };
}
```

---

### 2. Medication Identification

Identifies medications from text description or pill/package image.

```typescript
import { identifyMedication } from './services/geminiService';

const result = await identifyMedication("بانادول", imageFile);
```

**Response Schema:**
```typescript
interface MedicationInfo {
  name: string;
  activeIngredient: string;
  usage: string;
  dosageInfo: string;
  sideEffects: string[];
  warnings: string[];
}
```

---

### 3. Lab Results Analysis

Analyzes medical laboratory test results from text or image.

```typescript
import { analyzeLabResults } from './services/geminiService';

const labText = `
Hemoglobin: 14.5 g/dL
WBC: 8,000 /μL
Platelets: 250,000 /μL
`;

const result = await analyzeLabResults(labText, imageFile);
```

**Response Schema:**
```typescript
interface LabAnalysisResult {
  summary: {
    title: string;
    overview: string;
  };
  keyIndicators: {
    title: string;
    indicators: Array<{
      name: string;
      value: string;
      normalRange: string;
      isAbnormal: boolean;
      interpretation: string;
      valueAsNumber: number;
      rangeMin: number;
      rangeMax: number;
    }>;
  };
  conclusion: {
    title: string;
    details: string;
  };
  disclaimer: string;
}
```

---

### 4. Wellness Plan Generation

Creates personalized wellness and prevention plans.

```typescript
import { generateWellnessPlan } from './services/geminiService';

const lifestyleInfo = {
  diet: "نظام غذائي غير منتظم، أطعمة سريعة",
  exercise: "لا أمارس الرياضة",
  sleep: "5-6 ساعات يومياً",
  stress: "ضغط عمل عالي"
};

const result = await generateWellnessPlan(lifestyleInfo);
```

**Response Schema:**
```typescript
interface WellnessPlan {
  overallGoal: string;
  nutrition: {
    title: string;
    recommendations: string[];
  };
  exercise: {
    title: string;
    recommendations: string[];
  };
  mentalWellness: {
    title: string;
    recommendations: string[];
  };
  disclaimer: string;
}
```

---

### 5. Genomics Data Analysis

Analyzes genomic data files (VCF, 23andMe, etc.).

```typescript
import { analyzeGenomicsData } from './services/geminiService';

const genomicsFile: File = ...; // VCF or genetic data file
const result = await analyzeGenomicsData(genomicsFile);
```

**Response Schema:**
```typescript
interface GenomicsResult {
  summary: {
    title: string;
    overview: string;
  };
  keyFindings: {
    title: string;
    findings: Array<{
      gene: string;
      variant: string;
      implication: string;
      recommendation: string;
    }>;
  };
  riskAnalysis: {
    title: string;
    risks: Array<{
      condition: string;
      riskLevel: string;
      explanation: string;
    }>;
  };
  pharmacogenomics: {
    title: string;
    insights: Array<{
      drugCategory: string;
      gene: string;
      impact: string;
    }>;
  };
  disclaimer: string;
}
```

---

### 6. Chat System

Interactive conversational AI with streaming responses.

```typescript
import { startChat, sendMessageStream } from './services/geminiService';

// Initialize chat with history
const history: ChatMessage[] = [
  { role: 'user', content: 'مرحباً' },
  { role: 'model', content: 'مرحباً بك! كيف يمكنني مساعدتك؟' }
];

const chat = startChat(history);

// Send message with streaming
const streamGenerator = await sendMessageStream(chat, "ما هي أعراض الإنفلونزا؟");

// Process stream
for await (const response of streamGenerator) {
  const text = response.text;
  // Update UI with text
}
```

**Message Structure:**
```typescript
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  suggestions?: string[];
}
```

---

## 🗄️ Database Services

### User Management

```typescript
import { dbAPI } from './services/db';

// Generate activation code
const code = await dbAPI.generateCode("Ahmed Mohamed", "monthly");

// Verify user
const result = await dbAPI.verifyUser("ABCD-EFGH-IJKL");

// Get all users (Admin)
const users = await dbAPI.getAllUsers();

// Ban user
await dbAPI.banUser("ABCD-EFGH-IJKL");

// Unban user
await dbAPI.unbanUser("ABCD-EFGH-IJKL");

// Renew subscription
await dbAPI.renewUser("ABCD-EFGH-IJKL");

// Delete user
await dbAPI.deleteUser("ABCD-EFGH-IJKL");
```

### User Record Structure

```typescript
interface UserRecord {
  code: string;              // Format: XXXX-XXXX-XXXX
  ownerName: string;         // User's full name
  type: 'monthly' | 'yearly'; // Subscription plan
  status: 'active' | 'frozen' | 'banned';
  generatedAt: string;       // ISO date
  expiryDate: string | null; // ISO date or null
  isUsed: boolean;           // Code activation status
  lastLogin?: string;        // ISO date
}
```

---

## ⚠️ Error Handling

### Using Error Handler

```typescript
import { errorHandler, handleAsync, retryOperation } from './services/errorHandler';

// Handle errors
try {
  const result = await someApiCall();
} catch (error) {
  const appError = errorHandler.handle(error, 'Context Info');
  // appError.userMessage contains Arabic user-friendly message
  alert(appError.userMessage);
}

// Handle async operations
const { data, error } = await handleAsync(async () => {
  return await someApiCall();
}, 'API Context');

if (error) {
  console.error(error.userMessage);
}

// Retry failed operations
const result = await retryOperation(
  async () => await unstableApiCall(),
  3,      // max retries
  1000    // delay between retries (ms)
);
```

### Error Types

```typescript
type ErrorType = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';
```

---

## 📋 Validation

### Input Validation

```typescript
import { 
  isValidCode, 
  isValidTextLength, 
  isValidName, 
  validateVital,
  sanitizeText 
} from './services/validation';

// Validate activation code
const isValid = isValidCode("ABCD-EFGH-IJKL"); // true

// Sanitize user input
const clean = sanitizeText("<script>alert('XSS')</script>hello");
// Result: "hello"

// Validate text length
const isOk = isValidTextLength("Some text here"); // true if < 5000 chars

// Validate name
const isValidName = isValidName("Ahmed Mohamed"); // true

// Validate vital signs
const validation = validateVital(120, 60, 180); // blood pressure
// { isValid: true }
```

---

## 🛠️ Code Examples

### Complete Feature Implementation

```typescript
import React, { useState } from 'react';
import { analyzeSymptoms } from './services/geminiService';
import { errorHandler } from './services/errorHandler';
import { checkUserSession } from './services/authService';

function DiagnosisFeature() {
  const [symptomText, setSymptomText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    // 1. Verify session
    const sessionValid = await checkUserSession();
    if (!sessionValid) {
      setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    // 2. Validate input
    if (!symptomText.trim()) {
      setError('يرجى إدخال الأعراض');
      return;
    }

    // 3. Call AI service
    setLoading(true);
    setError(null);
    
    try {
      const analysisResult = await analyzeSymptoms(symptomText, null);
      setResult(analysisResult);
    } catch (err) {
      const appError = errorHandler.handle(err, 'Symptom Analysis');
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={symptomText}
        onChange={(e) => setSymptomText(e.target.value)}
        placeholder="اكتب الأعراض هنا..."
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'جاري التحليل...' : 'تحليل الأعراض'}
      </button>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{/* Display result */}</div>}
    </div>
  );
}
```

---

## 🔧 Advanced Configuration

### Custom AI Routing

Modify `/services/geminiService.ts` to customize routing logic:

```typescript
// Example: Always use Gemini (disable DeepSeek/OpenAI)
const executeAmrAiRequest = async <T>(options: AiRequestOptions): Promise<T> => {
  const promptParts: Part[] = [{ text: options.prompt }];
  if (options.image) {
    promptParts.push(await fileToGenerativePart(options.image));
  }
  const jsonString = await callGemini(promptParts, options.schema!);
  return JSON.parse(jsonString) as T;
};
```

---

## 📊 Rate Limits & Quotas

### Gemini API Limits
- **Free Tier**: 15 requests per minute
- **Paid Tier**: 60+ requests per minute (varies)

### Supabase Limits
- **Free Tier**: 500MB database, 2GB bandwidth/month
- **Pro Tier**: 8GB database, 50GB bandwidth/month

**Monitoring:**
- Check Gemini usage: https://makersuite.google.com/app/apikey
- Check Supabase usage: Project Settings → Usage

---

**Need Help?** Check `DEPLOYMENT.md` for setup instructions.

**Built with ❤️ by Amr Ai**
