import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import PricingCards from '../PricingSection';

export default function PricingSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-white to-surface">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`text-center mb-12 animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-teal text-xs font-bold uppercase tracking-widest mb-3">
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more guests, tables, or premium features.
          </p>
        </div>

        <div className={`animate-fade-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
          <PricingCards embedded />
        </div>
      </div>
    </section>
  );
}
