import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, ShieldCheck, CheckCheck, Sparkles, RefreshCw, AlertTriangle, PhoneCall } from 'lucide-react';
import { api, GuidedChatResponseDTO } from '../services/api';

interface GuidedChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEstimate?: (treatmentId: string) => void;
  onTriggerEmergency: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  chips?: string[];
  emergency?: boolean;
}

export const GuidedChatDrawer: React.FC<GuidedChatDrawerProps> = ({
  isOpen,
  onClose,
  onSelectEstimate,
  onTriggerEmergency
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Namaste! I am your CareSaathi Healthcare Assistant. I can guide you through treatment cost estimates, nearby hospitals, and Aarogyasri/PM-JAY coverage in your city.\n\nWhat care are you looking for today?",
      timestamp: "10:30 AM",
      chips: [
        "Knee replacement in Hyderabad",
        "Can Aarogyasri cover my surgery?",
        "What documents to carry?",
        "MRI scan cost in Kukatpally"
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await api.guidedChat({
        message: trimmed,
        city: "Hyderabad",
        history: history.slice(-6)
      });

      if (res.emergency_detected) {
        onTriggerEmergency(res.reply);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: res.suggested_chips,
        emergency: res.emergency_detected
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Sorry, I am having trouble connecting to the healthcare database. Please try again or use the main search tabs.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: 'clamp(320px, 92vw, 420px)',
      height: '620px',
      backgroundColor: '#EFEAE2', // WhatsApp subtle chat bg
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      border: '1px solid var(--color-border)',
      animation: 'slideUpChat 0.25s ease-out'
    }}>
      <style>{`
        @keyframes slideUpChat {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* WhatsApp-Style Dark Teal Header */}
      <div style={{
        backgroundColor: '#075E54', // Dark Teal
        color: 'white',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'white',
            color: '#075E54',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px'
          }}>
            🩺
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
              CareSaathi Assistant
            </div>
            <div style={{ fontSize: '0.74rem', color: '#A7F3D0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399', display: 'inline-block' }} />
              <span>Verified Hospital Pricing Agent</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Non-Affiliation Legal Disclosure */}
      <div style={{
        backgroundColor: '#D1E7DD',
        color: '#0F5132',
        padding: '5px 12px',
        fontSize: '0.72rem',
        textAlign: 'center',
        fontWeight: 500,
        borderBottom: '1px solid #BADBCC'
      }}>
        CareSaathi Guided Assistant — web interface (not affiliated with WhatsApp Inc.).
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(m => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                backgroundColor: isUser ? '#E7FCE8' : '#FFFFFF',
                borderRadius: '8px',
                borderTopRightRadius: isUser ? '2px' : '8px',
                borderTopLeftRadius: !isUser ? '2px' : '8px',
                padding: '10px 14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                color: '#111827',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}>
                {m.text}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '4px',
                  fontSize: '0.68rem',
                  color: '#6B7280',
                  marginTop: '4px'
                }}>
                  <span>{m.timestamp}</span>
                  {isUser && <CheckCheck size={13} color="#2563EB" />}
                </div>
              </div>

              {/* Chips attached to bot message */}
              {m.chips && m.chips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {m.chips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSendMessage(chip)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #10B981',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        color: '#065F46',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            color: '#6B7280',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            CareSaathi is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        style={{
          backgroundColor: '#F0F2F5',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTop: '1px solid #E5E7EB'
        }}
      >
        <input
          type="text"
          placeholder="Ask about costs, schemes, or hospitals..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #D1D5DB',
            outline: 'none',
            fontSize: '0.88rem',
            backgroundColor: 'white'
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: inputText.trim() ? '#075E54' : '#9CA3AF',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.2s'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
