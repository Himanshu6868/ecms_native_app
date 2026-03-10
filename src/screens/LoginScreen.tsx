import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';
import { buildProfile, sendOtp, storeSelectedRole, verifyOtp } from '../services/auth/authService';
import { getEmailError } from '../utils/validators';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const generateDevOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const LoginScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { role } = route.params;
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error' | 'info'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const emailError = useMemo(() => getEmailError(email.trim().toLowerCase()), [email]);

  const navigateToDashboard = (): void => {
    navigation.replace(role === 'internal' ? 'InternalApp' : 'CustomerApp');
  };

  const finalizeLogin = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setUser(buildProfile(data.user, role));
    } else {
      setUser({
        user: `dev-${normalizedEmail}`,
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0] || 'User',
        role,
      });
    }

    navigateToDashboard();
  };

  const handleSendOtp = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (emailError) {
      setStatus(emailError);
      setStatusTone('error');
      return;
    }

    if (role === 'internal' && !normalizedEmail.endsWith('@company.com')) {
      setStatus('Internal login requires an @company.com email address.');
      setStatusTone('error');
      return;
    }

    try {
      setIsRequestingOtp(true);
      setStatus(null);
      await storeSelectedRole(role);
      await sendOtp(normalizedEmail);

      if (__DEV__) {
        const devOtp = generateDevOtp();
        setGeneratedOtp(devOtp);
        setStatus(`OTP generated: ${devOtp}`);
      } else {
        setGeneratedOtp('');
        setStatus('OTP generated: sent');
      }
      setStatusTone('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send OTP.';
      setStatus(message);
      setStatusTone('error');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const otpValue = enteredOtp.trim();

    if (!otpValue) {
      setStatus('Enter email and OTP.');
      setStatusTone('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(null);
      await storeSelectedRole(role);

      if (__DEV__) {
        if (!generatedOtp || otpValue !== generatedOtp) {
          setStatus('Invalid or expired OTP. Generate a new OTP and try again.');
          setStatusTone('error');
          return;
        }
      } else {
        await verifyOtp(normalizedEmail, otpValue);
      }

      setStatus('Signed in successfully. Redirecting...');
      setStatusTone('success');
      await finalizeLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify OTP.';
      setStatus(message);
      setStatusTone('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backWrap} onPress={() => navigation.navigate('Landing')}>
        <Text style={styles.backText}>← Back to role selection</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.badge}>{role === 'customer' ? 'CUSTOMER FLOW' : 'INTERNAL FLOW'}</Text>
        <Text style={styles.infoTitle}>{role === 'customer' ? 'Customer and agent access' : 'Internal support login'}</Text>
        <Text style={styles.bullet}>• Passwordless email OTP authentication</Text>
        <Text style={styles.bullet}>• Secure one-time verification code</Text>
        <Text style={styles.bullet}>• Session persists across app restarts</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.badge}>{role === 'customer' ? 'CUSTOMER LOGIN' : 'INTERNAL LOGIN'}</Text>
        <Text style={styles.formTitle}>Email OTP Sign In</Text>
        <Text style={styles.formSubtitle}>Enter your email to receive a one-time verification code.</Text>

        <AppInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={role === 'customer' ? 'you@example.com' : 'team@company.com'}
        />

        <AppInput
          value={enteredOtp}
          onChangeText={setEnteredOtp}
          keyboardType="number-pad"
          placeholder="6-digit OTP"
          maxLength={6}
        />

        <View style={styles.btnGroup}>
          <AppButton
            title={isRequestingOtp ? 'Generating...' : 'Generate OTP'}
            onPress={() => {
              if (!isRequestingOtp) {
                void handleSendOtp();
              }
            }}
            disabled={isRequestingOtp}
          />
          <AppButton
            title={isSubmitting ? 'Signing in...' : role === 'internal' ? 'Sign In to Internal Portal' : 'Sign In to User Portal'}
            onPress={() => {
              if (!isSubmitting) {
                void handleVerifyOtp();
              }
            }}
            disabled={isSubmitting}
          />
        </View>

        {status ? <Text style={[styles.statusText, statusTone === 'success' ? styles.statusSuccess : styles.statusError]}>{status}</Text> : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 24,
    backgroundColor: '#030712',
    gap: 14,
  },
  backWrap: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  badge: {
    color: '#60A5FA',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  infoTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
  },
  bullet: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  formTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  formSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  btnGroup: {
    marginTop: 4,
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#86EFAC',
  },
  statusError: {
    color: '#FCA5A5',
  },
});

export default LoginScreen;
