import * as Linking from 'expo-linking';

export const subscribeToDeepLinks = (onReceive: (url: string) => void): (() => void) => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    onReceive(url);
  });

  return () => {
    subscription.remove();
  };
};

export const getInitialDeepLink = async (): Promise<string | null> => {
  return Linking.getInitialURL();
};
