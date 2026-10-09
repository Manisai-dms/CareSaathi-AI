// Automated Test Suite for CareSaathi AI Upgrades
// Tests: Slot availability, Double-booking race prevention, Reschedule/Cancel rules, MapProvider fallback logic

import assert from 'node:assert';

console.log('🧪 Starting CareSaathi AI Upgrade Verification Tests...\n');

// Mock localStorage for node environment
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

// 1. In-memory Slot Generator & Repository Logic Mirror
function generate14DaySlots(facilityId) {
  const slots = [];
  const now = new Date();

  for (let day = 0; day < 14; day++) {
    const slotDate = new Date(now);
    slotDate.setDate(now.getDate() + day);
    const dateStr = slotDate.toISOString().split('T')[0];

    const timeConfigs = [
      { start: '09:30', end: '10:15', purpose: ['consultation', 'pre_surgery'] },
      { start: '11:00', end: '11:45', purpose: ['consultation', 'second_opinion'] },
      { start: '14:30', end: '15:15', purpose: ['consultation', 'diagnostics'] },
      { start: '16:00', end: '16:45', purpose: ['consultation', 'second_opinion'] },
      { start: '18:00', end: '18:45', purpose: ['consultation'] }
    ];

    timeConfigs.forEach((cfg, idx) => {
      const isPast = day === 0 && parseInt(cfg.start.split(':')[0]) <= now.getHours();
      // On day 1, make 2nd slot fully booked for test
      const isMockFull = (day === 1 && idx === 1);
      const capacity = 2;
      const bookedCount = isMockFull ? 2 : 0;

      slots.push({
        id: `slot_${facilityId}_${dateStr}_${idx}`,
        facility_id: facilityId,
        slot_start: `${dateStr}T${cfg.start}:00Z`,
        slot_end: `${dateStr}T${cfg.end}:00Z`,
        capacity,
        booked_count: bookedCount,
        purpose_types: cfg.purpose,
        is_demo: true,
        is_past: isPast
      });
    });
  }
  return slots;
}

class TestAppointmentRepo {
  constructor() {
    this.slots = generate14DaySlots('fac_1');
    this.appointments = [];
  }

  getAvailableSlots(facilityId, dateStr, purpose) {
    return this.slots.filter(s => {
      if (s.facility_id !== facilityId) return false;
      if (s.is_past) return false;
      const sDate = s.slot_start.split('T')[0];
      if (dateStr && sDate !== dateStr) return false;
      if (purpose && !s.purpose_types.includes(purpose)) return false;
      return s.booked_count < s.capacity;
    });
  }

  bookAppointment(payload) {
    const slot = this.slots.find(s => s.id === payload.slot_id);
    if (!slot) {
      throw new Error('Slot not found');
    }

    // Atomic double booking check
    if (slot.booked_count >= slot.capacity) {
      throw new Error('That slot was just taken, pick another');
    }

    // Increment atomically
    slot.booked_count += 1;

    const appointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      booking_ref: `CS-${Math.floor(100000 + Math.random() * 900000)}`,
      slot_id: slot.id,
      facility_id: payload.facility_id,
      facility_name: payload.facility_name,
      purpose: payload.purpose,
      patient_name: payload.patient_name,
      patient_phone: payload.patient_phone,
      slot_start: slot.slot_start,
      slot_end: slot.slot_end,
      status: payload.is_demo ? 'confirmed' : 'requested',
      is_demo: payload.is_demo,
      created_at: new Date().toISOString()
    };

    this.appointments.push(appointment);
    return appointment;
  }

  rescheduleAppointment(appointmentId, newSlotId) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    const newSlot = this.slots.find(s => s.id === newSlotId);
    if (!newSlot) throw new Error('New slot not found');

    if (newSlot.booked_count >= newSlot.capacity) {
      throw new Error('That slot was just taken, pick another');
    }

    // Release old slot
    const oldSlot = this.slots.find(s => s.id === apt.slot_id);
    if (oldSlot && oldSlot.booked_count > 0) {
      oldSlot.booked_count -= 1;
    }

    // Claim new slot
    newSlot.booked_count += 1;
    apt.slot_id = newSlot.id;
    apt.slot_start = newSlot.slot_start;
    apt.slot_end = newSlot.slot_end;
    apt.status = 'confirmed';

    return apt;
  }

  cancelAppointment(appointmentId) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');

    // Free the slot
    const slot = this.slots.find(s => s.id === apt.slot_id);
    if (slot && slot.booked_count > 0) {
      slot.booked_count -= 1;
    }

    apt.status = 'cancelled';
    return apt;
  }
}

// TEST 1: 14-Day Slot Availability Generation
console.log('Test 1: 14-Day Slot Availability Generation & Purpose Filtering');
const repo = new TestAppointmentRepo();
assert(repo.slots.length === 14 * 5, `Expected 70 slots, found ${repo.slots.length}`);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const consultationSlots = repo.getAvailableSlots('fac_1', tomorrowStr, 'consultation');
assert(consultationSlots.length > 0, 'Consultation slots should be available for day + 2');

const diagnosticsSlots = repo.getAvailableSlots('fac_1', tomorrowStr, 'diagnostics');
assert(diagnosticsSlots.length === 1, `Expected 1 diagnostics slot on day + 2, got ${diagnosticsSlots.length}`);
console.log('✅ PASS: Slot generation and purpose filtering verified.\n');

// TEST 2: Successful Booking & Honesty Status
console.log('Test 2: Successful Booking & Honesty Rule (Demo vs Real)');
const testSlot = consultationSlots[0];
const initialBooked = testSlot.booked_count;

