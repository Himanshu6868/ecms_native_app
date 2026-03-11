import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/AppButton';
import SelectField from '../components/SelectField';
import { listUsersForManagement, type UserRole, updateUserRole } from '../services/auth/authService';
import { canCreateUsers } from '../services/auth/authorization';
import { useAuthStore } from '../store/useAuthStore';

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Customer', value: 'customer' },
  { label: 'Internal Support', value: 'internal_support' },
  { label: 'Admin', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' },
];

type ManageableUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
};

const UserManagementScreen = (): React.JSX.Element => {
  const { role: currentRole } = useAuthStore();
  const [users, setUsers] = useState<ManageableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUsers = async (): Promise<void> => {
      try {
        setIsLoadingUsers(true);
        const nextUsers = await listUsersForManagement();
        setUsers(nextUsers);

        if (nextUsers.length > 0) {
          setSelectedUserId(nextUsers[0].id);
          setSelectedRole(nextUsers[0].role);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load users.';
        Alert.alert('Error', message);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  const userOptions = useMemo(
    () => users.map((user) => ({ label: `${user.full_name?.trim() || user.email} (${user.email})`, value: user.id })),
    [users],
  );

  const handleUserChange = (userId: string): void => {
    setSelectedUserId(userId);
    const selectedUser = users.find((user) => user.id === userId);
    if (selectedUser) {
      setSelectedRole(selectedUser.role);
    }
  };

  const handleUpdateRole = async (): Promise<void> => {
    if (!canCreateUsers(currentRole)) {
      Alert.alert('Unauthorized', 'Only super admins can manage users.');
      return;
    }

    if (!selectedUserId) {
      Alert.alert('Validation', 'Select a user to update role.');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserRole(selectedUserId, selectedRole);
      setUsers((prev) => prev.map((user) => (user.id === selectedUserId ? { ...user, role: selectedRole } : user)));
      Alert.alert('Success', 'Role updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update role.';
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
      <Text style={styles.title}>User Role Management</Text>
      <Text style={styles.subtitle}>Super admins can assign roles in public.users.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assign Role</Text>
        <SelectField label="User" value={selectedUserId} onChange={handleUserChange} options={userOptions} />
        <SelectField label="Role" value={selectedRole} onChange={(value) => setSelectedRole(value as UserRole)} options={roleOptions} />

        <AppButton
          title={isSaving ? 'Updating...' : 'Update Role'}
          disabled={isSaving || isLoadingUsers || userOptions.length === 0}
          onPress={() => {
            if (!isSaving) {
              void handleUpdateRole();
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
