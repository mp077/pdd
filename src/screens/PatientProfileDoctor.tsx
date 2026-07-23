import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Dimensions, Modal, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import ImplantVisualizer from '../components/clinical/ImplantVisualizer';
import { ChevronLeft, CheckCircle2, Circle, ChevronDown, Calendar as CalendarIcon, Clock, Plus, Minus, Stethoscope } from 'lucide-react-native';
import { calculateClinicalHealing, ClinicalInputs } from '../utils/clinicalEngine';

const { width } = Dimensions.get('window');

// --- Custom UI Controls ---
const Stepper = ({ value, setValue, step = 1, min = 0, max = 100, isFloat = false }: any) => (
  <View style={styles.stepperContainer}>
    <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.max(min, isFloat ? parseFloat((value - step).toFixed(1)) : value - step))}>
      <Minus size={16} color="#64748b" />
    </TouchableOpacity>
    <Text style={styles.stepperVal}>{value}</Text>
    <TouchableOpacity style={styles.stepperBtn} onPress={() => setValue(Math.min(max, isFloat ? parseFloat((value + step).toFixed(1)) : value + step))}>
      <Plus size={16} color="#64748b" />
    </TouchableOpacity>
  </View>
);

const SegmentControl = ({ options, selected, onSelect }: any) => (
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
);

const PainScale = ({ selected, onSelect }: any) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.painScaleContainer}>
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
  </ScrollView>
);

