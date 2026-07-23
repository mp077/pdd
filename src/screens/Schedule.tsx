import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { Calendar as CalendarIcon, Video, CheckCircle, Clock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import GlassCard from '../components/premium/GlassCard';
import { useFocusEffect } from '@react-navigation/native';

const Schedule: React.FC = () => {
  const { isMobile } = useResponsive();
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState('Today');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSchedule = async () => {
    if (token) {
      setLoading(true);
      try {
        const appts = await api.getDoctorAppointments(token);
        setAppointments(appts || []);
      } catch (e) {}
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSchedule();
    }, [token])
  );

  const handleAccept = async (id: number) => {
    if (token) {
      await api.acceptAppointment(id, token);
      loadSchedule();
    }
  };

  const handleReject = async (id: number) => {
    if (token) {
      await api.rejectAppointment(id, token);
      loadSchedule();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>Manage your daily clinical appointments</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        {['Yesterday', 'Today', 'Tomorrow', 'Oct 15'].map((date) => (
          <TouchableOpacity 
            key={date} 
            style={[styles.dateChip, selectedDate === date && styles.dateChipActive]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[styles.dateText, selectedDate === date && styles.dateTextActive]}>{date}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Overview Stats */}
      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <CalendarIcon size={20} color="#3b82f6" />
          <Text style={styles.statVal}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Total Appts</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Video size={20} color="#8b5cf6" />
          <Text style={styles.statVal}>{appointments.filter((a) => a.consultation_type === 'virtual').length}</Text>
          <Text style={styles.statLabel}>Virtual</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={styles.statVal}>{appointments.filter((a) => a.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </GlassCard>
      </View>

      <Text style={styles.sectionTitle}>Today's Appointments</Text>
      
      {/* Schedule List */}
      <View style={styles.scheduleList}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : appointments.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 40 }}>No appointments for today.</Text>
        ) : (
          appointments.map((apt, idx) => {
            const timeParts = apt.time.split(' ');
            const isVirtual = apt.consultation_type === 'virtual';
            
            return (
              <View key={idx} style={styles.appointmentCard}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{timeParts[0]}</Text>
                  <Text style={styles.amPmText}>{timeParts[1] || ''}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.patientName}>{apt.patient_name || `Patient ${apt.patient_id}`}</Text>
                  <View style={styles.typeRow}>
                    {isVirtual && <Video size={14} color="#8b5cf6" style={{ marginRight: 4 }} />}
                    <Text style={styles.appointmentType}>{isVirtual ? 'Virtual Consultation' : 'Clinic Visit'}</Text>
                  </View>
                </View>
                <View style={styles.actionCol}>
                  {apt.status === 'completed' && <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.statusText, { color: '#166534' }]}>Done</Text></View>}
                  {apt.status === 'rejected' && <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}><Text style={[styles.statusText, { color: '#991b1b' }]}>Denied</Text></View>}
                  
                  {apt.status === 'pending' && (
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity style={[styles.joinBtn, { backgroundColor: '#10b981', marginRight: 6 }]} onPress={() => handleAccept(apt.id)}>
                        <Text style={styles.joinBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.joinBtn, { backgroundColor: '#ef4444' }]} onPress={() => handleReject(apt.id)}>
                        <Text style={styles.joinBtnText}>Deny</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {apt.status === 'accepted' && isVirtual && <TouchableOpacity style={styles.joinBtn}><Text style={styles.joinBtnText}>Join Call</Text></TouchableOpacity>}
                  {apt.status === 'accepted' && !isVirtual && <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9' }]}><Text style={[styles.statusText, { color: '#64748b' }]}>Upcoming</Text></View>}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  dateSelector: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  dateChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  dateChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  dateText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  dateTextActive: { color: '#ffffff' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16 },
  scheduleList: { gap: 12 },
  appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  timeCol: { width: 70, borderRightWidth: 1, borderRightColor: '#f1f5f9' },
  timeText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  amPmText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  infoCol: { flex: 1, paddingLeft: 16 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  typeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  appointmentType: { fontSize: 13, color: '#64748b' },
  actionCol: { justifyContent: 'center', alignItems: 'flex-end', minWidth: 80 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  joinBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  joinBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700'  }
});

export default Schedule;
