/**
 * Pantalla para crear una nueva partida
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppHeader, Button } from '@components/index';
import { gamesService } from '@services/games.service';
import { commonStyles } from '../../styles/common';
import { Colors, Spacing } from '../../styles/theme';
import { sanitizeDecimalInput } from '../../utils/currency';
import type { RootStackParamList } from '../../navigation/navigation-types';

type Field = 'name' | 'initialBalance' | 'maxPlayers' | 'maxTransfer' | 'description';

interface FormData {
  name: string;
  initialBalance: string;
  maxPlayers: string;
  maxTransfer: string;
  description: string;
  hasCommonFund: boolean;
}

interface FormErrors {
  name?: string;
  initialBalance?: string;
  maxPlayers?: string;
  maxTransfer?: string;
  description?: string;
}

interface CreatedGame {
  id: string;
  pin: string;
  name: string;
}

export function CreateGameScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    initialBalance: '100',
    maxPlayers: '4',
    maxTransfer: '500',
    description: '',
    hasCommonFund: true,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdGame, setCreatedGame] = useState<CreatedGame | null>(null);

  const handleChange = (field: Field, value: string) => {
    const nextValue =
      field === 'initialBalance'
        ? sanitizeDecimalInput(value)
        : field === 'maxPlayers' || field === 'maxTransfer'
          ? value.replace(/[^0-9]/g, '')
          : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleToggleCommonFund = () => {
    setFormData((prev) => ({ ...prev, hasCommonFund: !prev.hasCommonFund }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre de la partida es requerido';
    } else if (formData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    const balance = parseFloat(formData.initialBalance);
    if (!formData.initialBalance || isNaN(balance)) {
      errors.initialBalance = 'El saldo debe ser un número válido';
    } else if (balance <= 0) {
      errors.initialBalance = 'El saldo debe ser mayor a 0';
    }

    const maxPlayers = parseInt(formData.maxPlayers, 10);
    if (!formData.maxPlayers || isNaN(maxPlayers)) {
      errors.maxPlayers = 'El número de jugadores debe ser válido';
    } else if (maxPlayers < 2) {
      errors.maxPlayers = 'Mínimo 2 jugadores';
    } else if (maxPlayers > 20) {
      errors.maxPlayers = 'Máximo 20 jugadores';
    }

    const maxTransfer = parseInt(formData.maxTransfer, 10);
    if (!formData.maxTransfer || isNaN(maxTransfer)) {
      errors.maxTransfer = 'La transferencia máxima debe ser válida';
    } else if (maxTransfer < 5) {
      errors.maxTransfer = 'Mínimo 5 M€';
    } else if (maxTransfer > 500) {
      errors.maxTransfer = 'Máximo 500 M€';
    } else if (maxTransfer % 5 !== 0) {
      errors.maxTransfer = 'Debe ir en saltos de 5 M€';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateGame = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await gamesService.createGame({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        initialBalance: parseFloat(formData.initialBalance),
        maxPlayers: parseInt(formData.maxPlayers, 10),
        maxTransfer: parseInt(formData.maxTransfer, 10),
        hasCommonFund: formData.hasCommonFund,
      });

      // Mostrar pantalla de éxito con PIN
      setCreatedGame({
        id: response.id,
        pin: response.pin,
        name: response.name,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la partida');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPin = () => {
    if (createdGame) {
      // En web, copiar al clipboard
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(createdGame.pin);
        Alert.alert('Éxito', 'PIN copiado al portapapeles');
      } else {
        Alert.alert('PIN', `Compartir: ${createdGame.pin}`);
      }
    }
  };

  const handleStartGame = () => {
    if (createdGame) {
      // Navegar a la pantalla de la partida
      navigation.navigate('GameDetail', { gameId: createdGame.id });
    }
  };

  // Si la partida fue creada, mostrar pantalla de éxito
  if (createdGame) {
    return (
      <View style={commonStyles.container}>
        <AppHeader title="Crear Partida" showBack />
        <ScrollView
          contentContainerStyle={commonStyles.scrollContent}
          style={commonStyles.scroll}
        >
          <View style={commonStyles.successCard}>
            <Text style={commonStyles.successIcon}>✅</Text>
            <Text style={commonStyles.successTitle}>¡Partida Creada!</Text>

            <View style={commonStyles.gameInfo}>
              <Text style={commonStyles.gameInfoLabel}>Partida:</Text>
              <Text style={commonStyles.gameInfoValue}>{createdGame.name}</Text>
            </View>

            <View style={commonStyles.pinBox}>
              <Text style={commonStyles.pinLabel}>Código de acceso:</Text>
              <Text style={commonStyles.pinValue}>{createdGame.pin}</Text>
              <Text style={commonStyles.pinHint}>Comparte este código con tus amigos</Text>
            </View>

            <Button
              title="Copiar PIN"
              onPress={handleCopyPin}
              variant="secondary"
              style={{ width: '100%', marginBottom: Spacing.md }}
            />

            <Button
              title="Ir a la Partida"
              onPress={handleStartGame}
              variant="primary"
              style={{ width: '100%', marginBottom: Spacing.md }}
            />

            <TouchableOpacity
              onPress={() => {
                setCreatedGame(null);
                navigation.goBack();
              }}
            >
              <Text style={[commonStyles.linkText, { marginTop: Spacing.lg }]}>Volver a inicio</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Formulario para crear partida
  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Crear Partida" showBack />
      <ScrollView
        contentContainerStyle={commonStyles.scrollContent}
        style={commonStyles.scroll}
      >
        <View style={commonStyles.card}>
          {/* Nombre */}
          <Text style={commonStyles.label}>Nombre de la partida</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="ej: Amigos Jueves"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />
          {formErrors.name && <Text style={commonStyles.error}>{formErrors.name}</Text>}

          {/* Balance inicial */}
          <Text style={commonStyles.label}>Saldo inicial por jugador</Text>
          <View style={commonStyles.inputWithIcon}>
            <Text style={commonStyles.currencyIcon}>M€</Text>
            <TextInput
              style={commonStyles.inputWithIconInput}
              placeholder="100"
              keyboardType="number-pad"
              value={formData.initialBalance}
              onChangeText={(value) => handleChange('initialBalance', value)}
              editable={!isLoading}
              placeholderTextColor={Colors.gray400}
            />
          </View>
          {formErrors.initialBalance && (
            <Text style={commonStyles.error}>{formErrors.initialBalance}</Text>
          )}

          {/* Máximo de jugadores */}
          <Text style={commonStyles.label}>Máximo de jugadores</Text>
          <View style={commonStyles.inputGroup}>
            <TouchableOpacity
              onPress={() => {
                const current = parseInt(formData.maxPlayers, 10);
                if (current > 2) {
                  handleChange('maxPlayers', (current - 1).toString());
                }
              }}
              style={commonStyles.stepButton}
              disabled={isLoading || parseInt(formData.maxPlayers, 10) <= 2}
            >
              <Text style={commonStyles.stepButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={commonStyles.inputCenter}
              keyboardType="number-pad"
              value={formData.maxPlayers}
              onChangeText={(value) => handleChange('maxPlayers', value)}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => {
                const current = parseInt(formData.maxPlayers, 10);
                if (current < 20) {
                  handleChange('maxPlayers', (current + 1).toString());
                }
              }}
              style={commonStyles.stepButton}
              disabled={isLoading || parseInt(formData.maxPlayers, 10) >= 20}
            >
              <Text style={commonStyles.stepButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {formErrors.maxPlayers && (
            <Text style={commonStyles.error}>{formErrors.maxPlayers}</Text>
          )}

          {/* Transferencia máxima por operación */}
          <Text style={commonStyles.label}>Transferencia máxima por operación (M€)</Text>
          <View style={commonStyles.inputGroup}>
            <TouchableOpacity
              onPress={() => {
                const current = parseInt(formData.maxTransfer, 10) || 5;
                if (current > 5) {
                  handleChange('maxTransfer', Math.max(5, current - 5).toString());
                }
              }}
              style={commonStyles.stepButton}
              disabled={isLoading || (parseInt(formData.maxTransfer, 10) || 5) <= 5}
            >
              <Text style={commonStyles.stepButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={commonStyles.inputCenter}
              keyboardType="number-pad"
              value={formData.maxTransfer}
              onChangeText={(value) => handleChange('maxTransfer', value)}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => {
                const current = parseInt(formData.maxTransfer, 10) || 5;
                if (current < 500) {
                  handleChange('maxTransfer', Math.min(500, current + 5).toString());
                }
              }}
              style={commonStyles.stepButton}
              disabled={isLoading || (parseInt(formData.maxTransfer, 10) || 5) >= 500}
            >
              <Text style={commonStyles.stepButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[commonStyles.textSmall, { marginTop: -Spacing.sm, marginBottom: Spacing.md }]}>Valor recomendado: 500 M€</Text>
          {formErrors.maxTransfer && (
            <Text style={commonStyles.error}>{formErrors.maxTransfer}</Text>
          )}

          {/* Descripción (opcional) */}
          <Text style={commonStyles.label}>Descripción (opcional)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Notas sobre la partida..."
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />

          <Text style={commonStyles.label}>Opciones de la partida</Text>
          <TouchableOpacity
            style={[
              commonStyles.rowBetween,
              {
                borderWidth: 1,
                borderColor: Colors.gray200,
                borderRadius: 8,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.md,
                marginBottom: Spacing.md,
                backgroundColor: Colors.white,
              },
            ]}
            onPress={handleToggleCommonFund}
            disabled={isLoading}
          >
            <View style={{ flex: 1, paddingRight: Spacing.sm }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>Incluir Fondo Común</Text>
              <Text style={commonStyles.textSmall}>
                Si está activo, los jugadores podrán aportar dinero al Fondo Común durante la partida.
              </Text>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: formData.hasCommonFund ? Colors.success : Colors.gray300,
                backgroundColor: formData.hasCommonFund ? Colors.success : Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {formData.hasCommonFund && (
                <Text style={{ color: Colors.white, fontWeight: '700' }}>✓</Text>
              )}
            </View>
          </TouchableOpacity>

          <Button
            title={isLoading ? 'Creando...' : 'Crear Partida'}
            onPress={handleCreateGame}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
