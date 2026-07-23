import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ChevronLeft, Bell, Trash2, Check, CheckCircle2, Calendar, FileText, Sparkles, Activity, AlertCircle, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNotifications, AppNotification, NotificationType } from '../../context/NotificationContext';

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'appointment': return <Calendar size={20} color="#16a34a" />;
    case 'prescription': return <FileText size={20} color="#2563eb" />;
    case 'alert': return <AlertCircle size={20} color="#ef4444" />;
    case 'ai': return <Sparkles size={20} color="#a855f7" />;
    case 'report': return <Activity size={20} color="#ea580c" />;
    default: return <Bell size={20} color="#64748b" />;
  }
};

const getBackgroundForType = (type: NotificationType) => {
  switch (type) {
    case 'appointment': return '#f0fdf4';
    case 'prescription': return '#eff6ff';
    case 'alert': return '#fef2f2';
    case 'ai': return '#faf5ff';
    case 'report': return '#fff7ed';
    default: return '#f8fafc';
  }
};

const PatientNotifications: React.FC = () => {
  const navigation = useNavigation<any>();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);

  // Group notifications
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const sections = [
    { title: 'Today', data: notifications.filter(n => new Date(n.timestamp) >= today) },
    { title: 'This Week', data: notifications.filter(n => new Date(n.timestamp) >= oneWeekAgo && new Date(n.timestamp) < today) },
    { title: 'Earlier', data: notifications.filter(n => new Date(n.timestamp) < oneWeekAgo) },
  ].filter(section => section.data.length > 0);

  const handlePress = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.linkTo) {
      navigation.navigate(item.linkTo);
    }
  };

  const renderRightActions = (id: string, isRead: boolean) => (
    <View style={styles.swipeActions}>
      {!isRead && (
        <TouchableOpacity style={[styles.swipeAction, styles.swipeRead]} onPress={() => markAsRead(id)}>
          <Check size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.swipeAction, styles.swipeDelete]} onPress={() => deleteNotification(id)}>
        <Trash2 size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id, item.isRead)}>
      <TouchableOpacity 
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]} 
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: getBackgroundForType(item.type) }]}>
          {getIconForType(item.type)}
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <MoreVertical size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                markAllAsRead();
                setShowMenu(false);
              }}
            >
              <CheckCircle2 size={18} color="#2563eb" />
              <Text style={styles.menuText}>Mark all as read</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => {
                    clearAll();
                    setShowMenu(false);
                  }}
                ]);
              }}
            >
              <Trash2 size={18} color="#ef4444" />
              <Text style={[styles.menuText, { color: '#ef4444' }]}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Bell size={48} color="#cbd5e1" />
          </View>
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptySub}>New updates from your doctor and appointments will appear here.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    alignItems: 'flex-start',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#eff6ff', // Very light blue tint for unread
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  unreadText: {
    color: '#0f172a',
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 4,
  },
  swipeActions: {
    flexDirection: 'row',
    marginRight: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderRadius: 16,
    marginLeft: 8,
  },
  swipeRead: {
    backgroundColor: '#10b981',
  },
  swipeDelete: {
    backgroundColor: '#ef4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  emptySub: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  }
});

export default PatientNotifications;
