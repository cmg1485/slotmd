'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setRole(profile?.role);
        const { count } = await supabase.from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('read', false);
        setNotifCount(count || 0);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setRole(null); setNotifCount(0); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null); setRole(null);
    router.push('/');
    router.refresh();
  }

  const dashLink = role === 'clinic' ? '/clinic/dashboard' : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-brand">
          Slot<span className="text-teal">MD</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/directory" className="text-gray-700 hover:text-brand">Find a Clinic</Link>
          <Link href="/for-clinics" className="text-gray-700 hover:text-brand">For Clinics</Link>
          {user ? (
            <>
              <Link href={dashLink} className="relative text-gray-700 hover:text-brand">
                Dashboard
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Link>
              <button onClick={signOut} className="btn btn-ghost text-sm">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-brand">Sign In</Link>
              <Link href="/auth/register" className="btn btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-700" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link href="/directory" onClick={() => setMenuOpen(false)}>Find a Clinic</Link>
          <Link href="/for-clinics" onClick={() => setMenuOpen(false)}>For Clinics</Link>
          {user ? (
            <>
              <Link href={dashLink} onClick={() => setMenuOpen(false)}>Dashboard {notifCount > 0 && `(${notifCount})`}</Link>
              <button onClick={signOut}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
