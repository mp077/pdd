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
import { Send, Sparkles, X, Activity, CircleUserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'assistant';
  timestamp: Date;
}

const SUGGESTIONS = [
  'Food Advice',
  'Medicines',
  'Recovery Tips',
  'Swelling',
];

const PatientChatbot: React.FC<Props> = ({ visible, onClose }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I'm Dent AI.\n\nI can help you with recovery tips, dietary guidelines, and symptom checks. How are you feeling today?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (token) {
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
                text: "Hello! I'm Dent AI.\n\nI can help you with recovery tips, dietary guidelines, and symptom checks. How are you feeling today?",
                sender: 'assistant',
                timestamp: new Date(),
              },
              ...formatted,
            ]);
          }
        } catch (_) {}
      };
      // only load if it's visible or used as a standalone screen
      if (visible === undefined || visible) {
         loadHistory();
      }
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

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let responseText = "I'm sorry, I couldn't process that.";
      if (token) {
        const result = await api.sendChatMessage(textToSend, token);
        responseText = result.response || result.message || "No response generated.";
      }
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        text: `Error: ${error.message || 'Could not reach Dent AI.'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isPatient = item.sender === 'patient';
    
    return (
      <View style={[styles.msgWrapper, isPatient ? styles.msgWrapperRight : styles.msgWrapperLeft]}>
        {!isPatient && (
          <View style={styles.botAvatar}>
            <Sparkles size={16} color="#ffffff" />
          </View>
        )}
        <View style={[styles.msgBubble, isPatient ? styles.msgBubbleUser : styles.msgBubbleBot]}>
          <Text style={[styles.msgText, isPatient ? styles.msgTextUser : styles.msgTextBot]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const Content = (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.headerIconBox}>
            <Sparkles size={20} color="#a855f7" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Dent AI</Text>
            <Text style={styles.headerSubtitle}>Clinical Assistant</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#a855f7" />
            <Text style={styles.loadingText}>Dent AI is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message Dent AI..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // If visible is defined, render as modal (legacy usage from PatientHome)
  if (visible !== undefined) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        {Content}
      </Modal>
    );
  }

  // Render as normal screen
  return Content;
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatList: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  msgWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  msgWrapperLeft: {
    alignSelf: 'flex-start',
  },
  msgWrapperRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  msgBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  msgBubbleBot: {
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  msgBubbleUser: {
    backgroundColor: '#a855f7',
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgTextBot: {
    color: '#1e293b',
  },
  msgTextUser: {
    color: '#ffffff',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 15,
    color: '#0f172a',
    maxHeight: 100,
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 28 : 16,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});

export default PatientChatbot;
