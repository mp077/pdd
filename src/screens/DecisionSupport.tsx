import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import StatusPill from '../components/premium/StatusPill';
import { 
  Search, 
  X, 
  ChevronDown, 
  User, 
  Calendar, 
  TrendingUp, 
  ClipboardList, 
  Activity, 
  Sliders,
  ShieldCheck
} from 'lucide-react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Hardcoded clinical records mapping to match backend records
const CLINICAL_PATIENT_RECORDS: Record<number, any> = {
  1: {
    id: 1,
    full_name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    implant_site: "#14",
    implant_system: "Straumann BLX",
    placement_date: "2026-01-15",
    total_visits: 4,
    last_visit: "2026-04-15",
    diameter: 4.5,
    length: 11.5,
    bone_quality: "D2 (Thick Cortical / Dense Trabecular)",
    recovery_score: 92,
    pain_level: 1,
    swelling: "None",
    bleeding: "None",
    mobility: "M0 (Normal)",
    healing_status: "Excellent Healing",
    risk_level: "Low Risk",
    model_confidence: 96.5,
    history: [
      { type: "Implant Placement", date: "2026-01-15", score: 65, notes: "Excellent primary stability achieved." },
      { type: "Week 1 Review", date: "2026-01-22", score: 72, notes: "Normal healing, minor mucosal swelling." },
      { type: "Month 1 Review", date: "2026-02-15", score: 80, notes: "Bone remodeling within normal limits." },
      { type: "Month 3 Review", date: "2026-04-15", score: 92, notes: "Fantastic secondary stability. Load ready." }
    ]
  },
  2: {
    id: 2,
    full_name: "Marcus O'Neill",
    age: 48,
    gender: "Male",
    implant_site: "#19",
    implant_system: "Nobel Biocare Active",
    placement_date: "2026-02-10",
    total_visits: 3,
    last_visit: "2026-05-10",
    diameter: 5.0,
    length: 10.0,
    bone_quality: "D4 (Soft / Thin Cortical / Sparse)",
    recovery_score: 68,
    pain_level: 4,
    swelling: "Mild",
    bleeding: "Trace",
    mobility: "M1 (Slight)",
    healing_status: "Delayed Healing",
    risk_level: "High Risk",
    model_confidence: 91.2,
    history: [
      { type: "Implant Placement", date: "2026-02-10", score: 50, notes: "Suboptimal bone quality, guarded outlook." },
      { type: "Week 1 Review", date: "2026-02-17", score: 55, notes: "Mild peri-implant erythema observed." },
      { type: "Month 1 Review", date: "2026-03-10", score: 60, notes: "ISQ low, requires strict soft-diet compliance." },
      { type: "Month 3 Review", date: "2026-05-10", score: 68, notes: "Slight micro-mobility detected. Delayed loading." }
    ]
  },
  3: {
    id: 3,
    full_name: "Elena Ross",
    age: 52,
    gender: "Female",
    implant_site: "#9",
    implant_system: "Zimmer Biomet Tapered",
    placement_date: "2025-11-20",
    total_visits: 4,
    last_visit: "2026-05-20",
    diameter: 4.0,
    length: 13.0,
    bone_quality: "D1 (Dense Cortical)",
    recovery_score: 95,
    pain_level: 0,
    swelling: "None",
    bleeding: "None",
    mobility: "M0 (Normal)",
    healing_status: "Excellent Healing",
    risk_level: "Low Risk",
    model_confidence: 98.4,
    history: [
      { type: "Implant Placement", date: "2025-11-20", score: 70, notes: "D1 dense cortical bone stability." },
      { type: "Week 1 Review", date: "2025-11-27", score: 78, notes: "Extremely fast mucosal adaptation." },
      { type: "Month 1 Review", date: "2025-12-20", score: 85, notes: "Normal osseous integration." },
      { type: "Month 6 Review", date: "2026-05-20", score: 95, notes: "Fully integrated. Fully loaded. Normal occlusion." }
    ]
  }
};

