/**
 * Pantalla de inicio de sesion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button } from '@components/index';
import { useAuthStore } from '@store/index';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { commonStyles } from '../../styles/common';
import { Colors, Spacing, Layout } from '../../styles/theme';

type Field = 'email' | 'password';

export function LoginScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (field: Field, value: string) => {
    if (localError) {
      setLocalError(null);
    }
    if (error) {
      clearError();
    }
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Completa correo y contrasena.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch {
      // El store ya guarda el error
    }
  };

  const errorText = localError || error;

  return (
    <KeyboardAvoidingView
      style={[commonStyles.containerCenter, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[commonStyles.card, { marginHorizontal: Spacing.lg }]}>
        <Text style={[commonStyles.title, { textAlign: 'center' }]}>Soccer Legends</Text>
        <Text style={[commonStyles.subtitle2, { textAlign: 'center' }]}>Iniciar sesion</Text>

        <TextInput
          style={commonStyles.input}
          placeholder="Correo"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => handleChange('email', value)}
          placeholderTextColor={Colors.gray400}
        />

        <TextInput
          style={commonStyles.input}
          placeholder="Contrasena"
          secureTextEntry
          value={password}
          onChangeText={(value) => handleChange('password', value)}
          placeholderTextColor={Colors.gray400}
        />

        {errorText ? <Text style={commonStyles.error}>{errorText}</Text> : null}

        <Button
          title={isLoading ? 'Entrando...' : 'Entrar'}
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={commonStyles.buttonBase}
        />

        <TouchableOpacity
          style={commonStyles.link}
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <Text style={commonStyles.linkText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
