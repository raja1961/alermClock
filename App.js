import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import AppNavigation from './src/layouts/navigation/AppNavigation';

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <AppNavigation />
      </NavigationContainer>
    </PaperProvider>
  );
}
