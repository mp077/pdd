import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Users, ShieldAlert, History, Search, Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';

// Screens
import OverviewPage from './OverviewPage';
import DoctorsPage from './DoctorsPage';
import PendingApprovalsPage from './PendingApprovalsPage';
import SecurityPage from './SecurityPage';
import DoctorProfilePage from './DoctorProfilePage';

export type AdminScreen = 'overview' | 'doctors' | 'pending' | 'security' | 'profile';

const AdminConsole: React.FC = () => {
  const { user, logout } = useAuth();
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>('overview');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  // iOS specific margin for notch
  const safeTop = Platform.OS === 'ios' ? Math.max(insets.top, 60) : Math.max(insets.top, 16);

  const navigate = (screen: AdminScreen, params?: any) => {
    if (screen === 'profile' && params?.doctorId) {
      setSelectedDoctorId(params.doctorId);
    }
    setCurrentScreen(screen);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'pending', label: 'Pending Approvals', icon: ShieldAlert },
    { id: 'security', label: 'Security Logs', icon: History },
  ] as const;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'overview':
        return <OverviewPage onNavigate={navigate} />;
      case 'doctors':
        return <DoctorsPage onNavigate={navigate} />;
      case 'profile':
        return <DoctorProfilePage doctorId={selectedDoctorId!} onBack={() => navigate('doctors')} />;
      case 'pending':
        return <PendingApprovalsPage onNavigate={navigate} />;
      case 'security':
        return <SecurityPage onNavigate={navigate} />;
      default:
        return <OverviewPage onNavigate={navigate} />;
    }
  };

  return (
    <View style={[styles.root, { paddingTop: safeTop }]}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>DP</Text>
          </View>
          {!isMobile && <Text style={styles.appBarTitle}>DentPulse Console</Text>}
        </View>

        <View style={styles.appBarRight}>
          <View style={styles.searchBox}>
            <Search size={14} color="#64748b" />
            <Text style={styles.searchTextPlaceholder}>Global search (/) ...</Text>
          </View>
          
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileBtn} onPress={logout}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>AD</Text>
            </View>
            {!isMobile && (
              <View>
                <Text style={styles.profileName}>{user?.name || 'System Admin'}</Text>
                <Text style={styles.profileRole}>Sign Out</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Navigation Bar */}
      <View style={styles.navBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.navScrollContent}
        >
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              testID={`admin-nav-${item.id}`}
              style={[
                styles.navItem,
                currentScreen === item.id && styles.navItemActive
              ]}
              onPress={() => navigate(item.id as AdminScreen)}
            >
              <item.icon 
                size={16} 
                color={currentScreen === item.id ? '#0f172a' : '#64748b'} 
              />
              <Text style={[
                styles.navLabel,
                currentScreen === item.id && styles.navLabelActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Enterprise gray backdrop
  },
  appBar: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
    width: 240,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  searchTextPlaceholder: {
    color: '#94a3b8',
    fontSize: 13,
  },
  iconBtn: {
    padding: 6,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  profileRole: {
    fontSize: 11,
    color: '#64748b',
  },
  navBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navScrollContent: {
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navItemActive: {
    borderBottomColor: '#0f172a',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
});

export default AdminConsole;
