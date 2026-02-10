import { Star } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const testimonials = [
  {
    name: 'Rachel Nguyen',
    role: 'Bride, 2025',
    quote: 'I planned seating for 180 guests in one evening. The drag-and-drop is so intuitive, and auto-seat saved me hours of rearranging.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Corporate Event Manager',
    quote: 'We use TablePlanner for all our company events now. The group rules feature is a game-changer — no more accidentally seating rivals together.',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Wedding Planner',
    quote: 'My clients love the Find My Seat feature. I send them a link and they can look up their own table. So much better than printed charts.',
    rating: 5,
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-14 animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-teal text-xs font-bold uppercase tracking-widest mb-3">
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            Loved by event planners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="text-amber fill-amber" />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal/20 to-teal/10 flex items-center justify-center">
                  <span className="text-teal text-xs font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
