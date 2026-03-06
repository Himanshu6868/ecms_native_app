import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import {
  AuthError,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, firestore } from './firebase';

const EMAIL_STORAGE_KEY = 'auth_email_for_signin';

export type AuthUserProfile = {
  user: string;
  email: string;
  name: string;
  role: string;
};

const mapAuthErrorMessage = (error: unknown): string => {
  const authError = error as AuthError;

  switch (authError?.code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/expired-action-code':
      return 'This login link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'This login link is invalid or has already been used.';
    case 'auth/user-disabled':
      return 'This account is disabled. Contact admin.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Unable to complete authentication. Please try again.';
  }
};

export const sendLoginLink = async (email: string): Promise<void> => {
  const actionCodeSettings = {
    url: 'ecmsnativeapp://auth-complete',
    handleCodeInApp: true,
  };

  try {
    console.log('[AUTH] Preparing actionCodeSettings');
    console.log('[AUTH] actionCodeSettings.url:', actionCodeSettings.url);
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    console.log('[AUTH] Login link sent successfully');
    console.log('[AUTH] Storing email for sign-in:', email);

    await SecureStore.setItemAsync(EMAIL_STORAGE_KEY, email);
  } catch (error) {
    console.error('[AUTH] Error:', error);
    throw new Error(mapAuthErrorMessage(error));
  }
};

export const completeSignInWithEmailLink = async (url?: string): Promise<AuthUserProfile | null> => {
  if (!url) {
    console.log('[AUTH] App launched');
  }
  const link = url ?? (await Linking.getInitialURL());
  console.log('[AUTH] Initial URL:', link);
  console.log('[AUTH] Checking if URL is sign-in link');
  const isSignInLink = !!link && isSignInWithEmailLink(auth, link);
  console.log('[AUTH] isSignInWithEmailLink:', isSignInLink);

  if (!isSignInLink) {
    return null;
  }

  console.log('[AUTH] Retrieving stored email from SecureStore');
  const storedEmail = await SecureStore.getItemAsync(EMAIL_STORAGE_KEY);

  if (!storedEmail) {
    console.warn('[AUTH] No stored email found');
    throw new Error('Email confirmation missing. Please request a new login link.');
  }

  console.log('[AUTH] Stored email:', storedEmail);

  try {
    const credential = await signInWithEmailLink(auth, storedEmail, link);
    console.log('[AUTH] Firebase sign-in successful');
    console.log('[AUTH] User UID:', credential.user.uid);
    console.log('[AUTH] User email:', credential.user.email);
    await SecureStore.deleteItemAsync(EMAIL_STORAGE_KEY);

    console.log('[AUTH] Fetching user profile from Firestore');
    console.log('[AUTH] Path:', `users/${credential.user.uid}`);
    const docRef = doc(firestore, 'users', credential.user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.error('[AUTH] Firestore user doc NOT found');
      throw new Error('User not registered. Contact admin.');
    }

    const data = snap.data();
    console.log('[AUTH] Firestore user doc found');
    console.log('[AUTH] Role:', data.role);
    console.log('[AUTH] Name:', data.name);

    return {
      user: credential.user.uid,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } catch (error) {
    console.error('[AUTH] Error:', error);
    if (error instanceof Error && error.message === 'User not registered. Contact admin.') {
      throw error;
    }

    throw new Error(mapAuthErrorMessage(error));
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('[AUTH] Firebase signOut successful');
  } catch (error) {
    console.error('[AUTH] Error:', error);
    throw error;
  }
};
