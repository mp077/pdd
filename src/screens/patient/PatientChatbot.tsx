import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Send, Sparkles, X, Heart, Shield } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import GlassCard from '../../components/premium/GlassCard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'assistant';
  timestamp: Date;
}

const CHIPS = [
  { label: '🥗 Food Advice', query: 'What food should I avoid after implant surgery?' },
  { label: '💊 Medicines', query: 'Can I take painkillers?' },
  { label: '⏱️ Recovery Tips', query: 'How long does healing take?' },
  { label: '🦷 Implant Care', query: 'Is swelling normal after implant treatment?' },
];

const PatientChatbot: React.FC<Props> = ({ visible, onClose }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "👋 Hello! I'm your DentPulse AI Health Assistant.\n\nI can guide you through dietary guidelines, symptom checks, and recovery timelines. How are you feeling today?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history from backend on open
  useEffect(() => {
    if (visible && token) {
      const loadHistory = async () => {
        try {
          const history = await api.getChatHistory(token);
          if (history && history.length > 0) {
            const formatted: Message[] = [];
            history.forEach((h: any) => {
              formatted.push({
                id: `msg-${h.id}-user`,
                text: h.message,
                sender: 'patient',
                timestamp: new Date(h.created_at || Date.now()),
              });
              formatted.push({
                id: `msg-${h.id}-bot`,
                text: h.response,
                sender: 'assistant',
                timestamp: new Date(h.created_at || Date.now()),
              });
            });
            setMessages([
              {
                id: 'welcome',
                text: "👋 Hello! I'm your DentPulse AI Health Assistant.\n\nI can guide you through dietary guidelines, symptom checks, and recovery timelines. How are you feeling today?",
                sender: 'assistant',
                timestamp: new Date(),
              },
              ...formatted,
            ]);
          }
        } catch (_) {}
      };
      loadHistory();
    }
  }, [visible, token]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: 'patient',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      if (token) {
        const result = await api.sendChatMessage(textToSend, token);
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          text: result.response,
          sender: 'assistant',
          timestamp: new Date(result.timestamp || Date.now()),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (e) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        text: '⚠️ Connection issue. Please make sure the clinical server is operational.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.sender === 'assistant';
    return (
      <View
        style={[
          styles.msgContainer,
          isBot ? styles.msgAssistantContainer : styles.msgPatientContainer,
        ]}
      >
        <View style={[styles.msgBubble, isBot ? styles.msgAssistant : styles.msgPatient]}>
          <Text style={[styles.msgText, isBot ? styles.msgTextBot : styles.msgTextPatient]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, isBot ? styles.msgTimeBot : styles.msgTimePatient]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Sparkles size={16} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.headerTitle}>DentPulse Assistant</Text>
              <Text style={styles.headerSubtitle}>AI Patient Care Coordinator</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Info Disclaimer Banner */}
        <View style={styles.disclaimerBox}>
          <Shield size={14} color="#0369a1" />
          <Text style={styles.disclaimerText}>
            DentPulse AI offers supportive guidelines. Always consult your surgeon for clinical concerns.
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Quick Suggestion Chips */}
          <View style={styles.chipsSection}>
            <FlatList
              horizontal
              data={CHIPS}
              keyExtractor={(item) => item.label}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chipBtn}
                  onPress={() => handleSend(item.query)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.chipsRow}
            />
          </View>

          {/* Input Box */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about diet, medications, pain control..."
              placeholderTextColor="#cbd5e1"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend(inputText)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend(inputText)}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Send size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  disclaimerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0369a1',
    flex: 1,
    lineHeight: 14,
  },
  kav: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 10,
    gap: 16,
  },
  msgContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  msgAssistantContainer: {
    justifyContent: 'flex-start',
  },
  msgPatientContainer: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 4,
  },
  msgAssistant: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  msgPatient: {
    backgroundColor: '#3b82f6',
    borderTopRightRadius: 4,
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  msgTextBot: {
    color: '#1e293b',
  },
  msgTextPatient: {
    color: '#ffffff',
  },
  msgTime: {
    fontSize: 9,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  msgTimeBot: {
    color: '#94a3b8',
  },
  msgTimePatient: {
    color: '#93c5fd',
  },
  chipsSection: {
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  inputBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1e293b',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
});

export default PatientChatbot;
