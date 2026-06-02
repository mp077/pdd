import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { LucideIcon, Users, Activity, AlertTriangle, TrendingUp } from 'lucide-react-native';
import { ClinicalStat } from '../../types';

interface StatCardProps {
  stat: ClinicalStat;
  isMobile: boolean;
}

const icons: Record<string, any> = {
  'users': Users,
  'activity': Activity,
  'alert-triangle': AlertTriangle,
  'trending-up': TrendingUp,
};

const StatCard: React.FC<StatCardProps> = ({ stat, isMobile }) => {
  const Icon = icons[stat.icon] || Activity;
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, isMobile ? styles.mobileCard : styles.webCard, animatedStyle]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
          <Icon size={24} color={stat.color} />
        </View>
        <Text style={[styles.trend, { color: stat.trend > 0 ? '#10b981' : '#ef4444' }]}>
          {stat.trend > 0 ? '+' : ''}{stat.trend}%
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{stat.value}</Text>
        <Text style={styles.label}>{stat.label}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  mobileCard: {
    width: '100%',
  },
  webCard: {
    width: '23%',
    minWidth: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
  },
  trend: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    marginTop: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});

export default StatCard;
