import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert, Image, useWindowDimensions
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Patient } from '../../types';
import { Search, Filter, Plus, UserPlus, X, Hash, User, RefreshCw, ChevronRight, MapPin } from 'lucide-react-native';

const DesktopPatients: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
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
    useCallback(() => {
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

  // Dynamic column width
  const cardWidth = width > 1400 ? '23%' : width > 1100 ? '31%' : '47%';

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.headerRow}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>Patients</Text>
            <TouchableOpacity onPress={loadPatients} style={styles.refreshBtn}>
              <RefreshCw size={20} color="#3b82f6" style={loading ? { opacity: 0.5 } : {}} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionArea}>
            <View style={styles.searchBox}>
              <Search size={18} color="#94a3b8" />
              <TextInput 
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
            <TouchableOpacity style={styles.newPatientBtn} onPress={() => setIsModalVisible(true)}>
              <Plus size={18} color="#ffffff" />
              <Text style={styles.newPatientText}>New Patient</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gridWeb}>
          {filteredPatients.map((patient) => (
            <TouchableOpacity 
              key={patient.id} 
              activeOpacity={0.8} 
              style={[styles.cardContainer, { width: cardWidth }]}
              onPress={() => navigation.navigate('PatientProfileDoctor', { patientId: patient.id })}
            >
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image 
                    source={{ uri: `https://ui-avatars.com/api/?name=${patient.full_name}&background=eff6ff&color=2563eb&size=100` }}
                    style={styles.avatar}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.pName} numberOfLines={1}>{patient.full_name}</Text>
                    <Text style={styles.pId}>{patient.patient_id || `PID-${patient.id}`}</Text>
                  </View>
                  <ChevronRight size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                </View>
                
                <View style={styles.cardBody}>
                  <Text style={styles.pSite}>{patient.implant_site || 'Implant Site Pending'}</Text>
                  <View style={styles.metricsRow}>
                    <View style={styles.metricBadge}>
                      <Text style={styles.metricBadgeText}>{patient.lastVisit ? 'Follow-up' : 'Treatment Planned'}</Text>
                    </View>
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
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredPatients.length === 0 && !loading && (
            <View style={{ padding: 40, alignItems: 'center', width: '100%' }}>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>No patients found.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Add Patient Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
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
                    <TextInput style={styles.modalInput} placeholder="e.g. John Doe" value={newName} onChangeText={setNewName} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
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

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddPatient}>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  refreshBtn: {
    marginLeft: 16,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    cursor: 'pointer',
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 44,
    width: 300,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  newPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    cursor: 'pointer',
  },
  newPatientText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  gridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  cardContainer: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    cursor: 'pointer',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cardHeaderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  pName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  pId: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  pSite: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 16,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metricBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  formSection: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#f8fafc',
  },
  modalInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none',
  },
  modalInputFlat: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#f8fafc',
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none',
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default DesktopPatients;
