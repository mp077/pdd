import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Check, X, User, Mail, Building, FileBadge, FileText } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ApprovalDetailScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { pendingId } = route.params as { pendingId: number };
  
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      if (!token) return;
      const data = await api.getPendingDoctors(token);
      const specificDoc = data.find((d: any) => d.id === pendingId);
      setDoc(specificDoc);
      setLoading(false);
    };
    fetchPending();
  }, [pendingId, token]);

  const handleApprove = async () => {
    try {
      await api.approveDoctor(pendingId, token!);
      Alert.alert('Success', 'Doctor approved successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to approve');
    }
  };

  const handleReject = async () => {
    Alert.alert('Reject Registration', 'Are you sure you want to reject this doctor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          await api.rejectDoctor(pendingId, token!);
          navigation.goBack();
        } catch (e) {
          Alert.alert('Error', 'Failed to reject');
        }
      }}
    ]);
  };

  if (loading || !doc) {
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
        <Text style={styles.pageTitle}>Review Application</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          
          <View style={styles.infoRow}>
            <User size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>Dr. {doc.full_name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{doc.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Building size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>Clinic / Hospital</Text>
              <Text style={styles.infoValue}>{doc.clinic_name || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FileBadge size={16} color="#64748b" />
            <View>
              <Text style={styles.infoLabel}>License ID</Text>
              <Text style={styles.infoValue}>{doc.license_id || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>
          
          <TouchableOpacity style={styles.docPreview}>
            <FileText size={24} color="#3b82f6" />
            <View style={styles.docTextWrap}>
              <Text style={styles.docTitle}>Medical License.pdf</Text>
              <Text style={styles.docSub}>Uploaded {new Date(doc.created_at).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.btnReject} onPress={handleReject}>
            <X size={16} color="#dc2626" />
            <Text style={styles.btnRejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnApprove} onPress={handleApprove}>
            <Check size={16} color="#ffffff" />
            <Text style={styles.btnApproveText}>Approve</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  actionsBox: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnReject: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  btnRejectText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
  btnApprove: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  btnApproveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  }
});

export default ApprovalDetailScreen;
