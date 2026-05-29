import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'notifications@slotmd.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendNotificationEmail({ to, name, title, dashboardPath = '/dashboard' }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `SlotMD: ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="color:#0d6efd;">SlotMD</h2>
        <p>Hi ${name},</p>
        <p>You have a new update on your SlotMD account:</p>
        <div style="background:#f8f9fa;border-left:4px solid #0d6efd;padding:16px;margin:16px 0;border-radius:6px;">
          <strong>${title}</strong>
        </div>
        <p>Log in to your dashboard to see the details.</p>
        <a href="${APP_URL}${dashboardPath}"
           style="display:inline-block;background:#0d6efd;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:600;">
          View Update →
        </a>
        <p style="color:#6c757d;font-size:0.85rem;margin-top:24px;">
          You're receiving this because you have an account on SlotMD.
        </p>
      </div>
    `,
  });
}

export async function sendBookingConfirmedEmail({ to, patientName, clinicName, scheduledAt }) {
  const date = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your appointment is confirmed — SlotMD',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="color:#0d6efd;">SlotMD</h2>
        <p>Hi ${patientName},</p>
        <p>Great news — your appointment has been confirmed!</p>
        <div style="background:#d1e7dd;border-left:4px solid #198754;padding:16px;margin:16px 0;border-radius:6px;">
          <strong>📅 ${date}</strong><br/>
          <span style="color:#555;">at ${clinicName}</span>
        </div>
        <p>Please arrive a few minutes early. If you need to cancel, contact the clinic directly.</p>
        <a href="${APP_URL}/dashboard"
           style="display:inline-block;background:#198754;color:#fff;padding:12px 24px;
                  border-radius:8px;text-decoration:none;font-weight:600;">
          View Appointment →
        </a>
      </div>
    `,
  });
}
