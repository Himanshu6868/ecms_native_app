import { supabase, supabaseAnonKey, supabaseUrl, type SupabaseSession, type SupabaseUser } from '../../lib/supabase';

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
};

type UserInsertPayload = {
  name: string;
  email: string;
  role: Exclude<UserRole, 'customer'>;
  reportsTo: string | null;
};

const isUserRole = (value: unknown): value is UserRole =>
  value === 'customer' || value === 'internal_support' || value === 'admin' || value === 'super_admin';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

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
    email: normalizeEmail(String(row.email ?? '')),
    role,
    reportsTo: typeof row.reports_to === 'string' ? row.reports_to : null,
  };
};

export const sendOtp = async (email: string): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
  });

  if (error) {
    throw new Error(error.message || 'Unable to send OTP.');
  }
};

export const verifyOtp = async (email: string, token: string): Promise<SupabaseSession> => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token,
    type: 'email',
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Unable to verify OTP.');
  }

  return data.session;
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

export const buildProfile = (user: SupabaseUser, userRecord: UserRecord): AuthUserProfile => ({
  userId: userRecord.id,
  authUserId: user.id,
  email: normalizeEmail(user.email ?? userRecord.email),
  name: userRecord.name,
  role: userRecord.role,
});

const authorizeAuthenticatedUser = async (user: SupabaseUser): Promise<AuthUserProfile> => {
  const normalizedEmail = normalizeEmail(user.email ?? '');

  if (!normalizedEmail) {
    throw new Error('User not authorized');
  }

  const userRecord = await getUserByEmail(normalizedEmail);

  if (!userRecord) {
    throw new Error('User not authorized');
  }

  return buildProfile(user, userRecord);
};

export const resolveAuthorizedProfile = async (): Promise<AuthUserProfile> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authorized');
  }

  return authorizeAuthenticatedUser(user);
};

export const completeOtpLogin = async (): Promise<AuthUserProfile> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Login failed. Session user not found.');
  }

  return authorizeAuthenticatedUser(user);
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
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};
