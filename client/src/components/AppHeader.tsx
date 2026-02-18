import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuthStore } from '@store/auth-store';
import type { RootStackParamList } from '../navigation/navigation-types';
import { commonStyles } from '../styles/common';
import { Colors, Layout, Spacing } from '../styles/theme';

type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
};

export function AppHeader({ title, showBack = false }: AppHeaderProps): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const avatarText = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <View style={commonStyles.header}>
        <View style={{ width: 40, alignItems: 'flex-start' }}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={commonStyles.backButton}>
              <Text style={commonStyles.backButtonText}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          {title ? <Text style={commonStyles.title2}>{title}</Text> : null}
        </View>

        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={styles.avatarButton}
          accessibilityLabel="Perfil"
        >
          <Text style={styles.avatarText}>{avatarText}</Text>
        </TouchableOpacity>
      </View>

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
                  navigation.navigate('TransactionHistory');
                }}
                style={[styles.logoutButton, { backgroundColor: '#e0e7ef', marginBottom: 8 }]}
              >
                <Text style={[styles.logoutText, { color: '#1a1a1a' }]}>Ver transacciones</Text>
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
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
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
