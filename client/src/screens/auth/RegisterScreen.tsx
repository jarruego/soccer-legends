/**
 * Pantalla de registro
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button } from '@components/index';
import { useAuthStore } from '@store/index';
import type { RootStackParamList } from '../../navigation/navigation-types';
import { commonStyles } from '../../styles/common';
import { Colors, Spacing } from '../../styles/theme';

type Field = 'email' | 'username' | 'password' | 'confirmPassword';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleChange = (field: Field, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo inválido';
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre debe tener al menos 3 caracteres';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
      });
      // El store maneja el login automático después del registro
    } catch {
      // El store ya guarda el error
    }
  };

  return (
    <KeyboardAvoidingView
      style={[commonStyles.container, { justifyContent: 'center' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[commonStyles.scrollContent, { justifyContent: 'center', flexGrow: 1 }]}>
        <View style={commonStyles.card}>
          <Text style={[commonStyles.title, { textAlign: 'center' }]}>Soccer Legends</Text>
          <Text style={[commonStyles.subtitle2, { textAlign: 'center' }]}>Crear cuenta</Text>

          <TextInput
            style={commonStyles.input}
            placeholder="Correo"
            autoCapitalize="none"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />
          {formErrors.email && <Text style={commonStyles.error}>{formErrors.email}</Text>}

          <TextInput
            style={commonStyles.input}
            placeholder="Nombre de usuario"
            autoCapitalize="none"
            value={formData.username}
            onChangeText={(value) => handleChange('username', value)}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />
          {formErrors.username && <Text style={commonStyles.error}>{formErrors.username}</Text>}

          <TextInput
            style={commonStyles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />
          {formErrors.password && <Text style={commonStyles.error}>{formErrors.password}</Text>}

          <TextInput
            style={commonStyles.input}
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            editable={!isLoading}
            placeholderTextColor={Colors.gray400}
          />
          {formErrors.confirmPassword && (
            <Text style={commonStyles.error}>{formErrors.confirmPassword}</Text>
          )}

          {error && <Text style={commonStyles.error}>{error}</Text>}

          <Button
            title={isLoading ? 'Registrando...' : 'Crear cuenta'}
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={commonStyles.buttonBase}
          />

          <TouchableOpacity
            style={commonStyles.link}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={commonStyles.linkText}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
