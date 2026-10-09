// ==============================================================================
// CareSaathi AI - Supabase Edge Function: send-appointment-reminder
// Sends Mock SMS / WhatsApp notification for upcoming appointments (< 24h)
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ReminderPayload {
  appointment_id: string;
  patient_phone: string;
  patient_name: string;
  facility_name: string;
  slot_time: string;
  channel?: "whatsapp" | "sms";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const payload: ReminderPayload = await req.json();

    if (!payload.appointment_id || !payload.patient_phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mock provider message dispatch (Twilio / Gupshup / WhatsApp Cloud API)
    const mockMessage = `Namaste ${payload.patient_name}, this is a gentle reminder from CareSaathi AI for your appointment at ${payload.facility_name} scheduled for ${payload.slot_time}. Please carry your Government Photo ID, scheme/ration card, and past prescriptions.`;

    console.log(`[Reminder Notification Sent] To: ${payload.patient_phone} via ${payload.channel || "whatsapp"}`);
    console.log(`Content: ${mockMessage}`);

    return new Response(
      JSON.stringify({
        success: true,
        message_id: `msg_${Date.now()}`,
        status: "delivered_mock",
        recipient: payload.patient_phone,
        preview: mockMessage,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
