import { NextResponse } from 'next/server';
import { stripe, BOOKING_PRICE_CENTS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req) {
  try {
    const { bookingId, email } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: BOOKING_PRICE_CENTS,
          product_data: {
            name: 'SlotMD – Cancellation Slot Booking',
            description: 'One-time fee to join the cancellation queue.',
          },
        },
        quantity: 1,
      }],
      metadata: { bookingId },
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/book?cancelled=1`,
    });

    // Save session ID to booking
    const admin = createAdminClient();
    await admin.from('booking_requests')
      .update({ stripe_session_id: session.id })
      .eq('id', bookingId);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
