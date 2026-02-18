/**
 * Pantalla para transferir dinero entre jugadores en una partida
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { AppHeader, Button } from '@components/index';
import { useAuthStore } from '@store/auth-store';
import { gamesService } from '@services/games.service';
import { transactionsService } from '@services/transactions.service';
import { commonStyles } from '../../styles/common';
import { Colors, Spacing } from '../../styles/theme';
import type { GameDetail } from '@/types';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { formatMillions } from '../../utils/currency';

type TransactionType = 'player' | 'bank' | 'commonFund' | 'give';
type Step = 'type' | 'select' | 'form';
const SLIDER_STEP = 5;
const SliderComponent = Slider as unknown as React.ComponentType<any>;

export function TransactionScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Transaction'>>();

  const currentUser = useAuthStore((state) => state.user);
  const gameId = route.params?.gameId;

  // Estados
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('type');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const hasNotifiedDeleted = useRef(false);

  const handleGameDeleted = useCallback(
    (message?: string) => {
      if (hasNotifiedDeleted.current) return;
      hasNotifiedDeleted.current = true;
      setSuccessMessage(null);
      Alert.alert('Partida eliminada', message || 'La partida ya no existe.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyGames'),
        },
      ]);
    },
    [navigation],
  );

  useEffect(() => {
    if (gameId) {
      loadGameDetail();
    }
  }, [gameId]);

  const loadGameDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gamesService.getGame(gameId!);
      setGameDetail(data);
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.message === 'Partida no encontrada') {
        handleGameDeleted(err?.message);
        return;
      }
      setError(err.message || 'No se pudo cargar la partida');
    } finally {
      setIsLoading(false);
    }
  };

  const isCreator = currentUser?.id === gameDetail?.createdBy;

  const otherPlayers = gameDetail?.players.filter(
    (p) => p.userId !== currentUser?.id
  ) || [];

  const selectedPlayer = gameDetail?.players.find(
    (p) => p.userId === recipientId
  );

  const currentPlayerBalance =
    parseFloat(
      gameDetail?.players.find((p) => p.userId === currentUser?.id)
        ?.currentBalance || '0'
    ) || 0;

  const configuredMaxTransfer = Math.max(
    SLIDER_STEP,
    Math.min(gameDetail?.maxTransfer ?? 500, 500),
  );
  const limitByBalance = Math.max(0, Math.floor(currentPlayerBalance / SLIDER_STEP) * SLIDER_STEP);
  const amountLimit =
    transactionType === 'give'
      ? configuredMaxTransfer
      : Math.min(configuredMaxTransfer, limitByBalance);
  const transferAmount = amount;
  const isValidAmount = transferAmount > 0 && transferAmount <= amountLimit;
  const noAvailableAmount = amountLimit < SLIDER_STEP;
  const sliderMax = noAvailableAmount ? SLIDER_STEP : amountLimit;
  const displayBalance =
    transactionType === 'give'
      ? currentPlayerBalance + transferAmount
      : Math.max(0, currentPlayerBalance - transferAmount);

  useEffect(() => {
    if (amount > amountLimit) {
      setAmount(amountLimit);
    }
  }, [amount, amountLimit]);

  const renderAmountSlider = () => (
    <View>
      <View
        style={{
          borderWidth: 1,
          borderColor: Colors.gray200,
          borderRadius: 8,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          backgroundColor: Colors.white,
          marginBottom: Spacing.md,
        }}
      >
        <SliderComponent
          minimumValue={0}
          maximumValue={sliderMax}
          step={SLIDER_STEP}
          value={transferAmount}
          onValueChange={(value: number) => setAmount(Number(value))}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.gray200}
          thumbTintColor={Colors.primary}
          disabled={isSubmitting || noAvailableAmount}
          style={{ width: '100%', height: 36 }}
        />
      </View>
    </View>
  );

  const handleSelectType = (type: TransactionType) => {
    setTransactionType(type);
    setAmount(0);
    if (type === 'bank' || type === 'commonFund') {
      setStep('form');
      return;
    }
    setStep('select');
  };

  const handleSelectRecipient = (playerId: string) => {
    setRecipientId(playerId);
    setAmount(0);
    setStep('form');
  };

  const handleTransferToPlayer = async () => {
    if (!recipientId || !isValidAmount) {
      Alert.alert('Error', 'Verifica el monto y el destinatario');
      return;
    }

    try {
      setIsSubmitting(true);
      await transactionsService.transferBetweenPlayers({
        gameId: gameId!,
        toUserId: recipientId,
        amount: transferAmount,
      });

      await handleSuccess(`Has transferido ${formatMillions(transferAmount)}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo realizar la transferencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferToBank = async () => {
    if (!isValidAmount) {
      Alert.alert('Error', 'Verifica el monto');
      return;
    }

    try {
      setIsSubmitting(true);
      await transactionsService.transferToBank({
        gameId: gameId!,
        amount: transferAmount,
      });

      await handleSuccess(`Has transferido ${formatMillions(transferAmount)} a la banca`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo realizar la transferencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferToCommonFund = async () => {
    if (!isValidAmount) {
      Alert.alert('Error', 'Verifica el monto');
      return;
    }

    try {
      setIsSubmitting(true);
      await transactionsService.transferToCommonFund({
        gameId: gameId!,
        amount: transferAmount,
      });

      await handleSuccess(`Has aportado ${formatMillions(transferAmount)} al Fondo Común`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo realizar la transferencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGiveFromBank = async () => {
    if (!recipientId || !isValidAmount) {
      Alert.alert('Error', 'Verifica el monto y el jugador');
      return;
    }

    try {
      setIsSubmitting(true);
      await transactionsService.withdrawFromBank({
        gameId: gameId!,
        toUserId: recipientId,
        amount: transferAmount,
      });

      await handleSuccess(`Has dado ${formatMillions(transferAmount)} a ${selectedPlayer?.username}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo realizar la operación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setTransactionType(null);
    setRecipientId(null);
    setAmount(0);
  };

  const handleSuccess = async (message: string) => {
    await loadGameDetail();
    setSuccessMessage(message);
  };

  if (isLoading) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={commonStyles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!gameDetail) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.emptyIcon}>⚠️</Text>
          <Text style={commonStyles.emptyTitle}>Error</Text>
          <Text style={commonStyles.emptyText}>{error || 'No se pudo cargar la partida'}</Text>
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
      <AppHeader title="Transferir Dinero" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={commonStyles.scroll}
          contentContainerStyle={commonStyles.scrollContent}
        >
          {/* Saldo actual */}
          <View style={commonStyles.cardSmall}>
            <View style={commonStyles.balanceBox}>
              <Text style={commonStyles.balanceLabel}>Disponible</Text>
              <Text style={commonStyles.balanceValue}>
                {formatMillions(displayBalance)}
              </Text>
            </View>
          </View>

          {/* Paso 1: Seleccionar tipo de transacción */}
          {step === 'type' && (
            <View>
              <View style={commonStyles.cardSmall}>
                <Text style={commonStyles.sectionTitle}>💳 Tipo de Transacción</Text>
                
                {/* Transferir a jugador */}
                <TouchableOpacity
                  style={[commonStyles.playerButton, { marginBottom: Spacing.md }]}
                  onPress={() => handleSelectType('player')}
                >
                  <View>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>👤 Transferir a Jugador</Text>
                    <Text style={commonStyles.textSmall}>Envía dinero a otro jugador</Text>
                  </View>
                  <Text style={commonStyles.selectArrow}>→</Text>
                </TouchableOpacity>

                {/* Transferir a banca */}
                <TouchableOpacity
                  style={[commonStyles.playerButton, { marginBottom: Spacing.md }]}
                  onPress={() => handleSelectType('bank')}
                >
                  <View>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>🏦 Transferir a la Banca</Text>
                    <Text style={commonStyles.textSmall}>Paga tus deudas a la banca</Text>
                  </View>
                  <Text style={commonStyles.selectArrow}>→</Text>
                </TouchableOpacity>

                {/* Transferir al Fondo Común */}
                {gameDetail.hasCommonFund && (
                  <TouchableOpacity
                    style={[commonStyles.playerButton, { marginBottom: Spacing.md }]}
                    onPress={() => handleSelectType('commonFund')}
                  >
                    <View>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>🎯 Aportar al Fondo Común</Text>
                      <Text style={commonStyles.textSmall}>Añade dinero al fondo de la partida</Text>
                    </View>
                    <Text style={commonStyles.selectArrow}>→</Text>
                  </TouchableOpacity>
                )}

                {/* Dar dinero (solo creador) */}
                {isCreator && (
                  <TouchableOpacity
                    style={commonStyles.playerButton}
                    onPress={() => handleSelectType('give')}
                  >
                    <View>
                      <Text style={[commonStyles.text, { fontWeight: '600', color: Colors.success }]}>💰 Dar Dinero (Banca)</Text>
                      <Text style={commonStyles.textSmall}>Como banca, da dinero a un jugador</Text>
                    </View>
                    <Text style={commonStyles.selectArrow}>→</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Paso 2: Seleccionar destinatario (para transferencia a jugador) */}
          {step === 'select' && transactionType === 'player' && (
            <View style={commonStyles.cardSmall}>
              <Text style={commonStyles.sectionTitle}>👥 Selecciona destinatario</Text>

              {otherPlayers.length > 0 ? (
                <View style={commonStyles.playersList}>
                  {otherPlayers.map((player) => (
                    <TouchableOpacity
                      key={player.userId}
                      style={commonStyles.playerButton}
                      onPress={() => handleSelectRecipient(player.userId)}
                    >
                      <View style={commonStyles.playerInfo}>
                        <View style={commonStyles.playerAvatar}>
                          <Text style={commonStyles.playerAvatarText}>
                            {player.username[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={commonStyles.playerDetails}>
                          <Text style={commonStyles.playerName}>{player.username}</Text>
                          <Text style={commonStyles.playerBalance}>
                            Saldo: {formatMillions(player.currentBalance)}
                          </Text>
                        </View>
                      </View>
                      <Text style={commonStyles.selectArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={commonStyles.emptyState}>
                  <Text style={commonStyles.emptyText}>No hay otros jugadores</Text>
                </View>
              )}
            </View>
          )}

          {/* Paso 2: Seleccionar destinatario (para dar dinero de banca) */}
          {step === 'select' && transactionType === 'give' && (
            <View style={commonStyles.cardSmall}>
              <Text style={commonStyles.sectionTitle}>💳 Selecciona un jugador</Text>

              {gameDetail.players.length > 0 ? (
                <View style={commonStyles.playersList}>
                  {gameDetail.players.map((player) => (
                    <TouchableOpacity
                      key={player.userId}
                      style={commonStyles.playerButton}
                      onPress={() => handleSelectRecipient(player.userId)}
                    >
                      <View style={commonStyles.playerInfo}>
                        <View style={commonStyles.playerAvatar}>
                          <Text style={commonStyles.playerAvatarText}>
                            {player.username[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={commonStyles.playerDetails}>
                          <Text style={commonStyles.playerName}>{player.username}</Text>
                          <Text style={commonStyles.playerBalance}>
                            Saldo: {formatMillions(player.currentBalance)}
                          </Text>
                        </View>
                      </View>
                      <Text style={commonStyles.selectArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={commonStyles.emptyState}>
                  <Text style={commonStyles.emptyText}>Sin jugadores</Text>
                </View>
              )}
            </View>
          )}

          {/* Paso 3: Confirmar monto - Transferencia a jugador */}
          {step === 'form' && transactionType === 'player' && (
            <View style={commonStyles.cardSmall}>
              <View style={commonStyles.flowIndicator}>
                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>De</Text>
                  <View style={commonStyles.flowAvatar}>
                    <Text style={commonStyles.flowAvatarText}>
                      {currentUser?.username?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={commonStyles.flowName}>{currentUser?.username}</Text>
                </View>

                <View style={commonStyles.flowArrow}>
                  <Text style={commonStyles.arrowText}>→</Text>
                </View>

                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>Para</Text>
                  <View style={commonStyles.flowAvatar}>
                    <Text style={commonStyles.flowAvatarText}>
                      {selectedPlayer?.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={commonStyles.flowName}>{selectedPlayer?.username}</Text>
                </View>
              </View>

              <View style={commonStyles.formSection}>
                {renderAmountSlider()}

                {(transferAmount > 0 || noAvailableAmount) && !isValidAmount && (
                  <Text style={commonStyles.error}>
                    {noAvailableAmount
                      ? 'No tienes saldo suficiente para transferir en tramos de 5 M€'
                      : transferAmount > amountLimit
                      ? 'Saldo insuficiente'
                      : 'Monto inválido'}
                  </Text>
                )}

              </View>

              {/* Botones de acción */}
              <View style={commonStyles.cardSmall}>
                <View style={commonStyles.summaryBox}>
                  <Text style={commonStyles.summaryLabel}>A transferir</Text>
                  <Text style={commonStyles.summaryAmount}>
                    {formatMillions(transferAmount)}
                  </Text>
                  <Text style={commonStyles.summarySubtext}>
                    Tu saldo será: {formatMillions(currentPlayerBalance - transferAmount)}
                  </Text>
                </View>

                <Button
                  title={isSubmitting ? 'Enviando...' : 'Confirmar Transferencia'}
                  onPress={handleTransferToPlayer}
                  loading={isSubmitting}
                  disabled={!isValidAmount || isSubmitting}
                />

                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => resetForm()}
                  disabled={isSubmitting}
                >
                  <Text style={commonStyles.cancelButtonText}>← Cambiar tipo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Paso 3: Confirmar transferencia a banca */}
          {step === 'form' && transactionType === 'bank' && (
            <View style={commonStyles.cardSmall}>
              <View style={commonStyles.flowIndicator}>
                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>De</Text>
                  <View style={commonStyles.flowAvatar}>
                    <Text style={commonStyles.flowAvatarText}>
                      {currentUser?.username?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={commonStyles.flowName}>{currentUser?.username}</Text>
                </View>

                <View style={commonStyles.flowArrow}>
                  <Text style={commonStyles.arrowText}>→</Text>
                </View>

                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>Para</Text>
                  <View style={[commonStyles.flowAvatar, { backgroundColor: Colors.warning }]}>
                    <Text style={[commonStyles.flowAvatarText, { color: Colors.gray900 }]}>🏦</Text>
                  </View>
                  <Text style={commonStyles.flowName}>Banca</Text>
                </View>
              </View>

              <View style={commonStyles.formSection}>
                {renderAmountSlider()}

                {(transferAmount > 0 || noAvailableAmount) && !isValidAmount && (
                  <Text style={commonStyles.error}>
                    {noAvailableAmount
                      ? 'No tienes saldo suficiente para pagar en tramos de 5 M€'
                      : transferAmount > amountLimit
                      ? 'Saldo insuficiente'
                      : 'Monto inválido'}
                  </Text>
                )}

              </View>

              <View style={commonStyles.cardSmall}>
                <View style={commonStyles.summaryBox}>
                  <Text style={commonStyles.summaryLabel}>Pagando a la banca</Text>
                  <Text style={commonStyles.summaryAmount}>
                    {formatMillions(transferAmount)}
                  </Text>
                  <Text style={commonStyles.summarySubtext}>
                    Tu saldo será: {formatMillions(currentPlayerBalance - transferAmount)}
                  </Text>
                </View>

                <Button
                  title={isSubmitting ? 'Enviando...' : 'Confirmar Pago'}
                  onPress={handleTransferToBank}
                  loading={isSubmitting}
                  disabled={!isValidAmount || isSubmitting}
                />

                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => resetForm()}
                  disabled={isSubmitting}
                >
                  <Text style={commonStyles.cancelButtonText}>← Cambiar tipo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Paso 3: Banca da dinero a jugador */}
          {step === 'form' && transactionType === 'give' && (
            <View style={commonStyles.cardSmall}>
              <View style={commonStyles.flowIndicator}>
                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>De</Text>
                  <View style={[commonStyles.flowAvatar, { backgroundColor: Colors.warning }]}>
                    <Text style={[commonStyles.flowAvatarText, { color: Colors.gray900 }]}>🏦</Text>
                  </View>
                  <Text style={commonStyles.flowName}>Banca</Text>
                </View>

                <View style={commonStyles.flowArrow}>
                  <Text style={commonStyles.arrowText}>→</Text>
                </View>

                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>Para</Text>
                  <View style={commonStyles.flowAvatar}>
                    <Text style={commonStyles.flowAvatarText}>
                      {selectedPlayer?.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={commonStyles.flowName}>{selectedPlayer?.username}</Text>
                </View>
              </View>

              <View style={commonStyles.formSection}>
                {renderAmountSlider()}

                {noAvailableAmount && (
                  <Text style={commonStyles.error}>No se puede transferir menos de 5 M€</Text>
                )}

              </View>

              <View style={commonStyles.cardSmall}>
                <View style={[commonStyles.summaryBox, { borderLeftColor: Colors.warning }]}>
                  <Text style={[commonStyles.summaryLabel, { color: Colors.warning }]}>Dando de la banca</Text>
                  <Text style={[commonStyles.summaryAmount, { color: Colors.warning }]}>
                    {formatMillions(transferAmount)}
                  </Text>
                </View>

                <Button
                  title={isSubmitting ? 'Procesando...' : 'Confirmar'}
                  onPress={handleGiveFromBank}
                  loading={isSubmitting}
                  disabled={transferAmount <= 0 || isSubmitting}
                />

                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => resetForm()}
                  disabled={isSubmitting}
                >
                  <Text style={commonStyles.cancelButtonText}>← Cambiar tipo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Paso 3: Confirmar transferencia al Fondo Común */}
          {step === 'form' && transactionType === 'commonFund' && (
            <View style={commonStyles.cardSmall}>
              <View style={commonStyles.flowIndicator}>
                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>De</Text>
                  <View style={commonStyles.flowAvatar}>
                    <Text style={commonStyles.flowAvatarText}>
                      {currentUser?.username?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={commonStyles.flowName}>{currentUser?.username}</Text>
                </View>

                <View style={commonStyles.flowArrow}>
                  <Text style={commonStyles.arrowText}>→</Text>
                </View>

                <View style={commonStyles.flowStep}>
                  <Text style={commonStyles.flowStepLabel}>Para</Text>
                  <View style={[commonStyles.flowAvatar, { backgroundColor: Colors.primary }]}> 
                    <Text style={[commonStyles.flowAvatarText, { color: Colors.white }]}>🎯</Text>
                  </View>
                  <Text style={commonStyles.flowName}>Fondo Común</Text>
                </View>
              </View>

              <View style={commonStyles.formSection}>
                {renderAmountSlider()}

                {(transferAmount > 0 || noAvailableAmount) && !isValidAmount && (
                  <Text style={commonStyles.error}>
                    {noAvailableAmount
                      ? 'No tienes saldo suficiente para aportar en tramos de 5 M€'
                      : transferAmount > amountLimit
                      ? 'Saldo insuficiente'
                      : 'Monto inválido'}
                  </Text>
                )}

              </View>

              <View style={commonStyles.cardSmall}>
                <View style={[commonStyles.summaryBox, { borderLeftColor: Colors.primary }]}> 
                  <Text style={[commonStyles.summaryLabel, { color: Colors.primary }]}>Aportando al Fondo Común</Text>
                  <Text style={[commonStyles.summaryAmount, { color: Colors.primary }]}>
                    {formatMillions(transferAmount)}
                  </Text>
                  <Text style={commonStyles.summarySubtext}>
                    Tu saldo será: {formatMillions(currentPlayerBalance - transferAmount)}
                  </Text>
                </View>

                <Button
                  title={isSubmitting ? 'Enviando...' : 'Confirmar Aporte'}
                  onPress={handleTransferToCommonFund}
                  loading={isSubmitting}
                  disabled={!isValidAmount || isSubmitting}
                />

                <TouchableOpacity
                  style={commonStyles.cancelButton}
                  onPress={() => resetForm()}
                  disabled={isSubmitting}
                >
                  <Text style={commonStyles.cancelButtonText}>← Cambiar tipo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {successMessage && (
        <Modal
          transparent
          visible={!!successMessage}
          animationType="fade"
          onRequestClose={() => setSuccessMessage(null)}
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
                Transaccion exitosa
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.gray700,
                  marginBottom: 24,
                  lineHeight: 22,
                }}
              >
                {successMessage}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSuccessMessage(null);
                    resetForm();
                    navigation.goBack();
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: Colors.success,
                  }}
                >
                  <Text
                    style={{
                      color: Colors.white,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    OK
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
