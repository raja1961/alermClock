import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SetAlerm from '../screens/SetAlerm';
const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SetAlerm" component={SetAlerm} />
    </Stack.Navigator>
  );
};

export default AppNavigation;
