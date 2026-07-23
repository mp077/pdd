import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, MonitorSmartphone, Globe, Smartphone, Check, X, Calendar } from 'lucide-react-native';

const SecurityPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      if (token) {
        const data = await api.getLoginHistory(token);
        setLogs(data);
      }
      setLoading(false);
    };
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter(log => 
    log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Text style={styles.pageTitle}>Security Logs</Text>
      </View>
      
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Calendar size={18} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        {filteredLogs.map((log, idx) => (
          <View key={idx} style={styles.timelineItem}>
            
            {/* Timeline Line */}
            <View style={styles.timelineTrack}>
              <View style={[
                styles.timelineDot,
                log.login_status === 'success' ? styles.dotSuccess : styles.dotFailed
              ]}>
                {log.login_status === 'success' ? (
                  <Check size={12} color="#16a34a" />
                ) : (
                  <X size={12} color="#dc2626" />
                )}
              </View>
              {idx !== filteredLogs.length - 1 && <View style={styles.timelineLine} />}
            </View>

            {/* Timeline Content */}
            <View style={styles.timelineContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTime}>
                  {new Date(log.login_time).toLocaleDateString()} at {new Date(log.login_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <View style={[
                  styles.statusBadge,
                  log.login_status === 'success' ? styles.statusSuccess : styles.statusFailed
                ]}>
                  <Text style={[
                    styles.statusText,
                    log.login_status === 'success' ? styles.statusTextSuccess : styles.statusTextFailed
                  ]}>
                    {log.login_status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.eventCard}>
                <View style={styles.userRow}>
                  <Text style={styles.userName}>{log.user_name}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{log.role?.toUpperCase() || 'DOCTOR'}</Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{log.email}</Text>
                
                <View style={styles.deviceInfo}>
                  <View style={styles.devicePill}>
                    {log.platform?.toLowerCase().includes('ios') || log.platform?.toLowerCase().includes('android') ? (
                      <Smartphone size={12} color="#475569" />
                    ) : (
                      <Globe size={12} color="#475569" />
                    )}
                    <Text style={styles.deviceText}>{log.platform || log.device_info || 'Unknown Platform'}</Text>
                  </View>
                  <View style={styles.devicePill}>
                    <MonitorSmartphone size={12} color="#475569" />
                    <Text style={styles.deviceText}>{log.browser || 'Native App'}</Text>
                  </View>
                </View>
              </View>
            </View>

          </View>
        ))}

        {filteredLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No matching security logs.</Text>
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
  filterSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#0f172a',
  },
  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineTrack: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotSuccess: {
    backgroundColor: '#dcfce7',
  },
  dotFailed: {
    backgroundColor: '#fee2e2',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusFailed: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextSuccess: {
    color: '#166534',
  },
  statusTextFailed: {
    color: '#991b1b',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  devicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  deviceText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
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

export default SecurityPage;
