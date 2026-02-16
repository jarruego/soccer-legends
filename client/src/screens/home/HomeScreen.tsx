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
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppHeader, Button } from '@components/index';
import { useGamesStore } from '@store/index';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { Spacing } from '../../styles/theme';
import { commonStyles } from '../../styles/common';
export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const loadUserGames = useGamesStore((state) => state.loadUserGames);

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
          <Button
            title="Ver Partidas"
            onPress={() => navigation.navigate('MyGames')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </View>
  );
}
