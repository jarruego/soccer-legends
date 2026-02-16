# 🏗️ Guía de Arquitectura - Soccer Legends

Explicación detallada de los patrones de diseño, decisiones arquitectónicas y cómo todo se conecta.

---

## 📊 Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React Native)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │ Components   │  │   Store      │      │
│  │  (UI Layer)  │  │ (Reusable)   │  │ (Zustand)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│                    ┌──────▼────────┐                        │
│                    │  Services     │                        │
│                    │  (API Calls)  │                        │
│                    └──────┬────────┘                        │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/REST
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                    Backend (NestJS)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │  Services    │  │ Repositories │      │
│  │  (HTTP)      │  │ (Logic)      │  │ (Data Access)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│                    ┌──────▼────────┐                        │
│                    │     ORM       │                        │
│                    │   (Drizzle)   │                        │
│                    └──────┬────────┘                        │
└─────────────────────────┼────────────────────────────────────┘
                          │ SQL
                          │
                    ┌─────▼──────┐
                    │ PostgreSQL │
                    │  Database  │
                    └────────────┘
```

---

## 🏛️ Patrones Arquitectónicos

### 1. Arquitectura en Capas

**Backend:**

```
┌─────────────────────────────┐
│   Controllers (HTTP)        │ ← Request entry point
├─────────────────────────────┤
│   Services (Business Logic) │ ← Validation, transactions
├─────────────────────────────┤
│   Repositories (DB Access)  │ ← Query builder
├─────────────────────────────┤
│   Models/Schemas            │ ← Type definitions
├─────────────────────────────┤
│   Database (Drizzle/Pg)     │ ← SQL execution
└─────────────────────────────┘
```

**Ventajas:**
- ✅ Fácil testing (cada capa es independiente)
- ✅ Separación de responsabilidades
- ✅ Reutilización de lógica
- ✅ Escalabilidad

### 2. Patrón Repository

**Antes (sin repository):**
```typescript
// Lógica de DB esparcida en servicios
gamesService.ts:
  const games = db.query.games.findMany(...)
  const users = db.query.users.findMany(...)
```

**Después (con repository):**
```typescript
// Repository abstrae acceso a BD
gamesRepository.ts:
  findById(id: string) { return db.query.games.findFirst(...) }
  
gamesService.ts:
  const game = gamesRepository.findById(id)
```

**Ventajas:**
- ✅ Un lugar para consultas
- ✅ Fácil cambiar BD (Drizzle → TypeORM)
- ✅ Testing con mocks

### 3. Patrón DTO (Data Transfer Object)

**Sin DTO:**
```typescript
// Problemas: valida de todo, expone internos
@Post('/register')
register(user: User) { ... }
```

**Con DTO:**
```typescript
// Limpio: solo campos esperados, validación clara
@Post('/register')
register(@Body() dto: RegisterDto) { ... }

// dto.ts
export class RegisterDto {
  @IsEmail()
  email: string

  @MinLength(8)
  password: string
}
```

**Ventajas:**
- ✅ Validación declarativa
- ✅ No expone internos (no envía password hasheado)
- ✅ Documentación automática
- ✅ Type safety

### 4. Inyección de Dependencias (NestJS)

```typescript
// Sin DI (acoplado):
class GamesService {
  private db = new Database() // hardcoded
}

// Con DI (desacoplado):
@Injectable()
class GamesService {
  constructor(
    @Inject('DATABASE_PROVIDER') private db: Database
  ) {} // inyectado
}

// En module:
@Module({
  providers: [
    { provide: 'DATABASE_PROVIDER', useValue: db }
  ]
})
```

**Ventajas:**
- ✅ Testing fácil (puedes pasar mock)
- ✅ Componentes desacoplados
- ✅ Flexible y mantenible

---

## 📱 Frontend: Arquitectura

### 1. Estado con Zustand

```
App.tsx
  ├─ useAuthStore (global auth state)
  │   ├─ user
  │   ├─ token
  │   └─ login(), logout(), register()
  │
  ├─ useGamesStore (global games state)
  │   ├─ currentGame
  │   ├─ userGames
  │   └─ createGame(), joinGame()
  │
  └─ Component tree
      ├─ LoginScreen (consume useAuthStore)
      ├─ HomeScreen (consume useGamesStore)
      └─ ...
```

**Por qué Zustand y no Redux?**

| Redux | Zustand |
|-------|---------|
| ❌ Boilerplate | ✅ Simple |
| ❌ Verbose | ✅ Minimalista |
| ✅ Comunidad grande | ✅ Suficiente comunidad |
| ❌ 10+ archivos | ✅ 1 archivo |

### 2. Services = HTTP Client

```
Component
  │
  ├─ llamaService.joinGame(pin)
  │   └─ gamesService.ts
  │       └─ httpClient.post('/games/join', {pin})
  │           └─ axios con interceptor de auth
  │
  └─ Zustand Store
      └─ setCurrentGame(data)
