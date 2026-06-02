import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings, Bell, LogOut, Home, Users, ClipboardList, Activity, BrainCircuit, FileText } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';

interface SidebarProps {
  navigation?: any;
  activeRoute?: string;
  setActiveRoute?: (route: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigation, activeRoute, setActiveRoute }) => {
  const { user, logout } = useAuth();
  const { isMobile } = useResponsive();

  const handleNav = (route: string, mobileScreen: string) => {
    if (!isMobile && setActiveRoute) {
      setActiveRoute(route);
    } else if (isMobile && navigation) {
      navigation.navigate(mobileScreen);
      navigation.closeDrawer();
    }
  };

  const getInitials = (fullName: string) => {
    try {
      return fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } catch (e) {
      return 'DR';
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? getInitials(user.name) : 'DR'}
          </Text>
        </View>
        <Text style={styles.drName}>{user?.name || 'Doctor'}</Text>
        <Text style={styles.drSpecialty}>{user?.specialization || 'General Practitioner'}</Text>
        <View style={styles.clinicBadge}>
          <Text style={styles.clinicName}>{user?.clinic_name || 'DentPulse Clinical'}</Text>
        </View>
      </View>

      {/* Main SaaS Navigation (Only visible on Web/Desktop viewports) */}
      {!isMobile && setActiveRoute && (
        <View style={styles.webMenuSection}>
          <Text style={styles.sectionLabel}>Clinical Workspace</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, activeRoute === 'Dashboard' && styles.menuItemActive]}
            onPress={() => handleNav('Dashboard', 'Dashboard')}
          >
            <Home size={18} color={activeRoute === 'Dashboard' ? '#3b82f6' : '#64748b'} />
            <Text style={[styles.menuText, activeRoute === 'Dashboard' && styles.menuTextActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeRoute === 'Patients' && styles.menuItemActive]}
            onPress={() => handleNav('Patients', 'Patients')}
          >
            <Users size={18} color={activeRoute === 'Patients' ? '#3b82f6' : '#64748b'} />
            <Text style={[styles.menuText, activeRoute === 'Patients' && styles.menuTextActive]}>
              Patients Registry
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeRoute === 'Planning' && styles.menuItemActive]}
            onPress={() => handleNav('Planning', 'Treatment')}
          >
            <ClipboardList size={18} color={activeRoute === 'Planning' ? '#3b82f6' : '#64748b'} />
            <Text style={[styles.menuText, activeRoute === 'Planning' && styles.menuTextActive]}>
              Treatment Planning
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeRoute === 'Monitoring' && styles.menuItemActive]}
            onPress={() => handleNav('Monitoring', 'Monitoring')}
          >
            <Activity size={18} color={activeRoute === 'Monitoring' ? '#3b82f6' : '#64748b'} />
            <Text style={[styles.menuText, activeRoute === 'Monitoring' && styles.menuTextActive]}>
              Post-Implant Monitor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeRoute === 'Decision' && styles.menuItemActive]}
            onPress={() => handleNav('Decision', 'Decision')}
          >
            <BrainCircuit size={18} color={activeRoute === 'Decision' ? '#3b82f6' : '#64748b'} />
            <Text style={[styles.menuText, activeRoute === 'Decision' && styles.menuTextActive]}>
              Clinical Insights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeRoute === 'Reports' && styles.menuItemActive]}
            onPress={() => handleNav('Reports', 'Reports')}
          >
            <FileText size={18} color={activeRoute === 'Reports' ? '#3b82f6' : '#64748b'} />
            <Text style={[styles.menuText, activeRoute === 'Reports' && styles.menuTextActive]}>
              Clinical Reports
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Settings / Utility Sections */}
      <View style={styles.menuSection}>
        {!isMobile && setActiveRoute && <Text style={styles.sectionLabel}>System Settings</Text>}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNav('Settings', 'Settings')}
        >
          <View style={styles.iconBox}>
            <Settings size={20} color="#64748b" />
          </View>
          <Text style={styles.menuText}>Account Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconBox}>
            <Bell size={20} color="#64748b" />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <View style={styles.badge} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.logoutItem} onPress={logout}>
          <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
            <LogOut size={20} color="#ef4444" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>DentPulse AI • v1.0.4</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 60,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  profileCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3b82f6',
  },
  drName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  drSpecialty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dbeafe',
    marginBottom: 12,
    textAlign: 'center',
  },
  clinicBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  clinicName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  webMenuSection: {
    gap: 4,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 12,
    marginBottom: 8,
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    flex: 1,
  },
  menuTextActive: {
    color: '#3b82f6',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  version: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
    letterSpacing: 1,
  },
});

export default Sidebar;
