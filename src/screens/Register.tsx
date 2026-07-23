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
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Stethoscope, User, UploadCloud, Eye, EyeOff } from 'lucide-react-native';

interface RegisterProps {
  onNavigateToLogin: () => void;
  onNavigateToOtp: (email: string) => void;
}

export default function Register({ onNavigateToLogin, onNavigateToOtp }: RegisterProps) {
  const { sendRegistrationOtp } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');
  
  // Step 1: Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Professional (Doctor only)
  const [license, setLicense] = useState('');
  const [clinic, setClinic] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');

  // Step 3: Security
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // Refs for keyboard navigation
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const clinicRef = useRef<TextInput>(null);
  const specRef = useRef<TextInput>(null);
  const expRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const getPasswordStrength = () => {
    if (!password) return 0;
    if (password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 3;
    if (password.length > 6 && /[A-Z0-9]/.test(password)) return 2;
    return 1;
  };

  const strength = getPasswordStrength();

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!name || !email || !phone) {
        setError('Please fill in all personal details.');
        return;
      }
      setStep(role === 'doctor' ? 2 : 3);
    } else if (step === 2) {
      if (!license || !clinic || !specialization) {
        setError('Please fill in required professional details.');
        return;
      }
      setStep(3);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendRegistrationOtp({
        name,
        email,
        password,
        phone_number: phone,
        role,
        ...(role === 'doctor' ? {
          specialization,
          clinic_name: clinic,
          license_id: license,
        } : {})
      });
      
      if (result.success) {
        onNavigateToOtp(email);
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (step === 3 && role === 'patient') setStep(1);
          else if (step > 1) setStep(step - 1);
          else onNavigateToLogin();
        }}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View 
              key={s} 
              style={[
                styles.progressDot, 
                step >= s && styles.progressDotActive,
                (role === 'patient' && s === 2) && { display: 'none' }
              ]} 
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.title}>
          {step === 1 && 'Create Account'}
          {step === 2 && 'Professional Details'}
          {step === 3 && 'Secure Account'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {step === 1 && (
          <View style={styles.formGroup}>
            <View style={styles.roleSelection}>
              <TouchableOpacity 
                style={[styles.roleBox, role === 'doctor' && styles.roleBoxActive]} 
                onPress={() => setRole('doctor')}
                activeOpacity={0.7}
              >
                <Stethoscope size={24} color={role === 'doctor' ? '#2563EB' : '#6b7280'} />
                <Text style={[styles.roleText, role === 'doctor' && styles.roleTextActive]}>Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBox, role === 'patient' && styles.roleBoxActive]} 
                onPress={() => setRole('patient')}
                activeOpacity={0.7}
              >
                <User size={24} color={role === 'patient' ? '#2563EB' : '#6b7280'} />
                <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Patient</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, isFocused === 'name' && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('name')}
                onBlur={() => setIsFocused(null)}
              />
            </View>

            <View style={[styles.inputContainer, isFocused === 'email' && styles.inputFocused]}>
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('email')}
                onBlur={() => setIsFocused(null)}
              />
            </View>

            <View style={[styles.inputContainer, isFocused === 'phone' && styles.inputFocused]}>
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                onFocus={() => setIsFocused('phone')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formGroup}>
            <View style={[styles.inputContainer, isFocused === 'license' && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Medical License Number"
                placeholderTextColor="#9ca3af"
                value={license}
                onChangeText={setLicense}
                returnKeyType="next"
                onSubmitEditing={() => clinicRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('license')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
            <View style={[styles.inputContainer, isFocused === 'clinic' && styles.inputFocused]}>
              <TextInput
                ref={clinicRef}
                style={styles.input}
                placeholder="Primary Clinic/Hospital"
                placeholderTextColor="#9ca3af"
                value={clinic}
                onChangeText={setClinic}
                returnKeyType="next"
                onSubmitEditing={() => specRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('clinic')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
            <View style={[styles.inputContainer, isFocused === 'spec' && styles.inputFocused]}>
              <TextInput
                ref={specRef}
                style={styles.input}
                placeholder="Specialization (e.g., Orthodontist)"
                placeholderTextColor="#9ca3af"
                value={specialization}
                onChangeText={setSpecialization}
                returnKeyType="next"
                onSubmitEditing={() => expRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('spec')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
            <View style={[styles.inputContainer, isFocused === 'exp' && styles.inputFocused]}>
              <TextInput
                ref={expRef}
                style={styles.input}
                placeholder="Years of Experience"
                placeholderTextColor="#9ca3af"
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                onFocus={() => setIsFocused('exp')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
            
            <TouchableOpacity style={styles.uploadBox} onPress={() => Alert.alert('Upload', 'Document picker will open here.')}>
              <View style={styles.uploadIconWrap}>
                <UploadCloud size={24} color="#2563EB" />
              </View>
              <Text style={styles.uploadTitle}>Upload License Document</Text>
              <Text style={styles.uploadSub}>PDF, JPG or PNG (Max 5MB)</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formGroup}>
            <View style={[styles.inputContainer, isFocused === 'pass' && styles.inputFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Create Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={() => setIsFocused('pass')}
                onBlur={() => setIsFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>
            
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  <View style={[styles.strengthBar, strength >= 1 && { backgroundColor: '#ef4444' }]} />
                  <View style={[styles.strengthBar, strength >= 2 && { backgroundColor: '#eab308' }]} />
                  <View style={[styles.strengthBar, strength >= 3 && { backgroundColor: '#22c55e' }]} />
                </View>
                <Text style={styles.strengthText}>
                  {strength === 1 ? 'Weak' : strength === 2 ? 'Good' : 'Strong'}
                </Text>
              </View>
            )}

            <View style={[styles.inputContainer, isFocused === 'confirm' && styles.inputFocused]}>
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                onFocus={() => setIsFocused('confirm')}
                onBlur={() => setIsFocused(null)}
              />
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={step === 3 ? handleRegister : handleNext}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryBtnText}>{step === 3 ? 'Send Verification Code' : 'Continue'}</Text>}
        </TouchableOpacity>

        {step === 1 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginRight: 40, 
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    backgroundColor: '#2563EB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  formGroup: {
    gap: 12,
    marginBottom: 24,
  },
  roleSelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  roleBox: {
    flex: 1,
    height: 90,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  roleBoxActive: {
    borderColor: '#2563EB',
    backgroundColor: '#eff6ff',
  },
  roleText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  roleTextActive: {
    color: '#2563EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
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
  uploadBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginTop: 4,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 13,
    color: '#6b7280',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
    marginBottom: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 16,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    width: 45,
    textAlign: 'right',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