```

**Separación:**
- **Services:** HTTP calls (puros)
- **Store:** Estado aplicación
- **Components:** UI + lógica presentación

### 3. Importes Organizados

```typescript
// ✅ Bien
import { Button } from '@components/Button'
import { useAuthStore } from '@store/auth-store'
import { validateEmail } from '@utils/validation'

// ❌ Mal
import { Button } from '../../../components/Button'
import { useAuthStore } from '../../store/auth-store'
```

Configurado en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@store/*": ["src/store/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

---

## 🔐 Autenticación

### Flujo JWT

```
1. Register/Login
   └─ AuthService.register() / login()
   └─ Hash password (bcrypt)
   └─ Generar JWT token
   └─ Retornar token + user

2. Request autenticado
   └─ Frontend envía: Authorization: Bearer <token>
   └─ Middleware extrae token
   └─ JwtStrategy valida firma
   └─ Obtiene user de BD
   └─ Setea req.user = user

3. Controller recibe user
   └─ @CurrentUser() user: User
   └─ Sabe quién hace el request
```

**Seguridad:**
- JWT_SECRET cambia por deployment
- JWT expira en 24 horas
- Password hasheado con bcrypt (10 rounds)

---

## 💾 Base de Datos

### Esquema Relacional

```
┌─────────────────────┐
│      users          │
│  id (PK)            │
│  email (UNIQUE)     │
│  username (UNIQUE)  │
│  password           │
│  avatar             │
└──────────┬──────────┘
           │
           ├──────────────────────┐
           │                      │
           ▼                      ▼
    ┌──────────────┐      ┌─────────────────┐
    │    games     │      │  gamePlayers    │
    │  id (PK)     │◄─────│  (FK) gameId    │
    │  createdBy   │      │  (FK) userId    │
    │  (FK) users  │      │  currentBalance │
    │  pin         │      └─────────────────┘
    │  status      │              ▲
    └──────────────┘              │
           │                      │
           └──────────────────────┘

    ┌─────────────────┐
    │  transactions   │
    │  id (PK)        │
    │  (FK) gameId    │
    │  (FK) fromUser  │
    │  (FK) toUser    │
    │  amount         │
    │  type           │
    └─────────────────┘
```

### Índices para Performance

```sql
-- Búsquedas rápidas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_games_createdBy ON games(createdBy);
CREATE INDEX idx_gamePlayers_gameId ON gamePlayers(gameId);
CREATE INDEX idx_transactions_gameId ON transactions(gameId);
```

---

## 📡 Flujos Principales

### 1. Crear Partida

```
Frontend: CreateGameScreen
  ├─ User ingresa datos (name, balance, maxPlayers)
  ├─ Validación cliente (3-50 chars, 2-4 players)
  └─ gamesService.createGame(data)
        │
Backend: GamesController
  ├─ @UseGuards(JwtAuthGuard)
  ├─ Recibe CreateGameDto
  └─ gamesService.createGame(dto, user)
        │
GamesService
  ├─ Valida maxPlayers (2-4)
  ├─ Genera PIN único (max 10 intentos)
  ├─ gamesRepository.create(gameData)
  ├─ gamesRepository.addPlayer(gameId, userId, initialBalance)
  └─ Retorna GameResponseDto
        │
Frontend: Store
  ├─ setCurrentGame(data)
  ├─ Actualiza UI
  └─ Navega a GameDetailScreen
```

### 2. Unirse a Partida

```
Frontend: JoinGameScreen
  ├─ User ingresa PIN
  ├─ Validación: 6 caracteres
  └─ gamesService.joinGame(pin)
        │
Backend: GamesController POST /games/join
  ├─ Recibe JoinGameDto {pin}
  └─ gamesService.joinGame(pin, user)
        │
GamesService
  ├─ gamesRepository.findByPin(pin)
  ├─ Validaciones:
  │  ├─ Existe PIN?
  │  ├─ Status es "pending" o "active"?
  │  ├─ Partida no llena?
  │  └─ No eres ya jugador?
  ├─ gamesRepository.addPlayer(gameId, userId, initialBalance)
  └─ Retorna GameDetailResponseDto
        │
Frontend: Store
  ├─ joinGame(data)
  ├─ Añade a userGames
  └─ Navega a GameDetailScreen
```

### 3. Transferencia Entre Jugadores

```
Frontend: TransactionScreen
  ├─ User selecciona: jugador, cantidad, motivo
  ├─ Validaciones cliente
  └─ transactionsService.transfer(data)
        │
