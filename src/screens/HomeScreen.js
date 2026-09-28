import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DeputadoCard from '../components/DeputadoCard';
import api from '../services/api';
import { getFavoritos, toggleFavorito } from '../database/favoritesDb';

export default function HomeScreen({ navigation }) {
  // Lista completa vinda da API (sem filtro).
  const [deputados, setDeputados] = useState([]);
  // Texto digitado no campo de busca.
  const [busca, setBusca] = useState('');
  // Estados de controle de UI.
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  // Guardamos apenas os IDs favoritados para saber qual coração pintar.
  const [favoritosIds, setFavoritosIds] = useState([]);

  // Função responsável por buscar a lista de deputados na API usando axios.
  async function buscarDeputados() {
    try {
      setCarregando(true);
      setErro(null);

      // A API devolve no máximo 100 itens por página e a Câmara tem 513 deputados.
      // Por isso pedimos as 6 páginas em paralelo (Promise.all) e juntamos o resultado.
      const paginas = [1, 2, 3, 4, 5, 6];
      const respostas = await Promise.all(
        paginas.map((pagina) =>
          api.get('/deputados', {
            params: { ordem: 'ASC', ordenarPor: 'nome', itens: 100, pagina },
          })
        )
      );

      // No axios o corpo da resposta fica em response.data.
      // A API da Câmara embrulha a lista em { dados: [...] }.
      const lista = respostas.flatMap((resposta) => resposta.data.dados || []);
      setDeputados(lista);
    } catch (error) {
      // O axios lança erro para falha de rede, timeout e status fora de 2xx.
      console.error('Falha ao buscar deputados:', error.message);
      setErro('Não foi possível carregar a lista de deputados. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  // Carrega a lista de deputados uma única vez, quando a tela monta.
  useEffect(() => {
    buscarDeputados();
  }, []);

  // Sempre que a tela ganha foco (ex: usuário volta da tela de detalhes),
  // recarregamos os favoritos salvos para manter os corações atualizados.
  useFocusEffect(
    useCallback(() => {
      async function carregarFavoritos() {
        const favoritos = await getFavoritos();
        setFavoritosIds(favoritos.map((f) => f.id));
      }
      carregarFavoritos();
    }, [])
  );

  // Alterna o favorito de um deputado diretamente pela lista.
  async function handleToggleFavorito(deputado) {
    const novoEstado = await toggleFavorito(deputado);
    setFavoritosIds((prev) =>
      novoEstado ? [...prev, deputado.id] : prev.filter((id) => id !== deputado.id)
    );
  }

  // Filtra a lista em tempo real conforme o texto digitado (sem chamar a API de novo).
  const deputadosFiltrados = deputados.filter((dep) =>
    dep.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // --- Estados de carregamento e erro ---
  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text style={styles.mensagem}>Carregando deputados...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.mensagemErro}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar deputado por nome..."
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
      />

      <FlatList
        data={deputadosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <DeputadoCard
            deputado={item}
            isFavorito={favoritosIds.includes(item.id)}
            onPress={() => navigation.navigate('Detalhes', { deputado: item })}
            onToggleFavorito={() => handleToggleFavorito(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.mensagem}>Nenhum deputado encontrado.</Text>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  input: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mensagem: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  mensagemErro: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 15,
  },
});
