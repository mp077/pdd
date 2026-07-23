import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import StatusPill from '../components/premium/StatusPill';
import { Search, Filter, Plus, UserPlus, X, Calendar, MapPin, Hash, User, RefreshCw, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';
import { Patient } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const Patients: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isMobile } = useResponsive();
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadPatients = async () => {
    setLoading(true);
    const data = await api.getPatients(token);
    if (data && Array.isArray(data)) setPatients(data);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
    }, [token])
  );

  // Form State
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
      setNewName(''); setNewAge(''); setNewSite(''); setNewId('');
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

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
              testID="search-patient-input"
              style={styles.searchInput} 
              placeholder="Search active patients..." 
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={isMobile ? styles.listMobile : styles.gridWeb}>
          {filteredPatients.map((patient) => {
            return (
              <TouchableOpacity 
                key={patient.id} 
                testID={`patient-card-${patient.id}`}
                activeOpacity={0.7} 
                style={isMobile ? { width: '100%' } : { width: '31%', minWidth: 300 }}
                onPress={() => navigation.navigate('PatientProfileDoctor', { patientId: patient.id })}
              >
                <GlassCard style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.pName}>{patient.full_name}</Text>
                      <Text style={styles.pId}>{patient.patient_id || `PID-${patient.id}`}</Text>
                    </View>
                    <ChevronRight size={20} color="#94a3b8" />
                  </View>
                  
                  <Text style={styles.pSite}>{patient.implant_site || 'Implant Site Pending'}</Text>
                  
                  <View style={styles.metricsRow}>
                    <View style={styles.metricBadge}>
                      <Text style={styles.metricBadgeText}>{patient.lastVisit ? 'Follow-up' : 'Treatment Planned'}</Text>
                    </View>
                    {patient.stability ? (
                      <View style={[styles.metricBadge, { backgroundColor: '#eff6ff' }]}>
                        <Text style={[styles.metricBadgeText, { color: '#2563eb' }]}>{patient.stability}% Healing</Text>
                      </View>
                    ) : null}
                    <View style={[styles.metricBadge, { 
                      backgroundColor: patient.risk_level === 'High' ? '#fef2f2' : patient.risk_level === 'Moderate' ? '#fffbeb' : '#f0fdf4' 
                    }]}>
                      <Text style={[styles.metricBadgeText, { 
                        color: patient.risk_level === 'High' ? '#ef4444' : patient.risk_level === 'Moderate' ? '#f59e0b' : '#10b981' 
                      }]}>
                        {patient.risk_level?.toUpperCase() || 'LOW'} RISK
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity testID="new-case-btn-desktop" style={styles.newCaseBtn} onPress={() => setIsModalVisible(true)}>
          <UserPlus size={18} color="#3b82f6" />
          <Text style={styles.newCaseText}>Initiate New Case</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity testID="new-case-fab" style={styles.fab} onPress={() => setIsModalVisible(true)}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Patient Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Patient</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}><X size={24} color="#64748b" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#94a3b8" />
                    <TextInput testID="patient-name-input" style={styles.modalInput} placeholder="e.g. John Doe" value={newName} onChangeText={setNewName} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Age</Text>
                    <TextInput style={styles.modalInputFlat} placeholder="32" keyboardType="numeric" value={newAge} onChangeText={setNewAge} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={styles.modalLabel}>Patient ID</Text>
                    <View style={styles.inputWrapper}>
                      <Hash size={16} color="#94a3b8" />
                      <TextInput style={styles.modalInput} placeholder="PID-1025" value={newId} onChangeText={setNewId} />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Implant Site</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={18} color="#94a3b8" />
                    <TextInput style={styles.modalInput} placeholder="e.g. Upper Left Molar (24)" value={newSite} onChangeText={setNewSite} />
                  </View>
                </View>
              </View>

              <TouchableOpacity testID="save-patient-btn" style={styles.saveBtn} onPress={handleAddPatient}>
                <Text style={styles.saveBtnText}>Save Patient</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchBox: { flex: 1, height: 48, backgroundColor: '#ffffff', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
  iconButton: { width: 48, height: 48, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  listMobile: { gap: 12 },
  gridWeb: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  
  // Compact Patient Card
  card: { padding: 16, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  pName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  pId: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
  pSite: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 16 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricBadge: { backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  metricBadgeText: { fontSize: 11, fontWeight: '700', color: '#64748b' },

  newCaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, padding: 18, backgroundColor: '#eff6ff', borderRadius: 18, borderStyle: 'dashed', borderWidth: 1, borderColor: '#3b82f6', gap: 10 },
  newCaseText: { fontSize: 14, fontWeight: '700', color: '#3b82f6' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  formSection: { gap: 20, marginBottom: 32 },
  inputGroup: { gap: 8 },
  modalLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  modalInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' },
  modalInputFlat: { height: 52, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontWeight: '600', color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', gap: 16 },
  saveBtn: { backgroundColor: '#3b82f6', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default Patients;
