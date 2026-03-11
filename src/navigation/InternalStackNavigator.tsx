import React from 'react';

import AdminTabNavigator from './AdminTabNavigator';
import SuperAdminTabNavigator from './SuperAdminTabNavigator';
import { useAuthStore } from '../store/useAuthStore';

const InternalStackNavigator = (): React.JSX.Element => {
  const { role } = useAuthStore();

  if (role === 'super_admin') {
    return <SuperAdminTabNavigator />;
  }

  return <AdminTabNavigator />;
};

export default InternalStackNavigator;
