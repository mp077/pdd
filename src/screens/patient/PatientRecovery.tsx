import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Activity, Clock, ShieldCheck, ClipboardCheck, Pill, CheckCircle, CircleDot } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import GlassCard from '../../components/premium/GlassCard';

const PatientRecovery: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [recoveryStatus, setRecoveryStatus] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [status, timelineEvents, rxList] = await Promise.all([
        api.getRecoveryStatus(token),
        api.getRecoveryTimeline(token),
        api.getMyPrescriptions(token),
      ]);
      setRecoveryStatus(status);
      setTimeline(timelineEvents || []);
      setPrescriptions(rxList || []);
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

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Synthesizing post-operative metrics...</Text>
      </View>
    );
  }

  const score = recoveryStatus?.recovery_score ?? 75;
  const healingStatus = recoveryStatus?.healing_status ?? 'Healing Progressing';
  const nextFollowup = recoveryStatus?.next_followup ?? 'Consult your doctor';
  const doctorNotes = recoveryStatus?.doctor_notes ?? 'Follow post-operative care instructions.';
  
  const statusColor =
    healingStatus === 'Healing Stable'
      ? '#10b981'
      : healingStatus === 'Needs Attention'
      ? '#ef4444'
      : '#f59e0b';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Recovery</Text>
          <Text style={styles.subtitle}>Track your dental implant fusion progress</Text>
        </View>

        {/* ── CARD 2 (CORE METRICS) ── */}
        <GlassCard style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>HEALING STATUS</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{healingStatus}</Text>
            </View>

            <Text style={[styles.scoreLabel, { marginTop: 14 }]}>RECOVERY STRENGTH</Text>
            <Text style={styles.scoreValue}>{score}%</Text>
          </View>

          <View style={styles.scoreRight}>
            <View style={styles.ringOuter}>
              <View style={[styles.ringInner, { borderColor: statusColor }]}>
                <Text style={[styles.ringVal, { color: statusColor }]}>{score}%</Text>
                <Text style={styles.ringUnit}>fused</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Surgeon Directives */}
        <GlassCard style={styles.directivesCard}>
          <Text style={styles.directivesLabel}>SURGEON'S POST-OP DIRECTIVES</Text>
          <Text style={styles.directivesText}>{doctorNotes}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.followupRow}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.followupLabel}>Next Review: </Text>
            <Text style={styles.followupValue}>{nextFollowup}</Text>
          </View>
        </GlassCard>

        {/* Recovery Timeline */}
        <Text style={styles.sectionLabel}>Post-Implant Care Journey</Text>
        <GlassCard style={styles.timelineCard}>
          {timeline.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No treatment stage timeline events recorded.</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {timeline.map((item, idx) => {
                const isCompleted = item.status === 'completed';
                const isLast = idx === timeline.length - 1;

                return (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      {isCompleted ? (
                        <CheckCircle size={20} color="#10b981" fill="#ecfdf5" />
                      ) : (
                        <CircleDot size={20} color="#94a3b8" />
                      )}
                      {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineCompleted]} />}
                    </View>
                    
                    <View style={styles.timelineBody}>
                      <View style={styles.timelineHeaderRow}>
                        <Text style={[styles.timelineTitle, isCompleted ? styles.timelineTitleCompleted : null]}>
                          {item.title}
                        </Text>
                        {item.date ? (
                          <Text style={styles.timelineDate}>{item.date}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.timelineDetail}>{item.detail}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </GlassCard>

        {/* Prescription Ledger */}
        <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Prescription History</Text>
        {prescriptions.length === 0 ? (
          <GlassCard style={styles.emptyRxCard}>
            <Pill size={20} color="#cbd5e1" />
            <Text style={styles.emptyRxText}>No clinical medications prescribed yet.</Text>
          </GlassCard>
        ) : (
          <View style={styles.rxList}>
            {prescriptions.map((rx) => (
              <GlassCard key={rx.id} style={styles.rxCard}>
                <View style={styles.rxIconBox}>
                  <Pill size={18} color="#10b981" />
                </View>
                <View style={styles.rxBody}>
                  <Text style={styles.rxTitle}>{rx.medicine_name}</Text>
                  <Text style={styles.rxDosage}>Dosage: {rx.dosage} · {rx.duration}</Text>
                  {rx.instructions ? (
                    <Text style={styles.rxInstruct}>{rx.instructions}</Text>
                  ) : null}
                  <Text style={styles.rxDoctor}>Issued by: Dr. {rx.doctor_name} on {rx.created_at}</Text>
                </View>
              </GlassCard>
            ))}
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
  scoreCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  scoreLeft: {
    flex: 1,
    gap: 6,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
    lineHeight: 46,
  },
  scoreRight: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 14,
  },
  ringOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
  },
  ringVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  ringUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  directivesCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 14,
    gap: 6,
  },
  directivesLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  directivesText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 19,
    paddingLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 6,
  },
  followupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
  },
  followupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 6,
  },
  followupValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 2,
  },
  timelineCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10b981',
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 20,
    gap: 2,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#64748b',
  },
  timelineTitleCompleted: {
    color: '#1e293b',
  },
  timelineDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  timelineDetail: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94a3b8',
    lineHeight: 16,
  },
  emptyRxCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyRxText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  rxList: {
    gap: 10,
  },
  rxCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    alignItems: 'flex-start',
  },
  rxIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rxBody: {
    flex: 1,
    gap: 2,
  },
  rxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  rxDosage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  rxInstruct: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  rxDoctor: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
  },
});

export default PatientRecovery;
