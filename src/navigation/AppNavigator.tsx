import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExploreScreen from '../modules/app/screens/ExploreScreen';
import HomeScreen from '../modules/app/screens/HomeScreen';

export type AppTabParamList = {
  Home: undefined;
  Explore: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = (): React.JSX.Element => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
