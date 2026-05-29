'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const STATUS_LABELS = {
  active: { label: 'Awaiting Assignment', cls: 'badge-active' },
  matched: { label: 'Matched', cls: 'badge-active' },
  confirmed: { label: 'Confirmed ✓', cls: 'badge-confirmed' },
};

function generateSlots() {
  const slots = [];
  const today = new Date();
  for (let d = 1; d <= 7; d++) {
    const day = new Date(today); day.setDate(today.getDate() + d);
    if (day.getDay() === 0 || day.getDay() === 6) continue; // skip weekends
    const dayStr = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    ['9:00 AM','10:30 AM','11:00 AM','1:00 PM','2:30 PM','3:00 PM','4:00 PM'].forEach(t =>
      slots.push(`${dayStr} · ${t}`)
    );
  }
  return slots;
}

export default function ClinicDashboardClient({ user, profile, clinic, requests: initRequests, notifications: initNotifs }) {
  const [requests, setRequests] = useState(initRequests);
  const [notifications, setNotifications] = useState(initNotifs);
  const [tab, setTab] = useState('requests');
  const [activeRequest, setActiveRequest] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const supabase = createClient();

  const slots = generateSlots();
  const unreadCount = notifications.filter(n => !n.read).length;
  const pending = requests.filter(r => r.status === 'active' || r.status === 'matched');
  const confirmed = requests.filter(r => r.status === 'confirmed');

  // Real-time notifications
  useEffect(() => {
    const channel = supabase.channel('clinic-notifs')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => setNotifications(prev => [payload.new, ...prev]))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user.id]);

  async function confirmAppointment() {
    if (!selectedSlot || !activeRequest) return;
    setConfirming(true);
    const res = await fetch('/api/appointments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingRequestId: activeRequest.id,
        clinicId: clinic.id,
        patientId: activeRequest.patient_id,
        scheduledAt: selectedSlot,
        patientEmail: activeRequest.patient_email,
        patientName: activeRequest.patient_name,
        clinicName: clinic.name,
      }),
    });
    const result = await res.json();
    if (result.error) { alert(result.error); setConfirming(false); return; }
    setRequests(prev => prev.map(r => r.id === activeRequest.id ? { ...r, status: 'confirmed' } : r));
    setActiveRequest(null);
    setSelectedSlot('');
    setSuccessMsg(`Appointment confirmed for ${activeRequest.patient_name} on ${selectedSlot}`);
    setTimeout(() => setSuccessMsg(''), 6000);
    setConfirming(false);
  }

  async function markNotifRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  if (!clinic) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Set Up Your Clinic Profile</h1>
        <p className="text-gray-500 mb-6">Before you can receive requests, add your clinic information.</p>
        <Link href="/clinic/setup" className="btn btn-primary px-8 py-3">Set Up My Clinic →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{clinic.name}</h1>
          <p className="text-gray-500 text-sm">{clinic.doctors?.map(d => d.name).join(' · ')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/clinic/setup" className="btn btn-outline btn-sm">Edit Profile</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { num: pending.length, lbl: 'Pending Requests' },
          { num: confirmed.length, lbl: 'Confirmed' },
          { num: requests.length, lbl: 'Total This Month' },
          { num: requests.length > 0 ? Math.round((confirmed.length / requests.length) * 100) + '%' : '—', lbl: 'Fill Rate' },
        ].map(s => (
          <div key={s.lbl} className="card p-4">
            <div className="text-2xl font-extrabold text-brand">{s.num}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.lbl}</div>
          </div>
        ))}
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4 font-semibold">
          ✅ {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[['requests', `Requests (${pending.length})`], ['confirmed', `Confirmed (${confirmed.length})`], ['notifications', `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === v ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Pending Requests */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">No pending requests right now.</div>
          ) : pending.map(r => (
            <div key={r.id} className={`card p-5 ${activeRequest?.id === r.id ? 'border-brand ring-1 ring-brand' : ''}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-bold text-lg">{r.patient_name}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{r.specialty} · {r.timing_preference} availability</div>
                  {r.preferred_days?.length > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">Preferred: {r.preferred_days.join(', ')} · {r.preferred_time_of_day}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">
                    {r.patient_email} · {r.patient_phone}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Received {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <button onClick={() => { setActiveRequest(r); setSelectedSlot(''); }}
                  className="btn btn-primary btn-sm shrink-0">
                  Assign Slot
                </button>
              </div>

              {/* Slot picker */}
              {activeRequest?.id === r.id && (
                <div className="mt-5 border-t pt-5">
                  <p className="font-semibold text-sm mb-3">Select an available time slot:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                    {slots.map(s => (
                      <button key={s} onClick={() => setSelectedSlot(s)}
                        className={`text-sm px-3 py-2 rounded-lg border transition-all ${selectedSlot === s ? 'bg-brand text-white border-brand' : 'border-gray-300 hover:border-brand hover:text-brand'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={confirmAppointment} disabled={!selectedSlot || confirming}
                      className="btn btn-green">
                      {confirming ? 'Sending…' : 'Send Confirmation to Patient'}
                    </button>
                    <button onClick={() => setActiveRequest(null)} className="btn btn-ghost btn-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmed */}
      {tab === 'confirmed' && (
        <div className="space-y-3">
          {confirmed.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">No confirmed appointments yet.</div>
          ) : confirmed.map(r => (
            <div key={r.id} className="card p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold">{r.patient_name}</div>
                <div className="text-sm text-gray-600">{r.specialty}</div>
                <div className="text-xs text-gray-400">{r.patient_email} · {r.patient_phone}</div>
              </div>
              <span className="badge-confirmed">Confirmed ✓</span>
            </div>
          ))}
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">No notifications yet.</div>
          ) : notifications.map(n => (
            <div key={n.id}
              className={`card p-4 cursor-pointer ${!n.read ? 'border-brand/30 bg-brand-light/30' : ''}`}
              onClick={() => !n.read && markNotifRead(n.id)}>
              <div className={`font-semibold text-sm ${!n.read ? 'text-brand' : 'text-gray-800'}`}>
                {!n.read && <span className="inline-block w-2 h-2 bg-brand rounded-full mr-2 align-middle" />}
                {n.title}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{n.body}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
