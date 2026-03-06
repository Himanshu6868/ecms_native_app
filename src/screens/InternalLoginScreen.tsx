import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'InternalLogin'>;

const InternalLoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backWrap} onPress={() => navigation.navigate('FlowSelection')}>
        <Text style={styles.backText}>← Back to flow selection</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.badge}>INTERNAL TEAM FLOW</Text>
        <Text style={styles.infoTitle}>Internal support login</Text>
        <Text style={styles.bullet}>• Role validation enforced</Text>
        <Text style={styles.bullet}>• OTP expires quickly</Text>
        <Text style={styles.bullet}>• Actions logged for compliance</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.badge}>INTERNAL ACCESS</Text>
        <Text style={styles.formTitle}>Team Portal Login</Text>
        <Text style={styles.formSubtitle}>Use your company email to request a one-time passcode.</Text>

        <AppInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="team@company.com"
        />

        <AppInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="6-digit OTP"
        />

        <View style={styles.btnGroup}>
          <AppButton
            title="Generate OTP"
            variant="secondary"
            onPress={() => Alert.alert('Demo only', 'OTP generation is UI-only in this build.')}
          />
          <AppButton title="Sign In to Internal Portal" onPress={() => navigation.navigate('Dashboard')} />
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