const DecisionSupport: React.FC = () => {
  const { isMobile } = useResponsive();
  const { token } = useAuth();
  
  // State Variables
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(CLINICAL_PATIENT_RECORDS[1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Load patients from Treatment Planning database
  const loadPatients = async () => {
    try {
      const data = await api.getPatients(token);
      if (data && data.length > 0) {
        // Map backend patients list to clinical records details if matches
        const mapped = data.map((pat: any) => {
          const detail = CLINICAL_PATIENT_RECORDS[pat.id] || {
            id: pat.id,
            full_name: pat.full_name,
            age: pat.age || 42,
            gender: pat.gender || "Male",
            implant_site: pat.implant_site || "#14",
            implant_system: pat.implant_type || "Endosteal Root Form",
            placement_date: "2026-01-20",
            total_visits: 3,
            last_visit: "2026-05-15",
            diameter: 4.5,
            length: 11.5,
            bone_quality: "D2",
            recovery_score: pat.risk_level === 'Low' ? 90 : (pat.risk_level === 'Moderate' ? 76 : 58),
            pain_level: pat.risk_level === 'High' ? 4 : 1,
            swelling: pat.risk_level === 'High' ? "Mild" : "None",
            bleeding: "None",
            mobility: pat.risk_level === 'High' ? "M1" : "M0",
            healing_status: pat.risk_level === 'Low' ? "Excellent Healing" : "Stable Healing",
            risk_level: pat.risk_level === 'High' ? "High Risk" : "Low Risk",
            model_confidence: 94.8,
            history: [
              { type: "Implant Placement", date: "2026-01-20", score: 60, notes: "Placement completed." },
              { type: "Week 1 Review", date: "2026-01-27", score: 68, notes: "Mucosal closure normal." },
              { type: "Month 3 Review", date: "2026-05-15", score: pat.risk_level === 'Low' ? 90 : 70, notes: "Follow-up stability check." }
            ]
          };
          return detail;
        });
        setPatients(mapped);
        setSelectedPatient(mapped[0]);
      } else {
        // Fallback default mock data
        const fallbacks = Object.values(CLINICAL_PATIENT_RECORDS);
        setPatients(fallbacks);
        setSelectedPatient(fallbacks[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [token]);

  // SVG Line Chart rendering for Recovery Progress
  const renderRecoveryChart = () => {
    const history = selectedPatient.history || [];
    const width = isMobile ? 320 : 650;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const totalSteps = history.length;
    if (totalSteps === 0) return null;

    const getX = (index: number) => {
      if (totalSteps <= 1) return paddingLeft + chartWidth / 2;
      return paddingLeft + (index / (totalSteps - 1)) * chartWidth;
    };

    const getY = (score: number) => {
      return height - paddingBottom - ((score - 40) / 60) * chartHeight; // Maps 40% to 100%
    };

    const points = history.map((h: any, idx: number) => `${getX(idx)},${getY(h.score)}`).join(" ");

    const yTicks = [40, 60, 80, 100];

    return (
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Horizontal lines */}
          {yTicks.map((tick, idx) => (
            <React.Fragment key={idx}>
              <Line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={width - paddingRight}
                y2={getY(tick)}
                stroke="#f1f5f9"
                strokeWidth={1.5}
              />
              <SvgText
                x={paddingLeft - 12}
                y={getY(tick) + 4}
                fontSize={10}
                fill="#94a3b8"
                fontWeight="700"
                textAnchor="end"
              >
                {tick}%
              </SvgText>
            </React.Fragment>
          ))}

          {/* Line Connecting Points */}
          <Polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth={3}
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Labels */}
          {history.map((h: any, idx: number) => (
            <React.Fragment key={idx}>
              <Circle
                cx={getX(idx)}
                cy={getY(h.score)}
                r={5}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={3}
              />
              <SvgText
                x={getX(idx)}
                y={getY(h.score) - 10}
                fontSize={10}
                fontWeight="800"
                fill="#1e293b"
                textAnchor="middle"
              >
                {h.score}%
              </SvgText>
              
              {/* X Axis Label */}
              <SvgText
                x={getX(idx)}
                y={height - paddingBottom + 18}
                fontSize={9}
                fontWeight="700"
                fill="#64748b"
                textAnchor="middle"
              >
                {h.type.replace("Implant ", "")}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header & Dropdown Patient Selector */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.mainTitle}>Clinical Insights</Text>
          <Text style={styles.subtitle}>Patient-centric implant monitoring & recovery metrics</Text>
        </View>

        {/* Search patient search container */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, selectedPatient && styles.searchBarSelected]}>
            <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients by name..."
              placeholderTextColor="#94a3b8"
              value={selectedPatient ? selectedPatient.full_name : searchQuery}
              onChangeText={(text) => {
                if (selectedPatient) {
                  setSelectedPatient(null);
                }
                setSearchQuery(text);
                setIsDropdownVisible(true);
              }}
              onFocus={() => setIsDropdownVisible(true)}
              editable={!selectedPatient}
            />
            {selectedPatient ? (
              <TouchableOpacity 
                style={styles.searchClearBtn}
                onPress={() => {
                  setSelectedPatient(null);
                  setSearchQuery('');
                }}
              >
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.searchClearBtn}
                onPress={() => setIsDropdownVisible(!isDropdownVisible)}
              >
                <ChevronDown size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          {isDropdownVisible && !selectedPatient && (
            <View style={styles.dropdownContainer}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                {(() => {
                  const filtered = patients.filter(p => 
                    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <View style={styles.dropdownNoResult}>
                        <Text style={styles.dropdownNoResultText}>No active patients match your search</Text>
                      </View>
                    );
                  }

                  return filtered.map((pat) => (
                    <TouchableOpacity
                      key={pat.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedPatient(pat);
                        setIsDropdownVisible(false);
                        setSearchQuery('');
                      }}
                    >
                      <User size={14} color="#3b82f6" style={{ marginRight: 8 }} />
                      <Text style={styles.dropdownText}>{pat.full_name}</Text>
                    </TouchableOpacity>
                  ));
                })()}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {selectedPatient ? (
        <View style={styles.dashboardContainer}>
          
          {/* SECTION 1: Patient Summary Card */}
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>PATIENT NAME</Text>
                <Text style={styles.summaryValueName}>{selectedPatient.full_name}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>PATIENT ID</Text>
                <Text style={styles.summaryValue}>PID-00{selectedPatient.id}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>AGE / GENDER</Text>
                <Text style={styles.summaryValue}>{selectedPatient.age} yrs • {selectedPatient.gender}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>IMPLANT SITE</Text>
                <Text style={styles.summaryValue}>{selectedPatient.implant_site}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>IMPLANT SYSTEM</Text>
                <Text style={styles.summaryValue}>{selectedPatient.implant_system}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>PLACEMENT DATE</Text>
                <Text style={styles.summaryValue}>{selectedPatient.placement_date}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>TOTAL FOLLOW-UPS</Text>
                <Text style={styles.summaryValue}>{selectedPatient.total_visits} Completed Reviews</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <Text style={styles.summaryLabel}>LAST VISIT DATE</Text>
                <Text style={styles.summaryValue}>{selectedPatient.last_visit}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Split Layout: Left Analytics, Right Settings */}
          <View style={isMobile ? styles.flexCol : styles.flexRow}>
            
            {/* Left Column (Progression Charts & Tables) */}
            <View style={!isMobile ? { flex: 1.25, marginRight: 24 } : {}}>
              
              {/* SECTION 2: Recovery Progress Chart */}
              <GlassCard style={[styles.card, { marginTop: 20 }]}>
                <View style={styles.cardHeader}>
                  <TrendingUp size={16} color="#2563eb" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitle}>Recovery Progress Trajectory</Text>
                </View>
                {renderRecoveryChart()}
              </GlassCard>

              {/* SECTION 3: Follow-Up History Table */}
              <GlassCard style={[styles.card, { marginTop: 20 }]}>
                <View style={styles.cardHeader}>
                  <ClipboardList size={16} color="#475569" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitle}>Follow-Up History Table</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHeaderCell, { width: 130 }]}>Visit Type</Text>
                      <Text style={[styles.tableHeaderCell, { width: 95 }]}>Visit Date</Text>
                      <Text style={[styles.tableHeaderCell, { width: 90, textAlign: 'center' }]}>Recovery Score</Text>
                      <Text style={[styles.tableHeaderCell, { width: 220 }]}>Observations & Notes</Text>
                    </View>
                    {selectedPatient.history?.map((row: any, idx: number) => (
                      <View key={idx} style={[styles.tableRow, idx % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
                        <Text style={[styles.tableCell, { width: 130, fontWeight: '700' }]}>{row.type}</Text>
                        <Text style={[styles.tableCell, { width: 95, color: '#64748b' }]}>{row.date}</Text>
                        <Text style={[styles.tableCell, { width: 90, textAlign: 'center', fontWeight: '800', color: '#2563eb' }]}>{row.score}%</Text>
                        <Text style={[styles.tableCell, { width: 220, color: '#64748b' }]} numberOfLines={2}>{row.notes}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </GlassCard>

            </View>

            {/* Right Column (Badges & Specifications) */}
            <View style={!isMobile ? { flex: 0.75 } : { marginTop: 20 }}>
              
              {/* SECTION 4: Current Implant Status Card */}
              <GlassCard style={[styles.card, { marginTop: isMobile ? 0 : 20 }]}>
                <View style={styles.cardHeader}>
                  <Activity size={16} color="#2563eb" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitle}>Current Status</Text>
                </View>
                <View style={styles.statusGrid}>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Recovery Score</Text>
                    <Text style={styles.statusValueBlue}>{selectedPatient.recovery_score}%</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Pain Level</Text>
                    <Text style={styles.statusValue}>{selectedPatient.pain_level}/10</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Swelling</Text>
                    <Text style={styles.statusValue}>{selectedPatient.swelling}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Bleeding</Text>
                    <Text style={styles.statusValue}>{selectedPatient.bleeding}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Mobility</Text>
                    <Text style={styles.statusValue}>{selectedPatient.mobility}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Healing Status</Text>
                    <View style={[styles.healingBadge, selectedPatient.recovery_score >= 80 ? styles.badgeSuccess : styles.badgeWarning]}>
                      <Text style={[styles.healingBadgeText, selectedPatient.recovery_score >= 80 ? { color: '#166534' } : { color: '#854d0e' }]}>
                        {selectedPatient.healing_status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Complication Prediction Card (Embedded cleanly to maintain minimal dashboard structure) */}
                <View style={styles.complicationSection}>
                  <Text style={styles.complicationLabel}>COMPLICATION PREDICTION</Text>
                  <View style={styles.complicationMetrics}>
                    <View style={[styles.riskPill, selectedPatient.risk_level === 'Low Risk' ? styles.badgeSuccess : styles.badgeError]}>
                      <Text style={[styles.riskPillText, selectedPatient.risk_level === 'Low Risk' ? { color: '#166534' } : { color: '#991b1b' }]}>
                        {selectedPatient.risk_level.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.confidenceText}>Confidence: {selectedPatient.model_confidence}%</Text>
                  </View>
                </View>
              </GlassCard>

              {/* SECTION 5: Implant Details */}
              <GlassCard style={[styles.card, { marginTop: 20 }]}>
                <View style={styles.cardHeader}>
                  <Sliders size={16} color="#475569" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitle}>Implant Architecture</Text>
                </View>
                <View style={styles.architectureGrid}>
                  <View style={styles.archItem}>
                    <Text style={styles.archLabel}>BRAND</Text>
                    <Text style={styles.archVal}>{selectedPatient.implant_system.split(' ')[0]}</Text>
                  </View>
                  <View style={styles.archItem}>
                    <Text style={styles.archLabel}>IMPLANT SITE</Text>
                    <Text style={styles.archVal}>{selectedPatient.implant_site}</Text>
                  </View>
                  <View style={styles.archItem}>
                    <Text style={styles.archLabel}>DIAMETER</Text>
                    <Text style={styles.archVal}>Ø {selectedPatient.diameter} mm</Text>
                  </View>
                  <View style={styles.archItem}>
                    <Text style={styles.archLabel}>LENGTH</Text>
                    <Text style={styles.archVal}>{selectedPatient.length} mm</Text>
                  </View>
                  <View style={styles.archItem} style={{ width: '100%' }}>
                    <Text style={styles.archLabel}>BONE QUALITY</Text>
                    <Text style={styles.archVal}>{selectedPatient.bone_quality}</Text>
                  </View>
                </View>
              </GlassCard>

            </View>

          </View>

        </View>
      ) : (
        <GlassCard style={styles.noSelectedCard}>
          <Text style={styles.noSelectedTitle}>⚠️ Select Active Clinical Record</Text>
          <Text style={styles.noSelectedSubtitle}>
            Use the search box above to find and select a patient in order to load their recovery trajectory.
          </Text>
        </GlassCard>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    zIndex: 999,
  },
  headerTitleRow: {
    flex: 1,
    minWidth: 280,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Search Bar Dropdown CSS
  searchSection: {
    width: 320,
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  searchBarSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  searchClearBtn: {
    padding: 4,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 1001,
  },
  dropdownScroll: {
    padding: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  dropdownNoResult: {
    padding: 16,
    alignItems: 'center',
  },
  dropdownNoResultText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },

  dashboardContainer: {
    zIndex: 10,
  },

  // Patient Summary Card CSS
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryGridItem: {
    width: '23%',
    minWidth: 140,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  summaryValueName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },

  flexRow: {
    flexDirection: 'row',
  },
  flexCol: {
    flexDirection: 'column',
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Chart Progress CSS
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },

  // Table CSS
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },

  // Current Status Grid CSS
  statusGrid: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusValueBlue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563eb',
  },
  healingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  healingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  badgeWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  badgeError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },

  // Complication Section CSS
  complicationSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  complicationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  complicationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },

  // Implant Architecture Grid CSS
  architectureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  archItem: {
    width: '46%',
    marginBottom: 8,
  },
  archLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  archVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  noSelectedCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  noSelectedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  noSelectedSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
    paddingHorizontal: 24,
  }
});

export default DecisionSupport;
