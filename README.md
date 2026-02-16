# Soccer Legends (uso personal)

App pequeña para **gestionar dinero/partidas** durante un juego de cartas familiar.  
Proyecto para **uso propio**, sin testing ni despliegue público.

## 📦 Tech stack
- **Frontend:** React Native (Expo)
- **Backend:** NestJS + Drizzle
- **DB:** PostgreSQL

## 📁 Estructura (resumen)
```
client/   # App móvil (Expo)
server/   # API NestJS
```

## ✅ Requisitos
- Node.js LTS
- Docker (para PostgreSQL)
- Git (opcional)

## ⚡ Puesta en marcha (desarrollo)

### 1) Backend + DB

```bash
cd server
npm install

# Crear archivo .env
cp ../.env.example .env
```

Edita `server/.env`:
```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=soccer_legends
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=tu_secreto_largo_y_seguro
PORT=3000
```

### 2) Iniciar Base de Datos

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que está funcionando
# PostgreSQL: localhost:5432
# pgAdmin: http://localhost:5050
```

### 3) Ejecutar Migraciones

```bash
cd server

# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Ver BD en interfaz visual
npm run db:studio
```

### 4) Iniciar Backend

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# La API estará en http://localhost:3000
```

### 5) Configurar Frontend

```bash
cd client
npm install

# Crear archivo .env
cp .env.example .env
```

Edita `client/.env`:
```env
REACT_APP_API_URL=http://localhost:3000
```

### 6) Iniciar Frontend

```bash
npm start

# Selecciona una opción:
# - Android (a)
# - iOS (i)  
# - Web (w)
```

## 📚 Documentación

### Backend

**Módulos:**
- `auth/` - Registro, login, JWT
- `users/` - Gestión de usuarios
- `games/` - Crear/unirse partidas, PIN
- `transactions/` - Transferencias dinero

**Endpoints principales:**

```
AUTH:
POST   /auth/register    - Registro
POST   /auth/login       - Login
GET    /auth/profile     - Mi perfil

GAMES:
POST   /games            - Crear partida
GET    /games/:id        - Detalles
POST   /games/join       - Unirse con PIN
DELETE /games/:id        - Abandonar

TRANSACTIONS:
POST   /transactions/transfer    - Entre jugadores
POST   /transactions/to-bank     - A la banca
POST   /transactions/withdraw    - De la banca
GET    /transactions/:id/summary - Resumen
```

### Frontend

**Servicios:**
- `authService` - Login/Register
- `gamesService` - Gestión de partidas
- `transactionsService` - Transacciones

**Stores (Zustand):**
- `useAuthStore` - Estado de autenticación
- `useGamesStore` - Estado de partidas

**Utilidades:**
- `validation` - Validar email, password
- `format` - Formatear moneda, fechas

## 🔄 Flujo de la Aplicación

1. **Usuario nuevo:**
   - Registro → login automático → home

2. **Crear partida:**
   - Ingresa datos → genera PIN único → se agrega como jugador

3. **Unirse a partida:**
   - Ingresa PIN → valida → se une → ve jugadores

4. **En la partida:**
   - Ve saldos → transfiere dinero → actualización en tiempo real

## 🧪 Testing (Por Hacer)

```bash
# Backend
cd server
npm run test          # Tests unitarios
npm run test:e2e     # Tests e2e

# Frontend (por implementar)
npm run test
```

## 📝 Guía de Contribución

Ver [CONTRIBUTING.md](CONTRIBUTING.md)

**Pasos básicos:**
1. Fork el repo
2. Crear rama: `git checkout -b feature/nombre`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nombre`
5. Pull Request

## 🚨 Problemas Comunes

### Puerto 5432 ya en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "5433:5432"
```

### Token JWT expirado
```bash
# Aumentar JWT_EXPIRATION en .env
JWT_EXPIRATION=48h
```

### API no conecta
```bash
# Verificar que backend está corriendo
curl http://localhost:3000

# Verificar CORS
# En .env: CORS_ORIGIN=http://localhost:8081
```

## 📞 Soporte

- Documentación: Consulta [docs/](docs/)
- Issues: Abre un issue en GitHub
- Email: contacto@soccerlegends.com

## 📄 Licencia

Este proyecto está bajo licencia MIT.

---

<details>
<summary><strong>🎓 Detalles de Aprendizaje</strong></summary>

Este proyecto fue creado con fines educativos para aprender:

- **Backend moderno:** NestJS, microservicios, ORMs
- **BD relacional:** PostgreSQL, migraciones, esquemas
- **Frontend nativo:** React Native, Expo, navegación
- **State management:** Zustand vs Redux
- **APIs REST:** Diseño, seguridad, validación
- **DevOps:** Docker, despliegue, CI/CD
- **TypeScript:** Type safety, generics, decorators

</details>

