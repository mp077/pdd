export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type TreatmentPhase = 'Phase 1' | 'Phase 2' | 'Phase 3';

export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  implant_site: string;
  lastVisit?: string;
  stability?: number;
  risk_level: RiskLevel;
  avatar?: string;
  created_at?: string;
}

export interface ClinicalStat {
  label: string;
  value: string | number;
  trend: number;
  icon: string;
  color: string;
}

export interface ImplantOption {
  id: string;
  type: string;
  dimensions: string;
  stabilityScore: number;
  recommendation: string;
  badge: string;
}
