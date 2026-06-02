import React, { useState, useEffect } from 'react';
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
import { Lock, Eye, EyeOff, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';

interface CreateNewPasswordProps {
  onNavigateToLogin: () => void;
}

const CreateNewPassword: React.FC<CreateNewPasswordProps> = ({ onNavigateToLogin }) => {
  const { submitNewPassword } = useAuth();
  const { isMobile } = useResponsive();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password rules validation states
  const [rules, setRules] = useState({
    minChar: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const [strength, setStrength] = useState<{
    label: string;
    color: string;
    width: string;
  }>({ label: 'Too Weak', color: '#ef4444', width: '0%' });

  // Update rule indicators and strength meter live
  useEffect(() => {
    const minChar = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    setRules({ minChar, hasUpper, hasLower, hasNumber, hasSpecial });

    // Calculate score (0-5)
    let score = 0;
    if (minChar) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    let label = 'Too Weak';
    let color = '#ef4444'; // Red
    let width = '20%';

    if (score === 0) {
      label = 'Too Weak';
      color = '#ef4444';
      width = '5%';
    } else if (score <= 2) {
      label = 'Weak';
      color = '#f87171'; // Light Red
      width = '35%';
    } else if (score <= 4) {
      label = 'Medium';
      color = '#f59e0b'; // Amber
      width = '65%';
    } else if (score === 5) {
      label = 'Strong';
      color = '#10b981'; // Green
      width = '100%';
    }

    setStrength({ label, color, width });
  }, [password]);

  const handleSubmit = async () => {
    // Validate rules
    const allRulesMet = Object.values(rules).every((val) => val === true);
    if (!allRulesMet) {
      setErrorMsg('Please satisfy all password strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await submitNewPassword(password);
      setLoading(false);
      if (result.success) {
        setSuccessMsg('Your password was successfully updated.');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } else {
        setErrorMsg(result.message || 'Failed to update password.');
      }
    } catch (e: any) {
      setLoading(false);
      setErrorMsg(e.message || 'An error occurred during submission.');
    }
  };

  const renderRuleIndicator = (isMet: boolean, text: string) => (
    <View style={styles.ruleRow}>
      <View style={[styles.bullet, isMet ? styles.bulletMet : styles.bulletUnmet]}>
        {isMet ? (
          <Check size={10} color="#ffffff" strokeWidth={3} />
        ) : (
          <X size={10} color="#94a3b8" strokeWidth={3} />
        )}
      </View>
      <Text style={[styles.ruleText, isMet && styles.ruleTextMet]}>{text}</Text>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      {/* Branding */}
      <View style={styles.brandingBox}>
        <View style={styles.logoCircle}>
          <ShieldAlert size={28} color="#3b82f6" />
        </View>
        <Text style={styles.brandTitle}>Reset Password</Text>
        <Text style={styles.brandSubtitle}>Create new access credentials</Text>
      </View>

      {/* Dynamic Feedback bubbles */}
      {errorMsg && (
        <View style={styles.errorBubble}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {successMsg && (
        <View style={styles.successBubble}>
          <ShieldCheck size={16} color="#047857" style={{ marginRight: 6 }} />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {/* Input Group — New Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
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

      {/* Password Strength Meter */}
      <View style={styles.strengthContainer}>
        <View style={styles.strengthHeader}>
          <Text style={styles.strengthLabel}>Password Strength:</Text>
          <Text style={[styles.strengthValue, { color: strength.color }]}>
            {strength.label}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: strength.width as any, backgroundColor: strength.color },
            ]}
          />
        </View>
      </View>

      {/* Live Checklists */}
      <View style={styles.rulesContainer}>
        {renderRuleIndicator(rules.minChar, 'Minimum 8 characters')}
        {renderRuleIndicator(rules.hasUpper, 'At least 1 uppercase letter (A-Z)')}
        {renderRuleIndicator(rules.hasLower, 'At least 1 lowercase letter (a-z)')}
        {renderRuleIndicator(rules.hasNumber, 'At least 1 numerical digit (0-9)')}
        {renderRuleIndicator(rules.hasSpecial, 'At least 1 special character (!@#...)' )}
      </View>

      {/* Input Group — Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={18} color="#94a3b8" />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#cbd5e1"
            secureTextEntry={secureConfirmText}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrorMsg(null);
            }}
          />
          <TouchableOpacity
            onPress={() => setSecureConfirmText(!secureConfirmText)}
            style={styles.eyeBtn}
          >
            {secureConfirmText ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, (loading || !!successMsg) && styles.disabledBtn]}
        onPress={handleSubmit}
        disabled={loading || !!successMsg}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Update Access Password</Text>
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

  // Desktop Web UI
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
    flexDirection: 'row',
    alignItems: 'center',
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
  strengthContainer: {
    marginBottom: 14,
    gap: 6,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  strengthValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rulesContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletMet: {
    backgroundColor: '#10b981',
  },
  bulletUnmet: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  ruleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  ruleTextMet: {
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
    marginTop: 6,
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

export default CreateNewPassword;
