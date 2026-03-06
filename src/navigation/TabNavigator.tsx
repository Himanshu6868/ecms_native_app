import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ label }: { label: string }): React.JSX.Element => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>{label}</Text>
      <Text style={styles.placeholderCaption}>Static UI placeholder</Text>
    </View>
  );
};

const TabNavigator = (): React.JSX.Element => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: styles.scene,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
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
      <Tab.Screen name="Create Ticket">{() => <PlaceholderScreen label="Create Ticket" />}</Tab.Screen>
      <Tab.Screen name="My Tickets">{() => <PlaceholderScreen label="My Tickets" />}</Tab.Screen>
      <Tab.Screen name="Profile">{() => <PlaceholderScreen label="Profile" />}</Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  scene: {
    backgroundColor: '#030712',
  },
  tabBar: {
    backgroundColor: '#0B1220',
    borderTopColor: '#1F2937',
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
    padding: 20,
  },
  placeholderTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholderCaption: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default TabNavigator;
