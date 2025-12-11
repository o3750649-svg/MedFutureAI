
// services/db.ts
// This file acts as a "Mock Server" and "Database Layer".
// In a real production deployment (AWS/Vercel), this logic would move to a Node.js/Go backend.
// Here, we simulate the server latency and data persistence using localStorage as the physical medium,
// BUT the architecture allows you to swap 'saveToStorage' and 'loadFromStorage' with 'fetch()' calls later.

export type AccountStatus = 'active' | 'frozen' | 'banned';
export type PlanType = 'monthly' | 'yearly';

export interface UserRecord {
  code: string;
  ownerName: string;
  type: PlanType;
  status: AccountStatus;
  generatedAt: string; // ISO Date
  expiryDate: string | null; // Null if not used yet, ISO Date if used
  isUsed: boolean;
  lastLogin?: string;
}

const DB_KEY = 'nabidh_secure_db_v2';

// --- Internal DB Helpers (Simulating SQL/NoSQL) ---

const loadDB = (): UserRecord[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDB = (data: UserRecord[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --- Public API Methods (Simulating Server Endpoints) ---

export const dbAPI = {
  // Generate a new code (Admin only)
  generateCode: async (ownerName: string, type: PlanType): Promise<string> => {
    // Simulate server delay
    await new Promise(r => setTimeout(r, 500));

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += '-';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    code += '-';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

    const db = loadDB();
    const newRecord: UserRecord = {
      code,
      ownerName,
      type,
      status: 'active', // Initially active, but waiting to be used
      generatedAt: new Date().toISOString(),
      expiryDate: null,
      isUsed: false
    };

    db.push(newRecord);
    saveDB(db);
    return code;
  },

  // Verify Login (The most critical security check)
  verifyUser: async (code: string): Promise<{ success: boolean; message?: string; data?: UserRecord }> => {
    await new Promise(r => setTimeout(r, 800)); // Network simulation

    const db = loadDB();
    const normalizedCode = code.trim().toUpperCase();
    const userIndex = db.findIndex(u => u.code === normalizedCode);

    if (userIndex === -1) {
      return { success: false, message: 'الكود غير صحيح أو غير مسجل في النظام.' };
    }

    const user = db[userIndex];

    // 1. Check if Banned (Highest Priority)
    if (user.status === 'banned') {
      return { success: false, message: 'تم حظر هذا الحساب لمخالفة شروط الاستخدام. يرجى التواصل مع الإدارة.' };
    }

    // 2. Logic for First Time Use vs Returning User
    const now = new Date();

    if (!user.isUsed) {
      // First time activation
      user.isUsed = true;
      const expiry = new Date();
      if (user.type === 'monthly') expiry.setDate(expiry.getDate() + 30);
      else expiry.setFullYear(expiry.getFullYear() + 1);
      
      user.expiryDate = expiry.toISOString();
      user.status = 'active';
      user.lastLogin = now.toISOString();
      
      db[userIndex] = user;
      saveDB(db);
      return { success: true, data: user };
    }

    // 3. Check Expiry (Frozen Logic)
    if (user.expiryDate && new Date(user.expiryDate) < now) {
      // Auto-freeze if expired but not yet marked as frozen
      if (user.status !== 'frozen') {
        user.status = 'frozen';
        db[userIndex] = user;
        saveDB(db);
      }
      return { success: false, message: 'انتهت صلاحية اشتراكك. حالة الحساب: مجمد. يرجى التجديد لاستعادة الوصول.' };
    }

    // 4. Check if manually Frozen by Admin
    if (user.status === 'frozen') {
      return { success: false, message: 'هذا الحساب مجمد مؤقتاً. يرجى التواصل مع الدعم الفني.' };
    }

    // Success
    user.lastLogin = now.toISOString();
    db[userIndex] = user;
    saveDB(db);
    
    return { success: true, data: user };
  },

  // --- Admin Functions ---

  getAllUsers: async (): Promise<UserRecord[]> => {
    return loadDB();
  },

  // Ban User
  banUser: async (code: string): Promise<void> => {
    const db = loadDB();
    const user = db.find(u => u.code === code);
    if (user) {
      user.status = 'banned';
      saveDB(db);
    }
  },

  // Unban User
  unbanUser: async (code: string): Promise<void> => {
    const db = loadDB();
    const user = db.find(u => u.code === code);
    if (user) {
      // Check if expired to decide if active or frozen
      const now = new Date();
      if (user.expiryDate && new Date(user.expiryDate) < now) {
        user.status = 'frozen';
      } else {
        user.status = 'active';
      }
      saveDB(db);
    }
  },

  // Renew Subscription (Unfreeze)
  renewUser: async (code: string): Promise<void> => {
    const db = loadDB();
    const user = db.find(u => u.code === code);
    if (user) {
      const now = new Date();
      const newExpiry = new Date();
      // Add time based on plan type
      if (user.type === 'monthly') newExpiry.setDate(newExpiry.getDate() + 30);
      else newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      user.expiryDate = newExpiry.toISOString();
      user.status = 'active'; // Reactivate
      saveDB(db);
    }
  },
  
  // Delete User Permanently
  deleteUser: async (code: string): Promise<void> => {
      let db = loadDB();
      db = db.filter(u => u.code !== code);
      saveDB(db);
  }
};
