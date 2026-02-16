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

type Field = 'name' | 'initialBalance' | 'maxPlayers' | 'description';

interface FormData {
  name: string;
  initialBalance: string;
  maxPlayers: string;
  description: string;
}

interface FormErrors {
  name?: string;
  initialBalance?: string;
  maxPlayers?: string;
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
    description: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdGame, setCreatedGame] = useState<CreatedGame | null>(null);

  const handleChange = (field: Field, value: string) => {
    const nextValue = field === 'initialBalance' ? sanitizeDecimalInput(value) : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
