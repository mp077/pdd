import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Animated, Vibration, TouchableWithoutFeedback } from 'react-native';
import { Home, CalendarCheck, Sparkles, UserCircle, MapPin, MessageCircle } from 'lucide-react-native';
import ToothIcon from '../components/icons/ToothIcon';

import PatientHome from '../screens/patient/PatientHome';
import PatientAppointments from '../screens/patient/PatientAppointments';
import PatientChatbot from '../screens/patient/PatientChatbot';
import PatientRecovery from '../screens/patient/PatientRecovery';
import PatientProfile from '../screens/patient/PatientProfile';
import PatientMedicalRecords from '../screens/patient/PatientMedicalRecords';
import PatientNotifications from '../screens/patient/PatientNotifications';

const Tab = createBottomTabNavigator();

const AnimatedTabIcon = ({ focused, color, IconComponent, activeColor, activeBg }: any) => {
  const scale = React.useRef(new Animated.Value(focused ? 1.05 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[
      styles.iconBox,
      focused && { backgroundColor: activeBg },
      { transform: [{ scale }] }
    ]}>
      <IconComponent size={22} color={focused ? activeColor : color} strokeWidth={focused ? 3 : 2} focused={focused} />
    </Animated.View>
  );
};

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
      tabBarActiveTintColor: '#2563eb', // Darker, bold blue
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '800', // Bolder font
        marginTop: 4,
      },
    }}
    screenListeners={({ navigation, route }) => ({
      tabPress: (e) => {
        Vibration.vibrate(40);
      },
    })}
  >
    <Tab.Screen
      name="PatientHomeTab"
      component={PatientHome}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: (props) => <AnimatedTabIcon {...props} IconComponent={Home} activeColor="#2563eb" activeBg="#eff6ff" />
      }}
    />
    <Tab.Screen
      name="PatientChatbotTab"
      component={PatientChatbot}
      options={{
        tabBarLabel: 'Dent AI',
        tabBarIcon: (props) => <AnimatedTabIcon {...props} IconComponent={Sparkles} activeColor="#a855f7" activeBg="#faf5ff" />
      }}
    />
    <Tab.Screen
      name="PatientAppointmentsTab"
      component={PatientAppointments}
      options={{
        tabBarLabel: 'Visits',
        tabBarIcon: (props) => <AnimatedTabIcon {...props} IconComponent={CalendarCheck} activeColor="#16a34a" activeBg="#f0fdf4" />
      }}
    />
    <Tab.Screen
      name="PatientRecoveryTab"
      component={PatientRecovery}
      options={{
        tabBarLabel: 'My Implant',
        tabBarIcon: (props) => <AnimatedTabIcon {...props} IconComponent={ToothIcon} activeColor="#ea580c" activeBg="#fff7ed" />
      }}
    />
    <Tab.Screen
      name="PatientProfileTab"
      component={PatientProfile}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: (props) => <AnimatedTabIcon {...props} IconComponent={UserCircle} activeColor="#475569" activeBg="#f8fafc" />
      }}
    />
    <Tab.Screen
      name="PatientMedicalRecords"
      component={PatientMedicalRecords}
      options={{
        tabBarButton: () => null,
        tabBarItemStyle: { display: 'none' },
      }}
    />
    <Tab.Screen
      name="PatientNotifications"
      component={PatientNotifications}
      options={{
        tabBarButton: () => null,
        tabBarItemStyle: { display: 'none' },
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  iconBox: {
    padding: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  iconBoxActive: {
    backgroundColor: '#eff6ff', // Light blue background for active
  },
});

export default PatientNavigator;
