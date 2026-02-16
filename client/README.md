# Client - Soccer Legends App

Aplicación móvil con React Native (Expo) para gestionar dinero en partidas de fútbol.

## 📁 Estructura del Proyecto

```
src/
├── screens/           # Pantallas de la aplicación
│   ├── auth/         # Autenticación (Login, Register)
│   └── games/        # Partidas y transacciones
├── components/       # Componentes reutilizables
├── services/         # Servicios de API (Auth, Games, Transactions)
├── store/            # Estado global con Zustand
├── navigation/       # Navegación con React Navigation
├── types/            # Tipos TypeScript
├── constants/        # Constantes y configuración
├── utils/            # Utilidades (validación, formato)
└── App.tsx          # Componente raíz
```

## 🚀 Primeros Pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tu URL de API:
```
REACT_APP_API_URL=http://localhost:3000
```

### 3. Iniciar la aplicación

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web:**
```bash
npm run web
```

**Desarrollo (cualquier plataforma):**
```bash
npm start
```

## 📦 Dependencias principales

- **react-native**: Framework para desarrollo nativo
- **expo**: Plataforma para React Native
- **react-navigation**: Sistema de navegación
- **zustand**: Manejo de estado
- **axios**: Cliente HTTP
- **typescript**: Type safety

## 🎯 Funcionalidades por implementar

- [x] Estructura base
- [x] Servicios de API
- [x] Stores (Zustand)
- [x] Navegación base
- [x] Utilidades y validaciones
- [ ] Pantalla de Login
- [ ] Pantalla de Registro
- [ ] Pantalla de Home
- [ ] Pantalla de Partidas
- [ ] Pantalla de Transacciones
- [ ] Componentes UI personalizados

## 📝 Notas

- Se usar TypeScript para type safety
- Los servicios están completamente tipados
- Se sigue la arquitectura limpia separando capas
- Zustand para estado global (simplemente redux)
- React Navigation para navegación entre pantallas
