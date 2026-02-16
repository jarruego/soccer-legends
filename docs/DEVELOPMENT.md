# 🚀 Guía de Desarrollo - Pantallas Frontend

## Introducción

El frontend está scaffoldeado con toda la infraestructura lista:
- ✅ Services de API
- ✅ Stores de Zustand
- ✅ Tipos TypeScript
- ✅ Utilidades de validación y formato
- ✅ Navegación base

**Ahora necesitamos implementar las pantallas (screens).**

---

## 📁 Estructura de Pantallas

```
src/screens/
├── auth/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── SplashScreen.tsx
├── games/
│   ├── HomeScreen.tsx
│   ├── CreateGameScreen.tsx
│   ├── JoinGameScreen.tsx
│   ├── GameDetailScreen.tsx
│   └── MyGamesScreen.tsx
└── transactions/
    ├── TransactionScreen.tsx
    ├── TransactionHistoryScreen.tsx
    └── BankBalanceScreen.tsx
```

---

## 🔐 1. Pantallas de Autenticación

### LoginScreen.tsx

Pantalla de inicio de sesión.

```typescript
// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../store/auth-store';
import { Button } from '../../components/Button';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import styles from './auth.styles';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(email)) {
      newErrors.email = 'Email no válido';
    }
    if (!isValidPassword(password)) {
      newErrors.password = 'Password mínimo 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const success = await login({ email, password });
    if (!success && error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!isLoading}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <Button
          title={isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          onPress={handleLogin}
          disabled={isLoading}
          loading={isLoading}
        />

        <Button
          title="¿No tienes cuenta? Regístrate"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
};
```

### RegisterScreen.tsx

```typescript
// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/auth-store';
import { Button } from '../../components/Button';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from '../../utils/validation';
import styles from './auth.styles';

export const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(email)) {
      newErrors.email = 'Email no válido';
    }
    if (!isValidUsername(username)) {
      newErrors.username = 'Username: 3-50 caracteres';
    }
    if (!isValidPassword(password)) {
      newErrors.password = 'Password mínimo 8 caracteres';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await register({
      email,
      username,
      password,
    });

    if (success) {
      Alert.alert('Éxito', 'Cuenta creada. Iniciando sesión...');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Similares a LoginScreen pero con más campos */}
      <TextInput placeholder="Email" value={email} />
      <TextInput placeholder="Username" value={username} />
      <TextInput placeholder="Contraseña" value={password} secureTextEntry />
      <TextInput
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        secureTextEntry
      />

      <Button title="Registrarse" onPress={handleRegister} />
      <Button title="¿Ya tienes cuenta?" variant="secondary" />
    </ScrollView>
  );
};
```

---

## 🎮 2. Pantallas de Partidas

### HomeScreen.tsx

Pantalla principal mostrando mis partidas y opciones.

```typescript
// src/screens/games/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useGamesStore } from '../../store/games-store';
import { useAuthStore } from '../../store/auth-store';
import { Button } from '../../components/Button';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const userGames = useGamesStore((state) => state.userGames);
  const loadUserGames = useGamesStore((state) => state.loadUserGames);
  const isLoading = useGamesStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadUserGames();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          Hola, {user?.username}
        </Text>
        <View style={{ marginTop: 16, gap: 8 }}>
          <Button
            title="+ Crear Partida"
            onPress={() => navigation.navigate('CreateGame')}
          />
          <Button
            title="Unirse a Partida"
            variant="secondary"
            onPress={() => navigation.navigate('JoinGame')}
          />
        </View>
      </View>

      <FlatList
        data={userGames}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GameDetail', { gameId: item.id })
            }
            style={{
              backgroundColor: '#f0f0f0',
              padding: 12,
              marginHorizontal: 16,
              marginVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>
              {item.playersCount}/{item.maxPlayers} jugadores
            </Text>
            <Text>Estado: {item.status}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadUserGames}
          />
        }
      />
    </View>
  );
};
```

