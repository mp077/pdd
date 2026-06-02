import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getColors = () => {
    switch (level) {
      case 'Low': return { bg: '#ecfdf5', text: '#059669' };
      case 'Moderate': return { bg: '#fff7ed', text: '#d97706' };
      case 'High': return { bg: '#fef2f2', text: '#dc2626' };
      case 'Critical': return { bg: '#7f1d1d', text: '#ffffff' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{level}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RiskBadge;
