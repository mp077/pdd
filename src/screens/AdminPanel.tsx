import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { ShieldAlert, Users, History, LogOut, Check, X, RefreshCw, Search, Award, Hospital } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import StatusPill from '../components/premium/StatusPill';

const AdminPanel: React.FC = () => {
  const { token, logout, user } = useAuth();
  const { isMobile } = useResponsive();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'history'>('pending');
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // States for lists
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [approvedDoctors, setApprovedDoctors] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  
  // Search filter for history log
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch functions
  const loadPending = async () => {
    if (!token) return;
    setLoading(true);
    const data = await api.getPendingDoctors(token);
    setPendingDoctors(data);
    setLoading(false);
  };

  const loadApproved = async () => {
    if (!token) return;
    setLoading(true);
    const data = await api.getApprovedDoctors(token);
    setApprovedDoctors(data);
    setLoading(false);
  };

  const loadHistory = async () => {
    if (!token) return;
    setLoading(true);
    const data = await api.getLoginHistory(token);
    setLoginHistory(data);
    setLoading(false);
  };

  // Switch tabs & auto-refresh
  useEffect(() => {
    if (activeTab === 'pending') loadPending();
    else if (activeTab === 'approved') loadApproved();
    else if (activeTab === 'history') loadHistory();
  }, [activeTab, token]);

  const handleApprove = async (id: number, name: string) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      const result = await api.approveDoctor(id, token);
      Alert.alert('Approval Completed', result.message || `Doctor ${name} approved.`);
      // Refresh list
      setPendingDoctors(pendingDoctors.filter((d) => d.id !== id));
    } catch (e: any) {
      Alert.alert('Action Failed', e.message || 'Could not approve doctor.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      const result = await api.rejectDoctor(id, token);
      Alert.alert('Registration Rejected', result.message || `Doctor ${name} rejected.`);
      // Refresh list
      setPendingDoctors(pendingDoctors.filter((d) => d.id !== id));
    } catch (e: any) {
      Alert.alert('Action Failed', e.message || 'Could not reject doctor.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredHistory = loginHistory.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.user_name.toLowerCase().includes(query) ||
      log.email.toLowerCase().includes(query) ||
      (log.device_info && log.device_info.toLowerCase().includes(query)) ||
      log.login_status.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.root}>
      {/* Admin Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBranding}>
          <View style={styles.logoBadge}>
            <ShieldAlert size={20} color="#ef4444" />
          </View>
          <View>
            <Text style={styles.navTitle}>DentPulse AI</Text>
            <Text style={styles.navSubtitle}>Clinical Admin Portal • {user?.name || 'System Admin'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <LogOut size={16} color="#ef4444" />
          {!isMobile && <Text style={styles.logoutBtnText}>Logout</Text>}
        </TouchableOpacity>
      </View>

      {/* Admin Workspace Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pending' && styles.tabItemActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.7}
        >
          <ShieldAlert size={16} color={activeTab === 'pending' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending Approvals ({pendingDoctors.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'approved' && styles.tabItemActive]}
          onPress={() => setActiveTab('approved')}
          activeOpacity={0.7}
        >
          <Users size={16} color={activeTab === 'approved' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
            Approved Network ({approvedDoctors.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <History size={16} color={activeTab === 'history' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Security Log
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Contents */}
      <ScrollView style={styles.workspace} contentContainerStyle={styles.workspaceScroll}>
        <View style={styles.workspaceHeader}>
          <Text style={styles.workspaceTitle}>
            {activeTab === 'pending' && 'Licensing Approvals Queue'}
            {activeTab === 'approved' && 'Active Doctors Network'}
            {activeTab === 'history' && 'Audit History logs'}
          </Text>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => {
              if (activeTab === 'pending') loadPending();
              else if (activeTab === 'approved') loadApproved();
              else if (activeTab === 'history') loadHistory();
            }}
            disabled={loading}
          >
            <RefreshCw size={16} color="#3b82f6" style={loading ? { opacity: 0.5 } : {}} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Fetching clinical directories...</Text>
          </View>
        ) : (
          <View style={styles.contentArea}>
            {/* 1. PENDING APPROVALS QUEUE */}
            {activeTab === 'pending' && (
              <View style={isMobile ? styles.gridMobile : styles.gridWeb}>
                {pendingDoctors.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>All licensing verification tasks are complete!</Text>
                  </View>
                ) : (
                  pendingDoctors.map((doc) => (
                    <GlassCard key={doc.id} style={styles.docCard}>
                      <View style={styles.docHeader}>
                        <View style={styles.docAvatar}>
                          <Text style={styles.avatarText}>{doc.name.split(' ').map((n: string) => n[0]).join('')}</Text>
                        </View>
                        <View style={styles.docMeta}>
                          <Text style={styles.docName}>{doc.name}</Text>
                          <Text style={styles.docEmail}>{doc.email}</Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.detailList}>
                        <View style={styles.detailRow}>
                          <Hospital size={14} color="#94a3b8" />
                          <Text style={styles.detailVal}>
                            {doc.clinic_name} • <Text style={{ fontStyle: 'italic' }}>{doc.specialization}</Text>
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Award size={14} color="#94a3b8" />
                          <Text style={styles.detailVal}>License ID: {doc.license_id}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Registered:</Text>
                          <Text style={styles.detailVal}>{formatDate(doc.created_at)}</Text>
                        </View>
                      </View>

                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn, actionLoadingId === doc.id && styles.disabledBtn]}
                          onPress={() => handleReject(doc.id, doc.name)}
                          disabled={actionLoadingId !== null}
                          activeOpacity={0.7}
                        >
                          {actionLoadingId === doc.id ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <>
                              <X size={14} color="#ef4444" />
                              <Text style={styles.rejectBtnText}>Reject</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.approveBtn, actionLoadingId === doc.id && styles.disabledBtn]}
                          onPress={() => handleApprove(doc.id, doc.name)}
                          disabled={actionLoadingId !== null}
                          activeOpacity={0.7}
                        >
                          {actionLoadingId === doc.id ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <>
                              <Check size={14} color="#ffffff" />
                              <Text style={styles.approveBtnText}>Approve</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  ))
                )}
              </View>
            )}

            {/* 2. APPROVED NETWORK */}
            {activeTab === 'approved' && (
              <View style={isMobile ? styles.gridMobile : styles.gridWeb}>
                {approvedDoctors.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No active doctors found in the database.</Text>
                  </View>
                ) : (
                  approvedDoctors.map((doc) => (
                    <GlassCard key={doc.id} style={styles.docCard}>
                      <View style={styles.docHeader}>
                        <View style={[styles.docAvatar, { backgroundColor: '#e8f5e9' }]}>
                          <Text style={[styles.avatarText, { color: '#2e7d32' }]}>
                            {doc.name.split(' ').map((n: string) => n[0]).join('')}
                          </Text>
                        </View>
                        <View style={styles.docMeta}>
                          <Text style={styles.docName}>{doc.name}</Text>
                          <Text style={styles.docEmail}>{doc.email}</Text>
                        </View>
                        <StatusPill label="Active" type="success" />
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.detailList}>
                        <View style={styles.detailRow}>
                          <Hospital size={14} color="#94a3b8" />
                          <Text style={styles.detailVal}>
                            {doc.clinic_name} • <Text style={{ fontStyle: 'italic' }}>{doc.specialization}</Text>
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Award size={14} color="#94a3b8" />
                          <Text style={styles.detailVal}>License: {doc.license_id}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Verification SLA:</Text>
                          <Text style={[styles.detailVal, { color: '#2e7d32', fontWeight: '800' }]}>Approved</Text>
                        </View>
                      </View>
                    </GlassCard>
                  ))
                )}
              </View>
            )}

            {/* 3. SECURITY LOGS */}
            {activeTab === 'history' && (
              <View style={styles.historySection}>
                {/* Search query box */}
                <View style={styles.searchRow}>
                  <Search size={16} color="#94a3b8" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search logs by name, email, platform, or status..."
                    placeholderTextColor="#cbd5e1"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {filteredHistory.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No activity logs match your filter query.</Text>
                  </View>
                ) : (
                  <View style={styles.logList}>
                    {filteredHistory.map((log) => {
                      const isSuccess = log.login_status.toLowerCase().includes('success');
                      const isUnverified = log.login_status.toLowerCase().includes('unverified');
                      const isPending = log.login_status.toLowerCase().includes('pending');
                      const typeStatus = isSuccess ? 'success' : isUnverified || isPending ? 'warning' : 'error';
                      
                      return (
                        <View key={log.id} style={styles.logRow}>
                          <View style={styles.logLeft}>
                            <Text style={styles.logName}>{log.user_name}</Text>
                            <Text style={styles.logEmail}>{log.email}</Text>
                            <Text style={styles.logDevice}>Platform: {log.device_info || 'Mobile Client'}</Text>
                          </View>
                          
                          <View style={styles.logRight}>
                            <StatusPill label={log.login_status} type={typeStatus} />
                            <Text style={styles.logTime}>{formatDate(log.login_time)}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navbar: {
    height: 72,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  navBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ef4444',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#3b82f6',
  },
  workspace: {
    flex: 1,
  },
  workspaceScroll: {
    padding: 24,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workspaceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  contentArea: {
    width: '100%',
  },
  gridMobile: {
    gap: 16,
  },
  gridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyBox: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  docCard: {
    width: Platform.OS === 'web' ? '31%' : '100%',
    minWidth: 320,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b82f6',
  },
  docMeta: {
    flex: 1,
    gap: 2,
  },
  docName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  docEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  detailList: {
    gap: 8,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  rejectBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ef4444',
  },
  approveBtn: {
    backgroundColor: '#3b82f6',
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  historySection: {
    gap: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  logList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logLeft: {
    gap: 2,
    flex: 1,
  },
  logName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  logEmail: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  logDevice: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '700',
    marginTop: 2,
  },
  logRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  logTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default AdminPanel;
