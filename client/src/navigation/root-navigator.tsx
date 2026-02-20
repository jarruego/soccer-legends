import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/index';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreateGameScreen } from '../screens/games/CreateGameScreen';
import { JoinGameScreen } from '../screens/games/JoinGameScreen';
import { MyGamesScreen } from '../screens/games/MyGamesScreen';
import { GameDetailScreen } from '../screens/games/GameDetailScreen';
import { TransactionScreen } from '../screens/games/TransactionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AvatarMenuButton } from '../components/AvatarMenuButton';

const Stack = createNativeStackNavigator();

export function RootNavigator(): React.ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerRight: () => <AvatarMenuButton />,
      }}
    >
      {!isAuthenticated ? (
        // Stack de Autenticación
        <Stack.Group>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
          />
        </Stack.Group>
      ) : (
        // Stack Principal
        <Stack.Group>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Inicio' }}
          />
          <Stack.Screen
            name="CreateGame"
            component={CreateGameScreen}
            options={{ title: 'Crear partida' }}
          />
          <Stack.Screen
            name="JoinGame"
            component={JoinGameScreen}
            options={{ title: 'Unirse a partida' }}
          />
          <Stack.Screen
            name="MyGames"
            component={MyGamesScreen}
            options={{ title: 'Mis partidas' }}
          />
          <Stack.Screen
            name="GameDetail"
            component={GameDetailScreen}
            options={{ title: 'Detalle de partida' }}
          />
          <Stack.Screen
            name="Transaction"
            component={TransactionScreen}
            options={{ title: 'Transacción' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Editar perfil' }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
