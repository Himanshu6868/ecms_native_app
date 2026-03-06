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

const ACTION_CODE_URL =
  process.env.EXPO_PUBLIC_FIREBASE_EMAIL_LINK_URL ?? Linking.createURL('auth-complete');

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
  try {
    await sendSignInLinkToEmail(auth, email, {
      url: ACTION_CODE_URL,
      handleCodeInApp: true,
    });

    await SecureStore.setItemAsync(EMAIL_STORAGE_KEY, email);
  } catch (error) {
    throw new Error(mapAuthErrorMessage(error));
  }
};

export const completeSignInWithEmailLink = async (url?: string): Promise<AuthUserProfile | null> => {
  const link = url ?? (await Linking.getInitialURL());

  if (!link || !isSignInWithEmailLink(auth, link)) {
    return null;
  }

  const storedEmail = await SecureStore.getItemAsync(EMAIL_STORAGE_KEY);

  if (!storedEmail) {
    throw new Error('Email confirmation missing. Please request a new login link.');
  }

  try {
    const credential = await signInWithEmailLink(auth, storedEmail, link);
    await SecureStore.deleteItemAsync(EMAIL_STORAGE_KEY);

    const docRef = doc(firestore, 'users', credential.user.uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('User not registered. Contact admin.');
    }

    const data = snap.data();

    return {
      user: credential.user.uid,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'User not registered. Contact admin.') {
      throw error;
    }

    throw new Error(mapAuthErrorMessage(error));
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};
