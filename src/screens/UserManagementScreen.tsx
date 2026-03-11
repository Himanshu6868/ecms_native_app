import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import SelectField from '../components/SelectField';
import { createUser, listReportingManagers } from '../services/auth/authService';
import { canCreateUsers } from '../services/auth/authorization';
import { useAuthStore } from '../store/useAuthStore';

type CreateRole = 'internal_support' | 'admin' | 'super_admin';

const roleOptions = [
  { label: 'Internal Support', value: 'internal_support' },
  { label: 'Admin', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' },
];

const UserManagementScreen = (): React.JSX.Element => {
  const { role: currentRole } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CreateRole>('internal_support');
  const [reportsTo, setReportsTo] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [managerOptions, setManagerOptions] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const loadManagers = async (): Promise<void> => {
      try {
        setIsLoadingManagers(true);
        const managers = await listReportingManagers();
        setManagerOptions(managers.map((manager) => ({ label: `${manager.name} (${manager.email})`, value: manager.id })));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load reporting managers.';
        Alert.alert('Error', message);
      } finally {
        setIsLoadingManagers(false);
      }
    };

    void loadManagers();
  }, []);

  const reportingManagerOptions = useMemo(
    () => [{ label: 'None', value: '' }, ...managerOptions],
    [managerOptions],
  );

  const handleSubmit = async (): Promise<void> => {
    if (!canCreateUsers(currentRole)) {
      Alert.alert('Unauthorized', 'Only super admins can create users.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name and email are required.');
      return;
    }

    try {
      setIsSaving(true);
      await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        reportsTo: reportsTo || null,
      });
      Alert.alert('Success', 'User created successfully.');
      setName('');
      setEmail('');
      setRole('internal_support');
      setReportsTo('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create user.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canCreateUsers(currentRole)) {
    return (
      <View style={styles.unauthorizedWrap}>
        <Text style={styles.unauthorizedText}>Unauthorized access</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Internal User</Text>
      <Text style={styles.subtitle}>Add internal support users, admins, and super admins.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create User</Text>
        <AppInput value={name} onChangeText={setName} placeholder="Name" />
        <AppInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
        <SelectField label="User Type" value={role} onChange={(value) => setRole(value as CreateRole)} options={roleOptions} />
        <SelectField
          label="Reporting Manager"
          value={reportsTo}
          onChange={setReportsTo}
          options={reportingManagerOptions}
        />

        <AppButton
          title={isSaving ? 'Creating...' : 'Create User'}
          disabled={isSaving || isLoadingManagers}
          onPress={() => {
            if (!isSaving && !isLoadingManagers) {
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
  unauthorizedWrap: {
    flex: 1,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unauthorizedText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserManagementScreen;
