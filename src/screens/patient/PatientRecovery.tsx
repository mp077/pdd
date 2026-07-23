import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Activity, Clock, ShieldCheck, CheckCircle2, Circle, Stethoscope, FileText, Pill } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const PatientRecovery: React.FC = () => {
  const { token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [status, timeline] = await Promise.all([
        api.getRecoveryStatus(token),
        api.getRecoveryTimeline(token)
      ]);
      setRecoveryStatus(status);
      setTimelineEvents(timeline || []);
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

  const score = recoveryStatus?.recovery_score ?? 85;
  const healingStatus = recoveryStatus?.healing_status ?? 'Healing Progressing';
  const nextFollowup = recoveryStatus?.next_followup ?? '2026-06-15 10:00 AM';

  const statusColor = healingStatus === 'Healing Stable' ? '#10b981' : '#f59e0b';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Implant</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {/* Top Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIconBox}>
              <ShieldCheck size={28} color="#10b981" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Overall Status</Text>
              <Text style={[styles.statusValue, { color: statusColor }]}>{healingStatus}</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}%</Text>
              <Text style={styles.scoreSub}>Score</Text>
            </View>
          </View>
        </View>

        {recoveryStatus?.implant_details && (
          <View style={styles.implantCard}>
            <Text style={styles.implantCardTitle}>Finalized Implant Details</Text>
            <View style={styles.implantDetailsGrid}>
              <View style={styles.implantDetailBox}>
                <Text style={styles.implantDetailLabel}>Type</Text>
                <Text style={styles.implantDetailValue}>{recoveryStatus.implant_details.type}</Text>
              </View>
              <View style={styles.implantDetailBox}>
                <Text style={styles.implantDetailLabel}>Dimensions</Text>
                <Text style={styles.implantDetailValue}>Ø{recoveryStatus.implant_details.diameter} x {recoveryStatus.implant_details.length}mm</Text>
              </View>
              <View style={styles.implantDetailBox}>
                <Text style={styles.implantDetailLabel}>Brand</Text>
                <Text style={styles.implantDetailValue}>{recoveryStatus.implant_details.brand}</Text>
              </View>
              <View style={styles.implantDetailBox}>
                <Text style={styles.implantDetailLabel}>Success Rate</Text>
                <Text style={styles.implantDetailValue}>{recoveryStatus.implant_details.success_probability}%</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Healing Timeline</Text>
        
        <View style={styles.timelineContainer}>
          {timelineEvents.map((item, index) => {
            const isLast = index === timelineEvents.length - 1;
            const isPending = item.status === 'pending';
            
            return (
              <View key={index} style={styles.timelineItem}>
                {!isLast && <View style={[styles.timelineLine, isPending && { backgroundColor: '#e2e8f0' }]} />}
                <View style={[
                  styles.timelineDot, 
                  !isPending ? styles.timelineDotActive : styles.timelineDotFuture
                ]}>
                  {item.icon === 'check' && <CheckCircle2 size={24} color="#10b981" />}
                  {item.icon === 'activity' && <Activity size={24} color="#3b82f6" />}
                  {item.icon === 'pill' && <Pill size={24} color="#8b5cf6" />}
                  {item.icon === 'clock' && <Circle size={24} color="#cbd5e1" />}
                  {(!['check', 'activity', 'pill', 'clock'].includes(item.icon)) && <Circle size={24} color="#cbd5e1" />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTime, isPending && styles.timelineTimeFuture]}>{item.date || 'Pending'}</Text>
                  <Text style={[styles.timelineTitle, isPending && styles.timelineTitleFuture]}>{item.title}</Text>
                  <View style={styles.timelineCard}>
                    <Text style={styles.noteText}>{item.detail}</Text>
                    {item.type === 'followup' && (
                      <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookBtnText}>Reschedule</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          
          {timelineEvents.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>No timeline events yet. Your doctor will update your status soon.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowRadius: 8,
    elevation: 2,
  },
  implantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  implantCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  implantDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  implantDetailBox: {
    width: '47%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  implantDetailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  implantDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  scoreSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  timelineContainer: {
    paddingLeft: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -32,
    width: 2,
    backgroundColor: '#10b981',
  },
  timelineDot: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  timelineDotActive: {
    // handled by icon
  },
  timelineDotCurrent: {
    // handled by icon
  },
  timelineDotFuture: {
    // handled by icon
  },
  timelineContent: {
    flex: 1,
    marginLeft: 20,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  timelineTimeFuture: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  timelineTitleFuture: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  docText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  xrayImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#f1f5f9',
  },
  prescriptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  prescriptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7e22ce',
  },
  bookBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bookBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PatientRecovery;
