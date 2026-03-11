import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';
import { sendOtp, verifyOtp } from '../services/auth/authService';
import { getEmailError } from '../utils/validators';
import { useAuthStore } from '../store/useAuthStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const { setAuthState } = useAuthStore();
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error' | 'info'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailError = useMemo(() => getEmailError(normalizedEmail), [normalizedEmail]);

  const handleSendOtp = async (): Promise<void> => {
    if (emailError) {
      setStatus(emailError);
      setStatusTone('error');
      return;
    }

    try {
      setIsRequestingOtp(true);
      setStatus(null);
      setDevOtp(null);
      const otp = await sendOtp(normalizedEmail);
      setDevOtp(otp);
      setStatus(otp ? 'OTP generated for development. Enter the code to continue.' : 'OTP sent to your email. Enter the code to continue.');
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
    const otpValue = enteredOtp.trim();

    if (!otpValue) {
      setStatus('Enter the OTP code to continue.');
      setStatusTone('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(null);

      const profile = await verifyOtp(normalizedEmail, otpValue);
      setAuthState(profile);
      setStatus('Signed in successfully. Redirecting...');
      setStatusTone('success');
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
      <TouchableOpacity
        style={styles.backWrap}
        onPress={() => {
          navigation.navigate('Landing');
        }}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.badge}>SECURE LOGIN</Text>
        <Text style={styles.infoTitle}>Supabase Email OTP access</Text>
        <Text style={styles.bullet}>• Enter your email to receive a one-time passcode</Text>
        <Text style={styles.bullet}>• Verify OTP to create/restore your Supabase session</Text>
        <Text style={styles.bullet}>• After OTP verification, your session is logged in immediately</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Sign in with your email</Text>
        <Text style={styles.formSubtitle}>Use the OTP sent by Supabase to complete login.</Text>

        <AppInput
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setEnteredOtp('');
            setDevOtp(null);
          }}
          placeholder="you@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
        />

        <AppButton title={isRequestingOtp ? 'Sending OTP...' : 'Send OTP'} onPress={() => void handleSendOtp()} disabled={isRequestingOtp} />

        {__DEV__ && devOtp ? (
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>OTP (dev only)</Text>
            <Text style={styles.otpValue}>{devOtp}</Text>
            <Text style={styles.otpNote}>Use this code for local testing. Production never exposes OTPs in-app.</Text>
          </View>
        ) : null}

        <AppInput
          value={enteredOtp}
          onChangeText={setEnteredOtp}
          placeholder="6-digit code"
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="oneTimeCode"
        />

        <AppButton title={isSubmitting ? 'Logging in...' : 'Login'} onPress={() => void handleVerifyOtp()} disabled={isSubmitting} />

        {emailError ? <Text style={[styles.statusText, styles.statusError]}>{emailError}</Text> : null}
        {status ? (
          <Text style={[styles.statusText, statusTone === 'error' ? styles.statusError : statusTone === 'success' ? styles.statusSuccess : styles.statusInfo]}>
            {status}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 24,
    backgroundColor: '#030712',
    gap: 14,
  },
  backWrap: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
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
    padding: 16,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    color: '#93C5FD',
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    backgroundColor: '#0B2948',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  infoTitle: {
    color: '#F9FAFB',
    fontSize: 21,
    fontWeight: '700',
  },
  bullet: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  formSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  otpCard: {
    borderWidth: 1,
    borderColor: '#1E3A8A',
    backgroundColor: '#0B2948',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  otpLabel: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  otpValue: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
  },
  otpNote: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  statusInfo: {
    color: '#BFDBFE',
  },
  statusSuccess: {
    color: '#86EFAC',
  },
  statusError: {
    color: '#FCA5A5',
  },
});

export default LoginScreen;
