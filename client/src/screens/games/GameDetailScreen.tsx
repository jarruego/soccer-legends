/**
 * Pantalla de detalle de una partida
 * Muestra información de la partida, jugadores, saldo y opciones de management
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { AppHeader, Button } from '@components/index';
import { useAuthStore } from '@store/auth-store';
import { gamesService } from '@services/games.service';
import type { GameDetail } from '@/types';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { commonStyles } from '../../styles/common';
import { Colors, Spacing } from '../../styles/theme';
import { formatMillions } from '../../utils/currency';

export function GameDetailScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'GameDetail'>>();
  const gameId = route.params?.gameId;

  const currentUser = useAuthStore((state) => state.user);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletedMessage, setDeletedMessage] = useState<string | null>(null);
  const hasNotifiedDeleted = useRef(false);
  const isGameDeleted = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGameDeleted = useCallback(
    (message?: string) => {
      if (hasNotifiedDeleted.current) return;
      hasNotifiedDeleted.current = true;
      isGameDeleted.current = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setGameDetail(null);
      setIsLoading(false);
      setDeletedMessage(message || 'La partida ha finalizado.');
    },
    [navigation],
  );

  const isNotFoundError = (err: any): boolean => {
    const status = err?.statusCode || err?.response?.status;
    if (status === 404) return true;
    const msg = String(err?.message || '');
    return msg.includes('404') || msg.includes('Not Found') || msg.includes('Partida no encontrada');
  };

  const loadGameDetail = useCallback(async () => {
    if (isGameDeleted.current) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await gamesService.getGame(gameId!);
      setGameDetail(data);
    } catch (err: any) {
      if (isNotFoundError(err)) {
        handleGameDeleted(err?.message);
        return;
      }
      setError(err.message || 'No se pudo cargar la partida');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, handleGameDeleted]);

  const loadGameDetailSilent = useCallback(async () => {
    if (isGameDeleted.current) return;
    try {
      const data = await gamesService.getGame(gameId!);
      setGameDetail(data);
    } catch (err: any) {
      if (isNotFoundError(err)) {
        handleGameDeleted(err?.message);
        return;
      }
    }
  }, [gameId, handleGameDeleted]);

  useEffect(() => {
    if (gameId) {
      loadGameDetail();
      pollIntervalRef.current = setInterval(() => {
        loadGameDetailSilent();
      }, 3000);
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [gameId, loadGameDetail, loadGameDetailSilent]);

  useFocusEffect(
    useCallback(() => {
      if (gameId) {
        loadGameDetailSilent();
      }
    }, [gameId, loadGameDetailSilent]),
  );

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadGameDetailSilent();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isCreator = currentUser?.id === gameDetail?.createdBy;

  const handleStartGame = async () => {
    if (!gameDetail) return;
    const runStart = async () => {
      try {
        setIsUpdating(true);
        await gamesService.updateGameStatus(gameDetail.id, 'active');
        await loadGameDetail();
        Alert.alert('Éxito', 'Partida iniciada');
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo iniciar la partida');
      } finally {
        setIsUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que deseas iniciar la partida?');
      if (confirmed) {
        runStart();
      }
      return;
    }

    Alert.alert(
      'Iniciar Partida',
      '¿Estás seguro de que deseas iniciar la partida?',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: runStart,
        },
      ]
    );
  };

  const handleFinishGame = async () => {
    if (!gameDetail) return;
    const runFinish = async () => {
      try {
        setIsUpdating(true);
        await gamesService.updateGameStatus(gameDetail.id, 'finished');
        Alert.alert('Éxito', 'Partida finalizada', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo finalizar la partida');
      } finally {
        setIsUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que deseas finalizar la partida?');
      if (confirmed) {
        runFinish();
      }
      return;
    }

    Alert.alert(
      'Finalizar Partida',
      '¿Estás seguro de que deseas finalizar la partida?',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: runFinish,
          style: 'destructive',
        },
      ]
    );
  };

  const handleTransfer = () => {
    if (gameDetail?.status === 'active') {
      navigation.navigate('Transaction', { gameId: gameDetail.id });
    } else {
      Alert.alert('No permitido', 'Solo puedes transferir dinero en partidas activas');
    }
  };

  if (isLoading) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={commonStyles.loadingText}>Cargando detalles...</Text>
        </View>
      </View>
    );
  }

  if (!gameDetail) {
    if (deletedMessage) {
      return (
        <View style={commonStyles.container}>
          <Modal
            transparent
            visible={!!deletedMessage}
            animationType="fade"
            onRequestClose={() => setDeletedMessage(null)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  padding: 24,
                  minWidth: 300,
                  maxWidth: 420,
                  ...(Platform.OS === 'web'
                    ? { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }
                    : {
                        shadowColor: '#000',
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                      }),
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    marginBottom: 12,
                    color: Colors.gray900,
                  }}
                >
                  Partida Finalizada
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors.gray700,
                    marginBottom: 24,
                    lineHeight: 22,
                  }}
                >
                  {deletedMessage}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setDeletedMessage(null);
                      navigation.navigate('Home');
                    }}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: Colors.success,
                    }}
                  >
                    <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14 }}>
                      OK
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      );
    }
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.containerCenter}>
          <Text style={commonStyles.emptyIcon}>⚠️</Text>
          <Text style={commonStyles.emptyTitle}>Partida no encontrada</Text>
          <Text style={commonStyles.emptyText}>{error || 'No se pudo cargar la información'}</Text>
          <Button
            title="Volver"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <AppHeader title={gameDetail.name} showBack />

      <ScrollView style={commonStyles.scroll} contentContainerStyle={commonStyles.scrollContent}>
        <View style={{ alignItems: 'flex-end', marginBottom: Spacing.sm }}>
          <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={{ fontSize: 18 }}>🔄</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Players Section */}
        <View style={commonStyles.section}>
          {gameDetail.players.length > 0 ? (
            <View style={{ gap: Spacing.md }}>
              {gameDetail.players.map((player) => (
                <View key={player.userId} style={[commonStyles.cardSmall, commonStyles.rowBetween]}>
                  <View style={commonStyles.row}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md }}>
                      <Text style={{ fontWeight: '700', color: Colors.primaryDark }}>
                        {player.avatar || player.username[0].toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>{player.username}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[commonStyles.text, { color: Colors.success, fontWeight: '700', fontSize: 18 }]}>
                      {formatMillions(player.currentBalance)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[commonStyles.cardSmall, { alignItems: 'center' }]}>
              <Text style={commonStyles.textSmall}>No hay jugadores aún</Text>
            </View>
          )}
        </View>

        {/* Actions Section */}
        <View style={commonStyles.section}>
          {isCreator && (
            <>
              {gameDetail.status === 'pending' && (
                <TouchableOpacity
                  style={[commonStyles.buttonBase, { backgroundColor: Colors.success }]}
                  onPress={handleStartGame}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={[commonStyles.text, { color: Colors.white, fontWeight: '700' }]}>▶️ Iniciar Partida</Text>
                  )}
                </TouchableOpacity>
              )}

              {gameDetail.status === 'finished' && (
                <View style={[commonStyles.successBox, { alignItems: 'center' }]}>
                  <Text style={[commonStyles.text, { color: Colors.success, fontWeight: '700' }]}>✅ Partida Finalizada</Text>
                </View>
              )}
            </>
          )}

          {gameDetail.status === 'active' && (
            <TouchableOpacity 
              style={[commonStyles.buttonBase, { backgroundColor: Colors.warning }]} 
              onPress={handleTransfer}
            >
              <Text style={[commonStyles.text, { color: Colors.white, fontWeight: '700' }]}>💸 Transferir Dinero</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Game Info Card */}
        <View style={commonStyles.card}>
          <View style={commonStyles.rowBetween}>
            <View>
              <Text style={commonStyles.labelSmall}>Estado</Text>
              <Text style={[commonStyles.text, { color: getStatusColor(gameDetail.status), fontWeight: '700' }]}>
                {getStatusLabel(gameDetail.status)}
              </Text>
            </View>
            <View>
              <Text style={commonStyles.labelSmall}>Saldo Inicial</Text>
              <Text style={[commonStyles.text, { fontWeight: '700' }]}>
                {formatMillions(gameDetail.initialBalance)}
              </Text>
            </View>
            <View>
              <Text style={commonStyles.labelSmall}>Jugadores</Text>
              <Text style={[commonStyles.text, { fontWeight: '700' }]}>
                {gameDetail.playerCount}/{gameDetail.maxPlayers}
              </Text>
            </View>
          </View>

          {gameDetail.description && (
            <View style={{ paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.gray200, marginTop: Spacing.md }}>
              <Text style={commonStyles.labelSmall}>Descripción</Text>
              <Text style={commonStyles.text}>{gameDetail.description}</Text>
            </View>
          )}

          <View style={commonStyles.infoBox}>
            <Text style={commonStyles.labelSmall}>Código de Acceso</Text>
            <Text style={[commonStyles.text, { fontSize: 20, fontWeight: '700', letterSpacing: 2, marginVertical: Spacing.sm }]}>
              {gameDetail.pin}
            </Text>
            <Text style={commonStyles.textSmall}>Comparte este código para que otros se unan</Text>
          </View>

          <View style={[commonStyles.rowBetween, { paddingTop: Spacing.md }]}
          >
            <View>
              <Text style={commonStyles.labelSmall}>Creada por</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {isCreator ? 'Tú' : 'Otro jugador'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={commonStyles.labelSmall}>Fecha de creación</Text>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>{formatDate(gameDetail.createdAt)}</Text>
            </View>
          </View>

          {isCreator && gameDetail.status === 'active' && (
            <View style={{ marginTop: Spacing.md }}>
              <TouchableOpacity
                style={[commonStyles.buttonBase, { backgroundColor: Colors.error }]}
                onPress={handleFinishGame}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={[commonStyles.text, { color: Colors.white, fontWeight: '700' }]}>⛔ Finalizar Partida</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return Colors.warning;
    case 'active':
      return Colors.success;
    case 'finished':
      return Colors.purple;
    default:
      return Colors.gray500;
  }
}

function getStatusLabel(status: string): string {
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
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
