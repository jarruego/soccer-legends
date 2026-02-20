import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

type UserIconProps = {
  size?: number;
  color?: string;
  letter?: string;
};

export function UserIcon({ size = 22, color = '#2563EB', letter = '?' }: UserIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size ? size / 2 : 11, backgroundColor: color }]}> 
      <Text style={[styles.letter, { fontSize: size ? size * 0.6 : 13 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB', // fallback color
  },
  letter: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginLeft: 7,
  },
});
