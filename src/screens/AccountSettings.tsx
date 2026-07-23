import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { User, Mail, Phone, Award, Building2, ChevronRight, Camera, Bell, Moon, LogOut } from 'lucide-react-native';
import GlassCard from '../components/premium/GlassCard';
import { useAuth } from '../context/AuthContext';

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotifications, setIsNotifications] = useState(true);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to sign out?")) {
        logout();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", onPress: logout, style: "destructive" }
        ]
      );
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

  const renderSettingItem = (icon: any, label: string, value: string, showArrow: boolean = true) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.iconBox}>
        {React.createElement(icon, { size: 18, color: '#64748b' })}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      {showArrow && <ChevronRight size={18} color="#cbd5e1" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? getInitials(user.name) : 'DR'}
            </Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn}>
            <Camera size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.name ? `Dr. ${user.name}` : 'Doctor Profile'}</Text>
        <Text style={styles.specialty}>{user?.specialization || 'General Practitioner'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <GlassCard style={styles.card}>
          {renderSettingItem(User, 'Full Name', user?.name || 'Doctor')}
          <View style={styles.divider} />
          {renderSettingItem(Mail, 'Email Address', user?.email || 'doctor@clinic.com')}
          <View style={styles.divider} />
          {renderSettingItem(Phone, 'Phone Number', user?.phone_number || 'Not Registered')}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Details</Text>
        <GlassCard style={styles.card}>
          {renderSettingItem(Award, 'Specialization', user?.specialization || 'General Practitioner')}
          <View style={styles.divider} />
          {renderSettingItem(Building2, 'Clinic', user?.clinic_name || 'DentPulse Clinical')}
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <GlassCard style={styles.card}>
          <View style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
              <Bell size={18} color="#ef4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch 
              value={isNotifications} 
              onValueChange={setIsNotifications}
              trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#f8fafc' }]}>
              <Moon size={18} color="#1e293b" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#e2e8f0', true: '#1e293b' }}
            />
          </View>
        </GlassCard>
      </View>

      <TouchableOpacity testID="logout-button" style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3b82f6',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  specialty: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    padding: 8,
    borderRadius: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 12,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 54,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 8,
  },
});

export default AccountSettings;
