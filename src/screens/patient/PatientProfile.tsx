import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { User, Mail, Phone, Calendar, ShieldCheck, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/premium/GlassCard';

const PatientProfile: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const nameInitial = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'P';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your patient records and session</Text>
        </View>

        {/* Profile Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{nameInitial}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Patient'}</Text>
          <Text style={styles.profileRole}>DentPulse Registered Patient</Text>

          <View style={styles.infoBadge}>
            <ShieldCheck size={14} color="#10b981" />
            <Text style={styles.infoBadgeText}>Verified Patient Account</Text>
          </View>
        </GlassCard>

        {/* Account Details */}
        <Text style={styles.sectionLabel}>Personal Records</Text>
        <GlassCard style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Mail size={16} color="#94a3b8" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Phone size={16} color="#94a3b8" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user?.phone_number || 'Not Registered'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Calendar size={16} color="#94a3b8" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Age & Gender</Text>
              <Text style={styles.detailValue}>
                {user?.age ? `${user.age} Years Old` : 'N/A'}  ·  {user?.gender || 'Unspecified'}
              </Text>
            </View>
          </View>
        </GlassCard>

        <View style={{ flex: 1 }} />

        {/* Logout Action */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={16} color="#dc2626" />
          <Text style={styles.logoutBtnText}>Sign Out of Patient Portal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
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
  profileCard: {
    padding: 24,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3b82f6',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
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
  detailsCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  logoutBtn: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  logoutBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#dc2626',
  },
});

export default PatientProfile;
