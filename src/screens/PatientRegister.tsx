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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/premium/GlassCard';

interface Props {
  onNavigateToLogin: () => void;
  onNavigateToOtp: () => void;
}

const GENDERS = ['Male', 'Female', 'Other'];

const PatientRegister: React.FC<Props> = ({ onNavigateToLogin, onNavigateToOtp }) => {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone_number: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    setError(null);

    if (!form.name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120)) {
      setError('Please enter a valid age.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: form.name.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null,
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim() || null,
        password: form.password,
        role: 'patient'
      });

      if (result.success) {
        alert("Registration successful! Please login.");
        onNavigateToLogin();
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <BrainCircuit size={26} color="#3b82f6" />
            </View>
            <Text style={styles.title}>DentPulse AI</Text>
            <Text style={styles.subtitle}>Create Your Patient Account</Text>
            <Text style={styles.subtitleSub}>
              Join thousands of patients tracking their implant recovery
            </Text>
          </View>

          <GlassCard style={styles.card}>
            {/* ── Error Banner ── */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            )}

            {/* ── Full Name ── */}
            <View style={styles.group}>
              <Text style={styles.label}>FULL NAME *</Text>
              <View style={[styles.inputRow, form.name ? styles.inputRowFocused : null]}>
                <User size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ravi Sharma"
                  placeholderTextColor="#cbd5e1"
                  value={form.name}
                  onChangeText={v => update('name', v)}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* ── Age & Gender Row ── */}
            <View style={styles.rowGroup}>
              {/* Age */}
              <View style={[styles.group, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>AGE</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { marginLeft: 0 }]}
                    placeholder="25"
                    placeholderTextColor="#cbd5e1"
                    keyboardType="numeric"
                    maxLength={3}
                    value={form.age}
                    onChangeText={v => update('age', v.replace(/[^0-9]/g, ''))}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Gender */}
              <View style={[styles.group, { flex: 1.6, zIndex: 100 }]}>
                <Text style={styles.label}>GENDER</Text>
                <TouchableOpacity
                  style={styles.inputRow}
                  onPress={() => setShowGenderPicker(prev => !prev)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.input,
                      { marginLeft: 0, color: form.gender ? '#1e293b' : '#cbd5e1' },
                    ]}
                  >
                    {form.gender || 'Select gender'}
                  </Text>
                  {showGenderPicker ? (
                    <ChevronUp size={16} color="#94a3b8" />
                  ) : (
                    <ChevronDown size={16} color="#94a3b8" />
                  )}
                </TouchableOpacity>
                {showGenderPicker && (
                  <View style={styles.pickerBox}>
                    {GENDERS.map((g, idx) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.pickerItem,
                          idx === GENDERS.length - 1 && { borderBottomWidth: 0 },
                        ]}
                        onPress={() => {
                          update('gender', g);
                          setShowGenderPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerText,
                            form.gender === g && { color: '#3b82f6', fontWeight: '800' },
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* ── Email ── */}
            <View style={styles.group}>
              <Text style={styles.label}>EMAIL ADDRESS *</Text>
              <View style={styles.inputRow}>
                <Mail size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="patient@email.com"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={form.email}
                  onChangeText={v => update('email', v)}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* ── Phone ── */}
            <View style={styles.group}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.inputRow}>
                <Phone size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="phone-pad"
                  value={form.phone_number}
                  onChangeText={v => update('phone_number', v)}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* ── Password ── */}
            <View style={styles.group}>
              <Text style={styles.label}>PASSWORD *</Text>
              <View style={styles.inputRow}>
                <Lock size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={form.password}
                  onChangeText={v => update('password', v)}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(prev => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={17} color="#94a3b8" />
                  ) : (
                    <Eye size={17} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Confirm Password ── */}
            <View style={styles.group}>
              <Text style={styles.label}>CONFIRM PASSWORD *</Text>
              <View style={[
                styles.inputRow,
                form.confirm && form.confirm !== form.password && styles.inputRowError,
              ]}>
                <Lock size={17} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={form.confirm}
                  onChangeText={v => update('confirm', v)}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(prev => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showConfirm ? (
                    <EyeOff size={17} color="#94a3b8" />
                  ) : (
                    <Eye size={17} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
              {!!form.confirm && form.confirm !== form.password && (
                <Text style={styles.fieldError}>Passwords do not match</Text>
              )}
            </View>

            {/* ── Info Note ── */}
            <View style={styles.infoNote}>
              <Text style={styles.infoNoteText}>
                📧 After registration, you'll receive a verification code to confirm your email address.
              </Text>
            </View>

            {/* ── Submit ── */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Create Account →</Text>
              )}
            </TouchableOpacity>

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                <Text style={styles.footerLink}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Bottom spacer */}
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
    marginTop: 3,
  },
  subtitleSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // ── Card ──
  card: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // ── Error ──
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
    lineHeight: 17,
  },

  // ── Form ──
  group: {
    marginBottom: 16,
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: 0,
    zIndex: 50,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  inputRowFocused: {
    borderColor: '#bfdbfe',
  },
  inputRowError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    height: '100%',
  },
  fieldError: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },

  // ── Gender Picker ──
  pickerBox: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 999,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },

  // ── Info Note ──
  infoNote: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoNoteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369a1',
    lineHeight: 17,
  },

  // ── Submit Button ──
  btn: {
    height: 52,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3b82f6',
  },
});

export default PatientRegister;
