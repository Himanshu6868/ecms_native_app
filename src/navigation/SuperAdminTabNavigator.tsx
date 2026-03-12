import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TicketCreationScreen from '../screens/TicketCreationScreen';

type SuperAdminTabParamList = {
  Dashboard: undefined;
  'Create Ticket': undefined;
  'Ticket Management': undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<SuperAdminTabParamList>();

const SuperAdminTabNavigator = (): React.JSX.Element => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#0B1220',
        borderTopColor: '#1F2937',
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 6,
      },
      tabBarActiveTintColor: '#60A5FA',
      tabBarInactiveTintColor: '#6B7280',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      sceneStyle: {
        backgroundColor: '#030712',
      },
      tabBarIcon: ({ color, size }) => {
        const iconMap: Record<keyof SuperAdminTabParamList, keyof typeof Ionicons.glyphMap> = {
          Dashboard: 'grid-outline',
          'Create Ticket': 'add-circle-outline',
          'Ticket Management': 'list-outline',
          Profile: 'person-outline',
        };

        return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Create Ticket" component={TicketCreationScreen} />
    <Tab.Screen name="Ticket Management" component={MyTicketsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default SuperAdminTabNavigator;
