/**
 * Pantalla para unirse a una partida existente
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button } from '@components/index';
import { useGamesStore } from '@store/index';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { commonStyles } from '../../styles/common';
import { Colors } from '../../styles/theme';

export function JoinGameScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const joinGame = useGamesStore((state) => state.joinGame);
  const isLoading = useGamesStore((state) => state.isLoading);
  const error = useGamesStore((state) => state.error);
  const clearError = useGamesStore((state) => state.clearError);

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    // Solo permitir números y letras
    const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPin(cleanValue);
    
    if (pinError) {
      setPinError(null);
    }
    if (error) {
      clearError();
    }
  };

  const validatePin = (): boolean => {
    if (!pin.trim()) {
      setPinError('El PIN es requerido');
      return false;
    }
    if (pin.length !== 6) {
      setPinError('El PIN debe tener 6 caracteres');
      return false;
    }
    return true;
  };

  const handleJoinGame = async () => {
    if (!validatePin()) {
      return;
    }

    try {
      const gameId = await joinGame(pin);
      // Navegar directamente a la pantalla de detalles de la partida
      navigation.navigate('GameDetail', { gameId });
    } catch (err: any) {
      // El error ya está en el store
      Alert.alert('Error', err.message || 'No se pudo unir a la partida');
    }
  };

  const errorText = pinError || error;

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <ScrollView
        contentContainerStyle={[commonStyles.scrollContent, commonStyles.scrollContentMin]}
        style={commonStyles.scroll}
      >
        <View style={commonStyles.card}>
          {/* Ícono */}
          <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 24 }}>🔗</Text>

          {/* Campo PIN */}
          <Text style={commonStyles.label}>Código de acceso</Text>
          <TextInput
            style={commonStyles.inputPin}
            placeholder="EJEMPLO"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={6}
            value={pin}
            onChangeText={handleChange}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />
          <Text style={[commonStyles.textSmall, { textAlign: 'center', marginBottom: 16 }]}>
            {pin.length}/6 caracteres
          </Text>

          {errorText && <Text style={commonStyles.error}>{errorText}</Text>}

          {/* Botón unirse */}
          <Button
            title={isLoading ? 'Uniéndose...' : 'Unirse'}
            onPress={handleJoinGame}
            loading={isLoading}
            disabled={isLoading || pin.length !== 6}
            style={commonStyles.buttonBase}
          />

          {/* Información */}
          <View style={commonStyles.infoBox}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.primaryDark, marginBottom: 8 }}>
              ¿Cómo obtengo el código?
            </Text>
            <Text style={{ fontSize: 13, color: Colors.primaryDark, lineHeight: 18 }}>
              Pídele al creador de la partida que comparta el código de 6 caracteres. Lo recibirá cuando cree una nueva partida.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
