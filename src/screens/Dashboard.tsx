import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import StatusPill from '../components/premium/StatusPill';
import { RefreshCw, CheckCircle, Clock, Video, Users, Check, X, Calendar } from 'lucide-react-native';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LogoLoader } from '../components/shared/LogoLoader';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { isMobile } = useResponsive();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    const data = await api.getDoctorAppointments(token);
    if (data && Array.isArray(data)) {
      setAppointments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAccept = async (id: number) => {
    if (!token) return;
    await api.acceptAppointment(id, token);
    
    // Extract and automatically add this accepted patient to the doctor's Patients registry
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      try {
        const newPatientData = {
          patient_id: `PID-${appt.id}`,
          full_name: appt.patient_name || 'Accepted Patient',
          age: 38,
          implant_site: '#14',
          surgery_date: new Date().toISOString().split('T')[0],
          risk_level: 'Low' as const,
          doctor_id: user?.id || null
        };
        await api.addPatient(newPatientData, token);
      } catch (err) {
        console.error("Failed to auto-add accepted patient to registry:", err);
      }
    }
    loadData();
  };

  const handleCancel = async (id: number) => {
    if (!token) return;
    try {
      await api.cancelAppointment(id, token);
    } catch (e) {
      console.log(e);
    }
    loadData();
  };

  const doctorLabel = user?.name 
    ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) 
    : 'Dr. Mann';

  const pendingVirtuals = appointments.filter(a => a.consultation_type === 'virtual' && a.status === 'pending').length;
  const todayBookings = appointments.filter(a => a.status === 'accepted' || a.status === 'pending').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Clean Header Section */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image 
              source={require('../assets/logo.png')} 
              style={{ width: 40, height: 40, borderRadius: 20 }} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>DentPulse AI</Text>
          </View>
          <TouchableOpacity onPress={loadData}>
            <RefreshCw size={18} color="#94a3b8" style={loading ? { opacity: 0.5 } : {}} />
          </TouchableOpacity>
        </View>
        <Text style={styles.doctorSub}>{doctorLabel}</Text>
      </View>

      {/* KPI 2x2 Grid */}
      <View style={isMobile ? styles.kpiGridMobile : styles.kpiGridWeb}>
        <GlassCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
            <CheckCircle size={20} color="#10b981" />
          </View>
          <Text style={styles.kpiVal}>96%</Text>
          <Text style={styles.kpiLabel}>Overall Implant Health</Text>
        </GlassCard>

        <GlassCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
            <Users size={20} color="#3b82f6" />
          </View>
          <Text style={styles.kpiVal}>3</Text>
          <Text style={styles.kpiLabel}>Active Cases</Text>
        </GlassCard>

        <GlassCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fdf4ff' }]}>
            <Calendar size={20} color="#a855f7" />
          </View>
          <Text style={styles.kpiVal}>{todayBookings} Today</Text>
          <Text style={styles.kpiLabel}>Patient Bookings</Text>
        </GlassCard>

        <GlassCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
            <Video size={20} color="#f97316" />
          </View>
          <Text style={styles.kpiVal}>{pendingVirtuals} Pending</Text>
          <Text style={styles.kpiLabel}>Virtual Consultations</Text>
        </GlassCard>
      </View>

      {/* Appointments List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointments</Text>
        
        {loading ? (
          <LogoLoader size={50} style={{ marginTop: 20 }} />
        ) : appointments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No appointments scheduled at the moment.</Text>
          </View>
        ) : (
          <View style={styles.appointmentList}>
            {appointments.map((appt) => (
              <GlassCard key={appt.id} style={styles.apptCard}>
                <View style={styles.apptHeader}>
                  <View>
                    <Text style={styles.apptPatient}>{appt.patient_name || 'Unknown Patient'}</Text>
                    <Text style={styles.apptMeta}>
                      {appt.date} • {appt.time} • <Text style={{textTransform: 'capitalize'}}>{appt.consultation_type}</Text>
                    </Text>
                  </View>
                  <StatusPill 
                    label={appt.status} 
                    type={appt.status === 'accepted' ? 'success' : appt.status === 'pending' ? 'warning' : 'default'} 
                  />
                </View>

                {appt.status === 'pending' && (
                  <View style={styles.apptActions}>
                    <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={() => handleAccept(appt.id)}>
                      <Check size={14} color="#fff" />
                      <Text style={styles.btnAcceptText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleCancel(appt.id)}>
                      <X size={14} color="#ef4444" />
                      <Text style={styles.btnRejectText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {appt.status === 'accepted' && appt.consultation_type === 'virtual' && (
                  <TouchableOpacity style={styles.btnJoin}>
                    <Video size={16} color="#fff" />
                    <Text style={styles.btnJoinText}>Join Video Call</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  doctorSub: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  kpiGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  kpiGridWeb: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  kpiCard: {
    width: '47%',
    minWidth: 150,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyBox: {
    padding: 30,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  appointmentList: {
    gap: 12,
  },
  apptCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  apptPatient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  apptMeta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  apptActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  btnAccept: {
    backgroundColor: '#3b82f6',
  },
  btnAcceptText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnReject: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  btnRejectText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
  },
  btnJoin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#10b981',
    marginTop: 16,
    gap: 6,
  },
  btnJoinText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  }
});

export default Dashboard;
