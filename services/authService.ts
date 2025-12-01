
import { DigitalTwinData } from '../types';

export interface AccessCode {
  code: string;
  type: 'monthly' | 'yearly';
  isUsed: boolean;
  generatedAt: string;
  expiryDate: string | null; // Set when used
  ownerName: string; // New field for owner name
}

export interface UserSession {
  isValid: boolean;
  expiryDate: string;
  type: 'monthly' | 'yearly';
  code: string;
  ownerName?: string;
}

const CODES_KEY = 'nabidh_codes_db';
const SESSION_KEY = 'nabidh_user_session';
const ADMIN_SESSION_KEY = 'nabidh_admin_session';
const LOGOUT_REASON_KEY = 'nabidh_logout_reason';
const USER_PROFILE_KEY = 'nabidh_user_profile';

// --- Admin Functions ---

export const adminLogin = (username: string, pass: string): boolean => {
  if (username === 'FutureMed_AmrX' && pass === 'Fm@2045!MedX#99') {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
};

export const isAdminLoggedIn = (): boolean => {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const adminLogout = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const generateCode = (type: 'monthly' | 'yearly', ownerName: string): string => {
  // Generate a random 12-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, O, 0 to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

  const newCodeEntry: AccessCode = {
    code,
    type,
    isUsed: false,
    generatedAt: new Date().toISOString(),
    expiryDate: null,
    ownerName: ownerName || 'غير محدد'
  };

  const existingCodes = getCodes();
  localStorage.setItem(CODES_KEY, JSON.stringify([...existingCodes, newCodeEntry]));
  return code;
};

export const getCodes = (): AccessCode[] => {
  const codes = localStorage.getItem(CODES_KEY);
  return codes ? JSON.parse(codes) : [];
};

export const deleteCode = (codeToDelete: string) => {
    const codes = getCodes().filter(c => c.code !== codeToDelete);
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
}

// --- User Functions ---

export const validateAndUseCode = (inputCode: string): { success: boolean; message: string } => {
  const codes = getCodes();
  const normalizedInput = inputCode.trim().toUpperCase();
  const codeIndex = codes.findIndex(c => c.code === normalizedInput);

  if (codeIndex === -1) {
    return { success: false, message: 'الكود غير صحيح. يرجى التأكد من الكود والمحاولة مرة أخرى.' };
  }

  const codeEntry = codes[codeIndex];

  if (codeEntry.isUsed) {
    return { success: false, message: 'هذا الكود مستخدم بالفعل.' };
  }

  // Calculate expiry
  const now = new Date();
  const expiryDate = new Date();
  if (codeEntry.type === 'monthly') {
    expiryDate.setMonth(now.getMonth() + 1);
  } else {
    expiryDate.setFullYear(now.getFullYear() + 1);
  }

  // Update Code Status in DB
  codes[codeIndex].isUsed = true;
  codes[codeIndex].expiryDate = expiryDate.toISOString();
  localStorage.setItem(CODES_KEY, JSON.stringify(codes));

  // Set User Session with ownerName for persistence
  const session: UserSession = {
    isValid: true,
    expiryDate: expiryDate.toISOString(),
    type: codeEntry.type,
    code: normalizedInput,
    ownerName: codeEntry.ownerName
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, message: 'تم تفعيل الاشتراك بنجاح!' };
};

export const checkUserSession = (): boolean => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return false;

  const session: UserSession = JSON.parse(sessionStr);
  const now = new Date();
  const expiry = new Date(session.expiryDate);

  if (now > expiry) {
    // Expired - Cleanup
    if (session.code) {
        deleteCode(session.code);
    }
    
    localStorage.removeItem(SESSION_KEY); // Expired
    localStorage.setItem(LOGOUT_REASON_KEY, 'expired');
    return false;
  }

  return true;
};

export const getUserName = (): string | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    const session: UserSession = JSON.parse(sessionStr);
    return session.ownerName || null;
}

export const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getLogoutReason = (): string | null => {
    const reason = localStorage.getItem(LOGOUT_REASON_KEY);
    if (reason) {
        localStorage.removeItem(LOGOUT_REASON_KEY);
        return reason;
    }
    return null;
}

// --- Health Profile Functions ---

const DEFAULT_PROFILE: DigitalTwinData = {
    personal: { age: 30, weight: 75, height: 175, gender: 'male' },
    vitals: { heartRate: 75, bloodPressure: '120/80', temperature: 36.6, respiratoryRate: 16, bloodOxygen: 98 },
    activity: { steps: 0, activeMinutes: 0, sleepHours: 7 },
    riskFactors: [],
    lastAnalysis: null,
};

export const getUserProfile = (): DigitalTwinData => {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure structure matches even if loaded from old version
        return { ...DEFAULT_PROFILE, ...parsed, vitals: { ...DEFAULT_PROFILE.vitals, ...parsed.vitals }, activity: { ...DEFAULT_PROFILE.activity, ...parsed.activity } };
    }
    return DEFAULT_PROFILE;
};

export const saveUserProfile = (data: DigitalTwinData) => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(data));
};
