import * as SQLite from 'expo-sqlite';

// Abre (ou cria, se não existir) o arquivo do banco local no dispositivo.
const db = SQLite.openDatabaseSync('deputados.db');

// Cria a tabela de favoritos na primeira execução do app.
// "IF NOT EXISTS" evita erro quando o app é aberto novamente.
// O id é o próprio id do deputado na API, então não precisa de AUTOINCREMENT.
db.execSync(`
  CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    siglaPartido TEXT,
    siglaUf TEXT,
    urlFoto TEXT
  );
`);

/**
 * SELECT: retorna todos os deputados favoritados, em ordem alfabética.
 * getAllAsync devolve um array de objetos { id, nome, siglaPartido, ... }.
 */
export async function getFavoritos() {
  try {
    return await db.getAllAsync('SELECT * FROM favoritos ORDER BY nome ASC;');
  } catch (error) {
    console.error('Erro ao ler favoritos do SQLite:', error);
    return [];
  }
}

/**
 * SELECT com WHERE: verifica se um deputado já é favorito.
 * getFirstAsync retorna a primeira linha encontrada ou null.
 */
export async function isFavorito(id) {
  try {
    const linha = await db.getFirstAsync('SELECT id FROM favoritos WHERE id = ?;', [id]);
    return linha !== null;
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
}

/**
 * INSERT: adiciona o deputado aos favoritos.
 * "INSERT OR IGNORE" ignora silenciosamente se o id já existir.
 */
export async function addFavorito(deputado) {
  try {
    await db.runAsync(
      'INSERT OR IGNORE INTO favoritos (id, nome, siglaPartido, siglaUf, urlFoto) VALUES (?, ?, ?, ?, ?);',
      [deputado.id, deputado.nome, deputado.siglaPartido ?? null, deputado.siglaUf ?? null, deputado.urlFoto ?? null]
    );
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
  }
}

/**
 * DELETE: remove o deputado dos favoritos pelo id.
 */
export async function removeFavorito(id) {
  try {
    await db.runAsync('DELETE FROM favoritos WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
  }
}

/**
 * Alterna o estado: se já é favorito remove, se não é adiciona.
 * Retorna true se ficou favoritado, false se foi removido.
 */
export async function toggleFavorito(deputado) {
  const jaEhFavorito = await isFavorito(deputado.id);
  if (jaEhFavorito) {
    await removeFavorito(deputado.id);
    return false;
  }
  await addFavorito(deputado);
  return true;
}
