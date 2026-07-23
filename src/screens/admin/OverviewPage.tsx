import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Users, Activity, CheckCircle, ShieldAlert, LogOut } from 'lucide-react-native';

const OverviewPage = () => {
  const { token, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (token) {
        const data = await api.getAdminOverview(token);
        setStats(data);
      }
      setLoading(false);
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning, Admin</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <ShieldAlert size={16} color="#eab308" />
            </View>
            <Text style={styles.kpiValue}>{stats?.pending_doctors || 0}</Text>
            <Text style={styles.kpiLabel}>Pending Approvals</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <CheckCircle size={16} color="#22c55e" />
            </View>
            <Text style={styles.kpiValue}>{stats?.active_doctors || 0}</Text>
            <Text style={styles.kpiLabel}>Verified Doctors</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Users size={16} color="#3b82f6" />
            </View>
            <Text style={styles.kpiValue}>{stats?.total_patients || 0}</Text>
            <Text style={styles.kpiLabel}>Registered Patients</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Activity size={16} color="#8b5cf6" />
            </View>
            <Text style={styles.kpiValue}>{stats?.active_sessions || 0}</Text>
            <Text style={styles.kpiLabel}>Active Sessions</Text>
          </View>
        </View>


        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {stats?.recent_activity?.length > 0 ? (
            stats.recent_activity.map((activity: string, index: number) => (
              <View key={index} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity logged.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  kpiHeader: {
    marginBottom: 12,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },

  activityCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activityText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  }
});

export default OverviewPage;
