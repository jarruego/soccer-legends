import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TransactionList, TransactionListItem } from '../components/TransactionList';
import { transactionsService } from '../services/transactions.service';
import { useAuthStore } from '../store/auth-store';
import { AppHeader } from '../components/AppHeader';

interface Props {
  userId?: string;
}

export default function TransactionHistoryScreen({ userId }: Props) {
  const user = useAuthStore((state) => state.user);
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);
        const id = userId || user?.id;
        if (!id) throw new Error('No autenticado');
        const data = await transactionsService.getUserTransactions(id);
        setTransactions(
          data.map((t: any) => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type,
            description: t.description,
            createdAt: t.createdAt,
            fromUserId: t.fromUserId,
            toUserId: t.toUserId,
            fromUsername: t.fromUsername,
            toUsername: t.toUsername,
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user, userId]);

  return (
    <View style={styles.container}>
      <AppHeader title="Transacciones" showBack />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <TransactionList transactions={transactions} emptyText="No hay transacciones." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
