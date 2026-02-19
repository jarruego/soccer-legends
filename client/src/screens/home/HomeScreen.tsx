/**
 * Pantalla de inicio (Home)
 *
 * Muestra las opciones principales:
 * - Crear partida
 * - Unirse a partida
 * - Ver mis partidas
 * - Logout
 */

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppHeader, Button } from '@components/index';
import { useGamesStore } from '@store/index';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { Spacing } from '../../styles/theme';
import { commonStyles } from '../../styles/common';
// Update the import path to the correct location of GameCard
import { GameCard } from '../../components/GameCard';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const loadUserGames = useGamesStore((state) => state.loadUserGames);
  const userGames = useGamesStore((state) => state.userGames);
  // Filtrar partidas activas
  const activeGames = userGames.filter(g => g.status === 'active');
  const lastActiveGame = activeGames.length > 0 ? activeGames[activeGames.length - 1] : null;

  useEffect(() => {
    // Cargar partidas del usuario al entrar
    loadUserGames();
  }, []);

  return (
    <View style={commonStyles.container}>
      <AppHeader />

      {/* Contenido principal */}
      <ScrollView
        style={commonStyles.scroll}
        contentContainerStyle={[commonStyles.scrollContent, { paddingTop: Spacing.lg }]}
      >
        <View style={{ gap: Spacing.md }}>
          <Button
            title="Crear"
            onPress={() => navigation.navigate('CreateGame')}
            variant="primary"
          />
          <Button
            title="Unirse"
            onPress={() => navigation.navigate('JoinGame')}
            variant="primary"
          />

          {/* Mostrar la última partida activa si existe */}
          {lastActiveGame && (
            <View style={[commonStyles.gameCard, { marginBottom: 16 }]}> {/* Usar el mismo estilo de card */}
              <GameCard
                game={lastActiveGame}
                onView={() => navigation.navigate('GameDetail', { gameId: lastActiveGame.id })}
              />
              {userGames.length > 1 && (
                <Button
                  title="Ver todas las partidas"
                  onPress={() => navigation.navigate('MyGames')}
                  variant="secondary"
                  style={{ marginTop: 12 }}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
export { HomeScreen };
