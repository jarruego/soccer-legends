# 🧪 Guía de Testing - Soccer Legends

## Introducción

Esta guía te muestra cómo probar manualmente la aplicación completa desde cero.

⏱️ **Tiempo estimado:** 30-45 minutos

---

## ✅ Pre-requisitos

Asegúrate que todo está en funcionamiento:

```bash
# 1. Backend corriendo
cd server
npm run start:dev
# Debe mostrar: "Listening on port 3000"

# 2. PostgreSQL corriendo
docker-compose ps
# Debe mostrar postgres y pgAdmin como "Up"

# 3. Base de datos creada
npm run db:migrate
# Sin errores

# 4. Frontend corriendo
cd ../client
npm start
# Elige: a (Android), i (iOS), o w (Web)
```

---

## 🔐 1. Testing de Autenticación

### 1.1 Registrarse (Usuario 1)

**Acción:**
1. Abre la app en el emulador
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Completa el formulario:

```
Email: messi@example.com
Username: messi
Password: Password123!
Confirm: Password123!
```

**Resultado esperado:**
- ✅ Pantalla muestra "Registrándose..."
- ✅ Navega automáticamente a Home después de login
- ✅ Muestra "Hola, messi" en la parte superior

### 1.2 Registrarse (Usuario 2)

Repite pero con:
```
Email: ronaldo@example.com
Username: ronaldo
Password: Password123!
```

### 1.3 Logout y Login

1. Abre perfil/settings → Logout
2. Verifica que regresa a pantalla de login
3. Login con messi@example.com / Password123!
4. ✅ Recupera la sesión

---

## 🎮 2. Testing de Partidas

### 2.1 Crear Partida (Usuario 1)

**Acción:**
1. Está logueado como "messi"
2. Presiona "+ Crear Partida"
3. Completa formulario:

```
Nombre: Futbolín Sábado
Saldo Inicial: 100
Máximo Jugadores: 4
Descripción: Futbolín en el parque
```

4. Presiona "Crear Partida"

**Resultado esperado:**
- ✅ Toast/Alert: "Partida creada"
- ✅ Regresa a Home
- ✅ "Futbolín Sábado" aparece en lista con:
  - 1/4 jugadores
  - Estado: "pending"

### 2.2 Ver Detalles de Partida

**Acción:**
1. Presiona en "Futbolín Sábado"

**Resultado esperado:**
- ✅ Muestra:
  - Nombre, PIN (ej: ABC123), estado
  - 1 jugador: "messi" con 100€
  - Botones: "Ver Transacciones", "Resumen Financiero"

### 2.3 Obtener PIN de la Partida

**Acción:**
1. En la pantalla de detalles, copia el PIN (ej: ABC123)

**Usar este PIN en el siguiente test.**

### 2.4 Unirse a Partida (Usuario 2)

**Preparación:**
1. Logout (messi)
2. Login como ronaldo (ronaldo@example.com / Password123!)
3. En Home, presiona "Unirse a Partida"

**Acción:**
1. Ingresa el PIN copiado (ABC123)
2. Presiona "Unirse"

**Resultado esperado:**
- ✅ Toast: "¡Te has unido a la partida!"
- ✅ "Futbolín Sábado" aparece en tu lista
- ✅ Regresa a Home

### 2.5 Verificar Sincronización

**Acción:**
1. Login como messi
2. Ve a "Futbolín Sábado"

**Resultado esperado:**
- ✅ Muestra 2/4 jugadores
- ✅ Lista: messi (100€), ronaldo (100€)

---

## 💰 3. Testing de Transacciones

### 3.1 Transferencia Entre Jugadores

**Acción (Usuario 1 - messi):**
1. En "Futbolín Sábado", presiona "Ver Transacciones" (o similar)
2. Selecciona "Nueva Transferencia"
3. Completa:

```
Jugador: ronaldo
Cantidad: 25
Motivo: Apuesta de gol
```

4. Presiona "Transferir"

**Resultado esperado:**
- ✅ Toast: "Transferencia realizada"
- ✅ En detalles: messi pasa a 75€, ronaldo a 125€
- ✅ En historial aparece la transacción

### 3.2 Verificar Saldo (Usuario 2)

**Acción (ronaldo):**
1. Ve a "Futbolín Sábado"
2. Ve detalles

**Resultado esperado:**
- ✅ Tu saldo: 125€
- ✅ En historial: transferencia recibida de messi (25€)

### 3.3 Transferir a la Banca

**Acción (ronaldo):**
1. Selecciona "Transferir a Banca"
2. Cantidad: 50
3. Presiona "Transferir"

**Resultado esperado:**
- ✅ Saldo de ronaldo: 75€
- ✅ Banca: +50€

### 3.4 Ver Resumen Financiero

**Acción (messi):**
1. Presiona "Resumen Financiero"

**Resultado esperado:**
- ✅ Muestra tabla:

```
Jugador   | Inicial | Actual | Cambio | %
messi     | 100     | 75     | -25    | -25%
ronaldo   | 100     | 75     | -25    | -25%
Banca     | 0       | 50     | +50    | -
```

---

## 🔍 4. Testing de Validaciones

### 4.1 Email Duplicado

**Acción:**
1. Intenta registrar con: messi@example.com (ya existe)

