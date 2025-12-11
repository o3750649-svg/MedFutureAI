
import { DigitalTwinData } from '../types';
import * as api from './api';

// The session key is only used to remember "who" is logged in on this browser.
// The actual validity is checked against the backend API every time app loads or critical actions occur.
const SESSION_KEY = 'nabidh_user_session_v2';
const USER_PROFILE_KEY = 'nabidh_user_profile';

// --- Admin ---
export const adminLogin = async (username: string, pass: string): Promise<boolean> => {
  try {
    const result = await api.adminLogin(username, pass);
    return result.success;
  } catch (error) {
    console.error('Admin login error:', error);
    return false;
  }
};

export const isAdminLoggedIn = (): boolean => {
  return api.getAdminToken() !== null;
};

export const adminLogout = async () => {
  await api.adminLogout();
};

// --- User Auth ---

export const loginUser = async (code: string) => {
    const result = await api.verifyUserCode(code);
    if (result.success && result.data) {
        // We store the code in session to re-verify later, but trust the API result now
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
    
    // Re-verify with backend API to ensure user wasn't banned/frozen mid-session
    try {
        const result = await api.verifyUserCode(session.code);
        
        if (!result.success) {
            // Session invalid (Banned/Expired) -> Clear local
            localStorage.removeItem(SESSION_KEY);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Session check error:', error);
        return false;
    }
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
