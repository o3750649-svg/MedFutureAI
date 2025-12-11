// Database Adapter - Provides compatibility layer for Admin Dashboard
// Maps the old dbAPI interface to the new backend API

import * as api from './api';

export type AccountStatus = 'active' | 'frozen' | 'banned';
export type PlanType = 'monthly' | 'yearly';

export interface UserRecord {
  code: string;
  ownerName: string;
  type: PlanType;
  status: AccountStatus;
  generatedAt: string;
  expiryDate: string | null;
  isUsed: boolean;
  lastLogin?: string;
}

export const dbAPI = {
  // Generate a new code (Admin only)
  generateCode: async (ownerName: string, type: PlanType): Promise<string> => {
    // Simulate server delay for UX
    await new Promise(r => setTimeout(r, 500));
    return await api.generateCode(ownerName, type);
  },

  // Verify Login (The most critical security check)
  verifyUser: async (code: string): Promise<{ success: boolean; message?: string; data?: UserRecord }> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    try {
      const result = await api.verifyUserCode(code);
      
      if (!result.success) {
        return { success: false, message: result.message };
      }
      
      // Map API response to old format
      return {
        success: true,
        data: {
          code: result.data!.code,
          ownerName: result.data!.ownerName,
          expiryDate: result.data!.expiryDate,
          type: 'monthly', // This will be provided by backend
          status: 'active',
          generatedAt: new Date().toISOString(),
          isUsed: true
        }
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'حدث خطأ في الاتصال بالخادم' 
      };
    }
  },

  // --- Admin Functions ---

  getAllUsers: async (): Promise<UserRecord[]> => {
    return await api.getAllUsers();
  },

  // Ban User
  banUser: async (code: string): Promise<void> => {
    await api.banUser(code);
  },

  // Unban User
  unbanUser: async (code: string): Promise<void> => {
    await api.unbanUser(code);
  },

  // Renew Subscription (Unfreeze)
  renewUser: async (code: string): Promise<void> => {
    await api.renewSubscription(code);
  },
  
  // Delete User Permanently
  deleteUser: async (code: string): Promise<void> => {
    await api.deleteUser(code);
  }
};
