/**
 * Pantalla para ver todas las partidas del usuario
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppHeader, Button } from '@components/index';
import { GameCard } from '../../components/GameCard';
import { useGamesStore } from '@store/index';
import { commonStyles } from '../../styles/common';
import { Colors } from '../../styles/theme';
import { formatMillions } from '../../utils/currency';
import type { Game } from '@/types';
import type { RootStackParamList } from '../../navigation/navigation-types';

const getStatusColor = (status: Game['status']): string => {
  switch (status) {
    case 'pending':
      return '#FEF3C7';
    case 'active':
      return '#DBEAFE';
    case 'finished':
      return '#F3E8FF';
    default:
      return '#F9FAFB';
  }
};

const getStatusLabel = (status: Game['status']): string => {
  switch (status) {
    case 'pending':
      return '⏳ Pendiente';
    case 'active':
      return '▶️ Activa';
    case 'finished':
      return '✅ Finalizada';
    default:
      return 'Desconocido';
  }
};

const getStatusTextColor = (status: Game['status']): string => {
  switch (status) {
    case 'pending':
      return '#92400E';
    case 'active':
      return '#075985';
    case 'finished':
      return '#5B21B6';
    default:
      return '#6B7280';
  }
};

export function MyGamesScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const userGames = useGamesStore((state) => state.userGames);
  const isLoading = useGamesStore((state) => state.isLoading);
  const error = useGamesStore((state) => state.error);
  const loadUserGames = useGamesStore((state) => state.loadUserGames);
  const leaveGame = useGamesStore((state) => state.leaveGame);
  const clearError = useGamesStore((state) => state.clearError);

  const [refreshing, setRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ gameId: string; gameName: string } | null>(null);

  useEffect(() => {
    loadUserGames();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserGames();
    setRefreshing(false);
  };

  const handleLeaveGame = (gameId: string, gameName: string) => {
    // Mostrar diálogo de confirmación usando el estado en lugar de Alert.alert
    setConfirmDialog({ gameId, gameName });
  };

  const confirmLeaveGame = async () => {
    if (!confirmDialog) return;
    
    const { gameId } = confirmDialog;
    try {
      await leaveGame(gameId);
      setConfirmDialog(null);
      Alert.alert('Éxito', 'Has abandonado la partida', [
        {
          text: 'OK',
          onPress: async () => {
            await loadUserGames();
          },
        },
      ]);
    } catch (err: any) {
      const errorMessage = err?.message || err?.error || JSON.stringify(err) || 'No se pudo abandonar la partida';
      Alert.alert('Error', errorMessage);
      setConfirmDialog(null);
    }
  };

  const cancelLeaveGame = () => {
    setConfirmDialog(null);
  };

  const handleViewGame = (gameId: string) => {
    navigation.navigate('GameDetail', { gameId });
  };

  if (isLoading && userGames.length === 0) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={commonStyles.loadingText}>Cargando partidas...</Text>
        </View>
      </View>
    );
  }

  const emptyMessage = error ? `Error: ${error}` : 'No tienes partidas aún';

  return (
    <View style={commonStyles.container}>
      <AppHeader title="Mis Partidas" showBack />

      {userGames.length === 0 ? (
        <ScrollView
          style={commonStyles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyIcon}>📭</Text>
            <Text style={commonStyles.emptyTitle}>{emptyMessage}</Text>
            <Button
              title="Crear Partida"
              onPress={() => (navigation as any).navigate('CreateGame')}
              style={commonStyles.emptyButton}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={commonStyles.scroll}
          contentContainerStyle={commonStyles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {userGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onView={() => handleViewGame(game.id)}
              onLeave={() => handleLeaveGame(game.id, game.name)}
            />
          ))}
        </ScrollView>
      )}

      {/* Modal de confirmación para abandonar partida */}
      {confirmDialog && (
        <Modal
          transparent
          visible={!!confirmDialog}
          animationType="fade"
          onRequestClose={cancelLeaveGame}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              padding: 24,
              minWidth: 300,
              maxWidth: 400,
              ...(Platform.OS === 'web'
                ? { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }
                : {
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }),
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 12,
                color: Colors.gray900,
              }}>
                Abandonar partida
              </Text>
              <Text style={{
                fontSize: 16,
                color: Colors.gray700,
                marginBottom: 24,
                lineHeight: 22,
              }}>
                ¿Estás seguro de que deseas abandonar "{confirmDialog.gameName}"?
              </Text>
              
              <View style={{
                flexDirection: 'row',
                gap: 12,
                justifyContent: 'flex-end',
              }}>
                <TouchableOpacity
                  onPress={cancelLeaveGame}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: Colors.gray100,
                  }}
                >
                  <Text style={{
                    color: Colors.gray700,
                    fontWeight: '600',
                    fontSize: 14,
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmLeaveGame}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: Colors.error,
                  }}
                >
                  <Text style={{
                    color: Colors.white,
                    fontWeight: '600',
                    fontSize: 14,
                  }}>
                    Abandonar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