Backend: TransactionsController POST /transactions/transfer
  ├─ Recibe CreateTransactionDto
  └─ transactionsService.transfer(dto, user)
        │
TransactionsService
  ├─ Validaciones:
  │  ├─ amount > 0
  │  ├─ fromUser ≠ toUser
  │  ├─ Ambos en misma partida
  │  └─ fromUser tiene saldo suficiente
  ├─ transactionsRepository.create(transaction)
  ├─ gamesRepository.updatePlayerBalance(from, -amount)
  ├─ gamesRepository.updatePlayerBalance(to, +amount)
  └─ Retorna TransactionResponseDto
        │
Frontend: Store
  ├─ Actualiza saldos en currentGame
  ├─ Añade a lista de transacciones
  └─ Muestra toast "Transferencia realizada"
```

---

## 🧪 Testing

### Backend

```typescript
// gamesService.test.ts
describe('GamesService', () => {
  it('should create game with generated PIN', () => {
    const service = new GamesService(mockRepository)
    const game = service.createGame(dto, user)
    
    expect(game.pin).toMatch(/^[A-Z0-9]{6}$/) // 6 alphanumeric
    expect(game.playersCount).toBe(1) // Creator added
  })
})
```

### Frontend

```typescript
// auth.store.test.ts
describe('useAuthStore', () => {
  it('should login and store token', async () => {
    const store = useAuthStore()
    await store.login({ email: 'test@example.com', password: 'pass' })
    
    expect(store.user).toBeDefined()
    expect(store.token).toBeDefined()
    expect(store.isAuthenticated).toBe(true)
  })
})
```

---

## 🚀 Performance

### Backend Optimization

1. **Database Indexes**: Querys rápidas
2. **Connection Pooling**: Pool de 10 conexiones
3. **Caching**: Próximamente (Redis)
4. **Pagination**: Limita resultados

### Frontend Optimization

1. **Code Splitting**: Lazy load screens
2. **Image Optimization**: WebP + thumbs
3. **State Management**: Solo datos necesarios
4. **Memoization**: React.memo para componentes

---

## 🔄 CI/CD (Próximo)

```yaml
# .github/workflows/main.yml
name: Tests & Deploy

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Test Backend
        run: cd server && npm test
      
      - name: Test Frontend
        run: cd client && npm test
  
  deploy:
    if: github.branch == 'main'
    steps:
      - name: Deploy Backend
        run: git push heroku main
      
      - name: Deploy Frontend
        run: vercel --prod
```

---

## 📈 Escalabilidad

### Horizontalmente (más servidores)

```
┌─────────────┐
│  Render     │ ← Instance 1 (API)
│  Instance 1 │
└─────────────┘
┌─────────────┐
│  Render     │ ← Instance 2 (API)
│  Instance 2 │
└─────────────┘
     │ Load Balancer (automático en Render)
     │
  ┌──▼──┐
  │  BD │ (Supabase - shared)
  └─────┘
```

### Verticalmente (más recursos)

```
# Upgrade Render plan
- De Free → Starter ($7/mes)
- De Starter → Standard ($25/mes)
- Más CPU/RAM automático
```

---

## 📋 Decisiones Arquitectónicas

| Decisión | Alternativa | Por qué |
|----------|-------------|--------|
| NestJS | Express | Estructura built-in, TypeScript first |
| Drizzle | TypeORM | Type safety, SQL explícito |
| PostgreSQL | MongoDB | Relaciones claras, ACID |
| Zustand | Redux | Simple, menos boilerplate |
| React Native | Flutter | JavaScript ecosystem, faster dev |
| Vercel | Netlify | Mejor Next.js integ. (si añadimos) |
| Render | Heroku | Más barato, mejor performance |

---

## 🎓 Problemas Comunes y Soluciones

### "Bearer token is malformed"
```typescript
// ❌ Frontend
bearerToken = 'jwt_token_aqui'  // Falta "Bearer "

// ✅ Frontend
bearerToken = 'Bearer jwt_token_aqui'
```

### "Email already in use"
```typescript
// Repository debe chequear ANTES de insertar
exist = await db.query.users.findFirst({ where: eq(users.email, dto.email) })
if (exist) throw new ConflictException('Email exists')
```

### "N+1 Query Problem"
```typescript
// ❌ Mal: 1 query principal + N queries
games.forEach(g => {
  console.log(gamesRepository.getPlayers(g.id)) // N queries!
})

// ✅ Bien: 1 query con JOIN
gamesRepository.getGamesWithPlayers()
```

---

¡Entender la arquitectura es clave para mantener y escalar! 🏗️
