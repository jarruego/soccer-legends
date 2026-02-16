# ❓ Preguntas Frecuentes (FAQ)

## General

### ¿Por qué dos carpetas (client y server)?

✅ **Mejor para**:
- Despliegue independiente
- Equipos separados
- Reutilizar API con múltiples clientes

❌ **Vs monolito único**:
- Más complicado al inicio
- Pero escala mejor

### ¿Puedo agregar más features?

**Claro!** Ejemplos de features fáciles de añadir:

1. **Perfil de usuario mejorado**
   - Avatar upload
   - Bio/descripción
   - Estadísticas personales

2. **Notificaciones**
   - Cuando alguien te transfiere dinero
   - Cuando se unen a tu partida

3. **Historial de partidas**
   - Resultados finales
   - Rankings de jugadores

4. **Sistema de amigos**
   - Agregar favoritos
   - Partidas privadas solo amigos

### ¿Qué tecnologías puedo aprender aquí?

1. **Backend:** NestJS, Drizzle, PostgreSQL, Autenticación JWT
2. **Frontend:** React Native, Zustand, Navegación, HTTP client
3. **DevOps:** Docker, Render, Vercel, Supabase
4. **Software Engineering:** Arquitectura en capas, Patrones SOLID

---

## Backend

### ¿Cómo agregar un nuevo endpoint?

**Ejemplo: Obtener ranking de mejores jugadores**

```typescript
// 1. Crear DTO (dto/get-ranking.dto.ts)
export class GetRankingDto {
  @IsInt()
  @Min(1)
  limit: number = 10
}

// 2. Agregar en Repository
// gamesRepository.ts
getRanking(limit: number) {
  return db.query.gamePlayers
    .findMany({
      orderBy: desc(gamePlayer.currentBalance),
      limit
    })
}

// 3. Agregar en Service
// gamesService.ts
getRanking(limit: number) {
  return this.gamesRepository.getRanking(limit)
}

// 4. Agregar en Controller
// gamesController.ts
@Get('/ranking')
async getRanking(@Query() dto: GetRankingDto) {
  return this.gamesService.getRanking(dto.limit)
}
```

### ¿Cómo manejar errores mejor?

Usa excepciones específicas de NestJS:

```typescript
// ✅ Bien
throw new NotFoundException('Partida no encontrada')
throw new BadRequestException('Saldo insuficiente')
throw new ForbiddenException('No eres el creador')
throw new ConflictException('PIN duplicado')

// ❌ Evita
throw new Error('Something went wrong')
```

### ¿Cómo agregar validación personalizada?

```typescript
// custom-validator.ts
import { registerDecorator, ValidatorOptions } from 'class-validator'

export function IsValidPin(options?: ValidatorOptions) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'isValidPin',
      target: target.constructor,
      propertyName: propertyName,
      validate(value: any) {
        return /^[A-Z0-9]{6}$/.test(value)
      }
    })
  }
}

// Después en DTO
export class JoinGameDto {
  @IsValidPin()
  pin: string
}
```

### ¿Cómo hacer una query compleja?

```typescript
// Obtener partida con todos sus datos (users, transacciones)
getGameFullDetails(gameId: string) {
  return db.query.games
    .findFirst({
      where: eq(games.id, gameId),
      with: {
        createdBy: true, // Incluye usuario creador
        players: {
          with: {
            user: true
          }
        }
      }
    })
}
```

---

## Frontend

### ¿Cómo agregar un campo al formulario?

**Ejemplo: Agregar teléfono a RegisterScreen**

```typescript
// 1. Añade estado
const [phone, setPhone] = useState('')

// 2. Validación helper
// utils/validation.ts
export function isValidPhone(phone: string) {
  return /^\+?[0-9]{9,}$/.test(phone)
}

// 3. Validar en submit
if (phone && !isValidPhone(phone)) {
  setErrors({...errors, phone: 'Teléfono no válido'})
}

// 4. TextInput en formulario
<TextInput
  placeholder="Teléfono (opcional)"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>

// 5. Enviar en registerDto
const success = await register({
  email, username, password,
  phone // ← agregado
})
```

### ¿Cómo agregar estado global?

