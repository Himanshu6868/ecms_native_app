import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import { type AuthStackParamList } from '../../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'FlowSelection'>;

type FlowCardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

const FlowCard = ({ title, description, onPress }: FlowCardProps): React.JSX.Element => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <Pressable style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
};

const FlowSelectionScreen = ({ navigation }: Props): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <FlowCard
          title="Customer / Agent"
          description="For self-service customers and external agents creating tickets."
          onPress={() => navigation.navigate('CustomerLogin')}
        />
        <FlowCard
          title="Internal Team"
          description="For support staff, escalation teams, managers, and administrators."
          onPress={() => navigation.navigate('InternalLogin')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  primaryButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FlowSelectionScreen;
