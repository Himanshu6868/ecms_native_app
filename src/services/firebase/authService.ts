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
const DEFAULT_DYNAMIC_LINK_DOMAIN = 'ecmsapp.page.link';
const DEFAULT_ANDROID_PACKAGE = 'com.yourcompany.ecms';
const DEFAULT_CONTINUE_PATH = 'finishSignIn';

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
    case 'auth/unauthorized-continue-uri':
      return 'Login link setup is incomplete. Please contact support.';
    default:
      return 'Unable to complete authentication. Please try again.';
  }
};

const getConfiguredDynamicLinkDomain = (): string | null => {
  const configuredDomain = process.env.EXPO_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN;
  return configuredDomain || DEFAULT_DYNAMIC_LINK_DOMAIN;
};

const normalizeContinueUrl = (url: string): string => {
  if (url.includes('localhost')) {
    throw new Error('EXPO_PUBLIC_FIREBASE_CONTINUE_URL must not use localhost for Android email-link sign-in.');
  }

  return url;
};

const buildEmailLinkUrl = (): string => {
  const explicitContinueUrl = process.env.EXPO_PUBLIC_FIREBASE_CONTINUE_URL;

  if (explicitContinueUrl) {
    return normalizeContinueUrl(explicitContinueUrl);
  }

  const dynamicLinkDomain = getConfiguredDynamicLinkDomain();
  if (dynamicLinkDomain) {
    return `https://${dynamicLinkDomain}/${DEFAULT_CONTINUE_PATH}`;
  }

  throw new Error('Firebase email-link login is missing configuration. Set EXPO_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN or EXPO_PUBLIC_FIREBASE_CONTINUE_URL.');
};

const shouldAttachDynamicLinkDomain = (): boolean => {
  return !!getConfiguredDynamicLinkDomain();
};

const normalizeSignInLink = (incomingLink: string): string | null => {
  if (isSignInWithEmailLink(auth, incomingLink)) {
    return incomingLink;
  }

  const { queryParams } = Linking.parse(incomingLink);
  const nestedLink = queryParams.link;

  if (typeof nestedLink === 'string') {
    const decodedNestedLink = decodeURIComponent(nestedLink);
    if (isSignInWithEmailLink(auth, decodedNestedLink)) {
      return decodedNestedLink;
    }
  }

  return null;
};

export const sendLoginLink = async (email: string): Promise<void> => {
  const actionCodeSettings: {
    url: string;
    handleCodeInApp: boolean;
    android: {
      packageName: string;
      installApp: boolean;
      minimumVersion: string;
    };
    dynamicLinkDomain?: string;
  } = {
    url: buildEmailLinkUrl(),
    handleCodeInApp: true,
    android: {
      packageName: process.env.EXPO_PUBLIC_ANDROID_PACKAGE ?? DEFAULT_ANDROID_PACKAGE,
      installApp: true,
      minimumVersion: '1',
    },
  };

  if (shouldAttachDynamicLinkDomain()) {
    actionCodeSettings.dynamicLinkDomain = getConfiguredDynamicLinkDomain() ?? undefined;
  }

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
  const normalizedLink = link ? normalizeSignInLink(link) : null;
  const isSignInLink = !!normalizedLink;
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
    const credential = await signInWithEmailLink(auth, storedEmail, normalizedLink);
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
