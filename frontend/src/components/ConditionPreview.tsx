import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Clock, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Activity, 
  HeartPulse, 
  Zap, 
  Scan, 
  Droplet, 
  Heart, 
  Baby, 
  ShieldAlert, 
  Stethoscope,
  Sparkles,
  Layers
} from 'lucide-react';
import { getConditionVisual, ConditionVisual } from '../data/conditionVisuals';

interface ConditionPreviewProps {
  selectedConditionId?: string | null;
  selectedConditionName?: string | null;
}

export const ConditionPreview: React.FC<ConditionPreviewProps> = ({
  selectedConditionId,
  selectedConditionName
}) => {
  const shouldReduceMotion = useReducedMotion();
  const visual: ConditionVisual | undefined = getConditionVisual(selectedConditionId || selectedConditionName);

  // Active selected gallery item (defaults to 0 which is first stage, or can view hero)
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Reset image loading states when condition changes
  useEffect(() => {
    setActiveImageIndex(0);
    setImageLoaded(false);
    setImageError(false);
  }, [visual?.id]);

  if (!visual) {
    return null;
  }

  // Determine current active image and caption
  const activeThumbnail = visual.gallery[activeImageIndex] || visual.gallery[0];
  const displayImageSrc = activeImageIndex === 1 && visual.heroImage ? visual.heroImage : activeThumbnail?.image || visual.heroImage;
  const displayAltText = activeThumbnail?.altText || visual.heroAlt;

  // Department icon resolver for badge and fallback
  const renderDepartmentIcon = (size = 18, color = 'var(--color-teal)') => {
    switch (visual.departmentIcon) {
      case 'Eye': return <Eye size={size} color={color} />;
      case 'Activity': return <Activity size={size} color={color} />;
      case 'HeartPulse': return <HeartPulse size={size} color={color} />;
      case 'Zap': return <Zap size={size} color={color} />;
      case 'Scan': return <Scan size={size} color={color} />;
      case 'Droplet': return <Droplet size={size} color={color} />;
      case 'Heart': return <Heart size={size} color={color} />;
      case 'Baby': return <Baby size={size} color={color} />;
      case 'ShieldAlert': return <ShieldAlert size={size} color={color} />;
      case 'Stethoscope': return <Stethoscope size={size} color={color} />;
      default: return <Stethoscope size={size} color={color} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: 12 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ 
        duration: shouldReduceMotion ? 0.05 : 0.35, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{ overflow: 'hidden', marginBottom: '26px' }}
      aria-live="polite"
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid var(--color-mint)',
          boxShadow: '0 10px 25px rgba(24, 50, 71, 0.05), 0 2px 6px rgba(67, 143, 132, 0.06)',
          padding: '22px 24px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFCFB 100%)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={visual.id}
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : 0.25, ease: 'easeOut' }}
          >
            {/* Header Tag Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--color-mint)',
                    color: 'var(--color-teal-dark)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    letterSpacing: '0.01em'
                  }}
                >
                  {renderDepartmentIcon(15, 'var(--color-teal-dark)')}
                  <span>{visual.department}</span>
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '999px'
                  }}
                >
                  <Sparkles size={13} color="var(--color-teal)" />
                  <span>Clinical Education Preview</span>
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={14} color="var(--color-teal)" />
                <span>Stage: <strong>{activeThumbnail.stageName}</strong></span>
              </div>
            </div>

            {/* Responsive Split Grid: Image Left, Clinical Information Right */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '24px',
                alignItems: 'start'
              }}
            >
              {/* LEFT COLUMN: Visual Hero & Interactive Mini Gallery */}
              <div>
                {/* Hero Stage Box with Ken Burns and Loading Skeleton */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.6)'
                  }}
                >
                  {/* Skeleton Loading Shimmer */}
                  {!imageLoaded && !imageError && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#EDF2F7',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        zIndex: 2
                      }}
                    >
                      <motion.div
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                      >
                        {renderDepartmentIcon(32, 'var(--color-teal)')}
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                          Loading medical illustration...
                        </span>
                      </motion.div>
                    </div>
                  )}

                  {/* Fallback if image fails to load */}
                  {imageError ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        backgroundColor: 'var(--color-mint-subtle)',
                        textAlign: 'center'
                      }}
                    >
                      <div 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-mint)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px'
                        }}
                      >
                        {renderDepartmentIcon(36, 'var(--color-teal)')}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
                        {visual.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                        Department of {visual.department}
                      </div>
                    </div>
                  ) : (
                    /* Hero Image with Ken Burns animation */
                    <motion.img
                      key={`${visual.id}-${activeImageIndex}`}
                      src={displayImageSrc}
                      alt={displayAltText}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                        setImageLoaded(true);
                        setImageError(true);
                      }}
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ 
                        opacity: imageLoaded ? 1 : 0,
                        scale: shouldReduceMotion ? 1 : [1, 1.05, 1] 
                      }}
                      transition={{
                        opacity: { duration: 0.3 },
                        scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: '#FFFFFF',
                        display: 'block'
                      }}
                    />
                  )}

                  {/* Subtle Stage Caption Overlay at Bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(24, 50, 71, 0.75) 100%)',
                      padding: '16px 14px 8px',
                      color: '#FFFFFF',
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      {activeThumbnail.stageName}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                      Stage {activeImageIndex + 1} of {visual.gallery.length}
                    </span>
                  </div>
                </div>

                {/* Mini Gallery of 3 Thumbnails (Before / Procedure / Recovery) */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Procedure Stage Visualizer
                  </div>
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${visual.gallery.length}, 1fr)`, 
                      gap: '8px' 
                    }}
                  >
                    {visual.gallery.map((thumb, idx) => {
                      const isActive = activeImageIndex === idx;
                      return (
                        <button
                          key={thumb.id}
                          type="button"
                          onClick={() => {
                            setActiveImageIndex(idx);
                            setImageLoaded(false);
                            setImageError(false);
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '6px 4px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? 'var(--color-mint)' : '#F8FAFC',
                            border: isActive ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'center'
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '42px',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              marginBottom: '4px',
                              backgroundColor: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={thumb.image}
                              alt={thumb.altText}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                // Fallback for thumbnail
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <span 
                            style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? 'var(--color-teal-dark)' : 'var(--color-navy)',
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: '100%'
                            }}
                          >
                            {thumb.stageName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Current Active Caption */}
                  <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', fontStyle: 'italic', margin: '6px 0 0' }}>
                    💡 <strong>{activeThumbnail.stageName}:</strong> {activeThumbnail.caption}
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Clinical Explanation & Operational Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h4 
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    color: 'var(--color-navy)', 
                    margin: '0 0 8px',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {visual.name}
                </h4>

                {/* 2-3 line plain-language explanation */}
                <p 
                  style={{ 
                    fontSize: '0.92rem', 
                    lineHeight: '1.55', 
                    color: '#334155', 
                    margin: '0 0 16px' 
                  }}
                >
                  {visual.description}
                </p>

                {/* Clinical Operational Metrics Cards */}
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '10px', 
                    marginBottom: '16px' 
                  }}
                >
                  {/* Typical Duration */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-mint-subtle)',
                      border: '1px solid var(--color-mint)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div 
                      style={{
                        backgroundColor: '#FFFFFF',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Clock size={18} color="var(--color-teal)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Typical Duration
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                        {visual.avgDuration}
                      </div>
                    </div>
                  </div>

                  {/* Typical Hospital Stay */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-light-blue)',
                      border: '1px solid #D6E4F0',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div 
                      style={{
                        backgroundColor: '#FFFFFF',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Building2 size={18} color="var(--color-navy)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Typical Hospital Stay
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                        {visual.hospitalStay}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Takeaways Checklist */}
                <div 
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    What Patients Should Know:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {visual.keyHighlights.map((highlight, hIdx) => (
                      <div key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.82rem', color: '#334155' }}>
                        <CheckCircle2 size={15} color="var(--color-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MANDATORY FOOTER LINE */}
            <div
              style={{
                marginTop: '18px',
                paddingTop: '12px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#64748B'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--color-teal)" />
                <span style={{ fontWeight: 600, color: '#475569' }}>
                  Illustration for education only. Not a medical diagnosis.
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                CareSaathi Clinical Transparency Engine
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
