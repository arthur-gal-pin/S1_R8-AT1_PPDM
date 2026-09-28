import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import DeputadoDetailScreen from '../screens/DeputadoDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// A aba "Deputados" precisa de uma Stack própria, pois dentro dela
// navegamos da lista (Home) para a tela de Detalhes.
function DeputadosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListaDeputados"
        component={HomeScreen}
        options={{ title: 'Deputados' }}
      />
      <Stack.Screen
        name="Detalhes"
        component={DeputadoDetailScreen}
        options={({ route }) => ({ title: route.params.deputado.nome })}
      />
    </Stack.Navigator>
  );
}

// A aba "Favoritos" também precisa de sua própria Stack, para que, ao tocar
// em um card favoritado, o usuário também consiga abrir a tela de Detalhes.
function FavoritosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListaFavoritos"
        component={FavoritesScreen}
        options={{ title: 'Favoritos' }}
      />
      <Stack.Screen
        name="Detalhes"
        component={DeputadoDetailScreen}
        options={({ route }) => ({ title: route.params.deputado.nome })}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // cada Stack interna já mostra seu próprio header
        tabBarActiveTintColor: '#1e88e5',
      }}
    >
      <Tab.Screen
        name="Deputados"
        component={DeputadosStack}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏛️</Text>,
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosStack}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>❤️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
