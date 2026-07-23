import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Modal
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  Search, FileText, X, Printer, Download, Trash2, ChevronDown, CheckCircle
} from 'lucide-react-native';
import medicinesData from '../../data/medicines.json';

// --- Types ---
interface MedicineItem {
  name: string;
  generic: string;
  category: string;
  strengths: string[];
  form: string;
  frequencies: string[];
  durations: string[];
  instructions: string[];
}

interface Medicine {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
  available_strengths: string[];
  available_frequencies: string[];
  available_durations: string[];
  available_instructions: string[];
}

const MEDICINE_DB: MedicineItem[] = medicinesData;

const DENTAL_ADVICE = [
  'Soft Diet', 'Warm Saline Rinse', 'Brush Gently', 'Avoid Smoking',
  'Avoid Hard Foods', 'Cold Compress', 'Return if Pain Increases', 'Maintain Oral Hygiene'
];

// --- Custom Dropdown Component ---
const CustomDropdown = ({ label, value, options, onSelect }: { label: string, value: string, options: string[], onSelect: (val: string) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.inputCol}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setModalVisible(true)}>
          <Text style={[styles.dropdownBtnText, !value && { color: '#94a3b8' }]} numberOfLines={1}>
            {value || 'Select...'}
          </Text>
          <ChevronDown size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
      
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownMenuTitle}>Select {label}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {options.map((opt, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                  onPress={() => { onSelect(opt); setModalVisible(false); }}
                >
                  <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const DesktopPrescriptionWorkspace: React.FC = () => {
  const { token, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSuggestions, setMedSuggestions] = useState<MedicineItem[]>([]);

  const [currentPrescription, setCurrentPrescription] = useState<Medicine[]>([]);
  const [selectedAdvice, setSelectedAdvice] = useState<string[]>([]);
  const [followUpDays, setFollowUpDays] = useState('7');
  
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [token]);

  const loadPatients = async () => {
    const data = await api.getPatients(token);
    if (data) setPatients(data);
  };

  const handlePatientSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 1) {
      const results = patients.filter(p => 
        p.full_name.toLowerCase().includes(text.toLowerCase()) || 
        (p.patient_id && p.patient_id.toLowerCase().includes(text.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentPrescription([]);
    setSelectedAdvice([]);
    setSaveSuccess(false);
  };

  const handleMedSearch = (text: string) => {
    setMedSearchQuery(text);
    if (text.length > 0) {
      const matches = MEDICINE_DB.filter(m => m.name.toLowerCase().includes(text.toLowerCase()));
      setMedSuggestions(matches);
    } else {
      setMedSuggestions([]);
    }
  };

  const handleSelectMedicine = (med: MedicineItem) => {
    const newMed: Medicine = {
      id: Date.now().toString(),
      name: med.name,
      dose: med.strengths.length === 1 ? med.strengths[0] : '',
      frequency: '',
      duration: '',
      instructions: '',
      available_strengths: med.strengths,
      available_frequencies: med.frequencies,
      available_durations: med.durations,
      available_instructions: med.instructions
    };
    
    setCurrentPrescription([newMed, ...currentPrescription]);
    setMedSearchQuery('');
    setMedSuggestions([]);
  };

  const handleRemoveMedicine = (id: string) => {
    setCurrentPrescription(currentPrescription.filter(m => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setCurrentPrescription(currentPrescription.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleAdvice = (adv: string) => {
    if (selectedAdvice.includes(adv)) {
      setSelectedAdvice(selectedAdvice.filter(a => a !== adv));
    } else {
      setSelectedAdvice([...selectedAdvice, adv]);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: user?.id,
        medications: currentPrescription,
        instructions: selectedAdvice,
        follow_up_days: parseInt(followUpDays) || 7,
        date: new Date().toISOString()
      };
      
      await api.addPrescription(payload, token);
      setSaveSuccess(true);
      setTimeout(() => {
        setPdfModalVisible(true);
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  const closePdfModal = () => {
    setPdfModalVisible(false);
    setSelectedPatient(null);
    setCurrentPrescription([]);
    setSelectedAdvice([]);
    setSaveSuccess(false);
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Prescription Workspace</Text>
          <Text style={styles.subtitle}>Build and issue digital prescriptions securely.</Text>
        </View>

        <View style={styles.splitLayout}>
          
          {/* LEFT COLUMN: Patient Selection & Medicine Search (60%) */}
          <View style={styles.leftCol}>
            
            {/* Step 1: Patient Selection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>1. Select Patient</Text>
              
              {!selectedPatient ? (
                <View style={{ zIndex: 10 }}>
                  <View style={styles.searchBox}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput 
                      style={styles.searchInput}
                      placeholder="Search patient by name or ID..."
                      value={searchQuery}
                      onChangeText={handlePatientSearch}
                    />
                  </View>
                  
                  {searchResults.length > 0 && (
                    <View style={styles.searchResultsBox}>
                      {searchResults.map((p, i) => (
                        <TouchableOpacity key={i} style={styles.searchResultItem} onPress={() => handleSelectPatient(p)}>
                          <View style={styles.searchResultAvatar}>
                            <Text style={styles.searchResultInitial}>{p.full_name.charAt(0)}</Text>
                          </View>
                          <View>
                            <Text style={styles.searchResultName}>{p.full_name}</Text>
                            <Text style={styles.searchResultId}>ID: {p.patient_id}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.selectedPatientBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.searchResultAvatar}>
                      <Text style={styles.searchResultInitial}>{selectedPatient.full_name.charAt(0)}</Text>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <Text style={styles.selectedPatientName}>{selectedPatient.full_name}</Text>
                      <Text style={styles.selectedPatientId}>ID: {selectedPatient.patient_id} • Age: {selectedPatient.age}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedPatient(null)} style={styles.changePatientBtn}>
                    <Text style={styles.changePatientText}>Change</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Step 2: Medicine Search */}
            <View style={[styles.card, { opacity: selectedPatient ? 1 : 0.5 }]} pointerEvents={selectedPatient ? 'auto' : 'none'}>
              <Text style={styles.cardTitle}>2. Prescribe Medications</Text>
              <View style={styles.searchBox}>
                <Search size={20} color="#94a3b8" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search medication by brand or generic name..."
                  value={medSearchQuery}
                  onChangeText={handleMedSearch}
                />
              </View>

              {medSuggestions.length > 0 && (
                <View style={styles.searchResultsBox}>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {medSuggestions.map((m, i) => (
                      <TouchableOpacity key={i} style={styles.medSuggestionItem} onPress={() => handleSelectMedicine(m)}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.medSugName}>{m.name}</Text>
                          <Text style={styles.medSugGeneric}>{m.generic}</Text>
                        </View>
                        <View style={styles.addMedBtn}>
                          <Text style={styles.addMedBtnText}>Add</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Added Medications Table */}
              {currentPrescription.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text style={styles.sectionSubTitle}>Selected Medications</Text>
                  {currentPrescription.map((med) => (
                    <View key={med.id} style={styles.prescriptionItem}>
                      <View style={styles.prescriptionItemHeader}>
                        <Text style={styles.prescriptionItemName}>{med.name}</Text>
                        <TouchableOpacity onPress={() => handleRemoveMedicine(med.id)}>
                          <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.prescriptionItemBody}>
                        <View style={styles.inputRow}>
                          <CustomDropdown 
                            label="Dose/Strength" 
                            value={med.dose} 
                            options={med.available_strengths} 
                            onSelect={(val) => handleUpdateMedicine(med.id, 'dose', val)}
                          />
                          <CustomDropdown 
                            label="Frequency" 
                            value={med.frequency} 
                            options={med.available_frequencies} 
                            onSelect={(val) => handleUpdateMedicine(med.id, 'frequency', val)}
                          />
                        </View>
                        <View style={styles.inputRow}>
                          <CustomDropdown 
                            label="Duration" 
                            value={med.duration} 
                            options={med.available_durations} 
                            onSelect={(val) => handleUpdateMedicine(med.id, 'duration', val)}
                          />
                          <CustomDropdown 
                            label="Instructions" 
                            value={med.instructions} 
                            options={med.available_instructions} 
                            onSelect={(val) => handleUpdateMedicine(med.id, 'instructions', val)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>

          {/* RIGHT COLUMN: Builder/Preview (40%) */}
          <View style={[styles.rightCol, { opacity: selectedPatient ? 1 : 0.5 }]} pointerEvents={selectedPatient ? 'auto' : 'none'}>
            
            {/* Step 3: Advice & Follow up */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>3. Clinical Advice & Follow-up</Text>
              
              <View style={styles.adviceGrid}>
                {DENTAL_ADVICE.map((adv, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.adviceChip, selectedAdvice.includes(adv) && styles.adviceChipActive]}
                    onPress={() => toggleAdvice(adv)}
                  >
                    <Text style={[styles.adviceText, selectedAdvice.includes(adv) && styles.adviceTextActive]}>{adv}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ marginTop: 24 }}>
                <Text style={styles.inputLabel}>Follow-up In (Days)</Text>
                <TextInput 
                  style={[styles.searchBox, { width: '100%', height: 48, marginTop: 8 }]}
                  keyboardType="numeric"
                  value={followUpDays}
                  onChangeText={setFollowUpDays}
                  placeholder="e.g. 7"
                />
              </View>
            </View>

            {/* Action Card */}
            <View style={styles.actionCard}>
              <TouchableOpacity 
                style={[styles.saveBtn, currentPrescription.length === 0 && styles.saveBtnDisabled]} 
                disabled={currentPrescription.length === 0 || isSaving}
                onPress={handleSavePrescription}
              >
                {isSaving ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <FileText size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save & Generate Rx</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {saveSuccess && (
                <View style={styles.successBox}>
                  <CheckCircle size={20} color="#16a34a" />
                  <Text style={styles.successText}>Prescription Saved to Patient Record!</Text>
                </View>
              )}
            </View>

          </View>
        </View>
      </ScrollView>

      {/* PDF Modal */}
      <Modal visible={pdfModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlayPdf}>
          <View style={styles.modalContentPdf}>
            <View style={styles.modalHeaderPdf}>
              <Text style={styles.modalTitlePdf}>Digital Prescription</Text>
              <TouchableOpacity onPress={closePdfModal}><X size={24} color="#64748b" /></TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pdfPreview}>
              <View style={styles.pdfHeader}>
                <Text style={styles.pdfClinicName}>DentPulse AI Clinic</Text>
                <Text style={styles.pdfDocName}>Dr. Smith, DDS</Text>
              </View>
              
              <View style={styles.pdfPatientInfo}>
                <Text style={styles.pdfText}>Patient: {selectedPatient?.full_name}</Text>
                <Text style={styles.pdfText}>Date: {new Date().toLocaleDateString()}</Text>
              </View>

              <View style={styles.pdfRxBox}>
                <Text style={styles.pdfRxSymbol}>Rx</Text>
                {currentPrescription.map((m, i) => (
                  <View key={i} style={styles.pdfMedRow}>
                    <Text style={styles.pdfMedName}>{i + 1}. {m.name} {m.dose}</Text>
                    <Text style={styles.pdfMedInst}>Sig: {m.frequency} for {m.duration}. {m.instructions}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.pdfActions}>
              <TouchableOpacity style={styles.pdfActionBtn}><Printer size={20} color="#3b82f6" /><Text style={styles.pdfActionText}>Print</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pdfActionBtn, { backgroundColor: '#3b82f6' }]} onPress={closePdfModal}>
                <Download size={20} color="#ffffff" /><Text style={[styles.pdfActionText, { color: '#ffffff' }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8 },
  
  splitLayout: { flexDirection: 'row', gap: 32 },
  leftCol: { flex: 6 }, // 60%
  rightCol: { flex: 4 }, // 40%
  
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0f172a',
    outlineStyle: 'none',
  },
  searchResultsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    cursor: 'pointer',
  },
  searchResultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 16,
  },
  searchResultId: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 16,
    marginTop: 2,
  },
  selectedPatientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
  },
  selectedPatientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  selectedPatientId: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  changePatientBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    cursor: 'pointer',
  },
  changePatientText: {
    color: '#475569',
    fontWeight: '600',
  },
  medSuggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  medSugName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  medSugGeneric: { fontSize: 13, color: '#64748b', marginTop: 4 },
  addMedBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, cursor: 'pointer' },
  addMedBtnText: { color: '#2563eb', fontWeight: '700' },
  
  sectionSubTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  prescriptionItem: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  prescriptionItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  prescriptionItemName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  prescriptionItemBody: { gap: 16 },
  inputRow: { flexDirection: 'row', gap: 16 },
  inputCol: { flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 44, cursor: 'pointer' },
  dropdownBtnText: { fontSize: 14, color: '#0f172a', flex: 1 },
  
  dropdownOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdownMenu: { width: 300, backgroundColor: '#ffffff', borderRadius: 12, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 },
  dropdownMenuTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItem: { padding: 12, borderRadius: 6, cursor: 'pointer' },
  dropdownItemActive: { backgroundColor: '#eff6ff' },
  dropdownItemText: { fontSize: 15, color: '#1e293b' },
  dropdownItemTextActive: { color: '#2563eb', fontWeight: '600' },

  adviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  adviceChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', cursor: 'pointer' },
  adviceChipActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  adviceText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  adviceTextActive: { color: '#2563eb', fontWeight: '700' },

  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    cursor: 'pointer',
  },
  saveBtnDisabled: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  successText: {
    color: '#166534',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  modalOverlayPdf: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContentPdf: { width: '100%', maxWidth: 600, backgroundColor: '#ffffff', borderRadius: 24, padding: 32, maxHeight: '90%' },
  modalHeaderPdf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitlePdf: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  pdfPreview: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 32, backgroundColor: '#f8fafc', minHeight: 400 },
  pdfHeader: { borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 16, marginBottom: 24 },
  pdfClinicName: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  pdfDocName: { fontSize: 16, color: '#64748b', marginTop: 4 },
  pdfPatientInfo: { marginBottom: 24 },
  pdfText: { fontSize: 14, color: '#1e293b', marginBottom: 4 },
  pdfRxBox: { flex: 1 },
  pdfRxSymbol: { fontSize: 48, fontWeight: '400', fontFamily: 'serif', color: '#0f172a', marginBottom: 16 },
  pdfMedRow: { marginBottom: 16 },
  pdfMedName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  pdfMedInst: { fontSize: 14, color: '#475569', marginTop: 4 },
  pdfActions: { flexDirection: 'row', gap: 16, marginTop: 24 },
  pdfActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, backgroundColor: '#eff6ff', borderRadius: 12, cursor: 'pointer' },
  pdfActionText: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#2563eb' }
});

export default DesktopPrescriptionWorkspace;