### CreateGameScreen.tsx

```typescript
// src/screens/games/CreateGameScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Alert,
  Text,
} from 'react-native';
import { useGamesStore } from '../../store/games-store';
import { Button } from '../../components/Button';

export const CreateGameScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('100');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [description, setDescription] = useState('');

  const createGame = useGamesStore((state) => state.setCurrentGame);
  const isLoading = useGamesStore((state) => state.isLoading);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa nombre de la partida');
      return;
    }

    try {
      await createGame({
        name,
        initialBalance: Number(initialBalance),
        maxPlayers: Number(maxPlayers),
        description,
      });

      Alert.alert('Éxito', 'Partida creada');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la partida');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Nueva Partida
      </Text>

      <TextInput
        placeholder="Nombre de la partida"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Saldo inicial (€)"
        value={initialBalance}
        onChangeText={setInitialBalance}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Máximo de jugadores (2-4)"
        value={maxPlayers}
        onChangeText={setMaxPlayers}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
        }}
      />

      <Button
        title="Crear Partida"
        onPress={handleCreate}
        loading={isLoading}
      />
    </ScrollView>
  );
};
```

### JoinGameScreen.tsx

```typescript
// src/screens/games/JoinGameScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Alert, Text, ScrollView } from 'react-native';
import { useGamesStore } from '../../store/games-store';
import { Button } from '../../components/Button';
import { isValidPin } from '../../utils/validation';

export const JoinGameScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [pin, setPin] = useState('');
  const joinGame = useGamesStore((state) => state.joinGame);
  const isLoading = useGamesStore((state) => state.isLoading);

  const handleJoin = async () => {
    if (!isValidPin(pin)) {
      Alert.alert('Error', 'PIN debe ser 6 caracteres');
      return;
    }

    try {
      await joinGame(pin);
      Alert.alert('Éxito', '¡Te has unido a la partida!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'PIN no válido o partida no disponible');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Unirse a Partida
      </Text>

      <Text>Ingresa el PIN de 6 caracteres de la partida:</Text>

      <TextInput
        placeholder="Ej: ABC123"
        value={pin.toUpperCase()}
        onChangeText={(text) => setPin(text.slice(0, 6).toUpperCase())}
        maxLength={6}
        style={{
          borderWidth: 2,
          borderColor: '#007AFF',
          padding: 12,
          marginVertical: 20,
          borderRadius: 8,
          fontSize: 24,
          textAlign: 'center',
          letterSpacing: 2,
        }}
      />

      <Button title="Unirse" onPress={handleJoin} loading={isLoading} />
      <Button title="Cancelar" onPress={() => navigation.goBack()} variant="secondary" />
    </ScrollView>
  );
};
```

### GameDetailScreen.tsx

```typescript
// src/screens/games/GameDetailScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useGamesStore } from '../../store/games-store';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../utils/format';

export const GameDetailScreen: React.FC<{
  route: any;
  navigation: any;
}> = ({ route, navigation }) => {
  const { gameId } = route.params;
  const currentGame = useGamesStore((state) => state.currentGame);
  const loadGameDetails = useGamesStore(
    (state) => state.loadGameDetails
  );

  useEffect(() => {
    loadGameDetails(gameId);
  }, [gameId]);

  if (!currentGame) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        {currentGame.name}
      </Text>
      <Text>PIN: {currentGame.pin}</Text>
      <Text>Estado: {currentGame.status}</Text>

      <Text style={{ marginVertical: 16, fontWeight: 'bold' }}>
        Jugadores ({currentGame.players?.length}/{currentGame.maxPlayers}):
      </Text>

      <FlatList
        data={currentGame.players}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: '#f0f0f0',
              padding: 12,
              marginVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.username}</Text>
            <Text>{formatCurrency(item.currentBalance)}</Text>
          </View>
        )}
      />

      <Button
        title="Ver Transacciones"
        onPress={() =>
          navigation.navigate('Transactions', { gameId })
        }
        style={{ marginTop: 16 }}
      />
      <Button
        title="Resumen Financiero"
        onPress={() =>
          navigation.navigate('FinancialSummary', { gameId })
        }
        variant="secondary"
      />
    </ScrollView>
  );
};
```

