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
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Calendar, Clock, Video, MapPin, User, ChevronRight, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import GlassCard from '../../components/premium/GlassCard';

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '10:30 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
];

const PatientAppointments: React.FC = () => {
  const { token } = useAuth();
  
  // Data State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('2026-06-01'); // baseline placeholder
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<'physical' | 'virtual'>('physical');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [docsList, apptsList] = await Promise.all([
        api.getApprovedDoctorsForPatient(),
        api.getMyAppointments(token),
      ]);
      setDoctors(docsList || []);
      setMyAppointments(apptsList || []);
      if (docsList && docsList.length > 0) {
        setSelectedDoctor(docsList[0]);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleBook = async () => {
    if (!selectedDoctor) {
      Alert.alert('Incomplete Form', 'Please select a doctor to consult.');
      return;
    }
    if (!selectedDate.trim()) {
      Alert.alert('Incomplete Form', 'Please specify a valid appointment date.');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Incomplete Form', 'Please select a preferred time slot.');
      return;
    }

    setBooking(true);
    try {
      if (token) {
        const payload = {
          doctor_id: selectedDoctor.id,
          date: selectedDate.trim(),
          time: selectedSlot,
          consultation_type: consultationType,
          patient_notes: notes.trim() || undefined,
        };

        const result = await api.bookAppointment(payload, token);
        if (result) {
          Alert.alert('Appointment Booked', 'Your appointment request has been submitted successfully.');
          
          // Reset Form
          setSelectedSlot('');
          setNotes('');
          
          // Reload
          loadData();
        }
      }
    } catch (e: any) {
      Alert.alert('Booking Error', e.message || 'Failed to submit appointment.');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (token) {
              const res = await api.cancelAppointment(id, token);
              if (res) {
                Alert.alert('Cancelled', 'Your appointment has been cancelled.');
                loadData();
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Fetching available clinics & slots...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>Schedule care with DentPulse doctors</Text>
        </View>

        {/* ── CARD 1: BOOK APPOINTMENT ── */}
        <Text style={styles.sectionLabel}>Schedule a New Visit</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.label}>1. SELECT APPROVED SPECIALIST</Text>
          {doctors.length === 0 ? (
            <View style={styles.noDocsBox}>
              <Text style={styles.noDocsText}>No approved implant doctors available right now.</Text>
            </View>
          ) : (
            <View style={styles.docsList}>
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.docCapsule, isSelected && styles.docCapsuleActive]}
                    onPress={() => setSelectedDoctor(doc)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.avatarBox, isSelected && styles.avatarBoxActive]}>
                      <User size={16} color={isSelected ? '#3b82f6' : '#64748b'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.docName, isSelected && styles.docTextActive]}>
                        Dr. {doc.name}
                      </Text>
                      <Text style={[styles.docSpec, isSelected && styles.docSpecActive]}>
                        {doc.specialization} · {doc.clinic_name}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color="#3b82f6" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Date Entry */}
          <Text style={[styles.label, { marginTop: 18 }]}>2. SELECT VISIT DATE</Text>
          <View style={styles.inputWrapper}>
            <Calendar size={16} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
          </View>

          {/* Consultation Type Selector */}
          <Text style={[styles.label, { marginTop: 18 }]}>3. CHOOSE CONSULTATION TYPE</Text>
          <View style={styles.switcherBg}>
            <TouchableOpacity
              style={[styles.switcherBtn, consultationType === 'physical' && styles.switcherBtnActive]}
              onPress={() => setConsultationType('physical')}
              activeOpacity={0.8}
            >
              <MapPin size={14} color={consultationType === 'physical' ? '#3b82f6' : '#64748b'} />
              <Text style={[styles.switcherText, consultationType === 'physical' && styles.switcherTextActive]}>
                Physical Visit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switcherBtn, consultationType === 'virtual' && styles.switcherBtnActive]}
              onPress={() => setConsultationType('virtual')}
              activeOpacity={0.8}
            >
              <Video size={14} color={consultationType === 'virtual' ? '#3b82f6' : '#64748b'} />
              <Text style={[styles.switcherText, consultationType === 'virtual' && styles.switcherTextActive]}>
                Virtual Consultation
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Slot Picker */}
          <Text style={[styles.label, { marginTop: 18 }]}>4. SELECT TIME SLOT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsRow} contentContainerStyle={{ gap: 8 }}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotCapsule, isSelected && styles.slotCapsuleActive]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>{slot}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Notes Input */}
          <Text style={[styles.label, { marginTop: 18 }]}>5. OBSERVATIONS / SYMPTOMS (OPTIONAL)</Text>
          <TextInput
            style={[styles.textInputMultiline, { height: 60 }]}
            placeholder="e.g. Mild tenderness around implant site..."
            placeholderTextColor="#cbd5e1"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.bookBtn, booking && styles.bookBtnDisabled]}
            onPress={handleBook}
            disabled={booking}
            activeOpacity={0.85}
          >
            {booking ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.bookBtnText}>Confirm Appointment Booking</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* ── CARD 3: VIRTUAL CONSULTATION AND LIST ── */}
        <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Active Consultations Feed</Text>
        {myAppointments.length === 0 ? (
          <View style={styles.emptyFeedBox}>
            <Calendar size={22} color="#94a3b8" />
            <Text style={styles.emptyFeedText}>No upcoming or logged consultations.</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {myAppointments.map((appt) => {
              const isVirtual = appt.consultation_type === 'virtual';
              const isPending = appt.status === 'pending';
              const isCancelled = appt.status === 'cancelled';
              const isCompleted = appt.status === 'completed';

              let statusColor = '#854d0e';
              let statusBg = '#fef9c3';
              if (appt.status === 'accepted') {
                statusColor = '#166534';
                statusBg = '#dcfce7';
              } else if (isCancelled) {
                statusColor = '#991b1b';
                statusBg = '#fee2e2';
              } else if (isCompleted) {
                statusColor = '#1e40af';
                statusBg = '#dbeafe';
              }

              return (
                <GlassCard key={appt.id} style={styles.feedCard}>
                  <View style={styles.feedHeader}>
                    <View style={styles.feedTypeRow}>
                      {isVirtual ? (
                        <Video size={16} color="#3b82f6" />
                      ) : (
                        <MapPin size={16} color="#10b981" />
                      )}
                      <Text style={styles.feedTypeText}>
                        {isVirtual ? 'Virtual Consultation' : 'Physical Visit'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {appt.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.feedDoctor}>Dr. {appt.doctor_name}</Text>
                  <Text style={styles.feedDocSub}>{appt.doctor_specialization} · {appt.clinic_name}</Text>

                  <View style={styles.feedTimeRow}>
                    <Clock size={13} color="#64748b" />
                    <Text style={styles.feedTimeText}>
                      {appt.date}  ·  {appt.time}
                    </Text>
                  </View>

                  {/* Virtual Consultation Simulated Call Button */}
                  {isVirtual && appt.status === 'accepted' && appt.meeting_link && (
                    <TouchableOpacity
                      style={styles.meetingBtn}
                      onPress={() => Alert.alert('Simulated Virtual consultation Call', `Opening simulated video connection room:\n${appt.meeting_link}`)}
                      activeOpacity={0.8}
                    >
                      <Video size={14} color="#fff" />
                      <Text style={styles.meetingBtnText}>Join Simulated consultation</Text>
                    </TouchableOpacity>
                  )}

                  {/* Cancel Button */}
                  {isPending && (
                    <TouchableOpacity
                      style={styles.cancelLink}
                      onPress={() => handleCancel(appt.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelLinkText}>Cancel Consultation Request</Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  noDocsBox: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noDocsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  docsList: {
    gap: 8,
  },
  docCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  docCapsuleActive: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBoxActive: {
    backgroundColor: '#dbeafe',
  },
  docName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1e293b',
  },
  docTextActive: {
    color: '#1e40af',
  },
  docSpec: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  docSpecActive: {
    color: '#3b82f6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1e293b',
  },
  textInputMultiline: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  switcherBg: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  switcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  switcherBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  switcherText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  switcherTextActive: {
    color: '#3b82f6',
  },
  slotsRow: {
    flexDirection: 'row',
  },
  slotCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  slotCapsuleActive: {
    backgroundColor: '#3b82f6',
  },
  slotText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  slotTextActive: {
    color: '#ffffff',
  },
  bookBtn: {
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 18,
  },
  bookBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyFeedBox: {
    padding: 30,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderStyle: 'dashed',
  },
  emptyFeedText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  feedList: {
    gap: 12,
  },
  feedCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  feedDoctor: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  feedDocSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  feedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  feedTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  meetingBtn: {
    flexDirection: 'row',
    height: 38,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  meetingBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelLink: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
});

export default PatientAppointments;
