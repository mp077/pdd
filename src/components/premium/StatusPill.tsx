import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusPillProps {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

const StatusPill: React.FC<StatusPillProps> = ({ label, type = 'info' }) => {
  const getStyles = () => {
    switch (type) {
      case 'success': return { bg: '#ecfdf5', text: '#059669' };
      case 'warning': return { bg: '#fff7ed', text: '#d97706' };
      case 'error': return { bg: '#fef2f2', text: '#dc2626' };
      default: return { bg: '#eff6ff', text: '#3b82f6' };
    }
  };

  const colors = getStyles();

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatusPill;
