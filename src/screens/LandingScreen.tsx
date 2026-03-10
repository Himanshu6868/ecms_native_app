import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

const LandingScreen = ({ navigation }: Props): React.JSX.Element => {
  const goToLogin = (): void => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.topBadge}>ECMS AUTH</Text>
      <Text style={styles.title}>Secure access for every workflow</Text>
      <Text style={styles.subtitle}>Enterprise passwordless OTP authentication with role-based authorization.</Text>

      <View style={styles.card}>
        <Text style={styles.cardBadge}>AUTH FLOW</Text>
        <Text style={styles.cardTitle}>Continue to Login</Text>
        <Text style={styles.description}>Use your authorized email to receive an OTP and access your role-based workspace.</Text>
        <AppButton title="Sign In" onPress={goToLogin} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    backgroundColor: '#030712',
  },
  topBadge: {
    alignSelf: 'flex-start',
    color: '#93C5FD',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    backgroundColor: '#0B2948',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 18,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    gap: 10,
    marginBottom: 14,
  },
  cardBadge: {
    color: '#60A5FA',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default LandingScreen;
