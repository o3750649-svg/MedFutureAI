
// services/db.ts
import { supabase } from './supabaseClient';

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

// Helper to map DB snake_case to TS camelCase
const mapUserFromDB = (data: any): UserRecord => ({
    code: data.code,
    ownerName: data.owner_name,
    type: data.type as PlanType,
    status: data.status as AccountStatus,
    generatedAt: data.generated_at,
    expiryDate: data.expiry_date,
    isUsed: data.is_used,
    lastLogin: data.last_login
});

export const dbAPI = {
  // Generate a new code (Admin only)
  generateCode: async (ownerName: string, type: PlanType): Promise<string> => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const MAX_RETRIES = 5;
    let code = '';

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        // 1. Generate Code
        code = '';
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        code += '-';
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        code += '-';
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

        // 2. Attempt to Insert
        const { error } = await supabase
            .from('users')
            .insert([{
                code,
                owner_name: ownerName,
                type,
                status: 'active',
                is_used: false
            }]);

        if (!error) {
            // Success! Return the code
            return code;
        }

        // 3. Check for Duplicate Key Error (Error code 23505 is PostgreSQL unique violation)
        if (error.code === '23505') {
            console.warn(`Duplicate code generated: ${code}. Retrying...`);
            // Continue to the next iteration to generate a new code
            continue;
        } else {
            // Other error (e.g., RLS, permissions, connection)
            console.error("Supabase Error:", error);
            throw new Error(`Failed to generate code: ${error.message}`);
        }
    }

    // If all retries fail
    throw new Error("Failed to generate a unique code after multiple retries.");
  },

  // Verify Login (The most critical security check)
  verifyUser: async (code: string): Promise<{ success: boolean; message?: string; data?: UserRecord }> => {
    const normalizedCode = code.trim().toUpperCase();

    // 1. Fetch User
    const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('code', normalizedCode)
        .single();

    if (error || !userData) {
      return { success: false, message: 'الكود غير صحيح أو غير مسجل في النظام.' };
    }

    const user = mapUserFromDB(userData);

    // 2. Check if Banned
    if (user.status === 'banned') {
      return { success: false, message: 'تم حظر هذا الحساب لمخالفة شروط الاستخدام. يرجى التواصل مع الإدارة.' };
    }

    const now = new Date();

    // 3. Logic for First Time Use
    if (!user.isUsed) {
      const expiry = new Date();
      if (user.type === 'monthly') expiry.setDate(expiry.getDate() + 30);
      else expiry.setFullYear(expiry.getFullYear() + 1);
      
      const { data: updatedData, error: updateError } = await supabase
        .from('users')
        .update({
            is_used: true,
            expiry_date: expiry.toISOString(),
            status: 'active',
            last_login: now.toISOString()
        })
        .eq('code', normalizedCode)
        .select()
        .single();

      if (updateError || !updatedData) {
          return { success: false, message: 'حدث خطأ أثناء تفعيل الحساب.' };
      }
      
      return { success: true, data: mapUserFromDB(updatedData) };
    }

    // 4. Check Expiry (Auto-Freeze Logic)
    if (user.expiryDate && new Date(user.expiryDate) < now) {
      if (user.status !== 'frozen') {
        await supabase.from('users').update({ status: 'frozen' }).eq('code', normalizedCode);
      }
      return { success: false, message: 'انتهت صلاحية اشتراكك. حالة الحساب: مجمد. يرجى التجديد لاستعادة الوصول.' };
    }

    // 5. Check if manually Frozen
    if (user.status === 'frozen') {
      return { success: false, message: 'هذا الحساب مجمد مؤقتاً. يرجى التواصل مع الدعم الفني.' };
    }

    // Success - Update Last Login
    await supabase.from('users').update({ last_login: now.toISOString() }).eq('code', normalizedCode);
    
    return { success: true, data: user };
  },

  // --- Admin Functions ---

  getAllUsers: async (): Promise<UserRecord[]> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('generated_at', { ascending: false });
    
    if (error) {
        console.error("Fetch Error:", error);
        return [];
    }
    return data.map(mapUserFromDB);
  },

  banUser: async (code: string): Promise<void> => {
    await supabase.from('users').update({ status: 'banned' }).eq('code', code);
  },

  unbanUser: async (code: string): Promise<void> => {
    // Logic: If expired, set frozen, else active
    // We need to check expiry first, but for simplicity in unban, we can default to active 
    // and let verifyUser handle re-freezing if expired.
    await supabase.from('users').update({ status: 'active' }).eq('code', code);
  },

  renewUser: async (code: string): Promise<void> => {
    // Get current user details to check plan type
    const { data } = await supabase.from('users').select('type').eq('code', code).single();
    if (!data) return;

    const newExpiry = new Date();
    if (data.type === 'monthly') newExpiry.setDate(newExpiry.getDate() + 30);
    else newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    await supabase
        .from('users')
        .update({ 
            expiry_date: newExpiry.toISOString(),
            status: 'active' 
        })
        .eq('code', code);
  },
  
  deleteUser: async (code: string): Promise<void> => {
      await supabase.from('users').delete().eq('code', code);
  }
};
