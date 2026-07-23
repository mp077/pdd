import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar as CalendarIcon, Video, CheckCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const DesktopSchedule: React.FC = () => {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(15);
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
    useCallback(() => {
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

  // Generate mock calendar days for visual purposes
  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Clinical Schedule</Text>
            <Text style={styles.subtitle}>Manage your appointments and virtual consultations.</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
                <CalendarIcon size={18} color="#2563eb" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statVal}>{appointments.length}</Text>
                <Text style={styles.statLabel}>Total Appts</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#f5f3ff' }]}>
                <Video size={18} color="#8b5cf6" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statVal}>{appointments.filter((a) => a.consultation_type === 'virtual').length}</Text>
                <Text style={styles.statLabel}>Virtual</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#f0fdf4' }]}>
                <CheckCircle size={18} color="#10b981" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statVal}>{appointments.filter((a) => a.status === 'completed').length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.splitLayout}>
          
          {/* LEFT: Calendar */}
          <View style={styles.leftCol}>
            <View style={styles.calendarCard}>
              <View style={styles.calHeader}>
                <Text style={styles.calMonthText}>October 2026</Text>
                <View style={styles.calControls}>
                  <TouchableOpacity style={styles.calControlBtn}><ChevronLeft size={20} color="#64748b" /></TouchableOpacity>
                  <TouchableOpacity style={styles.calControlBtn}><ChevronRight size={20} color="#64748b" /></TouchableOpacity>
                </View>
              </View>
              <View style={styles.calDaysHeader}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <Text key={d} style={styles.calDayName}>{d}</Text>
                ))}
              </View>
              <View style={styles.calGrid}>
                {/* Empty slots for visual alignment */}
                <View style={styles.calCell} />
                <View style={styles.calCell} />
                <View style={styles.calCell} />
                {generateDays().map(day => (
                  <TouchableOpacity 
                    key={day} 
                    style={[styles.calCell, selectedDate === day && styles.calCellActive]}
                    onPress={() => setSelectedDate(day)}
                  >
                    <Text style={[styles.calCellText, selectedDate === day && styles.calCellTextActive]}>{day}</Text>
                    {day === 15 && selectedDate !== 15 && <View style={styles.calDot} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.upcomingCard}>
              <Text style={styles.sectionTitle}>Next Appointment</Text>
              {appointments.filter(a => a.status === 'accepted').length > 0 ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                    {appointments.filter(a => a.status === 'accepted')[0].patient_name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Clock size={16} color="#64748b" />
                    <Text style={{ marginLeft: 8, color: '#64748b' }}>{appointments.filter(a => a.status === 'accepted')[0].time}</Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: '#94a3b8', marginTop: 16 }}>No upcoming appointments</Text>
              )}
            </View>
          </View>

          {/* RIGHT: Appointments List (Table format) */}
          <View style={styles.rightCol}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.sectionTitle}>Appointments for Oct {selectedDate}</Text>
              <TouchableOpacity style={styles.printBtn}>
                <Text style={styles.printBtnText}>Print Schedule</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 100 }]}>Time</Text>
                <Text style={[styles.th, { flex: 2 }]}>Patient Name</Text>
                <Text style={[styles.th, { flex: 2 }]}>Consultation</Text>
                <Text style={[styles.th, { width: 120 }]}>Status</Text>
                <Text style={[styles.th, { width: 160, textAlign: 'right' }]}>Actions</Text>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ margin: 40 }} />
              ) : appointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No appointments found.</Text>
                </View>
              ) : (
                appointments.map((apt, idx) => {
                  const timeParts = apt.time.split(' ');
                  const isVirtual = apt.consultation_type === 'virtual';
                  
                  return (
                    <View key={idx} style={styles.tableRow}>
                      <View style={{ width: 100 }}>
                        <Text style={styles.tdBold}>{timeParts[0]}</Text>
                        <Text style={styles.tdSub}>{timeParts[1] || ''}</Text>
                      </View>
                      
                      <View style={{ flex: 2 }}>
                        <Text style={styles.tdBold}>{apt.patient_name || `Patient ${apt.patient_id}`}</Text>
                        <Text style={styles.tdSub}>ID: {apt.patient_id || 'N/A'}</Text>
                      </View>
                      
                      <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                        {isVirtual ? <Video size={16} color="#8b5cf6" style={{ marginRight: 8 }} /> : <MapPin size={16} color="#3b82f6" style={{ marginRight: 8 }} />}
                        <Text style={styles.td}>{isVirtual ? 'Virtual' : 'Clinic Visit'}</Text>
                      </View>
                      
                      <View style={{ width: 120 }}>
                        {apt.status === 'completed' && <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.badgeText, { color: '#16a34a' }]}>Completed</Text></View>}
                        {apt.status === 'accepted' && <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}><Text style={[styles.badgeText, { color: '#2563eb' }]}>Upcoming</Text></View>}
                        {apt.status === 'pending' && <View style={[styles.badge, { backgroundColor: '#fef9c3' }]}><Text style={[styles.badgeText, { color: '#ca8a04' }]}>Pending</Text></View>}
                        {apt.status === 'rejected' && <View style={[styles.badge, { backgroundColor: '#fef2f2' }]}><Text style={[styles.badgeText, { color: '#dc2626' }]}>Denied</Text></View>}
                      </View>
                      
                      <View style={{ width: 160, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                        {apt.status === 'pending' && (
                          <>
                            <TouchableOpacity style={styles.actionBtnAccept} onPress={() => handleAccept(apt.id)}>
                              <Text style={styles.actionBtnAcceptText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnReject} onPress={() => handleReject(apt.id)}>
                              <Text style={styles.actionBtnRejectText}>Deny</Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {apt.status === 'accepted' && isVirtual && (
                          <TouchableOpacity style={[styles.actionBtnAccept, { backgroundColor: '#8b5cf6' }]}>
                            <Text style={styles.actionBtnAcceptText}>Join Call</Text>
                          </TouchableOpacity>
                        )}
                        {apt.status === 'completed' && (
                          <Text style={styles.tdSub}>Done</Text>
                        )}
                      </View>
                    </View>
                  )
                })
              )}
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  content: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 160,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {},
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  splitLayout: {
    flexDirection: 'row',
    gap: 32,
  },
  leftCol: {
    width: 340,
  },
  rightCol: {
    flex: 1,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    marginBottom: 24,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  calMonthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  calControls: {
    flexDirection: 'row',
    gap: 8,
  },
  calControlBtn: {
    padding: 4,
    cursor: 'pointer',
  },
  calDaysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  calDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginBottom: 4,
    cursor: 'pointer',
  },
  calCellActive: {
    backgroundColor: '#2563eb',
  },
  calCellText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  calCellTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    position: 'absolute',
    bottom: 6,
  },
  upcomingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  printBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    cursor: 'pointer',
  },
  printBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
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
  tdBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  tdSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  td: {
    fontSize: 15,
    color: '#475569',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnAccept: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    cursor: 'pointer',
  },
  actionBtnAcceptText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnReject: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    cursor: 'pointer',
  },
  actionBtnRejectText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  }
});

export default DesktopSchedule;