---

## 💰 3. Pantallas de Transacciones

### TransactionScreen.tsx

```typescript
// src/screens/transactions/TransactionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Picker,
  Alert,
  ScrollView,
  Text,
} from 'react-native';
import { useGamesStore } from '../../store/games-store';
import { Button } from '../../components/Button';

export const TransactionScreen: React.FC<{ route: any }> = ({
  route,
}) => {
  const { gameId } = route.params;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const currentGame = useGamesStore((state) => state.currentGame);
  const isLoading = useGamesStore((state) => state.isLoading);

  const handleTransfer = async () => {
    if (!amount || !selectedPlayer) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      // Llamar a transactionsService
      // await transactionsService.transferBetweenPlayers({...})
      Alert.alert('Éxito', 'Transferencia realizada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la transferencia');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Nueva Transferencia
      </Text>

      <Text>Selecciona jugador:</Text>
      <Picker
        selectedValue={selectedPlayer}
        onValueChange={setSelectedPlayer}
        style={{ marginBottom: 16 }}
      >
        <Picker.Item label="Seleccionar..." value="" />
        {currentGame?.players?.map((player: any) => (
          <Picker.Item key={player.id} label={player.username} value={player.id} />
        ))}
      </Picker>

      <Text>Cantidad (€):</Text>
      <TextInput
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          marginBottom: 16,
          borderRadius: 8,
        }}
      />

      <Text>Motivo (opcional):</Text>
      <TextInput
        placeholder="Ej: Apuesta de gol"
        value={description}
        onChangeText={setDescription}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 12,
          marginBottom: 16,
          borderRadius: 8,
        }}
      />

      <Button
        title="Transferir"
        onPress={handleTransfer}
        loading={isLoading}
      />
    </ScrollView>
  );
};
```

---

## 🎯 Pasos Siguientes

1. **Crear archivos de estilos:**
   ```typescript
   // src/screens/auth/auth.styles.ts
   import { StyleSheet } from 'react-native';
   
   export default StyleSheet.create({
     container: {
       flex: 1,
       padding: 16,
       backgroundColor: '#fff',
     },
     form: {
       gap: 16,
     },
     input: {
       borderWidth: 1,
       borderColor: '#ddd',
       padding: 12,
       borderRadius: 8,
     },
     inputError: {
       borderColor: '#ff0000',
     },
     errorText: {
       color: '#ff0000',
       marginTop: -8,
     },
   });
   ```

2. **Implementar todas las pantallas:**
   - TransactionHistoryScreen
   - BankBalanceScreen
   - FinancialSummaryScreen

3. **Conectar navegación en `root-navigator.tsx`:**
   ```typescript
   // Añadir Stack Navigators para cada módulo
   <AuthStack.Navigator>
     <AuthStack.Screen name="Login" component={LoginScreen} />
     <AuthStack.Screen name="Register" component={RegisterScreen} />
   </AuthStack.Navigator>

   <GamesStack.Navigator>
     <GamesStack.Screen name="Home" component={HomeScreen} />
     <GamesStack.Screen name="CreateGame" component={CreateGameScreen} />
     {/* ... */}
   </GamesStack.Navigator>
   ```

4. **Testar todas las rutas:**
   ```bash
   npm start
   # Selecciona 'a' para abrir en Android emulador
   ```

---

## 💡 Tips de Desarrollo

✅ Usa `console.log()` para debug  
✅ Prueba cada pantalla de forma aislada primero  
✅ Valida inputs antes de llamar APIs  
✅ Muestra loading estados  
✅ Trata errores gracefully  
✅ Usa constan
