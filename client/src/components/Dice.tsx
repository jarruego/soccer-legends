import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DiceProps {
  faces: number;
  onRoll?: (result: number) => void;
}

export const Dice: React.FC<DiceProps> = ({ faces, onRoll }) => {
  const [result, setResult] = useState<number | null>(null);

  const roll = () => {
    const value = Math.floor(Math.random() * faces) + 1;
    setResult(value);
    if (onRoll) onRoll(value);
  };

  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <TouchableOpacity
        onPress={roll}
        style={{ backgroundColor: '#eee', borderRadius: 16, padding: 16, minWidth: 80, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#333' }}>{result !== null ? result : '?'}</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>D{faces}</Text>
        <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Lanzar</Text>
      </TouchableOpacity>
    </View>
  );
};
