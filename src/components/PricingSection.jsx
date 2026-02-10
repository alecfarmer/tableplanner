import { useState } from 'react';
import { Check, X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    tier: 'free',
    name: 'Free',
    subscriptionMonthly: 0,
    subscriptionYearly: 0,
    perEvent: 0,
    tagline: 'Perfect for trying it out',
    features: [
      { name: '1 seating chart', included: true },
      { name: 'Up to 50 guests', included: true },
      { name: '8 tables max', included: true },
      { name: 'Round tables', included: true },
      { name: 'Basic auto-seat', included: true },
      { name: 'Dark mode', included: true },
      { name: 'All table shapes', included: false },
      { name: 'AI table names', included: false },
      { name: 'CSV import & PDF export', included: false },
      { name: 'Seating rules', included: false },
    ],
    cta: 'Start Free',
    ctaLink: '/app',
    highlight: false,
  },
  {
    tier: 'pro',
    name: 'Pro',
    subscriptionMonthly: 12,
    subscriptionYearly: 79,
    perEvent: 19,
    tagline: 'For individuals planning events',
    badge: 'Most Popular',
    features: [
      { name: 'Up to 500 guests', included: true },
      { name: 'Unlimited tables', included: true },
      { name: 'All table shapes', included: true },
      { name: 'Full auto-seat & balance', included: true },
      { name: 'AI table names', included: true },
      { name: 'CSV import & PDF export', included: true },
      { name: 'Seating rules', included: true },
      { name: 'Share links', included: true },
      { name: 'Find My Seat page', included: true },
    ],
    cta: 'Get Pro',
    ctaLink: '/upgrade',
    highlight: true,
  },
  {
    tier: 'business',
    name: 'Business',
    subscriptionMonthly: 29,
    subscriptionYearly: 199,
    perEvent: 39,
    tagline: 'For professional event planners',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Unlimited guests', included: true },
      { name: 'Custom branding on exports', included: true },
      { name: 'QR codes for Find My Seat', included: true },
      { name: 'Saved versions (unlimited)', included: true },
      { name: 'Priority support', included: true },
      { name: 'Team members', included: true, coming: true },
      { name: 'Real-time collaboration', included: true, coming: true },
    ],
    cta: 'Get Business',
    ctaLink: '/upgrade',
    highlight: false,
  },
];

const billingOptions = [
  { id: 'per-event', label: 'Per Event' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function PricingSection({ embedded = false }) {
  const [billing, setBilling] = useState('yearly');

  return (
    <div className={embedded ? '' : 'max-w-5xl mx-auto'}>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-1 mb-10">
        <div className="bg-gray-100 rounded-2xl p-1 flex items-center">
          {billingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setBilling(opt.id)}
              className={`text-sm px-4 sm:px-5 py-2.5 rounded-xl font-medium cursor-pointer transition-all flex items-center gap-2 ${
                billing === opt.id
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
              {opt.id === 'yearly' && (
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                  SAVE 30%+
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.tier} plan={plan} billing={billing} />
        ))}
      </div>

      {/* Trust note */}
      <p className="text-center text-xs text-gray-400 mt-8">
        {billing === 'per-event'
          ? 'One-time payment per event. No recurring charges. Free plan needs no credit card.'
          : 'No credit card required for Free plan. Cancel Pro or Business anytime.'}
      </p>
    </div>
  );
}

function PlanCard({ plan, billing }) {
  const getPrice = () => {
    if (billing === 'per-event') return plan.perEvent;
    if (billing === 'yearly') return plan.subscriptionYearly;
    return plan.subscriptionMonthly;
  };

  const price = getPrice();
  const perMonth =
    billing === 'yearly' && plan.subscriptionYearly > 0
      ? Math.round(plan.subscriptionYearly / 12)
      : null;

  // Per-event features differ slightly
  const perEventNote =
    billing === 'per-event' && plan.tier === 'pro'
      ? 'Unlocks 1 event'
      : billing === 'per-event' && plan.tier === 'business'
        ? 'Unlocks 1 event'
        : null;

  // Subscription note for paid tiers
  const subNote =
    billing !== 'per-event' && billing !== 'yearly' && plan.tier !== 'free'
      ? 'Unlimited events while subscribed'
      : billing === 'yearly' && plan.tier !== 'free'
        ? 'Unlimited events while subscribed'
        : null;

  return (
    <div
      className={`rounded-2xl p-6 flex flex-col relative transition-all ${
        plan.highlight
          ? 'bg-white border-2 border-teal shadow-xl shadow-teal/10 scale-[1.02]'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal to-teal-dark text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-lg shadow-teal/25">
          {plan.badge}
        </span>
      )}

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          {plan.tier !== 'free' && <Crown size={16} className="text-amber" />}
          <h3 className="font-semibold text-lg text-navy">{plan.name}</h3>
        </div>
        <p className="text-xs text-gray-400">{plan.tagline}</p>
      </div>

      {/* Price display */}
      <div className="mb-6">
        {price === 0 ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-navy">$0</span>
            <span className="text-sm text-gray-400">forever</span>
          </div>
        ) : billing === 'per-event' ? (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-navy">${price}</span>
              <span className="text-sm text-gray-400">/event</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              One-time payment &middot; no subscription
            </p>
          </div>
        ) : billing === 'yearly' ? (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-navy">${perMonth}</span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              ${price}/year &middot; billed annually
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-navy">${price}</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>
          </div>
        )}
      </div>

      {/* Scope note */}
      {(perEventNote || subNote) && (
        <p className="text-[11px] font-medium text-teal bg-teal/5 rounded-lg px-3 py-1.5 mb-4 text-center">
          {perEventNote || subNote}
        </p>
      )}

      <ul className="space-y-3 flex-1 mb-6">
        {plan.features.map((f) => (
          <li key={f.name} className="flex items-start gap-2.5 text-sm">
            {f.included ? (
              <Check size={15} className="text-teal shrink-0 mt-0.5" strokeWidth={2.5} />
            ) : (
              <X size={15} className="text-gray-300 shrink-0 mt-0.5" />
            )}
            <span className={`${f.included ? 'text-gray-700' : 'text-gray-400'} leading-snug`}>
              {f.name}
              {f.coming && (
                <span className="text-[9px] font-semibold text-amber bg-amber/10 px-1.5 py-0.5 rounded-full ml-1.5">
                  SOON
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to={plan.ctaLink}
        className={`text-center py-3 px-4 rounded-xl font-semibold text-sm transition-all block ${
          plan.highlight
            ? 'bg-teal hover:bg-teal-dark text-white shadow-md shadow-teal/20 hover:shadow-lg'
            : plan.tier === 'free'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-navy/5 text-navy hover:bg-navy/10'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
