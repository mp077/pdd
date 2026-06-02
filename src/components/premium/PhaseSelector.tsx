import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface PhaseSelectorProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

const phases = ['Phase 1', 'Phase 2', 'Phase 3'];

const PhaseSelector: React.FC<PhaseSelectorProps> = ({ activePhase, onPhaseChange }) => {
  return (
    <View style={styles.container}>
      {phases.map((phase) => (
        <TouchableOpacity
          key={phase}
          style={[styles.pill, activePhase === phase && styles.activePill]}
          onPress={() => onPhaseChange(phase)}
        >
          <Text style={[styles.text, activePhase === phase && styles.activeText]}>
            {phase}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    padding: 4,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
  },
  activePill: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeText: {
    color: '#1e293b',
  },
});

export default PhaseSelector;
