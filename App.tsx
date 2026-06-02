import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, ClipboardList, Activity, BrainCircuit, Bell, Search, Menu } from 'lucide-react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useResponsive } from './src/hooks/useResponsive';
import Sidebar from './src/components/layout/Sidebar';
import Navbar from './src/components/layout/Navbar';

// Screens
import Dashboard from './src/screens/Dashboard';
import Patients from './src/screens/Patients';
import TreatmentPlanning from './src/screens/TreatmentPlanning';
import Monitoring from './src/screens/Monitoring';
import DecisionAI from './src/screens/DecisionSupport';
import Reports from './src/screens/Reports';
import AccountSettings from './src/screens/AccountSettings';

// Authentication Screens & Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Login from './src/screens/Login';
import RegisterDoctor from './src/screens/RegisterDoctor';
import OtpVerification from './src/screens/OtpVerification';
import PendingApproval from './src/screens/PendingApproval';
import AdminPanel from './src/screens/AdminPanel';
import ForgotPassword from './src/screens/ForgotPassword';
import CreateNewPassword from './src/screens/CreateNewPassword';
import PatientRegister from './src/screens/PatientRegister';
import PatientNavigator from './src/navigation/PatientNavigator';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const MobileNavigator = () => (
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
        <TouchableOpacity 
          style={styles.headerMenu}
          onPress={() => (navigation as any).openDrawer()}
        >
          <Menu size={22} color="#1e293b" />
        </TouchableOpacity>
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
        tabBarLabel: 'Home'
      }} 
    />
    <Tab.Screen 
      name="Patients" 
      component={Patients} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <Users size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Cases'
      }} 
    />
    <Tab.Screen 
      name="Treatment" 
      component={TreatmentPlanning} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <ClipboardList size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Plan'
      }} 
    />
    <Tab.Screen 
      name="Monitoring" 
      component={Monitoring} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <Activity size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Monitor'
      }} 
    />
    <Tab.Screen 
      name="Decision" 
      component={DecisionAI} 
      options={{ 
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.tabIconBox, focused ? styles.tabActiveBox : {}]}>
            <BrainCircuit size={focused ? 24 : 22} color={color} />
          </View>
        ),
        tabBarLabel: 'Insights'
      }} 
    />
  </Tab.Navigator>
);

const MobileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs">
      {() => (
        <Drawer.Navigator
          drawerContent={(props) => <Sidebar {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            drawerStyle: { width: 300 },
            overlayColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <Drawer.Screen name="Tabs" component={MobileNavigator} />
        </Drawer.Navigator>
      )}
    </Stack.Screen>
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

const AppContent = () => {
  const { isMobile } = useResponsive();
  const { token, user, isLoading, otpEmail } = useAuth();
  
  // Navigation Routing States for Unauthenticated views
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'otp' | 'pending' | 'forgot-password' | 'create-new-password' | 'patient-register'>('login');
  
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const handleRoute = (e: any) => {
        if (e.detail) {
          setActiveRoute(e.detail);
        }
      };
      window.addEventListener('changeRoute', handleRoute);
      return () => window.removeEventListener('changeRoute', handleRoute);
    }
  }, []);

  const renderWebLayout = () => (
    <View style={styles.webContainer}>
      <Sidebar activeRoute={activeRoute} setActiveRoute={setActiveRoute} />
      <View style={styles.mainArea}>
        <Navbar />
        <View style={styles.screenContainer}>
          {activeRoute === 'Dashboard' && <Dashboard />}
          {activeRoute === 'Patients' && <Patients />}
          {activeRoute === 'Planning' && <TreatmentPlanning />}
          {activeRoute === 'Monitoring' && <Monitoring />}
          {activeRoute === 'Decision' && <DecisionAI />}
          {activeRoute === 'Reports' && <Reports />}
        </View>
      </View>
    </View>
  );

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
        <RegisterDoctor 
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToOtp={() => setCurrentScreen('otp')}
        />
      );
    }

    if (currentScreen === 'patient-register') {
      return (
        <PatientRegister 
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

    return (
      <Login 
        onNavigateToRegister={() => setCurrentScreen('register')}
        onNavigateToOtp={() => setCurrentScreen('otp')}
        onNavigateToPending={() => setCurrentScreen('pending')}
        onNavigateToForgotPassword={() => setCurrentScreen('forgot-password')}
        onNavigateToPatientRegister={() => setCurrentScreen('patient-register')}
      />
    );
  }

  // 3. Authenticated Admin Portal
  if (user?.role === 'admin') {
    return <AdminPanel />;
  }

  // 4. Authenticated Patient Portal
  if (user?.role === 'patient') {
    return (
      <View style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <PatientNavigator />
        </NavigationContainer>
      </View>
    );
  }

  // 5. Authenticated Doctor Clinical Portal
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        {isMobile ? (
          <MobileStack />
        ) : (
          renderWebLayout()
        )}
      </NavigationContainer>
    </View>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppContent />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  webContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContainer: {
    flex: 1,
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
