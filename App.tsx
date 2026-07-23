import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, ClipboardList, Activity, BrainCircuit, Bell, Search, User } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useResponsive } from './src/hooks/useResponsive';

// Screens
import Dashboard from './src/screens/Dashboard';
import Patients from './src/screens/Patients';
import TreatmentPlanning from './src/screens/TreatmentPlanning'; // Keeping just in case, but replaced
import Schedule from './src/screens/Schedule';
import PatientProfileDoctor from './src/screens/PatientProfileDoctor';
import PrescriptionWorkspace from './src/screens/PrescriptionWorkspace';
import DecisionAI from './src/screens/DecisionSupport';
import Reports from './src/screens/Reports';
import AccountSettings from './src/screens/AccountSettings';

// Authentication Screens & Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import Login from './src/screens/Login';
import AdminLogin from './src/screens/AdminLogin';
import Register from './src/screens/Register';
import OtpVerification from './src/screens/OtpVerification';
import PendingApproval from './src/screens/PendingApproval';
import AdminNavigator from './src/navigation/AdminNavigator';
import ForgotPassword from './src/screens/ForgotPassword';
import CreateNewPassword from './src/screens/CreateNewPassword';
import PatientNavigator from './src/navigation/PatientNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PatientStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PatientsList" component={Patients} />
    <Stack.Screen name="PatientProfileDoctor" component={PatientProfileDoctor} />
  </Stack.Navigator>
);

const MobileNavigator = () => {
  const { isMobile } = useResponsive();
  return (
  <Tab.Navigator
    id="mobile-bottom-tabs"
    screenOptions={({ navigation }) => ({
      tabBarStyle: { 
        height: 85, 
        paddingBottom: 25, 
        paddingTop: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        display: 'flex',
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: true,
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      },
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
      },
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}><Search size={20} color="#64748b" /></TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}><Bell size={20} color="#64748b" /></TouchableOpacity>
        </View>
      ),
      headerLeft: () => (
        <View style={{ width: 16 }} />
      ),
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={Dashboard} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <Home size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Dashboard',
        tabBarTestID: 'nav-dashboard'
      }} 
    />
    <Tab.Screen 
      name="Patients" 
      component={PatientStack} 
      options={{ 
        headerShown: false,
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <Users size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Patients',
        tabBarTestID: 'nav-patients'
      }} 
    />
    <Tab.Screen 
      name="Schedule" 
      component={Schedule} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <ClipboardList size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Schedule',
        tabBarTestID: 'nav-schedule'
      }} 
    />
    <Tab.Screen 
      name="Prescription" 
      component={PrescriptionWorkspace} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <Activity size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Prescription',
        tabBarTestID: 'nav-prescription'
      }} 
    />
    <Tab.Screen 
      name="Profile" 
      component={AccountSettings} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <User size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Profile',
        tabBarTestID: 'nav-profile'
      }} 
    />
  </Tab.Navigator>
  );
};

const MobileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MobileNavigator} />
    <Stack.Screen 
      name="Settings" 
      component={AccountSettings} 
      options={{ 
        headerShown: true, 
        title: 'Account Settings',
        headerTitleStyle: { fontWeight: '800' }
      }} 
    />
  </Stack.Navigator>
);

const ResponsiveWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }}>{children}</View>;
  }

  return (
    <View style={styles.responsiveBackground}>
      <View style={styles.responsiveContainer}>
        {children}
      </View>
    </View>
  );
};

const AppContent = () => {
  const { isMobile } = useResponsive();
  const { token, user, isLoading, otpEmail } = useAuth();
  
  // Navigation Routing States for Unauthenticated views
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'otp' | 'pending' | 'forgot-password' | 'create-new-password' | 'patient-register' | 'admin-login'>('login');

  // 1. Session Loading State
  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing Clinical Modules...</Text>
      </View>
    );
  }

  // 2. Unauthenticated Gateway
  if (!token) {
    if (otpEmail) {
      return (
        <OtpVerification 
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToPending={() => setCurrentScreen('pending')}
          onNavigateToCreatePassword={() => setCurrentScreen('create-new-password')}
        />
      );
    }

    if (currentScreen === 'register') {
      return (
        <Register 
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToOtp={() => setCurrentScreen('otp')}
        />
      );
    }

    if (currentScreen === 'pending') {
      return (
        <PendingApproval 
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    }

    if (currentScreen === 'forgot-password') {
      return (
        <ForgotPassword 
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToOtp={() => setCurrentScreen('otp')}
        />
      );
    }

    if (currentScreen === 'create-new-password') {
      return (
        <CreateNewPassword 
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    }

    if (currentScreen === 'admin-login') {
      return (
        <AdminLogin 
          onNavigateToUserLogin={() => setCurrentScreen('login')}
          onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')}
        />
      );
    }

    return (
      <Login 
        onNavigateToRegister={() => setCurrentScreen('register')}
        onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')}
        onNavigateToPatientRegister={() => setCurrentScreen('register')}
        onNavigateToAdminLogin={() => setCurrentScreen('admin-login')}
      />
    );
  }

  // 3. Authenticated Admin Portal
  if (user?.role === 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ResponsiveWrapper>
          <NavigationContainer>
            <AdminNavigator />
          </NavigationContainer>
        </ResponsiveWrapper>
      </SafeAreaView>
    );
  }

  // 4. Authenticated Patient Portal
  if (user?.role === 'patient') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ResponsiveWrapper>
          <NavigationContainer>
            <PatientNavigator />
          </NavigationContainer>
        </ResponsiveWrapper>
      </SafeAreaView>
    );
  }

  // 5. Authenticated Doctor Clinical Portal
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ResponsiveWrapper>
        <NavigationContainer>
          <MobileStack />
        </NavigationContainer>
      </ResponsiveWrapper>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppContent />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  responsiveBackground: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    paddingRight: 16,
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  headerMenu: {
    paddingLeft: 16,
  },
  tabIconBox: {
    padding: 4,
    borderRadius: 12,
  },
  tabActiveBox: {
    backgroundColor: '#eff6ff',
  },
});

export default App;
