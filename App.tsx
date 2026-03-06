import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthStackNavigator from './src/navigation/AuthStackNavigator';

const App = (): React.JSX.Element => {
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('[AUTH] Incoming deep link:', url);
    });

    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthStackNavigator />
    </SafeAreaProvider>
  );
};

export default App;
