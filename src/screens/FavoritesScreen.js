import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DeputadoCard from '../components/DeputadoCard';
import { getFavoritos, toggleFavorito } from '../database/favoritesDb';

export default function FavoritesScreen({ navigation }) {
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Função que lê a tabela de favoritos salva no SQLite.
  async function carregarFavoritos() {
    try {
      setCarregando(true);
      const lista = await getFavoritos();
      setFavoritos(lista);
    } catch (error) {
      // Como já tratamos erros dentro de favoritesDb.js, aqui só
      // garantimos que a tela não quebre e mostre lista vazia em caso de falha.
      console.error('Falha ao carregar favoritos:', error);
      setFavoritos([]);
    } finally {
      setCarregando(false);
    }
  }

  // useFocusEffect garante que, toda vez que o usuário abrir esta aba,
  // a lista seja recarregada (ex: após favoritar algo na Home).
  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [])
  );

  async function handleRemoverFavorito(deputado) {
    await toggleFavorito(deputado); // já está favoritado, então isso remove
    setFavoritos((prev) => prev.filter((dep) => dep.id !== deputado.id));
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <Text style={styles.mensagem}>Carregando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <DeputadoCard
            deputado={item}
            isFavorito={true}
            onPress={() => navigation.navigate('Detalhes', { deputado: item })}
            onToggleFavorito={() => handleRemoverFavorito(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centro}>
            <Text style={styles.mensagem}>
              Você ainda não favoritou nenhum deputado.{'\n'}
              Toque no coração na lista ou nos detalhes para adicionar.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mensagem: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
});
