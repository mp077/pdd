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
import { ShieldAlert, HeartPulse, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

interface AdminLoginProps {
  onNavigateToUserLogin: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function AdminLogin({ onNavigateToUserLogin, onNavigateToForgotPassword }: AdminLoginProps) {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
      // Role is hardcoded to 'admin'
      const result = await login(email, password, 'admin');
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <ShieldAlert color="#1E3A8A" size={28} />
            </View>
            <Text style={styles.title}>DentPulse AI</Text>
            <Text style={styles.subtitle}>Administrator Portal</Text>
            <Text style={styles.warningText}>Authorized Personnel Only</Text>
          </View>

          {/* Inputs */}
          <View style={styles.formGroup}>
            <View style={[styles.inputContainer, isFocused === 'email' && styles.inputFocused]}>
              <TextInput
                testID="admin-email-input"
                style={styles.input}
                placeholder="Administrator Email"
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
                testID="admin-password-input"
                ref={passwordRef}
                style={styles.input}
                placeholder="Secure Password"
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
            testID="admin-login-button"
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

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onNavigateToUserLogin} activeOpacity={0.7} style={styles.backButton}>
              <ArrowLeft size={16} color="#1E3A8A" />
              <Text style={styles.footerLink}>Back to User Login</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 24,
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
    borderColor: '#1E3A8A', // Dark Navy for Admin
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
    color: '#1E3A8A',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#1E3A8A', // Dark Navy for Admin
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1E3A8A',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  }
});
