import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings, LogOut, Home, Users, ClipboardList, Activity, BrainCircuit, FileText, Calendar } from 'lucide-react-native';
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

  const getDisplayLastName = (fullName: string) => {
    try {
      const parts = fullName.trim().split(' ');
      let lastName = parts[parts.length - 1];
      if (parts.length > 1 && (parts[0].toLowerCase().startsWith('dr'))) {
        lastName = parts[parts.length - 1];
      }
      return lastName.startsWith('Dr.') ? lastName : `Dr. ${lastName}`;
    } catch (e) {
      return 'Dr. Mann';
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Brand & Profile Section */}
      <View style={styles.brandSection}>
        <Text style={styles.brandTitle}>DentPulse AI</Text>
        <Text style={styles.doctorName}>
          {user?.name ? getDisplayLastName(user.name) : 'Dr. Mann'}
        </Text>
        <Text style={styles.specialty}>
          {user?.specialization || 'General Dentist'}
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* Main Navigation */}
      <View style={styles.navSection}>
        <Text style={styles.sectionLabel}>Navigation</Text>
        
        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Dashboard' && styles.navItemActive]}
          onPress={() => handleNav('Dashboard', 'Dashboard')}
        >
          <Home size={16} color={activeRoute === 'Dashboard' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Dashboard' && styles.navTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Patients' && styles.navItemActive]}
          onPress={() => handleNav('Patients', 'Patients')}
        >
          <Users size={16} color={activeRoute === 'Patients' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Patients' && styles.navTextActive]}>
            Patients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Appointments' && styles.navItemActive]}
          onPress={() => handleNav('Appointments', 'Dashboard')} // Map to actual screen later
        >
          <Calendar size={16} color={activeRoute === 'Appointments' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Appointments' && styles.navTextActive]}>
            Appointments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Planning' && styles.navItemActive]}
          onPress={() => handleNav('Planning', 'Treatment')}
        >
          <ClipboardList size={16} color={activeRoute === 'Planning' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Planning' && styles.navTextActive]}>
            Treatment Planning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Monitoring' && styles.navItemActive]}
          onPress={() => handleNav('Monitoring', 'Monitoring')}
        >
          <Activity size={16} color={activeRoute === 'Monitoring' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Monitoring' && styles.navTextActive]}>
            Post Implant Monitoring
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Reports' && styles.navItemActive]}
          onPress={() => handleNav('Reports', 'Reports')}
        >
          <FileText size={16} color={activeRoute === 'Reports' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Reports' && styles.navTextActive]}>
            Clinical Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Decision' && styles.navItemActive]}
          onPress={() => handleNav('Decision', 'Decision')}
        >
          <BrainCircuit size={16} color={activeRoute === 'Decision' ? '#2563EB' : '#475569'} />
          <Text style={[styles.navText, activeRoute === 'Decision' && styles.navTextActive]}>
            AI Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Utility Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.navItem, activeRoute === 'Settings' && styles.navItemActive]}
          onPress={() => handleNav('Settings', 'Settings')}
        >
          <Settings size={16} color="#475569" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={logout}>
          <LogOut size={16} color="#475569" />
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 240,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  containerMobile: {
    width: '100%',
  },
  brandSection: {
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 24,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  navSection: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
  },
  navText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 12,
  },
  navTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginTop: 'auto',
  },
});

export default Sidebar;
