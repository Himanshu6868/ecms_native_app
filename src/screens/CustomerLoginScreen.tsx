import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerLogin'>;

const isBasicEmail = (value: string): boolean => /.+@.+\..+/.test(value);

const CustomerLoginScreen = ({ navigation }: Props): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleSignIn = (): void => {
    if (!email.trim()) {
      Alert.alert('Enter email', 'Please enter your email to continue.');
      return;
    }

    if (!isBasicEmail(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email format.');
      return;
    }

    navigation.navigate('Dashboard', { email: email.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Portal Login</Text>
      <AppInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AppInput
        value={otp}
        onChangeText={setOtp}
        placeholder="OTP"
        keyboardType="number-pad"
      />

      <View style={styles.buttonsWrap}>
        <AppButton title="Generate OTP" onPress={() => Alert.alert('OTP sent')} />
        <AppButton title="Sign In" onPress={handleSignIn} />
        <AppButton title="Back" variant="secondary" onPress={() => navigation.navigate('FlowSelection')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonsWrap: {
    marginTop: 8,
    gap: 10,
  },
});

export default CustomerLoginScreen;
