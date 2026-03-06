import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerLoginScreen from '../screens/CustomerLoginScreen';
import FlowSelectionScreen from '../screens/FlowSelectionScreen';
import InternalLoginScreen from '../screens/InternalLoginScreen';
import TabNavigator from './TabNavigator';

export type AuthStackParamList = {
  FlowSelection: undefined;
  CustomerLogin: undefined;
  InternalLogin: undefined;
  AppTabs: undefined;
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
        initialRouteName="FlowSelection"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#030712' },
        }}
      >
        <Stack.Screen name="FlowSelection" component={FlowSelectionScreen} />
        <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
        <Stack.Screen name="InternalLogin" component={InternalLoginScreen} />
        <Stack.Screen name="AppTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigator;
