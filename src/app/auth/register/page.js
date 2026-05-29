'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [role, setRole] = useState('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    // Create profile row
    await supabase.from('profiles').insert({ id: data.user.id, role, full_name: fullName, phone });
    router.push(role === 'clinic' ? '/clinic/dashboard' : '/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-md">
        <Link href="/" className="text-2xl font-extrabold text-brand block mb-6">Slot<span className="text-teal">MD</span></Link>
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">Free to join</p>

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {['patient', 'clinic'].map(r => (
            <button key={r} type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${role === r ? 'bg-white shadow text-brand' : 'text-gray-500'}`}>
              {r === 'patient' ? 'I\'m a Patient' : 'I Represent a Clinic'}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">{role === 'clinic' ? 'Your Name' : 'Full Name'}</label>
            <input type="text" required className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input type="password" required minLength={6} className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
