// ==============================================================================
// CareSaathi AI - Appointment Repository & Data Layer
// Implements unified interface with Supabase & Demo (LocalStorage) implementations
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';

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

export interface SavedComparisonItem {
  id: string;
  user_id: string;
  treatment_name: string;
  facility_ids: string[];
  created_at: string;
}

export interface AppointmentRepository {
  getSlots(facilityId: string, days?: number): Promise<HospitalSlot[]>;
  bookAppointment(payload: BookAppointmentPayload): Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  getMyAppointments(userId?: string): Promise<Appointment[]>;
  rescheduleAppointment(appointmentId: string, newSlotId: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }>;
  cancelAppointment(appointmentId: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }>;

  // Saved Comparisons persistence
  saveComparison?(userId: string, facilityIds: string[], treatmentName: string): Promise<{ success: boolean; comparison?: SavedComparisonItem; error?: string }>;
  getSavedComparisons?(userId?: string): Promise<SavedComparisonItem[]>;
  deleteSavedComparison?(id: string): Promise<{ success: boolean; error?: string }>;
}

// -----------------------------------------------------------------------------
// Demo Implementation (In-memory + LocalStorage with Seed Generator)
// -----------------------------------------------------------------------------
export class DemoAppointmentRepository implements AppointmentRepository {
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

    // Increment booked count
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

  public saveStoredAppointment(appointment: Appointment) {
    const list = this.loadStoredAppointments();
    const idx = list.findIndex((a) => a.id === appointment.id);
    if (idx >= 0) {
      list[idx] = appointment;
    } else {
      list.unshift(appointment);
    }
    this.saveStoredAppointments(list);
  }

