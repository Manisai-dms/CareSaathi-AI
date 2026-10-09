-- ==============================================================================
-- CareSaathi AI - Supabase Migration: Appointments & Hospital Slots
-- Migration: 20261009_appointments_and_slots.sql
-- ==============================================================================

-- 1. Hospital Slots Table
CREATE TABLE IF NOT EXISTS public.hospital_slots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    facility_id TEXT NOT NULL,
    slot_start TIMESTAMPTZ NOT NULL,
    slot_end TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    booked_count INT NOT NULL DEFAULT 0,
    purpose_types TEXT[] NOT NULL DEFAULT ARRAY['Consultation', 'Pre-surgery evaluation', 'Diagnostics (MRI, CT)', 'Second opinion'],
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT slot_capacity_check CHECK (booked_count <= capacity),
    CONSTRAINT slot_timing_check CHECK (slot_end > slot_start)
);

CREATE INDEX IF NOT EXISTS idx_hospital_slots_facility_time ON public.hospital_slots (facility_id, slot_start);
CREATE INDEX IF NOT EXISTS idx_hospital_slots_availability ON public.hospital_slots (facility_id, booked_count, capacity);

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT, -- Nullable for guest bookings
    facility_id TEXT NOT NULL,
    slot_id TEXT NOT NULL REFERENCES public.hospital_slots(id) ON DELETE RESTRICT,
    purpose TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_age INT NOT NULL CHECK (patient_age > 0 AND patient_age < 130),
    patient_phone TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    note TEXT,
    shared_summary JSONB,
    status TEXT NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'Confirmed', 'Completed', 'Cancelled')),
    booking_ref TEXT NOT NULL UNIQUE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments (user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_slot ON public.appointments (slot_id);
CREATE INDEX IF NOT EXISTS idx_appointments_facility ON public.appointments (facility_id);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_ref ON public.appointments (booking_ref);

-- 3. Row Level Security (RLS)
ALTER TABLE public.hospital_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Slots are publicly readable so any patient can browse available slots
CREATE POLICY "Public read access for hospital slots" 
    ON public.hospital_slots FOR SELECT 
    USING (true);

-- Authenticated or guest users can read their own appointments
CREATE POLICY "Users can read their own appointments" 
    ON public.appointments FOR SELECT 
    USING (
        auth.uid()::text = user_id 
        OR (user_id IS NULL AND booking_ref IS NOT NULL)
    );

-- Users can insert appointments via the RPC function or directly for themselves
CREATE POLICY "Users can insert their own appointments" 
    ON public.appointments FOR INSERT 
    WITH CHECK (
        auth.uid()::text = user_id 
        OR user_id IS NULL
    );

-- Users can update status (e.g. cancel) on their own appointments
CREATE POLICY "Users can update their own appointments" 
    ON public.appointments FOR UPDATE 
    USING (
        auth.uid()::text = user_id 
        OR user_id IS NULL
    )
    WITH CHECK (
        auth.uid()::text = user_id 
        OR user_id IS NULL
    );

-- 4. Atomic RPC Function: book_appointment
-- Handles race conditions and overbooking in a single atomic transaction
CREATE OR REPLACE FUNCTION public.book_appointment(
    p_slot_id TEXT,
    p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_slot RECORD;
    v_appointment RECORD;
    v_booking_ref TEXT;
BEGIN
    -- Lock the slot row for update to prevent concurrent overbooking
    SELECT * INTO v_slot
    FROM public.hospital_slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
    END IF;

    -- Check capacity constraint
    IF v_slot.booked_count >= v_slot.capacity THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot is already fully booked. Please select another time slot.');
    END IF;

    -- Generate human-friendly booking reference (e.g., CS-HYD-84920)
    v_booking_ref := 'CS-' || UPPER(SUBSTRING(COALESCE(p_payload->>'facility_id', 'FAC') FROM 1 FOR 3)) || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');

    -- Increment slot booked_count
    UPDATE public.hospital_slots
    SET booked_count = booked_count + 1
    WHERE id = p_slot_id;

    -- Insert new appointment
    INSERT INTO public.appointments (
        user_id,
        facility_id,
        slot_id,
        purpose,
        patient_name,
        patient_age,
        patient_phone,
        language,
        note,
        shared_summary,
        status,
        booking_ref,
        is_demo
    ) VALUES (
        p_payload->>'user_id',
        COALESCE(p_payload->>'facility_id', v_slot.facility_id),
        p_slot_id,
        COALESCE(p_payload->>'purpose', 'Consultation'),
        COALESCE(p_payload->>'patient_name', 'Patient'),
        COALESCE((p_payload->>'patient_age')::INT, 35),
        COALESCE(p_payload->>'patient_phone', ''),
        COALESCE(p_payload->>'language', 'en'),
        p_payload->>'note',
        p_payload->'shared_summary',
        CASE WHEN v_slot.is_demo THEN 'Confirmed' ELSE 'Requested' END,
        v_booking_ref,
        v_slot.is_demo
    )
    RETURNING * INTO v_appointment;

    RETURN jsonb_build_object(
        'success', true,
        'appointment', to_jsonb(v_appointment)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. Atomic RPC Function: reschedule_appointment
CREATE OR REPLACE FUNCTION public.reschedule_appointment(
    p_appointment_id TEXT,
    p_new_slot_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_old_slot_id TEXT;
    v_new_slot RECORD;
BEGIN
    SELECT * INTO v_app FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Appointment not found');
    END IF;

    v_old_slot_id := v_app.slot_id;

    -- Lock new slot
    SELECT * INTO v_new_slot FROM public.hospital_slots WHERE id = p_new_slot_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'New slot not found');
    END IF;

    IF v_new_slot.booked_count >= v_new_slot.capacity THEN
        RETURN jsonb_build_object('success', false, 'error', 'Selected new slot is already fully booked.');
    END IF;

    -- Decrement old slot
    UPDATE public.hospital_slots SET booked_count = GREATEST(0, booked_count - 1) WHERE id = v_old_slot_id;
    -- Increment new slot
    UPDATE public.hospital_slots SET booked_count = booked_count + 1 WHERE id = p_new_slot_id;

    -- Update appointment
    UPDATE public.appointments
    SET slot_id = p_new_slot_id,
        updated_at = now()
    WHERE id = p_appointment_id
    RETURNING * INTO v_app;

    RETURN jsonb_build_object('success', true, 'appointment', to_jsonb(v_app));
END;
$$;

-- 6. Atomic RPC Function: cancel_appointment
CREATE OR REPLACE FUNCTION public.cancel_appointment(
    p_appointment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
BEGIN
    SELECT * INTO v_app FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Appointment not found');
    END IF;

    -- Release slot
    UPDATE public.hospital_slots
    SET booked_count = GREATEST(0, booked_count - 1)
    WHERE id = v_app.slot_id;

    -- Update status
    UPDATE public.appointments
    SET status = 'Cancelled',
        updated_at = now()
    WHERE id = p_appointment_id
    RETURNING * INTO v_app;

    RETURN jsonb_build_object('success', true, 'appointment', to_jsonb(v_app));
END;
$$;

-- 7. Seed Generator for Demo Facilities (Next 14 Days)
CREATE OR REPLACE FUNCTION public.seed_demo_facility_slots(
    p_facility_id TEXT,
    p_days INT DEFAULT 14
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_day INT;
    v_date DATE;
    v_count INT := 0;
    v_hours INT[] := ARRAY[9, 10, 11, 14, 15, 16, 17];
    v_h INT;
    v_slot_start TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_booked INT;
BEGIN
    FOR v_day IN 0..(p_days - 1) LOOP
        v_date := CURRENT_DATE + v_day;
        FOREACH v_h IN ARRAY v_hours LOOP
            v_slot_start := v_date + (v_h || ' hours')::INTERVAL;
            v_slot_end := v_slot_start + '45 minutes'::INTERVAL;
            
            -- Seed a couple of slots as full (capacity 2, booked 2) to demonstrate full state
            IF (v_day = 0 AND v_h = 10) OR (v_day = 1 AND v_h = 14) THEN
                v_booked := 2;
            ELSE
                v_booked := 0;
            END IF;

            INSERT INTO public.hospital_slots (
                facility_id,
                slot_start,
                slot_end,
                capacity,
                booked_count,
                purpose_types,
                is_demo
            ) VALUES (
                p_facility_id,
                v_slot_start,
                v_slot_end,
                2,
                v_booked,
                ARRAY['Consultation', 'Pre-surgery evaluation', 'Diagnostics (MRI, CT)', 'Second opinion'],
                true
            );
            v_count := v_count + 1;
        END LOOP;
    END LOOP;
    RETURN v_count;
END;
$$;
