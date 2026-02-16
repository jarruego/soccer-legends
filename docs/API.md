# 📡 Documentación de la API

## Descripción General

La API REST de Soccer Legends está construida con **NestJS** y proporciona todos los endpoints necesarios para:
- Autenticación de usuarios
- Gestión de partidas
- Control de transacciones de dinero
- Gestión de jugadores

**Base URL:** `http://localhost:3000` (desarrollo)

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren un token JWT en el header:

```
Authorization: Bearer <tu_token_jwt>
```

### POST /auth/register
Crear una nueva cuenta de usuario.

**Request:**
```json
{
  "email": "jugador@example.com",
  "username": "jugador",
  "password": "MiPassword123",
  "avatar": "https://...",  // Opcional
  "phone": "+34 612345678"   // Opcional
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "jugador@example.com",
    "username": "jugador",
    "avatar": null,
    "phone": null,
    "isVerified": false,
    "isActive": true
  }
}
```

**Validaciones:**
- Email válido y único
- Password mínimo 8 caracteres
- Username entre 3-50 caracteres

---

### POST /auth/login
Iniciar sesión con usuario y contraseña.

**Request:**
```json
{
  "email": "jugador@example.com",
  "password": "MiPassword123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "jugador@example.com",
    "username": "jugador",
    "avatar": null,
    "phone": null
  }
}
```

**Errores:**
- `401 Unauthorized` - Email o password incorrectos

---

### GET /auth/profile
Obtener tu perfil actual. **Requiere JWT.**