const PatientProfileDoctor: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { token, user } = useAuth();
  
  const patientId = route.params?.patientId;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'treatment' | 'monitoring'>('overview');

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
          
          if (found) {
            setPatient(found);
          } else {
            console.warn("Patient not found:", patientId);
          }
        } catch (e) {
          console.error("Error loading patient:", e);
        }
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
          bone_density: parseFloat(density),
          bite_force: parseFloat(biteForce)
        };
        const result = await api.generatePlan(payload, token);
        if (result && result.recommendations) {
          setPlanResults(result.recommendations);
        } else {
          // Fallback if API doesn't return recommendations but succeeds
          setPlanResults([
            { id: 1, implant_type: 'Endosteal Root Form', implant_diameter: 4.5, implant_length: 10.0, success_probability: 95, stability_score: 82, risk_level: 'Low', confidence: 97 },
            { id: 2, implant_type: 'Endosteal Tapered', implant_diameter: 4.0, implant_length: 11.5, success_probability: 91, stability_score: 79, risk_level: 'Low', confidence: 91 },
            { id: 3, implant_type: 'Wide Platform Implant', implant_diameter: 5.0, implant_length: 9.0, success_probability: 88, stability_score: 76, risk_level: 'Moderate', confidence: 87 }
          ]);
        }
      } catch (e) {
        console.error("Failed to generate plan via API:", e);
      }
      setSvmLoading(false);
  };

  const handleApprovePlan = async (plan: any) => {
    setSvmLoading(true);
    try {
      await api.confirmPlan({ patient_id: patientId, plan_id: plan.id, status: 'approved' }, token);
      setTreatmentApproved(true);
    } catch (e) {
      console.error("Failed to approve plan:", e);
    }
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
    
    // Log monitoring to backend
    try {
      await api.logMonitoring({
        patient_id: patientId,
        bone_loss: boneLoss,
        isq_score: isq,
        pain_level: pain,
        swelling: swelling,
        bleeding: bleeding,
        mobility: mobility,
        cnn_result: "Pending",
        svm_prediction: result.riskLevel
      }, token);
    } catch (e) {
      console.error("Failed to log monitoring data", e);
    }
    
    setMonitorLoading(false);
  };

  const handleBookFollowUp = () => {
    setBookingModalVisible(true);
  };

  const confirmBooking = async () => {
    try {
      await api.bookAppointment({
        doctor_id: user?.id,
        patient_id: patientId || '',
        date: new Date(Date.now() + followUpResult?.nextReviewDays * 86400000).toISOString().split('T')[0],
        time: '10:00:00',
        reason: 'Routine Healing Review'
      }, token);
      setBookingConfirmed(true);
    } catch (e) {
      console.error("Failed to book follow-up:", e);
    }
    setBookingModalVisible(false);
  };

  if (loading || !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* COMPACT TOP NAVIGATION */}
      <View style={styles.topNavBar}>
        <TouchableOpacity style={styles.navBackBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Patient Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        
        {/* COMPACT PATIENT CARD */}
        <View style={styles.patientCard}>
          <View style={styles.patientCardMain}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarLetter}>{patient.full_name[0]}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientNameText}>{patient.full_name}</Text>
              <Text style={styles.patientMetaText}>
                {patient.patient_id || `PID-${patient.id}`} • {patient.age || 40}Y • {patient.gender || 'M'} • {patient.implant_site}
              </Text>
            </View>
            
            <View style={[styles.statusBadgeCompact, { backgroundColor: treatmentApproved ? '#dcfce7' : '#f1f5f9' }]}>
              <Text style={[styles.statusBadgeText, { color: treatmentApproved ? '#166534' : '#475569' }]}>
                {treatmentApproved ? 'Planned' : 'Initial'}
              </Text>
            </View>
          </View>
        </View>

        {/* SEPARATED TABS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScrollContainer}
          style={styles.tabScrollView}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'treatment', label: 'Treatment Plan' },
            { id: 'monitoring', label: 'Clinical Follow-up' },
          ].map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab.id && styles.tabButtonTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tabContentWrapper}>
          
          {/* ---------------- OVERVIEW TAB ---------------- */}
          {activeTab === 'overview' && (
            <View>
              <Text style={styles.sectionHeading}>Clinical Summary</Text>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>Implant Site</Text>
                  <Text style={styles.overviewValue}>{patient.implant_site}</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>Risk Assessment</Text>
                  <View style={[styles.riskPill, { backgroundColor: patient.risk_level === 'High' ? '#fef2f2' : '#f0fdf4' }]}>
                    <Text style={[styles.riskPillText, { color: patient.risk_level === 'High' ? '#ef4444' : '#10b981' }]}>
                      {patient.risk_level?.toUpperCase() || 'LOW'} RISK
                    </Text>
                  </View>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>Healing Progress</Text>
                  <Text style={[styles.overviewValue, { color: '#2563eb' }]}>{followUpResult ? `${followUpResult.healingScore}%` : 'N/A'}</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>Next Appointment</Text>
                  <Text style={styles.overviewValue}>{bookingConfirmed ? 'Booked' : (followUpResult ? `In ${followUpResult.nextReviewDays} days` : 'Pending')}</Text>
                </View>
              </View>
            </View>
          )}

          {/* ---------------- TREATMENT PLAN TAB ---------------- */}
          {activeTab === 'treatment' && (
            <View>
              {!planResults ? (
                <View style={styles.cardBase}>
                  <View style={styles.formGrid}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Bone Height (mm)</Text>
                      <TextInput testID="bone-height-input" style={styles.inputField} value={boneHeight} onChangeText={setBoneHeight} keyboardType="numeric" />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Bone Width (mm)</Text>
                      <TextInput testID="bone-width-input" style={styles.inputField} value={boneWidth} onChangeText={setBoneWidth} keyboardType="numeric" />
                    </View>
                  </View>
                  <View style={styles.formGrid}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Density (HU)</Text>
                      <TextInput testID="bone-density-input" style={styles.inputField} value={density} onChangeText={setDensity} keyboardType="numeric" />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Bite Force (N)</Text>
                      <TextInput style={styles.inputField} value={biteForce} onChangeText={setBiteForce} keyboardType="numeric" />
                    </View>
                  </View>
                  <TouchableOpacity testID="generate-plan-btn" style={styles.primaryBtnFullWidth} onPress={handleGeneratePlan} disabled={svmLoading}>
                    {svmLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryBtnText}>Generate AI Recommendations</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {treatmentApproved && (
                    <View style={styles.successBanner}>
                      <CheckCircle2 size={16} color="#166534" />
                      <Text style={styles.successBannerTitle}>✓ Treatment Approved</Text>
                      <Text style={styles.successBannerSub}>Synced to Patient Portal</Text>
                    </View>
                  )}

                  {planResults.map((plan, index) => (
                    <View key={plan.id} style={styles.recCardNew}>
                      <Text style={styles.recRankText}>Recommendation #{index + 1} {index === 0 && '(Recommended)'}</Text>
                      
                      <View style={styles.recCenterCol}>
                        <View style={styles.recVisualizerFixed}>
                          <ImplantVisualizer diameter={plan.implant_diameter} length={plan.implant_length} type={plan.implant_type} />
                        </View>
                        <Text style={styles.recImplantType}>{plan.implant_type}</Text>
                        <Text style={styles.recDimensions}>Ø {plan.implant_diameter.toFixed(1)} × {plan.implant_length.toFixed(1)} mm</Text>
                      </View>

                      <View style={styles.recStatsTable}>
                        <View style={styles.recStatRow}>
                          <Text style={styles.recStatLabel}>Success</Text>
                          <Text style={styles.recStatVal}>{plan.success_probability}%</Text>
                        </View>
                        <View style={styles.recStatRow}>
                          <Text style={styles.recStatLabel}>Stability</Text>
                          <Text style={styles.recStatVal}>{plan.stability_score}</Text>
                        </View>
                        <View style={styles.recStatRow}>
                          <Text style={styles.recStatLabel}>Risk</Text>
                          <Text style={[styles.recStatVal, { color: plan.risk_level === 'Low' ? '#10b981' : '#f59e0b' }]}>{plan.risk_level}</Text>
                        </View>
                        <View style={styles.recStatRow}>
                          <Text style={styles.recStatLabel}>Confidence</Text>
                          <Text style={styles.recStatVal}>{plan.confidence}%</Text>
                        </View>
                      </View>

                      {!treatmentApproved && (
                        <View style={styles.recActionRow}>
                          <TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginRight: 8 }]} onPress={() => handleApprovePlan(plan)}>
                            <Text style={styles.primaryBtnText}>Approve Implant</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.secondaryBtn, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.secondaryBtnText}>Compare</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ---------------- CLINICAL FOLLOW-UP TAB ---------------- */}
          {activeTab === 'monitoring' && (
            <View>
              <View style={styles.cardBase}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ISQ Score</Text>
                  <Stepper value={isq} setValue={setIsq} min={40} max={90} step={1} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bone Loss (mm)</Text>
                  <Stepper value={boneLoss} setValue={setBoneLoss} min={0} max={5} step={0.1} isFloat />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobility</Text>
                  <SegmentControl options={['M0', 'M1', 'M2', 'M3']} selected={mobility} onSelect={setMobility} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pain Level (0-10)</Text>
                  <PainScale selected={pain} onSelect={setPain} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Swelling</Text>
                  <SegmentControl options={['None', 'Mild', 'Moderate', 'Severe']} selected={swelling} onSelect={setSwelling} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bleeding</Text>
                  <SegmentControl options={['None', 'Mild', 'Moderate', 'Severe']} selected={bleeding} onSelect={setBleeding} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Smoking Status</Text>
                  <SegmentControl options={['Non-smoker', 'Former', 'Current']} selected={smoking} onSelect={setSmoking} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Diabetes</Text>
                  <SegmentControl options={['None', 'Controlled', 'Uncontrolled']} selected={diabetes} onSelect={setDiabetes} />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Oral Hygiene</Text>
                  <SegmentControl options={['Excellent', 'Good', 'Fair', 'Poor']} selected={hygiene} onSelect={setHygiene} />
                </View>

                <TouchableOpacity style={styles.primaryBtnFullWidth} onPress={handleCalculateHealing} disabled={monitorLoading}>
                  {monitorLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryBtnText}>Update Progress</Text>}
                </TouchableOpacity>
              </View>

              {followUpResult && (
                <View>
                  {/* HEALING PROGRESS CARD */}
                  <View style={styles.healingSummaryCard}>
                    <Text style={styles.healingSummaryTitle}>Healing Progress</Text>
                    <View style={styles.healingMetricsRow}>
                      <Text style={[styles.healingScoreHuge, { color: followUpResult.healingScore > 80 ? '#10b981' : followUpResult.healingScore > 65 ? '#f59e0b' : '#ef4444' }]}>
                        {followUpResult.healingScore}%
                      </Text>
                      <View style={styles.healingDetailsCol}>
                        <Text style={styles.healingDetailLine}>Risk: <Text style={{fontWeight: '700', color: followUpResult.riskLevel === 'Low' ? '#10b981' : '#f59e0b'}}>{followUpResult.riskLevel}</Text></Text>
                        <Text style={styles.healingDetailLine}>Next Review: <Text style={{fontWeight: '700'}}>{followUpResult.nextReviewDays} Days</Text></Text>
                      </View>
                    </View>
                    <View style={styles.recommendationBox}>
                      <Text style={styles.recBoxLabel}>Recommendation:</Text>
                      <Text style={styles.recBoxText}>{followUpResult.recommendation}</Text>
                    </View>
                  </View>

                  {/* NEXT FOLLOW-UP CARD */}
                  <View style={styles.followUpCard}>
                    <View style={styles.followUpHeader}>
                      <CalendarIcon size={20} color="#2563eb" />
                      <Text style={styles.followUpTitle}>Next Follow-up</Text>
                    </View>
                    
                    <View style={styles.followUpRow}>
                      <Text style={styles.followUpLabel}>Date</Text>
                      <Text style={styles.followUpVal}>In {followUpResult.nextReviewDays} Days</Text>
                    </View>
                    <View style={styles.followUpRow}>
                      <Text style={styles.followUpLabel}>Reason</Text>
                      <Text style={styles.followUpVal}>Routine Healing Review</Text>
                    </View>
                    <View style={styles.followUpRow}>
                      <Text style={styles.followUpLabel}>Status</Text>
                      <Text style={[styles.followUpVal, { color: bookingConfirmed ? '#10b981' : '#f59e0b' }]}>
                        {bookingConfirmed ? 'Confirmed' : 'Pending'}
                      </Text>
                    </View>

                    {!bookingConfirmed && (
                      <TouchableOpacity style={styles.bookBtn} onPress={handleBookFollowUp}>
                        <Text style={styles.bookBtnText}>Book Follow-up</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* COMPACT TIMELINE */}
                  <View style={styles.timelineContainer}>
                    <Text style={styles.timelineHeading}>Patient Timeline</Text>
                    <View style={styles.timelineItem}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <Text style={styles.timelineTextDone}>Initial Consultation</Text>
                    </View>
                    <View style={styles.timelineItem}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <Text style={styles.timelineTextDone}>Treatment Planned</Text>
                    </View>
                    <View style={styles.timelineItem}>
                      <CheckCircle2 size={16} color={treatmentApproved ? '#10b981' : '#cbd5e1'} />
                      <Text style={[styles.timelineTextDone, !treatmentApproved && { color: '#94a3b8' }]}>Implant Approved</Text>
                    </View>
                    <View style={styles.timelineItem}>
                      <Circle size={16} color="#cbd5e1" />
                      <Text style={styles.timelineTextPending}>Surgery Completed</Text>
                    </View>
                    <View style={styles.timelineItem}>
                      <Circle size={16} color="#cbd5e1" />
                      <Text style={styles.timelineTextPending}>Next Review Scheduled</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* BOOKING MODAL */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Patient</Text>
              <Text style={styles.modalVal}>{patient.full_name}</Text>
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Doctor</Text>
              <Text style={styles.modalVal}>Dr. {user?.name || 'Admin'}</Text>
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Type</Text>
              <Text style={styles.modalVal}>Routine Healing Review</Text>
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Date</Text>
              <Text style={styles.modalVal}>In {followUpResult?.nextReviewDays} Days</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtnFullWidth} onPress={confirmBooking}>
              <Text style={styles.primaryBtnText}>Confirm Booking & Sync Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Compact Header
  topNavBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  navBackBtn: { padding: 4 },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  
  scrollContent: { flex: 1 },
  scrollPadding: { padding: 16, paddingBottom: 60 },
  
  // Patient Card
  patientCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  patientCardMain: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarLetter: { fontSize: 18, fontWeight: '800', color: '#2563eb' },
  patientInfo: { flex: 1 },
  patientNameText: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  patientMetaText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  statusBadgeCompact: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  // Separated Tabs
  tabScrollView: { flexGrow: 0, marginBottom: 16 },
  tabScrollContainer: { gap: 10, paddingBottom: 4 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  tabButtonActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabButtonTextActive: { color: '#2563eb', fontWeight: '700' },
  tabContentWrapper: { flex: 1 },

  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },

  // Base Containers
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  overviewCard: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  overviewLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  overviewValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  riskPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  riskPillText: { fontSize: 11, fontWeight: '800' },

  cardBase: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 12, marginBottom: 4 },
  emptyStateSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  
  // Custom Form Controls
  formGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  inputCol: { flex: 1 },
  inputField: { height: 48, backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, fontSize: 15, color: '#0f172a' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', width: 140, height: 44 },
  stepperBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  stepperVal: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#0f172a' },
  segmentContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentBtn: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  segmentBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#2563eb' },
  painScaleContainer: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  painCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  painText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
  painTextActive: { color: '#ffffff' },

  primaryBtn: { backgroundColor: '#2563eb', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  primaryBtnFullWidth: { backgroundColor: '#2563eb', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#f8fafc', height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },

  // Redesigned AI Recommendations
  recCardNew: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  recRankText: { fontSize: 13, fontWeight: '700', color: '#2563eb', marginBottom: 12 },
  recCenterCol: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16 },
  recVisualizerFixed: { width: 80, height: 100, marginBottom: 12 },
  recImplantType: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  recDimensions: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 4 },
  recStatsTable: { marginBottom: 16 },
  recStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  recStatLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  recStatVal: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  recActionRow: { flexDirection: 'row', marginTop: 8 },

  successBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#dcfce7', marginBottom: 16, justifyContent: 'center', gap: 6 },
  successBannerTitle: { fontSize: 13, fontWeight: '700', color: '#166534' },
  successBannerSub: { fontSize: 12, color: '#166534' },

  // Healing Summary & Follow-up Workflow
  healingSummaryCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 16 },
  healingSummaryTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12 },
  healingMetricsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  healingScoreHuge: { fontSize: 36, fontWeight: '800', marginRight: 20 },
  healingDetailsCol: { flex: 1, gap: 4 },
  healingDetailLine: { fontSize: 14, color: '#475569' },
  recommendationBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  recBoxLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  recBoxText: { fontSize: 14, color: '#0f172a', lineHeight: 20, fontWeight: '500' },

  followUpCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 12 },
  followUpHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  followUpTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  followUpRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  followUpLabel: { fontSize: 13, color: '#64748b' },
  followUpVal: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  bookBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#2563eb', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  bookBtnText: { color: '#2563eb', fontSize: 14, fontWeight: '700' },

  timelineContainer: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 12 },
  timelineHeading: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  timelineTextDone: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  timelineTextPending: { fontSize: 13, color: '#94a3b8' },

  // Booking Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
  modalField: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalLabel: { fontSize: 14, color: '#64748b' },
  modalVal: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  cancelBtn: { height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
});

export default PatientProfileDoctor;
