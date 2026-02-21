import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DiceProps {
  faces: number;
  value?: string | number | null;
  onRoll?: (result: number) => void;
}

export const Dice: React.FC<DiceProps> = ({ faces, value, onRoll }) => {
  const [animating, setAnimating] = useState(false);

  const roll = () => {
    setAnimating(true);
    let count = 0;
    let tempValue = '?';
    const interval = setInterval(() => {
      tempValue = (Math.floor(Math.random() * faces) + 1).toString();
      setDisplayValue(tempValue);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * faces) + 1;
        setDisplayValue(finalValue);
        setAnimating(false);
        if (onRoll) onRoll(finalValue);
      }
    }, 50);
  };

  const [displayValue, setDisplayValue] = useState<string | number | null>(value ?? '?');

  React.useEffect(() => {
    setDisplayValue(value ?? '?');
  }, [value]);

  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <TouchableOpacity
        onPress={roll}
        disabled={animating}
        style={{ backgroundColor: '#eee', borderRadius: 16, padding: 16, minWidth: 80, alignItems: 'center', opacity: animating ? 0.7 : 1 }}
      >
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#333' }}>{displayValue ?? '?'}</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>D{faces}</Text>
        <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Lanzar</Text>
      </TouchableOpacity>
    </View>
  );
};
