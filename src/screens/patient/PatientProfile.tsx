import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator
} from 'react-native';
import { 
  User, Mail, Phone, Calendar, ShieldCheck, 
  LogOut, ChevronRight, Settings, Bell, 
  CreditCard, Shield, FileText, Pill, 
  Stethoscope, Activity, X
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../utils/api';

const PatientProfile: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [profileData, setProfileData] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [myDoctors, setMyDoctors] = useState<any[]>([]);
  const [showDoctors, setShowDoctors] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    if (token) {
      setLoading(true);
      try {
        const [data, rxData, appts] = await Promise.all([
          api.getPatientProfile(token),
          api.getMyPrescriptions(token),
          api.getMyAppointments(token)
        ]);
        setProfileData(data);
        setPrescriptions(rxData || []);
        
        // Extract unique doctors from appointments
        if (appts && appts.length > 0) {
          const uniqueDocs = Array.from(new Set(appts.map((a: any) => a.doctor_name)))
            .map(name => {
              const appt = appts.find((a: any) => a.doctor_name === name);
              return { name, specialization: appt.doctor_specialization, clinic: appt.clinic_name };
            });
          setMyDoctors(uniqueDocs);
        }
      } catch (e) {}
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [token])
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Identity Card */}
        <View style={styles.identityCard}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.name || 'Patient'}&background=eff6ff&color=2563eb&size=200` }}
            style={styles.avatarImg}
          />
          <View style={styles.identityInfo}>
            <Text style={styles.identityName}>{profileData?.full_name || user?.name || 'Patient'}</Text>
            <View style={styles.idRow}>
              <Text style={styles.idText}>PID: {profileData?.patient_id || `DP-${user?.id || '0000'}`}</Text>
              {profileData?.age && <Text style={styles.idText}> • {profileData.age} Y</Text>}
              {profileData?.gender && <Text style={styles.idText}> • {profileData.gender}</Text>}
            </View>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={14} color="#10b981" />
              <Text style={styles.verifiedText}>Verified Account</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Clinical Section */}
        <Text style={styles.sectionTitle}>Clinical</Text>
        <View style={styles.listGroup}>
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('PatientAppointmentsTab')}>
            <View style={[styles.listIconBox, { backgroundColor: '#eff6ff' }]}>
              <Calendar size={18} color="#2563eb" />
            </View>
            <Text style={styles.listTitle}>My Appointments</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('PatientMedicalRecords')}>
            <View style={[styles.listIconBox, { backgroundColor: '#f0fdf4' }]}>
              <FileText size={18} color="#10b981" />
            </View>
            <Text style={styles.listTitle}>Medical Records</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => setShowDoctors(true)}>
            <View style={[styles.listIconBox, { backgroundColor: '#fdf4ff' }]}>
              <Stethoscope size={18} color="#a855f7" />
            </View>
            <Text style={styles.listTitle}>My Doctors</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => setShowPrescriptions(true)}>
            <View style={[styles.listIconBox, { backgroundColor: '#fff7ed' }]}>
              <Pill size={18} color="#f97316" />
            </View>
            <Text style={styles.listTitle}>Prescriptions</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Financial Section */}
        <Text style={styles.sectionTitle}>Financial</Text>
        <View style={styles.listGroup}>
          <TouchableOpacity style={styles.listItem}>
            <View style={[styles.listIconBox, { backgroundColor: '#f8fafc' }]}>
              <CreditCard size={18} color="#64748b" />
            </View>
            <Text style={styles.listTitle}>Payments & Billing</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          
          <TouchableOpacity style={styles.listItem}>
            <View style={[styles.listIconBox, { backgroundColor: '#f8fafc' }]}>
              <Shield size={18} color="#64748b" />
            </View>
            <Text style={styles.listTitle}>Insurance Details</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.listGroup}>
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('PatientNotifications')}
          >
            <View style={[styles.listIconBox, { backgroundColor: '#f8fafc' }]}>
              <Bell size={18} color="#64748b" />
            </View>
            <Text style={styles.listTitle}>Notifications</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          
          <TouchableOpacity style={styles.listItem}>
            <View style={[styles.listIconBox, { backgroundColor: '#f8fafc' }]}>
              <Settings size={18} color="#64748b" />
            </View>
            <Text style={styles.listTitle}>App Settings</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>DentPulse AI v2.4.1</Text>
      </ScrollView>

      {/* Prescriptions Modal */}
      <Modal visible={showPrescriptions} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Prescriptions</Text>
              <TouchableOpacity onPress={() => setShowPrescriptions(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
              ) : prescriptions.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Pill size={40} color="#cbd5e1" />
                  <Text style={{ color: '#64748b', marginTop: 10 }}>No prescriptions found.</Text>
                </View>
              ) : (
                prescriptions.map((rx, idx) => (
                  <View key={idx} style={styles.rxCard}>
                    <View style={styles.rxHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Pill size={16} color="#8b5cf6" style={{ marginRight: 6 }} />
                        <Text style={styles.rxMedicineName}>{rx.medicine_name}</Text>
                      </View>
                      <Text style={styles.rxDate}>{rx.created_at}</Text>
                    </View>
                    <Text style={styles.rxDosage}>{rx.dosage} • {rx.duration}</Text>
                    <Text style={styles.rxInstructions}>{rx.instructions}</Text>
                    <Text style={styles.rxDoctor}>Prescribed by {rx.doctor_name}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* My Doctors Modal */}
      <Modal visible={showDoctors} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Doctors</Text>
              <TouchableOpacity onPress={() => setShowDoctors(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {loading ? (
                <ActivityIndicator size="large" color="#a855f7" style={{ marginTop: 40 }} />
              ) : myDoctors.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Stethoscope size={40} color="#cbd5e1" />
                  <Text style={{ color: '#64748b', marginTop: 10 }}>You have not booked any doctors yet.</Text>
                </View>
              ) : (
                myDoctors.map((doc, idx) => (
                  <View key={idx} style={styles.rxCard}>
                    <View style={styles.rxHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: `https://ui-avatars.com/api/?name=${doc.name}&background=fdf4ff&color=a855f7` }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                        <View>
                          <Text style={[styles.rxMedicineName, { color: '#a855f7' }]}>Dr. {doc.name}</Text>
                          <Text style={styles.rxDosage}>{doc.specialization}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.rxInstructions, { marginTop: 12 }]}>{doc.clinic}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  identityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  identityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  idRow: {
    marginTop: 4,
  },
  idText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  editBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 32,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 68,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  versionText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalScroll: {
    flexGrow: 1,
  },
  rxCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rxMedicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  rxDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  rxDosage: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 6,
  },
  rxInstructions: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
  },
  rxDoctor: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  }
});

export default PatientProfile;
