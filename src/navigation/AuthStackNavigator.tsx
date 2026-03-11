import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import CustomerStackNavigator from './CustomerStackNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import SuperAdminTabNavigator from './SuperAdminTabNavigator';
import SupportTabNavigator from './SupportTabNavigator';
import { logout as performLogout, resolveAuthorizedProfile } from '../services/auth/authService';
import { useAuthStore } from '../store/useAuthStore';

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  CustomerApp: undefined;
  SupportApp: undefined;
  AdminApp: undefined;
  SuperAdminApp: undefined;
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
  const { isAuthenticated, role, loading: authLoading, setAuthState, logout, setLoading } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        setLoading(true);
        const profile = await resolveAuthorizedProfile();
        setAuthState(profile);
      } catch {
        await performLogout();
        logout();
      } finally {
        setLoading(false);
        setBootstrapping(false);
      }
    };

    void initializeAuth();
  }, [logout, setAuthState, setLoading]);

  if (bootstrapping || authLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#030712' } }}>
        {isAuthenticated ? (
          role === 'super_admin' ? (
            <Stack.Screen name="SuperAdminApp" component={SuperAdminTabNavigator} />
          ) : role === 'admin' ? (
            <Stack.Screen name="AdminApp" component={AdminTabNavigator} />
          ) : role === 'internal_support' ? (
            <Stack.Screen name="SupportApp" component={SupportTabNavigator} />
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
