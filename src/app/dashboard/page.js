import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PatientDashboardClient from './PatientDashboardClient';

export default async function PatientDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role,full_name').eq('id', user.id).single();
  if (profile?.role === 'clinic') redirect('/clinic/dashboard');

  const [{ data: requests }, { data: notifications }] = await Promise.all([
    supabase.from('booking_requests')
      .select('*, clinics(name,address,city,state)')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return (
    <PatientDashboardClient
      user={{ id: user.id, email: user.email }}
      profile={profile}
      requests={requests || []}
      notifications={notifications || []}
    />
  );
}
