import { Patient, ClinicalStat } from '../types';

// Replace with your local machine IP if testing on physical device
const BASE_URL = 'https://dentpulse-api.onrender.com';

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

  registerDoctor: async (doctorDetails: any): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register-doctor`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: doctorDetails.name,
          email: doctorDetails.email,
          password: doctorDetails.password,
          phone_number: doctorDetails.phone_number,
          license_id: doctorDetails.license_id,
          specialization: doctorDetails.specialization,
          clinic_name: doctorDetails.clinic_name,
          role: 'doctor',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Registration failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  sendOtp: async (email: string, method: 'email' | 'sms'): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, method }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to trigger OTP'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  verifyOtp: async (email: string, code: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'OTP verification failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
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
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Authentication failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  logout: async (): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error: any) {
      console.error('API Error:', error);
      return { success: true };
    }
  },

  getCurrentUser: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Session recovery failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getProfile: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Profile retrieval failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // ==========================================
  // NEW Admin API Endpoints
  // ==========================================

  getPendingDoctors: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/pending-doctors`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to fetch pending queue'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return [];
    }
  },

  getApprovedDoctors: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/approved-doctors`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to fetch approved doctors'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return [];
    }
  },

  approveDoctor: async (doctorId: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/approve-doctor/${doctorId}`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Doctor approval failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  rejectDoctor: async (doctorId: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/reject-doctor/${doctorId}`, {
        method: 'POST',
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Doctor rejection failed'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getLoginHistory: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/admin/login-history`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to fetch login histories'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return [];
    }
  },

  forgotPassword: async (emailOrPhone: string, method: 'email' | 'sms'): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email_or_phone: emailOrPhone, method }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to send reset OTP'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  verifyResetOtp: async (emailOrPhone: string, code: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email_or_phone: emailOrPhone, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to verify reset OTP'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  resetPassword: async (emailOrPhone: string, code: string, newPassword: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email_or_phone: emailOrPhone, code, new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Failed to reset password'));
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // ==========================================
  // PATIENT AUTH API
  // ==========================================

  registerPatient: async (details: any): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/patient/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: details.name,
          age: details.age,
          gender: details.gender,
          email: details.email,
          phone_number: details.phone_number,
          password: details.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Registration failed'));
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
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
      console.error('API Error:', error);
      throw error;
    }
  },

  sendPatientOtp: async (email: string, method: 'email' | 'sms'): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/patient/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, method }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to send OTP'));
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  verifyPatientOtp: async (email: string, code: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/patient/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'OTP verification failed'));
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

  bookAppointment: async (data: any, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(res, 'Booking failed'));
      return res;
    } catch (error: any) {
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
