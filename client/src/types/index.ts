/**
 * Tipos de la aplicación
 */

// Usuario
export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}

// Autenticación
export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'isEmailVerified' | 'createdAt'>;
  message?: string;
}

// Partida
export interface Game {
  id: string;
  name: string;
  description: string | null;
  pin: string;
  status: 'pending' | 'active' | 'finished';
  initialBalance: string;
  maxPlayers: number;
  location: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Jugador en partida
export interface GamePlayer {
  userId: string;
  username: string;
  avatar: string | null;
  currentBalance: string;
  createdAt: Date;
}

// Detalle de partida con jugadores
export interface GameDetail extends Game {
  players: GamePlayer[];
  playerCount: number;
}

// Transacción
export interface Transaction {
  id: string;
  gameId: string;
  fromUserId: string | null;
  toUserId: string | null;
  amount: string;
  type: 'player_to_player' | 'player_to_bank' | 'bank_to_player';
  description: string | null;
  createdAt: Date;
}

// Resumen financiero
export interface FinancialSummary {
  gameId: string;
  gameName: string;
  status: string;
  players: Array<{
    username: string;
    avatar: string | null;
    balance: number;
  }>;
  bankBalance: number;
  totalBalance: number;
  playerCount: number;
  maxPlayers: number;
}

// API Error
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
