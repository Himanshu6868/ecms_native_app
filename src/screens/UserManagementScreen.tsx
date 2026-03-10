import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import SelectField from '../components/SelectField';
import { createUser, type UserRole } from '../services/auth/authService';

const roleOptions = [
  { label: 'Customer', value: 'customer' },
  { label: 'Internal', value: 'internal' },
  { label: 'Admin', value: 'admin' },
];

const UserManagementScreen = (): React.JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [area, setArea] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name and email are required.');
      return;
    }

    try {
      setIsSaving(true);
      await createUser({ name: name.trim(), email: email.trim().toLowerCase(), role, area });
      Alert.alert('Success', 'User created successfully.');
      setName('');
      setEmail('');
      setRole('customer');
      setArea('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create user.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Users Management</Text>
      <Text style={styles.subtitle}>Add users to the authorized Supabase users table.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add User</Text>
        <AppInput value={name} onChangeText={setName} placeholder="Name" />
        <AppInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
        <SelectField
          label="Role"
          value={role}
          onChange={(value) => setRole(value as UserRole)}
          options={roleOptions}
        />
        <AppInput value={area} onChangeText={setArea} placeholder="Area (optional)" />

        <AppButton
          title={isSaving ? 'Saving...' : 'Add User'}
          onPress={() => {
            if (!isSaving) {
              void handleSubmit();
            }
          }}
        />
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
    gap: 12,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#0B1220',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default UserManagementScreen;