**Response (200):**
```json
{
  "id": "uuid",
  "email": "jugador@example.com",
  "username": "jugador",
  "avatar": null,
  "phone": null,
  "isVerified": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 🎮 Partidas (Games)

### POST /games
Crear una nueva partida. **Requiere JWT.**

**Request:**
```json
{
  "name": "Partida en el parque",
  "description": "Futbolín en el parque central",
  "initialBalance": 100,
  "maxPlayers": 4,
  "location": "Parque Central"  // Opcional
}
```

**Response (201):**
```json
{
  "id": "game-uuid",
  "name": "Partida en el parque",
  "pin": "ABC123",
  "status": "pending",
  "maxPlayers": 4,
  "playersCount": 1,
  "createdBy": "uuid",
  "initialBalance": 100,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Validaciones:**
- `maxPlayers` entre 2 y 4
- `initialBalance` >= 0
- El creador se agrega automáticamente como jugador

---

### GET /games/:id
Obtener detalles completos de una partida. **Requiere JWT.**

**Response (200):**
```json
{
  "id": "game-uuid",
  "name": "Partida en el parque",
  "pin": "ABC123",
  "status": "active",
  "maxPlayers": 4,
  "createdBy": "uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "players": [
    {
      "id": "user-uuid",
      "username": "jugador1",
      "avatar": null,
      "currentBalance": 120,
      "position": 1
    },
    {
      "id": "user-uuid-2",
      "username": "jugador2",
      "avatar": null,
      "currentBalance": 80,
      "position": 2
    }
  ]
}
```

---

### GET /games
Obtener todas mis partidas. **Requiere JWT.**

**Query Parameters (opcionales):**
- `status`: `pending`, `active`, `finished`
- `limit`: Número máximo de resultados (default: 20)
- `offset`: Para paginación (default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": "game-uuid",
      "name": "Partida en el parque",
      "status": "active",
      "playersCount": 2,
      "maxPlayers": 4,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### GET /games/available
Obtener partidas activas disponibles para unirse. **Público (sin JWT).**

**Query Parameters:**
- `limit`: default 20
- `offset`: default 0

**Response (200):**
```json
{
  "data": [
    {
      "id": "game-uuid",
      "name": "Partida en el parque",
      "playersCount": 2,
      "maxPlayers": 4,
      "initialBalance": 100,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

### POST /games/join
Unirse a una partida usando su PIN. **Requiere JWT.**

**Request:**
```json
{
  "pin": "ABC123"
}
```

**Response (200):**
```json
{
  "id": "game-uuid",
  "name": "Partida en el parque",
  "status": "active",
  "playersCount": 3,
  "maxPlayers": 4,
  "players": [
    {
      "id": "user-uuid",
      "username": "jugador1",
      "currentBalance": 100
    },
    {
      "id": "user-uuid-2",
      "username": "jugador2",
      "currentBalance": 100
    },
    {
      "id": "tu-uuid",
      "username": "tu-nombre",
      "currentBalance": 100  // Tu saldo inicial
    }
  ]
}
```

**Errores:**
- `404 Not Found` - PIN no válido
- `400 Bad Request` - Partida llena o ya terminada
- `409 Conflict` - Ya eres jugador en esta partida

---

### DELETE /games/:id
Abandonar o eliminar una partida. **Requiere JWT.**

**Response (204):** Sin contenido

**Reglas:**
- Si eres el creador → se elimina la partida
- Si no eres el creador → te removes como jugador

---

### PATCH /games/:id/status
Cambiar estado de la partida. **Solo el creador. Requiere JWT.**

**Request:**
```json
{
  "status": "active"  // o "finished"
}
```

**Response (200):**
```json
{
  "id": "game-uuid",
  "name": "Partida en el parque",
  "status": "active",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

**Estados válidos:**
- `pending` → `active`
- `active` → `finished`

---

### GET /games/:id/balance/:userId
Obtener el saldo actual de un jugador en una partida. **Requiere JWT.**

**Response (200):**
```json
{
  "userId": "user-uuid",
  "gameId": "game-uuid",
  "currentBalance": 120,
  "initialBalance": 100,
  "difference": 20  // Ganancia/pérdida
}
```

---

## 💰 Transacciones

### POST /transactions/transfer
Transferencia entre dos jugadores en la misma partida. **Requiere JWT.**

**Request:**
```json
{
  "gameId": "game-uuid",
  "toUserId": "otro-jugador-uuid",
  "amount": 50,
  "description": "Apuesta perdida"
}
```

**Response (201):**
```json
{
  "id": "transaction-uuid",
  "gameId": "game-uuid",
  "type": "PLAYER_TO_PLAYER",
  "fromUserId": "tu-uuid",
  "toUserId": "otro-jugador-uuid",
  "amount": 50,
  "description": "Apuesta perdida",
  "createdAt": "2024-01-15T10:40:00Z"
}
```

**Validaciones:**
- Amount > 0
- No puedes transferir a ti mismo
- Ambos deben estar en la partida
- Saldo suficiente

**Errores:**
- `400 Bad Request` - Saldo insuficiente
- `404 Not Found` - Gameador o partida no existe

---

### POST /transactions/to-bank
Transferencia de tu saldo a la banca. **Requiere JWT.**

**Request:**
```json
{
  "gameId": "game-uuid",
  "amount": 30,
  "description": "Cambio de dinero"
}
```

**Response (201):**
```json
{
  "id": "transaction-uuid",
  "gameId": "game-uuid",
  "type": "PLAYER_TO_BANK",
  "fromUserId": "tu-uuid",
  "toUserId": null,
  "amount": 30,
  "description": "Cambio de dinero",
  "createdAt": "2024-01-15T10:40:00Z"
}
```

**Validaciones:**
- Amount > 0
- Saldo personal suficiente

---

### POST /transactions/withdraw
Retiro de la banca. **Solo el creador de la partida. Requiere JWT.**

**Request:**
```json
{
  "gameId": "game-uuid",
  "amount": 50,
  "description": "Cobro final"
}
```

**Response (201):**
```json
{
  "id": "transaction-uuid",
  "gameId": "game-uuid",
  "type": "BANK_TO_PLAYER",
  "fromUserId": null,
  "toUserId": "tu-uuid",
  "amount": 50,
  "description": "Cobro final",
  "createdAt": "2024-01-15T10:40:00Z"
}
```

**Validaciones:**
- Solo el creador puede retirar
- La banca debe tener fondos suficientes

---

### GET /transactions/:gameId
Obtener historial completo de transacciones de una partida. **Requiere JWT.**

**Query Parameters:**
- `limit`: default 50
- `offset`: default 0
- `type`: `PLAYER_TO_PLAYER`, `PLAYER_TO_BANK`, `BANK_TO_PLAYER`

**Response (200):**
```json
{
  "data": [
    {
      "id": "transaction-uuid",
      "type": "PLAYER_TO_PLAYER",
      "from": {
        "id": "user-uuid",
        "username": "jugador1"
      },
      "to": {
        "id": "user-uuid-2",
        "username": "jugador2"
      },
      "amount": 50,
      "description": "Apuesta",
      "createdAt": "2024-01-15T10:40:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### GET /transactions/:gameId/my-transactions
Obtener mis transacciones en una partida. **Requiere JWT.**

**Response (200):**
```json
{
  "data": [
    {
      "id": "transaction-uuid",
      "type": "PLAYER_TO_PLAYER",
      "amount": 50,
      "description": "Apuesta",
      "role": "sender",  // o "receiver"
      "otherUser": {
        "id": "user-uuid",
        "username": "otro-jugador"
      },
      "createdAt": "2024-01-15T10:40:00Z"
    }
  ]
}
```

---

### GET /transactions/:gameId/bank-balance
Obtener el saldo de la banca. **Requiere JWT.**

**Response (200):**
```json
{
  "gameId": "game-uuid",
  "bankBalance": 150,
  "totalDeposited": 200,
  "totalWithdrawn": 50
}
```

---

### GET /transactions/:gameId/summary
Resumen financiero completo de la partida. **Requiere JWT.**

**Response (200):**
```json
{
  "gameId": "game-uuid",
  "gameName": "Partida en el parque",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "players": [
    {
      "id": "user-uuid",
      "username": "jugador1",
      "initialBalance": 100,
      "currentBalance": 120,
      "difference": 20,
      "percentageChange": 20
    },
    {
      "id": "user-uuid-2",
      "username": "jugador2",
      "initialBalance": 100,
      "currentBalance": 80,
      "difference": -20,
      "percentageChange": -20
    }
  ],
  "bankBalance": 0,
  "totalTransactions": 3,
  "summary": {
    "totalPlayerToPlayer": 100,
    "totalToBank": 50,
    "totalFromBank": 0
  }
}
```

---

## 🔄 Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token expirado o inválido |
| 403 | Forbidden - No tienes permiso |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Conflicto (ej: email duplicado) |
| 500 | Server Error - Error del servidor |

---

## 🛡️ Estructura de Errores

Todos los errores siguen este formato:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

---

## 📊 Modelos de Datos

### User
```typescript
{
  id: UUID
  email: string (unique)
  username: string (unique)
  password: string (hashed)
  avatar: string | null
  phone: string | null
  isVerified: boolean
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Game
```typescript
{
  id: UUID
  name: string
  pin: string (unique, 6 chars)
  description: string | null
  initialBalance: number
  maxPlayers: 2 | 3 | 4
  status: "pending" | "active" | "finished"
  location: string | null
  createdBy: UUID (FK to User)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### GamePlayer
```typescript
{
  gameId: UUID (FK to Game)
  userId: UUID (FK to User)
  currentBalance: number
  position: number
  joinedAt: DateTime
}
```

### Transaction
```typescript
{
  id: UUID
  gameId: UUID (FK to Game)
  fromUserId: UUID | null (FK to User)
  toUserId: UUID | null (FK to User)
  type: "PLAYER_TO_PLAYER" | "PLAYER_TO_BANK" | "BANK_TO_PLAYER"
  amount: number
  description: string | null
  createdAt: DateTime
}
```

---

## 🧪 Ejemplos con cURL

### Registrarse
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jugador@example.com",
    "username": "jugador",
    "password": "MiPassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jugador@example.com",
    "password": "MiPassword123"
  }'
```

### Crear partida
```bash
curl -X POST http://localhost:3000/games \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Partida en el parque",
    "initialBalance": 100,
    "maxPlayers": 4
  }'
```

### Unirse a partida
```bash
curl -X POST http://localhost:3000/games/join \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "ABC123"
  }'
```

### Transferencia entre jugadores
```bash
curl -X POST http://localhost:3000/transactions/transfer \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "<GAME_ID>",
    "toUserId": "<OTRO_JUGADOR_ID>",
    "amount": 50,
    "description": "Apuesta"
  }'
```

---

## 🔗 Flujo de Uso Típico

1. **Nuevos usuarios registran:** `POST /auth/register`
2. **Usuarios logueados:** `POST /auth/login` (obtienen token)
3. **Crear partida:** `POST /games` (auto-se añade el creador)
4. **Otros se unen:** `POST /games/join` (con PIN)
5. **Transacciones:** `POST /transactions/transfer` etc.
6. **Resumen:** `GET /transactions/:gameId/summary`

---

## 📞 Notas Importantes

- **Tokens JWT expiran en 24 horas** (configurable en .env)
- **PIN auto-generado:** 6 caracteres alfanuméricos únicos
- **Moneda:** EUR (configurable en frontend)
- **Validación:** Toda entrada validada con class-validator
- **CORS habilitado** para desarrollo local
