import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Check, X, ShieldAlert, ChevronRight, FileBadge, Building } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const PendingApprovalsPage = () => {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    if (!token) return;
    setLoading(true);
    const data = await api.getPendingDoctors(token);
    setPending(data);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPending);
    return unsubscribe;
  }, [navigation, token]);

  const handleApprove = async (id: number) => {
    try {
      await api.approveDoctor(id, token!);
      Alert.alert('Success', 'Doctor approved successfully');
      fetchPending();
    } catch (e) {
      Alert.alert('Error', 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    Alert.alert('Reject Registration', 'Are you sure you want to reject this doctor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          await api.rejectDoctor(id, token!);
          fetchPending();
        } catch (e) {
          Alert.alert('Error', 'Failed to reject');
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Review Queue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {pending.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.card}
            onPress={() => navigation.navigate('ApprovalDetail', { pendingId: doc.id })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.nameWrap}>
                <Text style={styles.docName}>{doc.full_name}</Text>
                <Text style={styles.docSpec}>{doc.specialization || 'General Dentist'}</Text>
              </View>
              <View style={styles.statusBadge}>
                <ShieldAlert size={12} color="#ca8a04" />
                <Text style={styles.statusText}>AWAITING</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Building size={14} color="#64748b" />
                <Text style={styles.infoText}>{doc.clinic_name || 'No Clinic Provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <FileBadge size={14} color="#64748b" />
                <Text style={styles.infoText}>{doc.license_id || 'No License Provided'}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.submissionInfo}>
                <Text style={styles.submissionLabel}>Submitted:</Text>
                <Text style={styles.submissionValue}>{new Date(doc.created_at).toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.btnRejectIcon} onPress={() => handleReject(doc.id)}>
                  <X size={20} color="#dc2626" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnApproveIcon} onPress={() => handleApprove(doc.id)}>
                  <Check size={20} color="#16a34a" />
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity onPress={() => navigation.navigate('ApprovalDetail', { pendingId: doc.id })}>
                  <ChevronRight size={24} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {pending.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Queue is empty. No pending registrations.</Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameWrap: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  docSpec: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a16207',
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  submissionInfo: {
    flex: 1,
  },
  submissionLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  submissionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnRejectIcon: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  btnApproveIcon: {
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  }
});

export default PendingApprovalsPage;
