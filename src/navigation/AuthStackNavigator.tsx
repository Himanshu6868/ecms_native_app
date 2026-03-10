import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import CustomerStackNavigator from './CustomerStackNavigator';
import InternalStackNavigator from './InternalStackNavigator';
import { buildProfile, getStoredRole, type UserRole } from '../services/auth/authService';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export type AuthStackParamList = {
  Landing: undefined;
  Login: { role: UserRole };
  CustomerApp: undefined;
  InternalApp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#030712',
    card: '#0B1220',
    border: '#1F2937',
    primary: '#3B82F6',
    text: '#F9FAFB',
  },
};

const AuthStackNavigator = (): React.JSX.Element => {
  const { isAuthenticated, role, setUser, logout, setLoading } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      setLoading(true);
      const [{ data: sessionData }, storedRole] = await Promise.all([supabase.auth.getSession(), getStoredRole()]);

      if (sessionData.session?.user && storedRole) {
        setUser(buildProfile(sessionData.session.user, storedRole));
      } else {
        logout();
      }

      setLoading(false);
      setBootstrapping(false);
    };

    void initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        logout();
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const storedRole = await getStoredRole();
        if (session?.user && storedRole) {
          setUser(buildProfile(session.user, storedRole));
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [logout, setLoading, setUser]);

  if (bootstrapping) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? (role === 'internal' ? 'InternalApp' : 'CustomerApp') : 'Landing'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#030712' },
        }}
      >
        {isAuthenticated ? (
          role === 'internal' ? (
            <Stack.Screen name="InternalApp" component={InternalStackNavigator} />
          ) : (
            <Stack.Screen name="CustomerApp" component={CustomerStackNavigator} />
          )
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthStackNavigator;
