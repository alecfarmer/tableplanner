import {
  MousePointerClick,
  Zap,
  Users,
  ClipboardCheck,
  Share2,
  Moon,
  Wand2,
  LayoutGrid,
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const features = [
  {
    icon: MousePointerClick,
    title: 'Drag & Drop Seating',
    desc: 'Intuitively drag guests from your list onto any seat. Swap, rearrange, and reassign with a simple gesture.',
    gradient: 'from-teal/10 to-teal/5',
    iconBg: 'bg-teal/10',
    iconColor: 'text-teal',
  },
  {
    icon: Zap,
    title: 'Smart Auto-Seat',
    desc: 'One click to intelligently fill every table. Keeps groups together and balances table sizes automatically.',
    gradient: 'from-amber/10 to-amber/5',
    iconBg: 'bg-amber/10',
    iconColor: 'text-amber-dark',
  },
  {
    icon: Users,
    title: 'Groups & Seating Rules',
    desc: 'Create guest groups and set rules — keep families together, separate exes, and see conflicts instantly.',
    gradient: 'from-coral/10 to-coral/5',
    iconBg: 'bg-coral/10',
    iconColor: 'text-coral',
  },
  {
    icon: LayoutGrid,
    title: 'Multiple Table Shapes',
    desc: 'Round, rectangular, and sweetheart tables with custom seat counts. Arrange your perfect floor plan.',
    gradient: 'from-blue-100 to-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: ClipboardCheck,
    title: 'RSVP & Meal Tracking',
    desc: 'Track RSVPs, meal choices, dietary restrictions, and plus-ones. Full guest management in one place.',
    gradient: 'from-green-100 to-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Wand2,
    title: 'AI Table Names',
    desc: 'Let AI generate beautiful, themed table names for your event — flowers, cities, constellations, and more.',
    gradient: 'from-purple-100 to-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Share2,
    title: 'Export & Share',
    desc: 'Share via link, export to PDF, print place cards, or use Find My Seat so guests can look up their own table.',
    gradient: 'from-sky-100 to-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    desc: 'Beautiful dark theme for late-night planning sessions. Easy on the eyes in any lighting condition.',
    gradient: 'from-navy/10 to-navy/5',
    iconBg: 'bg-navy/10',
    iconColor: 'text-navy',
  },
];

export default function FeaturesGrid() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-teal/[0.02] to-transparent rounded-full -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative">
        <div ref={ref} className={`text-center mb-16 animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-teal text-xs font-bold uppercase tracking-widest mb-3">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-navy mb-5 tracking-tight">
            Everything you need to plan
            <br className="hidden sm:block" />
            the perfect seating arrangement
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Powerful features wrapped in a simple, beautiful interface.
            No learning curve required.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-stagger ${isVisible ? 'visible' : ''}`}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group bg-gradient-to-br ${feature.gradient} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200/50`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-[15px] text-navy mb-1.5">{feature.title}</h3>
                <p className="text-gray-500 text-[13px] leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
