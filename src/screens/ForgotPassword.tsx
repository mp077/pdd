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
import { Mail, Phone, ChevronLeft, BrainCircuit } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
  onNavigateToOtp: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onNavigateToLogin,
  onNavigateToOtp,
}) => {
  const { requestForgotPassword } = useAuth();
  const { isMobile } = useResponsive();

  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      setErrorMsg(`Please enter your ${method === 'email' ? 'email address' : 'phone number'}.`);
      return;
    }

    if (method === 'email' && !trimmedInput.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await requestForgotPassword(trimmedInput, method);
      setLoading(false);
      onNavigateToOtp(); // Navigate directly to OtpVerification
    } catch (e: any) {
      setLoading(false);
      setErrorMsg(e.message || 'Failed to dispatch security code. Please check your input.');
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      {/* Header back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onNavigateToLogin}
        activeOpacity={0.7}
      >
        <ChevronLeft size={20} color="#3b82f6" />
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>

      {/* Branding */}
      <View style={styles.brandingBox}>
        <View style={styles.logoCircle}>
          <BrainCircuit size={28} color="#3b82f6" />
        </View>
        <Text style={styles.brandTitle}>Recover Account</Text>
        <Text style={styles.brandSubtitle}>DentPulse AI security protocol</Text>
      </View>

      <Text style={styles.infoText}>
        Select your verification channel and provide your registered credentials to receive a secure 4-digit OTP.
      </Text>

      {/* Switcher Pill */}
      <View style={styles.switcherBg}>
        <TouchableOpacity
          style={[styles.switcherBtn, method === 'email' && styles.switcherBtnActive]}
          onPress={() => {
            setMethod('email');
            setInputValue('');
            setErrorMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Mail size={16} color={method === 'email' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.switcherText, method === 'email' && styles.switcherTextActive]}>
            Email Verification
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switcherBtn, method === 'sms' && styles.switcherBtnActive]}
          onPress={() => {
            setMethod('sms');
            setInputValue('');
            setErrorMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Phone size={16} color={method === 'sms' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.switcherText, method === 'sms' && styles.switcherTextActive]}>
            SMS Text Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Output */}
      {errorMsg && (
        <View style={styles.errorBubble}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Input field dynamically styled */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {method === 'email' ? 'Registered Email' : 'Mobile Phone Number'}
        </Text>
        <View style={styles.inputWrapper}>
          {method === 'email' ? (
            <Mail size={18} color="#94a3b8" />
          ) : (
            <Phone size={18} color="#94a3b8" />
          )}
          <TextInput
            style={styles.input}
            placeholder={method === 'email' ? 'doctor@clinic.com' : '+15551234567'}
            placeholderTextColor="#cbd5e1"
            keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.disabledBtn]}
        onPress={handleRequestOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Send Verification Code</Text>
        )}
      </TouchableOpacity>
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

  // Desktop Split Screen Layout
  return (
    <View style={styles.webRoot}>
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
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  webRight: {
    flex: 1,
    justifyContent: 'center',
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
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
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  switcherBg: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  switcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
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
    fontSize: 12,
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
    marginBottom: 24,
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
  submitBtn: {
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
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default ForgotPassword;
