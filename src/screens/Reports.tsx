import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/premium/GlassCard';
import { FileText, Download, BarChart3, Clock, ChevronRight, FileSpreadsheet } from 'lucide-react-native';
import StatusPill from '../components/premium/StatusPill';

const Reports: React.FC = () => {
  const { isMobile } = useResponsive();

  const reportTypes = [
    { title: 'Clinical Analytics', icon: BarChart3, color: '#3b82f6', desc: 'Aggregate success metrics and bone loss trends' },
    { title: 'Patient Recovery', icon: FileText, color: '#10b981', desc: 'Detailed Phase 2 monitoring reports for all active cases' },
    { title: 'AI Risk Prediction', icon: FileSpreadsheet, color: '#f59e0b', desc: 'Predictive complication modeling for upcoming 30 days' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Intelligence Reports</Text>
        <Text style={styles.subtitle}>Generate and export clinical data insights and AI performance summaries.</Text>
      </View>

      <View style={isMobile ? styles.flexCol : styles.flexRow}>
        {reportTypes.map((report, index) => (
          <GlassCard key={index} style={[styles.reportTypeCard, !isMobile ? { flex: 1, marginRight: index < 2 ? 20 : 0 } : {}]}>
            <View style={[styles.iconBox, { backgroundColor: report.color + '15' }]}>
              <report.icon size={24} color={report.color} />
            </View>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDesc}>{report.desc}</Text>
            <TouchableOpacity style={styles.generateButton}>
              <Text style={styles.genText}>Generate Report</Text>
              <ChevronRight size={16} color="#3b82f6" />
            </TouchableOpacity>
          </GlassCard>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Recent Exports</Text>
      <View style={styles.recentList}>
        {[
          { name: 'Clinic_Summary_May.pdf', date: 'May 10, 2026', size: '2.4 MB', type: 'Clinical' },
          { name: 'Marcus_ONeill_AI_Report.pdf', date: 'May 08, 2026', size: '1.1 MB', type: 'Patient' },
          { name: 'Q1_Implant_Stability_Data.csv', date: 'May 05, 2026', size: '4.8 MB', type: 'Data' },
        ].map((item, idx) => (
          <GlassCard key={idx} style={styles.recentItem}>
            <View style={styles.recentIcon}>
              <Clock size={18} color="#94a3b8" />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.date} • {item.size}</Text>
            </View>
            <StatusPill label={item.type} />
            <TouchableOpacity style={styles.downloadIcon}>
              <Download size={20} color="#3b82f6" />
            </TouchableOpacity>
          </GlassCard>
        ))}
      </View>
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexCol: {
    flexDirection: 'column',
    gap: 16,
  },
  reportTypeCard: {
    padding: 24,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  reportDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  genText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 20,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recentIcon: {
    marginRight: 16,
  },
  recentInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  itemMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  downloadIcon: {
    marginLeft: 16,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
});

export default Reports;
