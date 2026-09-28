import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import api from '../services/api';
import { isFavorito, toggleFavorito } from '../database/favoritesDb';

export default function DeputadoDetailScreen({ route }) {
  const { deputado } = route.params;

  const [detalhes, setDetalhes] = useState(null);
  const [orgaos, setOrgaos] = useState([]);

  const [carregandoDetalhes, setCarregandoDetalhes] = useState(true);
  const [carregandoOrgaos, setCarregandoOrgaos] = useState(true);
  const [erro, setErro] = useState(null);

  const [favoritado, setFavoritado] = useState(false);

  async function buscarDetalhes() {
    try {
      setCarregandoDetalhes(true);
      const response = await api.get(`/deputados/${deputado.id}`);
      setDetalhes(response.data.dados);
      console.log(response.data)
    } catch (error) {
      console.error('Falha ao buscar detalhes do deputado:', error.message);
      setErro('Não foi possível carregar os detalhes deste deputado.');
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  async function buscarOrgaos() {
    try {
      setCarregandoOrgaos(true);
      const response = await api.get(`/deputados/${deputado.id}/orgaos`, {
        params: { ordem: 'DESC', ordenarPor: 'dataInicio', itens: 15 },
      });
      setOrgaos(response.data.dados || []);
    } catch (error) {
      console.error('Falha ao buscar órgãos do deputado:', error.message);
    } finally {
      setCarregandoOrgaos(false);
    }
  }

  useEffect(() => {
    buscarDetalhes();
    buscarOrgaos();
  }, []);

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
        <ActivityIndicator size="large" color="#0052cc" />
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

  const status = detalhes?.ultimoStatus || {};
  console.log(status)

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={orgaos}
        keyExtractor={(item, index) => `${item.id || index}`}
        ListHeaderComponent={
          <View>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: status.urlFoto || deputado.urlFoto }}
                style={styles.foto}
              />
              <Text style={styles.nome}>
                {detalhes?.nomeCivil || deputado.nome}
              </Text>

              <View style={styles.badgePartido}>
                <Text style={styles.badgeTexto}>
                  {status.siglaPartido || deputado.siglaPartido} • {status.siglaUf || deputado.siglaUf}
                </Text>
              </View>

              <Text style={styles.email}>
                {status.email || 'E-mail não informado'}
              </Text>

              <TouchableOpacity
                style={[styles.favBotao, favoritado && styles.favBotaoAtivo]}
                onPress={handleToggleFavorito}
                activeOpacity={0.8}
              >
                <Text style={[styles.favTexto, favoritado && styles.favTextoAtivo]}>
                  {favoritado ? '❤️ Remover dos favoritos' : '🤍 Adicionar aos favoritos'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.tituloSecao}>Órgãos e Comissões</Text>

            {carregandoOrgaos && (
              <ActivityIndicator size="small" color="#0052cc" style={{ marginVertical: 16 }} />
            )}

            {!carregandoOrgaos && orgaos.length === 0 && (
              <Text style={styles.mensagemVazia}>Nenhum órgão encontrado.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orgaoCard}>
            <View style={styles.orgaoHeader}>
              <Text style={styles.orgaoSigla}>{item.siglaOrgao}</Text>
              {item.titulo && <Text style={styles.orgaoCargo}>{item.titulo}</Text>}
            </View>

            <Text style={styles.orgaoNome}>{item.nomePublicacao || item.nomeOrgao}</Text>

            <View style={styles.divisor} />

            <View style={styles.datasContainer}>
              <Text style={styles.dataTexto}>
                <Text style={styles.dataLabel}>Entrada: </Text>
                {item.dataInicio || 'N/A'}
              </Text>
              <Text style={styles.dataTexto}>
                <Text style={styles.dataLabel}>Saída: </Text>
                {item.dataFim || 'Atuante'}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  cardHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  foto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e9ecef',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#eef2f7',
  },
  nome: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1d20',
    marginBottom: 6,
  },
  badgePartido: {
    backgroundColor: '#e7f0ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052cc',
  },
  email: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 16,
  },
  favBotao: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#0052cc',
  },
  favBotaoAtivo: {
    backgroundColor: '#fff0f3',
    borderColor: '#ff4d6d',
  },
  favTexto: {
    fontSize: 14,
    color: '#0052cc',
    fontWeight: '600',
  },
  favTextoAtivo: {
    color: '#ff4d6d',
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#212529',
  },
  orgaoCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  orgaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orgaoSigla: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0052cc',
  },
  orgaoCargo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  orgaoNome: {
    fontSize: 14,
    color: '#343a40',
    lineHeight: 20,
  },
  divisor: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginVertical: 10,
  },
  datasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataTexto: {
    fontSize: 12,
    color: '#6c757d',
  },
  dataLabel: {
    fontWeight: '600',
    color: '#495057',
  },
  mensagem: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 12,
    fontSize: 14,
  },
  mensagemVazia: {
    textAlign: 'center',
    color: '#868e96',
    marginVertical: 20,
    fontSize: 14,
  },
  mensagemErro: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
});