**Resultado esperado:**
- ✅ Error: "Email ya existe" o similar

### 4.2 Password Débil

**Acción:**
1. Intenta registrarse con password: "123"

**Resultado esperado:**
- ✅ Error en UI: "Password mínimo 8 caracteres"

### 4.3 PIN Inválido

**Acción:**
1. Intenta unirte con PIN: "INVALID"

**Resultado esperado:**
- ✅ Error: "PIN no válido o partida no disponible"

### 4.4 Saldo Insuficiente

**Acción:**
1. Intenta transferir 1000€ (no tienes)

**Resultado esperado:**
- ✅ Error: "Saldo insuficiente"

### 4.5 Transferencia a Ti Mismo

**Acción:**
1. Intenta transferir a tu propio usuario

**Resultado esperado:**
- ✅ Error: "No puedes transferir a ti mismo"

---

## 🐛 5. Testing de Edge Cases

### 5.1 Crear Partida sin Perfil Completo

**Acción:**
1. Crea partida con campos mínimos
2. Transacciones desde inicio

**Resultado esperado:**
- ✅ Funciona correctamente

### 5.2 Múltiples Jugadores

**Preparación:**
1. Crea un 3er usuario: neymar@example.com / neymar
2. Crea partida con maxPlayers: 3
3. 2 jugadores se unen

**Acción:**
1. 3er jugador intenta unirse

**Resultado esperado:**
- ✅ Se une correctamente (3/3)

### 5.3 Partida Llena

**Acción:**
1. 4to jugador intenta unirse a partida con 3/3

**Resultado esperado:**
- ✅ Error: "Partida llena"

### 5.4 Cambiar Estado de Partida

**Acción (usuario creador):**
1. En detalles, presiona "Finalizar Partida" (si existe botón)
2. Estado cambia a "finished"
3. Intenta transferir dinero

**Resultado esperado:**
- ✅ Error: "Partida finalizada"

---

## 📱 6. Testing en Diferentes Plataformas

### Android Emulador
```bash
npm start
# Presiona 'a'
# Debe abrir emulador automáticamente
```

### iOS Simulator (Mac)
```bash
npm start
# Presiona 'i'
```

### Web
```bash
npm start
# Presiona 'w'
# Abre http://localhost:8081
```

**Verificar:** App funciona igual en todas

---

## 🔧 7. Testing de Backend (cURL)

Si las pantallas no funcionan, prueba directamente la API:

### Registrarse
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Copia el `accessToken` de la respuesta y úsalo así:**

### Crear Partida
```bash
curl -X POST http://localhost:3000/games \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Game",
    "initialBalance": 100,
    "maxPlayers": 4
  }'
```

### Ver Base de Datos

```bash
npm run db:studio
```

Abre http://localhost:5555 para ver datos en tiempo real.

---

## 📝 Checklist de Testing Completo

- [ ] **Autenticación**
  - [ ] Register funciona
  - [ ] Login funciona
  - [ ] Logout funciona
  - [ ] Validaciones de password

- [ ] **Partidas**
  - [ ] Crear partida
  - [ ] Ver detalles
  - [ ] Unirse con PIN
  - [ ] Partida llena rechaza nuevo jugador
  - [ ] Estado cambia correctamente

- [ ] **Transacciones**
  - [ ] Transferencia entre jugadores
  - [ ] Saldos actualizan en tiempo real
  - [ ] Transferencia a banca
  - [ ] Historial completo
  - [ ] Resumen financiero correcto

- [ ] **Validaciones**
  - [ ] Email único
  - [ ] Password fuerte
  - [ ] PIN válido
  - [ ] Saldo suficiente
  - [ ] Restricción de transferencia a sí mismo

- [ ] **UI/UX**
  - [ ] Loading spinners aparecen
  - [ ] Errores muestran alerts
  - [ ] Navegación fluida
  - [ ] Tokens persisten (AsyncStorage)
  - [ ] Funciona offline (parcialmente)

---

## 🐛 Debugging Común

### "Connection Refused"
```bash
# Verifica que backend está corriendo
curl http://localhost:3000

# Reinicia si es necesario
npm run start:dev
```

### "Token Expired"
```bash
# Logout y login nuevamente
# O reinicia la app
```

### "Base de Datos no existe"
```bash
# Corre migraciones
npm run db:migrate
```

### "Partida/Usuario no encontrado"
```bash
# Verifica DB en Prisma Studio
npm run db:studio
```

---

## 📊 Métricas de Éxito

✅ **Paso 1:** Puedes registrarte y loguarte  
✅ **Paso 2:** Puedes crear y unirte a partidas  
✅ **Paso 3:** Puedes transferir dinero  
✅ **Paso 4:** Saldos se actualizan correctamente  
✅ **Paso 5:** Validaciones funcionan  
✅ **Paso 6:** App funciona en múltiples plataformas  

---

## 🎉 Listo!

Si completaste todos los tests, **congrúltulaciones**! 🎊

Tu aplicación está lista para:
- Compartir con amigos
- Hacer deploy en producción
- Continuar desarrollando features

**Próximos pasos:**
1. Configurar GitHub Actions para CI/CD
2. Hacer deploy en Render (backend)
3. Hacer deploy en Vercel (web)
4. Subir a Google Play Store (Android)
