import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { Platform } from 'react-native';

class SafeStorage {
  private mem: Record<string, string> = {};

  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      return val;
    } catch (e) {
      return this.mem[key] || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      this.mem[key] = value;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      delete this.mem[key];
    }
  }
}

const safeStorage = new SafeStorage();

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  specialization?: string;
  clinic_name?: string;
  phone_number?: string;
  license_id?: string;
  role: string;
  is_verified?: boolean;
  is_approved?: boolean;
  approval_status?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  otpEmail: string | null;
  otpPurpose: 'register' | 'forgot_password';
  otpRole: 'doctor' | 'patient';
  resetPasswordOtpCode: string | null;
  login: (email: string, password: string, role: 'doctor' | 'admin') => Promise<{ success: boolean; status?: string; message?: string }>;
  registerDoctor: (details: any) => Promise<{ success: boolean; message?: string }>;
  sendOtpCode: (email: string, method: 'email' | 'sms') => Promise<void>;
  verifyOtpCode: (code: string) => Promise<{ success: boolean; message?: string; isPatient?: boolean }>;
  logout: () => Promise<void>;
  clearOtpSession: () => void;
  setPendingVerificationEmail: (email: string) => void;
  requestForgotPassword: (emailOrPhone: string, method: 'email' | 'sms') => Promise<void>;
  submitNewPassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  setForgotPasswordSession: (emailOrPhone: string) => void;
  // Patient-specific
  registerPatient: (details: any) => Promise<{ success: boolean; message?: string }>;
  loginPatient: (email: string, password: string) => Promise<{ success: boolean; status?: string; message?: string }>;
  sendPatientOtpCode: (email: string, method: 'email' | 'sms') => Promise<void>;
  verifyPatientOtpCode: (code: string) => Promise<{ success: boolean; message?: string; token?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpPurpose, setOtpPurpose] = useState<'register' | 'forgot_password'>('register');
  const [otpRole, setOtpRole] = useState<'doctor' | 'patient'>('doctor');
  const [resetPasswordOtpCode, setResetPasswordOtpCode] = useState<string | null>(null);

  // Load token and user profile on app start (Session recovery)
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await safeStorage.getItem('dentpulse_auth_token');
        const storedOtpEmail = await safeStorage.getItem('dentpulse_otp_email');
        const storedOtpRole = await safeStorage.getItem('dentpulse_otp_role');

        if (storedOtpEmail) {
          setOtpEmail(storedOtpEmail);
        }
        if (storedOtpRole === 'patient') {
          setOtpRole('patient');
        }

        if (storedToken) {
          // Try doctor/admin profile first
          try {
            const profile = await api.getProfile(storedToken);
            setToken(storedToken);
            setUser(profile);
          } catch (e) {
            // Try patient profile (patient tokens use a different table)
            try {
              const patientProfile = await api.getPatientProfile(storedToken);
              setToken(storedToken);
              setUser({ ...patientProfile, role: 'patient' });
            } catch (e2) {
              await safeStorage.removeItem('dentpulse_auth_token');
            }
          }
        }
      } catch (e) {
        console.error('Session recovery error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string, role: 'doctor' | 'admin') => {
    try {
      const device = Platform.OS === 'web' ? 'Web Browser' : Platform.OS === 'ios' ? 'iOS App' : 'Android App';
      const authData = await api.login(email, password, device);

      // Verify the role matches the selector choice
      if (authData.role !== role) {
        return {
          success: false,
          message: `Invalid credentials. This account is registered as a ${authData.role.toUpperCase()}.`,
        };
      }

      // Check if unverified doctor
      if (authData.role === 'doctor' && !authData.is_verified) {
        setOtpEmail(email);
        await safeStorage.setItem('dentpulse_otp_email', email);
        return {
          success: true,
          status: 'needs_otp',
          message: 'Please complete your OTP verification.',
        };
      }

      // If approved or admin, grant session access
      await safeStorage.setItem('dentpulse_auth_token', authData.access_token);
      setToken(authData.access_token);
      
      const profile = await api.getProfile(authData.access_token);
      setUser(profile);

      return { success: true, status: 'authenticated' };
    } catch (error: any) {
      console.error('Context Login Error:', error);
      const errMsg = error.message || '';
      
      if (errMsg.includes('awaiting admin approval')) {
        setOtpEmail(email);
        return {
          success: true,
          status: 'pending_approval',
          message: 'Your account is awaiting admin approval.',
        };
      }

      if (errMsg.includes('rejected')) {
        return {
          success: false,
          status: 'rejected',
          message: 'Your account application has been rejected by the administrator.',
        };
      }

      if (errMsg.includes('verified')) {
        setOtpEmail(email);
        return {
          success: true,
          status: 'needs_otp',
          message: 'Please verify your OTP code.',
        };
      }

      return {
        success: false,
        message: error.message || 'Incorrect email or password.',
      };
    }
  };

  const registerDoctor = async (details: any) => {
    try {
      const newUser = await api.registerDoctor(details);
      setOtpEmail(newUser.email);
      await safeStorage.setItem('dentpulse_otp_email', newUser.email);
      return { success: true };
    } catch (error: any) {
      console.error('Context Register Error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. The email may already be registered.',
      };
    }
  };

  const sendOtpCode = async (email: string, method: 'email' | 'sms') => {
    try {
      if (otpRole === 'patient') {
        await api.sendPatientOtp(email, method);
      } else if (otpPurpose === 'forgot_password') {
        await api.forgotPassword(email, method);
      } else {
        await api.sendOtp(email, method);
      }
    } catch (error: any) {
      console.error('Context Send OTP Error:', error);
      throw error;
    }
  };

  const verifyOtpCode = async (code: string) => {
    if (!otpEmail) {
      return { success: false, message: 'No active session found.' };
    }
    try {
      if (otpRole === 'patient') {
        // Patient OTP verification path
        const data = await api.verifyPatientOtp(otpEmail, code);
        if (data.access_token) {
          await safeStorage.setItem('dentpulse_auth_token', data.access_token);
          setToken(data.access_token);
          const profile = await api.getPatientProfile(data.access_token);
          setUser({ ...profile, role: 'patient' });
          setOtpEmail(null);
          await safeStorage.removeItem('dentpulse_otp_email');
          await safeStorage.removeItem('dentpulse_otp_role');
          setOtpRole('doctor');
        }
        return { success: true, isPatient: true };
      } else if (otpPurpose === 'forgot_password') {
        await api.verifyResetOtp(otpEmail, code);
        setResetPasswordOtpCode(code); // Save code for reset-password call
        return { success: true };
      } else {
        await api.verifyOtp(otpEmail, code);
        return { success: true };
      }
    } catch (error: any) {
      console.error('Context Verify OTP Error:', error);
      return {
        success: false,
        message: error.message || 'Invalid code. Please try again.',
      };
    }
  };

  const requestForgotPassword = async (emailOrPhone: string, method: 'email' | 'sms') => {
    try {
      setOtpPurpose('forgot_password');
      setOtpEmail(emailOrPhone);
      await safeStorage.setItem('dentpulse_otp_email', emailOrPhone);
      await api.forgotPassword(emailOrPhone, method);
    } catch (error: any) {
      console.error('Context Request Forgot Password Error:', error);
      throw error;
    }
  };

  const submitNewPassword = async (newPassword: string) => {
    if (!otpEmail || !resetPasswordOtpCode) {
      return { success: false, message: 'Reset session expired. Please start over.' };
    }
    try {
      await api.resetPassword(otpEmail, resetPasswordOtpCode, newPassword);
      // Clear reset states
      setResetPasswordOtpCode(null);
      setOtpEmail(null);
      setOtpPurpose('register');
      await safeStorage.removeItem('dentpulse_otp_email');
      return { success: true };
    } catch (error: any) {
      console.error('Context Submit New Password Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update password.',
      };
    }
  };

  const setForgotPasswordSession = (emailOrPhone: string) => {
    setOtpEmail(emailOrPhone);
    setOtpPurpose('forgot_password');
    safeStorage.setItem('dentpulse_otp_email', emailOrPhone);
  };

  // ==========================================
  // PATIENT AUTH METHODS
  // ==========================================

  const registerPatient = async (details: any) => {
    try {
      const data = await api.registerPatient(details);
      setOtpEmail(data.email);
      setOtpPurpose('register');
      setOtpRole('patient');
      await safeStorage.setItem('dentpulse_otp_email', data.email);
      await safeStorage.setItem('dentpulse_otp_role', 'patient');
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed.' };
    }
  };

  const loginPatient = async (email: string, password: string) => {
    try {
      const authData = await api.loginPatient(email, password);
      await safeStorage.setItem('dentpulse_auth_token', authData.access_token);
      setToken(authData.access_token);
      const profile = await api.getPatientProfile(authData.access_token);
      setUser({ ...profile, role: 'patient' });
      return { success: true, status: 'authenticated' };
    } catch (error: any) {
      const errMsg = error.message || '';
      if (errMsg.toLowerCase().includes('verify') || errMsg.toLowerCase().includes('otp')) {
        setOtpEmail(email);
        setOtpRole('patient');
        await safeStorage.setItem('dentpulse_otp_email', email);
        await safeStorage.setItem('dentpulse_otp_role', 'patient');
        return { success: true, status: 'needs_otp' };
      }
      return { success: false, message: errMsg || 'Login failed.' };
    }
  };

  const sendPatientOtpCode = async (email: string, method: 'email' | 'sms') => {
    try {
      await api.sendPatientOtp(email, method);
    } catch (error: any) {
      throw error;
    }
  };

  const verifyPatientOtpCode = async (code: string) => {
    if (!otpEmail) return { success: false, message: 'No active session found.' };
    try {
      const data = await api.verifyPatientOtp(otpEmail, code);
      if (data.access_token) {
        await safeStorage.setItem('dentpulse_auth_token', data.access_token);
        setToken(data.access_token);
        const profile = await api.getPatientProfile(data.access_token);
        setUser({ ...profile, role: 'patient' });
        setOtpEmail(null);
        await safeStorage.removeItem('dentpulse_otp_email');
        await safeStorage.removeItem('dentpulse_otp_role');
      }
      return { success: true, token: data.access_token };
    } catch (error: any) {
      return { success: false, message: error.message || 'Invalid code.' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('API Logout Error:', e);
    } finally {
      await safeStorage.removeItem('dentpulse_auth_token');
      await safeStorage.removeItem('dentpulse_otp_email');
      setToken(null);
      setUser(null);
      setOtpEmail(null);
      setOtpPurpose('register');
      setResetPasswordOtpCode(null);
    }
  };

  const clearOtpSession = () => {
    setOtpEmail(null);
    setOtpPurpose('register');
    setOtpRole('doctor');
    setResetPasswordOtpCode(null);
    safeStorage.removeItem('dentpulse_otp_email');
    safeStorage.removeItem('dentpulse_otp_role');
  };

  const setPendingVerificationEmail = (email: string) => {
    setOtpEmail(email);
    setOtpPurpose('register');
    safeStorage.setItem('dentpulse_otp_email', email);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        otpEmail,
        otpPurpose,
        otpRole,
        resetPasswordOtpCode,
        login,
        registerDoctor,
        sendOtpCode,
        verifyOtpCode,
        logout,
        clearOtpSession,
        setPendingVerificationEmail,
        requestForgotPassword,
        submitNewPassword,
        setForgotPasswordSession,
        registerPatient,
        loginPatient,
        sendPatientOtpCode,
        verifyPatientOtpCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
