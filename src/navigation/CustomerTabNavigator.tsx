import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TicketCreationScreen from '../screens/TicketCreationScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import ProfileScreen from '../screens/ProfileScreen';

type CustomerTabParamList = {
  'Create Ticket': undefined;
  'My Tickets': undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerTabNavigator = (): React.JSX.Element => (
  <Tab.Navigator
    initialRouteName="Create Ticket"
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
        const iconMap: Record<keyof CustomerTabParamList, keyof typeof Ionicons.glyphMap> = {
          'Create Ticket': 'add-circle-outline',
          'My Tickets': 'list-outline',
          Profile: 'person-outline',
        };

        return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Create Ticket" component={TicketCreationScreen} />
    <Tab.Screen name="My Tickets" component={MyTicketsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default CustomerTabNavigator;
