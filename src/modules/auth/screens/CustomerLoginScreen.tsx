import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import { sendMagicLink } from '../../../services/authService';
import { type AuthStackParamList } from '../../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'CustomerLogin'>;

const COOLDOWN_SECONDS = 30;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CustomerLoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  const cooldownSecondsLeft = useMemo(() => {
    const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }, [cooldownUntil]);

  const isCooldown = cooldownSecondsLeft > 0;

  const handleSendMagicLink = async (): Promise<void> => {
    const sanitizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(sanitizedEmail)) {
      setError('Please enter a valid email address.');
      setSuccessMessage(null);
      return;
    }

    if (isCooldown || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccessMessage(null);
      await sendMagicLink(sanitizedEmail);
      setSuccessMessage('Login link sent. Open the link in your email on this device.');
      setCooldownUntil(Date.now() + COOLDOWN_SECONDS * 1000);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to send login link.';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>Customer / Agent Login</Text>
            <Text style={styles.helperText}>Use your email to receive a secure sign-in link.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

            <Pressable
              style={[styles.primaryButton, (sending || isCooldown) && styles.primaryButtonDisabled]}
              disabled={sending || isCooldown}
              onPress={() => {
                void handleSendMagicLink();
              }}
            >
              <Text style={styles.primaryButtonText}>
                {isCooldown ? `Retry in ${cooldownSecondsLeft}s` : sending ? 'Sending...' : 'Send Login Link'}
              </Text>
            </Pressable>

            <Pressable style={styles.backButton} onPress={navigation.goBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    padding: 20,
    gap: 14,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  helperText: { fontSize: 14, color: '#6B7280' },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  errorText: { color: '#DC2626', fontSize: 14 },
  successText: { color: '#047857', fontSize: 14 },
  primaryButton: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#1D4ED8',
  },
  primaryButtonDisabled: { backgroundColor: '#93C5FD' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  backButtonText: { color: '#4B5563', fontSize: 15, fontWeight: '500' },
});

export default CustomerLoginScreen;
