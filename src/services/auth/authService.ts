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
    reportsTo: typeof row.reports_to === 'string' ? row.reports_to : null,
  };
};

const getSessionOrThrow = async (): Promise<SupabaseSession> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error('Session not ready');
  }

  return session;
};

export const sendOtp = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    if (error.message.toLowerCase().includes('signups not allowed')) {
      throw new Error('User not authorized');
    }

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
    `users?select=id,name,email,role,reports_to&email=ilike.${encodeURIComponent(normalizedEmail)}&deleted_at=is.null&limit=1`,
  );

  if (rows.length === 0) {
    return null;
  }

  return mapUserRecord(rows[0]);
};

export const requireAuthorizedUserByEmail = async (email: string): Promise<UserRecord> => {
  const userRecord = await getUserByEmail(email);

  if (!userRecord) {
    throw new Error('User not authorized');
  }

  return userRecord;
};

export const buildProfile = (user: SupabaseUser, userRecord: UserRecord): AuthUserProfile => ({
  userId: userRecord.id,
  authUserId: user.id,
  email: user.email ?? userRecord.email,
  name: userRecord.name,
  role: userRecord.role,
});

export const resolveAuthorizedProfile = async (): Promise<AuthUserProfile> => {
  const session = await getSessionOrThrow();
  const email = session.user.email?.trim().toLowerCase();

  if (!email) {
    throw new Error('User not authorized');
  }

  // NOTE: Supabase RLS must allow authenticated users to SELECT from public.users.
  const { data: user, error } = await supabase
    .from<Record<string, unknown>>('users')
    .select('*')
    .ilike('email', email)
    .single();

  if (error || !user) {
    throw new Error('User not authorized');
  }

  return buildProfile(session.user, mapUserRecord(user));
};

export const listReportingManagers = async (): Promise<Array<{ id: string; name: string; email: string }>> => {
  const rows = await requestUsers<Record<string, unknown>[]>(
    'users?select=id,name,email,role&role=in.(admin,super_admin)&deleted_at=is.null&order=name.asc',
  );

  return rows.map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? '').toLowerCase(),
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
      email: payload.email.toLowerCase(),
      role: payload.role,
      reports_to: payload.reportsTo,
      area_id: null,
      deleted_at: null,
      otp_hash: null,
      otp_expires_at: null,
      otp_retry_count: 0,
      otp_verified_at: null,
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