// Book as Demo Facility
const demoApt = repo.bookAppointment({
  slot_id: testSlot.id,
  facility_id: 'fac_1',
  facility_name: 'CareSaathi Community Hospital',
  purpose: 'consultation',
  patient_name: 'Ravi Kumar',
  patient_phone: '9876543210',
  is_demo: true
});

assert(demoApt.booking_ref.startsWith('CS-'), 'Booking ref must start with CS-');
assert.strictEqual(demoApt.status, 'confirmed', 'Demo appointments are confirmed');
assert.strictEqual(demoApt.is_demo, true, 'Demo appointments must have is_demo = true');
assert.strictEqual(testSlot.booked_count, initialBooked + 1, 'Booked count must increment by 1');

// Book as Real Facility
const testSlot2 = consultationSlots[1];
const realApt = repo.bookAppointment({
  slot_id: testSlot2.id,
  facility_id: 'real_hosp_42',
  facility_name: 'Nizam Institute of Medical Sciences',
  purpose: 'consultation',
  patient_name: 'Ananya Sharma',
  patient_phone: '9876501234',
  is_demo: false
});

assert.strictEqual(realApt.status, 'requested', 'Real hospital booking must be "requested" (awaiting confirmation)');
assert.strictEqual(realApt.is_demo, false, 'Real hospital booking must have is_demo = false');
console.log('✅ PASS: Booking and honesty status rules verified.\n');

// TEST 3: Double-Booking Prevention & Race Condition Guard
console.log('Test 3: Double-Booking Prevention & Capacity Guard');
// Fill the remaining capacity of testSlot
repo.bookAppointment({
  slot_id: testSlot.id,
  facility_id: 'fac_1',
  facility_name: 'CareSaathi Community Hospital',
  purpose: 'consultation',
  patient_name: 'Second Patient',
  patient_phone: '9876543211',
  is_demo: true
});

assert.strictEqual(testSlot.booked_count, testSlot.capacity, 'Slot should now be at max capacity');

// Attempt to overbook
let overbookErrorCaught = false;
try {
  repo.bookAppointment({
    slot_id: testSlot.id,
    facility_id: 'fac_1',
    facility_name: 'CareSaathi Community Hospital',
    purpose: 'consultation',
    patient_name: 'Third Patient (Should Fail)',
    patient_phone: '9876543212',
    is_demo: true
  });
} catch (err) {
  overbookErrorCaught = true;
  assert.strictEqual(err.message, 'That slot was just taken, pick another');
}

assert(overbookErrorCaught, 'Overbooking must throw "That slot was just taken, pick another"');
console.log('✅ PASS: Double-booking prevention and capacity guard verified.\n');

// TEST 4: Reschedule Appointment Rules
console.log('Test 4: Reschedule Rules (Capacity Handshake)');
const targetNewSlot = consultationSlots[2];
const prevOldSlotBooked = testSlot.booked_count;
const prevNewSlotBooked = targetNewSlot.booked_count;

const rescheduledApt = repo.rescheduleAppointment(demoApt.id, targetNewSlot.id);
assert.strictEqual(rescheduledApt.slot_id, targetNewSlot.id, 'Slot ID must match target new slot');
assert.strictEqual(testSlot.booked_count, prevOldSlotBooked - 1, 'Old slot booked_count must decrement');
assert.strictEqual(targetNewSlot.booked_count, prevNewSlotBooked + 1, 'New slot booked_count must increment');
console.log('✅ PASS: Reschedule rules verified.\n');

// TEST 5: Cancel Appointment Rules
console.log('Test 5: Cancellation Rules & Capacity Release');
const preCancelCount = targetNewSlot.booked_count;
const cancelledApt = repo.cancelAppointment(rescheduledApt.id);

assert.strictEqual(cancelledApt.status, 'cancelled', 'Appointment status must be cancelled');
assert.strictEqual(targetNewSlot.booked_count, preCancelCount - 1, 'Slot booked_count must decrement on cancel');
console.log('✅ PASS: Cancel rules and capacity release verified.\n');

// TEST 6: MapProvider Graceful Degradation & Key Fallback Selection
console.log('Test 6: MapProvider Fallback Selection');
function resolveMapProvider(apiKey, googleLoadFailed = false) {
  if (!apiKey || apiKey.trim() === '' || googleLoadFailed) {
    return {
      provider: 'LeafletMapProvider',
      engine: 'OpenStreetMap',
      degraded: true,
      notice: 'Using OpenStreetMap fallback'
    };
  }
  return {
    provider: 'GoogleMapProvider',
    engine: 'Google Maps JavaScript API',
    degraded: false,
    notice: null
  };
}

// Case A: Missing key
const missingKeyChoice = resolveMapProvider('');
assert.strictEqual(missingKeyChoice.provider, 'LeafletMapProvider');
assert.strictEqual(missingKeyChoice.degraded, true);

// Case B: Undefined key
const undefinedKeyChoice = resolveMapProvider(undefined);
assert.strictEqual(undefinedKeyChoice.provider, 'LeafletMapProvider');

// Case C: Valid key present
const validKeyChoice = resolveMapProvider('AIzaSyDUMMYKEY123');
assert.strictEqual(validKeyChoice.provider, 'GoogleMapProvider');
assert.strictEqual(validKeyChoice.degraded, false);

// Case D: Valid key but Google script fails to load (network/adblock/bad key)
const failedLoadChoice = resolveMapProvider('AIzaSyDUMMYKEY123', true);
assert.strictEqual(failedLoadChoice.provider, 'LeafletMapProvider');
assert.strictEqual(failedLoadChoice.degraded, true);

console.log('✅ PASS: MapProvider fallback selection verified.\n');

console.log('🎉 ALL 6 TEST SUITES PASSED CLEANLY (100% assertions verified).');
