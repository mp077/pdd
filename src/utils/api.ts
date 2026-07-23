import { Patient, ClinicalStat } from '../types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dynamically resolve the backend URL for physical devices on the same network
let BASE_URL = 'http://localhost:8000';

if (Platform.OS !== 'web' && Constants.expoConfig?.hostUri) {
  const host = Constants.expoConfig.hostUri.split(':')[0];
  BASE_URL = `http://${host}:8000`;
}

const getHeaders = (token?: string | null) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getErrorMessage = (data: any, fallback: string): string => {
  if (!data) return fallback;
  if (data.detail !== undefined && data.detail !== null) {
    if (Array.isArray(data.detail)) {
      return data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
    }
    if (typeof data.detail === 'object') {
      return data.detail.message || JSON.stringify(data.detail);
    }
    return String(data.detail);
  }
  return data.message || fallback;
};

export const api = {
  // Existing Patient & Clinical API Endpoints (Preserved!)
  getPatients: async (token?: string | null): Promise<Patient[]> => {
    try {
      const response = await fetch(`${BASE_URL}/patients`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  addPatient: async (patientData: Partial<Patient>, token?: string | null): Promise<Patient | null> => {
    try {
      const response = await fetch(`${BASE_URL}/patients/`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(patientData),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  getStats: async (token?: string | null): Promise<ClinicalStat[]> => {
    try {
      const response = await fetch(`${BASE_URL}/stats`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  getRecommendations: async (token?: string | null): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/recommendations`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  generatePlan: async (planData: any, token?: string | null): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/planning/generate`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(planData),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  confirmPlan: async (confirmData: any, token?: string | null): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/planning/confirm`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(confirmData),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  logMonitoring: async (logData: any, token?: string | null): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/monitoring/log/`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(logData),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  getInsights: async (patientId: number, token?: string | null): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/insights/${patientId}/`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // ==========================================
  // NEW Authentication & Approval API Endpoints
  // ==========================================

  register: async (payload: any): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Registration failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  sendRegistrationOtp: async (payload: any): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/send-registration-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to trigger OTP'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  verifyRegistrationOtp: async (payload: any): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'OTP verification failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  resendRegistrationOtp: async (email: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/resend-registration-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to resend OTP'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  login: async (username: string, password: string, device_info: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password, device_info }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Authentication failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  loginPatient: async (email: string, password: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/patient/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Login failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  getProfile: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Profile retrieval failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  getPatientProfile: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/patient/profile`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Profile retrieval failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  // ==========================================
  // ADMIN API
  // ==========================================

  getAdminOverview: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/overview-stats`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  getDoctorProfile: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/doctor/${id}`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch doctor'));
      return data;
    } catch (error) {
      throw error;
    }
  },

  suspendDoctor: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/suspend-doctor/${id}`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to suspend doctor'));
      return data;
    } catch (error) {
      throw error;
    }
  },

  deactivateDoctor: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/deactivate-doctor/${id}`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to deactivate doctor'));
      return data;
    } catch (error) {
      throw error;
    }
  },

  getPendingDoctors: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/pending-doctors`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getApprovedDoctorsAdmin: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/approved-doctors`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getLoginHistory: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/login-history`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  approveDoctor: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/approve-doctor/${id}`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Approval failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  rejectDoctor: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/reject-doctor/${id}`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Rejection failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  // ==========================================
  // APPOINTMENTS API
  // ==========================================

  getApprovedDoctorsForPatient: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/approved-doctors`, {
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  bookAppointment: async (payload: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Booking failed'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  cancelAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  getMyAppointments: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/my`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getMyPrescriptions: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/prescriptions`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  addPrescription: async (payload: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/prescriptions/bulk`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  getRecoveryTimeline: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/timeline`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getDoctorAppointments: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/doctor`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  acceptAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/accept`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  rejectAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/reject`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  completeAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/complete`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  rescheduleAppointment: async (id: number, new_date: string, new_time: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ new_date, new_time }),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  cancelAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  // ==========================================
  // RECOVERY API
  // ==========================================

  getRecoveryTimeline: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/timeline`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getRecoveryStatus: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/status`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  getMyPrescriptions: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/prescriptions`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getRegisteredPatients: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/patients-list`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  addPrescription: async (data: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/recovery/prescriptions`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  // ==========================================
  // CHATBOT API
  // ==========================================

  sendChatMessage: async (message: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } catch (error) {
      return { response: 'I am currently unavailable. Please try again shortly.' };
    }
  },

  getChatHistory: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/chatbot/history`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  // ==========================================
  // APPOINTMENTS API
  // ==========================================
  getApprovedDoctors: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/approved-doctors`);
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  bookAppointment: async (data: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getMyAppointments: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/my`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  getDoctorAppointments: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/doctor`, {
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  acceptAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/accept`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  rescheduleAppointment: async (id: number, new_date: string, new_time: string, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ new_date, new_time }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  cancelAppointment: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
