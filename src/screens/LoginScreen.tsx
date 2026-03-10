import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Invalid email', emailError);
      return;
    }

    if (role === 'internal' && !normalizedEmail.endsWith('@company.com')) {
      Alert.alert('Invalid company email', 'Internal login requires an @company.com email address.');
      return;
    }

    try {
      setLoading(true);
      await storeSelectedRole(role);
      await sendOtp(normalizedEmail);
      setOtpSent(true);
      setEnteredOtp('');

      if (__DEV__) {
        setGeneratedOtp(generateDevOtp());
      } else {
        setGeneratedOtp('');
      }

      Alert.alert('OTP sent', __DEV__ ? 'Use the DEV OTP shown below to continue.' : 'Please check your email for the verification code.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send OTP.';
      Alert.alert('OTP error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const otpValue = enteredOtp.trim();

    if (!otpValue) {
      Alert.alert('Missing OTP', 'Please enter the OTP sent to your email.');
      return;
    }

    try {
      setLoading(true);

      if (__DEV__) {
        if (!generatedOtp || otpValue !== generatedOtp) {
          Alert.alert('Verification failed', 'Invalid OTP. Please enter the DEV OTP shown on screen.');
          return;
        }
      } else {
        await verifyOtp(normalizedEmail, otpValue);
      }

      await finalizeLogin();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify OTP.';
      Alert.alert('Verification failed', message);
    } finally {
      setLoading(false);
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

        {otpSent ? (
          <>
            <AppInput
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              keyboardType="number-pad"
              placeholder="Enter OTP"
            />
            {__DEV__ && generatedOtp ? <Text style={styles.devOtpText}>DEV OTP: {generatedOtp}</Text> : null}
          </>
        ) : null}

        <View style={styles.btnGroup}>
          {otpSent ? (
            <AppButton
              title={loading ? 'Verifying...' : 'Verify OTP'}
              onPress={() => {
                if (!loading) {
                  void handleVerifyOtp();
                }
              }}
              disabled={loading}
            />
          ) : (
            <AppButton
              title={loading ? 'Sending...' : 'Send OTP'}
              onPress={() => {
                if (!loading) {
                  void handleSendOtp();
                }
              }}
              disabled={loading}
            />
          )}
        </View>
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
  devOtpText: {
    color: '#FDE68A',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
