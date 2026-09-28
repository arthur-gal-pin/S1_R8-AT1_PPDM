import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import api from '../services/api';
import { isFavorito, toggleFavorito } from '../database/favoritesDb';

export default function DeputadoDetailScreen({ route }) {
  // O objeto "deputado" resumido veio da tela anterior via navigation.navigate.
  const { deputado } = route.params;

  // Dados completos (email, gabinete, etc.) buscados na rota /deputados/{id}.
  const [detalhes, setDetalhes] = useState(null);
  // Lista de despesas buscada na rota /deputados/{id}/despesas.
  const [despesas, setDespesas] = useState([]);

  const [carregandoDetalhes, setCarregandoDetalhes] = useState(true);
  const [carregandoDespesas, setCarregandoDespesas] = useState(true);
  const [erro, setErro] = useState(null);

  const [favoritado, setFavoritado] = useState(false);

  // Busca as informações completas do deputado (inclui e-mail, gabinete etc.)
  async function buscarDetalhes() {
    try {
      setCarregandoDetalhes(true);
      // GET /deputados/{id} -> os dados ficam em response.data.dados
      const response = await api.get(`/deputados/${deputado.id}`);
      setDetalhes(response.data.dados);
    } catch (error) {
      console.error('Falha ao buscar detalhes do deputado:', error.message);
      setErro('Não foi possível carregar os detalhes deste deputado.');
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  // Busca as despesas recentes do deputado (verba de gabinete, viagens, etc.)
  async function buscarDespesas() {
    try {
      setCarregandoDespesas(true);
      // ordenamos por mês/ano decrescente para mostrar os gastos mais recentes primeiro
      // Os parâmetros de query vão no objeto "params" e o axios monta a URL sozinho.
      const response = await api.get(`/deputados/${deputado.id}/despesas`, {
        params: { ordem: 'DESC', ordenarPor: 'ano', itens: 15 },
      });
      setDespesas(response.data.dados || []);
    } catch (error) {
      console.error('Falha ao buscar despesas do deputado:', error.message);
      // Não sobrescrevemos o erro geral aqui para não esconder os detalhes
      // já carregados; apenas deixamos a lista de despesas vazia.
    } finally {
      setCarregandoDespesas(false);
    }
  }

  useEffect(() => {
    buscarDetalhes();
    buscarDespesas();
  }, []);

  // Verifica, ao abrir a tela, se este deputado já está favoritado.
  useEffect(() => {
    async function verificar() {
      const resultado = await isFavorito(deputado.id);
      setFavoritado(resultado);
    }
    verificar();
  }, []);

  async function handleToggleFavorito() {
    const novoEstado = await toggleFavorito(deputado);
    setFavoritado(novoEstado);
  }

  if (carregandoDetalhes) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text style={styles.mensagem}>Carregando detalhes...</Text>
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

  // O email e o status atual vêm dentro de "ultimoStatus" na resposta da API.
  const status = detalhes?.ultimoStatus || {};

  return (
    <FlatList
      style={styles.container}
      data={despesas}
      keyExtractor={(item, index) => `${item.codDocumento || index}`}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Image source={{ uri: status.urlFoto || deputado.urlFoto }} style={styles.foto} />
            <Text style={styles.nome}>{detalhes?.nomeCivil || deputado.nome}</Text>
            <Text style={styles.info}>
              {status.siglaPartido || deputado.siglaPartido} - {status.siglaUf || deputado.siglaUf}
            </Text>
            <Text style={styles.info}>{status.email || 'E-mail não informado'}</Text>

            <TouchableOpacity style={styles.favBotao} onPress={handleToggleFavorito}>
              <Text style={styles.favTexto}>
                {favoritado ? '❤️ Remover dos favoritos' : '🤍 Adicionar aos favoritos'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tituloSecao}>Despesas recentes</Text>

          {carregandoDespesas && (
            <ActivityIndicator size="small" color="#1e88e5" style={{ marginVertical: 12 }} />
          )}

          {!carregandoDespesas && despesas.length === 0 && (
            <Text style={styles.mensagem}>Nenhuma despesa encontrada.</Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.despesaItem}>
          <Text style={styles.despesaTipo} numberOfLines={2}>
            {item.tipoDespesa}
          </Text>
          <Text style={styles.despesaFornecedor} numberOfLines={1}>
            {item.nomeFornecedor}
          </Text>
          <Text style={styles.despesaValor}>
            R$ {Number(item.valorLiquido || item.valorDocumento || 0).toFixed(2)}
          </Text>
          <Text style={styles.despesaData}>
            {item.mes}/{item.ano}
          </Text>
        </View>
      )}
    />
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  nome: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  favBotao: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eef4ff',
    borderRadius: 20,
  },
  favTexto: {
    fontSize: 14,
    color: '#1e4e9c',
    fontWeight: '600',
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    color: '#333',
  },
  despesaItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  despesaTipo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  despesaFornecedor: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  despesaValor: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '700',
    marginTop: 4,
  },
  despesaData: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  mensagem: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 12,
  },
  mensagemErro: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 15,
  },
});
