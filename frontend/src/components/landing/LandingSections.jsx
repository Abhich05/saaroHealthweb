import React from 'react';

// Pure presentational sections replicating TatvaCare layout but with Saaro copy / colours.
// No props required; tweak Tailwind classes only.

export const Hero = () => (
  <section className="w-full bg-gradient-to-br from-gray-50 to-purple-50 py-20 px-6 text-center">
    <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-800 mb-4 leading-tight ">AI-Powered</h1>
    <p className="text-2xl lg:text-4xl font-semibold text-purple-700  ">Healthcare Ecosystem</p>
  </section>
);

export const TrustSection = () => (
  <section className="py-12 bg-white text-center">
    <h2 className="text-xl font-semibold text-gray-700 mb-6">Trusted by</h2>
    {/* Placeholder logos grid */}
    <div className="flex flex-wrap items-center justify-center gap-8 opacity-75">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-32 h-8 bg-gray-200 rounded" />
      ))}
    </div>
  </section>
);

export const StatsGrid = () => {
  const stats = [
    '10 Lakh+ Patients Served',
    '15 Lakh+ AI Consultations',
    '12,000+ Doctors onboarded',
    '20+ Language support',
    '30+ Specialities',
    '300+ Cities Serviceable',
  ];
  return (
    <section className="py-16 bg-[#f7f7f7]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {stats.map((s) => (
          <div key={s} className="bg-white shadow rounded-lg p-6 text-center ">
            <p className="font-bold text-purple-700">{s}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const featureData = [
  {
    heading: 'An AI Platform that revolutionizes healthcare',
    sub: 'Transform Patient Care',
    bullets: [
      'AI Diagnostic Assistant in seconds',
      'Multi-specialty AI Modules',
      '24/7 Patient Engagement',
    ],
  },
  {
    heading: 'Empower your practice with Advanced AI',
    sub: 'AI-Powered Clinical Intelligence',
    bullets: [
      'Get AI insights within Seconds',
      'Advanced Diagnostic Accuracy',
      'Evidence-based Treatment Plans',
    ],
  },
  {
    heading: 'Scale your practice with Saaro',
    sub: 'Maximize Your Digital Presence',
    bullets: [
      'AI-powered practice optimization',
      'Smart patient acquisition tools',
      'Seamless appointment management',
    ],
  },
];

export const FeatureSections = () => (
  <>
    {featureData.map(({ heading, sub, bullets }, idx) => (
      <section
        key={heading}
        className={`py-16 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
      >
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              {heading}
            </h3>
            <p className="text-lg font-medium text-purple-700 mb-4">{sub}</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 h-64 bg-gray-200 rounded-lg" />
        </div>
      </section>
    ))}
  </>
);

export const Testimonials = () => (
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-center mb-10">What Doctors Say</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-gray-50 p-6 rounded-lg shadow text-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3" />
              <div>
                <p className="font-semibold">Dr. Example {i + 1}</p>
                <p className="text-xs text-gray-500">Speciality</p>
              </div>
            </div>
            <p className="italic">“Saaro’s AI tools have transformed my daily workflow and improved patient outcomes.”</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const FAQSection = () => {
  const faqs = [
    { q: "Why choose Saaro's AI platform?", a: 'Because it saves time and improves accuracy.' },
    { q: 'How does Saaro ensure data security?', a: 'We use end-to-end encryption and HIPAA-grade security.' },
    { q: 'What AI features are available?', a: 'Diagnostic assistant, clinical intelligence, patient engagement and more.' },
  ];
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        {faqs.map(({ q, a }) => (
          <details key={q} className="mb-4 bg-white p-4 rounded shadow">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="mt-2 text-gray-700 text-sm">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export const BottomCTA = () => (
  <section className="py-20 bg-purple-700 text-center text-white">
    <h2 className="text-3xl font-bold mb-4">Ready To Transform Healthcare with AI?</h2>
    <p className="mb-6">Join Saaro today and experience the future of medical practice</p>
    <button className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-full shadow hover:shadow-lg transition">
      Sign Up Free
    </button>
  </section>
);

export const LandingSections = () => (
  <>
    <Hero />
    <TrustSection />
    <StatsGrid />
    <FeatureSections />
    <Testimonials />
    <FAQSection />
    <BottomCTA />
  </>
);

export default LandingSections;
