import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export interface TransactionListItem {
  id: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
  fromUserId?: string | null;
  toUserId?: string | null;
  fromUsername?: string | null;
  toUsername?: string | null;
  isPositive?: boolean;
}

interface TransactionListProps {
  transactions: TransactionListItem[];
  emptyText?: string;
  userId?: string; // Si se pasa, se usa para calcular el signo

}


import { useAuthStore } from '../store/auth-store';

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, emptyText, userId }) => {
  // Si se pasa userId, se usa ese SIEMPRE. Si no, se usa el usuario logueado.
  const user = useAuthStore((state) => state.user);
  const effectiveUserId = userId !== undefined ? userId : user?.id;

  // Calcular sumas de entrada y salida
  let totalIn = 0;
  let totalOut = 0;
  transactions.forEach((t) => {
    if (!effectiveUserId) return;
    if (t.toUserId === effectiveUserId) {
      totalIn += t.amount;
    } else if (t.fromUserId === effectiveUserId) {
      totalOut += t.amount;
    }
  });

  if (!transactions.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryAmount, { color: '#1db954' }]}>+{totalIn.toFixed(2)} €</Text>
            <Text style={styles.summaryLabel}>Total entrante</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryAmount, { color: '#e53935' }]}>-{totalOut.toFixed(2)} €</Text>
            <Text style={styles.summaryLabel}>Total saliente</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>{emptyText || 'No hay transacciones.'}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryAmount, { color: '#1db954' }]}>+{totalIn.toFixed(2)} €</Text>
          <Text style={styles.summaryLabel}>Total entrante</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryAmount, { color: '#e53935' }]}>-{totalOut.toFixed(2)} €</Text>
          <Text style={styles.summaryLabel}>Total saliente</Text>
        </View>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // ...existing code...
          let isPositive = false;
          if (effectiveUserId) {
            if (item.type === 'player_to_player') {
              isPositive = item.toUserId === effectiveUserId;
            } else if (item.type === 'bank_to_player' || item.type === 'common_fund_to_player') {
              isPositive = item.toUserId === effectiveUserId;
            } else if (item.type === 'player_to_bank' || item.type === 'player_to_common_fund') {
              isPositive = item.fromUserId === effectiveUserId ? false : true;
            } else {
              isPositive = false;
            }
          }
          const amountSign = isPositive ? '+' : '-';
          const amountColor = isPositive ? '#1db954' : '#e53935';

          // Texto de cabecera
          let mainText = '';
          if (item.type === 'player_to_player' && item.fromUsername && item.toUsername) {
            mainText = `Transferencia de ${item.fromUsername} a ${item.toUsername}`;
          } else if (item.type === 'player_to_bank') {
            mainText = 'Transferencia a la banca';
          } else if (item.type === 'bank_to_player') {
            mainText = 'Retiro de la banca';
          } else if (item.type === 'player_to_common_fund') {
            mainText = 'Transferencia al Fondo Común';
          } else if (item.type === 'common_fund_to_player') {
            mainText = 'Cobro del Fondo Común';
          } else {
            mainText = item.type;
          }

          return (
            <View style={styles.item}>
              <Text style={[styles.amount, { color: amountColor }]}> {amountSign}{item.amount} €</Text>
              <Text style={styles.type}>{mainText}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('es-ES')}</Text>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 4,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  summaryAmount: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a1a1a',
  },
  type: {
    fontSize: 13,
    color: '#888',
  },
  description: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
