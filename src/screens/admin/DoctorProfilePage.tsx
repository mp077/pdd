import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, Phone, Mail, Building, FileBadge, Lock, Trash2, Ban, FileText } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const DoctorProfilePage = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId } = route.params as { doctorId: number };

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [doctorId]);

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getDoctorProfile(doctorId, token);
      setProfile(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile');
    }
    setLoading(false);
  };

  const handleSuspend = async () => {
    Alert.alert('Suspend Account', 'Are you sure you want to suspend this account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: async () => {
        await api.suspendDoctor(doctorId, token!);
        fetchProfile();
      }}
    ]);
  };

  const handleDeactivate = async () => {
    Alert.alert('Deactivate Account', 'This action will permanently deactivate the account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        await api.deactivateDoctor(doctorId, token!);
        fetchProfile();
      }}
    ]);
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.pageTitle} numberOfLines={1}>{profile.full_name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Verification Status Banner */}
        <View style={[styles.statusBanner, profile.account_status === 'active' ? styles.bannerActive : styles.bannerLocked]}>
          <Text style={[styles.statusBannerText, profile.account_status === 'active' ? styles.bannerTextActive : styles.bannerTextLocked]}>
            ACCOUNT IS {profile.account_status?.toUpperCase() || 'UNKNOWN'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Mail size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Phone size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{profile.phone_number || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.infoRow}>
            <User size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Specialization</Text>
              <Text style={styles.infoValue}>{profile.specialization || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Building size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Clinic Name</Text>
              <Text style={styles.infoValue}>{profile.clinic_name || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <FileBadge size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>License ID</Text>
              <Text style={styles.infoValue}>{profile.license_id || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          <TouchableOpacity style={styles.docPreview}>
            <FileText size={24} color="#3b82f6" />
            <View style={styles.docTextWrap}>
              <Text style={styles.docTitle}>Medical License.pdf</Text>
              <Text style={styles.docSub}>Uploaded {new Date(profile.created_at).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Administrative Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSuspend}>
            <Ban size={18} color="#b45309" />
            <Text style={[styles.actionButtonText, { color: '#b45309' }]}>Suspend Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDeactivate}>
            <Trash2 size={18} color="#dc2626" />
            <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>Deactivate Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Lock size={18} color="#0f172a" />
            <Text style={styles.actionButtonText}>Force Password Reset</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  pageTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  bannerActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  bannerLocked: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTextActive: {
    color: '#166534',
  },
  bannerTextLocked: {
    color: '#991b1b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  docPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  docTextWrap: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  docSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  }
});

export default DoctorProfilePage;
