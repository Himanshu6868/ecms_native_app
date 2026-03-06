import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../App';
import Button from '../components/Button';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = (): React.JSX.Element => {
  const navigation = useNavigation<LoginNavigationProp>();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Static login screen for navigation flow.</Text>
        <Button title="Enter Dashboard" onPress={() => navigation.navigate('Dashboard')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#030712',
  },
  card: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default LoginScreen;
