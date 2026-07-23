import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Home, Users, ClipboardList, Activity, User, Search, Bell } from 'lucide-react-native';

const DesktopTopBar = () => {
  const navigation = useNavigation<any>();

  const navItems = [
    { name: 'Dashboard', icon: Home, route: 'Dashboard' },
    { name: 'Patients', icon: Users, route: 'Patients' },
    { name: 'Schedule', icon: ClipboardList, route: 'Schedule' },
    { name: 'Prescription', icon: Activity, route: 'Prescription' },
    { name: 'Profile', icon: User, route: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>DentPulse AI</Text>
        </View>
      </View>

      <View style={styles.center}>
        {navItems.map((item) => (
          <TouchableOpacity 
            key={item.name} 
            style={styles.navItem} 
            onPress={() => navigation.navigate(item.route)}
          >
            <item.icon size={18} color="#64748b" style={styles.icon} />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={styles.iconBtn}>
          <Search size={20} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={20} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Dr+Smith&background=eff6ff&color=2563eb' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    zIndex: 50,
  },
  left: {
    flex: 1,
  },
  logoBox: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoText: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 18,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    cursor: 'pointer',
  },
  icon: {
    marginRight: 8,
  },
  navText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  iconBtn: {
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    cursor: 'pointer',
  },
  profileBtn: {
    cursor: 'pointer',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  }
});

export default DesktopTopBar;
