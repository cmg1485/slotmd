import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand to-teal text-white text-center py-24 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Skip the Wait.<br />Get the First Cancellation.
        </h1>
        <p className="text-xl max-w-xl mx-auto mb-8 opacity-90">
          Instead of waiting weeks for an open slot, SlotMD matches you with the first clinic cancellation that fits your schedule.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/directory" className="btn bg-white text-brand hover:bg-gray-100 text-base px-7 py-3">
            Find a Clinic →
          </Link>
          <a href="#how" className="btn border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 text-base px-7 py-3">
            How It Works
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">Four simple steps to get seen sooner.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n: 1, title: 'Choose a Clinic', body: 'Browse our directory and pick the clinic or specialist you want to see.' },
              { n: 2, title: 'Set Your Preferences', body: 'Tell us your specialty, preferred times, and whether any clinic works.' },
              { n: 3, title: 'Pay a Small Fee', body: 'A one-time $19.99 fee puts you in the cancellation queue.' },
              { n: 4, title: 'Get Notified', body: 'When a matching slot opens, the clinic contacts you to confirm.' },
            ].map(s => (
              <div key={s.n} className="text-center bg-gray-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.n}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Why SlotMD?</h2>
          <p className="text-center text-gray-500 mb-12">Better for patients. Better for clinics.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'See a Doctor Sooner', body: 'Get matched with the first open slot — no more waiting weeks.' },
              { icon: '🎯', title: 'Flexible Scheduling', body: 'Choose any first available, or set preferred days and times.' },
              { icon: '🏥', title: '200+ Clinics', body: 'A growing network of participating clinics and specialists.' },
              { icon: '🔒', title: 'Simple & Secure', body: 'One flat fee. Secure Stripe payment. No hidden costs.' },
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

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-brand-light to-cyan-50 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to get seen sooner?</h2>
          <p className="text-gray-500 mb-8">Browse our network of participating clinics and book your cancellation slot today.</p>
          <Link href="/directory" className="btn btn-primary text-base px-8 py-3">
            Browse Clinics →
          </Link>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 text-center py-8 text-sm">
        <p>© 2026 SlotMD · <Link href="/for-clinics" className="hover:text-white">For Clinics</Link> · <a href="#" className="hover:text-white">Privacy</a> · <a href="#" className="hover:text-white">Terms</a></p>
      </footer>
    </div>
  );
}
