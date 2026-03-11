import React from 'react';

import AdminTabNavigator from './AdminTabNavigator';
import SuperAdminTabNavigator from './SuperAdminTabNavigator';
import { canCreateUsers } from '../services/auth/authorization';
import { useAuthStore } from '../store/useAuthStore';

const InternalStackNavigator = (): React.JSX.Element => {
  const { role } = useAuthStore();

  if (canCreateUsers(role)) {
    return <SuperAdminTabNavigator />;
  }

  return <AdminTabNavigator />;
};

export default InternalStackNavigator;
