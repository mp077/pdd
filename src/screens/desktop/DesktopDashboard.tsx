import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  AlertTriangle,
  Bell,
  Clock,
  ArrowRight
} from 'lucide-react-native';

const DesktopDashboard: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [appointments, setAppointments] = useState<any[]>([]);

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await api.getDoctorAppointments(token);
      if (data && Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (e) {}
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [token])
  );

  const pending = appointments.filter(a => a.status === 'pending');
  const accepted = appointments.filter(a => a.status === 'accepted');
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 2x2 KPI Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#EFF6FF' }]}>
            <CalendarIcon size={24} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{appointments.length}</Text>
            <Text style={styles.kpiLabel}>Total Appointments</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#FEF3C7' }]}>
            <Users size={24} color="#D97706" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{pending.length}</Text>
            <Text style={styles.kpiLabel}>Waiting Room</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#F3E8FF' }]}>
            <FileText size={24} color="#9333EA" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{accepted.length}</Text>
            <Text style={styles.kpiLabel}>Accepted / Scheduled</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#FECACA' }]}>
          <View style={[styles.kpiIconWrapper, { backgroundColor: '#FEE2E2' }]}>
            <AlertTriangle size={24} color="#DC2626" />
          </View>
          <View>
            <Text style={[styles.kpiValue, { color: '#DC2626' }]}>0</Text>
            <Text style={styles.kpiLabel}>Critical AI Alerts</Text>
          </View>
        </View>
      </View>

      {/* Two Column Layout (70/30) */}
      <View style={styles.columnsContainer}>
        {/* LEFT COLUMN (70%) */}
        <View style={styles.leftCol}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.linkText}>View Calendar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1 }]}>Time</Text>
              <Text style={[styles.th, { flex: 2 }]}>Patient</Text>
              <Text style={[styles.th, { flex: 3 }]}>Reason</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Status</Text>
            </View>
            {appointments.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No appointments today.</Text></View>
            ) : (
              appointments.slice(0, 5).map((appt, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.td, { flex: 1, fontWeight: '600' }]}>{appt.appointment_time?.substring(0, 5) || '10:00'}</Text>
                  <Text style={[styles.td, { flex: 2, fontWeight: '600', color: '#1e293b' }]}>{appt.patient_name}</Text>
                  <Text style={[styles.td, { flex: 3, color: '#64748b' }]}>{appt.patient_notes || 'Consultation'}</Text>
                  <View style={{ flex: 1.5 }}>
                    <View style={[styles.badge, appt.status === 'completed' ? styles.badgeSuccess : appt.status === 'scheduled' ? styles.badgeWarning : styles.badgePrimary]}>
                      <Text style={[styles.badgeText, appt.status === 'completed' ? styles.badgeSuccessText : appt.status === 'scheduled' ? styles.badgeWarningText : styles.badgePrimaryText]}>
                        {appt.status?.toUpperCase() || 'SCHEDULED'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>Current Queue</Text>
          </View>
          <View style={styles.tableCard}>
            {pending.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No patients waiting.</Text></View>
            ) : (
              pending.map((appt, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: i === 0 ? '#ef4444' : '#f59e0b', marginRight: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#1e293b' }}>{appt.patient_name}</Text>
                    <Text style={{ color: '#64748b', fontSize: 14 }}>Waiting for {Math.floor(Math.random() * 20) + 5} mins</Text>
                  </View>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Call In</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        {/* RIGHT COLUMN (30%) */}
        <View style={styles.rightCol}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Quick Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Patients')}>
              <Users size={20} color="#2563eb" />
              <Text style={styles.quickActionText}>View Patient List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Prescription')}>
              <FileText size={20} color="#2563eb" />
              <Text style={styles.quickActionText}>Write Prescription</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>Recent Notifications</Text>
          <View style={styles.notificationsCard}>
            <View style={styles.notificationItem}>
              <Bell size={16} color="#64748b" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.notifTitle}>New Appointment Request</Text>
                <Text style={styles.notifTime}>Just now</Text>
              </View>
            </View>
            <View style={styles.notificationItem}>
              <Clock size={16} color="#64748b" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.notifTitle}>Patient John Doe checked in</Text>
                <Text style={styles.notifTime}>10 mins ago</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    cursor: 'pointer',
    // hover effect handled by web css in standard react native web but we keep it simple here
  },
  kpiIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  kpiLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  leftCol: {
    flex: 7, // 70%
  },
  rightCol: {
    flex: 3, // 30%
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  th: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  td: {
    fontSize: 15,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeSuccess: { backgroundColor: '#dcfce7' },
  badgeSuccessText: { color: '#16a34a' },
  badgeWarning: { backgroundColor: '#fef9c3' },
  badgeWarningText: { color: '#ca8a04' },
  badgePrimary: { backgroundColor: '#eff6ff' },
  badgePrimaryText: { color: '#2563eb' },
  actionBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    cursor: 'pointer',
  },
  actionBtnText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    cursor: 'pointer',
  },
  quickActionText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  notificationsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  notifTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  }
});

export default DesktopDashboard;
