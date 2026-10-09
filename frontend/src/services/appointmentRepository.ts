// ==============================================================================
// CareSaathi AI - Appointment Repository & Data Layer
// Implements unified interface with Demo (LocalStorage) & Supabase implementations
// ==============================================================================

export interface HospitalSlot {
  id: string;
  facility_id: string;
  slot_start: string; // ISO 8601
  slot_end: string;
  capacity: number;
  booked_count: number;
  purpose_types: string[];
  is_demo: boolean;
}

export type AppointmentStatus = 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  user_id?: string | null;
  facility_id: string;
  facility_name?: string;
  facility_address?: string;
  slot_id: string;
  slot_start?: string;
  slot_end?: string;
  purpose: string;
  patient_name: string;
  patient_age: number;
  patient_phone: string;
  language: string;
  note?: string;
  shared_summary?: {
    treatmentName?: string;
    estimatedCostMin?: number;
    estimatedCostMax?: number;
    matchedSchemes?: string[];
    isWhiteCard?: boolean;
    notes?: string;
  };
  status: AppointmentStatus;
  booking_ref: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookAppointmentPayload {
  slot_id: string;
  facility_id: string;
  facility_name?: string;
  facility_address?: string;
  purpose: string;
  patient_name: string;
  patient_age: number;
  patient_phone: string;
  language?: string;
  note?: string;
  shared_summary?: any;
  user_id?: string | null;
  is_demo?: boolean;
}

export interface AppointmentRepository {
  getSlots(facilityId: string, days?: number): Promise<HospitalSlot[]>;
  bookAppointment(payload: BookAppointmentPayload): Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  getMyAppointments(userId?: string): Promise<Appointment[]>;
  rescheduleAppointment(appointmentId: string, newSlotId: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  cancelAppointment(appointmentId: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
}

// -----------------------------------------------------------------------------
// Demo Implementation (In-memory + LocalStorage with Seed Generator)
// -----------------------------------------------------------------------------
class DemoAppointmentRepository implements AppointmentRepository {
  private slotsCache = new Map<string, HospitalSlot[]>();

  constructor() {
    this.initDemoData();
  }

  private initDemoData() {
    // Check if initial appointments exist in localStorage
    const saved = localStorage.getItem('caresaathi_appointments');
    if (!saved) {
      const initialAppointments: Appointment[] = [
        {
          id: 'demo_app_01',
          user_id: 'guest',
          facility_id: 'osmania_general',
          facility_name: 'Osmania General Hospital',
          facility_address: 'Afzal Gunj, Hyderabad, Telangana 500012',
          slot_id: 'slot_demo_osmania_01',
          slot_start: new Date(Date.now() + 24 * 3600 * 1000 * 2 + 10 * 3600 * 1000).toISOString(),
          slot_end: new Date(Date.now() + 24 * 3600 * 1000 * 2 + 10.75 * 3600 * 1000).toISOString(),
          purpose: 'Pre-surgery evaluation',
          patient_name: 'Ramesh Rao',
          patient_age: 58,
          patient_phone: '+91 98490 12345',
          language: 'te',
          status: 'Confirmed',
          booking_ref: 'CS-OSM-48192',
          is_demo: true,
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          shared_summary: {
            treatmentName: 'Total Knee Replacement (TKR)',
            estimatedCostMin: 0,
            estimatedCostMax: 25000,
            matchedSchemes: ['Aarogyasri (White Card 100% Free)'],
          },
        },
      ];
      localStorage.setItem('caresaathi_appointments', JSON.stringify(initialAppointments));
    }
  }

  public async getSlots(facilityId: string, days: number = 14): Promise<HospitalSlot[]> {
    if (this.slotsCache.has(facilityId)) {
      return this.slotsCache.get(facilityId)!;
    }

    const slots: HospitalSlot[] = [];
    const now = new Date();
    const hours = [9, 10, 11, 14, 15, 16, 17]; // 9 AM - 5 PM

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);
      const isSunday = targetDate.getDay() === 0;
      if (isSunday) continue; // Hospital outpatient closed on Sundays

      for (const h of hours) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(h, 0, 0, 0);

        const slotEnd = new Date(targetDate);
        slotEnd.setHours(h, 45, 0, 0);

        // Skip past slots for today
        if (slotStart.getTime() <= now.getTime()) continue;

        // Seed realistic booked counts: Day 0 at 10am and Day 1 at 2pm are full (2/2)
        let booked = 0;
        if ((dayOffset === 0 && h === 10) || (dayOffset === 1 && h === 14) || (dayOffset === 2 && h === 11)) {
          booked = 2; // Full state
        } else if ((dayOffset === 1 && h === 10) || (dayOffset === 3 && h === 16)) {
          booked = 1; // 1 slot remaining
        }

        const slotId = `slot_${facilityId}_d${dayOffset}_h${h}`;

        slots.push({
          id: slotId,
          facility_id: facilityId,
          slot_start: slotStart.toISOString(),
          slot_end: slotEnd.toISOString(),
          capacity: 2,
          booked_count: booked,
          purpose_types: [
            'Consultation',
            'Pre-surgery evaluation',
            'Diagnostics (MRI, CT)',
            'Second opinion',
          ],
          is_demo: true,
        });
      }
    }

