import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerLoginScreen from '../modules/auth/screens/CustomerLoginScreen';
import FlowSelectionScreen from '../modules/auth/screens/FlowSelectionScreen';
import InternalLoginScreen from '../modules/auth/screens/InternalLoginScreen';

export type AuthStackParamList = {
  FlowSelection: undefined;
  CustomerLogin: undefined;
  InternalLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator initialRouteName="FlowSelection" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FlowSelection" component={FlowSelectionScreen} />
      <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
      <Stack.Screen name="InternalLogin" component={InternalLoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
