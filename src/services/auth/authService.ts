import { supabase, supabaseAnonKey, supabaseUrl, type SupabaseSession, type SupabaseUser } from '../../lib/supabase';

export type UserRole = 'customer' | 'internal' | 'admin';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string | null;
};

export type AuthUserProfile = {
  user: string;
  email: string;
  name: string;
  role: UserRole;
  area: string | null;
};

const isUserRole = (value: unknown): value is UserRole => value === 'customer' || value === 'internal' || value === 'admin';

const requestUsers = async <T>(pathAndQuery: string, init?: RequestInit): Promise<T> => {
  const { data: sessionData } = await supabase.auth.getSession();

  const response = await fetch(`${supabaseUrl}/rest/v1/${pathAndQuery}`, {
    method: init?.method ?? 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${sessionData.session?.access_token ?? supabaseAnonKey}`,
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
    email: String(row.email ?? '').toLowerCase(),
    role,
    area: typeof row.area === 'string' ? row.area : null,
  };
};

export const sendOtp = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    throw new Error(error.message);
  }
};

export const verifyOtp = async (email: string, token: string): Promise<SupabaseSession> => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Unable to verify OTP.');
  }

  return data.session;
};

export const getUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await requestUsers<Record<string, unknown>[]>(
    `users?select=id,name,email,role,area&email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
  );

  if (rows.length === 0) {
    return null;
  }

  return mapUserRecord(rows[0]);
};

export const requireAuthorizedUserByEmail = async (email: string): Promise<UserRecord> => {
  const userRecord = await getUserByEmail(email);

  if (!userRecord) {
    throw new Error('Login denied. This email is not authorized.');
  }

  return userRecord;
};

export const buildProfile = (user: SupabaseUser, userRecord: UserRecord): AuthUserProfile => ({
  user: userRecord.id,
  email: user.email ?? userRecord.email,
  name: userRecord.name,
  role: userRecord.role,
  area: userRecord.area,
});

export const createUser = async (payload: {
  name: string;
  email: string;
  role: UserRole;
  area?: string;
}): Promise<UserRecord> => {
  const rows = await requestUsers<Record<string, unknown>[]>('users?select=id,name,email,role,area', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email.toLowerCase(),
      role: payload.role,
      area: payload.area?.trim() ? payload.area.trim() : null,
    }),
  });

  if (!rows[0]) {
    throw new Error('User creation failed.');
  }

  return mapUserRecord(rows[0]);
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};
