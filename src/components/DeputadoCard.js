import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Card usado tanto na lista da Home quanto na lista de Favoritos.
 * Props:
 * - deputado: objeto com { id, nome, siglaPartido, siglaUf, urlFoto }
 * - onPress: função chamada ao tocar no card (navega para os detalhes)
 * - isFavorito: booleano que define se o coração aparece preenchido
 * - onToggleFavorito: função chamada ao tocar no ícone de coração
 */
export default function DeputadoCard({ deputado, onPress, isFavorito, onToggleFavorito }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: deputado.urlFoto }}
        style={styles.foto}
        // Caso a foto falhe ao carregar, não trava a UI.
        onError={() => {}}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.nome} numberOfLines={1}>
          {deputado.nome}
        </Text>
        <Text style={styles.partido}>
          {deputado.siglaPartido} {deputado.siglaUf ? `- ${deputado.siglaUf}` : ''}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onToggleFavorito}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.favButton}
      >
        <Text style={styles.coracao}>{isFavorito ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  foto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  partido: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  favButton: {
    padding: 4,
  },
  coracao: {
    fontSize: 22,
  },
});
