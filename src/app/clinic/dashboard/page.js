import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClinicDashboardClient from './ClinicDashboardClient';

export default async function ClinicDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role,full_name').eq('id', user.id).single();
  if (profile?.role === 'patient') redirect('/dashboard');

  // Get this clinic (clinic owner may have one clinic)
  const { data: clinic } = await supabase.from('clinics')
    .select('*, doctors(*)')
    .eq('owner_id', user.id)
    .single();

  let requests = [], notifications = [];
  if (clinic) {
    [{ data: requests }, { data: notifications }] = await Promise.all([
      supabase.from('booking_requests')
        .select('*')
        .eq('clinic_id', clinic.id)
        .in('status', ['active', 'matched', 'confirmed'])
        .order('created_at', { ascending: false }),
      supabase.from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30),
    ]);
  }

  return (
    <ClinicDashboardClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
      clinic={clinic}
      requests={requests || []}
      notifications={notifications || []}
    />
  );
}
