import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Home, Calendar, Activity, UserCircle, MapPin } from 'lucide-react-native';

import PatientHome from '../screens/patient/PatientHome';
import PatientLocation from '../screens/patient/PatientLocation';
import PatientAppointments from '../screens/patient/PatientAppointments';
import PatientRecovery from '../screens/patient/PatientRecovery';
import PatientProfile from '../screens/patient/PatientProfile';

const Tab = createBottomTabNavigator();

const PatientNavigator = () => (
  <Tab.Navigator
    id="patient-bottom-tabs"
    screenOptions={{
      tabBarStyle: {
        height: 80,
        paddingBottom: 20,
        paddingTop: 10,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        elevation: 10,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
      },
    }}
  >
    <Tab.Screen
      name="PatientHomeTab"
      component={PatientHome}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
            <Home size={focused ? 22 : 20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="PatientLocationTab"
      component={PatientLocation}
      options={{
        tabBarLabel: 'Location',
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
            <MapPin size={focused ? 22 : 20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="PatientAppointmentsTab"
      component={PatientAppointments}
      options={{
        tabBarLabel: 'Appointments',
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
            <Calendar size={focused ? 22 : 20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="PatientRecoveryTab"
      component={PatientRecovery}
      options={{
        tabBarLabel: 'Follow-Up',
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
            <Activity size={focused ? 22 : 20} color={color} />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="PatientProfileTab"
      component={PatientProfile}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
            <UserCircle size={focused ? 22 : 20} color={color} />
          </View>
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  iconBox: {
    padding: 4,
    borderRadius: 10,
  },
  iconBoxActive: {
    backgroundColor: '#eff6ff',
  },
});

export default PatientNavigator;
