import { supabase, supabaseAnonKey, supabaseUrl } from '../../lib/supabase';

export type UserRole = 'customer' | 'internal_support' | 'admin' | 'super_admin';

export type AuthUserProfile = {
  userId: string;
  authUserId: string;
  email: string;
  name: string;
  role: UserRole;
};

type PublicUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type AuthUserIdentity = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
  } | null;
};

const normalizeUserRole = (value: unknown): UserRole | null => {
  if (value === 'customer' || value === 'internal_support' || value === 'admin' || value === 'super_admin') {
    return value;
  }

  if (value === 'user') {
    return 'customer';
  }

  if (value === 'internal' || value === 'manager' || value === 'agent') {
    return 'internal_support';
  }

  return null;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isDevelopmentMode = __DEV__ && process.env.NODE_ENV !== 'production';

type DevOtpResponse = {
  success: boolean;
  otp?: string;
  error?: string;
};

const requestDevelopmentOtp = async (email: string): Promise<string> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/dev-request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ email }),
  });

  const payload = (await response.json().catch(() => ({ success: false, error: 'Invalid OTP response.' }))) as DevOtpResponse;

  if (!response.ok || !payload.success || !payload.otp) {
    throw new Error(payload.error || 'Unable to request development OTP.');
  }

  return payload.otp;
};

const mapProfile = (row: PublicUserRow, role: UserRole): AuthUserProfile => ({
  userId: row.id,
  authUserId: row.id,
  email: normalizeEmail(row.email),
  name: row.full_name?.trim() || row.email,
  role,
});

const getProfileByAuthUserId = async (authUser: AuthUserIdentity): Promise<AuthUserProfile> => {
  const { data, error } = await supabase.from('users').select('id,email,full_name,avatar_url,role').eq('id', authUser.id).maybeSingle<PublicUserRow>();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message || 'Unable to load profile.');
  }

  if (data?.id && data?.email) {
    return mapProfile(data, normalizeUserRole(data.role) ?? 'customer');
  }

  const normalizedEmail = normalizeEmail(authUser.email ?? '');
  if (!normalizedEmail) {
    throw new Error('Authenticated user email is missing.');
  }

  return {
    userId: authUser.id,
    authUserId: authUser.id,
    email: normalizedEmail,
    name: authUser.user_metadata?.full_name?.trim() || authUser.user_metadata?.name?.trim() || normalizedEmail,
    role: 'customer',
  };
};

export const sendOtp = async (email: string): Promise<string | null> => {
  const normalizedEmail = normalizeEmail(email);

  if (isDevelopmentMode) {
    try {
      return await requestDevelopmentOtp(normalizedEmail);
    } catch {
      // Fallback to Supabase email delivery when local dev OTP function is unavailable.
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to send OTP.');
  }

  return null;
};

export const verifyOtp = async (email: string, token: string): Promise<AuthUserProfile> => {
  const normalizedEmail = normalizeEmail(email);

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: token.trim(),
    type: 'email',
  });

  if (error) {
    throw new Error(error.message || 'Unable to verify OTP.');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || 'Authenticated user not found.');
  }

  return getProfileByAuthUserId(user);
};

export const resolveAuthorizedProfile = async (): Promise<AuthUserProfile | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || 'Unable to restore session.');
  }

  if (!session) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || 'Unable to restore authenticated user.');
  }

  return getProfileByAuthUserId(user);
};

export const getAuthenticatedUserId = async (): Promise<string | null> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || 'Unable to verify active session.');
  }

  if (!session) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message || 'Unable to load authenticated user.');
  }

  return user?.id ?? null;
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Unable to logout.');
  }
};

type ManageableUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
};

type ManageableUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
};

export const listUsersForManagement = async (): Promise<ManageableUser[]> => {
  const { data, error } = await supabase.from('users').select('id,email,full_name,role').order('created_at', { ascending: false }).get<ManageableUserRow>();

  if (error) {
    throw new Error(error.message || 'Unable to load users.');
  }

  return (data ?? []).flatMap((row) => {
    const normalizedRole = normalizeUserRole(row.role);
    if (!row?.id || !row?.email || !normalizedRole) {
      return [];
    }

    return [
      {
        ...row,
        role: normalizedRole,
      },
    ];
  });
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase.from('users').update({ role }).eq('id', userId).execute<ManageableUser>();

  if (error) {
    throw new Error(error.message || 'Unable to update role.');
  }
};
