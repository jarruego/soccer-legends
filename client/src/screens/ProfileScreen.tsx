import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/navigation-types';
import { AppHeader } from '../components/AppHeader';
import { useAuthStore } from '../store/auth-store';
import { authService } from '../services/auth.service';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const error = useAuthStore((state) => state.error);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUser({ username });
      Alert.alert('Perfil actualizado');
      navigation.navigate('Home');
    } catch (e: any) {
      // Axios/Fetch puede devolver error con response.status
      const status = e?.status || e?.response?.status;
      const message = e?.message || e?.response?.data?.message || '';
      if (status === 409 || message.toLowerCase().includes('username ya está en uso') || message.toLowerCase().includes('conflict')) {
        Alert.alert('Error', 'El nombre de usuario ya está en uso. Prueba con otro.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorModal('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowSuccessModal(true);
    } catch (e: any) {
      let msg = e?.message || 'No se pudo cambiar la contraseña';
      // Si viene de axios/fetch con response.data.message
      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      }
      setErrorModal(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Editar perfil" showBack />
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Nombre de usuario"
        autoCapitalize="none"
      />
      {error && (
        <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
      )}
      <Button title="CAMBIAR NOMBRE DE USUARIO" onPress={handleSaveProfile} disabled={loading} />

      <Text style={[styles.title, { marginTop: 32 }]}>Cambiar contraseña</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Contraseña actual"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repetir nueva contraseña"
        secureTextEntry
      />
      <Button title="Cambiar contraseña" onPress={handleChangePassword} disabled={loading} />

      {/* Modal de éxito */}
      <Modal
        transparent
        visible={showSuccessModal}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, minWidth: 260, alignItems: 'center', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 16px rgba(0,0,0,0.2)' } : { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }) }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>¡Contraseña cambiada!</Text>
            <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>Tu contraseña se ha cambiado correctamente.</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de error */}
      <Modal
        transparent
        visible={!!errorModal}
        animationType="fade"
        onRequestClose={() => setErrorModal(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, minWidth: 260, alignItems: 'center', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 16px rgba(0,0,0,0.2)' } : { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }) }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#d32f2f' }}>Error</Text>
            <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#d32f2f' }}>{errorModal}</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#d32f2f', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }}
              onPress={() => setErrorModal(null)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
});
