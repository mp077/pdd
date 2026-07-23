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
  email_verified?: boolean;
  is_approved?: boolean;
  approval_status?: string;
  account_status?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  otpEmail: string | null;
  otpPurpose: 'register' | 'forgot_password';
  resetPasswordOtpCode: string | null;
  registrationDetails: any | null;
  login: (email: string, password: string, role: 'doctor' | 'admin') => Promise<{ success: boolean; status?: string; message?: string }>;
  loginPatient: (email: string, password: string) => Promise<{ success: boolean; status?: string; message?: string }>;
  sendRegistrationOtp: (details: any) => Promise<{ success: boolean; message?: string }>;
  verifyRegistrationOtp: (code: string) => Promise<{ success: boolean; message?: string }>;
  resendRegistrationOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearOtpSession: () => void;
  requestForgotPassword: (emailOrPhone: string, method: 'email' | 'sms') => Promise<void>;
  submitNewPassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  setForgotPasswordSession: (emailOrPhone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpPurpose, setOtpPurpose] = useState<'register' | 'forgot_password'>('register');
  const [resetPasswordOtpCode, setResetPasswordOtpCode] = useState<string | null>(null);
  const [registrationDetails, setRegistrationDetails] = useState<any | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await safeStorage.getItem('dentpulse_auth_token');
        const storedOtpEmail = await safeStorage.getItem('dentpulse_otp_email');
        const storedRegDetails = await safeStorage.getItem('dentpulse_reg_details');

        if (storedOtpEmail) setOtpEmail(storedOtpEmail);
        if (storedRegDetails) setRegistrationDetails(JSON.parse(storedRegDetails));

        if (storedToken) {
          try {
            const profile = await api.getProfile(storedToken);
            setToken(storedToken);
            setUser(profile);
          } catch (e) {
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

      if (authData.role !== role) {
        return {
          success: false,
          message: `Invalid credentials. This account is registered as a ${authData.role.toUpperCase()}.`,
        };
      }

      await safeStorage.setItem('dentpulse_auth_token', authData.access_token);
      setToken(authData.access_token);
      
      const profile = await api.getProfile(authData.access_token);
      setUser(profile);

      return { success: true, status: 'authenticated' };
    } catch (error: any) {
      console.error('Context Login Error:', error);
      const errMsg = error.message || '';
      
      return {
        success: false,
        message: errMsg || 'Incorrect email or password.',
      };
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
      return { success: false, message: error.message || 'Login failed.' };
    }
  };

  const sendRegistrationOtp = async (details: any) => {
    try {
      await api.sendRegistrationOtp({
        email: details.email,
        phone_number: details.phone_number
      });
      setOtpEmail(details.email);
      setRegistrationDetails(details);
      setOtpPurpose('register');
      await safeStorage.setItem('dentpulse_otp_email', details.email);
      await safeStorage.setItem('dentpulse_reg_details', JSON.stringify(details));
      return { success: true };
    } catch (error: any) {
      console.error('Context Register OTP Error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed.',
      };
    }
  };

  const verifyRegistrationOtp = async (code: string) => {
    if (!otpEmail || !registrationDetails) {
      return { success: false, message: 'No active registration session found.' };
    }
    try {
      await api.verifyRegistrationOtp({
        email: otpEmail,
        code: code,
        ...registrationDetails
      });
      
      // Cleanup OTP state after success
      setOtpEmail(null);
      setRegistrationDetails(null);
      await safeStorage.removeItem('dentpulse_otp_email');
      await safeStorage.removeItem('dentpulse_reg_details');
      
      return { success: true };
    } catch (error: any) {
      console.error('Context Verify OTP Error:', error);
      return {
        success: false,
        message: error.message || 'Invalid verification code.',
      };
    }
  };

  const resendRegistrationOtp = async (email: string) => {
    try {
      const result = await api.resendRegistrationOtp(email);
      return { success: true, message: result.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to resend.' };
    }
  };

  const register = async (payload: any) => {
    try {
      const response = await api.register(payload);
      return { success: true, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed.' };
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

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('API Logout Error:', e);
    } finally {
      await safeStorage.removeItem('dentpulse_auth_token');
      await safeStorage.removeItem('dentpulse_otp_email');
      await safeStorage.removeItem('dentpulse_reg_details');
      setToken(null);
      setUser(null);
      setOtpEmail(null);
      setRegistrationDetails(null);
      setOtpPurpose('register');
      setResetPasswordOtpCode(null);
    }
  };

  const clearOtpSession = () => {
    setOtpEmail(null);
    setOtpPurpose('register');
    setRegistrationDetails(null);
    setResetPasswordOtpCode(null);
    safeStorage.removeItem('dentpulse_otp_email');
    safeStorage.removeItem('dentpulse_reg_details');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        otpEmail,
        otpPurpose,
        resetPasswordOtpCode,
        registrationDetails,
        login,
        loginPatient,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        logout,
        clearOtpSession,
        requestForgotPassword,
        submitNewPassword,
        setForgotPasswordSession,
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
