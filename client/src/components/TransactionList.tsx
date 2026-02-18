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
}

import { useAuthStore } from '../store/auth-store';

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, emptyText }) => {
  const user = useAuthStore((state) => state.user);
  if (!transactions.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyText || 'No hay transacciones.'}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        // Determinar si es positiva o negativa para el usuario logueado
        let isPositive = false;
        if (user?.id) {
          if (item.type === 'player_to_player') {
            isPositive = item.toUserId === user.id;
          } else if (item.type === 'bank_to_player' || item.type === 'common_fund_to_player') {
            isPositive = item.toUserId === user.id;
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
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
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
