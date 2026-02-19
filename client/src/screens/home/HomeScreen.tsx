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
            title="Crear Partida"
            onPress={() => navigation.navigate('CreateGame')}
            variant="primary"
          />
          <Button
            title="Unirse a Partida"
            onPress={() => navigation.navigate('JoinGame')}
            variant="primary"
          />

          {/* Mostrar la última partida activa si existe */}
          {lastActiveGame && (
            <View style={{ marginBottom: 16 }}>
              <View style={commonStyles.gameCard}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: '#6B7280',
                    marginBottom: 8,
                    marginTop: 2,
                    textAlign: 'center',
                    letterSpacing: 1,
                  }}
                >
                  {'PARTIDA EN CURSO'}
                </Text>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 12, marginHorizontal: -16 }} />
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
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
export { HomeScreen };
