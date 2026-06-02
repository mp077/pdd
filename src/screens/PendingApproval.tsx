import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Clock, ShieldCheck, ChevronRight, BrainCircuit, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/premium/GlassCard';

interface PendingApprovalProps {
  onNavigateToLogin: () => void;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ onNavigateToLogin }) => {
  const { otpEmail, clearOtpSession } = useAuth();

  const handleReturn = () => {
    clearOtpSession();
    onNavigateToLogin();
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.cardContainer}>
        <GlassCard style={styles.card}>
          {/* Logo Branding */}
          <View style={styles.brandingBox}>
            <View style={styles.logoCircle}>
              <BrainCircuit size={24} color="#3b82f6" />
            </View>
            <Text style={styles.brandTitle}>DentPulse AI</Text>
          </View>

          {/* Pending Verification pulsing illustration */}
          <View style={styles.illustrationBox}>
            <View style={styles.pulseOuter}>
              <View style={styles.pulseInner}>
                <ShieldCheck size={36} color="#3b82f6" />
              </View>
            </View>
          </View>

          {/* Dynamic Content */}
          <Text style={styles.title}>Registration Under Review</Text>
          <Text style={styles.desc}>
            Our medical board is verifying your professional credentials and clinical license ID.
          </Text>

          {otpEmail && (
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionText}>Account: {otpEmail}</Text>
            </View>
          )}

          {/* Wait Checklist */}
          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <CheckCircle2 size={16} color="#10b981" />
              <Text style={styles.checkText}>Email OTP Verification Verified</Text>
            </View>
            <View style={styles.checkItem}>
              <Clock size={16} color="#f59e0b" style={{ transform: [{ scale: 0.95 }] }} />
              <Text style={[styles.checkText, { color: '#d97706' }]}>
                Credential & License ID Validation (In Progress)
              </Text>
            </View>
          </View>

          {/* SLA Timeline Info */}
          <View style={styles.slaCard}>
            <View style={styles.slaIconBox}>
              <Clock size={16} color="#3b82f6" />
            </View>
            <View style={styles.slaInfo}>
              <Text style={styles.slaTitle}>Estimated Review Timeline</Text>
              <Text style={styles.slaDesc}>Accounts are typically approved within 12-24 hours</Text>
            </View>
          </View>

          {/* Return pathway */}
          <TouchableOpacity style={styles.returnBtn} onPress={handleReturn} activeOpacity={0.8}>
            <Text style={styles.returnBtnText}>Return to Sign In</Text>
            <ChevronRight size={16} color="#3b82f6" />
          </TouchableOpacity>
        </GlassCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 36,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  illustrationBox: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sessionBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
  },
  sessionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  checklist: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 24,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  slaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  slaIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slaInfo: {
    flex: 1,
  },
  slaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  slaDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 1,
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 4,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b82f6',
  },
});

export default PendingApproval;
