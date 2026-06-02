import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Search, Bell, Menu, User } from 'lucide-react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isMobile } = useResponsive();
  const { user } = useAuth();

  if (isMobile) return null;

  const getDisplayLastName = (fullName: string) => {
    try {
      const parts = fullName.trim().split(' ');
      // If starts with "Dr." or "Dr", skip it to get actual last name
      let lastName = parts[parts.length - 1];
      if (parts.length > 1 && (parts[0].toLowerCase().startsWith('dr'))) {
        lastName = parts[parts.length - 1];
      }
      return lastName.startsWith('Dr.') ? lastName : `Dr. ${lastName}`;
    } catch (e) {
      return 'Doctor';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={18} color="#94a3b8" />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search clinical intelligence..." 
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={20} color="#64748b" />
          <View style={styles.badge} />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <View style={styles.profileSummary}>
          <View style={styles.textInfo}>
            <Text style={styles.name}>
              {user ? getDisplayLastName(user.name) : 'Doctor'}
            </Text>
            <Text style={styles.role}>
              {user?.clinic_name || 'DentPulse Clinical'}
            </Text>
          </View>
          <View style={styles.avatarMini}>
            <User size={16} color="#3b82f6" />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  searchContainer: {
    width: 320,
    height: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#f1f5f9',
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInfo: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  role: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Navbar;
