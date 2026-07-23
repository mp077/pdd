import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { 
  Calendar, Clock, Video, MapPin, User, 
  ChevronRight, ChevronLeft, Check, Star, 
  ShieldCheck, CreditCard, CalendarDays,
  FileText
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const SPECIALIZATIONS = [
  { id: '1', title: 'Implant Specialist', icon: '🦷' },
  { id: '2', title: 'Prosthodontist', icon: '😁' },
  { id: '3', title: 'Oral Surgeon', icon: '🩺' },
  { id: '4', title: 'Periodontist', icon: '🪥' },
  { id: '5', title: 'General Dentist', icon: '😷' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const generateDates = () => {
  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    dates.push({
      id: String(i + 1),
      day: days[d.getDay()],
      date: String(d.getDate()).padStart(2, '0'),
      full: d.toISOString().split('T')[0]
    });
  }
  return dates;
};

const DATES = generateDates();

const PatientAppointments: React.FC = () => {
  const { token } = useAuth();
  
  // Base State
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'book'>('upcoming');
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Booking Flow State
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<'physical' | 'virtual'>('physical');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [docsList, apptsList] = await Promise.all([
        api.getApprovedDoctorsForPatient ? api.getApprovedDoctorsForPatient() : api.getApprovedDoctors(),
        api.getMyAppointments(token),
      ]);
      setDoctors(docsList || []);
      setMyAppointments(apptsList || []);
    } catch (_) {}
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [token])
  );

  const upcomingAppts = myAppointments.filter(a => a.status === 'pending' || a.status === 'accepted');
  const pastAppts = myAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected');

  const handleBook = async () => {
    setBooking(true);
    try {
      if (token && selectedDoctor) {
        const payload = {
          doctor_id: selectedDoctor.id,
          date: selectedDate,
          time: selectedSlot,
          consultation_type: consultationType,
          patient_notes: notes.trim() || undefined,
        };

        await api.bookAppointment(payload, token);
        
        // Reset and go to success
        setStep(6); 
        loadData();
      }
    } catch (e: any) {
      Alert.alert('Booking Failed', e.message || 'Could not book appointment.');
    }
    setBooking(false);
  };

  const handleCancel = async (id: number) => {
    if (!token) return;
    try {
      await api.cancelAppointment(id, token);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', 'Could not cancel appointment.');
    }
  };

  const renderUpcoming = () => (
    <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
      {upcomingAppts.length === 0 ? (
        <View style={styles.emptyState}>
          <CalendarDays size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Upcoming Appointments</Text>
          <Text style={styles.emptySub}>You don't have any appointments scheduled.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('book')}>
            <Text style={styles.emptyBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        upcomingAppts.map((appt, idx) => (
          <View key={idx} style={styles.apptCard}>
            <View style={styles.apptHeader}>
              <View style={[styles.statusBadge, appt.status === 'accepted' ? styles.statusAccepted : styles.statusPending]}>
                <Text style={[styles.statusText, appt.status === 'accepted' ? styles.statusTextAccepted : styles.statusTextPending]}>
                  {appt.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.apptType}>
                {appt.consultation_type === 'virtual' ? '🎥 Video Consult' : '🏥 Clinic Visit'}
              </Text>
            </View>
            <View style={styles.apptBody}>
              <Image source={{ uri: `https://i.pravatar.cc/150?u=${appt.doctor_id}` }} style={styles.apptDocImg} />
              <View style={styles.apptDocInfo}>
                <Text style={styles.apptDocName}>Dr. {appt.doctor_name || 'Specialist'}</Text>
                <Text style={styles.apptDocSpec}>Implant Specialist</Text>
              </View>
            </View>
            <View style={styles.apptFooter}>
              <View style={styles.apptTimeBox}>
                <Calendar size={14} color="#64748b" />
                <Text style={styles.apptTimeText}>{appt.date}</Text>
              </View>
              <View style={styles.apptTimeBox}>
                <Clock size={14} color="#64748b" />
                <Text style={styles.apptTimeText}>{appt.time}</Text>
              </View>
            </View>
            <View style={styles.apptActions}>
              <TouchableOpacity style={styles.actionBtnOutline}>
                <Text style={styles.actionBtnTextOutline}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnOutlineDanger} onPress={() => handleCancel(appt.id)}>
                <Text style={styles.actionBtnTextDanger}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderPast = () => (
    <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
      {pastAppts.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Past Appointments</Text>
          <Text style={styles.emptySub}>Your history is clean.</Text>
        </View>
      ) : (
        pastAppts.map((appt, idx) => (
          <View key={idx} style={[styles.apptCard, { opacity: 0.8 }]}>
            <View style={styles.apptHeader}>
              <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9' }]}>
                <Text style={[styles.statusText, { color: '#64748b' }]}>
                  {appt.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.apptType}>
                {appt.consultation_type === 'virtual' ? '🎥 Video Consult' : '🏥 Clinic Visit'}
              </Text>
            </View>
            <View style={styles.apptBody}>
              <Image source={{ uri: `https://i.pravatar.cc/150?u=${appt.doctor_id}` }} style={styles.apptDocImg} />
              <View style={styles.apptDocInfo}>
                <Text style={styles.apptDocName}>Dr. {appt.doctor_name || 'Specialist'}</Text>
                <Text style={styles.apptDocSpec}>Implant Specialist</Text>
              </View>
            </View>
            <View style={styles.apptFooter}>
              <View style={styles.apptTimeBox}>
                <Calendar size={14} color="#64748b" />
                <Text style={styles.apptTimeText}>{appt.date}</Text>
              </View>
              <View style={styles.apptTimeBox}>
                <Clock size={14} color="#64748b" />
                <Text style={styles.apptTimeText}>{appt.time}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderBookingWizard = () => {
    return (
      <View style={styles.wizardContainer}>
        {/* Wizard Header */}
        {step < 6 && (
          <View style={styles.wizardHeader}>
            {step > 1 ? (
              <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
                <ChevronLeft size={24} color="#0f172a" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
            <Text style={styles.wizardTitle}>
              {step === 1 && 'Choose Specialist'}
              {step === 2 && 'Select Doctor'}
              {step === 3 && 'Doctor Profile'}
              {step === 4 && 'Date & Time'}
              {step === 5 && 'Confirm & Pay'}
            </Text>
            <TouchableOpacity onPress={() => setActiveTab('upcoming')}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.wizardContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.stepGrid}>
              {SPECIALIZATIONS.map(spec => (
                <TouchableOpacity 
                  key={spec.id} 
                  style={[styles.specCard, selectedSpecialty === spec.title && styles.specCardActive]}
                  onPress={() => { setSelectedSpecialty(spec.title); setStep(2); }}
                >
                  <Text style={styles.specIconLarge}>{spec.icon}</Text>
                  <Text style={[styles.specTextLarge, selectedSpecialty === spec.title && styles.specTextActive]}>{spec.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepList}>
              {doctors.map((doc, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.docListCard}
                  onPress={() => { setSelectedDoctor(doc); setStep(3); }}
                >
                  <Image source={{ uri: `https://i.pravatar.cc/150?u=${doc.id}` }} style={styles.docListImg} />
                  <View style={styles.docListInfo}>
                    <Text style={styles.docListName}>Dr. {doc.name}</Text>
                    <Text style={styles.docListSpec}>{doc.specialization || selectedSpecialty}</Text>
                    <View style={styles.ratingRow}>
                      <Star size={14} color="#eab308" fill="#eab308" />
                      <Text style={styles.ratingText}>4.9 (120 reviews)</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 3 && selectedDoctor && (
            <View style={styles.profileStep}>
              <View style={styles.profileTop}>
                <Image source={{ uri: `https://i.pravatar.cc/150?u=${selectedDoctor.id}` }} style={styles.profileImgHuge} />
                <Text style={styles.profileNameHuge}>Dr. {selectedDoctor.name}</Text>
                <Text style={styles.profileSpecHuge}>{selectedDoctor.specialization || selectedSpecialty}</Text>
                <View style={styles.profileBadgeRow}>
                  <View style={styles.profBadge}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={styles.profBadgeText}>Verified</Text>
                  </View>
                  <View style={styles.profBadge}>
                    <Star size={14} color="#eab308" />
                    <Text style={styles.profBadgeText}>4.9 Rating</Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileAbout}>
                <Text style={styles.aboutTitle}>About</Text>
                <Text style={styles.aboutText}>
                  Dr. {selectedDoctor.name} is a renowned specialist with over 10 years of experience in performing successful implant surgeries and providing premium dental care.
                </Text>
              </View>
              
              <View style={styles.profileDetailsRow}>
                <View style={styles.profDetailItem}>
                  <MapPin size={20} color="#3b82f6" />
                  <Text style={styles.profDetailTitle}>Clinic</Text>
                  <Text style={styles.profDetailSub}>{selectedDoctor.clinic_name || 'DentPulse Clinic'}</Text>
                </View>
                <View style={styles.profDetailItem}>
                  <Clock size={20} color="#3b82f6" />
                  <Text style={styles.profDetailTitle}>Experience</Text>
                  <Text style={styles.profDetailSub}>12 Years</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(4)}>
                <Text style={styles.primaryBtnText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.dateTimeStep}>
              <Text style={styles.sectionLabel}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                {DATES.map((d) => (
                  <TouchableOpacity 
                    key={d.id} 
                    style={[styles.dateCard, selectedDate === d.full && styles.dateCardActive]}
                    onPress={() => setSelectedDate(d.full)}
                  >
                    <Text style={[styles.dateDay, selectedDate === d.full && styles.dateTextActive]}>{d.day}</Text>
                    <Text style={[styles.dateNum, selectedDate === d.full && styles.dateTextActive]}>{d.date}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>Select Time</Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((t, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.timeCard, selectedSlot === t && styles.timeCardActive]}
                    onPress={() => setSelectedSlot(t)}
                  >
                    <Text style={[styles.timeText, selectedSlot === t && styles.timeTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Consultation Type</Text>
              <View style={styles.consultTypeRow}>
                <TouchableOpacity 
                  style={[styles.consultTypeCard, consultationType === 'physical' && styles.consultTypeActive]}
                  onPress={() => setConsultationType('physical')}
                >
                  <User size={20} color={consultationType === 'physical' ? '#2563eb' : '#64748b'} />
                  <Text style={[styles.consultTypeText, consultationType === 'physical' && styles.consultTypeActiveText]}>In-Clinic</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.consultTypeCard, consultationType === 'virtual' && styles.consultTypeActive]}
                  onPress={() => setConsultationType('virtual')}
                >
                  <Video size={20} color={consultationType === 'virtual' ? '#2563eb' : '#64748b'} />
                  <Text style={[styles.consultTypeText, consultationType === 'virtual' && styles.consultTypeActiveText]}>Video Call</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, !selectedSlot && { opacity: 0.5 }]} 
                onPress={() => selectedSlot ? setStep(5) : null}
                disabled={!selectedSlot}
              >
                <Text style={styles.primaryBtnText}>Continue to Payment</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 5 && selectedDoctor && (
            <View style={styles.confirmStep}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Appointment Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Doctor</Text>
                  <Text style={styles.summaryValue}>Dr. {selectedDoctor.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date & Time</Text>
                  <Text style={styles.summaryValue}>{selectedDate} • {selectedSlot}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Type</Text>
                  <Text style={styles.summaryValue}>{consultationType === 'virtual' ? 'Video Consult' : 'Clinic Visit'}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelTotal}>Total Fee</Text>
                  <Text style={styles.summaryValueTotal}>$150.00</Text>
                </View>
              </View>

              <Text style={styles.sectionLabel}>Payment Method</Text>
              <TouchableOpacity style={styles.paymentMethodCard}>
                <CreditCard size={24} color="#3b82f6" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.payMethodTitle}>Credit Card</Text>
                  <Text style={styles.payMethodSub}>•••• 4242</Text>
                </View>
                <Check size={20} color="#10b981" />
              </TouchableOpacity>

              <TextInput 
                style={styles.notesInput}
                placeholder="Any notes for the doctor? (Optional)"
                placeholderTextColor="#94a3b8"
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleBook} disabled={booking}>
                {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Confirm & Pay</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 6 && (
            <View style={styles.successStep}>
              <View style={styles.successIconBox}>
                <Check size={48} color="#ffffff" />
              </View>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSub}>Your appointment with Dr. {selectedDoctor?.name} has been successfully scheduled.</Text>
              
              <TouchableOpacity style={styles.primaryBtn} onPress={() => { setStep(1); setActiveTab('upcoming'); }}>
                <Text style={styles.primaryBtnText}>View Appointments</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Past</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'book' && styles.tabBtnActive]}
          onPress={() => setActiveTab('book')}
        >
          <Text style={[styles.tabText, activeTab === 'book' && styles.tabTextActive]}>Book New</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'upcoming' && renderUpcoming()}
      {activeTab === 'past' && renderPast()}
      {activeTab === 'book' && renderBookingWizard()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 24,
  },
  tabBtn: {
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  apptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  apptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAccepted: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusTextAccepted: { color: '#16a34a' },
  statusTextPending: { color: '#d97706' },
  apptType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  apptBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  apptDocImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  apptDocInfo: {
    marginLeft: 12,
  },
  apptDocName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  apptDocSpec: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  apptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  apptTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apptTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  apptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnTextOutline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  actionBtnOutlineDanger: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  wizardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  wizardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
  },
  wizardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  wizardContent: {
    padding: 24,
    paddingBottom: 100,
  },
  stepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  specCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  specCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  specIconLarge: {
    fontSize: 32,
    marginBottom: 12,
  },
  specTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  specTextActive: {
    color: '#2563eb',
  },
  stepList: {
    gap: 16,
  },
  docListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  docListImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  docListInfo: {
    flex: 1,
    marginLeft: 16,
  },
  docListName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  docListSpec: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  profileStep: {
    alignItems: 'center',
  },
  profileTop: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImgHuge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileNameHuge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  profileSpecHuge: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  profBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  profBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  profileAbout: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  profileDetailsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  profDetailItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  profDetailTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
  },
  profDetailSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dateTimeStep: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 20,
  },
  dateList: {
    gap: 12,
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dateDay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    width: '30%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeCardActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  timeTextActive: {
    color: '#ffffff',
  },
  consultTypeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  consultTypeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  consultTypeActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  consultTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  consultTypeActiveText: {
    color: '#2563eb',
  },
  confirmStep: {
    flex: 1,
  },
  summaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563eb',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
    marginBottom: 24,
  },
  payMethodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  payMethodSub: {
    fontSize: 13,
    color: '#64748b',
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 32,
  },
  successStep: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
});

export default PatientAppointments;
