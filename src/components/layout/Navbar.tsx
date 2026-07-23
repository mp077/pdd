import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Search, Bell, MessageSquare, Sun, Moon, User } from 'lucide-react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeRoute?: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeRoute = 'Dashboard' }) => {
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  
  // Theme state (mock for now)
  const [isDark, setIsDark] = React.useState(false);

  if (isMobile) return null;

  return (
    <View style={styles.container}>
      {/* Left: Breadcrumbs & Page Title */}
      <View style={styles.leftSection}>
        <Text style={styles.pageTitle}>{activeRoute}</Text>
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Home</Text>
          <Text style={styles.breadcrumbSeparator}>/</Text>
          <Text style={styles.breadcrumbCurrent}>{activeRoute}</Text>
        </View>
      </View>

      {/* Center: Global Search */}
      <View style={styles.centerSection}>
        <View style={styles.searchBox}>
          <Search size={16} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search patient, implant, appointment..." 
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Right: Actions & Profile */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsDark(!isDark)}>
          {isDark ? <Sun size={18} color="#64748B" /> : <Moon size={18} color="#64748B" />}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconBtn}>
          <MessageSquare size={18} color="#64748B" />
          <View style={styles.badge} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={18} color="#64748B" />
          <View style={styles.badge} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.profileBtn}>
          <View style={styles.avatar}>
            <User size={16} color="#2563EB" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#64748B',
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  searchBox: {
    width: '80%',
    maxWidth: 480,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#1E293B',
    height: '100%',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Navbar;
