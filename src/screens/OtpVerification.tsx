import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, CheckCircle } from 'lucide-react-native';

interface OtpVerificationProps {
  onNavigateToLogin: () => void;
  onNavigateToPending: () => void;
  onNavigateToCreatePassword: () => void;
}

export default function OtpVerification({ 
  onNavigateToLogin, 
  onNavigateToPending 
}: OtpVerificationProps) {
  const { verifyRegistrationOtp, otpEmail, resendRegistrationOtp } = useAuth();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(45);
  const [success, setSuccess] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !success) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, success]);

  const handleChange = (text: string, index: number) => {
    // Support paste functionality
    if (text.length > 1) {
      const pasted = text.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newCode = [...code];
      pasted.forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setCode(newCode);
      const lastIndex = Math.min(pasted.length, 5);
      inputs.current[lastIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = code.join('');
    if (otpString.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await verifyRegistrationOtp(otpString);
      if (!response.success) {
        setError(response.message || 'Invalid code');
        setLoading(false);
        return;
      }

      setSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Display success message before navigating
      setTimeout(() => {
        // If the backend returned role, use it. Otherwise, default to Login.
        if (response.role === 'doctor') {
          onNavigateToPending();
        } else {
          onNavigateToLogin();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid code');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const result = await resendRegistrationOtp();
      if (result.success) {
        setTimer(45);
        setError('');
      } else {
        setError(result.message || 'Failed to resend');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend');
    }
  };

  // Mask email: "ma****@gmail.com"
  const getMaskedEmail = (email: string) => {
    if (!email) return 'your email';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.length > 2 ? name.substring(0, 2) + '*'.repeat(name.length - 2) : name;
    return `${maskedName}@${domain}`;
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <CheckCircle size={64} color="#16a34a" style={{ marginBottom: 24 }} />
          <Text style={styles.successTitle}>Account Verified Successfully</Text>
          <Text style={styles.successSubtitle}>Continue to Login...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <HeartPulse color="#2563EB" size={28} />
        </View>

        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          A code has been sent to{'\n'}
          <Text style={styles.emailText}>{getMaskedEmail(otpEmail)}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => inputs.current[index] = el}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                error ? styles.otpInputError : null
              ]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={6} // allow paste
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={styles.verifyBtn} 
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={styles.resendText}>Resend in {timer} seconds</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#eff6ff',
  },
  otpInputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyBtn: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  }
});
