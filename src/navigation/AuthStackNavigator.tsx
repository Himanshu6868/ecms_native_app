import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerLoginScreen from '../screens/CustomerLoginScreen';
import FlowSelectionScreen from '../screens/FlowSelectionScreen';
import InternalLoginScreen from '../screens/InternalLoginScreen';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

export type AuthStackParamList = {
  Login: undefined;
  FlowSelection: undefined;
  CustomerLogin: undefined;
  InternalLogin: undefined;
  Dashboard: undefined;
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
  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#030712' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="FlowSelection" component={FlowSelectionScreen} />
        <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
        <Stack.Screen name="InternalLogin" component={InternalLoginScreen} />
        <Stack.Screen name="Dashboard" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigator;
