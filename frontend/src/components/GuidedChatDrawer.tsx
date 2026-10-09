import React, { useState, useRef, useEffect } from 'react';
import {
  Send, X, MessageSquare, ShieldCheck, CheckCheck, Sparkles, RefreshCw,
  AlertTriangle, PhoneCall, Mic, MicOff, Paperclip, Volume2, VolumeX,
  Play, Pause, Square, Languages, Pill, Building2, Check, ArrowRight, Image as ImageIcon,
  Printer, CheckSquare, ListChecks, HelpCircle, FileText
} from 'lucide-react';
import { api, GuidedChatResponseDTO, HospitalCardDTO, PrescriptionCardDTO, PatientActionPlanDTO } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface GuidedChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEstimate?: (treatmentId: string) => void;
  onTriggerEmergency: (msg: string) => void;
  initialQuery?: string;
  initialRxFilename?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  chips?: string[];
  emergency?: boolean;
  hospitals_card?: HospitalCardDTO[];
  prescription_card?: PrescriptionCardDTO;
  action_plan?: PatientActionPlanDTO;
  audio_tts_text?: string;
  attached_image_preview?: string;
  attached_filename?: string;
}

export const GuidedChatDrawer: React.FC<GuidedChatDrawerProps> = ({
  isOpen,
  onClose,
  onSelectEstimate,
  onTriggerEmergency,
  initialQuery,
  initialRxFilename
}) => {
  const { language: appLang } = useLanguage();

  // Assistant language selector: default to Telugu if app is Telugu, else Telugu as highest priority for voice
  const [chatLang, setChatLang] = useState<'te-IN' | 'en-IN' | 'hi-IN'>('te-IN');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "నమస్కారం! నేను మీ CareSaathi వాయిస్ అసిస్టెంట్‌ని.\n\nమీరు తెలుగు, ఇంగ్లీష్ లేదా హిందీలో మాట్లాడవచ్చు. ఆపరేషన్ ఖర్చులు, ప్రభుత్వ ఆసుపత్రులు, ఆరోగ్యశ్రీ కవరేజ్ లేదా ప్రిస్క్రిప్షన్ మందుల ఖర్చుల గురించి నన్ను అడగండి.\n\nనేను మీకు ఎలా సహాయపడగలను?",
      timestamp: "10:30 AM",
      chips: [
        "నాకు మోకాలి ఆపరేషన్ ఖర్చు ఎంత అవుతుంది?",
        "హైదరాబాద్లో కంటి ఆపరేషన్ ఖర్చు ఎంత?",
        "ప్రభుత్వ హాస్పిటల్లో ఉచితంగా చికిత్స దొరుకుతుందా?",
        "ఈ ప్రిస్క్రిప్షన్ లో ఉన్న మందుల ఖర్చు చెప్పండి",
        "📋 పేషెంట్ యాక్షన్ ప్లాన్ (Action Plan)"
      ],
      audio_tts_text: "నమస్కారం! నేను మీ CareSaathi వాయిస్ అసిస్టెంట్‌ని. ఆపరేషన్ ఖర్చులు, ప్రభుత్వ ఆసుపత్రులు లేదా ప్రిస్క్రిప్షన్ మందుల ఖర్చుల గురించి మాట్లాడవచ్చు."
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedRx, setAttachedRx] = useState<{ file?: File; previewUrl?: string; filename?: string } | null>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>("");
  const isVoiceSubmittedRef = useRef<boolean>(false);
  const voiceErrorRef = useRef<string | null>(null);

  // Text-To-Speech (TTS) state
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isPausedTTS, setIsPausedTTS] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Handle initial query if passed
      if (initialQuery && initialQuery.trim()) {
        handleSendMessage(initialQuery.trim());
      }
      if (initialRxFilename) {
        setAttachedRx({ filename: initialRxFilename });
      }
    } else {
      stopVoiceRecording();
      stopSpeaking();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopVoiceRecording();
      stopSpeaking();
      if (attachedRx?.previewUrl && attachedRx.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(attachedRx.previewUrl);
      }
    };
  }, []);

  // --- Print / Export Patient Action Plan ---
  const printActionPlan = (plan: PatientActionPlanDTO) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plan.title || 'CareSaathi AI - Patient Action Plan'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 820px; margin: 0 auto; line-height: 1.5; }
    h1 { color: #0f172a; border-bottom: 2px solid #0d9488; padding-bottom: 8px; font-size: 22px; }
    h2 { color: #0d9488; font-size: 16px; margin-top: 18px; margin-bottom: 6px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px; font-size: 13px; }
    ul, ol { margin-top: 4px; padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 13px; }
    .disclaimer { font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 8px; }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h1>${plan.title || 'Patient Financial & Clinical Care Navigation Plan'}</h1>
    <button class="no-print" onclick="window.print()" style="padding: 8px 16px; background:#0d9488; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">🖨️ Print / Save PDF</button>
  </div>
  <div class="card">
    <strong>User Stated Concern:</strong> ${plan.user_stated_concern || 'Healthcare navigation request'}<br/>
    <strong>Confirmed Procedure / Context:</strong> ${plan.cost_estimate_summary?.procedure_name || 'Standard Care'}<br/>
    <strong>Location:</strong> ${plan.confirmed_details?.city || 'Hyderabad, Telangana'}
  </div>
  
  <h2>1. Cost Range & Statutory Protections</h2>
  <div class="card">
    <div><strong>Government Hospital:</strong> ${plan.cost_estimate_summary?.government_cost || '₹0 (Aarogyasri / PM-JAY)'}</div>
    <div><strong>Private Hospital Range:</strong> ${plan.cost_estimate_summary?.private_range_display || 'N/A'}</div>
    ${plan.cost_estimate_summary?.statutory_price_caps?.length ? `<div><strong>Statutory Price Caps:</strong> ${plan.cost_estimate_summary.statutory_price_caps.join('; ')}</div>` : ''}
    ${plan.estimate_limitations?.length ? `<div style="margin-top:6px; color:#b45309;">⚠️ Limitations: ${plan.estimate_limitations.join(' | ')}</div>` : ''}
  </div>

  <h2>2. Questions to Ask the Hospital Billing Desk</h2>
  <ul>
    ${plan.questions_to_ask_hospital?.map(q => `<li>${q}</li>`).join('') || ''}
  </ul>

  <h2>3. Documents Checklist for Admission & Schemes</h2>
  <ul>
    ${plan.documents_to_carry?.map(d => `<li>${d}</li>`).join('') || ''}
  </ul>

  <h2>4. Step-by-Step Action Plan</h2>
  <ol>
    ${plan.next_step_checklist?.map(s => `<li><strong>${s.task}</strong></li>`).join('') || ''}
  </ol>

  <h2>5. Verified Hospitals & Verification Routes</h2>
  <ul>
    ${plan.verified_hospitals?.map(h => `<li><strong>${h.name}</strong> (${h.locality ? h.locality + ', ' : ''}${h.city}) — ${h.ownership} [${h.pricing_status}]</li>`).join('') || ''}
  </ul>
  <div style="font-size:12px; color:#475569; margin-top:8px;">
    <strong>Official Helplines:</strong> 104 (Health Helpline), 14555 (PM-JAY), Aarogyasri Trust Portal (aarogyasri.telangana.gov.in).
  </div>

  <div class="disclaimer">
    CareSaathi AI Care Navigation Plan. Generated from verified public hospital registries, NPPA statutory price orders, and state empanelment schedules. Always obtain a pre-authorization estimate from the hospital finance desk.
  </div>
</body>
</html>`);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  // --- Text-To-Speech (TTS) Player ---
  const playSpeech = (msgId: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    // If currently speaking this message, pause or resume
    if (speakingMsgId === msgId) {
      if (isPausedTTS) {
        window.speechSynthesis.resume();
        setIsPausedTTS(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedTTS(true);
      }
      return;
    }

    // Stop previous utterance
    window.speechSynthesis.cancel();

    const cleanText = textToSpeak.replace(/[*#_~`•]/g, ' ').replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set voice language based on chat language
    utterance.lang = chatLang;
    utterance.rate = 0.95; // Slightly slower, clear conversational pace

    // Try finding matched language voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(chatLang.split('-')[0]) || v.lang === chatLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
      setIsPausedTTS(false);
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
      setIsPausedTTS(false);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      setSpeakingMsgId(null);
      setIsPausedTTS(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setIsPausedTTS(false);
  };

  // --- Voice Input (Speech-to-Text) ---
  const startVoiceRecording = async () => {
    stopSpeaking();
    setInputText("");
    latestTranscriptRef.current = "";
    isVoiceSubmittedRef.current = false;
    voiceErrorRef.current = null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please type directly.");
      return;
    }

    // Microphone access verification with honest feedback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          const permNotice = chatLang.startsWith('te')
            ? "🎤 మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి మీ బ్రౌజర్ సెట్టింగ్స్‌లో మైక్రోఫోన్ అనుమతించండి లేదా టైప్ చేయండి."
            : "🎤 Microphone permission was denied. Please allow microphone access in your browser settings to speak.";
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            text: permNotice,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = chatLang;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const accumulated = (finalTranscript + " " + interimTranscript).trim() || finalTranscript.trim() || interimTranscript.trim();
        if (accumulated) {
          latestTranscriptRef.current = accumulated;
          setInputText(accumulated);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          voiceErrorRef.current = chatLang.startsWith('te')
            ? "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి అనుమతించండి."
            : "Microphone permission was denied.";
        } else if (event.error === 'no-speech') {
          voiceErrorRef.current = chatLang.startsWith('te')
            ? "మాటలు వినిపించలేదు. దయచేసి మైక్రోఫోన్ నొక్కి మళ్లీ మాట్లాడండి."
            : "No speech detected. Please tap the microphone and speak again.";
        } else if (event.error === 'network') {
          voiceErrorRef.current = chatLang.startsWith('te')
            ? "వాయిస్ నెట్‌వర్క్ లోపం. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి."
            : "Speech recognition network error. Please check your connection.";
        }
        stopVoiceRecording(false);
      };

      recognition.onend = () => {
        // Automatically submit the spoken words when user finishes speaking
        stopVoiceRecording(true);
      };

      recognition.start();
    } catch (e) {
      console.error("Could not start speech recognition:", e);
      stopVoiceRecording(false);
    }
  };

  const stopVoiceRecording = (autoSubmit = false) => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if (voiceErrorRef.current) {
      const errMsg = voiceErrorRef.current;
      voiceErrorRef.current = null;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: `⚠️ ${errMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    const recognizedText = latestTranscriptRef.current.trim();
    if (autoSubmit && recognizedText && !isVoiceSubmittedRef.current) {
      isVoiceSubmittedRef.current = true;
      handleSendMessage(recognizedText, true);
    }
  };

  // --- Prescription Attachment ---
  const handleFileAttach = (file: File) => {
    if (attachedRx?.previewUrl && attachedRx.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(attachedRx.previewUrl);
    }
    const preview = URL.createObjectURL(file);
    setAttachedRx({
      file,
      previewUrl: preview,
      filename: file.name
    });
  };

  const handleSendMessage = async (textToSend: string, isVoiceOrigin = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !attachedRx) return;

    // Stop speaking any previous message
    stopSpeaking();
    if (isRecording) {
      stopVoiceRecording(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed || (attachedRx ? "ఈ ప్రిస్క్రిప్షన్‌ను పరిశీలించండి" : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attached_image_preview: attachedRx?.previewUrl,
      attached_filename: attachedRx?.filename
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    latestTranscriptRef.current = "";
    setIsTyping(true);

    const currentRx = attachedRx;
    setAttachedRx(null); // Clear attachment box for next message

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await api.guidedChat({
        message: trimmed || (currentRx ? "దయచేసి ఈ ప్రిస్క్రిప్షన్‌ను విశ్లేషించండి" : ""),
        city: "Hyderabad",
        history: history.slice(-6),
        prescription_filename: currentRx?.filename,
        language: chatLang
      });

      if (res.emergency_detected) {
        onTriggerEmergency(res.reply);
      }

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: res.suggested_chips,
        emergency: res.emergency_detected,
        hospitals_card: res.hospitals_card,
        prescription_card: res.prescription_card,
        action_plan: res.action_plan,
        audio_tts_text: res.audio_tts_text || res.reply
      };

      setMessages(prev => [...prev, botMsg]);

      // Auto-play speech in voice-first mode if user sent query via voice
      if (isVoiceOrigin || trimmed.includes("చెప్పండి") || trimmed.includes("ఖర్చు")) {
        // Smooth audio playback
        setTimeout(() => {
          playSpeech(botMsgId, res.audio_tts_text || res.reply);
        }, 300);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const isNetworkErr = err?.message?.includes("Failed to fetch") || 
                           err?.message?.includes("NetworkError") || 
                           (typeof navigator !== 'undefined' && !navigator.onLine);

      let errMsgText: string;
      let chips: string[];

      if (chatLang.startsWith('te')) {
        if (isNetworkErr) {
          errMsgText = "నెట్‌వర్క్ కనెక్షన్ లోపం: దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
          chips = ["మళ్లీ ప్రయత్నించండి (Retry)", "టైప్ చేయండి"];
        } else {
          errMsgText = "అసిస్టెంట్ సేవ తాత్కాలికంగా స్పందించడం లేదు. దయచేసి మళ్లీ మాట్లాడండి లేదా మీ ప్రశ్నను క్రింద టైప్ చేయండి.";
          chips = ["మళ్లీ మాట్లాడండి (Retry)", "టైప్ చేయండి", "108 ఎమర్జెన్సీ"];
        }
      } else if (chatLang.startsWith('hi')) {
        if (isNetworkErr) {
          errMsgText = "नेटवर्क कनेक्शन समस्या: कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।";
          chips = ["पुनः प्रयास करें (Retry)", "टाइप करें"];
        } else {
          errMsgText = "असिस्टेंट सेवा अस्थायी रूप से प्रतिक्रिया नहीं दे रही है। कृपया पुनः बोलें या टाइप करें।";
          chips = ["पुनः बोलें (Retry)", "टाइप करें", "108 इमरजेंसी"];
        }
      } else {
        if (isNetworkErr) {
          errMsgText = "Network connection issue. Please check your internet connectivity and try again.";
          chips = ["Retry", "Type Question"];
        } else {
          errMsgText = "The assistant service is temporarily not responding. Please retry or type your question below.";
          chips = ["Retry", "Type Question", "Call 108 Emergency"];
        }
      }

      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errMsgText,
        chips,
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
      bottom: '16px',
      right: '16px',
      width: 'clamp(330px, 94vw, 460px)',
      height: '660px',
      backgroundColor: '#F8FAF9',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 24px 50px rgba(0,0,0,0.28)',
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
        @keyframes pulseVoice {
          0% { box-shadow: 0 0 0 0 rgba(217, 121, 98, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(217, 121, 98, 0); }
          100% { box-shadow: 0 0 0 0 rgba(217, 121, 98, 0); }
        }
        @keyframes waveBar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-navy)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-mint)',
            color: 'var(--color-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <MessageSquare size={20} />
            <div style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid var(--color-navy)'
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>CareSaathi Voice Assistant</span>
              <Sparkles size={14} color="#FBBF24" />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              Multi-lingual • Telugu • Costs • Hospitals • OCR
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language Switcher Pill */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => setChatLang('te-IN')}
              style={{
                background: chatLang === 'te-IN' ? 'var(--color-teal)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '0.72rem',
                fontWeight: chatLang === 'te-IN' ? 700 : 500,
                cursor: 'pointer'
              }}
              title="Telugu Script"
            >
              తెలుగు
            </button>
            <button
              type="button"
              onClick={() => setChatLang('en-IN')}
              style={{
                background: chatLang === 'en-IN' ? 'var(--color-teal)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '0.72rem',
                fontWeight: chatLang === 'en-IN' ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setChatLang('hi-IN')}
              style={{
                background: chatLang === 'hi-IN' ? 'var(--color-teal)' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '0.72rem',
                fontWeight: chatLang === 'hi-IN' ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              हिं
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
            title="Close Assistant"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div style={{
        backgroundColor: '#F0FDF4',
        borderBottom: '1px solid #DCFCE7',
        padding: '6px 14px',
        fontSize: '0.72rem',
        color: '#166534',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <ShieldCheck size={14} color="#166534" />
        <span>Official Government Data & NPPA price caps. Always verifies before consequential searches.</span>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(m => {
          const isUser = m.sender === 'user';
          const isSpeakingThis = speakingMsgId === m.id;

          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                backgroundColor: isUser ? '#E7FCE8' : '#FFFFFF',
                borderRadius: '10px',
                borderTopRightRadius: isUser ? '2px' : '10px',
                borderTopLeftRadius: !isUser ? '2px' : '10px',
                padding: '12px 14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                color: '#111827',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                border: isUser ? '1px solid #BBF7D0' : '1px solid var(--color-border)',
                whiteSpace: 'pre-line'
              }}>
                {/* Attached image preview if user uploaded prescription */}
                {m.attached_image_preview && (
                  <div style={{ marginBottom: '8px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #D1D5DB' }}>
                    <img src={m.attached_image_preview} alt="Prescription" style={{ width: '100%', maxHeight: '140px', objectFit: 'contain' }} />
                  </div>
                )}
                {m.attached_filename && !m.attached_image_preview && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)', fontWeight: 600, marginBottom: '4px' }}>
                    📄 {m.attached_filename}
                  </div>
                )}

                {/* Main Message Text */}
                {m.text}

                {/* TTS Voice Read-Aloud Controls for Bot Messages */}
                {!isUser && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                    paddingTop: '6px',
                    borderTop: '1px solid #F3F4F6'
                  }}>
                    <button
                      type="button"
                      onClick={() => playSpeech(m.id, m.audio_tts_text || m.text)}
                      style={{
                        background: isSpeakingThis ? 'var(--color-mint)' : 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        color: isSpeakingThis ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 600
                      }}
                      title="Read answer aloud in your language"
                    >
                      {isSpeakingThis ? (
                        <>
                          <Square size={13} color="var(--color-coral)" />
                          <span>Stop Voice</span>
                          {/* Animated Voice Wave */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                            <div style={{ width: '3px', backgroundColor: 'var(--color-teal)', animation: 'waveBar 0.8s infinite 0.1s' }} />
                            <div style={{ width: '3px', backgroundColor: 'var(--color-teal)', animation: 'waveBar 0.8s infinite 0.3s' }} />
                            <div style={{ width: '3px', backgroundColor: 'var(--color-teal)', animation: 'waveBar 0.8s infinite 0.5s' }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} color="var(--color-teal)" />
                          <span>వాయిస్ వినండి (Listen)</span>
                        </>
                      )}
                    </button>

                    <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{m.timestamp}</span>
                  </div>
                )}

                {isUser && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', fontSize: '0.68rem', color: '#6B7280', marginTop: '4px' }}>
                    <span>{m.timestamp}</span>
                    <CheckCheck size={13} color="#2563EB" />
                  </div>
                )}
              </div>

              {/* Visual Prescription Card in Conversation */}
              {m.prescription_card && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #99F6E4',
                  padding: '10px 12px',
                  marginTop: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-teal-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Pill size={15} color="var(--color-teal)" />
                    <span>Prescription Cost Breakdown (NPPA & Jan Aushadhi)</span>
                  </div>

                  {m.prescription_card.medicines && m.prescription_card.medicines.map((med, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '3px 0', borderBottom: '1px dotted #E5E7EB' }}>
                      <span style={{ fontWeight: 600 }}>{med.name} ({med.strength})</span>
                      <span>Jan Aushadhi: <strong style={{ color: 'var(--color-teal)' }}>₹{med.cost_jan_aushadhi}</strong> <span style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>₹{med.cost_branded}</span></span>
                    </div>
                  ))}

                  {m.prescription_card.savings && m.prescription_card.savings > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--color-mint-subtle)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--color-teal-dark)' }}>జన్ ఔషధితో మొత్తం ఆదా (Total Savings):</span>
                      <span style={{ color: 'var(--color-teal-dark)' }}>₹{m.prescription_card.savings.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Hospital Cards in Conversation */}
              {m.hospitals_card && m.hospitals_card.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={14} color="var(--color-teal)" />
                    <span>సిఫార్సు చేయబడిన ఆసుపత్రులు (Recommended Hospitals):</span>
                  </div>
                  {m.hospitals_card.map(h => (
                    <div key={h.id} style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-navy)' }}>{h.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          {h.locality ? `${h.locality}, ` : ''}{h.city} • <span style={{ color: h.ownership === 'Government' ? '#16A34A' : '#2563EB', fontWeight: 600 }}>{h.ownership}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${h.ownership === 'Government' ? 'badge-teal' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                          {h.pricing_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Chips */}
              {m.chips && m.chips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {m.chips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSendMessage(chip)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-teal)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        color: 'var(--color-teal-dark)',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        fontWeight: 600,
                        textAlign: 'left'
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
            color: 'var(--color-teal)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600
          }}>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span>CareSaathi విశ్లేషిస్తోంది (Analyzing medical database)...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Bar Indicator */}
      {isRecording && (
        <div style={{
          backgroundColor: '#FFF1F2',
          borderTop: '2px solid var(--color-coral)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'pulseVoice 1.5s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-coral)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-coral)' }}>
              రికార్డింగ్ అవుతోంది ({String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')})
            </span>
          </div>
          <button
            type="button"
            onClick={() => stopVoiceRecording(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
          >
            పూర్తయింది (Done)
          </button>
        </div>
      )}

      {/* Attached Prescription Preview Box */}
      {attachedRx && (
        <div style={{
          backgroundColor: 'var(--color-mint-subtle)',
          borderTop: '1px solid #A7F3D0',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-teal-dark)' }}>
            <Paperclip size={14} />
            <span>జోడించిన ప్రిస్క్రిప్షన్: {attachedRx.filename || "prescription.jpg"}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedRx(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Input Bar with Voice & Prescription Buttons */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        style={{
          backgroundColor: '#FFFFFF',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTop: '1px solid #E5E7EB'
        }}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              handleFileAttach(e.target.files[0]);
            }
          }}
        />

        {/* Prescription Attach Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-grey)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
          title="Upload or photo a doctor's prescription"
        >
          <Paperclip size={20} />
        </button>

        {/* Microphone Button */}
        <button
          type="button"
          onClick={isRecording ? () => stopVoiceRecording(true) : startVoiceRecording}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isRecording ? 'var(--color-coral)' : 'var(--color-mint-subtle)',
            color: isRecording ? '#FFFFFF' : 'var(--color-teal)',
            border: isRecording ? 'none' : '1px solid #99F6E4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            animation: isRecording ? 'pulseVoice 1.5s infinite' : 'none'
          }}
          title={isRecording ? "Stop voice recording" : "Speak in Telugu or English"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          placeholder={
            chatLang === 'te-IN'
              ? "మాట్లాడండి లేదా ఖర్చులు, ప్రిస్క్రిప్షన్ గురించి టైప్ చేయండి..."
              : "Speak or ask about costs, schemes, or prescription..."
          }
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #D1D5DB',
            outline: 'none',
            fontSize: '0.86rem',
            backgroundColor: '#F9FAFB'
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !attachedRx}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: (inputText.trim() || attachedRx) ? 'var(--color-teal)' : '#9CA3AF',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (inputText.trim() || attachedRx) ? 'pointer' : 'default',
            transition: 'background-color 0.2s'
          }}
          title="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
