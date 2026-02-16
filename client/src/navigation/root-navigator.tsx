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

const Stack = createNativeStackNavigator();

export function RootNavigator(): React.ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
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
          />
          <Stack.Screen
            name="CreateGame"
            component={CreateGameScreen}
          />
          <Stack.Screen
            name="JoinGame"
            component={JoinGameScreen}
          />
          <Stack.Screen
            name="MyGames"
            component={MyGamesScreen}
          />
          <Stack.Screen
            name="GameDetail"
            component={GameDetailScreen}
          />
          <Stack.Screen
            name="Transaction"
            component={TransactionScreen}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
