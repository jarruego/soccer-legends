# 🤝 Guía de Contribución

Gracias por considerar contribuir a Soccer Legends! 🎉

Esta es una guía para ayudarte a entender el proceso de contribución.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Empezar](#empezar)
- [Proceso de Git](#proceso-de-git)
- [Estándares de Código](#estándares-de-código)
- [Estructura de Commits](#estructura-de-commits)
- [Testing](#testing)
- [Pull Requests](#pull-requests)

---

## 💬 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a proporcionar un ambiente acogedor y respetuoso para todos.

**Respeta:**
- Otros puntos de vista
- Nivel de experiencia diferente
- Identidad y expresión

**No tolera:**
- Acoso, discriminación
- Ataques personales
- Publicidad no deseada

---

## 🚀 Empezar

### 1. Fork el Repositorio

```bash
# En GitHub, haz clic en "Fork"
# Luego clona tu fork

git clone https://github.com/TU_USUARIO/soccer-legends.git
cd soccer-legends
```

### 2. Configurar Remoto

```bash
# Añade upstream (repositorio original)
git remote add upstream https://github.com/USUARIO_ORIGINAL/soccer-legends.git

# Verifica
git remote -v
# origin    → tu fork
# upstream  → repo original
```

### 3. Instalar Dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Crear Rama de Desarrollo

```bash
# Actualiza main
git checkout main
git pull upstream main

# Crea rama nueva
git checkout -b feature/nombre-descriptivo
```

---

## 🔄 Proceso de Git

### Workflow Básico

```bash
# 1. Crea rama
git checkout -b feature/agregar-rankings

# 2. Haz cambios
# Edita archivos...

# 3. Verifica cambios
git status
git diff

# 4. Stage cambios
git add .

# 5. Comitea
git commit -m "feat: agregar sistema de rankings"

# 6. Push a tu fork
git push origin feature/agregar-rankings

# 7. En GitHub: crea Pull Request
```

### Mantener Fork Actualizado

```bash
# Trae cambios del repo original
git fetch upstream

# Rebase tu rama sobre main
git rebase upstream/main

# Push a tu fork (con --force si ya lo habías pusheado)
git push origin feature/nombre --force
```

---

## 📝 Estructura de Commits

Usa el formato **Conventional Commits**:

```
<tipo>(<scope>): <descripción corta>

<descripción detallada (opcional)>

<pie de página (opcional)>
```

### Tipos Válidos

- **feat** - Nueva característica
- **fix** - Corrección de bug
- **docs** - Cambios en documentación
- **style** - Cambios en formato (sin lógica)
- **refactor** - Reorganización de código
- **perf** - Mejora de performance
- **test** - Añadir o cambiar tests
- **chore** - Cambios en build o dependencias

### Ejemplos

```
✅ BIEN:
feat(games): agregar sistema de rankings
fix(auth): corregir validación de password
docs(api): documentar nuevo endpoint
refactor(transactions): simplificar lógica de saldos

❌ MAL:
Cambios
fixed stuff
wip
Update files
```

---

## 🏗️ Estándares de Código

### TypeScript

```typescript
// ✅ Bien
interface User {
  id: string
  email: string
  username: string
}

function getUser(id: string): Promise<User> {
  return db.users.findById(id)
}

// ❌ Mal
function getUser(id: any): any {
  return db.users.findById(id)
}
```

### Naming Conventions

```typescript
// Variables/funciones: camelCase
const userName = 'sergio'
function getUserById(id: string) { }

// Clases: PascalCase
class UserRepository { }

// Constantes: UPPER_SNAKE_CASE
const MAX_PLAYERS = 4
const JWT_SECRET = '...'

// Archivos: kebab-case
// users-repository.ts
// get-ranking.dto.ts
```

### Estructura de Código

**Backend:**
- Servicios manejan lógica de negocio
- Repositorios manejan acceso a BD
- Controladores manejan requests/responses
- DTOs validan entrada de datos

**Frontend:**
- Servicios llaman a APIs
- Stores (Zustand) manejan estado global
- Componentes son reutilizables
- Screens son pantallas completas

---

## 🧪 Testing

### Backend

```bash
cd server

# Ejecutar todos los tests
npm test

# Watch mode
npm test -- --watch

# Con coverage
npm test -- --coverage
```

### Frontend

```bash
cd client

# Tests
npm test

# Watch
npm test -- --watch
```

---

## 📤 Pull Requests

### Checklist antes de PR

- [ ] Tu código sigue los estándares
- [ ] Has hecho self-review
- [ ] Agregaste tests si es necesario
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Sin breaking changes

### Proceso PR

1. Fork el repositorio
2. Crear rama: `git checkout -b feature/mi-feature`
3. Hacer cambios
4. Commit: `git commit -m "feat: descripción"`
5. Push: `git push origin feature/mi-feature`
6. Crear Pull Request

---

## 🐛 Reportar Bugs

### Abrir Issue

1. Verifica si existe
2. Completa template:
   - Título descriptivo
   - Descripción detallada
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Logs/screenshots

### Ejemplo

```
Título: Login falla en Safari 15.1

Descripción:
El formulario de login no se envía correctamente en Safari.

Pasos:
1. Abre app en Safari 15.1
2. Ingresa email y password
3. Presiona "Iniciar Sesión"

Esperado: Navega a Home
Actual: Spinner infinito
```

---

## ✨ Sugerir Features

```
Título: Agregar notificaciones

Descripción:
Cuando un jugador recibe dinero, debería recibir una notificación.

Casos de uso:
- Usuario recibe transferencia
- Usuario se une a partida
```

---

## 📚 Recursos

- [NestJS Docs](https://docs.nestjs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [React Native](https://reactnative.dev)
- [Expo](https://docs.expo.dev)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🙏 Gracias

¡Gracias por contribuir a Soccer Legends! 🚀

Tu trabajo hace que esta app sea mejor para todos.

---

**Happy Contributing!** 🎉
