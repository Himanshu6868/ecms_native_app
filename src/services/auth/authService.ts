import { supabase } from '../../lib/supabase';

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
  role: UserRole;
};

const isUserRole = (value: unknown): value is UserRole =>
  value === 'customer' || value === 'internal_support' || value === 'admin' || value === 'super_admin';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const mapProfile = (row: PublicUserRow): AuthUserProfile => ({
  userId: row.id,
  authUserId: row.id,
  email: normalizeEmail(row.email),
  name: row.full_name?.trim() || row.email,
  role: row.role,
});

const getProfileByAuthUserId = async (authUserId: string): Promise<AuthUserProfile> => {
  const { data, error } = await supabase.from('users').select('id,email,full_name,avatar_url,role').eq('id', authUserId).single<PublicUserRow>();

  if (error) {
    throw new Error(error.message || 'Unable to load profile.');
  }

  if (!data || !isUserRole(data.role)) {
    throw new Error('User role is invalid for this application.');
  }

  return mapProfile(data);
};

export const sendOtp = async (email: string): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to send OTP.');
  }
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

  return getProfileByAuthUserId(user.id);
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

  return getProfileByAuthUserId(user.id);
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

export const listUsersForManagement = async (): Promise<ManageableUser[]> => {
  const { data, error } = await supabase.from('users').select('id,email,full_name,role').order('created_at', { ascending: false }).get<ManageableUser>();

  if (error) {
    throw new Error(error.message || 'Unable to load users.');
  }

  return (data ?? []).filter((row): row is ManageableUser => Boolean(row?.id && row?.email && isUserRole(row.role)));
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase.from('users').update({ role }).eq('id', userId).execute<ManageableUser>();

  if (error) {
    throw new Error(error.message || 'Unable to update role.');
  }
};