```typescript
// store/leaderboard-store.ts
import { create } from 'zustand'

interface LeaderboardState {
  ranking: Player[]
  loadRanking: () => Promise<void>
}

export const useLeaderboardStore = create<LeaderboardState>(
  (set) => ({
    ranking: [],
    loadRanking: async () => {
      const data = await gamesService.getRanking(10)
      set({ ranking: data })
    }
  })
)

// En componente
const { ranking, loadRanking } = useLeaderboardStore()

useEffect(() => {
  loadRanking()
}, [])
```

### ¿Cómo hacer refresh de datos?

```typescript
// En pantalla
const [refreshing, setRefreshing] = useState(false)
const games = useGamesStore(s => s.userGames)
const loadUserGames = useGamesStore(s => s.loadUserGames)

const handleRefresh = async () => {
  setRefreshing(true)
  await loadUserGames()
  setRefreshing(false)
}

return (
  <FlatList
    data={games}
    refreshControl={
      <RefreshControl 
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    }
  />
)
```

### ¿Cómo navegar entre pantallas?

```typescript
// Navegar a pantalla con parámetros
navigation.navigate('GameDetail', { gameId: 'abc123' })

// Recibir parámetros
function GameDetailScreen({ route }: any) {
  const { gameId } = route.params
  // ...
}

// Volver
navigation.goBack()

// Navegar y reemplazar (sin botón back)
navigation.replace('Home')
```

### ¿Cómo guardar datos persistentes?

```typescript
// AsyncStorage automático en tienda
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (credentials) => {
        const response = await authService.login(credentials)
        set({
          user: response.user,
          token: response.token
        })
        // AsyncStorage.setItem('auth-storage', {...}) automático
      }
    }),
    {
      name: 'auth-storage' // clave de almacenamiento
    }
  )
)

// Restaurar al iniciar
useEffect(() => {
  useAuthStore.getState().restoreSession()
}, [])
```

---

## Base de Datos

### ¿Cómo agregar una nueva tabla?

```typescript
// schema/new-table.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const leaderboard = pgTable('leaderboard', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points').default(0),
  rank: integer('rank').notNull(),
  createdAt: timestamp('createdAt').defaultNow()
})

export const LeaderboardInsert = 
  typeof leaderboard.$inferInsert
export const Leaderboard = 
  typeof leaderboard.$inferSelect
```

```typescript
// schema/index.ts
export { leaderboard } from './new-table'
export * from './new-table'
```

### ¿Cómo hacer un backup de BD?

```bash
# Exportar datos
pg_dump -U postgres -h localhost soccer_legends > backup.sql

# Restaurar
psql -U postgres -h localhost < backup.sql
```

### ¿Cómo limpiar la BD?

```bash
# Hard reset (borra todo y recrea)
npm run db:reset

# O selectivo
npm run db:push  # Aplica cambios sin migración
```

---

## Debugging

### Backend no responde

```bash
# 1. Verifica que está corriendo
curl http://localhost:3000

# 2. Revisa logs
npm run start:dev
# Busca "Listening on port 3000"

# 3. Revisa variables entorno
echo $DATABASE_URL
echo $JWT_SECRET

# 4. Reinicia
Ctrl+C y npm run start:dev
```

### Frontend no conecta

```bash
# 1. Verifica URL en .env
cat client/.env
# REACT_APP_API_URL debe ser correcto

# 2. Abre DevTools
# Pestaña Network, intenta registrarte
# Busca requests POST /auth/register

# 3. Revisa error
# Si 404: endpoint no existe
# Si 401: token inválido o expirado
# Si CORS: ajusta CORS_ORIGIN en backend
```

### Base de datos crashea

```bash
# Revisa estado
docker-compose ps

# Reinicia
docker-compose down
docker-compose up -d

# Ver logs
docker-compose logs postgres
```

### Test falla

```bash
# Verifica que todo está instalado
npm install

# Limpia caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Corre test con verbose
npm test -- --verbose
```

---

## Performance

### ¿Por qué la app tarda al cargar?

**Frontend:**
- Primer request toma 30s (cold start Render)
- Solución: paciencia o upgrade plan

