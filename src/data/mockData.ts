import { Patient, ClinicalStat } from '../types';

export const mockPatients: Patient[] = [
  { id: '1', patient_id: 'PID-1024', full_name: 'Sarah Johnson', age: 45, implant_site: 'Tooth #14', lastVisit: '2/22/2026', stability: 92, risk_level: 'Low' },
  { id: '2', patient_id: 'PID-1025', full_name: 'Michael Chen', age: 58, implant_site: 'Tooth #30', lastVisit: '2/20/2026', stability: 78, risk_level: 'Moderate' },
  { id: '3', patient_id: 'PID-1026', full_name: 'Emma Davis', age: 62, implant_site: 'Tooth #19', lastVisit: '2/18/2026', stability: 65, risk_level: 'High' },
  { id: '4', patient_id: 'PID-1027', full_name: 'Robert Williams', age: 51, implant_site: 'Tooth #3', lastVisit: '2/15/2026', stability: 95, risk_level: 'Low' },
];

export const mockStats: ClinicalStat[] = [
  { label: 'Total Patients', value: 347, trend: 12, icon: 'users', color: '#3b82f6' },
  { label: 'Active Implants', value: 892, trend: 8, icon: 'activity', color: '#10b981' },
  { label: 'High Risk Cases', value: 23, trend: 3, icon: 'alert-triangle', color: '#ef4444' },
  { label: 'Success Rate', value: '98.4%', trend: 2.1, icon: 'trending-up', color: '#8b5cf6' },
];
