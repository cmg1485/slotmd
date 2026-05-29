import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { sendNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return NextResponse.json({ received: true });

    const admin = createAdminClient();

    // Activate booking
    const { data: booking } = await admin.from('booking_requests')
      .update({
        status: 'active',
        stripe_payment_intent: session.payment_intent,
        amount_paid: session.amount_total,
      })
      .eq('id', bookingId)
      .select('*, clinics(owner_id, name)')
      .single();

    if (!booking) return NextResponse.json({ received: true });

    // Notify patient
    await admin.from('notifications').insert({
      user_id: booking.patient_id,
      type: 'booking_active',
      title: 'Payment received — you\'re in the queue!',
      body: `We've received your $19.99 booking fee. You'll be contacted as soon as a matching ${booking.specialty} slot opens.`,
      related_id: bookingId,
      link: '/dashboard',
    });

    await sendNotificationEmail({
      to: booking.patient_email,
      name: booking.patient_name,
      title: 'Payment received — you\'re in the queue!',
      dashboardPath: '/dashboard',
    }).catch(console.error);

    // Notify clinic owner if a specific clinic was requested
    if (booking.clinics?.owner_id) {
      await admin.from('notifications').insert({
        user_id: booking.clinics.owner_id,
        type: 'new_request',
        title: `New cancellation request — ${booking.specialty}`,
        body: `${booking.patient_name} is looking for a ${booking.specialty} appointment. Review and assign a slot.`,
        related_id: bookingId,
        link: '/clinic/dashboard',
      });
    }
  }

  return NextResponse.json({ received: true });
}
