import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { JobsExploreScreen } from '../screens/JobsExploreScreen';
import { CareerPathScreen } from '../screens/CareerPathScreen';
import { LaunchpadScreen } from '../screens/LaunchpadScreen';
import { CustomTabBar } from '../components/TabBar';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="JobsTab" component={JobsExploreScreen} />
      <Tab.Screen name="CareerTab" component={CareerPathScreen} />
      <Tab.Screen name="LaunchpadTab" component={LaunchpadScreen} />
    </Tab.Navigator>
  );
}
