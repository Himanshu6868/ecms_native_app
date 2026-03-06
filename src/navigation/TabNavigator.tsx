import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TicketCreationScreen from '../screens/TicketCreationScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';

type AppTabParamList = {
  Dashboard: undefined;
  'Create Ticket': undefined;
  'My Tickets': undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const TabNavigator = (): React.JSX.Element => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1220',
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: '#030712',
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            'Create Ticket': 'add-circle-outline',
            'My Tickets': 'list-outline',
            Profile: 'person-circle-outline',
          };

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Create Ticket" component={TicketCreationScreen} />
      <Tab.Screen name="My Tickets" component={MyTicketsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
