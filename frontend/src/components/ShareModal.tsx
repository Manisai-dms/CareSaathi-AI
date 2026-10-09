import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatmentName: string;
  minPrice: number;
  maxPrice: number;
  facilityName?: string;
  city?: string;
  priceType?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  treatmentName,
  minPrice,
  maxPrice,
  facilityName,
  city = 'Hyderabad',
  priceType = 'Government Reference & Market Tariffs'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const minFormatted = minPrice === 0 ? "₹0 (Subsidized / Free)" : `₹${minPrice.toLocaleString('en-IN')}`;
  const maxFormatted = `₹${maxPrice.toLocaleString('en-IN')}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://caresaathi.ai';

  const summaryText = 
`CareSaathi AI Healthcare Cost Estimate
---------------------------------------
🩺 Procedure: ${treatmentName}${facilityName ? `\n🏥 Facility: ${facilityName}` : ''}
📍 Location: ${city} (Telangana)
💰 Indicative Tariff Range: ${minFormatted} — ${maxFormatted}
📊 Tariff Schedule: ${priceType}

⚠️ NOTE: Indicative estimate only — verify binding quotation with hospital billing desk before admission.

Explore full breakdown, NPPA caps & public scheme support:
${origin}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CareSaathi AI: ${treatmentName} Estimate`,
          text: summaryText,
          url: origin
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          padding: '28px',
          borderRadius: '16px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: '6px' }}>
              Privacy-Preserving Sharing
            </div>
            <h3 style={{ fontSize: '1.35rem', color: '#183247', margin: 0 }}>
              Share Healthcare Estimate
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64717D', margin: '4px 0 0' }}>
              Share procedure price bands with family members without exposing sensitive financial or health data.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview Card */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '0.84rem',
          lineHeight: 1.5,
          color: '#1E293B',
          whiteSpace: 'pre-wrap',
          maxHeight: '190px',
          overflowY: 'auto'
        }}>
          {summaryText}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '12px 18px',
              fontWeight: 700,
              fontSize: '0.92rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
            }}
          >
            <MessageSquare size={18} fill="#FFFFFF" color="#25D366" />
            <span>Share via WhatsApp</span>
            <ExternalLink size={14} style={{ opacity: 0.8 }} />
          </a>

          {/* Copy Link & Web Share Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                fontSize: '0.86rem'
              }}
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                fontSize: '0.86rem'
              }}
            >
              <Share2 size={16} />
              <span>More Options</span>
            </button>
          </div>
        </div>

        {/* Non-Affiliation and Privacy Note */}
        <div style={{
          borderTop: '1px solid #E2E8F0',
          paddingTop: '14px',
          fontSize: '0.72rem',
          color: '#64748B',
          lineHeight: 1.4
        }}>
          <strong>Privacy & Disclaimers:</strong>
          <br />
          • CareSaathi AI uses standard browser web links. We do not claim official WhatsApp Business integration.
          <br />
          • No family income, ration card category, or private identification details are included in the shared message.
        </div>
      </div>
    </div>
  );
};
