import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Modal, SafeAreaView, StatusBar, Dimensions 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  Search, ChevronRight, FileText, X, Printer, Download, Trash2, ChevronDown
} from 'lucide-react-native';
import medicinesData from '../data/medicines.json';

const { width, height } = Dimensions.get('window');

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
          <Text style={[styles.dropdownBtnText, !value && { color: '#94a3b8' }]}>{value || 'Select...'}</Text>
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

const PrescriptionWorkspace: React.FC = () => {
  const { token, user } = useAuth();
  
  // Patient Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  // Medicine Search States
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSuggestions, setMedSuggestions] = useState<MedicineItem[]>([]);

  // Prescription Builder States
  const [currentPrescription, setCurrentPrescription] = useState<Medicine[]>([]);
  const [selectedAdvice, setSelectedAdvice] = useState<string[]>([]);
  const [followUpDays, setFollowUpDays] = useState('7');
  
  // PDF / Save State
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
        (p.patient_id && p.patient_id.toLowerCase().includes(text.toLowerCase())) ||
        (p.phone && p.phone.includes(text))
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
    // Reset workspace
    setCurrentPrescription([]);
    setSelectedAdvice([]);
    setSaveSuccess(false);
  };

  // Medicine Autocomplete Logic
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
      dose: med.strengths.length === 1 ? med.strengths[0] : '', // Auto-select if only 1
      frequency: '',
      duration: '',
      instructions: '',
      available_strengths: med.strengths,
      available_frequencies: med.frequencies,
      available_durations: med.durations,
      available_instructions: med.instructions
    };
    
    setCurrentPrescription([newMed, ...currentPrescription]); // Add to top
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
        setPdfModalVisible(false);
        setSaveSuccess(false);
        setSelectedPatient(null);
      }, 2000);

    } catch (error) {
      console.error("Failed to save prescription:", error);
    }
    setIsSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* HEADER & PATIENT SEARCH */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prescription</Text>
        
        {!selectedPatient && (
          <View style={styles.searchContainer}>
            <Search size={20} color="#94a3b8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by Patient Name, PID, or Phone..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handlePatientSearch}
            />
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* PATIENT SEARCH RESULTS */}
        {!selectedPatient && searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map(p => (
              <TouchableOpacity key={p.id} style={styles.searchItem} onPress={() => handleSelectPatient(p)}>
                <Text style={styles.searchItemName}>{p.full_name}</Text>
                <Text style={styles.searchItemMeta}>{p.patient_id || `PID-${p.id}`} • {p.implant_site || 'Consultation'}</Text>
                <ChevronRight size={16} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* WORKSPACE ACTIVE */}
        {selectedPatient && (
          <View>
            
            {/* SELECTED PATIENT CARD */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.patientName}>{selectedPatient.full_name}</Text>
                  <Text style={styles.patientMeta}>
                    {selectedPatient.patient_id || `PID-${selectedPatient.id}`} • {selectedPatient.age || 32} Y • {selectedPatient.gender || 'Male'}
                  </Text>
                  <Text style={styles.patientSite}>{selectedPatient.implant_site || 'Consultation'}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPatient(null)} style={styles.clearBtn}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.clinicalSummaryRow}>
                <View style={styles.summaryBadge}><Text style={styles.summaryBadgeText}>Dr. {user?.full_name || 'Dentist'}</Text></View>
                <View style={styles.summaryBadge}><Text style={styles.summaryBadgeText}>Visit: {new Date().toLocaleDateString()}</Text></View>
                <View style={[styles.summaryBadge, {backgroundColor: '#dcfce7'}]}><Text style={[styles.summaryBadgeText, {color: '#166534'}]}>Under Treatment</Text></View>
              </View>
            </View>

            {/* MEDICINE SEARCH (AUTOCOMPLETE) */}
            <Text style={styles.sectionTitle}>Add Medication</Text>
            <View style={{ zIndex: 10, position: 'relative', marginBottom: 24 }}>
              <View style={[styles.searchContainer, { backgroundColor: '#ffffff', borderColor: '#cbd5e1' }]}>
                <Search size={20} color="#64748b" />
                <TextInput 
                  testID="medication-search-input"
                  style={styles.searchInput}
                  placeholder="Search Medicine... (e.g. Amo)"
                  placeholderTextColor="#94a3b8"
                  value={medSearchQuery}
                  onChangeText={handleMedSearch}
                  autoCorrect={false}
                />
                {medSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setMedSearchQuery(''); setMedSuggestions([]); }}>
                    <X size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* AUTOCOMPLETE DROPDOWN */}
              {medSuggestions.length > 0 && (
                <View style={styles.autocompleteDropdown}>
                  {medSuggestions.slice(0, 5).map((m, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={[styles.autocompleteItem, i === Math.min(medSuggestions.length, 5) - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => handleSelectMedicine(m)}
                    >
                      <Text style={styles.autocompleteItemText}>{m.name} {m.strengths.length === 1 ? m.strengths[0] : ''}</Text>
                      <Text style={styles.autocompleteItemSub}>
                        {m.category} • {m.form}
                        {m.strengths.length > 1 ? ` • ${m.strengths.join(', ')}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {medSuggestions.length > 5 && (
                    <View style={styles.autocompleteMore}>
                      <Text style={styles.autocompleteMoreText}>+{medSuggestions.length - 5} more... keep typing</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* CURRENT PRESCRIPTION BUILDER */}
            {currentPrescription.length > 0 && <Text style={styles.sectionTitle}>Prescription Details</Text>}
            
            {currentPrescription.map((med, index) => (
              <View key={med.id} style={styles.medBuilderCard}>
                <View style={styles.medHeader}>
                  <Text style={styles.medName}>{index + 1}. {med.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveMedicine(med.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.builderFormRow}>
                  <CustomDropdown 
                    label="Strength" 
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
                
                <View style={styles.builderFormRow}>
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
                
                {/* Optional Custom Notes */}
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                  <TextInput 
                    style={styles.builderTextInput}
                    placeholder="e.g. Take with milk"
                    placeholderTextColor="#cbd5e1"
                    onChangeText={(val) => handleUpdateMedicine(med.id, 'instructions', val)}
                  />
                </View>
              </View>
            ))}

            {/* CLINICAL ADVICE */}
            <Text style={styles.sectionTitle}>Clinical Advice</Text>
            <View style={styles.instructionsGrid}>
              {DENTAL_ADVICE.map(adv => (
                <TouchableOpacity 
                  key={adv} 
                  style={[styles.instructionChip, selectedAdvice.includes(adv) && styles.instructionChipActive]}
                  onPress={() => toggleAdvice(adv)}
                >
                  <Text style={[styles.instructionChipText, selectedAdvice.includes(adv) && styles.instructionChipTextActive]}>
                    {adv}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* FOLLOW UP */}
            <Text style={styles.sectionTitle}>Next Follow-up</Text>
            <View style={styles.followUpCard}>
              <Text style={styles.inputLabel}>Review In (Days)</Text>
              <TextInput style={styles.builderTextInput} value={followUpDays} onChangeText={setFollowUpDays} keyboardType="numeric" />
            </View>

            {/* PRESCRIPTION SUMMARY */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryBoxTitle}>Prescription Summary</Text>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Patient:</Text><Text style={styles.summaryVal}>{selectedPatient.full_name}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Medicines:</Text><Text style={styles.summaryVal}>{currentPrescription.length}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Follow-up:</Text><Text style={styles.summaryVal}>In {followUpDays} Days</Text></View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Advice:</Text>
                <Text style={styles.summaryVal}>{selectedAdvice.length > 0 ? selectedAdvice.join(', ') : 'None'}</Text>
              </View>
            </View>

            {/* GENERATE PDF BUTTON */}
            <TouchableOpacity 
              style={[styles.generateBtn, currentPrescription.length === 0 && { opacity: 0.5 }]} 
              onPress={() => setPdfModalVisible(true)}
              disabled={currentPrescription.length === 0}
            >
              <FileText size={20} color="#ffffff" />
              <Text style={styles.generateBtnText}>Generate PDF & Save</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        )}
      </ScrollView>

      {/* PDF GENERATION MODAL */}
      <Modal visible={pdfModalVisible} animationType="slide">
        <SafeAreaView style={styles.pdfModalContainer}>
          <View style={styles.pdfHeader}>
            <TouchableOpacity onPress={() => setPdfModalVisible(false)}><X size={24} color="#1e293b" /></TouchableOpacity>
            <Text style={styles.pdfHeaderTitle}>Prescription Preview</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.pdfScrollView} contentContainerStyle={styles.pdfPaper}>
            <View style={styles.pdfDocument}>
              <View style={styles.pdfDocHeader}>
                <Text style={styles.pdfClinicName}>DentPulse Advanced Clinic</Text>
                <Text style={styles.pdfDocName}>Dr. {user?.full_name || 'Dentist'}</Text>
                <Text style={styles.pdfDocReg}>Reg No: DCI-58493</Text>
                <Text style={styles.pdfClinicAddress}>123 Health Avenue, Medical District</Text>
              </View>

              <View style={styles.pdfDivider} />

              <View style={styles.pdfPatientInfo}>
                <View>
                  <Text style={styles.pdfLabel}>Patient Name:</Text>
                  <Text style={styles.pdfValue}>{selectedPatient?.full_name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pdfLabel}>Date:</Text>
                  <Text style={styles.pdfValue}>{new Date().toLocaleDateString()}</Text>
                </View>
              </View>

              <Text style={styles.pdfRxMark}>Rx</Text>
              
              <View style={styles.pdfTable}>
                {currentPrescription.map((m, i) => (
                  <View key={i} style={styles.pdfTableRow}>
                    <Text style={styles.pdfTableNum}>{i + 1}.</Text>
                    <View style={styles.pdfTableContent}>
                      <Text style={styles.pdfMedName}>{m.name} {m.dose}</Text>
                      <Text style={styles.pdfMedDesc}>{m.frequency} — For {m.duration}</Text>
                      <Text style={styles.pdfMedInst}>Note: {m.instructions}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {selectedAdvice.length > 0 && (
                <View style={styles.pdfAdviceSection}>
                  <Text style={styles.pdfAdviceTitle}>Dental Advice:</Text>
                  {selectedAdvice.map((adv, i) => (
                    <Text key={i} style={styles.pdfAdviceText}>• {adv}</Text>
                  ))}
                </View>
              )}

              <View style={styles.pdfFooter}>
                <Text style={styles.pdfAdviceTitle}>Next Visit: In {followUpDays} Days</Text>
                <View style={styles.pdfSignatureBox}>
                  <Text style={styles.pdfSignatureLine}>Signature</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.pdfActionRow}>
            <TouchableOpacity style={styles.pdfActionBtnSecondary}>
              <Printer size={20} color="#3b82f6" />
              <Text style={styles.pdfActionBtnSecondaryText}>Print</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.pdfActionBtnPrimary} onPress={handleSavePrescription} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Download size={20} color="#fff" />
                  <Text style={styles.pdfActionBtnPrimaryText}>{saveSuccess ? 'Saved & Synced!' : 'Save & Download PDF'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  scrollContent: { padding: 16 },
  
  searchResults: { backgroundColor: '#ffffff', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  searchItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  searchItemName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1e293b' },
  searchItemMeta: { fontSize: 13, color: '#64748b', marginRight: 10 },
  
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  patientName: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  patientMeta: { fontSize: 13, color: '#475569', marginBottom: 2 },
  patientSite: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  clearBtn: { padding: 4 },
  clinicalSummaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  summaryBadgeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Autocomplete
  autocompleteDropdown: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, zIndex: 20 },
  autocompleteItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  autocompleteItemText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  autocompleteItemSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  autocompleteMore: { padding: 10, alignItems: 'center', backgroundColor: '#f8fafc', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  autocompleteMoreText: { fontSize: 12, fontWeight: '600', color: '#3b82f6' },

  // Med Builder
  medBuilderCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  medName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  deleteText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  builderFormRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inputCol: { flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  builderTextInput: { backgroundColor: '#f8fafc', height: 44, borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  
  // Dropdown
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', height: 44, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  dropdownBtnText: { fontSize: 14, color: '#1e293b' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { backgroundColor: '#ffffff', width: '80%', borderRadius: 12, padding: 16, maxHeight: 400 },
  dropdownMenuTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemActive: { backgroundColor: '#eff6ff' },
  dropdownItemText: { fontSize: 15, color: '#1e293b' },
  dropdownItemTextActive: { fontWeight: '700', color: '#2563eb' },
  
  instructionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  instructionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  instructionChipActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  instructionChipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  instructionChipTextActive: { color: '#ffffff' },
  
  followUpCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  
  summaryBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  summaryBoxTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  summaryVal: { fontSize: 13, fontWeight: '600', color: '#1e293b', maxWidth: '60%', textAlign: 'right' },
  
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 12, gap: 10 },
  generateBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  
  pdfModalContainer: { flex: 1, backgroundColor: '#e2e8f0' },
  pdfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#ffffff' },
  pdfHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  pdfScrollView: { flex: 1 },
  pdfPaper: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  pdfDocument: { width: '100%', maxWidth: 500, backgroundColor: '#ffffff', minHeight: 600, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  pdfDocHeader: { alignItems: 'center', marginBottom: 20 },
  pdfClinicName: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  pdfDocName: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 2 },
  pdfDocReg: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  pdfClinicAddress: { fontSize: 11, color: '#64748b' },
  pdfDivider: { height: 1, backgroundColor: '#000000', marginVertical: 16 },
  pdfPatientInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  pdfLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  pdfValue: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  pdfRxMark: { fontSize: 28, fontWeight: '800', color: '#0f172a', fontStyle: 'italic', marginBottom: 16 },
  pdfTable: { marginBottom: 24 },
  pdfTableRow: { flexDirection: 'row', marginBottom: 16 },
  pdfTableNum: { width: 24, fontSize: 14, fontWeight: '700', color: '#0f172a' },
  pdfTableContent: { flex: 1 },
  pdfMedName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  pdfMedDesc: { fontSize: 13, color: '#475569', marginBottom: 2 },
  pdfMedInst: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  pdfAdviceSection: { marginBottom: 32 },
  pdfAdviceTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  pdfAdviceText: { fontSize: 12, color: '#475569', marginBottom: 4 },
  pdfFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40 },
  pdfSignatureBox: { width: 120, borderTopWidth: 1, borderTopColor: '#000', alignItems: 'center', paddingTop: 8 },
  pdfSignatureLine: { fontSize: 12, color: '#000' },
  pdfActionRow: { flexDirection: 'row', padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 12 },
  pdfActionBtnSecondary: { flex: 1, flexDirection: 'row', height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 12, gap: 8 },
  pdfActionBtnSecondaryText: { fontSize: 15, fontWeight: '700', color: '#3b82f6' },
  pdfActionBtnPrimary: { flex: 2, flexDirection: 'row', height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3b82f6', borderRadius: 12, gap: 8 },
  pdfActionBtnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  pdfActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, backgroundColor: '#eff6ff', borderRadius: 12 },
  pdfActionText: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#2563eb' }
});

export default PrescriptionWorkspace;
