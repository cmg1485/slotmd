import Link from 'next/link';

export default function ForClinicsPage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-success to-teal text-white text-center py-24 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Fill Every Cancellation.<br />Automatically.
        </h1>
        <p className="text-xl max-w-xl mx-auto mb-8 opacity-92">
          SlotMD connects your clinic with pre-qualified patients waiting for exactly your type of appointment — so no slot ever goes to waste.
        </p>
        <Link href="/auth/register" className="btn bg-white text-success hover:bg-gray-100 text-base px-8 py-3">
          Get Started for Free →
        </Link>
      </section>

      {/* BENEFITS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Why Partner with SlotMD?</h2>
          <p className="text-center text-gray-500 mb-12">More revenue. Less admin. Happier patients.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📅', title: 'Zero Empty Slots', body: 'Cancellations are immediately filled from a pool of waiting, fee-paying patients — so your schedule stays full.' },
              { icon: '💰', title: 'No Cost to Join', body: 'Listing your clinic on SlotMD is completely free. The $19.99 fee is paid by patients, not by you.' },
              { icon: '🎯', title: 'Pre-Matched Patients', body: 'Patients are filtered by specialty, location, and availability before they reach you — reducing friction.' },
              { icon: '⚙️', title: 'Simple Dashboard', body: 'Review requests, select a time, and confirm — all in one easy-to-use portal.' },
              { icon: '⭐', title: 'Better Patient Experience', body: 'Patients who wait less are more satisfied. Improve your reviews while helping those who need care sooner.' },
              { icon: '📈', title: 'Grow Your Practice', body: 'Reach new patients and turn cancellations into lasting relationships.' },
            ].map(c => (
              <div key={c.title} className="card p-6">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold mb-1">{c.title}</h3>
                <p className="text-gray-500 text-sm">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">How It Works for Your Clinic</h2>
          <p className="text-center text-gray-500 mb-12">Four simple steps.</p>
          <div className="space-y-6">
            {[
              { n: 1, title: 'List Your Clinic for Free', body: 'Add your clinic, doctors, and specialties to the SlotMD directory. It takes less than 10 minutes.' },
              { n: 2, title: 'Receive Patient Requests', body: "When a patient is matched to your clinic, you'll see their request in your dashboard — specialty, preferred times, and contact info." },
              { n: 3, title: 'Confirm a Time', body: 'Review the request, select an available slot, and confirm. The patient is automatically notified.' },
              { n: 4, title: 'See the Patient', body: 'The patient shows up ready for their appointment. No empty slots, no last-minute scrambling.' },
            ].map(s => (
              <div key={s.n} className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-success text-white rounded-full flex items-center justify-center font-bold shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-2">Simple Pricing</h2>
          <p className="text-gray-500 mb-8">Free to list. You keep 100% of your appointment revenue.</p>
          <div className="bg-gradient-to-br from-brand-light to-cyan-50 rounded-2xl p-10 border border-brand/20">
            <div className="text-5xl font-extrabold text-brand">$0</div>
            <div className="text-gray-500 mt-1 mb-4">per month for clinics</div>
            <p className="text-gray-600 text-sm mb-6">
              SlotMD charges patients the $19.99 booking fee — your clinic pays nothing. We earn only when patients are successfully matched.
            </p>
            <Link href="/auth/register" className="btn btn-green px-8 py-3 text-base">
              Register Your Clinic →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-brand text-white text-center py-16 px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to stop leaving slots empty?</h2>
        <Link href="/auth/register" className="btn bg-white text-brand hover:bg-gray-100 text-base px-8 py-3">
          Create Your Free Clinic Account →
        </Link>
      </div>

      <footer className="bg-gray-800 text-gray-400 text-center py-8 text-sm">
        <p>© 2026 SlotMD · <Link href="/" className="hover:text-white">For Patients</Link> · <a href="#" className="hover:text-white">Privacy</a></p>
      </footer>
    </div>
  );
}
