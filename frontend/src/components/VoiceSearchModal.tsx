import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, AlertCircle, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmText: (transcript: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onConfirmText }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorStatus("Speech recognition is not supported in this browser. You can type your request directly below.");
    }
  }, []);

  const startListening = () => {
    setErrorStatus(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorStatus("Web Speech API is not supported in your current browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      
      // Match language code
      if (language === 'te') recognition.lang = 'te-IN';
      else if (language === 'hi') recognition.lang = 'hi-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorStatus("Microphone permission was denied. Please allow microphone access in your browser or type manually.");
        } else if (event.error === 'no-speech') {
          setErrorStatus("No speech detected. Please speak clearly into your microphone.");
        } else {
          setErrorStatus(`Voice capture error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorStatus("Could not initialize speech recognition. Please enter your query manually.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleApplySample = (sample: string) => {
    setTranscript(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}>
              <Mic size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)' }}>Speak in Your Language</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)' }}>
                English, Telugu (తెలుగు), or Hindi (हिंदी)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Mic Pulse Centerpiece */}
        <div style={{
          textAlign: 'center',
          padding: '24px 0',
          backgroundColor: isListening ? 'var(--color-mint-subtle)' : 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          border: '1px dashed var(--color-border)'
        }}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: isListening ? 'var(--color-coral)' : 'var(--color-teal)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 0 12px rgba(217, 121, 98, 0.25)' : '0 4px 16px rgba(67, 143, 132, 0.3)',
              transition: 'all 0.25s ease'
            }}
            title={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? <MicOff size={34} /> : <Mic size={34} />}
          </button>

          <div style={{ marginTop: '16px', fontWeight: 600, color: 'var(--color-navy)' }}>
            {isListening ? "Listening... Speak your care need clearly" : "Tap the microphone to speak"}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
            {isListening ? "Click again to finish recording" : "Example: 'Find knee surgery in Hyderabad under 2 lakhs'"}
          </div>
        </div>

        {/* Error / Support Notice */}
        {errorStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Transcript Preview & Edit Input */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Transcript (Review & Edit Before Searching):</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-grey)' }}>Editable</span>
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Your spoken words will appear here. You can also type or edit directly..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
        </div>

        {/* Quick Sample Suggestions */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-grey)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="var(--color-teal)" />
            <span>Try speaking or clicking a sample:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              "I need a knee replacement in Hyderabad",
              "How much does an MRI cost in Kukatpally?",
              "Find hospitals for cataract surgery near me",
              "I have had a fever for five days"
            ].map(sample => (
              <button
                key={sample}
                onClick={() => handleApplySample(sample)}
                style={{
                  background: 'var(--color-light-blue)',
                  border: '1px solid #d2e3f2',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => {
              if (transcript.trim()) {
                onConfirmText(transcript.trim());
                onClose();
              }
            }}
            disabled={!transcript.trim()}
            className="btn btn-primary"
            style={{ opacity: transcript.trim() ? 1 : 0.6 }}
          >
            <Check size={16} />
            <span>Confirm & Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};
