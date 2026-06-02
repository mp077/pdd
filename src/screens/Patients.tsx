import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import RiskRing from '../components/premium/RiskRing';
import StatusPill from '../components/premium/StatusPill';
import { Search, Filter, Plus, UserPlus, X, Calendar, MapPin, Hash, User, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';
import { Patient } from '../types';
import { mockPatients as initialPatients } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const Patients: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isMobile } = useResponsive();
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const loadPatients = async () => {
    setLoading(true);
    const data = await api.getPatients(token);
    if (data.length > 0) setPatients(data);
    setLoading(false);
  };

  React.useEffect(() => {
    loadPatients();
  }, [token]);
  
  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newSite, setNewSite] = useState('');
  const [newId, setNewId] = useState('');
  const [newSurgeryDate, setNewSurgeryDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddPatient = async () => {
    if (!newName || !newSite) {
      Alert.alert('Incomplete Form', 'Please enter at least Name and Implant Site.');
      return;
    }

    const patientData = {
      patient_id: newId.trim() || `PID-${Date.now().toString().slice(-4)}`,
      full_name: newName,
      age: parseInt(newAge) || 40,
      implant_site: newSite,
      surgery_date: newSurgeryDate,
      risk_level: 'Low' as const,
      doctor_id: user?.id || null,
    };

    setLoading(true);
    const result = await api.addPatient(patientData, token);
    if (result) {
      setPatients([result, ...patients]);
      setIsModalVisible(false);
      // Reset Form
      setNewName('');
      setNewAge('');
      setNewSite('');
      setNewId('');
      setNewSurgeryDate(new Date().toISOString().split('T')[0]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Patients</Text>
          <TouchableOpacity onPress={loadPatients}>
            <RefreshCw size={20} color="#3b82f6" style={loading ? { opacity: 0.5 } : {}} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search patients..." 
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={isMobile ? styles.listMobile : styles.gridWeb}>
          {patients.map((patient) => (
            <TouchableOpacity 
              key={patient.id} 
              activeOpacity={0.7} 
              style={isMobile ? { width: '100%' } : { width: '31%', minWidth: 300 }}
              onPress={() => {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('planning_selected_patient_id', String(patient.id));
                } else {
                  (global as any).planning_selected_patient_id = String(patient.id);
                }
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('changeRoute', { detail: 'Planning' }));
                }
                try {
                  navigation.navigate('Treatment', { patientId: patient.id });
                } catch (e) {}
              }}
            >
              <GlassCard style={styles.card}>
                <View style={styles.cardMain}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarText}>{patient.full_name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                  <View style={styles.pInfo}>
                    <Text style={styles.pName}>{patient.full_name}</Text>
                    <Text style={styles.pMeta}>{patient.patient_id} • {patient.implant_site}</Text>
                  </View>
                  <RiskRing value={patient.stability || 85} size={36} color={(patient.stability || 85) > 80 ? '#10b981' : '#f59e0b'} />
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.visitInfo}>
                    <Text style={styles.visitLabel}>Last Visit</Text>
                    <Text style={styles.visitDate}>{patient.lastVisit || 'Initial'}</Text>
                  </View>
                  <StatusPill 
                    label={patient.risk_level} 
                    type={patient.risk_level === 'High' ? 'error' : patient.risk_level === 'Moderate' ? 'warning' : 'success'} 
                  />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.newCaseBtn}
          onPress={() => setIsModalVisible(true)}
        >
          <UserPlus size={18} color="#3b82f6" />
          <Text style={styles.newCaseText}>Initiate New Case</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Patient Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Patient</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#94a3b8" />
                    <TextInput 
                      style={styles.modalInput} 
                      placeholder="e.g. John Doe"
                      value={newName}
                      onChangeText={setNewName}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Age</Text>
                    <TextInput 
                      style={styles.modalInputFlat} 
                      placeholder="32"
                      keyboardType="numeric"
                      value={newAge}
                      onChangeText={setNewAge}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={styles.modalLabel}>Patient ID</Text>
                    <View style={styles.inputWrapper}>
                      <Hash size={16} color="#94a3b8" />
                      <TextInput 
                        style={styles.modalInput} 
                        placeholder="PID-1025"
                        value={newId}
                        onChangeText={setNewId}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Implant Site</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={18} color="#94a3b8" />
                    <TextInput 
                      style={styles.modalInput} 
                      placeholder="e.g. Upper Left Molar (24)"
                      value={newSite}
                      onChangeText={setNewSite}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Surgery Date (YYYY-MM-DD)</Text>
                  <View style={styles.inputWrapper}>
                    <Calendar size={18} color="#94a3b8" />
                    <TextInput 
                      style={styles.modalInput} 
                      placeholder="2026-05-11" 
                      value={newSurgeryDate}
                      onChangeText={setNewSurgeryDate}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddPatient}>
                <Text style={styles.saveBtnText}>Save Patient</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listMobile: {
    gap: 16,
  },
  gridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  pInfo: {
    flex: 1,
  },
  pName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  pMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  visitDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  newCaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 18,
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 10,
  },
  newCaseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  formSection: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalInputFlat: {
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  cancelBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
});

export default Patients;
