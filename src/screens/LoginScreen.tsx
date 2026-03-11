import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';
import { requireAuthorizedUserByEmail, resolveAuthorizedProfile, sendOtp, verifyOtp } from '../services/auth/authService';
import { supabase } from '../lib/supabase';
import { getEmailError } from '../utils/validators';
import { useAuthStore } from '../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const { setAuthState } = useAuthStore();
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error' | 'info'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const emailError = useMemo(() => getEmailError(email.trim().toLowerCase()), [email]);

  const logLoginEvent = (event: string, payload?: Record<string, unknown>): void => {
    if (payload) {
      console.log(`[LoginScreen] ${event}`, payload);
      return;
    }

    console.log(`[LoginScreen] ${event}`);
  };

  const maskEmailForLog = (value: string): string => {
    const [name = '', domain = ''] = value.split('@');

    if (!domain) {
      return value;
    }

    if (name.length <= 2) {
      return `${name[0] ?? '*'}*@${domain}`;
    }

    return `${name.slice(0, 2)}***@${domain}`;
  };

  const finalizeLogin = async (): Promise<void> => {
    logLoginEvent('finalizeLogin:start');
    const profile = await resolveAuthorizedProfile();
    logLoginEvent('finalizeLogin:profile-resolved', {
      hasProfile: Boolean(profile),
      role: profile?.role,
    });
    setAuthState(profile);
    logLoginEvent('finalizeLogin:auth-state-updated');
  };

  const handleSendOtp = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const maskedEmail = maskEmailForLog(normalizedEmail);

    logLoginEvent('sendOtp:requested', {
      email: maskedEmail,
      hasEmailError: Boolean(emailError),
    });

    if (emailError) {
      logLoginEvent('sendOtp:blocked-validation', { emailError });
      setStatus(emailError);
      setStatusTone('error');
      return;
    }

    try {
      setIsRequestingOtp(true);
      setStatus(null);

      await requireAuthorizedUserByEmail(normalizedEmail);
      logLoginEvent('sendOtp:user-authorized', { email: maskedEmail });
      await sendOtp(normalizedEmail);
      logLoginEvent('sendOtp:success', { email: maskedEmail });

      setStatus('OTP sent successfully. Check your inbox and enter the code below.');
      setStatusTone('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send OTP.';
      logLoginEvent('sendOtp:failed', { email: maskedEmail, message });
      setStatus(message);
      setStatusTone('error');
    } finally {
      logLoginEvent('sendOtp:completed', { email: maskedEmail });
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const otpValue = enteredOtp.trim();
    const maskedEmail = maskEmailForLog(normalizedEmail);

    logLoginEvent('verifyOtp:requested', {
      email: maskedEmail,
      otpLength: otpValue.length,
    });

    if (!otpValue) {
      logLoginEvent('verifyOtp:blocked-missing-otp', { email: maskedEmail });
      setStatus('Enter the OTP code to continue.');
      setStatusTone('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(null);

      await verifyOtp(normalizedEmail, otpValue);
      logLoginEvent('verifyOtp:success', { email: maskedEmail });
      await finalizeLogin();
      setStatus('Signed in successfully. Redirecting...');
      setStatusTone('success');
    } catch (error) {
      await supabase.auth.signOut();
      const message = error instanceof Error ? error.message : 'Unable to verify OTP.';
      logLoginEvent('verifyOtp:failed', { email: maskedEmail, message });
      setStatus(message);
      setStatusTone('error');
    } finally {
      logLoginEvent('verifyOtp:completed', { email: maskedEmail });
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backWrap}
        onPress={() => {
          logLoginEvent('navigation:back-to-landing');
          navigation.navigate('Landing');
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.badge}>SECURE LOGIN</Text>
        <Text style={styles.infoTitle}>Role-based OTP access</Text>
        <Text style={styles.bullet}>• Login is allowed only for emails registered in Users table</Text>
        <Text style={styles.bullet}>• Passwordless one-time passcode verification</Text>
        <Text style={styles.bullet}>• Role and permissions loaded after sign-in</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.badge}>LOGIN</Text>
        <Text style={styles.formTitle}>Email OTP Sign In</Text>
        <Text style={styles.formSubtitle}>Enter your email to receive a one-time verification code.</Text>

        <AppInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />

        <AppInput value={enteredOtp} onChangeText={setEnteredOtp} keyboardType="number-pad" placeholder="6-digit OTP" maxLength={6} />

        <View style={styles.btnGroup}>
          <AppButton
            title={isRequestingOtp ? 'Generating...' : 'Generate OTP'}
            onPress={() => {
              if (!isRequestingOtp) {
                void handleSendOtp();
              }
            }}
          />
          <AppButton
            title={isSubmitting ? 'Verifying...' : 'Login'}
            onPress={() => {
              if (!isSubmitting) {
                void handleVerifyOtp();
              }
            }}
          />
        </View>

        {status ? (
          <View style={[styles.statusWrap, statusTone === 'success' ? styles.statusSuccess : statusTone === 'error' ? styles.statusError : styles.statusInfo]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
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
    gap: 8,
  },
  badge: {
    color: '#60A5FA',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  infoTitle: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
  },
  bullet: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  formTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  formSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  btnGroup: {
    marginTop: 8,
    gap: 10,
  },
  statusWrap: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginTop: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusSuccess: {
    borderColor: '#065F46',
    backgroundColor: '#052E2B',
  },
  statusError: {
    borderColor: '#7F1D1D',
    backgroundColor: '#450A0A',
  },
  statusInfo: {
    borderColor: '#1E3A8A',
    backgroundColor: '#0B2948',
  },
});

export default LoginScreen;
