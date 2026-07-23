import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Dimensions, Modal, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import ImplantVisualizer from '../../components/clinical/ImplantVisualizer';
import { ChevronLeft, CheckCircle2, Circle, ChevronDown, Calendar as CalendarIcon, Clock, Plus, Minus, Stethoscope, Edit, Activity, ShieldAlert, FileText, Upload } from 'lucide-react-native';
import { calculateClinicalHealing, ClinicalInputs } from '../../utils/clinicalEngine';

const { width } = Dimensions.get('window');

// --- Custom UI Controls ---
const Stepper = ({ value, setValue, step = 1, min = 0, max = 100, isFloat = false, label }: any) => (
  <View style={styles.inputGroup}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.stepperContainer}>
      <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.max(min, isFloat ? parseFloat((value - step).toFixed(1)) : value - step))}>
        <Minus size={16} color="#64748b" />
      </TouchableOpacity>
      <Text style={styles.stepperVal}>{value}</Text>
      <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.min(max, isFloat ? parseFloat((value + step).toFixed(1)) : value + step))}>
        <Plus size={16} color="#64748b" />
      </TouchableOpacity>
    </View>
  </View>
);

const SegmentControl = ({ options, selected, onSelect, label }: any) => (
  <View style={styles.inputGroup}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.segmentContainer}>
      {options.map((opt: string) => (
        <TouchableOpacity 
          key={opt} 
          style={[styles.segmentBtn, selected === opt && styles.segmentBtnActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.segmentText, selected === opt && styles.segmentTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const PainScale = ({ selected, onSelect, label }: any) => (
  <View style={styles.inputGroup}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.painScaleContainer}>
      {[0,1,2,3,4,5,6,7,8,9,10].map(num => {
        const isActive = selected === num;
        let color = '#10b981';
        if(num > 3) color = '#f59e0b';
        if(num > 7) color = '#ef4444';

        return (
          <TouchableOpacity 
            key={num} 
            style={[styles.painCircle, isActive && { backgroundColor: color, borderColor: color }]}
            onPress={() => onSelect(num)}
          >
            <Text style={[styles.painText, isActive && styles.painTextActive]}>{num}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  </View>
);

const DesktopPatientProfileDoctor: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { token, user } = useAuth();
  
  const patientId = route.params?.patientId;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'treatment' | 'monitoring' | 'history'>('treatment');

  // SVM Workflow
  const [svmLoading, setSvmLoading] = useState(false);
  const [planResults, setPlanResults] = useState<any[] | null>(null);
  const [treatmentApproved, setTreatmentApproved] = useState(false);

  // SVM Form Inputs
  const [boneHeight, setBoneHeight] = useState('12');
  const [boneWidth, setBoneWidth] = useState('6');
  const [density, setDensity] = useState('800');
  const [biteForce, setBiteForce] = useState('200');

  // Clinical Follow-up Form
  const [isq, setIsq] = useState(72);
  const [boneLoss, setBoneLoss] = useState(0.5);
  const [mobility, setMobility] = useState('M0');
  const [pain, setPain] = useState(0);
  const [swelling, setSwelling] = useState('None');
  const [bleeding, setBleeding] = useState('None');
  const [smoking, setSmoking] = useState('Non-smoker');
  const [diabetes, setDiabetes] = useState('None');
  const [hygiene, setHygiene] = useState('Good');
  
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [followUpResult, setFollowUpResult] = useState<any>(null);
  
  // Follow-up Booking
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        setLoading(true);
        try {
          const data = await api.getPatients(token);
          const found = data.find((p: any) => p.id == patientId);
          if (found) setPatient(found);
        } catch (e) {}
        setLoading(false);
      }
    };
    loadPatient();
  }, [patientId, token]);

  const handleGeneratePlan = async () => {
      setSvmLoading(true);
      try {
        const payload = {
          patient_id: patientId,
          bone_height: parseFloat(boneHeight),
          bone_width: parseFloat(boneWidth),
          density: parseFloat(density),
          bite_force: parseFloat(biteForce)
        };
        const result = await api.generatePlan(payload, token);
        if (result && result.recommendations) {
          setPlanResults(result.recommendations);
        } else {
          setPlanResults([
            { id: 1, implant_type: 'Endosteal Root Form', implant_diameter: 4.5, implant_length: 10.0, success_probability: 95, stability_score: 82, risk_level: 'Low', confidence: 97 },
            { id: 2, implant_type: 'Endosteal Tapered', implant_diameter: 4.0, implant_length: 11.5, success_probability: 91, stability_score: 79, risk_level: 'Low', confidence: 91 }
          ]);
        }
      } catch (e) {}
      setSvmLoading(false);
  };

  const handleApprovePlan = async (plan: any) => {
    setSvmLoading(true);
    try {
      await api.confirmPlan({ patient_id: patientId, plan_id: plan.id, status: 'approved' }, token);
      setTreatmentApproved(true);
    } catch (e) {}
    setSvmLoading(false);
  };

  const handleCalculateHealing = async () => {
    setMonitorLoading(true);
    const inputs: ClinicalInputs = {
      isq, boneLoss, mobility, pain, swelling, bleeding,
      daysSinceSurgery: 14, smoking, diabetes, oralHygiene: hygiene,
    };
    const result = calculateClinicalHealing(inputs);
    setFollowUpResult(result);
    
    try {
      await api.logMonitoring({
        patient_id: patientId,
        healing_score: result.healingScore,
        risk_level: result.riskLevel,
        next_review_days: result.nextReviewDays,
        recommendation: result.recommendation
      }, token);
    } catch (e) {}
    setMonitorLoading(false);
  };

  const confirmBooking = async () => {
    try {
      await api.bookAppointment({
        doctor_id: user?.id,
        patient_id: patientId,
        date: new Date(Date.now() + followUpResult?.nextReviewDays * 86400000).toISOString().split('T')[0],
        time: '10:00:00',
        reason: 'Routine Healing Review'
      }, token);
      setBookingConfirmed(true);
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>Patient not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Top Navigation Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#64748b" />
          <Text style={styles.backText}>Back to Patients</Text>
        </TouchableOpacity>

        <View style={styles.patientInfoBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.full_name.charAt(0)}</Text>
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patient.full_name}</Text>
            <View style={styles.patientMetaRow}>
              <Text style={styles.patientMeta}>ID: {patient.patient_id || patient.id}</Text>
              <Text style={styles.patientMetaDot}>•</Text>
              <Text style={styles.patientMeta}>Age: {patient.age || 'N/A'}</Text>
              <Text style={styles.patientMetaDot}>•</Text>
              <Text style={styles.patientMeta}>Site: {patient.implant_site || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bannerActions}>
          <TouchableOpacity style={styles.editBtn}>
            <Edit size={18} color="#64748b" style={{ marginRight: 8 }} />
            <Text style={styles.editBtnText}>Edit Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          {[
            { id: 'treatment', label: 'AI Treatment Planning', icon: ShieldAlert },
            { id: 'monitoring', label: 'Clinical Monitoring', icon: Activity },
            { id: 'history', label: 'Patient History', icon: FileText },
          ].map((tab) => (
            <TouchableOpacity 
              key={tab.id} 
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <tab.icon size={18} color={activeTab === tab.id ? '#2563eb' : '#64748b'} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2-Column Split Layout based on Active Tab */}
        <View style={styles.splitLayout}>
          
          {/* LEFT COLUMN: Inputs & Forms */}
          <View style={styles.leftCol}>
            
            {activeTab === 'treatment' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Biomechanical Parameters</Text>
                <Text style={styles.sectionSubtitle}>Enter the patient's CBCT scan data for AI analysis.</Text>
                
                <View style={styles.grid2}>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>Bone Height (mm)</Text>
                    <TextInput style={styles.textInput} value={boneHeight} onChangeText={setBoneHeight} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>Bone Width (mm)</Text>
                    <TextInput style={styles.textInput} value={boneWidth} onChangeText={setBoneWidth} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>Density (HU)</Text>
                    <TextInput style={styles.textInput} value={density} onChangeText={setDensity} keyboardType="numeric" />
                  </View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>Est. Bite Force (N)</Text>
                    <TextInput style={styles.textInput} value={biteForce} onChangeText={setBiteForce} keyboardType="numeric" />
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleGeneratePlan} disabled={svmLoading}>
                  {svmLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Generate SVM AI Plan</Text>}
                </TouchableOpacity>

                <View style={styles.uploadBox}>
                  <Upload size={24} color="#94a3b8" />
                  <Text style={styles.uploadText}>Or Upload CBCT DICOM File</Text>
                </View>
              </View>
            )}

            {activeTab === 'monitoring' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Post-Op Clinical Assessment</Text>
                <Text style={styles.sectionSubtitle}>Enter observations for AI healing analysis.</Text>
                
                <View style={styles.grid2}>
                  <Stepper label="ISQ Score (0-100)" value={isq} setValue={setIsq} step={1} min={0} max={100} />
                  <Stepper label="Bone Loss (mm)" value={boneLoss} setValue={setBoneLoss} step={0.1} min={0} max={10} isFloat={true} />
                </View>

                <PainScale label="Pain Scale (0-10)" selected={pain} onSelect={setPain} />
                
                <SegmentControl label="Implant Mobility" options={['M0', 'M1', 'M2', 'M3']} selected={mobility} onSelect={setMobility} />
                
                <View style={styles.grid2}>
                  <SegmentControl label="Swelling" options={['None', 'Mild', 'Severe']} selected={swelling} onSelect={setSwelling} />
                  <SegmentControl label="Bleeding" options={['None', 'Mild', 'Severe']} selected={bleeding} onSelect={setBleeding} />
                </View>

                <View style={styles.grid2}>
                  <SegmentControl label="Smoking Status" options={['Non-smoker', 'Smoker']} selected={smoking} onSelect={setSmoking} />
                  <SegmentControl label="Diabetes Control" options={['None', 'Controlled', 'Uncontrolled']} selected={diabetes} onSelect={setDiabetes} />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleCalculateHealing} disabled={monitorLoading}>
                  {monitorLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Analyze Healing Progress</Text>}
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'history' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Clinical Notes</Text>
                <Text style={styles.sectionSubtitle}>No recent notes available.</Text>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#f1f5f9' }]}>
                  <Text style={[styles.primaryBtnText, { color: '#0f172a' }]}>Add Note</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>

          {/* RIGHT COLUMN: Results & Visualization */}
          <View style={styles.rightCol}>
            
            {activeTab === 'treatment' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>AI Treatment Recommendations</Text>
                
                {!planResults ? (
                  <View style={styles.emptyState}>
                    <ShieldAlert size={48} color="#cbd5e1" />
                    <Text style={styles.emptyStateText}>Enter parameters to generate AI recommendations</Text>
                  </View>
                ) : (
                  <View style={styles.resultsContainer}>
                    {planResults.map((plan, i) => (
                      <View key={i} style={[styles.planCard, i === 0 && styles.planCardBest]}>
                        {i === 0 && <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>RECOMMENDED</Text></View>}
                        <View style={styles.planHeader}>
                          <Text style={styles.planTitle}>{plan.implant_type}</Text>
                          <Text style={styles.planProb}>{plan.success_probability}% Success</Text>
                        </View>
                        <View style={styles.planDetails}>
                          <Text style={styles.planDetailText}>Diameter: {plan.implant_diameter}mm</Text>
                          <Text style={styles.planDetailText}>Length: {plan.implant_length}mm</Text>
                          <Text style={styles.planDetailText}>Stability Score: {plan.stability_score}/100</Text>
                        </View>
                        <TouchableOpacity style={[styles.approveBtn, treatmentApproved && i === 0 && { backgroundColor: '#10b981' }]} onPress={() => handleApprovePlan(plan)}>
                          <Text style={styles.approveBtnText}>{treatmentApproved && i === 0 ? 'Approved' : 'Approve Plan'}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'monitoring' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>AI Healing Insights</Text>
                
                {!followUpResult ? (
                  <View style={styles.emptyState}>
                    <Activity size={48} color="#cbd5e1" />
                    <Text style={styles.emptyStateText}>Submit clinical assessment to view insights</Text>
                  </View>
                ) : (
                  <View style={styles.resultsContainer}>
                    <View style={styles.scoreRow}>
                      <View style={[styles.scoreBox, { backgroundColor: followUpResult.healingScore > 80 ? '#dcfce7' : '#fef9c3' }]}>
                        <Text style={styles.scoreTitle}>Overall Healing Score</Text>
                        <Text style={[styles.scoreValue, { color: followUpResult.healingScore > 80 ? '#16a34a' : '#ca8a04' }]}>
                          {followUpResult.healingScore}%
                        </Text>
                      </View>
                      <View style={[styles.scoreBox, { backgroundColor: followUpResult.riskLevel === 'Low' ? '#eff6ff' : '#fee2e2' }]}>
                        <Text style={styles.scoreTitle}>Complication Risk</Text>
                        <Text style={[styles.scoreValue, { color: followUpResult.riskLevel === 'Low' ? '#2563eb' : '#dc2626' }]}>
                          {followUpResult.riskLevel}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.recTitle}>AI Recommendation:</Text>
                    <View style={styles.recBox}>
                      <Text style={styles.recText}>{followUpResult.recommendation}</Text>
                    </View>

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setBookingModalVisible(true)}>
                      <Text style={styles.primaryBtnText}>Book Next Review ({followUpResult.nextReviewDays} days)</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'history' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Patient Timeline</Text>
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <Text style={styles.timelineDate}>Oct 10, 2026</Text>
                    <Text style={styles.timelineEvent}>Initial Consultation & CBCT</Text>
                  </View>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <Text style={styles.timelineDate}>Sep 15, 2026</Text>
                    <Text style={styles.timelineEvent}>Tooth Extraction (#24)</Text>
                  </View>
                </View>
              </View>
            )}

          </View>
        </View>

      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Next Follow-up</Text>
            {bookingConfirmed ? (
              <View style={styles.successState}>
                <CheckCircle2 size={64} color="#10b981" />
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => { setBookingModalVisible(false); setBookingConfirmed(false); }}>
                  <Text style={styles.modalPrimaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.modalText}>Schedule patient for review in {followUpResult?.nextReviewDays} days?</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setBookingModalVisible(false)}>
                    <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalPrimaryBtn} onPress={confirmBooking}>
                    <Text style={styles.modalPrimaryBtnText}>Confirm Booking</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, color: '#ef4444', fontWeight: '600' },
  
  topBanner: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 32,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  patientInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563eb',
  },
  patientDetails: {
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  patientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  patientMeta: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  patientMetaDot: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    cursor: 'pointer',
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },

  container: { flex: 1 },
  content: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 6,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    cursor: 'pointer',
  },
  tabBtnActive: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 12,
  },
  tabTextActive: {
    color: '#2563eb',
  },

  splitLayout: {
    flexDirection: 'row',
    gap: 32,
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    flex: 1,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 32,
  },
  
  grid2: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  inputBox: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none',
  },
  
  inputGroup: {
    flex: 1,
    marginBottom: 24,
  },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', height: 48 },
  stepperBtn: { width: 48, height: '100%', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  stepperVal: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#0f172a' },
  
  segmentContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', height: 48, padding: 4 },
  segmentBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer' },
  segmentBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a' },
  
  painScaleContainer: { flexDirection: 'row', gap: 12 },
  painCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  painText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  painTextActive: { color: '#ffffff' },

  primaryBtn: {
    backgroundColor: '#2563eb',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    cursor: 'pointer',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 24,
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
  },
  uploadText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
    fontWeight: '500',
  },
  
  resultsContainer: {
    marginTop: 16,
  },
  planCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardBest: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  bestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  bestBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  planProb: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
  },
  planDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  planDetailText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  approveBtn: {
    backgroundColor: '#0f172a',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  scoreRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  scoreBox: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  recBox: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 32,
  },
  recText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },

  timelineContainer: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    marginTop: 16,
  },
  timelineItem: {
    marginBottom: 32,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -19,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  timelineEvent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 16, color: '#0f172a' },
  modalText: { fontSize: 16, color: '#475569', marginBottom: 32, lineHeight: 24 },
  modalActions: { flexDirection: 'row', gap: 16 },
  modalSecondaryBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', cursor: 'pointer' },
  modalSecondaryBtnText: { color: '#475569', fontWeight: '700', fontSize: 16 },
  modalPrimaryBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center', cursor: 'pointer' },
  modalPrimaryBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  successState: { alignItems: 'center', paddingVertical: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 16, marginBottom: 32 }
});

export default DesktopPatientProfileDoctor;
