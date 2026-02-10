import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const stats = [
  { value: '50,000+', label: 'Guests seated' },
  { value: '2,000+', label: 'Events planned' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '<2 min', label: 'To create a chart' },
];

export default function StatsBar() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-14 px-6 bg-surface border-y border-gray-100">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-up ${isVisible ? 'visible' : ''}`}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-navy mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
