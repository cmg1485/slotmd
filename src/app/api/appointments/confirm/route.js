import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendNotificationEmail, sendBookingConfirmedEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { bookingRequestId, clinicId, patientId, scheduledAt, patientEmail, patientName, clinicName } = await req.json();
    const admin = createAdminClient();

    // Create appointment record
    const { data: { user } } = await (await import('@/lib/supabase/server')).createClient().auth.getUser().catch(() => ({ data: {} }));

    await admin.from('appointments').insert({
      booking_request_id: bookingRequestId,
      clinic_id: clinicId,
      patient_id: patientId,
      scheduled_at: new Date().toISOString(), // store as ISO; scheduledAt is a display string
      notes: scheduledAt, // store display slot string in notes for simplicity
    });

    // Update booking status
    await admin.from('booking_requests').update({ status: 'confirmed' }).eq('id', bookingRequestId);

    // Notify patient in-app
    await admin.from('notifications').insert({
      user_id: patientId,
      type: 'appointment_confirmed',
      title: 'Your appointment has been confirmed!',
      body: `${clinicName} has confirmed your appointment for ${scheduledAt}. Check your email for details.`,
      related_id: bookingRequestId,
      link: '/dashboard',
    });

    // Send email to patient
    await sendBookingConfirmedEmail({
      to: patientEmail,
      patientName,
      clinicName,
      scheduledAt,
    }).catch(console.error);

    // Also send a "you have an update" style email
    await sendNotificationEmail({
      to: patientEmail,
      name: patientName,
      title: `Your appointment at ${clinicName} has been confirmed`,
      dashboardPath: '/dashboard',
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Confirm appointment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
