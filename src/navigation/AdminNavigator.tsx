import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform } from 'react-native';
import { Activity, Users, ShieldAlert, History } from 'lucide-react-native';

import OverviewPage from '../screens/admin/OverviewPage';
import DoctorsPage from '../screens/admin/DoctorsPage';
import DoctorProfilePage from '../screens/admin/DoctorProfilePage';
import PendingApprovalsPage from '../screens/admin/PendingApprovalsPage';
import ApprovalDetailScreen from '../screens/admin/ApprovalDetailScreen';
import SecurityPage from '../screens/admin/SecurityPage';

const Tab = createBottomTabNavigator();
const DoctorsStack = createNativeStackNavigator();
const ApprovalsStack = createNativeStackNavigator();

const DoctorsNavigator = () => (
  <DoctorsStack.Navigator screenOptions={{ headerShown: false }}>
    <DoctorsStack.Screen name="DoctorsList" component={DoctorsPage} />
    <DoctorsStack.Screen name="DoctorProfile" component={DoctorProfilePage} />
  </DoctorsStack.Navigator>
);

const ApprovalsNavigator = () => (
  <ApprovalsStack.Navigator screenOptions={{ headerShown: false }}>
    <ApprovalsStack.Screen name="ApprovalsList" component={PendingApprovalsPage} />
    <ApprovalsStack.Screen name="ApprovalDetail" component={ApprovalDetailScreen} />
  </ApprovalsStack.Navigator>
);

const AdminNavigator = () => (
  <Tab.Navigator
    id="admin-bottom-tabs"
    screenOptions={{
      tabBarStyle: {
        height: Platform.OS === 'ios' ? 85 : 70,
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
        paddingTop: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      tabBarActiveTintColor: '#0f172a',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
      }
    }}
  >
    <Tab.Screen 
      name="Overview" 
      component={OverviewPage}
      options={{
        tabBarIcon: ({ color }) => <Activity size={22} color={color} />
      }}
    />
    <Tab.Screen 
      name="Doctors" 
      component={DoctorsNavigator}
      options={{
        tabBarIcon: ({ color }) => <Users size={22} color={color} />
      }}
    />
    <Tab.Screen 
      name="Approvals" 
      component={ApprovalsNavigator}
      options={{
        tabBarIcon: ({ color }) => <ShieldAlert size={22} color={color} />
      }}
    />
    <Tab.Screen 
      name="Security" 
      component={SecurityPage}
      options={{
        tabBarIcon: ({ color }) => <History size={22} color={color} />
      }}
    />
  </Tab.Navigator>
);

export default AdminNavigator;
