
import { DigitalTwinData } from '../types';
import { dbAPI, UserRecord } from './db';

// The session key is only used to remember "who" is logged in on this browser.
// The actual validity is checked against the DB every time app loads or critical actions occur.
const SESSION_KEY = 'nabidh_user_session_v2';
const ADMIN_SESSION_KEY = 'nabidh_admin_session_v2';
const USER_PROFILE_KEY = 'nabidh_user_profile';

// --- Admin ---
export const adminLogin = (username: string, pass: string): boolean => {
  if (username === 'Nabdh_Admin_27' && pass === 'P@t!ent#2025^Secure') {
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

// --- User Auth ---

export const loginUser = async (code: string) => {
    const result = await dbAPI.verifyUser(code);
    if (result.success && result.data) {
        // We store the code in session to re-verify later, but trust the DB result now
        localStorage.setItem(SESSION_KEY, JSON.stringify({ 
            code: result.data.code, 
            ownerName: result.data.ownerName,
            expiryDate: result.data.expiryDate 
        }));
    }
    return result;
};

export const checkUserSession = async (): Promise<boolean> => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;
    
    const session = JSON.parse(sessionStr);
    
    // Re-verify with DB to ensure user wasn't banned/frozen mid-session
    const result = await dbAPI.verifyUser(session.code);
    
    if (!result.success) {
        // Session invalid (Banned/Expired) -> Clear local
        localStorage.removeItem(SESSION_KEY);
        return false;
    }
    
    return true;
};

export const getUserName = (): string | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    return JSON.parse(sessionStr).ownerName;
};

export const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY);
};

// --- Profile Data ---

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
        return { ...DEFAULT_PROFILE, ...parsed };
    }
    return DEFAULT_PROFILE;
};

export const saveUserProfile = (data: DigitalTwinData) => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(data));
};
