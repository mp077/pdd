import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Search, FileText, Building, FileBadge, CheckCircle, ShieldAlert } from 'lucide-react-native';

const DoctorsPage = () => {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (token) {
        const data = await api.getApprovedDoctorsAdmin(token);
        setDoctors(data);
      }
      setLoading(false);
    };
    const unsubscribe = navigation.addListener('focus', fetchDoctors);
    return unsubscribe;
  }, [navigation, token]);

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
        <Text style={styles.pageTitle}>Doctors</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Search size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {doctors.map((doc, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.doctorCard}
            onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{doc.full_name?.charAt(0) || 'D'}</Text>
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.docName}>{doc.full_name}</Text>
                <Text style={styles.docSpec}>{doc.specialization || 'General Practice'}</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoPill}>
                <Building size={14} color="#64748b" />
                <Text style={styles.infoPillText}>{doc.clinic_name || 'No Clinic Listed'}</Text>
              </View>
              <View style={styles.infoPill}>
                <FileBadge size={14} color="#64748b" />
                <Text style={styles.infoPillText}>{doc.license_id || 'No License ID'}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              {doc.account_status === 'locked' ? (
                <View style={[styles.statusBadge, styles.statusLocked]}>
                  <ShieldAlert size={12} color="#991b1b" />
                  <Text style={[styles.statusText, styles.statusTextLocked]}>LOCKED</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.statusActive]}>
                  <CheckCircle size={12} color="#166534" />
                  <Text style={[styles.statusText, styles.statusTextActive]}>VERIFIED</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {doctors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No verified doctors found.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  searchBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  doctorCard: {
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
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  nameBlock: {
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
  cardBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  infoPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusLocked: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextLocked: {
    color: '#991b1b',
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

export default DoctorsPage;
