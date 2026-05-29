'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const SPECIALTIES = ['Cardiology','Dermatology','Endocrinology','Family Medicine',
  'Gastroenterology','Neurology','OB/GYN','Oncology','Ophthalmology','Orthopedics',
  'Pediatrics','Psychiatry','Pulmonology','Rheumatology','Urology'];

export default function ClinicSetupPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([{ name: '', specialty: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingClinicId, setExistingClinicId] = useState(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      const { data: clinic } = await supabase.from('clinics').select('*, doctors(*)').eq('owner_id', user.id).single();
      if (clinic) {
        setExistingClinicId(clinic.id);
        setName(clinic.name || ''); setAddress(clinic.address || '');
        setCity(clinic.city || ''); setState(clinic.state || '');
        setZip(clinic.zip || ''); setPhone(clinic.phone || '');
        setWebsite(clinic.website || ''); setDescription(clinic.description || '');
        setSpecialties(clinic.specialties || []);
        if (clinic.doctors?.length) setDoctors(clinic.doctors.map(d => ({ name: d.name, specialty: d.specialty || '' })));
      }
    });
  }, []);

  function toggleSpecialty(s) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function updateDoctor(i, field, val) {
    setDoctors(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const clinicData = { owner_id: user.id, name, address, city, state, zip, phone, website, description, specialties };
    let clinicId = existingClinicId;

    if (existingClinicId) {
      await supabase.from('clinics').update(clinicData).eq('id', existingClinicId);
    } else {
      const { data, error: err } = await supabase.from('clinics').insert(clinicData).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      clinicId = data.id;
    }

    // Sync doctors
    await supabase.from('doctors').delete().eq('clinic_id', clinicId);
    const validDocs = doctors.filter(d => d.name.trim());
    if (validDocs.length) {
      await supabase.from('doctors').insert(validDocs.map(d => ({ clinic_id: clinicId, name: d.name.trim(), specialty: d.specialty })));
    }

    router.push('/clinic/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">{existingClinicId ? 'Edit Clinic Profile' : 'Set Up Your Clinic'}</h1>
      <p className="text-gray-500 mb-8">This information will appear in the patient-facing directory.</p>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-bold">Clinic Information</h2>
          <div><label className="block text-sm font-semibold mb-1">Clinic Name *</label>
            <input required className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Green Valley Medical Center" /></div>
          <div><label className="block text-sm font-semibold mb-1">Address</label>
            <input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-semibold mb-1">City</label>
              <input className="input" value={city} onChange={e => setCity(e.target.value)} /></div>
            <div><label className="block text-sm font-semibold mb-1">State</label>
              <input className="input" maxLength={2} value={state} onChange={e => setState(e.target.value)} /></div>
            <div><label className="block text-sm font-semibold mb-1">ZIP</label>
              <input className="input" value={zip} onChange={e => setZip(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold mb-1">Phone</label>
              <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><label className="block text-sm font-semibold mb-1">Website</label>
              <input className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://…" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Description (optional)</label>
            <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of your practice…" /></div>
        </div>

        {/* Specialties */}
        <div className="card p-5">
          <h2 className="font-bold mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${specialties.includes(s) ? 'bg-brand text-white border-brand' : 'border-gray-300 hover:border-brand hover:text-brand'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors */}
        <div className="card p-5">
          <h2 className="font-bold mb-3">Doctors / Providers</h2>
          <div className="space-y-3">
            {doctors.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" placeholder="Dr. Jane Smith" value={d.name} onChange={e => updateDoctor(i, 'name', e.target.value)} />
                <select className="input w-44" value={d.specialty} onChange={e => updateDoctor(i, 'specialty', e.target.value)}>
                  <option value="">Specialty</option>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
                {doctors.length > 1 && (
                  <button type="button" onClick={() => setDoctors(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setDoctors(prev => [...prev, { name: '', specialty: '' }])}
            className="mt-3 text-sm text-brand hover:underline">+ Add another doctor</button>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base">
          {loading ? 'Saving…' : existingClinicId ? 'Save Changes' : 'Create Clinic Profile'}
        </button>
      </form>
    </div>
  );
}
