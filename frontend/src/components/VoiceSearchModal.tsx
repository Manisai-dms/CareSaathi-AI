import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, AlertCircle, Volume2, Sparkles, RefreshCw, Play, Square, Languages, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, SpeechTranscribeDTO } from '../services/api';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmText: (transcript: string) => void;
}

type SpeechLangCode = 'te-IN' | 'en-IN' | 'hi-IN' | 'auto';

const SAMPLE_PROMPTS: Record<SpeechLangCode, Array<{ label: string; text: string; note: string }>> = {
  'te-IN': [
    {
      label: 'మోకాలి ఆపరేషన్ (Knee Surgery)',
      text: 'నాకు మోకాలి ఆపరేషన్ చేయించుకోవాలి. హైదరాబాద్లో గవర్నమెంట్ హాస్పిటల్లో ఎంత ఖర్చు అవుతుంది?',
      note: 'Pure Telugu medical inquiry'
    },
    {
      label: 'Knee Replacement (Code-Switching)',
      text: 'నాకు knee replacement cost ఎంత అవుతుంది?',
      note: 'Telugu-English mixed phrase'
    },
    {
      label: 'కంటిశుక్లం (Cataract Surgery)',
      text: 'కంటిశుక్లం ఆపరేషన్ ఖర్చు ఎంత?',
      note: 'Telugu ophthalmology inquiry'
    },
    {
      label: 'MRI Scan (Diagnostic)',
      text: 'నాకు MRI scan చేయించుకోవాలి, దగ్గరలో ఎంత ఖర్చు అవుతుంది?',
      note: 'Telugu diagnostic pricing'
    }
  ],
  'en-IN': [
    {
      label: 'Knee Replacement (Under Budget)',
      text: 'I need a knee replacement in Hyderabad under 2 lakhs',
      note: 'Procedure + Location + Budget'
    },
    {
      label: 'MRI Brain Scan',
      text: 'How much does an MRI brain scan cost near Kukatpally?',
      note: 'Diagnostic + Locality'
    },
    {
      label: 'Government Cataract',
      text: 'Find government hospitals for cataract surgery near me',
      note: 'Facility preference'
    }
  ],
  'hi-IN': [
    {
      label: 'घुटने का ऑपरेशन',
      text: 'मुझे घुटने का ऑपरेशन करवाना है, कितना खर्च आएगा?',
      note: 'Hindi surgery inquiry'
    },
    {
      label: 'मोतियाबिंद सर्जरी',
      text: 'मोतियाबिंद का ऑपरेशन सरकारी अस्पताल में कितने में होगा?',
      note: 'Hindi government hospital'
    },
    {
      label: 'एमआरआई स्कैन',
      text: 'एमआरआई स्कैन का क्या चार्ज है?',
      note: 'Hindi diagnostic test'
    }
  ],
  'auto': [
    {
      label: 'తెలుగు (Telugu Surgery)',
      text: 'నాకు మోకాలి ఆపరేషన్ చేయించుకోవాలి. హైదరాబాద్లో గవర్నమెంట్ హాస్పిటల్లో ఎంత ఖర్చు అవుతుంది?',
      note: 'Auto language detection'
    },
    {
      label: 'Mixed (Code-Switching)',
      text: 'నాకు knee replacement cost ఎంత అవుతుంది?',
      note: 'Auto code-switching'
    },
    {
      label: 'English Inquiry',
      text: 'I need a knee replacement in Hyderabad under 2 lakhs',
      note: 'Auto English'
    }
  ]
};

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onConfirmText }) => {
  const { language } = useLanguage();

  // Selected language default: prioritize Telugu if app is in Telugu or default to Telugu as top priority
  const [selectedLang, setSelectedLang] = useState<SpeechLangCode>(
    language === 'hi' ? 'hi-IN' : 'te-IN'
  );

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [confidenceText, setConfidenceText] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const latestTranscriptRef = useRef<string>("");

  // Sync initial language if modal opens
  useEffect(() => {
    if (isOpen) {
      if (language === 'te') setSelectedLang('te-IN');
      else if (language === 'hi') setSelectedLang('hi-IN');
      else setSelectedLang('te-IN'); // User prompt: Telugu Speech Recognition is highest priority
      setErrorStatus(null);
    } else {
      cleanupRecording();
    }
  }, [isOpen, language]);

  // Clean up timer and media streams on unmount or close
  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorStatus(null);
    setConfidenceText(null);
    setProviderInfo(null);
    setTranscript("");
    latestTranscriptRef.current = "";
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];

    // 1. Audio stream capture using MediaRecorder
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          }
          // Stop all audio tracks
          stream?.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(250);
      } catch (err: any) {
        console.warn("MediaRecorder / Mic capture warning:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorStatus("Microphone permission was denied. Please allow microphone access in your browser settings.");
        }
      }
    }

    // 2. Start timer
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
    setIsRecording(true);

    // 3. Web Speech API with explicit language tag
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;

        // Set explicit language code based on user selection
        if (selectedLang === 'te-IN') {
          recognition.lang = 'te-IN';
        } else if (selectedLang === 'hi-IN') {
          recognition.lang = 'hi-IN';
        } else if (selectedLang === 'en-IN') {
          recognition.lang = 'en-IN';
        } else {
          // Auto-detect default: prioritize Telugu
          recognition.lang = 'te-IN';
        }

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          let finalConfidence: number | null = null;

          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
            if (event.results[i][0].confidence && event.results[i][0].confidence > 0) {
              finalConfidence = event.results[i][0].confidence;
            }
          }

          const currentTranscript = (finalTranscript + " " + interimTranscript).trim() || finalTranscript.trim() || interimTranscript.trim();

          if (currentTranscript) {
            setTranscript(currentTranscript);
            latestTranscriptRef.current = currentTranscript;
            if (finalConfidence && finalConfidence > 0) {
              setConfidenceText(`${Math.round(finalConfidence * 100)}% (Browser Speech Engine)`);
            } else {
              setConfidenceText("Recognized Live Speech");
            }
            setProviderInfo("Browser Speech Adapter");
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Web Speech API recognition error:", event.error);
          if (event.error === 'not-allowed') {
            setErrorStatus("Microphone permission was denied. Please allow microphone access in your browser settings.");
          } else if (event.error === 'no-speech') {
            setErrorStatus("No speech detected. Please hold the microphone and speak clearly.");
          } else if (event.error === 'network') {
            setErrorStatus("Speech recognition network error. Please check your internet connection.");
          }
        };

        recognition.onend = () => {
          // Recognition ended naturally
        };

        recognition.start();
      } catch (e) {
        console.warn("Could not start Web Speech Recognition:", e);
      }
    }
  };

  const stopRecording = async () => {
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
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }

    // Check if live speech recognition captured the user's spoken words
    const captured = latestTranscriptRef.current.trim() || transcript.trim();

    // If no transcript was captured by Web Speech API, attempt backend audio transcription with recorded audio
    if (!captured) {
      if (audioChunksRef.current.length > 0) {
        setIsProcessing(true);
        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const buffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const b64Audio = btoa(binary);

          // Call backend speech adapter with actual recorded audio
          const res: SpeechTranscribeDTO = await api.transcribeSpeech({
            audio_base64: b64Audio,
            language: selectedLang,
            format: 'webm'
          });

          if (res.transcript && res.transcript.trim()) {
            setTranscript(res.transcript.trim());
            latestTranscriptRef.current = res.transcript.trim();
            setProviderInfo(res.provider);
            if (res.confidence) {
              setConfidenceText(`${Math.round(res.confidence * 100)}% (${res.confidence_label})`);
            } else {
              setConfidenceText("Transcribed Audio");
            }
          } else {
            setErrorStatus(res.message || "No words recognized from the recording. Please speak clearly and try again.");
          }
        } catch (err: any) {
          console.error("Backend speech transcribe error:", err);
          setErrorStatus("Speech could not be parsed. Please speak again or type your medical inquiry directly.");
        } finally {
          setIsProcessing(false);
        }
      } else {
        setErrorStatus("No audio was recorded. Please tap the microphone and speak again.");
      }
    }
  };

  const handleApplySample = (sampleText: string) => {
    setTranscript(sampleText);
    setErrorStatus(null);
    setConfidenceText("Verified Clinical Preset");
    setProviderInfo("CareSaathi Multi-lingual Registry");
  };

  const handlePlayReplayAudio = () => {
    if (!audioUrl) return;
    if (audioPlayerRef.current) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px', padding: '26px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}>
              <Mic size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', margin: 0, fontWeight: 700 }}>
                CareSaathi Multi-lingual Voice Input
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)', margin: '2px 0 0' }}>
                Accurate Telugu, Hindi & English Clinical Speech Recognition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-grey)', padding: '6px' }}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Explicit Language Selector */}
        <div style={{
          marginBottom: '18px',
          padding: '12px 14px',
          backgroundColor: 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Languages size={15} color="var(--color-teal)" />
              Select Speech Recognition Language:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-teal)', fontWeight: 600 }}>
              {selectedLang === 'te-IN' && 'తెలుగు లిపి ప్రాధాన్యత (Telugu Script Priority)'}
              {selectedLang === 'hi-IN' && 'हिंदी भाषा (Hindi Script)'}
              {selectedLang === 'en-IN' && 'Indian English'}
              {selectedLang === 'auto' && 'Auto Language Detection'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSelectedLang('te-IN')}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: selectedLang === 'te-IN' ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                backgroundColor: selectedLang === 'te-IN' ? 'var(--color-mint-subtle)' : '#ffffff',
                fontWeight: selectedLang === 'te-IN' ? 700 : 500,
                color: selectedLang === 'te-IN' ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                cursor: 'pointer',
                fontSize: '0.86rem',
                textAlign: 'center'
              }}
            >
              తెలుగు (Telugu)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('en-IN')}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: selectedLang === 'en-IN' ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                backgroundColor: selectedLang === 'en-IN' ? 'var(--color-mint-subtle)' : '#ffffff',
                fontWeight: selectedLang === 'en-IN' ? 700 : 500,
                color: selectedLang === 'en-IN' ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                cursor: 'pointer',
                fontSize: '0.86rem',
                textAlign: 'center'
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('hi-IN')}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: selectedLang === 'hi-IN' ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                backgroundColor: selectedLang === 'hi-IN' ? 'var(--color-mint-subtle)' : '#ffffff',
                fontWeight: selectedLang === 'hi-IN' ? 700 : 500,
                color: selectedLang === 'hi-IN' ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                cursor: 'pointer',
                fontSize: '0.86rem',
                textAlign: 'center'
              }}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('auto')}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: selectedLang === 'auto' ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                backgroundColor: selectedLang === 'auto' ? 'var(--color-mint-subtle)' : '#ffffff',
                fontWeight: selectedLang === 'auto' ? 700 : 500,
                color: selectedLang === 'auto' ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                cursor: 'pointer',
                fontSize: '0.86rem',
                textAlign: 'center'
              }}
            >
              Auto Detect
            </button>
          </div>
        </div>

        {/* Mic Pulse Centerpiece & Timer */}
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          backgroundColor: isRecording ? 'var(--color-mint-subtle)' : 'var(--color-warm-bg)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '18px',
          border: isRecording ? '2px solid var(--color-teal)' : '1px dashed var(--color-border)'
        }}>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: isRecording ? 'var(--color-coral)' : 'var(--color-teal)',
              color: 'white',
              border: 'none',
              cursor: isProcessing ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording ? '0 0 0 14px rgba(217, 121, 98, 0.25)' : '0 4px 16px rgba(67, 143, 132, 0.3)',
              transition: 'all 0.25s ease'
            }}
            title={isRecording ? "Stop recording" : "Start speaking"}
          >
            {isProcessing ? (
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
            ) : isRecording ? (
              <Square size={30} />
            ) : (
              <Mic size={36} />
            )}
          </button>

          <div style={{ marginTop: '14px', fontWeight: 700, color: 'var(--color-navy)', fontSize: '1rem' }}>
            {isProcessing
              ? "Transcribing Telugu/Multi-lingual clinical audio..."
              : isRecording
                ? `Recording Audio (${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')})`
                : "Tap the microphone to speak your care need"}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-grey)', marginTop: '4px' }}>
            {isRecording
              ? "Speak in Telugu, English or Hindi. Click the red button to finish."
              : selectedLang === 'te-IN'
                ? "ఉదాహరణ: 'నాకు మోకాలి ఆపరేషన్ చేయించుకోవాలి' లేదా 'నాకు knee replacement cost ఎంత?'"
                : "Example: 'Find knee surgery in Hyderabad under 2 lakhs'"}
          </div>

          {/* Audio Replay & Controls if recorded */}
          {audioUrl && !isRecording && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <audio ref={audioPlayerRef} src={audioUrl} onEnded={() => setIsPlayingAudio(false)} style={{ display: 'none' }} />
              <button
                type="button"
                onClick={handlePlayReplayAudio}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={14} />
                <span>{isPlayingAudio ? "Pause Recording" : "Replay Spoken Audio"}</span>
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} />
                <span>Record Again</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {errorStatus && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Transcript Review & Edit Input */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--color-navy)' }}>
              Spoken Transcript (Review, Edit or Type):
            </label>
            {confidenceText && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-teal)' }}>
                {confidenceText}
              </span>
            )}
          </div>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder={
              selectedLang === 'te-IN'
                ? "మీరు మాట్లాడిన తెలుగు వాక్యాలు ఇక్కడ కనిపిస్తాయి. మీరు ఇక్కడ నేరుగా సరిదిద్దవచ్చు లేదా టైప్ చేయవచ్చు..."
                : "Your spoken words will appear here in native script. You can edit or type directly before searching..."
            }
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            style={{ fontSize: '0.95rem', lineHeight: '1.45', fontFamily: 'inherit' }}
          />
          {providerInfo && (
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-grey)', marginTop: '4px', textAlign: 'right' }}>
              Engine: {providerInfo}
            </div>
          )}
        </div>

        {/* Verified Multi-lingual Clinical Sample Prompts */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--color-teal)" />
            <span>Frequently Spoken Clinical Queries (Click to test):</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {SAMPLE_PROMPTS[selectedLang].map(sample => (
              <button
                key={sample.text}
                type="button"
                onClick={() => handleApplySample(sample.text)}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-teal-dark)' }}>{sample.label}</span>
                <span style={{ color: 'var(--color-text-grey)', fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  "{sample.text}"
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-grey)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={14} />
            <span>Preserves exact Telugu script; requires user confirmation before clinical search.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
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
              <span>Confirm & Search Care</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
