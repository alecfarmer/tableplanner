import { UserPlus, LayoutGrid, MousePointerClick, Share2 } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Add Your Guest List',
    desc: 'Paste names in bulk, import a CSV, or add guests one by one with RSVPs, meals, and dietary needs.',
  },
  {
    num: '02',
    icon: LayoutGrid,
    title: 'Set Up Your Tables',
    desc: 'Choose round, rectangular, or sweetheart tables. Use auto-layout presets or drag them into your perfect floor plan.',
  },
  {
    num: '03',
    icon: MousePointerClick,
    title: 'Seat Your Guests',
    desc: 'Drag guests onto seats or let auto-seat do the work. Set rules to keep groups together or apart.',
  },
  {
    num: '04',
    icon: Share2,
    title: 'Share & Export',
    desc: 'Share a link, export a PDF, or use Find My Seat so each guest can look up their own table assignment.',
  },
];

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-surface to-white relative">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`text-center mb-16 animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-teal text-xs font-bold uppercase tracking-widest mb-3">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4 tracking-tight">
            From guest list to seating chart
            <br className="hidden sm:block" />
            in minutes, not hours
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent" />

          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index, isVisible }) {
  const Icon = step.icon;

  return (
    <div
      className={`text-center animate-fade-up ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${200 + index * 120}ms` }}
    >
      {/* Number + Icon */}
      <div className="relative inline-flex mb-5">
        <div className="w-14 h-14 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Icon size={24} className="text-teal" />
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-teal text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
          {step.num}
        </span>
      </div>
      <h3 className="font-semibold text-base text-navy mb-2">{step.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
    </div>
  );
}
