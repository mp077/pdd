import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  AlertTriangle, 
  UserPlus,
  Plus
} from 'lucide-react-native';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { isMobile } = useResponsive();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const hasAlerts = false;

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getDoctorAppointments(token);
      if (data && Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [token])
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2x2 KPI GRID */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#EFF6FF' }]}>
              <CalendarIcon size={18} color="#2563EB" />
            </View>
            <View style={styles.kpiTextContainer}>
              <Text testID="kpi-appointments-count" style={styles.kpiValue}>{appointments.length}</Text>
              <Text style={styles.kpiLabel}>Appointments</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Users size={18} color="#D97706" />
            </View>
            <View style={styles.kpiTextContainer}>
              <Text testID="kpi-waiting-count" style={styles.kpiValue}>{appointments.filter(a => a.status === 'pending').length}</Text>
              <Text style={styles.kpiLabel}>Waiting</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <FileText size={18} color="#9333EA" />
            </View>
            <View style={styles.kpiTextContainer}>
              <Text testID="kpi-accepted-count" style={styles.kpiValue}>{appointments.filter(a => a.status === 'accepted').length}</Text>
              <Text style={styles.kpiLabel}>Accepted</Text>
            </View>
          </View>

          <View style={[styles.kpiCard, styles.kpiCardAlert]}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <AlertTriangle size={18} color="#DC2626" />
            </View>
            <View style={styles.kpiTextContainer}>
              <Text testID="kpi-alerts-count" style={styles.kpiValueAlert}>0</Text>
              <Text style={styles.kpiLabelAlert}>AI Alerts</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS REMOVED */}

        {/* TODAY's SCHEDULE */}
        <View style={styles.flatSection}>
          <Text style={styles.flatSectionTitle}>Today's Schedule</Text>
          <View style={styles.flatListContainer}>
            
            {appointments.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#64748B', fontSize: 13 }}>No appointments today.</Text>
              </View>
            ) : (
              appointments.slice(0, 3).map((appt, index) => (
                <View key={appt.id || index} style={[styles.flatListItem, index === appointments.slice(0,3).length - 1 && styles.noBorder]}>
                  <View style={styles.flatTimeCol}>
                    <Text style={styles.flatTimeText}>{appt.appointment_time?.substring(0, 5) || '10:00'} <Text style={styles.flatAmPm}>AM</Text></Text>
                  </View>
                  <View style={styles.flatInfoCol}>
                    <Text style={styles.flatPatientName}>{appt.patient_name || `Patient #${appt.patient_id}`}</Text>
                    <Text style={styles.flatTreatmentText}>{appt.patient_notes || 'Consultation'}</Text>
                  </View>
                  <View style={appt.status === 'completed' ? styles.badgeSuccess : appt.status === 'scheduled' ? styles.badgeWarning : styles.badgePrimary}>
                    <Text style={appt.status === 'completed' ? styles.badgeSuccessText : appt.status === 'scheduled' ? styles.badgeWarningText : styles.badgePrimaryText}>
                      {appt.status?.toUpperCase() || 'SCHEDULED'}
                    </Text>
                  </View>
                </View>
              ))
            )}
            
          </View>
          {appointments.length > 0 && (
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CURRENT QUEUE */}
        <View style={styles.flatSection}>
          <Text style={styles.flatSectionTitle}>Current Queue</Text>
          <View style={styles.flatListContainer}>
            
            {appointments.filter(a => a.status === 'pending').length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#64748B', fontSize: 13 }}>No patients in queue.</Text>
              </View>
            ) : (
              appointments.filter(a => a.status === 'pending').slice(0, 2).map((appt, index, arr) => (
                <View key={appt.id || index} style={[styles.flatListItem, index === arr.length - 1 && styles.noBorder]}>
                  <View style={index === 0 ? styles.queueDotHigh : styles.queueDotMed} />
                  <View style={styles.queueInfoCol}>
                    <Text style={styles.flatPatientName}>{appt.patient_name || `Patient #${appt.patient_id}`}</Text>
                    <Text style={styles.flatTreatmentText}>Room {index + 2} • {appt.patient_notes || 'Waiting'}</Text>
                  </View>
                </View>
              ))
            )}

          </View>
          {appointments.filter(a => a.status === 'pending').length > 0 && (
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View Queue →</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16, // Reduced padding
    paddingTop: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 72,
  },
  kpiCardAlert: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  kpiIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  kpiTextContainer: {
    flex: 1,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  kpiValueAlert: {
    fontSize: 20,
    fontWeight: '800',
    color: '#991B1B',
    lineHeight: 24,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiLabelAlert: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  alertFeed: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sectionHeaderAlerts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleAlert: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertItemContent: {
    marginLeft: 8,
    flex: 1,
  },
  alertItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F1D1D',
  },
  alertTime: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
    opacity: 0.8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    rowGap: 16,
    paddingHorizontal: 4,
  },
  qaItem: {
    width: '48%', // 2x2 grid
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  qaIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  qaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  flatSection: {
    marginBottom: 24,
  },
  flatSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  flatListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  flatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  flatTimeCol: {
    width: 65,
  },
  flatTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  flatAmPm: {
    fontSize: 10,
    color: '#64748B',
  },
  flatInfoCol: {
    flex: 1,
  },
  flatPatientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  flatTreatmentText: {
    fontSize: 11,
    color: '#64748B',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccessText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeWarningText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  badgePrimary: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePrimaryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  viewAllBtn: {
    marginTop: 10,
    alignSelf: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  queueDotHigh: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 12,
  },
  queueDotMed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 12,
  },
  queueInfoCol: {
    flex: 1,
  },
});

export default Dashboard;
