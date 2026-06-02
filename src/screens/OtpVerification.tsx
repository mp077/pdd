import React, { useState, useEffect, useRef } from 'react';
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
import { Mail, Phone, Clock, RotateCcw, ChevronLeft, BrainCircuit } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/premium/GlassCard';

interface OtpVerificationProps {
  onNavigateToLogin: () => void;
  onNavigateToPending: () => void;
  onNavigateToCreatePassword?: () => void;
  onNavigateToPatientHome?: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  onNavigateToLogin, 
  onNavigateToPending,
  onNavigateToCreatePassword,
  onNavigateToPatientHome,
}) => {
  const { otpEmail, otpPurpose, otpRole, sendOtpCode, verifyOtpCode, clearOtpSession } = useAuth();

  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Refs for 4 OTP inputs to auto-focus
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Proactively trigger OTP send on mount if email exists
  useEffect(() => {
    if (otpEmail) {
      handleResend(true); // Silent trigger
    }
  }, [otpEmail, channel]);

  const handleTextChange = (text: string, index: number) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    // Auto-focus next input
    if (cleanText.length > 0) {
      if (index === 0) ref2.current?.focus();
      else if (index === 1) ref3.current?.focus();
      else if (index === 2) ref4.current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // If backspace is pressed on an empty input, focus previous input
    if (e.nativeEvent.key === 'Backspace' && code[index] === '') {
      if (index === 1) ref1.current?.focus();
      else if (index === 2) ref2.current?.focus();
      else if (index === 3) ref3.current?.focus();
    }
  };

  const handleResend = async (silent = false) => {
    if (!otpEmail) {
      setErrorMsg('No active registration session found.');
      return;
    }
    if (!silent) {
      setResending(true);
      setErrorMsg(null);
      setSuccessMsg(null);
    }

    try {
      await sendOtpCode(otpEmail, channel);
      if (!silent) {
        setSuccessMsg(`A fresh security code has been sent to your registered ${channel}.`);
        setTimer(59);
      }
    } catch (e: any) {
      if (!silent) {
        setErrorMsg(e.message || 'Failed to dispatch verification code.');
      }
    } finally {
      if (!silent) {
        setResending(false);
      }
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 4) {
      setErrorMsg('Please enter all 4 digits.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await verifyOtpCode(fullCode);
      if (result.success) {
        if (otpPurpose === 'forgot_password') {
          onNavigateToCreatePassword?.();
        } else if (result.isPatient || otpRole === 'patient') {
          // Patient verification success → go to PatientHome (token already set in context)
          clearOtpSession();
          onNavigateToPatientHome?.();
        } else {
          // Doctor verification success → go to Pending Approval screen
          clearOtpSession();
          onNavigateToPending();
        }
      } else {
        setErrorMsg(result.message || 'OTP verification failed.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Verification error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderOtpForm = () => (
    <View style={styles.formContainer}>
      {/* Header Navigation */}
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => {
          clearOtpSession();
          onNavigateToLogin();
        }} 
        activeOpacity={0.7}
      >
        <ChevronLeft size={20} color="#3b82f6" />
        <Text style={styles.backText}>Cancel Verification</Text>
      </TouchableOpacity>

      {/* Branding */}
      <View style={styles.brandingBox}>
        <View style={styles.logoCircle}>
          <BrainCircuit size={24} color="#3b82f6" />
        </View>
        <Text style={styles.brandTitle}>Two-Factor OTP</Text>
        <Text style={styles.brandSubtitle}>Verifying: {otpEmail || 'your email'}</Text>
      </View>

      {/* Channel Switcher */}
      <View style={styles.channelBg}>
        <TouchableOpacity
          style={[styles.channelBtn, channel === 'email' && styles.channelBtnActive]}
          onPress={() => {
            setChannel('email');
            setCode(['', '', '', '']);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Mail size={16} color={channel === 'email' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.channelText, channel === 'email' && styles.channelTextActive]}>
            Email Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.channelBtn, channel === 'sms' && styles.channelBtnActive]}
          onPress={() => {
            setChannel('sms');
            setCode(['', '', '', '']);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          activeOpacity={0.8}
        >
          <Phone size={16} color={channel === 'sms' ? '#3b82f6' : '#64748b'} />
          <Text style={[styles.channelText, channel === 'sms' && styles.channelTextActive]}>
            SMS Code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Bubbles */}
      {errorMsg && (
        <View style={styles.errorBubble}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {successMsg && (
        <View style={styles.successBubble}>
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {/* OTP Code Fields */}
      <View style={styles.otpGrid}>
        <TextInput
          ref={ref1}
          style={styles.otpBox}
          keyboardType="number-pad"
          maxLength={1}
          value={code[0]}
          onChangeText={(val) => handleTextChange(val, 0)}
          onKeyPress={(e) => handleKeyPress(e, 0)}
          selectTextOnFocus
        />
        <TextInput
          ref={ref2}
          style={styles.otpBox}
          keyboardType="number-pad"
          maxLength={1}
          value={code[1]}
          onChangeText={(val) => handleTextChange(val, 1)}
          onKeyPress={(e) => handleKeyPress(e, 1)}
          selectTextOnFocus
        />
        <TextInput
          ref={ref3}
          style={styles.otpBox}
          keyboardType="number-pad"
          maxLength={1}
          value={code[2]}
          onChangeText={(val) => handleTextChange(val, 2)}
          onKeyPress={(e) => handleKeyPress(e, 2)}
          selectTextOnFocus
        />
        <TextInput
          ref={ref4}
          style={styles.otpBox}
          keyboardType="number-pad"
          maxLength={1}
          value={code[3]}
          onChangeText={(val) => handleTextChange(val, 3)}
          onKeyPress={(e) => handleKeyPress(e, 3)}
          selectTextOnFocus
        />
      </View>

      {/* Timer & Resend */}
      <View style={styles.timerRow}>
        {timer > 0 ? (
          <View style={styles.timerBox}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.resendBtn} 
            onPress={() => handleResend(false)} 
            disabled={resending}
            activeOpacity={0.7}
          >
            <RotateCcw size={14} color="#3b82f6" />
            <Text style={styles.resendText}>
              {resending ? 'Sending...' : 'Resend Verification Code'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Verify */}
      <TouchableOpacity
        style={[styles.verifyBtn, loading && styles.disabledBtn]}
        onPress={handleVerify}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.verifyBtnText}>Verify Security Code</Text>
        )}
      </TouchableOpacity>

      {/* Sandbox Help */}
      <View style={styles.sandboxHelp}>
        <Text style={styles.sandboxTitle}>🧪 Developer Sandbox Sandbox Testing</Text>
        <Text style={styles.sandboxDesc}>
          1. The generated OTP is printed directly in the **FastAPI Terminal console** for easy reference.
        </Text>
        <Text style={styles.sandboxDesc}>
          2. Alternatively, enter the bypass code **"1234"** to immediately verify and proceed.
        </Text>
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
          <GlassCard style={styles.formCard}>{renderOtpForm()}</GlassCard>
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
  },
  cardContainer: {
    width: '100%',
    maxWidth: 450,
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
    textAlign: 'center',
  },
  channelBg: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  channelBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  channelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  channelTextActive: {
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
  successBubble: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  otpBox: {
    width: '22%',
    height: 56,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
  verifyBtn: {
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
    marginBottom: 28,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  verifyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  sandboxHelp: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  sandboxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  sandboxDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 15,
  },
});

export default OtpVerification;
