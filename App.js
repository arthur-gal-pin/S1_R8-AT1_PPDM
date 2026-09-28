import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

// Componente raiz do aplicativo.
// Aqui apenas "envolvemos" toda a navegação com o NavigationContainer,
// que é obrigatório para qualquer app que use React Navigation.
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator />
    </NavigationContainer>
  );
}
