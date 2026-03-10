import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthStackNavigator from './src/navigation/AuthStackNavigator';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthStackNavigator />
    </SafeAreaProvider>
  );
};

export default App;
