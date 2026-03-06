import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { completeSignInWithEmailLink, sendLoginLink } from '../services/firebase/authService';
import { useAuthStore } from '../store/useAuthStore';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'InternalLogin'>;

const InternalLoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { setUser, setLoading } = useAuthStore();

  const handleCompleteLogin = async (url?: string): Promise<void> => {
    try {
      setLoading(true);
      const profile = await completeSignInWithEmailLink(url);

      if (!profile) {
        setLoading(false);
        return;
      }

      setUser(profile);
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs' }],
      });
    } catch (error) {
      setLoading(false);
      const message = error instanceof Error ? error.message : 'Unable to login. Please try again.';
      Alert.alert('Login failed', message);
    }
  };

  useEffect(() => {
    void handleCompleteLogin();

    const subscription = Linking.addEventListener('url', (event) => {
      void handleCompleteLogin(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleSendLink = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Missing email', 'Please enter your company email address.');
      return;
    }

    if (!normalizedEmail.endsWith('@company.com')) {
      Alert.alert('Invalid company email', 'Internal login requires an @company.com email address.');
      return;
    }

    try {
      setBusy(true);
      await sendLoginLink(normalizedEmail);
      Alert.alert('Login link sent', 'Check your inbox and open the link on this device.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send login link.';
      Alert.alert('Login link error', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backWrap} onPress={() => navigation.navigate('FlowSelection')}>
        <Text style={styles.backText}>← Back to flow selection</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.badge}>INTERNAL TEAM FLOW</Text>
        <Text style={styles.infoTitle}>Internal support login</Text>
        <Text style={styles.bullet}>• Role validation enforced</Text>
        <Text style={styles.bullet}>• Passwordless email link authentication</Text>
        <Text style={styles.bullet}>• Actions logged for compliance</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.badge}>INTERNAL ACCESS</Text>
        <Text style={styles.formTitle}>Team Portal Login</Text>
        <Text style={styles.formSubtitle}>Use your company email to receive a secure login link.</Text>

        <AppInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="team@company.com"
        />

        <View style={styles.btnGroup}>
          <AppButton
            title={busy ? 'Sending...' : 'Send Login Link'}
            onPress={() => {
              if (!busy) {
                void handleSendLink();
              }
            }}
          />
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
    marginTop: 8,
    marginBottom: 16,
  },
  btnGroup: {
    marginTop: 4,
    gap: 10,
  },
});

export default InternalLoginScreen;
