
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuthStore } from '@store/auth-store';
import type { RootStackParamList } from '../navigation/navigation-types';
import { Colors, Layout, Spacing } from '../styles/theme';
import { UserIcon } from './UserIcon';

export function AvatarMenuButton() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);


  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        style={styles.avatarButton}
        accessibilityLabel="Perfil"
      >
        <UserIcon
          size={22}
          color={Colors.primary}
          letter={user?.username?.[0]?.toUpperCase() || '?'}
        />
      </TouchableOpacity>
      {menuOpen && (
        <Modal
          transparent
          visible={menuOpen}
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setMenuOpen(false)}
            />
            <View style={styles.menuCard}>
              <Text style={styles.menuTitle}>Perfil</Text>
              <Text style={styles.menuValue}>{user?.username || 'Usuario'}</Text>
              <Text style={styles.menuSubValue}>{user?.email || ''}</Text>
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Profile');
                }}
                style={[styles.logoutButton, { backgroundColor: '#e0e7ef', marginBottom: 8 }]}
              >
                <Text style={[styles.logoutText, { color: '#1a1a1a' }]}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8, // separa del borde derecho
    marginRight: 8, // extra separación visual
  },


  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'web' ? 72 : Layout.headerPaddingTop + 60,
    paddingRight: Layout.screenPaddingHorizontal,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    minWidth: 220,
    maxWidth: 260,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 4,
        }),
  },
  menuTitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  menuValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
  },
  menuSubValue: {
    fontSize: 13,
    color: Colors.gray600,
    marginBottom: Spacing.md,
  },
  logoutButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
});
