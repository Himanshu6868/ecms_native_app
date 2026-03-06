import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import FlowSelectionScreen from '../modules/auth/screens/FlowSelectionScreen';
import CustomerLoginScreen from '../modules/auth/screens/CustomerLoginScreen';
import InternalLoginScreen from '../modules/auth/screens/InternalLoginScreen';

export type AuthStackParamList = {
  FlowSelection: undefined;
  CustomerLogin: undefined;
  InternalLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const AuthNavigator = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="FlowSelection"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="FlowSelection" component={FlowSelectionScreen} />
        <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
        <Stack.Screen name="InternalLogin" component={InternalLoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;
