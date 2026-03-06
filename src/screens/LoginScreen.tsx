import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../navigation/AuthStackNavigator';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { getEmailError, getPasswordError } from '../utils/validators';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'FlowSelection'>;

const LoginScreen = (): React.JSX.Element => {
  const navigation = useNavigation<LoginNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const emailError = useMemo(() => getEmailError(email), [email]);
  const passwordError = useMemo(() => getPasswordError(password), [password]);

  const showEmailError = (isSubmitted || touched.email) && emailError ? emailError : undefined;
  const showPasswordError = (isSubmitted || touched.password) && passwordError ? passwordError : undefined;

  const isFormValid = !emailError && !passwordError;

  const handleLogin = (): void => {
    setIsSubmitted(true);

    if (!isFormValid) {
      return;
    }

    navigation.replace('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.appName}>ECMS Console</Text>
          <Text style={styles.subtitle}>Enterprise Case Management</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <InputField
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            error={showEmailError}
            inputStyle={styles.input}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            error={showPasswordError}
            inputStyle={styles.input}
          />

          <Button title="Login" onPress={handleLogin} disabled={!isFormValid} style={styles.loginButton} />

          <Button
            title="Skip Login (Dev Mode)"
            onPress={() => navigation.replace('Dashboard')}
            variant="secondary"
            style={styles.skipLoginButton}
          />

          <Button title="Forgot Password?" onPress={() => {}} variant="text" style={styles.forgotButton} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030712',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#030712',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    backgroundColor: '#0B1220',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
  },
  input: {
    minHeight: 50,
  },
  loginButton: {
    marginTop: 4,
    width: '100%',
    borderRadius: 12,
  },
  skipLoginButton: {
    marginTop: 14,
    width: '100%',
    borderRadius: 12,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
});

export default LoginScreen;
