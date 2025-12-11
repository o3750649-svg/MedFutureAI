// API Service - Connects frontend to backend API
// Replaces localStorage-based "mock" database with real HTTP calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Store admin session token
let adminToken: string | null = null;

export function setAdminToken(token: string) {
  adminToken = token;
  localStorage.setItem('admin_token', token);
}

export function getAdminToken(): string | null {
  if (!adminToken) {
    adminToken = localStorage.getItem('admin_token');
  }
  return adminToken;
}

export function clearAdminToken() {
  adminToken = null;
  localStorage.removeItem('admin_token');
}

// Generic API call wrapper
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Add auth token if available
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الاتصال بالخادم');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('فشل الاتصال بالخادم. تحقق من اتصال الإنترنت.');
  }
}

// ============ User Authentication API ============

export interface VerifyUserResponse {
  success: boolean;
  message?: string;
  data?: {
    code: string;
    ownerName: string;
    expiryDate: string;
  };
}

export async function verifyUserCode(code: string): Promise<VerifyUserResponse> {
  return apiCall<VerifyUserResponse>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

// ============ Admin Authentication API ============

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: {
    username: string;
  };
}

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const response = await apiCall<AdminLoginResponse>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (response.success && response.token) {
    setAdminToken(response.token);
  }

  return response;
}

export async function adminLogout(): Promise<void> {
  try {
    await apiCall('/auth/admin/logout', { method: 'POST' });
  } finally {
    clearAdminToken();
  }
}

// ============ Admin Management API ============

export interface UserRecord {
  code: string;
  ownerName: string;
  type: 'monthly' | 'yearly';
  status: 'active' | 'frozen' | 'banned';
  isUsed: boolean;
  generatedAt: string;
  expiryDate: string | null;
  lastLogin?: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: UserRecord[];
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const response = await apiCall<GetUsersResponse>('/admin/users');
  return response.data;
}

export async function generateCode(ownerName: string, planType: 'monthly' | 'yearly'): Promise<string> {
  const response = await apiCall<{ success: boolean; code: string }>('/admin/generate-code', {
    method: 'POST',
    body: JSON.stringify({ ownerName, planType })
  });
  return response.code;
}

export async function banUser(code: string): Promise<void> {
  await apiCall(`/admin/ban/${code}`, { method: 'POST' });
}

export async function unbanUser(code: string): Promise<void> {
  await apiCall(`/admin/unban/${code}`, { method: 'POST' });
}

export async function renewSubscription(code: string): Promise<void> {
  await apiCall(`/admin/renew/${code}`, { method: 'POST' });
}

export async function deleteUser(code: string): Promise<void> {
  await apiCall(`/admin/user/${code}`, { method: 'DELETE' });
}

// ============ Health Check ============

export async function checkServerHealth(): Promise<boolean> {
  try {
    await apiCall('/health');
    return true;
  } catch {
    return false;
  }
}
