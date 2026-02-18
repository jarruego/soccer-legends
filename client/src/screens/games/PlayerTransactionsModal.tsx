import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, Text } from 'react-native';
import { TransactionList, TransactionListItem } from '../../components/TransactionList';
import { transactionsService } from '../../services/transactions.service';
import { AppHeader } from '../../components/AppHeader';

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
        // Filtrar solo las transacciones de este usuario
        const filtered = (res.transactions || []).filter(
          (t: any) => t.fromUserId === userId || t.toUserId === userId
        ).map((t: any) => ({
          id: t.id,
          amount: Number(t.amount),
          type: t.type,
          description: t.description,
          createdAt: t.createdAt,
          fromUserId: t.fromUserId,
          toUserId: t.toUserId,
          fromUsername: t.fromUsername,
          toUsername: t.toUsername,
        }));
        setTransactions(filtered);
      })
      .catch((err) => setError(err.message || 'Error al cargar transacciones'))
      .finally(() => setLoading(false));
  }, [visible, userId, gameId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={{ width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden' }}
        >
          {/* Cabecera eliminada para evitar menú de cuenta en la modal */}
          <View style={{ maxHeight: 500, minHeight: 200, padding: 16 }}>
            {loading ? (
              <Text style={{ textAlign: 'center', marginTop: 40 }}>Cargando...</Text>
            ) : error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
            ) : (
                <TransactionList transactions={transactions} emptyText="No hay transacciones." userId={userId} />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
