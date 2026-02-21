/**
 * Pantalla de detalle de una partida
 * Muestra jugadores, acciones y Fondo Común.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Button } from '@components/index';
import { PlayerTransactionsModal } from './PlayerTransactionsModal';
import { useAuthStore } from '@store/auth-store';
import { gamesService } from '@services/games.service';
import { transactionsService } from '@services/transactions.service';
import type { CommonFundClaim, GameDetail, SeasonalCollectionClaim } from '@/types';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { commonStyles } from '../../styles/common';
import { Colors, Spacing } from '../../styles/theme';
import { formatMillions } from '../../utils/currency';
import { Dice } from '../../components/Dice';

export function GameDetailScreen(): React.ReactElement {
    // Estado para modal de simulador de dados
    const [showDiceModal, setShowDiceModal] = useState(false);
    // Estado para resultados de dados
    const [diceResults, setDiceResults] = useState<(string | null)[]>([null, null, null]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'GameDetail'>>();
  const gameId = route.params?.gameId;

  const currentUser = useAuthStore((state) => state.user);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletedMessage, setDeletedMessage] = useState<string | null>(null);

  const [commonFundBalance, setCommonFundBalance] = useState(0);
  const [pendingCommonFundClaims, setPendingCommonFundClaims] = useState<CommonFundClaim[]>([]);
  const [myLatestCommonFundClaim, setMyLatestCommonFundClaim] = useState<CommonFundClaim | null>(null);
  const [isRequestingCommonFund, setIsRequestingCommonFund] = useState(false);
  const [isResolvingClaimId, setIsResolvingClaimId] = useState<string | null>(null);
  const [pendingSeasonalClaims, setPendingSeasonalClaims] = useState<SeasonalCollectionClaim[]>([]);
  const [isResolvingSeasonalClaimId, setIsResolvingSeasonalClaimId] = useState<string | null>(null);
  const [myLatestSeasonalClaim, setMyLatestSeasonalClaim] = useState<SeasonalCollectionClaim | null>(null);
  const [isGameInfoModalVisible, setIsGameInfoModalVisible] = useState(false);
  const [activeBankClaimId, setActiveBankClaimId] = useState<string | null>(null);
  const [activeSeasonalClaimId, setActiveSeasonalClaimId] = useState<string | null>(null);
  const isCreator = currentUser?.id === gameDetail?.createdBy;

  const hasNotifiedDeleted = useRef(false);
  const isGameDeleted = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNotifiedClaimRef = useRef<string | null>(null);
  const CLAIM_STORAGE_KEY = `lastNotifiedClaimId_${currentUser?.id || 'anon'}`;
  const dismissedSeasonalClaimRef = useRef<string | null>(null);

  // Estado para modal de transacciones de jugador
  const [showPlayerTxModal, setShowPlayerTxModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerUsername, setSelectedPlayerUsername] = useState<string | null>(null);

  const notifyClaimResolution = useCallback(async (claim: CommonFundClaim | null) => {
    if (!claim || claim.status === 'pending') return;
    // Leer el último claim notificado de AsyncStorage
    let lastNotifiedId = lastNotifiedClaimRef.current;
    if (!lastNotifiedId) {
      lastNotifiedId = await AsyncStorage.getItem(CLAIM_STORAGE_KEY);
      lastNotifiedClaimRef.current = lastNotifiedId;
    }
    if (lastNotifiedId === claim.id) return;

    lastNotifiedClaimRef.current = claim.id;
    await AsyncStorage.setItem(CLAIM_STORAGE_KEY, claim.id);
    if (claim.status === 'approved') {
      Alert.alert('Solicitud aceptada', 'La banca ha aceptado tu solicitud del Fondo Común. ✅');
      return;
    }
    Alert.alert('Solicitud rechazada', 'La banca ha rechazado tu solicitud del Fondo Común. ❌');
  }, [CLAIM_STORAGE_KEY]);

  const loadCommonFundContext = useCallback(
    async (game: GameDetail) => {
      if (!game.hasCommonFund) {
        setCommonFundBalance(0);
        setPendingCommonFundClaims([]);
        setMyLatestCommonFundClaim(null);
        return;
      }

      const [{ commonFundBalance: balance }, pendingResult, myResult] = await Promise.all([
        transactionsService.getCommonFundBalance(game.id),
        currentUser?.id === game.createdBy
          ? transactionsService.getPendingCommonFundClaims(game.id)
          : Promise.resolve({ claimCount: 0, claims: [] }),
        currentUser?.id !== game.createdBy
          ? transactionsService.getMyLatestCommonFundClaim(game.id)
          : Promise.resolve({ claim: null }),
      ]);

      setCommonFundBalance(balance || 0);
      setPendingCommonFundClaims(pendingResult.claims || []);
      setMyLatestCommonFundClaim(myResult.claim || null);

      await notifyClaimResolution(myResult.claim || null);
    },
    [currentUser?.id, notifyClaimResolution],
  );

  const activeBankClaim = pendingCommonFundClaims.find((claim) => claim.id === activeBankClaimId) || null;
  const activeSeasonalClaim = pendingSeasonalClaims.find((claim) => claim.id === activeSeasonalClaimId) || null;
  useEffect(() => {
    if (!myLatestSeasonalClaim || myLatestSeasonalClaim.status === 'pending') return;

    const timer = setTimeout(() => {
      dismissedSeasonalClaimRef.current = myLatestSeasonalClaim.id;
      setMyLatestSeasonalClaim(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [myLatestSeasonalClaim]);

  useEffect(() => {
    if (!isCreator) {
      setActiveBankClaimId(null);
      return;
    }

    if (pendingCommonFundClaims.length === 0) {
      setActiveBankClaimId(null);
      return;
    }

    if (!activeBankClaimId || !pendingCommonFundClaims.some((claim) => claim.id === activeBankClaimId)) {
      setActiveBankClaimId(pendingCommonFundClaims[0].id);
    }
  }, [isCreator, pendingCommonFundClaims, activeBankClaimId]);

  useEffect(() => {
    if (!isCreator) {
      setActiveSeasonalClaimId(null);
      return;
    }

    if (pendingSeasonalClaims.length === 0) {
      setActiveSeasonalClaimId(null);
      return;
    }

    if (!activeSeasonalClaimId || !pendingSeasonalClaims.some((claim) => claim.id === activeSeasonalClaimId)) {
      setActiveSeasonalClaimId(pendingSeasonalClaims[0].id);
    }
  }, [isCreator, pendingSeasonalClaims, activeSeasonalClaimId]);

  const handleGameDeleted = useCallback((message?: string) => {
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
  }, []);

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
      await loadCommonFundContext(data);
      if (currentUser?.id === data.createdBy) {
        const seasonal = await transactionsService.getPendingSeasonalCollectionClaims(data.id);
        setPendingSeasonalClaims(seasonal.claims || []);
        setMyLatestSeasonalClaim(null);
      } else {
        setPendingSeasonalClaims([]);
        const mySeasonal = await transactionsService.getMyLatestSeasonalCollectionClaim(data.id);
        const seasonalClaim = mySeasonal.claim || null;
        if (
          seasonalClaim &&
          seasonalClaim.status !== 'pending' &&
          dismissedSeasonalClaimRef.current === seasonalClaim.id
        ) {
          setMyLatestSeasonalClaim(null);
        } else {
          setMyLatestSeasonalClaim(seasonalClaim);
        }
      }
    } catch (err: any) {
      if (isNotFoundError(err)) {
        handleGameDeleted(err?.message);
        return;
      }
      setError(err.message || 'No se pudo cargar la partida');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, handleGameDeleted, loadCommonFundContext, currentUser?.id]);

  const loadGameDetailSilent = useCallback(async () => {
    if (isGameDeleted.current) return;
    try {
      const data = await gamesService.getGame(gameId!);
      setGameDetail(data);
      await loadCommonFundContext(data);
      if (currentUser?.id === data.createdBy) {
        const seasonal = await transactionsService.getPendingSeasonalCollectionClaims(data.id);
        setPendingSeasonalClaims(seasonal.claims || []);
        setMyLatestSeasonalClaim(null);
      } else {
        setPendingSeasonalClaims([]);
        const mySeasonal = await transactionsService.getMyLatestSeasonalCollectionClaim(data.id);
        const seasonalClaim = mySeasonal.claim || null;
        if (
          seasonalClaim &&
          seasonalClaim.status !== 'pending' &&
          dismissedSeasonalClaimRef.current === seasonalClaim.id
        ) {
          setMyLatestSeasonalClaim(null);
        } else {
          setMyLatestSeasonalClaim(seasonalClaim);
        }
      }
    } catch (err: any) {
      if (isNotFoundError(err)) {
        handleGameDeleted(err?.message);
      }
    }
  }, [gameId, handleGameDeleted, loadCommonFundContext, currentUser?.id]);

  useEffect(() => {
    if (!gameId) return;
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
  }, [gameId, loadGameDetail, loadGameDetailSilent]);

  useFocusEffect(
    useCallback(() => {
      if (gameId) {
        loadGameDetailSilent();
      }
    }, [gameId, loadGameDetailSilent]),
  );


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
      if (confirmed) runStart();
      return;
    }

    Alert.alert('Iniciar Partida', '¿Estás seguro de que deseas iniciar la partida?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar', onPress: runStart },
    ]);
  };

  const handleFinishGame = async () => {
    if (!gameDetail) return;

    const runFinish = async () => {
      try {
        setIsUpdating(true);
        await gamesService.updateGameStatus(gameDetail.id, 'finished');
        Alert.alert('Éxito', 'Partida finalizada', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo finalizar la partida');
      } finally {
        setIsUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que deseas finalizar la partida?');
      if (confirmed) runFinish();
      return;
    }

    Alert.alert('Finalizar Partida', '¿Estás seguro de que deseas finalizar la partida?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Finalizar', style: 'destructive', onPress: runFinish },
    ]);
  };

  const handleTransfer = () => {
    if (gameDetail?.status === 'active') {
      navigation.navigate('Transaction', { gameId: gameDetail.id });
      return;
    }
    Alert.alert('No permitido', 'Solo puedes transferir dinero en partidas activas');
  };

  const handleRequestCommonFund = async () => {
    if (!gameDetail) return;

    try {
      setIsRequestingCommonFund(true);
      const result = await transactionsService.requestCommonFundClaim(gameDetail.id);
      if (result.autoApproved) {
        Alert.alert('Fondo Común cobrado', 'Como banca, has cobrado el Fondo Común al instante. ✅');
      } else {
        Alert.alert('Solicitud enviada', 'La banca ha recibido tu solicitud del Fondo Común.');
      }
      await loadGameDetailSilent();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo solicitar el Fondo Común');
    } finally {
      setIsRequestingCommonFund(false);
    }
  };

  const handleApproveCommonFundClaim = async (claimId: string) => {
    try {
      setIsResolvingClaimId(claimId);
      const result = await transactionsService.approveCommonFundClaim(claimId);
      Alert.alert('Solicitud aceptada', result.message || 'Fondo Común transferido correctamente');
      await loadGameDetailSilent();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo aprobar la solicitud');
    } finally {
      setIsResolvingClaimId(null);
    }
  };

  const handleRejectCommonFundClaim = async (claimId: string) => {
    try {
      setIsResolvingClaimId(claimId);
      const result = await transactionsService.rejectCommonFundClaim(claimId);
      Alert.alert('Solicitud rechazada', result.message || 'Solicitud rechazada');
      await loadGameDetailSilent();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo rechazar la solicitud');
    } finally {
      setIsResolvingClaimId(null);
    }
  };

  const handleApproveSeasonalClaim = async (claimId: string) => {
    try {
      setIsResolvingSeasonalClaimId(claimId);
      const result = await transactionsService.approveSeasonalCollectionClaim(claimId);
      Alert.alert('Solicitud aceptada', result.message || 'Recaudación transferida correctamente');
      await loadGameDetailSilent();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo aprobar la solicitud');
    } finally {
      setIsResolvingSeasonalClaimId(null);
    }
  };

  const handleRejectSeasonalClaim = async (claimId: string) => {
    try {
      setIsResolvingSeasonalClaimId(claimId);
      const result = await transactionsService.rejectSeasonalCollectionClaim(claimId);
      Alert.alert('Solicitud rechazada', result.message || 'Solicitud rechazada');
      await loadGameDetailSilent();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo rechazar la solicitud');
    } finally {
      setIsResolvingSeasonalClaimId(null);
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
          <Modal transparent visible={!!deletedMessage} animationType="fade">
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
                <Text style={{ fontSize: 16, color: Colors.gray700, marginBottom: 24, lineHeight: 22 }}>
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
                    <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14 }}>OK</Text>
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
          <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  // ...existing code...

  return (
    <View style={commonStyles.container}>


      <ScrollView style={commonStyles.scroll} contentContainerStyle={commonStyles.scrollContent}>
              {/* Botón fijo en el pie de la pantalla para abrir simulador de dados */}
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 5, paddingBottom: 5, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', zIndex: 100 }}>
                <TouchableOpacity
                  style={{ backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 20, elevation: 2, minWidth: 120 }}
                  onPress={() => setShowDiceModal(true)}
                >
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>🎲 Dados</Text>
                </TouchableOpacity>
              </View>
              {/* Modal del simulador de dados */}
              <Modal
                visible={showDiceModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDiceModal(false)}
              >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                  <View style={{ width: 320, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 20, marginBottom: 16 }}>Simulador de Dados</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                        {/* Dados clásicos animados */}
                        <Dice faces={10} value={diceResults[0]} onRoll={(result) => {
                          setDiceResults(['?', '?', '?']);
                          setTimeout(() => setDiceResults([String(result), '?', '?']), 50);
                        }} />
                        <Dice faces={6} value={diceResults[1]} onRoll={(result) => {
                          setDiceResults(['?', '?', '?']);
                          setTimeout(() => setDiceResults(['?', String(result), '?']), 50);
                        }} />
                        <Dice faces={3} value={diceResults[2]} onRoll={(result) => {
                          setDiceResults(['?', '?', '?']);
                          setTimeout(() => setDiceResults(['?', '?', String(result)]), 50);
                        }} />
                      </View>
                    <TouchableOpacity
                      onPress={() => setShowDiceModal(false)}
                      style={{ marginTop: 24, backgroundColor: Colors.error, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 24 }}
                    >
                      <Text style={{ color: Colors.white, fontWeight: '700' }}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
        {/* Players Section */}
        <View style={commonStyles.section}>
          {gameDetail.players.length > 0 ? (
            <View style={{ gap: Spacing.md }}>
              {gameDetail.players.map((player) => (
                <View key={player.userId} style={[commonStyles.cardSmall, commonStyles.rowBetween]}>
                  <View style={commonStyles.row}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: Colors.primaryLight,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: Spacing.md,
                      }}
                    >
                      <Text style={{ fontWeight: '700', color: Colors.primaryDark }}>
                        {player.username[0].toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>{player.username}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedPlayerId(player.userId);
                        setSelectedPlayerUsername(player.username);
                        setShowPlayerTxModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[commonStyles.text, { color: Colors.success, fontWeight: '700', fontSize: 18 }]}> 
                        {formatMillions(player.currentBalance)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

                  {/* Modal de transacciones de jugador */}
                  <PlayerTransactionsModal
                    visible={showPlayerTxModal}
                    onClose={() => setShowPlayerTxModal(false)}
                    userId={selectedPlayerId || ''}
                    gameId={gameDetail.id}
                    username={selectedPlayerUsername || ''}
                  />
            </View>
          ) : (
            <View style={[commonStyles.cardSmall, { alignItems: 'center' }]}>
              <Text style={commonStyles.textSmall}>No hay jugadores aún</Text>
            </View>
          )}
        </View>

        {gameDetail.status === 'active' && (
          <TouchableOpacity
            style={[commonStyles.buttonBase, { backgroundColor: Colors.warning }]}
            onPress={handleTransfer}
          >
            <Text style={[commonStyles.text, { color: Colors.white, fontWeight: '700' }]}>💸 Transferir Dinero</Text>
          </TouchableOpacity>
        )}

        {/* Fondo Común (debajo de jugadores) */}
        {gameDetail.hasCommonFund && commonFundBalance > 0 && (
          <View style={commonStyles.cardSmall}>
            <Text style={commonStyles.sectionTitle}>🎯 Fondo Común</Text>
            <View style={[commonStyles.balanceBox, { marginTop: Spacing.sm }]}> 
              <Text style={commonStyles.balanceLabel}>Saldo actual</Text>
              <Text style={commonStyles.balanceValue}>{formatMillions(commonFundBalance)}</Text>
            </View>

            {gameDetail.status === 'active' && commonFundBalance > 0 && (
              <View style={{ marginTop: Spacing.md }}>
                <Button
                  title={
                    isRequestingCommonFund
                      ? 'Procesando...'
                      : isCreator
                        ? 'Cobrar Fondo Común (Banca)'
                        : 'Solicitar Fondo Común'
                  }
                  onPress={handleRequestCommonFund}
                  loading={isRequestingCommonFund}
                  disabled={isRequestingCommonFund}
                />
              </View>
            )}

            {!isCreator && myLatestCommonFundClaim?.status === 'pending' && (
              <Text style={[commonStyles.textSmall, { marginTop: Spacing.sm }]}>⏳ Tienes una solicitud pendiente de respuesta.</Text>
            )}

            {isCreator && pendingCommonFundClaims.length > 0 && (
              <Text style={[commonStyles.textSmall, { marginTop: Spacing.sm }]}>⏳ Tienes solicitudes pendientes por revisar.</Text>
            )}
          </View>
        )}

        {/* Actions Section */}
        <View style={commonStyles.section}>
          {isCreator && gameDetail.status === 'pending' && (
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

          {isCreator && gameDetail.status === 'finished' && (
            <View style={[commonStyles.successBox, { alignItems: 'center' }]}>
              <Text style={[commonStyles.text, { color: Colors.success, fontWeight: '700' }]}>✅ Partida Finalizada</Text>
            </View>
          )}

        </View>

        {/* Código de Acceso (abajo del todo) */}
        <TouchableOpacity
          style={[commonStyles.infoBox, { marginTop: 0, marginBottom: Spacing.md }]}
          onPress={() => setIsGameInfoModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={[commonStyles.rowBetween, { marginBottom: Spacing.xs }]}> 
            <Text style={commonStyles.labelSmall}>Código de Acceso</Text>
            <Text style={[commonStyles.textSmall, { fontWeight: '700' }]}>ℹ️</Text>
          </View>
          <Text
            style={[
              commonStyles.text,
              { fontSize: 20, fontWeight: '700', letterSpacing: 2, marginVertical: Spacing.xs },
            ]}
          >
            {gameDetail.pin}
          </Text>
        </TouchableOpacity>

        {/* Finalizar debajo del código */}
        {isCreator && gameDetail.status === 'active' && (
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
        )}
      </ScrollView>

      <Modal
        transparent
        visible={isGameInfoModalVisible}
        animationType="fade"
        onRequestClose={() => setIsGameInfoModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsGameInfoModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
          }}
        >
          <View
            style={[
              commonStyles.cardSmall,
              {
                width: '100%',
                maxWidth: 460,
                marginBottom: 0,
              },
            ]}
          >
            <View style={[commonStyles.rowBetween, { marginBottom: Spacing.sm }]}> 
              <Text style={[commonStyles.text, { fontWeight: '700' }]}>Información de la partida</Text>
              <TouchableOpacity onPress={() => setIsGameInfoModalVisible(false)}>
                <Text style={[commonStyles.text, { fontWeight: '700' }]}>✕</Text>
              </TouchableOpacity>
            </View>

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
              <View
                style={{
                  paddingTop: Spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: Colors.gray200,
                  marginTop: Spacing.sm,
                }}
              >
                <Text style={commonStyles.labelSmall}>Descripción</Text>
                <Text style={[commonStyles.text, { marginTop: 2 }]}>{gameDetail.description}</Text>
              </View>
            )}

            {gameDetail.hasCommonFund && (
              <View style={[commonStyles.rowBetween, { paddingTop: Spacing.sm }]}> 
                <Text style={commonStyles.labelSmall}>Fondo Común</Text>
                <Text style={[commonStyles.text, { fontWeight: '600' }]}>✅ Activado</Text>
              </View>
            )}

            <View style={[commonStyles.rowBetween, { paddingTop: Spacing.sm }]}> 
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
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        visible={!!activeBankClaim}
        animationType="fade"
        onRequestClose={() => setActiveBankClaimId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
          }}
        >
          <View
            style={[
              commonStyles.cardSmall,
              {
                width: '100%',
                maxWidth: 460,
                marginBottom: 0,
              },
            ]}
          >
            <Text style={[commonStyles.text, { fontWeight: '700', marginBottom: Spacing.sm }]}>
              Solicitud de cobro del Fondo Común
            </Text>
            <Text style={commonStyles.text}>
              👤 {activeBankClaim?.requesterUsername || 'Jugador'} solicita quedarse con todo el Fondo Común.
            </Text>
            <Text style={[commonStyles.textSmall, { marginTop: Spacing.xs }]}>¿Deseas aceptar la solicitud?</Text>

            <View style={[commonStyles.row, { marginTop: Spacing.md }]}> 
              <TouchableOpacity
                style={[commonStyles.buttonSmall, { backgroundColor: Colors.success, marginRight: Spacing.sm }]}
                onPress={() => activeBankClaim && handleApproveCommonFundClaim(activeBankClaim.id)}
                disabled={!activeBankClaim || isResolvingClaimId === activeBankClaim?.id}
              >
                <Text style={[commonStyles.textSmall, { color: Colors.white, fontWeight: '700' }]}>Aceptar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.buttonSmall, { backgroundColor: Colors.error }]}
                onPress={() => activeBankClaim && handleRejectCommonFundClaim(activeBankClaim.id)}
                disabled={!activeBankClaim || isResolvingClaimId === activeBankClaim?.id}
              >
                <Text style={[commonStyles.textSmall, { color: Colors.white, fontWeight: '700' }]}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={!!activeSeasonalClaim}
        animationType="fade"
        onRequestClose={() => setActiveSeasonalClaimId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
          }}
        >
          <View
            style={[
              commonStyles.cardSmall,
              {
                width: '100%',
                maxWidth: 460,
                marginBottom: 0,
              },
            ]}
          >
            <Text style={[commonStyles.text, { fontWeight: '700', marginBottom: Spacing.sm }]}>Solicitud de recaudación</Text>
            <Text style={commonStyles.text}>
              👤 {activeSeasonalClaim?.requesterUsername || 'Jugador'} solicita la recaudación de temporada.
            </Text>
            <Text style={[commonStyles.textSmall, { marginTop: Spacing.xs }]}>Monto: {formatMillions(activeSeasonalClaim?.amount || 0)}</Text>
            <Text style={[commonStyles.textSmall, { marginTop: Spacing.xs }]}>¿Deseas aceptar la solicitud?</Text>

            <View style={[commonStyles.row, { marginTop: Spacing.md }]}> 
              <TouchableOpacity
                style={[commonStyles.buttonSmall, { backgroundColor: Colors.success, marginRight: Spacing.sm }]}
                onPress={() => activeSeasonalClaim && handleApproveSeasonalClaim(activeSeasonalClaim.id)}
                disabled={!activeSeasonalClaim || isResolvingSeasonalClaimId === activeSeasonalClaim?.id}
              >
                <Text style={[commonStyles.textSmall, { color: Colors.white, fontWeight: '700' }]}>Aceptar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.buttonSmall, { backgroundColor: Colors.error }]}
                onPress={() => activeSeasonalClaim && handleRejectSeasonalClaim(activeSeasonalClaim.id)}
                disabled={!activeSeasonalClaim || isResolvingSeasonalClaimId === activeSeasonalClaim?.id}
              >
                <Text style={[commonStyles.textSmall, { color: Colors.white, fontWeight: '700' }]}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
