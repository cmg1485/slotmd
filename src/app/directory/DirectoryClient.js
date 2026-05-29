'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const PAGE_SIZE = 20;

export default function DirectoryClient({ clinics }) {
  const [clinicQ, setClinicQ] = useState('');
  const [doctorQ, setDoctorQ] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const cq = clinicQ.toLowerCase();
    const dq = doctorQ.toLowerCase();
    return clinics.filter(c => {
      const matchClinic = !cq || c.name.toLowerCase().includes(cq);
      const matchDoctor = !dq || (c.doctors || []).some(d => d.name.toLowerCase().includes(dq));
      return matchClinic && matchDoctor;
    });
  }, [clinics, clinicQ, doctorQ]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(setter) {
    return e => { setter(e.target.value); setPage(1); };
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Clinic Directory</h1>
          <p className="text-gray-500 mb-4">Search by clinic name or doctor, then book a cancellation slot.</p>
          <div className="flex gap-3 flex-wrap">
            <input className="input flex-1 min-w-48" placeholder="Search by clinic name…"
              value={clinicQ} onChange={handleSearch(setClinicQ)} />
            <input className="input flex-1 min-w-48" placeholder="Search by doctor name…"
              value={doctorQ} onChange={handleSearch(setDoctorQ)} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clinics
        </p>

        {slice.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No clinics found matching your search.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slice.map(c => (
              <div key={c.id} className="card p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
                <div className="font-bold text-brand">{c.name}</div>
                {c.doctors?.length > 0 && (
                  <div className="text-sm text-gray-500">{c.doctors.map(d => d.name).join(' · ')}</div>
                )}
                <div className="text-sm text-gray-700">
                  📍 {[c.address, c.city, c.state, c.zip].filter(Boolean).join(', ')}
                </div>
                {c.phone && <div className="text-sm text-gray-700">📞 {c.phone}</div>}
                {c.specialties?.length > 0 && (
                  <div className="text-xs text-gray-500">{c.specialties.join(', ')}</div>
                )}
                <Link href={`/book?clinicId=${c.id}&clinicName=${encodeURIComponent(c.name)}`}
                  className="btn btn-primary btn-sm mt-1 self-start">
                  Book Cancellation Slot
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex gap-2 justify-center mt-8 flex-wrap">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${p === page ? 'bg-brand text-white border-brand' : 'border-gray-300 hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-gray-400 text-center py-8 text-sm mt-8">
        <p>© 2026 SlotMD</p>
      </footer>
    </div>
  );
}
