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

import { type AuthStackParamList } from '../../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'InternalLogin'>;

const InternalLoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const isSignInDisabled = useMemo(() => otp.length !== 6, [otp]);

  const handleOtpChange = (value: string): void => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Internal Team Login</Text>
            <Text style={styles.helperText}>Use your company email address</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter company email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>OTP</Text>
              <TextInput
                value={otp}
                onChangeText={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />
            </View>

            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Generate OTP</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, isSignInDisabled && styles.primaryButtonDisabled]}
              disabled={isSignInDisabled}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  isSignInDisabled && styles.primaryButtonTextDisabled,
                ]}
              >
                Sign In
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  helperText: {
    marginBottom: 6,
    fontSize: 14,
    color: '#6B7280',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
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
  secondaryButton: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#1D4ED8',
  },
  primaryButtonDisabled: {
    backgroundColor: '#BFDBFE',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonTextDisabled: {
    color: '#E5E7EB',
  },
  backButton: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default InternalLoginScreen;
