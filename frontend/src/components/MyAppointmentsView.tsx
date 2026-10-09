import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Navigation, 
  RefreshCw, 
  Share2, 
  Info, 
  X, 
  Phone,
  ShieldCheck,
  Check
} from 'lucide-react';
import { appointmentRepo, Appointment, HospitalSlot, downloadCalendarIcs } from '../services/appointmentRepository';
import { useAuth } from '../context/AuthContext';

interface MyAppointmentsViewProps {
  onBookNew?: () => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({ onBookNew }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [availableSlots, setAvailableSlots] = useState<HospitalSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancel Confirmation Modal State
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);
    const list = await appointmentRepo.getMyAppointments(user?.id);
    setAppointments(list);
    setLoading(false);
  };

  const now = new Date().getTime();
  const upcomingList = appointments.filter(a => {
    if (a.status === 'Cancelled' || a.status === 'Completed') return false;
    const time = a.slot_start ? new Date(a.slot_start).getTime() : 0;
    return time >= now - 3600000;
  });

  const pastList = appointments.filter(a => {
    if (a.status === 'Cancelled' || a.status === 'Completed') return true;
    const time = a.slot_start ? new Date(a.slot_start).getTime() : 0;
    return time < now - 3600000;
  });

  // Check if any appointment is within 24 hours
  const imminentAppointment = upcomingList.find(a => {
    const time = a.slot_start ? new Date(a.slot_start).getTime() : 0;
    const diffHours = (time - now) / 3600000;
    return diffHours >= 0 && diffHours <= 24;
  });

  const handleOpenReschedule = async (app: Appointment) => {
    setRescheduleTarget(app);
    setRescheduleError(null);
    setSelectedSlotId('');
    const slots = await appointmentRepo.getSlots(app.facility_id);
    setAvailableSlots(slots.filter(s => s.booked_count < s.capacity));
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !selectedSlotId) return;
    setRescheduling(true);
    setRescheduleError(null);

    const res = await appointmentRepo.rescheduleAppointment(rescheduleTarget.id, selectedSlotId);
    setRescheduling(false);

    if (res.success) {
      setRescheduleTarget(null);
      loadAppointments();
    } else {
      setRescheduleError(res.error || 'Reschedule failed');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    await appointmentRepo.cancelAppointment(cancelTarget.id);
    setCancelling(false);
    setCancelTarget(null);
    loadAppointments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-teal">✓ Confirmed</span>;
      case 'Requested':
        return <span className="badge badge-warning">⏳ Requested</span>;
      case 'Completed':
        return <span className="badge badge-navy">Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-secondary" style={{ color: '#EF4444' }}>Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      
      {/* 24-Hour Urgent Reminder Banner */}
      {imminentAppointment && (
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
        }}>
          <Clock size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#1E40AF', marginBottom: '2px' }}>
              Reminder: Hospital Appointment in Less Than 24 Hours!
            </div>
            <p style={{ fontSize: '0.86rem', color: '#1E3A8A', margin: 0, lineHeight: 1.45 }}>
              Your appointment at <strong>{imminentAppointment.facility_name}</strong> is scheduled for{' '}
              <strong>{new Date(imminentAppointment.slot_start || '').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(imminentAppointment.slot_start || '').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>.
              Please carry your photo ID, prescription card, and past reports.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'upcoming' ? '3px solid #2C8C83' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'upcoming' ? '#12304A' : '#64717D',
              fontWeight: activeTab === 'upcoming' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Upcoming Appointments ({upcomingList.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'past' ? '3px solid #2C8C83' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'past' ? '#12304A' : '#64717D',
              fontWeight: activeTab === 'past' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Past / Cancelled ({pastList.length})
          </button>
        </div>

        {onBookNew && (
          <button onClick={onBookNew} className="btn btn-primary btn-sm">
            + Book New Appointment
          </button>
        )}
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64717D' }}>Loading your appointments...</div>
      ) : (activeTab === 'upcoming' ? upcomingList : pastList).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Calendar size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.15rem', color: '#12304A', marginBottom: '6px' }}>
            No {activeTab} appointments found
          </h4>
          <p style={{ color: '#64717D', fontSize: '0.88rem', maxWidth: '360px', margin: '0 auto 18px auto' }}>
            You haven't scheduled any hospital visits yet. Find healthcare providers and book easily.
          </p>
          {onBookNew && (
            <button onClick={onBookNew} className="btn btn-primary">
              Explore Hospitals & Book
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(activeTab === 'upcoming' ? upcomingList : pastList).map(app => {
            const dateObj = new Date(app.slot_start || '');
            return (
              <div 
                key={app.id} 
                className="card"
                style={{
                  padding: '20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Top Row: Ref code & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#12304A', fontSize: '0.92rem', letterSpacing: '0.04em' }}>
                      REF: {app.booking_ref}
                    </span>
                    {app.is_demo && (
                      <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                        Demo Booking
                      </span>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Main Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64717D', display: 'block' }}>HOSPITAL FACILITY</span>
                    <strong style={{ color: '#12304A', fontSize: '0.96rem' }}>{app.facility_name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64717D', marginTop: '2px' }}>{app.facility_address}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64717D', display: 'block' }}>DATE & TIME</span>
                    <strong style={{ color: '#2C8C83', fontSize: '0.96rem' }}>
                      {dateObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>
                    <div style={{ fontSize: '0.84rem', color: '#12304A', fontWeight: 600 }}>
                      ⏰ {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64717D', display: 'block' }}>PATIENT & PURPOSE</span>
                    <strong>{app.patient_name} ({app.patient_age} yrs)</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64717D', marginTop: '2px' }}>Purpose: {app.purpose}</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => downloadCalendarIcs(app)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                    >
                      <Download size={13} />
                      <span>Calendar</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(app.facility_name || 'Hospital')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 10px', textDecoration: 'none' }}
                    >
                      <Navigation size={13} />
                      <span>Directions</span>
                    </a>
                  </div>

                  {activeTab === 'upcoming' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenReschedule(app)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      >
                        <RefreshCw size={13} />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => setCancelTarget(app)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#EF4444' }}
                      >
                        <Trash2 size={13} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Confirmation Modal */}
      {rescheduleTarget && (
        <div className="modal-overlay" onClick={() => setRescheduleTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#12304A', margin: 0 }}>
                Reschedule Appointment
              </h3>
              <button onClick={() => setRescheduleTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#64717D', marginBottom: '14px' }}>
              Select a new available time slot for <strong>{rescheduleTarget.facility_name}</strong>:
            </p>

            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {availableSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>No available slots found</div>
              ) : availableSlots.slice(0, 15).map(slot => {
                const sDate = new Date(slot.slot_start);
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isSelected ? '#2C8C83' : '#E2E8F0'}`,
                      backgroundColor: isSelected ? '#E7F3EF' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#12304A' }}>
                      {sDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {sDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSelected && <Check size={16} color="#2C8C83" />}
                  </button>
                );
              })}
            </div>

            {rescheduleError && (
              <div style={{ color: '#EF4444', fontSize: '0.82rem', marginBottom: '10px' }}>{rescheduleError}</div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setRescheduleTarget(null)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                disabled={!selectedSlotId || rescheduling}
                onClick={handleConfirmReschedule}
                className="btn btn-primary btn-sm"
              >
                {rescheduling ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#EF4444', marginBottom: '8px' }}>
              Cancel Appointment?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64717D', lineHeight: 1.5, marginBottom: '18px' }}>
              Are you sure you want to cancel your appointment at <strong>{cancelTarget.facility_name}</strong> (Ref: {cancelTarget.booking_ref})? Your reserved slot will be released for other patients.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setCancelTarget(null)} className="btn btn-secondary btn-sm">
                Keep Appointment
              </button>
              <button
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: '#EF4444', color: 'white', borderColor: '#EF4444' }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Visit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
