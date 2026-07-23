import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, HeartPulse, Eye, EyeOff, Shield } from 'lucide-react-native';
import { useResponsive } from '../hooks/useResponsive';

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToPatientRegister: () => void;
  onNavigateToAdminLogin: () => void;
}

const ROLES = [
  { id: 'doctor', title: 'Doctor', icon: Stethoscope },
  { id: 'patient', title: 'Patient', icon: User },
];

export default function Login({ onNavigateToRegister, onNavigateToForgotPassword, onNavigateToAdminLogin }: LoginProps) {
  const { login, loginPatient } = useAuth();
  const { isMobile } = useResponsive();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<'email' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (role === 'patient') {
        result = await loginPatient(email, password);
      } else {
        result = await login(email, password, role as any);
      }

      if (!result.success) {
        setError(result.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or account locked.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <View style={styles.floatingCard}>
          {/* Admin Shield */}
          <View style={styles.adminShieldContainer}>
            <TouchableOpacity 
              testID="admin-shield-btn"
              onPress={onNavigateToAdminLogin}
              style={styles.shieldBtn}
              activeOpacity={0.6}
              {...(Platform.OS === 'web' ? { title: 'Administrator Login' } : {})}
            >
              <Shield size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <HeartPulse color="#2563EB" size={28} />
            </View>
            <Text style={[styles.title, !isMobile && { fontSize: 26 }]}>DentPulse AI</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Inputs */}
          <View style={styles.formGroup}>
            <View style={[styles.inputContainer, isFocused === 'email' && styles.inputFocused]}>
              <TextInput
                testID="email-input"
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('email')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
            
            <View style={[styles.inputContainer, isFocused === 'password' && styles.inputFocused]}>
              <TextInput
                testID="password-input"
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setIsFocused('password')}
                onBlur={() => setIsFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={onNavigateToForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity 
            testID="login-button"
            style={styles.submitBtn} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Compact Role Selection */}
          <View style={styles.roleSection}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  testID={`role-selector-${r.id}`}
                  style={[styles.roleChip, isSelected && styles.roleChipActive]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.7}
                >
                  <Icon size={16} color={isSelected ? '#2563EB' : '#6b7280'} />
                  <Text style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>{r.title}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  floatingCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  adminShieldContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 10,
  },
  shieldBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  formGroup: {
    marginBottom: 20,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    height: 52,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#eff6ff',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  roleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  roleChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  roleChipTextActive: {
    color: '#2563EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  }
});
