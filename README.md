# Deputados App (Expo + React Native)

App de exemplo acadêmico que consome a API de Dados Abertos da Câmara dos
Deputados (https://dadosabertos.camara.leg.br/api/v2/).

## Estrutura de pastas

```
deputados-app/
├── App.js                          # ponto de entrada, monta a navegação
├── app.json                        # configuração do Expo
├── package.json
└── src/
    ├── navigation/
    │   └── AppNavigator.js         # Tabs (Deputados / Favoritos) + Stacks internas
    ├── screens/
    │   ├── HomeScreen.js           # lista + busca de deputados
    │   ├── DeputadoDetailScreen.js # detalhes + despesas do deputado
    │   └── FavoritesScreen.js      # lista lida do SQLite
    ├── components/
    │   └── DeputadoCard.js         # card reutilizável (foto, nome, partido, coração)
    ├── services/
    │   └── api.js                  # instância do axios (baseURL + timeout)
    └── database/
        └── favoritesDb.js          # tabela e CRUD de favoritos no SQLite
```

## Como rodar

1. Instale as dependências e alinhe as versões ao seu Expo SDK:
   ```bash
   npm install
   npx expo install --fix
   ```
2. Inicie o projeto:
   ```bash
   npx expo start
   ```
3. Abra no celular com o app **Expo Go** (escaneando o QR Code) ou em um
   emulador Android/iOS.

## Endpoints utilizados

- `GET /deputados` — lista de deputados (Home)
- `GET /deputados/{id}` — detalhes de um deputado (nome civil, e-mail, etc.)
- `GET /deputados/{id}/despesas` — despesas recentes do deputado

## Pontos para destacar na apresentação

- **Navegação**: `@react-navigation/bottom-tabs` para as abas + uma
  `native-stack` dentro de cada aba, permitindo abrir a tela de Detalhes
  tanto a partir da Home quanto dos Favoritos.
- **Consumo de API**: `axios` com uma instância central (`api.js`: baseURL e
  timeout), `try/catch` e estados de `loading`/`erro` em cada tela.
- **Persistência local**: `expo-sqlite` com a tabela `favoritos` criada na
  inicialização; `favoritesDb.js` centraliza o CRUD (SELECT/INSERT/DELETE).
- **Atualização entre telas**: uso de `useFocusEffect` para recarregar os
  favoritos sempre que o usuário volta para a Home ou abre a aba Favoritos.
