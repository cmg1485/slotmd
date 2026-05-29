'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const SPECIALTIES = ['Cardiology','Dermatology','Endocrinology','Family Medicine',
  'Gastroenterology','Neurology','OB/GYN','Oncology','Ophthalmology','Orthopedics',
  'Pediatrics','Psychiatry','Pulmonology','Rheumatology','Urology'];

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];

function BookForm() {
  const params = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [specialty, setSpecialty] = useState('');
  const [practice, setPractice] = useState(params.get('clinicId') ? 'specific' : 'any');
  const [clinicId] = useState(params.get('clinicId') || '');
  const [clinicName] = useState(params.get('clinicName') || '');
  const [timing, setTiming] = useState('first');
  const [preferredDays, setPreferredDays] = useState([]);
  const [preferredTime, setPreferredTime] = useState('Any time');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('profiles').select('full_name,phone').eq('id', user.id).single()
          .then(({ data }) => {
            if (data?.full_name) setName(data.full_name);
            if (data?.phone) setPhone(data.phone);
            setEmail(user.email);
          });
      }
    });
  }, []);

  function toggleDay(d) {
    setPreferredDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { router.push('/auth/register'); return; }
    if (!specialty) { setError('Please select a specialty.'); return; }
    setLoading(true); setError('');

    // Create pending booking request
    const { data: booking, error: dbErr } = await supabase.from('booking_requests').insert({
      patient_id: user.id,
      clinic_id: practice === 'specific' && clinicId ? clinicId : null,
      specialty,
      practice_preference: practice,
      timing_preference: timing,
      preferred_days: preferredDays,
      preferred_time_of_day: preferredTime,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,
      status: 'pending_payment',
    }).select().single();

    if (dbErr) { setError(dbErr.message); setLoading(false); return; }

    // Create Stripe checkout session
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, email }),
    });
    const { url, error: stripeErr } = await res.json();
    if (stripeErr) { setError(stripeErr); setLoading(false); return; }
    window.location.href = url;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/directory" className="text-sm text-gray-500 hover:text-brand mb-4 block">← Back to directory</Link>
      <h1 className="text-2xl font-bold mb-1">Book a Cancellation Slot</h1>
      <p className="text-gray-500 mb-8">Join the queue. We'll match you with the first opening that fits.</p>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Step 1: Specialty */}
        <div className="card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
            Medical Specialty
          </h2>
          <select required className="input" value={specialty} onChange={e => setSpecialty(e.target.value)}>
            <option value="">— Choose a specialty —</option>
            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Step 2: Practice */}
        <div className="card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
            Choose a Practice
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="practice" value="any" checked={practice === 'any'} onChange={() => setPractice('any')} />
              <span>Any clinic / first available in my area</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="practice" value="specific" checked={practice === 'specific'} onChange={() => setPractice('specific')} />
              <span>A specific clinic or doctor</span>
            </label>
          </div>
          {practice === 'specific' && clinicName && (
            <div className="mt-3 px-3 py-2 bg-brand-light rounded-lg text-brand text-sm font-semibold">
              📍 {clinicName}
            </div>
          )}
        </div>

        {/* Step 3: Timing */}
        <div className="card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
            Timing Preference
          </h2>
          <div className="space-y-3">
            {[['first','First available — notify me as soon as any slot opens'],
              ['preferred','Preferred time — I have specific days/times in mind'],
              ['both','Both — preferred times first, then any available']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="timing" value={v} checked={timing === v} onChange={() => setTiming(v)} />
                <span>{l}</span>
              </label>
            ))}
          </div>
          {(timing === 'preferred' || timing === 'both') && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${preferredDays.includes(d) ? 'bg-brand text-white border-brand' : 'border-gray-300 hover:bg-gray-50'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Preferred Time of Day</label>
                <select className="input" value={preferredTime} onChange={e => setPreferredTime(e.target.value)}>
                  <option>Any time</option>
                  <option>Morning (8am – 12pm)</option>
                  <option>Afternoon (12pm – 5pm)</option>
                  <option>Evening (5pm – 8pm)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Contact */}
        <div className="card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
            Your Contact Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input required className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input required type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input required type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
            </div>
          </div>
        </div>

        {/* Step 5: Payment */}
        <div className="card p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
            Payment
          </h2>
          <div className="bg-brand-light border-2 border-brand rounded-xl p-4 mb-4">
            <div className="text-3xl font-extrabold text-brand">$19.99</div>
            <div className="text-sm text-gray-500 mt-1">
              One-time booking fee. Charged now. You'll be contacted when a matching slot opens.
            </div>
          </div>
          <p className="text-sm text-gray-500">You'll be redirected to Stripe's secure checkout to complete payment.</p>
        </div>

        <button type="submit" disabled={loading}
          className="btn btn-primary w-full py-4 text-base">
          {loading ? 'Redirecting to checkout…' : user ? 'Confirm & Pay $19.99 →' : 'Create Account to Continue →'}
        </button>
        <p className="text-center text-xs text-gray-400">🔒 Secure payment via Stripe · Your data is never shared without consent</p>
      </form>
      <footer className="text-center text-gray-400 text-sm mt-10">© 2026 SlotMD</footer>
    </div>
  );
}

export default function BookPage() {
  return <Suspense><BookForm /></Suspense>;
}
