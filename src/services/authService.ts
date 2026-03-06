import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { firebaseAuth, firestore } from './firebase';

const PENDING_EMAIL_KEY = 'auth_pending_email';

const actionCodeSettings = {
  url: Linking.createURL('auth-callback'),
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.ecms.nativeapp',
  },
  android: {
    packageName: 'com.ecms.nativeapp',
    installApp: true,
    minimumVersion: '1',
  },
};

export const sendMagicLink = async (email: string): Promise<void> => {
  await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
  await SecureStore.setItemAsync(PENDING_EMAIL_KEY, email);
};

export const completeSignInFromLink = async (incomingLink?: string): Promise<User | null> => {
  const link = incomingLink ?? (await Linking.getInitialURL()) ?? '';

  if (!link || !isSignInWithEmailLink(firebaseAuth, link)) {
    return null;
  }

  const email = await SecureStore.getItemAsync(PENDING_EMAIL_KEY);
  if (!email) {
    throw new Error('No pending email found on this device. Request a new login link.');
  }

  const result = await signInWithEmailLink(firebaseAuth, email, link);
  await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
  return result.user;
};

export const getCurrentUser = (): User | null => {
  return firebaseAuth.currentUser;
};

export const logout = async (): Promise<void> => {
  await signOut(firebaseAuth);
  await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  const userDocRef = doc(firestore, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    return null;
  }

  const role = userDocSnap.data().role;
  return typeof role === 'string' ? role : null;
};
