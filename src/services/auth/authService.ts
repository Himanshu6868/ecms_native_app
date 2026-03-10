import * as SecureStore from 'expo-secure-store';

import { supabase, type SupabaseSession, type SupabaseUser } from '../../lib/supabase';

export type UserRole = 'customer' | 'internal';

const ROLE_STORAGE_KEY = 'selected_role';

export type AuthUserProfile = {
  user: string;
  email: string;
  name: string;
  role: UserRole;
};

const getNameFromUser = (user: SupabaseUser): string => {
  const metadataName = user.user_metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName;
  }

  const emailPrefix = user.email?.split('@')[0];
  if (emailPrefix && emailPrefix.trim()) {
    return emailPrefix;
  }

  return 'User';
};

export const storeSelectedRole = async (role: UserRole): Promise<void> => {
  await SecureStore.setItemAsync(ROLE_STORAGE_KEY, role);
};

export const getStoredRole = async (): Promise<UserRole | null> => {
  const storedRole = await SecureStore.getItemAsync(ROLE_STORAGE_KEY);
  if (storedRole === 'customer' || storedRole === 'internal') {
    return storedRole;
  }

  return null;
};

export const clearStoredRole = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ROLE_STORAGE_KEY);
};

export const sendOtp = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
  });

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

export const buildProfile = (user: SupabaseUser, role: UserRole): AuthUserProfile => ({
  user: user.id,
  email: user.email ?? '',
  name: getNameFromUser(user),
  role,
});

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }

  await clearStoredRole();
};
