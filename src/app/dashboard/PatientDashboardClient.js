'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const STATUS_LABELS = {
  pending_payment: { label: 'Awaiting Payment', cls: 'badge-pending' },
  active: { label: 'In Queue', cls: 'badge-active' },
  matched: { label: 'Matched', cls: 'badge-active' },
  confirmed: { label: 'Confirmed ✓', cls: 'badge-confirmed' },
  cancelled: { label: 'Cancelled', cls: 'badge-cancelled' },
};

export default function PatientDashboardClient({ user, profile, requests: initRequests, notifications: initNotifs }) {
  const [notifications, setNotifications] = useState(initNotifs);
  const [requests] = useState(initRequests);
  const [tab, setTab] = useState('requests');
  const supabase = createClient();

  // Real-time notifications
  useEffect(() => {
    const channel = supabase.channel('patient-notifs')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user.id]);

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-gray-500 text-sm">{profile?.full_name || user.email}</p>
        </div>
        <Link href="/book" className="btn btn-primary">+ New Booking</Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[['requests', 'My Bookings'], ['notifications', `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === v ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">
              <p className="mb-4">No bookings yet.</p>
              <Link href="/book" className="btn btn-primary">Book a Cancellation Slot</Link>
            </div>
          ) : requests.map(r => {
            const st = STATUS_LABELS[r.status] || { label: r.status, cls: 'badge-pending' };
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-lg">{r.specialty}</div>
                    {r.clinics && <div className="text-sm text-gray-600 mt-0.5">📍 {r.clinics.name}</div>}
                    <div className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={st.cls}>{st.label}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <span>Timing: {r.timing_preference}</span>
                  {r.preferred_days?.length > 0 && <span>Days: {r.preferred_days.join(', ')}</span>}
                  {r.preferred_time_of_day && <span>Time: {r.preferred_time_of_day}</span>}
                </div>
                {r.status === 'confirmed' && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800 font-semibold">
                    ✅ Your appointment has been confirmed! Check your email for details.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div>
          {unreadCount > 0 && (
            <div className="flex justify-end mb-3">
              <button onClick={markAllRead} className="text-sm text-brand hover:underline">Mark all as read</button>
            </div>
          )}
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">No notifications yet.</div>
            ) : notifications.map(n => (
              <div key={n.id}
                className={`card p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors ${!n.read ? 'border-brand/30 bg-brand-light/30' : ''}`}
                onClick={() => !n.read && markRead(n.id)}>
                <div>
                  <div className={`font-semibold text-sm ${!n.read ? 'text-brand' : 'text-gray-800'}`}>
                    {!n.read && <span className="inline-block w-2 h-2 bg-brand rounded-full mr-2 align-middle" />}
                    {n.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">{n.body}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                {n.link && (
                  <Link href={n.link} className="btn btn-outline btn-sm shrink-0" onClick={e => e.stopPropagation()}>
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
