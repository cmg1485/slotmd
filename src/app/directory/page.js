import { createClient } from '@/lib/supabase/server';
import DirectoryClient from './DirectoryClient';

export const revalidate = 60;

export default async function DirectoryPage() {
  const supabase = createClient();
  const { data: clinics } = await supabase
    .from('clinics')
    .select('*, doctors(*)')
    .eq('active', true)
    .order('name');

  return <DirectoryClient clinics={clinics || []} />;
}
