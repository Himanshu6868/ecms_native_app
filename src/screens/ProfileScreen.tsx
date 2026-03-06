import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ActionItem from '../components/ActionItem';
import Button from '../components/Button';
import InfoRow from '../components/InfoRow';
import { AuthStackParamList } from '../navigation/AuthStackNavigator';
import { logout as firebaseLogout } from '../services/firebase/authService';
import { useAuthStore } from '../store/useAuthStore';

type ProfileNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const ProfileScreen = (): React.JSX.Element => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, name, email, role, logout } = useAuthStore();

  const handleLogout = async (): Promise<void> => {
    try {
      await firebaseLogout();
      logout();

      navigation.reset({
        index: 0,
        routes: [{ name: 'FlowSelection' }],
      });
    } catch {
      Alert.alert('Logout failed', 'Unable to logout right now. Please try again.');
    }
  };

  const initials = (name ?? 'User')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Account information</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>{name ?? 'User'}</Text>
        <Text style={styles.email}>{email ?? '-'}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{(role ?? 'user').toUpperCase()}</Text>
        </View>

        <View style={styles.infoSection}>
          <InfoRow label="Department" value="Support" />
          <InfoRow label="User ID" value={user ?? '-'} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.actionsWrap}>
          <ActionItem title="Edit Profile" />
          <ActionItem title="Notification Settings" />
          <ActionItem title="Privacy & Security" />
        </View>
      </View>

      <View style={styles.logoutSection}>
        <Button title="Logout" variant="danger" onPress={() => void handleLogout()} style={styles.logoutButton} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B1220',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#111827',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#BFDBFE',
    fontSize: 26,
    fontWeight: '700',
  },
  name: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  email: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  roleBadge: {
    alignSelf: 'center',
    backgroundColor: '#0B2948',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  roleText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    marginTop: 2,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 17,
    fontWeight: '700',
  },
  actionsWrap: {
    gap: 10,
  },
  logoutSection: {
    marginTop: 4,
  },
  logoutButton: {
    width: '100%',
    borderRadius: 14,
  },
});

export default ProfileScreen;
