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
} from 'react-native';
import { User, Mail, Phone, Lock, Stethoscope, Hospital, Award, ChevronLeft, Eye, EyeOff, BrainCircuit } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';

interface RegisterDoctorProps {
  onNavigateToLogin: () => void;
  onNavigateToOtp: () => void;
}

const RegisterDoctor: React.FC<RegisterDoctorProps> = ({ onNavigateToLogin, onNavigateToOtp }) => {
  const { registerDoctor, sendOtpCode } = useAuth();
  const { isMobile } = useResponsive();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    // Fields Validation
    if (!name || !email || !phone || !password || !confirmPassword || !specialization || !clinicName || !licenseId) {
      setErrorMsg('Please fill out all registration fields.');
      return;
    }
    
    // Email basic check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password Match
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Password Strength (min 6 characters)
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await registerDoctor({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone_number: phone.trim(),
        license_id: licenseId.trim(),
        specialization: specialization.trim(),
        clinic_name: clinicName.trim(),
      });

      if (result.success) {
        // Automatically request mock OTP trigger to registration email
        try {
          await sendOtpCode(email.trim().toLowerCase(), 'email');
        } catch (otpErr) {
          console.warn('Silent OTP trigger error:', otpErr);
        }
        onNavigateToOtp();
      } else {
        setErrorMsg(result.message || 'Registration failed.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      {/* Header Navigation */}
      <TouchableOpacity style={styles.backBtn} onPress={onNavigateToLogin} activeOpacity={0.7}>
        <ChevronLeft size={20} color="#3b82f6" />
        <Text style={styles.backText}>Back to Sign In</Text>
      </TouchableOpacity>

      {/* Branding */}
      <View style={styles.brandingBox}>
        <View style={styles.logoCircle}>
          <BrainCircuit size={24} color="#3b82f6" />
        </View>
        <Text style={styles.brandTitle}>Clinical Registration</Text>
        <Text style={styles.brandSubtitle}>Join DentPulse AI Post-Implant Network</Text>
      </View>

      {errorMsg && (
        <View style={styles.errorBubble}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Grid Inputs */}
      <View style={styles.inputsGrid}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Dr. Sarah Jenkins"
              placeholderTextColor="#cbd5e1"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrorMsg(null);
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="s.jenkins@clinic.com"
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

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="+1 555-019-28"
                placeholderTextColor="#cbd5e1"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setErrorMsg(null);
                }}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>License ID</Text>
            <View style={styles.inputWrapper}>
              <Award size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="LIC-92801-D"
                placeholderTextColor="#cbd5e1"
                value={licenseId}
                onChangeText={(text) => {
                  setLicenseId(text);
                  setErrorMsg(null);
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Specialization</Text>
            <View style={styles.inputWrapper}>
              <Stethoscope size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Prosthodontist"
                placeholderTextColor="#cbd5e1"
                value={specialization}
                onChangeText={(text) => {
                  setSpecialization(text);
                  setErrorMsg(null);
                }}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Clinic Name</Text>
            <View style={styles.inputWrapper}>
              <Hospital size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="SmileCare Center"
                placeholderTextColor="#cbd5e1"
                value={clinicName}
                onChangeText={(text) => {
                  setClinicName(text);
                  setErrorMsg(null);
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="•••••••• (Min 6 chars)"
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#cbd5e1"
              secureTextEntry={secureText}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMsg(null);
              }}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={[styles.regBtn, loading && styles.disabledBtn]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.regBtnText}>Register & Send OTP</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Already have an account?</Text>
        <TouchableOpacity onPress={onNavigateToLogin}>
          <Text style={styles.footerAction}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cardContainer}>
          <GlassCard style={styles.formCard}>{renderRegisterForm()}</GlassCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 550,
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
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
  inputsGrid: {
    gap: 16,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  eyeBtn: {
    padding: 6,
  },
  regBtn: {
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
  regBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
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

export default RegisterDoctor;
