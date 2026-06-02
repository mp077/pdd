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
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Calendar,
  Activity,
  MessageCircle,
  ChevronRight,
  Clock,
  Heart,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';
import PatientChatbot from './PatientChatbot';
import GlassCard from '../../components/premium/GlassCard';
import { LogoLoader } from '../../components/shared/LogoLoader';

const PatientHome: React.FC = () => {
  const { user, token } = useAuth();
  const navigation = useNavigation<any>();

  const [recoveryStatus, setRecoveryStatus] = useState<any>(null);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    try {
      const [status, appointments] = await Promise.all([
        api.getRecoveryStatus(token),
        api.getMyAppointments(token),
      ]);
      setRecoveryStatus(status);
      const upcoming = (appointments || []).filter(
        (a: any) => a.status === 'accepted' || a.status === 'pending'
      );
      setNextAppointment(upcoming[0] || null);
    } catch (_) {}
  };

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    initLoad();
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const score = recoveryStatus?.recovery_score ?? 75;
  const healingStatus = recoveryStatus?.healing_status ?? 'Healing Progressing';
  const nextFollowup = recoveryStatus?.next_followup ?? 'Consult your doctor';

  const statusColor =
    healingStatus === 'Healing Stable'
      ? '#10b981'
      : healingStatus === 'Needs Attention'
      ? '#ef4444'
      : '#f59e0b';

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <LogoLoader size={70} />
        <Text style={styles.loadingText}>Retrieving clinical progress...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER SECTION ── */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 40, height: 40, borderRadius: 20 }} 
              resizeMode="contain" 
            />
            <Text style={styles.brandTitleBig}>DentPulse AI</Text>
          </View>
          <Text style={styles.patientNameText}>{user?.name || 'User'}</Text>
        </View>

        {/* ── CARD 1: APPOINTMENTS (PHYSICAL & VIRTUAL) ── */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('PatientAppointmentsTab')}
          activeOpacity={0.9}
        >
          <GlassCard style={styles.innerCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#eff6ff' }]}>
                <Calendar size={20} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Appointments</Text>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </View>

            {nextAppointment ? (
              <View style={styles.metaStatusBox}>
                <Clock size={14} color="#3b82f6" />
                <Text style={styles.metaStatusText}>
                  Next: {nextAppointment.date} at {nextAppointment.time}
                </Text>
              </View>
            ) : (
              <View style={styles.ctaBadge}>
                <Text style={styles.ctaBadgeText}>📅 Tap to Book Appointment</Text>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>

        {/* ── CARD 2: FOLLOW-UP & HEALING ── */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('PatientRecoveryTab')}
          activeOpacity={0.9}
        >
          <GlassCard style={styles.innerCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                <Activity size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Follow-Up & Healing</Text>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </View>

            <View style={styles.metricsSummaryRow}>
              <View style={styles.metricWidget}>
                <Text style={styles.widgetLabel}>HEALING STATUS</Text>
                <Text style={[styles.widgetVal, { color: statusColor }]}>{healingStatus}</Text>
              </View>
              <View style={styles.vLine} />
              <View style={styles.metricWidget}>
                <Text style={styles.widgetLabel}>SCORE</Text>
                <Text style={[styles.widgetVal, { color: statusColor }]}>{score}%</Text>
              </View>
              <View style={styles.vLine} />
              <View style={styles.metricWidget}>
                <Text style={styles.widgetLabel}>NEXT REVIEW</Text>
                <Text style={[styles.widgetVal, { color: '#64748b', fontSize: 13 }]}>{nextFollowup.split(' ')[0]} {nextFollowup.split(' ')[1] || ''}</Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* ── CARD 3: AI HEALTHCARE CHATBOT ── */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setChatVisible(true)}
          activeOpacity={0.9}
        >
          <GlassCard style={styles.innerCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#fdf4ff' }]}>
                <MessageCircle size={20} color="#a855f7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>AI Healthcare Assistant</Text>
                <Text style={styles.cardSubtitle}>Ask about food, care & recovery</Text>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </View>

            <View style={styles.chipsRow}>
              <View style={styles.chip}><Text style={styles.chipText}>Food Advice</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>Medicines</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>Recovery Tips</Text></View>
            </View>
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.supportDisclaimer}>
          <Heart size={14} color="#f43f5e" />
          <Text style={styles.supportDisclaimerText}>
            DentPulse AI is always online to support your recovery.
          </Text>
        </View>
      </ScrollView>

      {/* Chatbot Modal */}
      <PatientChatbot visible={chatVisible} onClose={() => setChatVisible(false)} />
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
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 28,
  },
  brandTitleBig: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  patientNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  welcomeSubtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 6,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 6,
  },
  featureCard: {
    marginBottom: 16,
  },
  innerCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  metaStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  metaStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  ctaBadge: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  ctaBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  metricsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricWidget: {
    alignItems: 'flex-start',
    flex: 1,
  },
  vLine: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  widgetLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 4,
  },
  widgetVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fdf4ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0abfc',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a855f7',
  },
  supportDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  supportDisclaimerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
});

export default PatientHome;
