import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerLoginScreen from '../screens/CustomerLoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FlowSelectionScreen from '../screens/FlowSelectionScreen';
import InternalLoginScreen from '../screens/InternalLoginScreen';

export type RootStackParamList = {
  FlowSelection: undefined;
  CustomerLogin: undefined;
  InternalLogin: undefined;
  Dashboard: { email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="FlowSelection"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B1220' },
        }}
      >
        <Stack.Screen name="FlowSelection" component={FlowSelectionScreen} />
        <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
        <Stack.Screen name="InternalLogin" component={InternalLoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
