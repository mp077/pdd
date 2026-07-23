import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { User, Mail, Phone, Award, Building2, ChevronRight, Camera, Bell, Moon, LogOut, Edit } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const DesktopAccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotifications, setIsNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", onPress: logout, style: "destructive" }
      ]
    );
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
    <View style={styles.settingItem}>
      <View style={styles.iconBox}>
        {React.createElement(icon, { size: 18, color: '#64748b' })}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      {showArrow && <ChevronRight size={18} color="#cbd5e1" />}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <View style={styles.bannerInner}>
          <View style={styles.bannerProfile}>
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
            <View style={{ marginLeft: 24 }}>
              <Text style={styles.name}>{user?.name ? `Dr. ${user.name}` : 'Doctor Profile'}</Text>
              <Text style={styles.specialty}>{user?.specialization || 'General Practitioner'} • {user?.clinic_name || 'DentPulse Clinical'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Edit size={18} color="#64748b" style={{ marginRight: 8 }} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.grid}>
          
          {/* Left Column */}
          <View style={styles.column}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.cardInner}>
                {renderSettingItem(User, 'Full Name', user?.name || 'Doctor')}
                <View style={styles.divider} />
                {renderSettingItem(Mail, 'Email Address', user?.email || 'doctor@clinic.com')}
                <View style={styles.divider} />
                {renderSettingItem(Phone, 'Phone Number', user?.phone_number || 'Not Registered')}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Professional Details</Text>
              <View style={styles.cardInner}>
                {renderSettingItem(Award, 'Specialization', user?.specialization || 'General Practitioner')}
                <View style={styles.divider} />
                {renderSettingItem(Building2, 'Clinic', user?.clinic_name || 'DentPulse Clinical')}
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.cardInner}>
                <View style={styles.settingItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                    <Bell size={18} color="#ef4444" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Notifications</Text>
                    <Text style={styles.settingValue}>Receive alerts and reminders</Text>
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
                    <Text style={styles.settingValue}>Toggle application theme</Text>
                  </View>
                  <Switch 
                    value={isDarkMode} 
                    onValueChange={setIsDarkMode}
                    trackColor={{ false: '#e2e8f0', true: '#1e293b' }}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
              <View style={styles.cardInner}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <LogOut size={20} color="#ef4444" />
                  <Text style={styles.logoutBtnText}>Sign Out of DentPulse</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },
  topBanner: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 32,
  },
  bannerInner: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563eb',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0f172a',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    cursor: 'pointer',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    cursor: 'pointer',
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },

  container: { flex: 1 },
  content: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  
  grid: {
    flexDirection: 'row',
    gap: 32,
  },
  column: {
    flex: 1,
  },
  
  card: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  cardInner: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingValue: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    cursor: 'pointer',
  },
  logoutBtnText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  }
});

export default DesktopAccountSettings;
