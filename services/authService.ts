
import { DigitalTwinData } from '../types';

// The session key is only used to remember "who" is logged in on this browser.
// The actual validity is checked against the backend every time app loads or critical actions occur.
const SESSION_KEY = 'nabidh_user_session_v2';
const USER_PROFILE_KEY = 'nabidh_user_profile';
const ADMIN_SESSION_KEY = 'nabidh_admin_session_v2';

// Hard-coded admin credentials (Move to ENV in production)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'AmrAi2024!Secure'
};

// --- Admin ---
export const adminLogin = (username: string, pass: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ loggedIn: true, timestamp: Date.now() }));
    console.log('✅ Admin logged in successfully');
    return true;
  }
  console.log('❌ Admin login failed: Invalid credentials');
  return false;
};

export const isAdminLoggedIn = (): boolean => {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  return session !== null;
};

export const adminLogout = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  console.log('✅ Admin logged out');
};

// --- User Auth ---

export const loginUser = async (code: string) => {
    // Import db dynamically to avoid circular dependencies
    const { dbAPI } = await import('./db');
    const result = await dbAPI.verifyUser(code);
    
    if (result.success && result.data) {
        // Store session data for quick access
        localStorage.setItem(SESSION_KEY, JSON.stringify({ 
            code: result.data.code, 
            ownerName: result.data.ownerName,
            expiryDate: result.data.expiryDate 
        }));
        console.log('✅ User logged in:', result.data.ownerName);
    } else {
        console.log('❌ Login failed:', result.message);
    }
    return result;
};

export const checkUserSession = async (): Promise<boolean> => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;
    
    const session = JSON.parse(sessionStr);
    
    // Re-verify with database to ensure user wasn't banned/frozen mid-session
    try {
        // Import db dynamically to avoid circular dependencies
        const { dbAPI } = await import('./db');
        const result = await dbAPI.verifyUser(session.code);
        
        if (!result.success) {
            // Session invalid (Banned/Expired/Frozen) -> Clear local and logout
            console.log('❌ Session invalid:', result.message);
            localStorage.removeItem(SESSION_KEY);
            return false;
        }
        
        // Update session data if needed
        if (result.data) {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ 
                code: result.data.code, 
                ownerName: result.data.ownerName,
                expiryDate: result.data.expiryDate 
            }));
        }
        
        return true;
    } catch (error) {
        console.error('❌ Session check error:', error);
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
