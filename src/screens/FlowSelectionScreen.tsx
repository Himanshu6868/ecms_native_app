import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'FlowSelection'>;

const FlowSelectionScreen = ({ navigation }: Props): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure access for every workflow</Text>

      <View style={styles.card}>
        <Text style={styles.label}>NORMAL FLOW</Text>
        <Text style={styles.cardTitle}>Customer / Agent</Text>
        <Text style={styles.description}>For customers and external agents.</Text>
        <AppButton title="Continue" onPress={() => navigation.navigate('CustomerLogin')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>INTERNAL FLOW</Text>
        <Text style={styles.cardTitle}>Internal Team</Text>
        <Text style={styles.description}>For support staff and admins.</Text>
        <AppButton title="Continue" onPress={() => navigation.navigate('InternalLogin')} />
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
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 18,
    marginBottom: 16,
    gap: 10,
  },
  label: {
    color: '#93C5FD',
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default FlowSelectionScreen;
