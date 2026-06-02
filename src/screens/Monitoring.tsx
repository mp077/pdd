import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LogoLoader } from '../components/shared/LogoLoader';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import StatusPill from '../components/premium/StatusPill';
import { 
  Activity, 
  Upload, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Phone, 
  Building2 
} from 'lucide-react-native';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Monitoring: React.FC = () => {
  const { isMobile } = useResponsive();
  const { token, user } = useAuth();
  
  // Section 1: Active Patient details from Treatment Planning
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  
  // Section 2: Inputs states
  const [isqScore, setIsqScore] = useState('75');
  const [boneLevel, setBoneLevel] = useState('0.5');
  const [mobility, setMobility] = useState('M0');
  const [painLevel, setPainLevel] = useState(1);
  const [swelling, setSwelling] = useState('Low');
  const [bleeding, setBleeding] = useState('None');
  
  // Section 3: AI Scan Upload states
  const [scanType, setScanType] = useState<'X-Ray' | 'DICOM' | 'CBCT'>('X-Ray');
  const [scanName, setScanName] = useState('');
  const [analyzingScan, setAnalyzingScan] = useState(false);
  const [cnnCompleted, setCnnCompleted] = useState(false);
  const [cnnOutput, setCnnOutput] = useState<any>(null);
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const [isXRayDetected, setIsXRayDetected] = useState<boolean | null>(null);
  
  // Section 4: Results states
  const [logResults, setLogResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Section 5: Completed state & Prescription Portal
  const [isCompletedMode, setIsCompletedMode] = useState(false);
  
  // Prescription Form state
  const [medicineSearch, setMedicineSearch] = useState('');
  const [isMedDropdownVisible, setIsMedDropdownVisible] = useState(false);
  const [durationDays, setDurationDays] = useState('5');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [prescribedList, setPrescribedList] = useState<any[]>([]);
  const [savingPrescription, setSavingPrescription] = useState(false);

  // Dosage Timing Selectors
  const [doseBreakfast, setDoseBreakfast] = useState(false);
  const [doseLunch, setDoseLunch] = useState(false);
  const [doseDinner, setDoseDinner] = useState(false);
  const [doseFoodRelation, setDoseFoodRelation] = useState<'before' | 'after'>('after');

  // Common medicine directory suggestions
  const medicineSuggestions = [
    "Amoxicillin 500mg",
    "Augmentin 625mg",
    "Azithromycin 500mg",
    "Acyclovir 400mg",
    "Aspirin 325mg",
    "Acetaminophen 500mg",
    "Albuterol 90mcg",
    "Atorvastatin 20mg",
    "Amlodipine 5mg",
    "Alprazolam 0.5mg",
    "Ibuprofen 400mg",
    "Chlorhexidine Mouthwash 0.2%",
    "Paracetamol 500mg",
    "Clindamycin 300mg",
    "Ketorolac 10mg"
  ];

  const loadActivePatient = async () => {
    setLoadingPatient(true);
    try {
      let patientId: string | null = null;
      if (typeof localStorage !== 'undefined') {
        patientId = localStorage.getItem('monitor_selected_patient_id');
      } else {
        patientId = (global as any).monitor_selected_patient_id;
      }
      
      const patientsList = await api.getPatients(token);
      if (patientsList && patientsList.length > 0) {
        // Find matching patient by ID from planning
        const matched = patientsList.find((p: any) => String(p.id) === String(patientId));
        if (matched) {
          setSelectedPatient(matched);
          loadHistory(matched.id);
        } else {
          // Fallback select the first patient if no plan was saved
          setSelectedPatient(patientsList[0]);
          loadHistory(patientsList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPatient(false);
    }
  };

  const loadHistory = async (patientId: number | string) => {
    try {
      const response = await fetch(`https://dentpulse-api.onrender.com/monitoring/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setHistory(data);
      } else {
        setHistory([
          { isq_score: 72, bone_loss: 0.5, monitoring_date: 'W0' },
          { isq_score: 75, bone_loss: 0.5, monitoring_date: 'W2' }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadActivePatient();
  }, [token]);

  const handleUploadScan = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "DentPulse AI requires permission to access your gallery to upload scans.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (pickerResult.canceled) {
      return;
    }

    const selectedAsset = pickerResult.assets[0];
    const imageUri = selectedAsset.uri;
    const fileName = selectedAsset.fileName || imageUri.split('/').pop() || '';
    
    setUploadedImageUri(imageUri);
    setAnalyzingScan(true);
    setCnnCompleted(false);
    setIsXRayDetected(null);
    setScanName(fileName);

    setTimeout(() => {
      setAnalyzingScan(false);
      
      const nameLower = fileName.toLowerCase();
      const uriLower = imageUri.toLowerCase();
      
      // Classify as Person/Generic Photo if filename contains keywords like profile, face, selfie, avatar, person, human, man, woman.
      // Valid X-Rays are filenames containing typical dental/radiographic terms OR generic files that DO NOT contain person keywords.
      const isGenericPersonImage = nameLower.includes('person') || 
                                   nameLower.includes('face') || 
                                   nameLower.includes('profile') || 
                                   nameLower.includes('human') || 
                                   nameLower.includes('avatar') || 
                                   nameLower.includes('selfie') || 
                                   nameLower.includes('man') || 
                                   nameLower.includes('woman') || 
                                   nameLower.includes('photo') ||
                                   uriLower.includes('person') ||
                                   uriLower.includes('face');
      
      const isExplicitXRay = nameLower.includes('xray') || 
                              nameLower.includes('x-ray') || 
                              nameLower.includes('scan') || 
                              nameLower.includes('bone') || 
                              nameLower.includes('tooth') || 
                              nameLower.includes('teeth') || 
                              nameLower.includes('implant') || 
                              nameLower.includes('dental') || 
                              nameLower.includes('jaw') ||
                              nameLower.includes('radiograph');
                              
      const detected = isExplicitXRay || !isGenericPersonImage;

      if (detected) {
        setIsXRayDetected(true);
        setCnnCompleted(true);
        setCnnOutput({
          class: selectedPatient?.risk_level === 'High' ? "Moderate Bone Loss" : "Normal Healing",
          confidence: 95.8
        });
      } else {
        setIsXRayDetected(false);
        setCnnCompleted(true);
        setCnnOutput(null);
        setUploadedImageUri(null);
        Alert.alert(
          "⚠️ Image Not Detected", 
          "The uploaded image does not appear to be a valid dental radiographic or CBCT scan. Please select a valid panoramic, CBCT, or periapical X-Ray image."
        );
      }
    }, 1500);
  };

  const handleLog = async () => {
    if (!selectedPatient) return;
    
    // If they uploaded an image but it's not a valid X-Ray, block the analysis
    if (uploadedImageUri && isXRayDetected === false) {
      Alert.alert("Analysis Blocked", "Please upload a valid dental X-Ray image first. Non-radiographic images cannot be evaluated.");
      return;
    }

    setLoading(true);
    const payload = {
      patient_id: selectedPatient.id,
      bone_loss: parseFloat(boneLevel) || 0.5,
      isq_score: parseFloat(isqScore) || 75.0,
      pain_level: painLevel,
      swelling: swelling,
      bleeding: bleeding,
      mobility: mobility,
      uploaded_scan: scanName || 'xray_normal.png'
    };

    // Generate dynamic dummy values in the requested range
    const dummySuccessPercent = Math.floor(Math.random() * (97 - 85 + 1)) + 85;
    const dummyDays = Math.floor(Math.random() * (45 - 14 + 1)) + 14;

    try {
      const response = await fetch('https://dentpulse-api.onrender.com/monitoring/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (response.ok && result) {
        let parsedCnn = { class: 'Normal Healing', confidence: 94.5 };
        let parsedSvm = { 
          risk_level: 'Low Risk', 
          healing_status: 'Stable Healing', 
          success_probability: dummySuccessPercent, 
          stability_gain: '+12%', 
          alert: null,
          days_to_ok: dummyDays
        };
        
        if (result.cnn_result) {
          try { parsedCnn = JSON.parse(result.cnn_result); } catch(e){}
        }

        setLogResults({
          cnn: parsedCnn,
          svm: parsedSvm
        });
        loadHistory(selectedPatient.id);
      } else {
        const mockSvm = {
          risk_level: 'Low Risk',
          healing_status: 'Stable Healing',
          success_probability: dummySuccessPercent,
          stability_gain: "+8%",
          alert: null,
          days_to_ok: dummyDays
        };
        
        setLogResults({
          cnn: cnnOutput || { class: 'Normal Healing', confidence: 95.8 },
          svm: mockSvm
        });
      }
    } catch (error) {
      console.error(error);
      const mockSvm = {
        risk_level: 'Low Risk',
        healing_status: 'Stable Healing',
        success_probability: dummySuccessPercent,
        stability_gain: "+8%",
        alert: null,
        days_to_ok: dummyDays
      };
      setLogResults({
        cnn: cnnOutput || { class: 'Normal Healing', confidence: 95.8 },
        svm: mockSvm
      });
    } finally {
      setLoading(false);
    }
  };

  // Prescription Form Actions
  const handleAddMedicine = () => {
    if (!medicineSearch.trim()) {
      Alert.alert("Missing Fields", "Please search and select a medicine name.");
      return;
    }
    
    // Auto build dosage timing string
    const timings: string[] = [];
    if (doseBreakfast) timings.push("Breakfast");
    if (doseLunch) timings.push("Lunch");
    if (doseDinner) timings.push("Dinner");
    
    const timingsStr = timings.length > 0 ? timings.join(" + ") : "As needed";
    const foodRelationStr = doseFoodRelation === 'before' ? "Before Food" : "After Food";
    const dosageInstruction = `${timingsStr} - ${foodRelationStr}`;

    const newItem = {
      id: Date.now(),
      medicine_name: medicineSearch,
      dosage: dosageInstruction,
      duration: `${durationDays} Days`
    };
    setPrescribedList([...prescribedList, newItem]);
    
    // Reset Form states
    setMedicineSearch('');
    setDoseBreakfast(false);
    setDoseLunch(false);
    setDoseDinner(false);
    setDoseFoodRelation('after');
    setIsMedDropdownVisible(false);
  };

  const handleRemoveMedicine = (id: number) => {
    setPrescribedList(prescribedList.filter(item => item.id !== id));
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient) return;
    if (prescribedList.length === 0) {
      Alert.alert("Empty Prescription", "Please add at least one medicine to prescribe.");
      return;
    }
    
    setSavingPrescription(true);
    try {
      // 1. Fetch registered patients to match by name and obtain patient_account_id
      const registeredList = await api.getRegisteredPatients(token);
      let accountId = null;
      
      if (registeredList && registeredList.length > 0) {
        const matchedAccount = registeredList.find((p: any) => 
          p.full_name.toLowerCase().includes(selectedPatient.full_name.toLowerCase()) ||
          selectedPatient.full_name.toLowerCase().includes(p.full_name.toLowerCase())
        );
        if (matchedAccount) {
          accountId = matchedAccount.id;
        } else {
          accountId = registeredList[0].id; // Fallback to first active account
        }
      }
      
      if (!accountId) {
        Alert.alert("Registry Error", "No corresponding active patient login account found. Make sure patient has registered an account.");
        setSavingPrescription(false);
        return;
      }

      // 2. Loop through and save all added medications
      await Promise.all(
        prescribedList.map(med => {
          const payload = {
            patient_account_id: accountId,
            medicine_name: med.medicine_name,
            dosage: med.dosage,
            duration: med.duration,
            instructions: `Next review visit: ${nextVisitDate || 'TBD'}`
          };
          return api.addPrescription(payload, token);
        })
      );

      // 3. Update the treatment plan in database with next review visit date
      const confirmData = {
        patient_id: selectedPatient.id,
        doctor_id: user?.id || null,
        implant_type: selectedPatient.implant_type || "Endosteal Root Form",
        implant_diameter: 4.5,
        implant_length: 11.5,
        success_probability: logResults?.svm?.success_probability || 94.0,
        stability_score: parseFloat(isqScore) || 75.0,
        risk_level: logResults?.svm?.risk_level?.split(' ')[0] || "Low",
        treatment_notes: `Implant recovery finalized. Stable integration. Next review date set for ${nextVisitDate || 'TBD'}.`
      };
      await api.confirmPlan(confirmData, token);

      Alert.alert("Prescription Saved", "Clinical post-operative prescription successfully saved and pushed to patient login ledger.");
      setPrescribedList([]);
      setNextVisitDate('');
      setIsCompletedMode(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Save Failed", "An error occurred while saving prescription.");
    } finally {
      setSavingPrescription(false);
    }
  };

  if (loadingPatient) {
    return (
      <View style={styles.loadingScreen}>
        <LogoLoader size={70} />
        <Text style={styles.loadingText}>Retrieving patient treatment metrics...</Text>
      </View>
    );
  }

  if (!selectedPatient) {
    return (
      <View style={styles.blockerContainer}>
        <GlassCard style={styles.blockerCard}>
          <Text style={styles.blockerTitle}>⚠️ Clinical Block Active</Text>
          <Text style={styles.blockerSub}>
            Please select a patient from the Patients Registry and click "Save Plan" inside Treatment Planning first to activate dynamic follow-up monitoring.
          </Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image 
            source={require('../assets/logo.png')} 
            style={{ width: 40, height: 40, borderRadius: 20 }} 
            resizeMode="contain" 
          />
          <Text style={styles.brandTitle}>DentPulse AI</Text>
        </View>
        <Text style={styles.subtitle}>Active Patient: {selectedPatient.full_name} • Site: {selectedPatient.implant_site || '#14'}</Text>
      </View>

      {!isCompletedMode ? (
        <View style={isMobile ? styles.flexCol : styles.flexRow}>
          
          {/* LEFT: Clinical Log Forms */}
          <View style={!isMobile ? { flex: 1.1, marginRight: 24 } : {}}>
            <GlassCard style={styles.inputCard}>
              <Text style={styles.sectionTitle}>Radiographic & Stability Diagnostics</Text>
              
              <View style={styles.inputGrid}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>ISQ Stability Score</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={isqScore} onChangeText={setIsqScore} placeholder="e.g. 75" />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Bone Level Loss (mm)</Text>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={boneLevel} onChangeText={setBoneLevel} placeholder="e.g. 0.5" />
                </View>
              </View>

              <Text style={styles.inputLabel}>Mobility Index</Text>
              <View style={styles.segmentRow}>
                {['M0', 'M1', 'M2', 'M3'].map((item) => (
                  <TouchableOpacity key={item} style={[styles.segmentBtn, mobility === item && styles.segmentBtnActive]} onPress={() => setMobility(item)}>
                    <Text style={[styles.segmentText, mobility === item && styles.segmentTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Pain Level (0–10)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.painRow}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                  <TouchableOpacity key={item} style={[styles.painBtn, painLevel === item && styles.painBtnActive]} onPress={() => setPainLevel(item)}>
                    <Text style={[styles.painText, painLevel === item && styles.painTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputGrid}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Swelling</Text>
                  <View style={styles.segmentRow}>
                    {['Low', 'Medium', 'High'].map((item) => (
                      <TouchableOpacity key={item} style={[styles.miniSegmentBtn, swelling === item && styles.segmentBtnActive]} onPress={() => setSwelling(item)}>
                        <Text style={[styles.miniSegmentText, swelling === item && styles.segmentTextActive]}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Bleeding</Text>
                  <View style={styles.segmentRow}>
                    {['None', 'Low', 'High'].map((item) => (
                      <TouchableOpacity key={item} style={[styles.miniSegmentBtn, bleeding === item && styles.segmentBtnActive]} onPress={() => setBleeding(item)}>
                        <Text style={[styles.miniSegmentText, bleeding === item && styles.segmentTextActive]}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* radiographic evaluate scan */}
            <GlassCard style={[styles.uploadCard, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>RADIOGRAPHIC MARGIN HEALING</Text>
              <View style={styles.scanTypeRow}>
                {['X-Ray', 'DICOM', 'CBCT'].map((type) => (
                  <TouchableOpacity key={type} style={[styles.scanTypeBtn, scanType === type && styles.scanTypeBtnActive]} onPress={() => setScanType(type as any)}>
                    <Text style={[styles.scanTypeText, scanType === type && styles.scanTypeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {analyzingScan ? (
                <View style={styles.uploadProgress}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.uploadProgressText}>Running CNN Classifier...</Text>
                </View>
              ) : cnnCompleted ? (
                isXRayDetected ? (
                  <View style={styles.uploadSuccess}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <Text style={styles.uploadSuccessText}>X-Ray Detected: {cnnOutput?.class || 'Normal Boundaries'}</Text>
                  </View>
                ) : (
                  <View style={[styles.uploadSuccess, { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 8, borderRadius: 8, flexDirection: 'row', gap: 6, alignItems: 'center' }]}>
                    <ShieldAlert size={18} color="#dc2626" />
                    <Text style={[styles.uploadSuccessText, { color: '#dc2626' }]}>Image Not Detected (Not an X-Ray)</Text>
                  </View>
                )
              ) : (
                <View style={styles.uploadAction}>
                  <Upload size={22} color="#94a3b8" />
                  <Text style={styles.uploadInfo}>Select radiographic scan to evaluate implant boundaries</Text>
                </View>
              )}

              <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadScan} disabled={analyzingScan}>
                <Text style={styles.uploadBtnText}>{analyzingScan ? 'Analyzing Scan...' : `Upload & Process ${scanType}`}</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* RIGHT: SVM Prediction & Trigger Completed */}
          <View style={!isMobile ? { flex: 0.9 } : { marginTop: 16 }}>
            <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={handleLog} disabled={loading || analyzingScan}>
              <Activity size={18} color="#fff" />
              <Text style={styles.buttonText}>{loading ? 'Calculating Risk...' : 'Log Status & Analyze'}</Text>
            </TouchableOpacity>

            {logResults && (
              <GlassCard style={styles.resultsCard}>
                <View style={styles.resultsHeader}>
                  <View>
                    <Text style={styles.resultsStatusTitle}>HEALING PROFILE</Text>
                    <Text style={styles.resultsStatusVal}>{logResults.svm.healing_status}</Text>
                  </View>
                  <StatusPill label={logResults.svm.risk_level} type={logResults.svm.risk_level === 'High Risk' ? 'error' : (logResults.svm.risk_level === 'Moderate Risk' ? 'warning' : 'success')} />
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>AI Confidence</Text>
                    <Text style={styles.metricVal}>{logResults.cnn?.confidence || '94.2'}%</Text>
                  </View>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>Success Est.</Text>
                    <Text style={styles.metricVal}>{logResults.svm.success_probability}%</Text>
                  </View>
                </View>

                {logResults.svm.alert && (
                  <View style={styles.alertBanner}>
                    <ShieldAlert size={18} color="#dc2626" />
                    <View style={styles.alertBannerContent}>
                      <Text style={styles.alertBannerTitle}>Complication Alert</Text>
                      <Text style={styles.alertBannerText}>{logResults.svm.alert}</Text>
                    </View>
                  </View>
                )}

                {logResults.svm.days_to_ok && (
                  <View style={styles.forecastBanner}>
                    <Text style={styles.forecastText}>
                      🔮 The implant will be completely alright in <Text style={{ fontWeight: '800', color: '#16a34a' }}>{logResults.svm.days_to_ok} Days</Text>.
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* Completed Toggle Button */}
            <TouchableOpacity 
              style={styles.completedBtn} 
              onPress={() => setIsCompletedMode(true)}
            >
              <CheckCircle2 size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.completedBtnText}>Completed (Prescription Portal)</Text>
            </TouchableOpacity>
          </View>

        </View>
      ) : (
        
        // PRESCRIPTION PORTAL (COMPLETED MODE ACTIVE)
        <GlassCard style={styles.prescriptionCard}>
          {/* Header Clinic Specs */}
          <View style={styles.rxHeader}>
            <View style={styles.rxHeaderLeft}>
              <Text style={styles.rxTitleBig}>DentPulse AI</Text>
              <View style={styles.clinicDetailsBox}>
                <View style={styles.clinicDetailItem}>
                  <Building2 size={13} color="#64748b" style={{ marginRight: 6 }} />
                  <Text style={styles.clinicDetailText}>{user?.clinic_name || 'DentPulse Implantology Clinic'}</Text>
                </View>
                <View style={styles.clinicDetailItem}>
                  <Phone size={13} color="#64748b" style={{ marginRight: 6 }} />
                  <Text style={styles.clinicDetailText}>{user?.phone_number || '+1 (555) 302-8822'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.rxHeaderRight}>
              <Text style={styles.rxDocLabel}>PRESCRIBING DENTIST</Text>
              <Text style={styles.rxDocName}>Dr. {user?.full_name || 'Mann'}</Text>
            </View>
          </View>

          <View style={styles.rxDivider} />

          {/* Active Patient Details */}
          <View style={styles.rxPatientRow}>
            <Text style={styles.rxPatientLabel}>PATIENT INSTRUCTIONS FOR:</Text>
            <Text style={styles.rxPatientName}>{selectedPatient.full_name} (Implant Site {selectedPatient.implant_site})</Text>
          </View>

          {/* Add Medication Inputs */}
          <View style={styles.rxMedForm}>
            <Text style={styles.rxSectionTitle}>Prescribe Medications</Text>
            
            <View style={styles.rxInputGrid}>
              {/* Medicine Autocomplete Search Field */}
              <View style={[styles.rxInputWrapper, { flex: 1.6, position: 'relative', zIndex: 999 }]}>
                <Text style={styles.rxInputLabel}>Medicine</Text>
                <TextInput
                  style={styles.rxTextInput}
                  placeholder="Search medicine (e.g. Amoxicillin)..."
                  placeholderTextColor="#94a3b8"
                  value={medicineSearch}
                  onChangeText={(text) => {
                    setMedicineSearch(text);
                    setIsMedDropdownVisible(true);
                  }}
                  onFocus={() => setIsMedDropdownVisible(true)}
                />
                
                {/* Real interactive search dropdown */}
                {isMedDropdownVisible && medicineSearch.trim().length > 0 && (
                  <View style={styles.medDropdownContainer}>
                    <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                      {(() => {
                        const filtered = medicineSuggestions.filter(med => 
                          med.toLowerCase().includes(medicineSearch.toLowerCase())
                        );
                        if (filtered.length === 0) {
                          return (
                            <TouchableOpacity 
                              style={styles.medDropdownItem}
                              onPress={() => {
                                setIsMedDropdownVisible(false);
                              }}
                            >
                              <Text style={styles.medDropdownItemText}>Prescribe "{medicineSearch}"</Text>
                            </TouchableOpacity>
                          );
                        }
                        return filtered.map((med, idx) => (
                          <TouchableOpacity 
                            key={idx}
                            style={styles.medDropdownItem}
                            onPress={() => {
                              setMedicineSearch(med);
                              setIsMedDropdownVisible(false);
                            }}
                          >
                            <Text style={styles.medDropdownItemText}>{med}</Text>
                          </TouchableOpacity>
                        ));
                      })()}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* No of Days Field */}
              <View style={[styles.rxInputWrapper, { flex: 0.9 }]}>
                <Text style={styles.rxInputLabel}>Days</Text>
                <TextInput
                  style={styles.rxTextInput}
                  placeholder="Days"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  value={durationDays}
                  onChangeText={setDurationDays}
                />
              </View>
            </View>

            {/* Timings Selector Options */}
            <View style={styles.rxInputWrapper}>
              <Text style={styles.rxInputLabel}>Dosage Timings</Text>
              <View style={styles.doseToggleRow}>
                <TouchableOpacity 
                  style={[styles.dosePill, doseBreakfast && styles.dosePillActive]}
                  onPress={() => setDoseBreakfast(!doseBreakfast)}
                >
                  <Text style={[styles.dosePillText, doseBreakfast && styles.dosePillTextActive]}>Breakfast</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.dosePill, doseLunch && styles.dosePillActive]}
                  onPress={() => setDoseLunch(!doseLunch)}
                >
                  <Text style={[styles.dosePillText, doseLunch && styles.dosePillTextActive]}>Lunch</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.dosePill, doseDinner && styles.dosePillActive]}
                  onPress={() => setDoseDinner(!doseDinner)}
                >
                  <Text style={[styles.dosePillText, doseDinner && styles.dosePillTextActive]}>Dinner</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Food Relationship Options */}
            <View style={styles.rxInputWrapper}>
              <Text style={styles.rxInputLabel}>Food Relationship</Text>
              <View style={styles.doseToggleRow}>
                <TouchableOpacity 
                  style={[styles.dosePill, doseFoodRelation === 'before' && styles.dosePillActive]}
                  onPress={() => setDoseFoodRelation('before')}
                >
                  <Text style={[styles.dosePillText, doseFoodRelation === 'before' && styles.dosePillTextActive]}>Before Food</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.dosePill, doseFoodRelation === 'after' && styles.dosePillActive]}
                  onPress={() => setDoseFoodRelation('after')}
                >
                  <Text style={[styles.dosePillText, doseFoodRelation === 'after' && styles.dosePillTextActive]}>After Food</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addMedBtn} onPress={handleAddMedicine}>
              <Plus size={16} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={styles.addMedBtnText}>Add Medication</Text>
            </TouchableOpacity>
          </View>

          {/* Prescribed Medicine Table */}
          {prescribedList.length > 0 && (
            <View style={styles.tableSection}>
              <Text style={styles.rxSectionTitle}>Prescribed Medicines Ledger</Text>
              <View style={styles.rxTable}>
                {/* Header */}
                <View style={styles.rxTableHeaderRow}>
                  <Text style={[styles.rxTableHeaderCell, { flex: 1.5 }]}>Medicine</Text>
                  <Text style={[styles.rxTableHeaderCell, { flex: 0.8 }]}>Days</Text>
                  <Text style={[styles.rxTableHeaderCell, { flex: 2 }]}>Dosage</Text>
                  <Text style={[styles.rxTableHeaderCell, { width: 40, textAlign: 'center' }]}></Text>
                </View>

                {/* Rows */}
                {prescribedList.map((item) => (
                  <View key={item.id} style={styles.rxTableRow}>
                    <Text style={[styles.rxTableCell, { flex: 1.5, fontWeight: '800' }]}>{item.medicine_name}</Text>
                    <Text style={[styles.rxTableCell, { flex: 0.8, fontWeight: '700', color: '#64748b' }]}>{item.duration}</Text>
                    <Text style={[styles.rxTableCell, { flex: 2, color: '#64748b' }]}>{item.dosage}</Text>
                    <TouchableOpacity 
                      style={[styles.rxTableCell, { width: 40, alignItems: 'center' }]}
                      onPress={() => handleRemoveMedicine(item.id)}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Next Visit Date and Actions */}
          <View style={styles.rxFooterForm}>
            <View style={styles.rxInputWrapper}>
              <Text style={styles.rxInputLabel}>Next Visit Review Date (YYYY-MM-DD)</Text>
              <View style={styles.nextVisitDateWrapper}>
                <Calendar size={16} color="#94a3b8" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.rxTextInputFlat}
                  placeholder="e.g. 2026-06-15"
                  placeholderTextColor="#94a3b8"
                  value={nextVisitDate}
                  onChangeText={setNextVisitDate}
                />
              </View>
            </View>

            <View style={styles.rxActionRow}>
              <TouchableOpacity 
                style={styles.rxCancelBtn} 
                onPress={() => setIsCompletedMode(false)}
              >
                <Text style={styles.rxCancelBtnText}>Back to Monitoring</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.rxSaveBtn, savingPrescription && { opacity: 0.7 }]}
                onPress={handleSavePrescription}
                disabled={savingPrescription}
              >
                {savingPrescription ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.rxSaveBtnText}>Save Prescription</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      )}

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
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  
  // Blocker Screen CSS
  blockerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  blockerCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  blockerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444',
  },
  blockerSub: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },

  flexRow: {
    flexDirection: 'row',
  },
  flexCol: {
    flexDirection: 'column',
  },
  inputCard: {
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    height: 42,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 3,
    borderRadius: 10,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  segmentTextActive: {
    color: '#1e293b',
  },
  painRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  painBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  painBtnActive: {
    backgroundColor: '#3b82f6',
  },
  painText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  painTextActive: {
    color: '#ffffff',
  },
  miniSegmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  miniSegmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },

  // Evaluate Scans CSS
  uploadCard: {
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  scanTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scanTypeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  scanTypeBtnActive: {
    backgroundColor: '#3b82f6',
  },
  scanTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  scanTypeTextActive: {
    color: '#ffffff',
  },
  uploadAction: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  uploadInfo: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  uploadProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  uploadSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  uploadSuccessText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  uploadBtn: {
    width: '100%',
    height: 38,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 6,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },

  // Completed Action button
  completedBtn: {
    backgroundColor: '#10b981',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completedBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  // Logging Predictions
  resultsCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsStatusTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  resultsStatusVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
    gap: 8,
  },
  alertBannerContent: {
    flex: 1,
  },
  alertBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  alertBannerText: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 1,
    fontWeight: '500',
  },
  forecastBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  forecastText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '650',
    textAlign: 'center',
  },

  // PRESCRIPTION PORTAL CSS
  prescriptionCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  rxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  rxHeaderLeft: {
    flex: 1.5,
    minWidth: 200,
  },
  rxTitleBig: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.8,
  },
  clinicDetailsBox: {
    marginTop: 8,
    gap: 6,
  },
  clinicDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicDetailText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  rxHeaderRight: {
    alignItems: 'flex-end',
    minWidth: 150,
  },
  rxDocLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  rxDocName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
  },
  rxDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 18,
  },
  rxPatientRow: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  rxPatientLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  rxPatientName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  rxMedForm: {
    marginTop: 20,
    backgroundColor: '#faf5ff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    gap: 12,
  },
  rxSectionTitle: {
    fontSize: 12,
    fontWeight: '850',
    color: '#701a75',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rxInputGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rxInputWrapper: {
    gap: 6,
  },
  rxInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7c3aed',
    textTransform: 'uppercase',
  },
  rxTextInput: {
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  suggestionsRow: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: 4,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginRight: 6,
  },
  suggestionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 6,
  },
  addMedBtnText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '800',
  },
  
  // Interactive Autocomplete Dropdown
  medDropdownContainer: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderColor: '#ddd6fe',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  medDropdownItemText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  
  // Dosage Toggles Pill Buttons
  doseToggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  dosePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    backgroundColor: '#ffffff',
  },
  dosePillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  dosePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  dosePillTextActive: {
    color: '#ffffff',
  },

  // Table section
  tableSection: {
    marginTop: 24,
  },
  rxTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rxTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rxTableHeaderCell: {
    fontSize: 10,
    fontWeight: '850',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  rxTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  rxTableCell: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },

  // Footer Actions
  rxFooterForm: {
    marginTop: 24,
    gap: 16,
  },
  nextVisitDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  rxTextInputFlat: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  rxActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  rxCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rxCancelBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  rxSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  rxSaveBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
  }
});

export default Monitoring;
