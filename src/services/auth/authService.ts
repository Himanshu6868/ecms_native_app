import * as SecureStore from 'expo-secure-store';

import { supabaseAnonKey, supabaseUrl } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export type UserRole = 'customer' | 'internal_support' | 'admin' | 'super_admin';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  reportsTo: string | null;
};

export type AuthUserProfile = {
  userId: string;
  authUserId: string;
  email: string;
  name: string;
  role: UserRole;
  sessionToken: string;
};

type UserInsertPayload = {
  name: string;
  email: string;
  role: Exclude<UserRole, 'customer'>;
  reportsTo: string | null;
};

type GenerateOtpResponse = {
  otp: string;
  expiresAt: string;
};

type VerifyOtpResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
};

const SESSION_TOKEN_KEY = 'ecms_session_token';
const MAX_OTP_ATTEMPTS = 5;

const isUserRole = (value: unknown): value is UserRole =>
  value === 'customer' || value === 'internal_support' || value === 'admin' || value === 'super_admin';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const formatEdgeFunctionError = (message: string, functionName: string): string => {
  const normalizedMessage = message.trim().toLowerCase();

  if (normalizedMessage.includes('requested function was not found')) {
    return `The Supabase Edge Function "${functionName}" was not found. Deploy your functions and try again.`;
  }

  return message;
};

const invokeEdgeFunction = async <T>(name: string, body: Record<string, unknown>, token?: string): Promise<T> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });

  const raw = (await response.text()) || '{}';
  const json = (() => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {} as Record<string, unknown>;
    }
  })();

  if (!response.ok) {
    const message =
      (typeof json.error === 'string' && json.error) ||
      (typeof json.message === 'string' && json.message) ||
      (typeof json.msg === 'string' && json.msg) ||
      raw ||
      'Request failed.';
    throw new Error(formatEdgeFunctionError(message, name));
  }

  return json as T;
};

const requestUsers = async <T>(pathAndQuery: string, init?: RequestInit): Promise<T> => {
  const token = await getSessionToken();

  if (!token) {
    throw new Error('Session expired. Please sign in again.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${pathAndQuery}`, {
    method: init?.method ?? 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: init?.body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Supabase users request failed.');
  }

  return (await response.json()) as T;
};

const mapUserRecord = (row: Record<string, unknown>): UserRecord => {
  const role = row.role;
  if (!isUserRole(role)) {
    throw new Error('User role is invalid for this application.');
  }

  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: normalizeEmail(String(row.email ?? '')),
    role,
    reportsTo: typeof row.reports_to === 'string' ? row.reports_to : null,
  };
};

export const getSessionToken = async (): Promise<string | null> => SecureStore.getItemAsync(SESSION_TOKEN_KEY);

export const clearSessionToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
};

export const sendOtp = async (email: string): Promise<GenerateOtpResponse> => {
  const normalizedEmail = normalizeEmail(email);
  return invokeEdgeFunction<GenerateOtpResponse>('generate-otp', { email: normalizedEmail });
};

export const verifyOtp = async (email: string, token: string): Promise<AuthUserProfile> => {
  const normalizedEmail = normalizeEmail(email);
  const payload = await invokeEdgeFunction<VerifyOtpResponse>('verify-otp', { email: normalizedEmail, otp: token });

  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, payload.token);

  return {
    userId: payload.user.id,
    authUserId: payload.user.id,
    email: normalizeEmail(payload.user.email),
    name: payload.user.name,
    role: payload.user.role,
    sessionToken: payload.token,
  };
};

export const getUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const normalizedEmail = normalizeEmail(email);
  const rows = await requestUsers<Record<string, unknown>[]>(
    `users?select=id,name,email,role,reports_to&email=eq.${encodeURIComponent(normalizedEmail)}&deleted_at=is.null&limit=1`,
  );

  if (rows.length === 0) {
    return null;
  }

  return mapUserRecord(rows[0]);
};

export const resolveAuthorizedProfile = async (): Promise<AuthUserProfile> => {
  const token = await getSessionToken();
  const { email: persistedEmail } = useAuthStore.getState();

  if (!token || !persistedEmail) {
    throw new Error('Session expired. Please sign in again.');
  }

  const userRecord = await getUserByEmail(persistedEmail);

  if (!userRecord) {
    throw new Error('User not authorized');
  }

  return {
    userId: userRecord.id,
    authUserId: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    role: userRecord.role,
    sessionToken: token,
  };
};

export const listReportingManagers = async (): Promise<Array<{ id: string; name: string; email: string }>> => {
  const rows = await requestUsers<Record<string, unknown>[]>(
    'users?select=id,name,email,role&role=in.(admin,super_admin)&deleted_at=is.null&order=name.asc',
  );

  return rows.map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: normalizeEmail(String(row.email ?? '')),
  }));
};

export const createUser = async (payload: UserInsertPayload): Promise<UserRecord> => {
  const rows = await requestUsers<Record<string, unknown>[]>('users?select=id,name,email,role,reports_to', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      name: payload.name,
      email: normalizeEmail(payload.email),
      role: payload.role,
      reports_to: payload.reportsTo,
      deleted_at: null,
    }),
  });

  if (!rows[0]) {
    throw new Error('User creation failed.');
  }

  return mapUserRecord(rows[0]);
};

export const logout = async (): Promise<void> => {
  await clearSessionToken();
};

export const getOtpAttemptsRemaining = (retryCount: number): number => Math.max(0, MAX_OTP_ATTEMPTS - retryCount);
