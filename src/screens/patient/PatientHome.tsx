import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  MapPin,
  Bell,
  Search,
  Calendar,
  Activity,
  MessageCircle,
  FileText,
  Video,
  Hospital,
  ChevronRight,
  Star,
  Sparkles,
  Stethoscope
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';
import PatientChatbot from './PatientChatbot';
import { useNotifications } from '../../context/NotificationContext';

const SPECIALIZATIONS = [
  { id: '1', title: 'Implant Specialist', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=150&auto=format&fit=crop' },
  { id: '2', title: 'Prosthodontist', image: 'https://images.unsplash.com/photo-1598256989800-fea99e49fb46?q=80&w=150&auto=format&fit=crop' },
  { id: '3', title: 'Oral Surgeon', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=150&auto=format&fit=crop' },
  { id: '4', title: 'Periodontist', image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=150&auto=format&fit=crop' },
  { id: '5', title: 'General Dentist', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=150&auto=format&fit=crop' },
];

const PatientHome: React.FC = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation<any>();
  const { unreadCount } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [approvedDoctors, setApprovedDoctors] = useState<any[]>([]);
  const [locationName, setLocationName] = useState('Fetching location...');
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [recoveryData, setRecoveryData] = useState<any>(null);

  const loadData = async () => {
    try {
      if (token) {
        // Fetch Real Doctors
        const doctors = await api.getApprovedDoctors();
        setApprovedDoctors(doctors.slice(0, 5));

        // Fetch Real Appointments
        const appts = await api.getMyAppointments(token);
        if (appts && appts.length > 0) {
          const upcoming = appts.filter((a: any) => a.status === 'pending' || a.status === 'accepted');
          if (upcoming.length > 0) {
            setNextAppointment(upcoming[0]);
            
            // Check for newly accepted appointment notification
            if (upcoming[0].status === 'accepted') {
              const lastNotified = await AsyncStorage.getItem('lastNotifiedApptId');
              if (lastNotified !== String(upcoming[0].id)) {
                Alert.alert(
                  'Appointment Confirmed!',
                  `Your booking for ${upcoming[0].date} at ${upcoming[0].time} has been approved by the doctor.`,
                  [{ text: 'Great' }]
                );
                await AsyncStorage.setItem('lastNotifiedApptId', String(upcoming[0].id));
              }
            }
          }
        }

        // Fetch Real Recovery Status
        const status = await api.getRecoveryStatus(token);
        if (status) {
          setRecoveryData(status);
        }
      }

      // Fetch Real Location using IP Geolocation
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.city && data.country_name) {
          setLocationName(`${data.city}, ${data.country_name}`);
        } else {
          setLocationName('Location Unavailable');
        }
      } catch (e) {
        setLocationName('Location Unavailable');
      }

    } catch (_) {}
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#64748b" />
            <Text style={styles.locationText}>{locationName}</Text>
            <ChevronRight size={14} color="#64748b" />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => navigation.navigate('PatientNotifications')}
            >
              <Bell size={20} color="#1e293b" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search doctors, clinics, treatments..."
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
        }
      >
        {/* DYNAMIC CAROUSEL / BANNERS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={300}
          decelerationRate="fast"
        >
          {nextAppointment ? (
            <View style={[styles.bannerCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerBadge}>UPCOMING APPOINTMENT</Text>
                <Text style={styles.bannerTitle}>Dr. {nextAppointment.doctor_name || 'Specialist'}</Text>
                <Text style={styles.bannerSub}>{nextAppointment.date} at {nextAppointment.time}</Text>
              </View>
              <View style={[styles.bannerIconBox, { backgroundColor: '#dbeafe' }]}>
                <Calendar size={24} color="#2563eb" />
              </View>
            </View>
          ) : (
            <View style={[styles.bannerCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerBadge}>NO APPOINTMENTS</Text>
                <Text style={styles.bannerTitle}>Ready for a Checkup?</Text>
                <Text style={styles.bannerSub}>Book an appointment today</Text>
              </View>
              <View style={[styles.bannerIconBox, { backgroundColor: '#dbeafe' }]}>
                <Stethoscope size={24} color="#2563eb" />
              </View>
            </View>
          )}

          {recoveryData ? (
            <View style={[styles.bannerCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <View style={styles.bannerContent}>
                <Text style={[styles.bannerBadge, { color: '#16a34a' }]}>RECOVERY STATUS</Text>
                <Text style={styles.bannerTitle}>{recoveryData.healing_status}</Text>
                <Text style={styles.bannerSub}>Score: {recoveryData.recovery_score}%</Text>
              </View>
              <View style={[styles.bannerIconBox, { backgroundColor: '#dcfce7' }]}>
                <Activity size={24} color="#16a34a" />
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* QUICK ACTIONS RE-ALIGNED */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionBlock} 
            onPress={() => navigation.navigate('PatientAppointmentsTab')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#eff6ff' }]}>
              <Calendar size={24} color="#2563eb" />
            </View>
            <Text style={styles.actionBlockText}>Book</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBlock}
            onPress={() => navigation.navigate('PatientRecoveryTab')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#f0fdf4' }]}>
              <Activity size={24} color="#10b981" />
            </View>
            <Text style={styles.actionBlockText}>My Implant</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBlock}
            onPress={() => setChatVisible(true)}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#faf5ff' }]}>
              <Sparkles size={24} color="#a855f7" />
            </View>
            <Text style={styles.actionBlockText}>Dent AI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBlock}
            onPress={() => navigation.navigate('PatientMedicalRecords')}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#fff7ed' }]}>
              <FileText size={24} color="#f97316" />
            </View>
            <Text style={styles.actionBlockText}>Records</Text>
          </TouchableOpacity>
        </View>

        {/* CONSULTATION TYPES */}
        <View style={styles.consultationContainer}>
          <TouchableOpacity 
            style={styles.consultCard}
            onPress={() => navigation.navigate('PatientAppointmentsTab')}
          >
            <View style={[styles.consultIcon, { backgroundColor: '#fef2f2' }]}>
              <Hospital size={24} color="#ef4444" />
            </View>
            <Text style={styles.consultTitle}>Clinic Visit</Text>
            <Text style={styles.consultSub}>Book a physical appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.consultCard}
            onPress={() => navigation.navigate('PatientAppointmentsTab')}
          >
            <View style={[styles.consultIcon, { backgroundColor: '#f0f9ff' }]}>
              <Video size={24} color="#0ea5e9" />
            </View>
            <Text style={styles.consultTitle}>Video Consult</Text>
            <Text style={styles.consultSub}>Talk to a doctor online</Text>
          </TouchableOpacity>
        </View>

        {/* SPECIALIZATIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dental Specialties</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specializationList}
        >
          {SPECIALIZATIONS.map(spec => (
            <TouchableOpacity key={spec.id} style={styles.specializationItem}>
              <View style={styles.specIconBox}>
                <Image source={{ uri: spec.image }} style={styles.specImage} />
              </View>
              <Text style={styles.specTitle}>{spec.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RECOMMENDED DOCTORS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Doctors</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.doctorsList}
        >
          {approvedDoctors.length > 0 ? (
            approvedDoctors.map((doc, index) => (
              <TouchableOpacity key={index} style={styles.doctorCard}>
                <Image 
                  source={{ uri: `https://i.pravatar.cc/150?u=${doc.id}` }} 
                  style={styles.doctorImage} 
                />
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>Dr. {doc.name}</Text>
                  <Text style={styles.doctorSpec}>{doc.specialization}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={14} color="#eab308" fill="#eab308" />
                    <Text style={styles.ratingText}>4.9 (120 reviews)</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyDoctors}>
              <Text style={styles.emptyDoctorsText}>Loading available specialists...</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>

      <PatientChatbot visible={chatVisible} onClose={() => setChatVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#0f172a',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 100,
  },
  carouselContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  bannerCard: {
    flexDirection: 'row',
    width: 300,
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  bannerContent: {
    flex: 1,
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionBlock: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBlockText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  consultationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  consultCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  consultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  consultSub: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  specializationList: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  specializationItem: {
    alignItems: 'center',
    width: 76,
  },
  specIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  specTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  doctorsList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  doctorCard: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  doctorInfo: {
    gap: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  doctorSpec: {
    fontSize: 13,
    color: '#64748b',
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
    color: '#475569',
  },
  emptyDoctors: {
    padding: 20,
  },
  emptyDoctorsText: {
    fontSize: 14,
    color: '#94a3b8',
  }
});

export default PatientHome;
