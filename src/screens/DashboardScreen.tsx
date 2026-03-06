import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.message}>Login successful</Text>
      <Text style={styles.emailLabel}>Logged in as:</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.buttonWrap}>
        <AppButton
          title="Logout"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'FlowSelection' }],
            })
          }
        />
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
    alignItems: 'center',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: '#A7F3D0',
    fontSize: 18,
    marginBottom: 12,
  },
  emailLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  email: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonWrap: {
    width: '100%',
  },
});

export default DashboardScreen;
