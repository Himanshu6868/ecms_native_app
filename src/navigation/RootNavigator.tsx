import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { completeSignInFromLink, getUserRole } from '../services/authService';
import { getInitialDeepLink, subscribeToDeepLinks } from '../services/deepLinkHandler';
import { firebaseAuth } from '../services/firebase';
import { useAuthStore } from '../store/authStore';

const RootNavigator = (): React.JSX.Element => {
  const { hydrateAuth, resetAuth, isAuthenticated, loading, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initialize = async (): Promise<void> => {
      setLoading(true);

      try {
        const initialLink = await getInitialDeepLink();
        if (initialLink) {
          const userFromLink = await completeSignInFromLink(initialLink);
          if (userFromLink) {
            const roleFromLink = await getUserRole(userFromLink.uid);
            if (mounted) {
              hydrateAuth({ user: userFromLink, role: roleFromLink });
            }
          }
        }
      } catch {
        if (mounted) {
          resetAuth();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initialize();

    const authUnsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!mounted) {
        return;
      }

      if (user) {
        const role = await getUserRole(user.uid);
        hydrateAuth({ user, role });
      } else {
        resetAuth();
      }
    });

    const deepLinkUnsubscribe = subscribeToDeepLinks(async (url) => {
      try {
        const user = await completeSignInFromLink(url);
        if (user) {
          const role = await getUserRole(user.uid);
          hydrateAuth({ user, role });
        }
      } catch {
        resetAuth();
      }
    });

    return () => {
      mounted = false;
      authUnsubscribe();
      deepLinkUnsubscribe();
    };
  }, [hydrateAuth, resetAuth, setLoading]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;
