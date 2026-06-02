import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, BrainCircuit, Activity, ShieldCheck, Heart } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import { LogoLoader } from '../components/shared/LogoLoader';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToOtp: () => void;
  onNavigateToPending: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToPatientRegister: () => void;
}

const Login: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToOtp,
  onNavigateToPending,
  onNavigateToForgotPassword,
  onNavigateToPatientRegister,
}) => {
  const { login, loginPatient, setPendingVerificationEmail } = useAuth();
  const { isMobile } = useResponsive();

  const [role, setRole] = useState<'doctor' | 'admin' | 'patient'>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      if (role === 'patient') {
        const result = await loginPatient(email.trim().toLowerCase(), password);
        if (!result.success) {
          setErrorMsg(result.message || 'Login failed.');
        } else if (result.status === 'needs_otp') {
          onNavigateToOtp();
        }
      } else {
        const result = await login(email.trim().toLowerCase(), password, role);
        if (result.success) {
          if (result.status === 'needs_otp') onNavigateToOtp();
          else if (result.status === 'pending_approval') onNavigateToPending();
        } else {
          setErrorMsg(result.message || 'Login failed.');
          if (result.status === 'needs_otp') {
            setPendingVerificationEmail(email.trim().toLowerCase());
            onNavigateToOtp();
          } else if (result.status === 'rejected') {
            setErrorMsg('Your clinical request has been rejected by the administrator.');
          }
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      {/* Branding */}
      <View style={styles.brandingBox}>
        <Image 
          source={require('../assets/logo.png')} 
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }} 
          resizeMode="contain" 
        />
        <Text style={styles.brandTitle}>DentPulse AI</Text>
      </View>

      {/* Role Switcher Pill */}
      <View style={styles.switcherBg}>
        <TouchableOpacity
          style={[styles.switcherBtn, role === 'doctor' && styles.switcherBtnActive]}
          onPress={() => {
            setRole('doctor');
            setErrorMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.switcherText, role === 'doctor' && styles.switcherTextActive]}>
            Doctor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switcherBtn, role === 'admin' && styles.switcherBtnActive]}
          onPress={() => {
            setRole('admin');
            setErrorMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.switcherText, role === 'admin' && styles.switcherTextActive]}>
            Admin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switcherBtn, role === 'patient' && styles.switcherBtnActive]}
          onPress={() => {
            setRole('patient');
            setErrorMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.switcherText, role === 'patient' && styles.switcherTextActive]}>
            Patient
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Output */}
      {errorMsg && (
        <View style={styles.errorBubble}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Input Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Mail size={18} color="#94a3b8" />
          <TextInput
            style={styles.input}
            placeholder="doctor@clinic.com"
            placeholderTextColor="#cbd5e1"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={18} color="#94a3b8" />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#cbd5e1"
            secureTextEntry={secureText}
            autoCapitalize="none"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMsg(null);
            }}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeBtn}>
            {secureText ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.forgotBtn} 
        onPress={onNavigateToForgotPassword}
        activeOpacity={0.7}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.signInBtn, loading && styles.disabledBtn]}
        onPress={handleSignIn}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <LogoLoader size={30} />
        ) : (
          <Text style={styles.signInBtnText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Navigation Footer */}
      {role === 'doctor' && (
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>New to DentPulse?</Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.footerAction}>Register Clinical Account</Text>
          </TouchableOpacity>
        </View>
      )}
      {role === 'patient' && (
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>No account?</Text>
          <TouchableOpacity onPress={onNavigateToPatientRegister}>
            <Text style={styles.footerAction}>Create Patient Account</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isMobile) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.mobileRoot}
      >
        <ScrollView contentContainerStyle={styles.mobileScroll}>
          <View style={styles.cardContainer}>
            <GlassCard style={styles.formCard}>{renderForm()}</GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Web / Desktop Premium Split Screen Layout
  return (
    <View style={styles.webRoot}>
      {/* Left visual panel */}
      <View style={styles.webLeft}>
        <View style={styles.decorativeGradient} />
        <View style={styles.webLeftContent}>
          <View style={styles.statsWrapper}>
            <Activity size={36} color="#60a5fa" />
            <Text style={styles.heroTitle}>DentPulse AI</Text>
            <Text style={styles.heroHeadline}>Clinical Intelligence & Post-Implant Prediction</Text>
            
            <View style={styles.statList}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>98.5%</Text>
                <Text style={styles.statLbl}>Predictive Diagnosis Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>Real-Time</Text>
                <Text style={styles.statLbl}>Bone Stability Tracking (ISQ)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>Secure</Text>
                <Text style={styles.statLbl}>HIPAA-Compliant Patient Logs</Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <ShieldCheck size={16} color="#93c5fd" />
              <Text style={styles.badgeTxt}>Certified Healthcare AI Platform</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right form panel */}
      <View style={styles.webRight}>
        <ScrollView contentContainerStyle={styles.webRightScroll}>
          <View style={styles.webCardWrapper}>
            <GlassCard style={styles.formCard}>{renderForm()}</GlassCard>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileRoot: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mobileScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  webRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    height: '100%',
  },
  webLeft: {
    flex: 1.2,
    backgroundColor: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  decorativeGradient: {
    position: 'absolute',
    top: -200,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
  },
  webLeftContent: {
    zIndex: 1,
  },
  statsWrapper: {
    gap: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  heroHeadline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 40,
    maxWidth: 400,
    lineHeight: 26,
  },
  statList: {
    gap: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#1e293b',
    paddingLeft: 24,
    marginBottom: 40,
  },
  statItem: {
    gap: 4,
  },
  statVal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#60a5fa',
  },
  statLbl: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93c5fd',
  },
  webRight: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  webRightScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 40,
  },
  webCardWrapper: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  formCard: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  formContainer: {
    width: '100%',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  switcherBg: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  switcherBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  switcherBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  switcherTextActive: {
    color: '#3b82f6',
  },
  errorBubble: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  inputGroup: {
    marginBottom: 18,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
  signInBtn: {
    height: 52,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  signInBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3b82f6',
  },
});

export default Login;
