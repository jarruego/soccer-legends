/**
 * Tipos de navegación
 * Define todas las rutas posibles y sus parámetros
 */

export type RootStackParamList = {
  GameDetail: { gameId: string };
  Transaction: { gameId: string };
  // Auth screens
  Login: undefined;
  Register: undefined;

  // App screens
  Home: undefined;
  CreateGame: undefined;
  JoinGame: undefined;
  MyGames: undefined;
  [key: string]: undefined | object; // Agrega esta línea para cumplir con ParamListBase
};
