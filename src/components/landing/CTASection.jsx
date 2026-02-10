import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6 bg-white">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto animate-fade-up ${isVisible ? 'visible' : ''}`}
      >
        <div className="relative bg-gradient-to-br from-navy via-navy to-navy-dark rounded-3xl px-8 sm:px-14 py-14 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to plan your perfect
              <br className="hidden sm:block" />
              seating arrangement?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
              Start free. No account needed. Your seating chart is just a few drags away.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-semibold text-[15px] py-3.5 px-8 rounded-2xl shadow-lg shadow-teal/30 hover:shadow-xl transition-all active:scale-[0.97]"
              >
                Start Planning Free
                <ArrowRight size={18} />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium text-[15px] py-3.5 px-4 transition-colors"
              >
                View pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