**Backend:**
- Si queries lentas: agrega índices
- Si muchas conexiones: aumenta pool

**BD:**
- Si lenta: revisa índices
- Si queries N+1: usa JOINs

### ¿Cómo optimizar?

```typescript
// ❌ Lento: N+1 queries
games.forEach(game => 
  game.players = repository.getPlayers(game.id) // N queries!
)

// ✅ Rápido: 1 query con relación
games = repository.getGamesWithPlayers() // 1 query!
```

---

## Seguridad

### ¿Cómo protejo mi BB?

1. ✅ **Never commit `.env`**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. ✅ **Usa variables de entorno en producción**
   ```bash
   # Render dashboard → Environment
   DATABASE_URL=***
   JWT_SECRET=***
   ```

3. ✅ **Cambia JWT_SECRET por deployment**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. ✅ **Passwords hasheados**
   ```typescript
   password = await bcrypt.hash(password, 10)
   ```

### ¿Cómo protejo mis endpoints?

```typescript
// ✅ Requiere JWT
@Get('/profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) { }

// ✅ Solo creador
@Patch('/games/:id')
@UseGuards(JwtAuthGuard)
updateGame(
  @Param('id') gameId: string,
  @CurrentUser() user: User
) {
  const game = this.gamesRepository.findById(gameId)
  if (game.createdBy !== user.id) {
    throw new ForbiddenException()
  }
}
```

---

## Despliegue

### ¿Cuándo hacer deploy?

```bash
# 1. Comitea todo
git add .
git commit -m "feat: nueva feature"

# 2. Push a main
git push origin main

# 3. Render/Vercel auto-redeploy
# (si está configurado)

# 4. Espera 3-5 minutos

# 5. Verifica en producción
curl https://soccer-legends-api.onrender.com/health
```

### ¿Qué pasa si falla el deploy?

```bash
# Render: Revert última versión
# Dashboard → Deployments → Redeploy previous

# Vercel: Idem
# Dashboard → Deployments → Redeploy

# Si BD está borrada: restore from backup
```

### ¿Cómo veo logs en producción?

```bash
# Render: Dashboard → Logs
# Busca errores 500, requests lentas

# Supabase: Database → Query Editor
# Revisa queries lentas

# Vercel: Dashboard → Deployments → Logs
# Ver console.log()
```

---

## Moneda y Números

### ¿Puedo cambiar de EUR a USD?

```typescript
// constants/index.ts
export const CURRENCY = 'USD' // EUR → USD

// utils/format.ts
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY // 'USD'
  }).format(amount)
}
```

### ¿Puedo usar decimales?

```typescript
// BD usa numeric(10,2) = hasta 99999999.99
// Frontend: usa toFixed(2)

formatCurrency(50.5) // $50.50
```

---

## Contribuciones

### ¿Cómo contribuyo?

1. Fork repo
2. Crea rama: `git checkout -b feature/awesome`
3. Comitea: `git commit -m "feat: awesome feature"`
4. Push: `git push origin feature/awesome`
5. Pull Request

Ver [CONTRIBUTING.md](CONTRIBUTING.md)

### ¿Puedo crear issues?

**Claro!** Tipos de issues:

- 🐛 **Bug:** "Login no funciona en Safari"
- ✨ **Feature:** "Agregar ratings a jugadores"
- 📚 **Docs:** "Explicar CORS mejor"
- ❓ **Question:** Dudas técnicas

---

## Ayuda Extra

### Recursos Útiles

- **NestJS Docs:** https://docs.nestjs.com
- **Drizzle Docs:** https://orm.drizzle.team
- **React Native:** https://reactnative.dev
- **Zustand:** https://github.com/pmndrs/zustand

### Comunidades

- **Discord/Slack:** Comunidad Soccer Legends
- **GitHub Discussions:** Para preguntas de architecture
- **Stack Overflow:** Para problemas específicos

### Aprende Más

- Cómo funciona JWT: https://jwt.io
- CORS explicado: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- Arquitectura limpia: "Clean Code" de Robert C. Martin

---

¿No encuentras la respuesta? **¡Abre un issue en GitHub!** 🚀
