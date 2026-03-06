import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'FlowSelection'>;

const FlowSelectionScreen = ({ navigation }: Props): React.JSX.Element => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.topBadge}>ECMS AUTH</Text>
      <Text style={styles.title}>Secure access for every workflow</Text>
      <Text style={styles.subtitle}>
        Enterprise passwordless email-link authentication with separate flows for external users and internal teams.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardBadge}>NORMAL FLOW</Text>
        <Text style={styles.cardTitle}>Customer / Agent</Text>
        <Text style={styles.description}>
          For self-service customers and external agents creating tickets on behalf of users.
        </Text>
        <AppButton title="Continue" onPress={() => navigation.navigate('CustomerLogin')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardBadge}>INTERNAL FLOW</Text>
        <Text style={styles.cardTitle}>Internal Team</Text>
        <Text style={styles.description}>
          For support, escalation teams, managers, and admins handling operations.
        </Text>
        <AppButton title="Continue" onPress={() => navigation.navigate('InternalLogin')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    backgroundColor: '#030712',
  },
  topBadge: {
    alignSelf: 'flex-start',
    color: '#93C5FD',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    backgroundColor: '#0B2948',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 18,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    gap: 10,
    marginBottom: 14,
  },
  cardBadge: {
    color: '#60A5FA',
    fontSize: 11,
    letterSpacing: 0.8,
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
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default FlowSelectionScreen;
