import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const faqs = [
  {
    q: 'Is TablePlanner really free?',
    a: 'Yes! The free tier lets you plan one event with up to 50 guests and 8 tables — no account or credit card required. Everything saves in your browser. Upgrade to Pro or Business when you need more.',
  },
  {
    q: 'What happens to my data?',
    a: 'On the free tier, your data stays in your browser\'s local storage. When you create an account, everything syncs to the cloud so you can access it from any device. We never share or sell your data.',
  },
  {
    q: 'Can I share my seating chart with others?',
    a: 'Absolutely. Generate a shareable link so co-planners can view your arrangement. Pro plans also include "Find My Seat" — a public page where individual guests can look up their own table.',
  },
  {
    q: 'Does it work on phones and tablets?',
    a: 'Yes. The planner is fully responsive with touch-friendly drag and drop. It works great on iPads and phones for on-the-go adjustments.',
  },
  {
    q: 'Can I import my existing guest list?',
    a: 'You can import from CSV, bulk paste names, or add guests one by one. Each guest can have RSVP status, meal choice, dietary needs, and group assignments.',
  },
  {
    q: 'What table shapes are supported?',
    a: 'Round tables (2–20 seats), rectangular tables, and a special sweetheart/head table. Each can be freely positioned, rotated, and customized on the canvas.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, cancel anytime from your account settings. You\'ll keep access until the end of your billing period. No cancellation fees or hidden charges.',
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-medium text-navy group-hover:text-teal transition-colors pr-6">
          {faq.q}
        </span>
        <div className={`w-7 h-7 rounded-full ${open ? 'bg-teal/10' : 'bg-gray-100'} flex items-center justify-center shrink-0 transition-colors`}>
          <ChevronDown
            size={16}
            className={`${open ? 'text-teal' : 'text-gray-400'} transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '200px' : '0', opacity: open ? 1 : 0 }}
      >
        <p className="text-gray-500 text-sm leading-relaxed pb-5 pr-12">
          {faq.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="faq" className="py-24 px-6 bg-gradient-to-b from-white to-surface">
      <div className="max-w-2xl mx-auto">
        <div ref={ref} className={`text-center mb-12 animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-teal text-xs font-bold uppercase tracking-widest mb-3">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4 tracking-tight">
            Got questions?
          </h2>
          <p className="text-gray-500">
            Everything you need to know about TablePlanner.
          </p>
        </div>

        <div
          className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-6 sm:px-8 animate-fade-up ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '150ms' }}
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