    this.slotsCache.set(facilityId, slots);
    return slots;
  }

  public async bookAppointment(
    payload: BookAppointmentPayload
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    // 1. Check slot capacity to prevent double booking
    const facilitySlots = await this.getSlots(payload.facility_id);
    const targetSlot = facilitySlots.find((s) => s.id === payload.slot_id);

    if (!targetSlot) {
      return { success: false, error: 'Selected appointment slot not found.' };
    }

    if (targetSlot.booked_count >= targetSlot.capacity) {
      return {
        success: false,
        error: 'That slot was just taken by another patient. Please pick another time slot.',
      };
    }

    // Increment booked count atomically
    targetSlot.booked_count += 1;

    // 2. Create Appointment Record
    const rawRefCode = Math.floor(10000 + Math.random() * 90000);
    const prefix = payload.facility_name
      ? payload.facility_name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
      : 'HOS';
    const bookingRef = `CS-${prefix}-${rawRefCode}`;

    const newAppointment: Appointment = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: payload.user_id || 'guest',
      facility_id: payload.facility_id,
      facility_name: payload.facility_name || 'CareSaathi Partner Hospital',
      facility_address: payload.facility_address || 'Hyderabad, Telangana',
      slot_id: payload.slot_id,
      slot_start: targetSlot.slot_start,
      slot_end: targetSlot.slot_end,
      purpose: payload.purpose,
      patient_name: payload.patient_name,
      patient_age: payload.patient_age,
      patient_phone: payload.patient_phone,
      language: payload.language || 'en',
      note: payload.note,
      shared_summary: payload.shared_summary,
      status: payload.is_demo ? 'Confirmed' : 'Requested',
      booking_ref: bookingRef,
      is_demo: payload.is_demo !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to localStorage
    const existing = this.loadStoredAppointments();
    existing.unshift(newAppointment);
    this.saveStoredAppointments(existing);

    return { success: true, appointment: newAppointment };
  }

  public async getMyAppointments(userId?: string): Promise<Appointment[]> {
    const list = this.loadStoredAppointments();
    if (!userId || userId === 'guest') {
      return list;
    }
    return list.filter((a) => !a.user_id || a.user_id === userId || a.user_id === 'guest');
  }

  public async rescheduleAppointment(
    appointmentId: string,
    newSlotId: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const list = this.loadStoredAppointments();
    const appIndex = list.findIndex((a) => a.id === appointmentId);
    if (appIndex === -1) {
      return { success: false, error: 'Appointment record not found.' };
    }

    const app = list[appIndex];
    const facilitySlots = await this.getSlots(app.facility_id);
    const newSlot = facilitySlots.find((s) => s.id === newSlotId);

    if (!newSlot) {
      return { success: false, error: 'New slot not found.' };
    }

    if (newSlot.booked_count >= newSlot.capacity) {
      return { success: false, error: 'Selected new slot is already fully booked.' };
    }

    // Release old slot
    const oldSlot = facilitySlots.find((s) => s.id === app.slot_id);
    if (oldSlot) {
      oldSlot.booked_count = Math.max(0, oldSlot.booked_count - 1);
    }

    // Claim new slot
    newSlot.booked_count += 1;

    app.slot_id = newSlotId;
    app.slot_start = newSlot.slot_start;
    app.slot_end = newSlot.slot_end;
    app.updated_at = new Date().toISOString();

    list[appIndex] = app;
    this.saveStoredAppointments(list);

    return { success: true, appointment: app };
  }

  public async cancelAppointment(
    appointmentId: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const list = this.loadStoredAppointments();
    const appIndex = list.findIndex((a) => a.id === appointmentId);
    if (appIndex === -1) {
      return { success: false, error: 'Appointment not found.' };
    }

    const app = list[appIndex];
    app.status = 'Cancelled';
    app.updated_at = new Date().toISOString();

    // Release slot
    const facilitySlots = await this.getSlots(app.facility_id);
    const slot = facilitySlots.find((s) => s.id === app.slot_id);
    if (slot) {
      slot.booked_count = Math.max(0, slot.booked_count - 1);
    }

    list[appIndex] = app;
    this.saveStoredAppointments(list);

    return { success: true, appointment: app };
  }

  private loadStoredAppointments(): Appointment[] {
    try {
      const data = localStorage.getItem('caresaathi_appointments');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveStoredAppointments(list: Appointment[]) {
    try {
      localStorage.setItem('caresaathi_appointments', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist appointments', e);
    }
  }
}

// -----------------------------------------------------------------------------
// Calendar (.ics) Generator Utility
// -----------------------------------------------------------------------------
export function downloadCalendarIcs(appointment: Appointment) {
  const startDate = appointment.slot_start ? new Date(appointment.slot_start) : new Date();
  const endDate = appointment.slot_end
    ? new Date(appointment.slot_end)
    : new Date(startDate.getTime() + 45 * 60 * 1000);

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareSaathi AI//Healthcare Appointment Navigator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:caresaathi-${appointment.booking_ref}@caresaathi.ai`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:Medical Appointment: ${appointment.purpose} at ${appointment.facility_name || 'Hospital'}`,
    `DESCRIPTION:CareSaathi AI Booking Reference: ${appointment.booking_ref}\\nPatient: ${appointment.patient_name}\\nPurpose: ${appointment.purpose}\\nImportant: Please carry Government Photo ID, scheme/insurance card, and past reports.`,
    `LOCATION:${appointment.facility_name || 'Hospital'}, ${appointment.facility_address || 'Hyderabad'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Upcoming Hospital Appointment via CareSaathi AI',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CareSaathi_Appointment_${appointment.booking_ref}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Export singleton repository instance
export const appointmentRepo: AppointmentRepository = new DemoAppointmentRepository();
