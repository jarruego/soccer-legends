import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/common';
import { formatMillions } from '../utils/currency';
import type { Game } from '@/types';

// Componente reutilizable para mostrar una partida
export type GameCardProps = {
  game: Game;
  onView?: () => void;
  onLeave?: () => void;
};

export const GameCard: React.FC<GameCardProps> = ({ game, onView, onLeave }) => {
  // Helpers de status
  const getStatusColor = (status: Game['status']): string => {
    switch (status) {
      case 'pending': return '#FEF3C7';
      case 'active': return '#DBEAFE';
      case 'finished': return '#F3E8FF';
      default: return '#F9FAFB';
    }
  };
  const getStatusLabel = (status: Game['status']): string => {
    switch (status) {
      case 'pending': return '⏳ Pendiente';
      case 'active': return '▶️ Activa';
      case 'finished': return '✅ Finalizada';
      default: return 'Desconocido';
    }
  };
  const getStatusTextColor = (status: Game['status']): string => {
    switch (status) {
      case 'pending': return '#92400E';
      case 'active': return '#075985';
      case 'finished': return '#5B21B6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={commonStyles.gameCard}>
      <View style={commonStyles.gameCardHeader}>
        <View style={commonStyles.gameTitleContainer}>
          <Text style={commonStyles.gameName}>{game.name}</Text>
        </View>
        <View style={[commonStyles.statusBadge, { backgroundColor: getStatusColor(game.status) }]}> 
          <Text style={[commonStyles.statusText, { color: getStatusTextColor(game.status) }]}> 
            {getStatusLabel(game.status)}
          </Text>
        </View>
      </View>
      {game.description && (
        <Text style={commonStyles.gameDescription} numberOfLines={2}>{game.description}</Text>
      )}
      <View style={commonStyles.gameInfoRow}>
        <View style={commonStyles.gameInfoItem}>
          <Text style={commonStyles.gameInfoLabel}>Saldo inicial</Text>
          <Text style={commonStyles.gameInfoValue}>{formatMillions(game.initialBalance)}</Text>
        </View>
        <View style={commonStyles.gameInfoItem}>
          <Text style={commonStyles.gameInfoLabel}>Máx jugadores</Text>
          <Text style={commonStyles.gameInfoValue}>{game.maxPlayers}</Text>
        </View>
        <View style={commonStyles.gameInfoItem}>
          <Text style={commonStyles.gameInfoLabel}>PIN</Text>
          <Text style={commonStyles.gameInfoPin}>{game.pin}</Text>
        </View>
      </View>
      <View style={commonStyles.gameButtonsRow}>
        {onView && (
          <TouchableOpacity style={[commonStyles.gameButton, commonStyles.viewButton]} onPress={onView}>
            <Text style={commonStyles.viewButtonText}>👁️ Ver</Text>
          </TouchableOpacity>
        )}
        {onLeave && (
          <TouchableOpacity style={[commonStyles.gameButton, commonStyles.leaveButton]} onPress={onLeave}>
            <Text style={commonStyles.leaveButtonText}>🚪 Abandonar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};