  public async saveComparison(
    userId: string,
    facilityIds: string[],
    treatmentName: string
  ): Promise<{ success: boolean; comparison?: SavedComparisonItem; error?: string }> {
    try {
      const existing = this.loadStoredComparisons();
      const newComp: SavedComparisonItem = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId || 'guest',
        facility_ids: facilityIds,
        treatment_name: treatmentName,
        created_at: new Date().toISOString(),
      };
      existing.unshift(newComp);
      this.saveStoredComparisons(existing);
      return { success: true, comparison: newComp };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to save comparison locally' };
    }
  }

  public async getSavedComparisons(userId?: string): Promise<SavedComparisonItem[]> {
    const list = this.loadStoredComparisons();
    if (!userId || userId === 'guest') return list;
    return list.filter((c) => !c.user_id || c.user_id === userId || c.user_id === 'guest');
  }

  public async deleteSavedComparison(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.loadStoredComparisons();
    const filtered = list.filter((c) => c.id !== id);
    this.saveStoredComparisons(filtered);
    return { success: true };
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
      console.warn('Failed to persist appointments locally', e);
    }
  }

  private loadStoredComparisons(): SavedComparisonItem[] {
    try {
      const data = localStorage.getItem('caresaathi_saved_comparisons');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveStoredComparisons(list: SavedComparisonItem[]) {
    try {
      localStorage.setItem('caresaathi_saved_comparisons', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist comparisons locally', e);
    }
  }
}

// -----------------------------------------------------------------------------
// Supabase Implementation with Graceful LocalStorage Fallback
// -----------------------------------------------------------------------------
export class SupabaseAppointmentRepository implements AppointmentRepository {
  private fallback: DemoAppointmentRepository;

  constructor(fallback: DemoAppointmentRepository) {
    this.fallback = fallback;
  }

  public async getSlots(facilityId: string, days: number = 14): Promise<HospitalSlot[]> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.getSlots(facilityId, days);
    }

    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('hospital_slots')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('slot_start', nowIso)
        .order('slot_start', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          facility_id: row.facility_id,
          slot_start: row.slot_start,
          slot_end: row.slot_end,
          capacity: row.capacity ?? 2,
          booked_count: row.booked_count ?? 0,
          purpose_types: Array.isArray(row.purpose_types)
            ? row.purpose_types
            : ['Consultation', 'Pre-surgery evaluation'],
          is_demo: Boolean(row.is_demo),
        }));
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch hospital slots from Supabase, using dynamic fallback:', e);
    }

    // Dynamic slot generator fallback
    return this.fallback.getSlots(facilityId, days);
  }

  public async bookAppointment(
    payload: BookAppointmentPayload
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.bookAppointment(payload);
    }

    try {
      // 1. Get slot timing
      const slots = await this.getSlots(payload.facility_id);
      const targetSlot = slots.find((s) => s.id === payload.slot_id);

      if (targetSlot && targetSlot.booked_count >= targetSlot.capacity) {
        return {
          success: false,
          error: 'That slot was just taken by another patient. Please pick another time slot.',
        };
      }

      const prefix = payload.facility_name
        ? payload.facility_name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
        : 'HOS';
      const rawRefCode = Math.floor(10000 + Math.random() * 90000);
      const bookingRef = `CS-${prefix}-${rawRefCode}`;

      // Resolve logged-in user id from Supabase Auth
      let activeUserId: string | null = null;
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          activeUserId = userData.user.id;
        } else if (userError) {
          console.warn('[Supabase Auth] getUser returned error:', userError.message);
        }
      } catch (e) {
        console.warn('[Supabase Auth] Exception during getUser():', e);
      }

      // Check session fallback if getUser didn't return
      if (!activeUserId) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.id) {
            activeUserId = sessionData.session.user.id;
          }
        } catch (e) {
          console.warn('[Supabase Auth] Exception during getSession():', e);
        }
      }

      // Validate UUID format if payload.user_id was provided
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!activeUserId && payload.user_id && uuidRegex.test(payload.user_id)) {
        activeUserId = payload.user_id;
      }

      const appointmentRow = {
        user_id: activeUserId,
        facility_id: payload.facility_id,
        facility_name: payload.facility_name || 'CareSaathi Partner Hospital',
        facility_address: payload.facility_address || 'Hyderabad, Telangana',
        slot_id: payload.slot_id,
        slot_start: targetSlot?.slot_start || new Date().toISOString(),
        slot_end: targetSlot?.slot_end || new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        purpose: payload.purpose || 'Consultation',
        patient_name: payload.patient_name,
        patient_age: Number(payload.patient_age) || 35,
        patient_phone: payload.patient_phone,
        language: payload.language || 'en',
        note: payload.note || null,
        shared_summary: payload.shared_summary || null,
        status: payload.is_demo ? 'Confirmed' : 'Requested',
        booking_ref: bookingRef,
        is_demo: payload.is_demo !== false,
        updated_at: new Date().toISOString(),
      };

      console.log('[Supabase] Inserting appointment into appointments table:', {
        facility_id: appointmentRow.facility_id,
        slot_id: appointmentRow.slot_id,
        user_id: appointmentRow.user_id,
        booking_ref: appointmentRow.booking_ref,
      });

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentRow])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Insert Error]: Failed to insert appointment into Supabase:', error);
        return {
          success: false,
          error: `Database booking failed: ${error.message} (${error.code || 'UNKNOWN'})`,
        };
      }

      if (!data) {
        console.error('[Supabase Insert Error]: Insert succeeded but returned no data.');
        return {
          success: false,
          error: 'Failed to retrieve saved appointment confirmation from database.',
        };
      }

      // Also update booked_count in hospital_slots if row exists
      if (targetSlot) {
        const { error: slotErr } = await supabase
          .from('hospital_slots')
          .update({ booked_count: (targetSlot.booked_count || 0) + 1 })
          .eq('id', payload.slot_id);

        if (slotErr) {
          console.warn('[Supabase] Could not update slot booked_count:', slotErr.message);
        }
      }

      const bookedApp: Appointment = {
        id: data.id,
        user_id: data.user_id,
        facility_id: data.facility_id,
        facility_name: data.facility_name,
        facility_address: data.facility_address,
        slot_id: data.slot_id,
        slot_start: data.slot_start,
        slot_end: data.slot_end,
        purpose: data.purpose,
        patient_name: data.patient_name,
        patient_age: data.patient_age,
        patient_phone: data.patient_phone,
        language: data.language,
        note: data.note,
        shared_summary: data.shared_summary,
        status: data.status as AppointmentStatus,
        booking_ref: data.booking_ref,
        is_demo: data.is_demo,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      // Mirror locally for instantaneous offline availability
      this.fallback.saveStoredAppointment(bookedApp);

      return { success: true, appointment: bookedApp };
    } catch (err: any) {
      console.error('[Supabase Network/Exception Error]:', err);
      return {
        success: false,
        error: `Booking error: ${err?.message || 'Network communication error'}`,
      };
    }
  }

  public async getMyAppointments(userId?: string): Promise<Appointment[]> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.getMyAppointments(userId);
    }

    try {
      // Resolve active user id from Supabase Auth if not provided as UUID
      let activeUserId = userId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!activeUserId || !uuidRegex.test(activeUserId)) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.id) {
            activeUserId = authData.user.id;
          }
        } catch {}
      }

      let query = supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeUserId && uuidRegex.test(activeUserId)) {
        query = query.or(`user_id.eq.${activeUserId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Supabase Query Error] getMyAppointments failed:', error);
      }
      if (!error && data && data.length > 0) {
        const mapped: Appointment[] = data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          facility_id: d.facility_id,
          facility_name: d.facility_name,
          facility_address: d.facility_address,
          slot_id: d.slot_id,
          slot_start: d.slot_start,
          slot_end: d.slot_end,
          purpose: d.purpose,
          patient_name: d.patient_name,
          patient_age: d.patient_age,
          patient_phone: d.patient_phone,
          language: d.language || 'en',
          note: d.note,
          shared_summary: d.shared_summary,
          status: d.status as AppointmentStatus,
          booking_ref: d.booking_ref,
          is_demo: d.is_demo,
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));

        // Merge and update local storage so user retains offline copy
        mapped.forEach((app) => this.fallback.saveStoredAppointment(app));
        return mapped;
      }
    } catch (e) {
      console.warn('[Supabase] Failed to fetch appointments from Supabase:', e);
    }

    return this.fallback.getMyAppointments(userId);
  }

  public async rescheduleAppointment(
    appointmentId: string,
    newSlotId: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.rescheduleAppointment(appointmentId, newSlotId);
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          slot_id: newSlotId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (!error && data) {
        const updatedApp: Appointment = {
          id: data.id,
          user_id: data.user_id,
          facility_id: data.facility_id,
          facility_name: data.facility_name,
          facility_address: data.facility_address,
          slot_id: data.slot_id,
          slot_start: data.slot_start,
          slot_end: data.slot_end,
          purpose: data.purpose,
          patient_name: data.patient_name,
          patient_age: data.patient_age,
          patient_phone: data.patient_phone,
          language: data.language,
          note: data.note,
          shared_summary: data.shared_summary,
          status: data.status as AppointmentStatus,
          booking_ref: data.booking_ref,
          is_demo: data.is_demo,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        this.fallback.saveStoredAppointment(updatedApp);
        return { success: true, appointment: updatedApp };
      }
    } catch (e) {
      console.warn('[Supabase] Reschedule update failed on Supabase:', e);
    }

    return this.fallback.rescheduleAppointment(appointmentId, newSlotId);
  }

  public async cancelAppointment(
    appointmentId: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.cancelAppointment(appointmentId);
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'Cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (!error && data) {
        const cancelledApp: Appointment = {
          id: data.id,
          user_id: data.user_id,
          facility_id: data.facility_id,
          facility_name: data.facility_name,
          facility_address: data.facility_address,
          slot_id: data.slot_id,
          slot_start: data.slot_start,
          slot_end: data.slot_end,
          purpose: data.purpose,
          patient_name: data.patient_name,
          patient_age: data.patient_age,
          patient_phone: data.patient_phone,
          language: data.language,
          note: data.note,
          shared_summary: data.shared_summary,
          status: 'Cancelled',
          booking_ref: data.booking_ref,
          is_demo: data.is_demo,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        this.fallback.saveStoredAppointment(cancelledApp);
        return { success: true, appointment: cancelledApp };
      }
    } catch (e) {
      console.warn('[Supabase] Cancel update failed on Supabase:', e);
    }

    return this.fallback.cancelAppointment(appointmentId);
  }

  public async saveComparison(
    userId: string,
    facilityIds: string[],
    treatmentName: string
  ): Promise<{ success: boolean; comparison?: SavedComparisonItem; error?: string }> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.saveComparison(userId, facilityIds, treatmentName);
    }

    try {
      const { data, error } = await supabase
        .from('saved_comparisons')
        .insert([
          {
            user_id: userId && userId !== 'guest' ? userId : null,
            facility_ids: facilityIds,
            treatment_name: treatmentName,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const comp: SavedComparisonItem = {
          id: data.id,
          user_id: data.user_id || userId,
          facility_ids: data.facility_ids,
          treatment_name: data.treatment_name,
          created_at: data.created_at,
        };
        this.fallback.saveComparison(userId, facilityIds, treatmentName);
        return { success: true, comparison: comp };
      } else if (error) {
        console.warn('[Supabase] saveComparison failed, using local storage:', error.message);
      }
    } catch (e) {
      console.warn('[Supabase] saveComparison error, falling back:', e);
    }

    return this.fallback.saveComparison(userId, facilityIds, treatmentName);
  }

  public async getSavedComparisons(userId?: string): Promise<SavedComparisonItem[]> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.getSavedComparisons(userId);
    }

    try {
      let query = supabase
        .from('saved_comparisons')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId && userId !== 'guest') {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          facility_ids: Array.isArray(d.facility_ids) ? d.facility_ids : [],
          treatment_name: d.treatment_name,
          created_at: d.created_at,
        }));
      }
    } catch (e) {
      console.warn('[Supabase] getSavedComparisons error, falling back to local storage:', e);
    }

    return this.fallback.getSavedComparisons(userId);
  }

  public async deleteSavedComparison(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase || !isSupabaseConfigured) {
      return this.fallback.deleteSavedComparison(id);
    }

    try {
      const { error } = await supabase
        .from('saved_comparisons')
        .delete()
        .eq('id', id);

      if (!error) {
        this.fallback.deleteSavedComparison(id);
        return { success: true };
      }
    } catch (e) {
      console.warn('[Supabase] deleteSavedComparison error, falling back:', e);
    }

    return this.fallback.deleteSavedComparison(id);
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

// Export singleton repository instance with Supabase adapter when configured, falling back to LocalStorage
const demoRepo = new DemoAppointmentRepository();
export const appointmentRepo: AppointmentRepository = isSupabaseConfigured && supabase
  ? new SupabaseAppointmentRepository(demoRepo)
  : demoRepo;
