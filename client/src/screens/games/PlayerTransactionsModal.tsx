import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, ScrollView, Platform } from 'react-native';
import { TransactionList, TransactionListItem } from '../../components/TransactionList';
import { transactionsService } from '../../services/transactions.service';


interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  gameId: string;
  username?: string;
}

export function PlayerTransactionsModal({ visible, onClose, userId, gameId, username }: Props) {
  const [transactions, setTransactions] = React.useState<TransactionListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    transactionsService.getGameTransactionHistory(gameId)
      .then((res) => {
        // Filtrar solo las transacciones de este usuario y adaptar el tipo
        const filtered = (res.transactions || [])
          .filter((t: any) => t.fromUserId === userId || t.toUserId === userId)
          .map((t: any) => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type,
            description: t.description,
            createdAt: typeof t.createdAt === 'string' ? t.createdAt : t.createdAt.toISOString(),
            fromUserId: t.fromUserId,
            toUserId: t.toUserId,
            fromUsername: t.fromUsername,
            toUsername: t.toUsername,
          }));
        setTransactions(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error al cargar transacciones');
        setLoading(false);
      });
  }, [visible, userId, gameId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
        {Platform.OS === 'web' ? (
          <div style={{ width: '100%', maxWidth: 400, height: '60vh', background: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden', minHeight: 200, display: 'flex', position: 'relative' }}>
            <View style={{ flex: 1, height: '100%', padding: 10, paddingTop: 50 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, backgroundColor: '#f3f4f6', borderRadius: 16, padding: 6 }}
                accessibilityLabel="Cerrar"
              >
                <Text style={{ fontSize: 18, color: '#374151', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
              {loading ? (
                <Text style={{ textAlign: 'center', marginTop: 40 }}>Cargando...</Text>
              ) : error ? (
                <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
              ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                  <TransactionList transactions={transactions} emptyText="No hay transacciones." userId={userId} />
                </ScrollView>
              )}
            </View>
          </div>
        ) : (
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 12, padding: 0, minHeight: 250, maxHeight: 420, alignSelf: 'center', position: 'relative', flex: 1 }}>
            {/* Botón de cierre absoluto */}
            <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 2, padding: 12 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{ backgroundColor: '#f3f4f6', borderRadius: 16, padding: 6 }}
                accessibilityLabel="Cerrar"
              >
                <Text style={{ fontSize: 20, color: '#374151', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
            {/* Contenido interior separado */}
            <View style={{ flex: 1, paddingTop: 36, paddingBottom: 24 }}>
              {loading ? (
                <Text style={{ textAlign: 'center', marginTop: 40 }}>Cargando...</Text>
              ) : error ? (
                <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ flexGrow: 1, padding: 16 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <TransactionList transactions={transactions} emptyText="No hay transacciones." userId={userId} />
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
