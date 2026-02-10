import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/40" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-teal/[0.04] via-transparent to-transparent rounded-full" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-coral/[0.03] via-transparent to-transparent rounded-full" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal/[0.07] border border-teal/10 text-teal-dark px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7 backdrop-blur-sm">
              <Sparkles size={13} />
              Free to start. No sign-up required.
            </div>

            <h1 className="font-display text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold text-navy leading-[1.1] mb-6 tracking-tight">
              The seating chart
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-teal-dark to-teal">
                your event deserves
              </span>
            </h1>

            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-md">
              Drag-and-drop seating charts that make planning weddings, galas,
              corporate dinners, and holiday parties actually enjoyable.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold text-[15px] py-3.5 px-7 rounded-2xl shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/30 transition-all active:scale-[0.97]"
              >
                Start Planning Free
                <ArrowRight size={18} />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-teal font-medium text-[15px] py-3.5 px-4 transition-colors"
              >
                See it in action
                <span className="text-xs">&#8595;</span>
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber fill-amber" />
                ))}
                <span className="text-gray-500 ml-1.5 font-medium">4.9/5</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-gray-400">Trusted by <strong className="text-gray-600">2,000+</strong> event planners</span>
            </div>
          </div>

          {/* Right — Product Preview */}
          <div className="relative lg:ml-auto">
            {/* Browser window mockup */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-navy/10 border border-gray-200/80 overflow-hidden max-w-lg mx-auto lg:max-w-none">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 text-center border border-gray-100">
                  tableplanner.app/app
                </div>
              </div>

              {/* App preview */}
              <div className="p-4 bg-surface/50">
                <div className="flex gap-3">
                  {/* Mini sidebar */}
                  <div className="w-36 shrink-0 space-y-2">
                    <div className="bg-white rounded-lg border border-gray-100 p-2.5">
                      <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Guest List</p>
                      {['Emma Wilson', 'James Chen', 'Sofia Martinez', 'Liam Patel'].map((name, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1.5 mb-1 last:mb-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal/40" />
                          <span className="text-[9px] text-gray-600 truncate">{name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-2.5">
                      <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Stats</p>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="bg-teal/5 rounded-md px-1.5 py-1 text-center">
                          <p className="text-[10px] font-bold text-teal">24</p>
                          <p className="text-[7px] text-gray-400">Seated</p>
                        </div>
                        <div className="bg-amber/5 rounded-md px-1.5 py-1 text-center">
                          <p className="text-[10px] font-bold text-amber-dark">4</p>
                          <p className="text-[7px] text-gray-400">Left</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini canvas */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-100 p-3 relative min-h-[220px]">
                    {/* Table 1 */}
                    <div className="absolute" style={{ top: '15px', left: '25px' }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="22" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1" opacity="0.8" />
                        <text x="40" y="38" textAnchor="middle" className="text-[7px] font-bold fill-navy">Rose</text>
                        <text x="40" y="47" textAnchor="middle" className="text-[6px] fill-gray-400">6/8</text>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                          const angle = (2 * Math.PI * i / 8) - Math.PI / 2;
                          const x = 40 + 34 * Math.cos(angle);
                          const y = 40 + 34 * Math.sin(angle);
                          const filled = i < 6;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="7"
                              fill={filled ? '#0d9488' : 'white'}
                              stroke={filled ? '#0d9488' : '#d1d5db'}
                              strokeWidth="1"
                              strokeDasharray={filled ? '' : '2 2'}
                            />
                          );
                        })}
                      </svg>
                    </div>

                    {/* Table 2 */}
                    <div className="absolute" style={{ top: '15px', right: '20px' }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="22" fill="#fff7ed" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
                        <text x="40" y="38" textAnchor="middle" className="text-[7px] font-bold fill-navy">Lily</text>
                        <text x="40" y="47" textAnchor="middle" className="text-[6px] fill-gray-400">8/8</text>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                          const angle = (2 * Math.PI * i / 8) - Math.PI / 2;
                          const x = 40 + 34 * Math.cos(angle);
                          const y = 40 + 34 * Math.sin(angle);
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="7"
                              fill="#0d9488"
                              stroke="#0d9488"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </svg>
                    </div>

                    {/* Table 3 */}
                    <div className="absolute" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="22" fill="#fef2f2" stroke="#f97066" strokeWidth="1" opacity="0.5" />
                        <text x="40" y="38" textAnchor="middle" className="text-[7px] font-bold fill-navy">Dahlia</text>
                        <text x="40" y="47" textAnchor="middle" className="text-[6px] fill-gray-400">5/6</text>
                        {[0, 1, 2, 3, 4, 5].map(i => {
                          const angle = (2 * Math.PI * i / 6) - Math.PI / 2;
                          const x = 40 + 34 * Math.cos(angle);
                          const y = 40 + 34 * Math.sin(angle);
                          const filled = i < 5;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="7"
                              fill={filled ? '#0d9488' : 'white'}
                              stroke={filled ? '#0d9488' : '#d1d5db'}
                              strokeWidth="1"
                              strokeDasharray={filled ? '' : '2 2'}
                            />
                          );
                        })}
                      </svg>
                    </div>

                    {/* Floating tooltip */}
                    <div className="absolute top-[85px] left-[95px] bg-navy text-white text-[8px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                      Emma Wilson &rarr; Rose, Seat 3
                    </div>
                  </div>
                </div>

                {/* Toolbar preview */}
                <div className="mt-2 bg-white rounded-lg border border-gray-100 px-3 py-1.5 flex items-center justify-center gap-3">
                  {['+ Round', '+ Rect', 'Auto-Seat', 'AI Names', 'Share'].map((label, i) => (
                    <span key={label} className={`text-[8px] px-2 py-0.5 rounded-md ${i === 3 ? 'bg-amber/10 text-amber-dark font-semibold' : 'text-gray-400 bg-gray-50'}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 animate-float">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs">&#10003;</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-navy">Auto-saved</p>
                <p className="text-[8px] text-gray-400">Just now</p>
              </div>
            </div>
            <div className="absolute -bottom-2 -left-3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 animate-float-delayed">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber" />
                <p className="text-[10px] font-semibold text-navy">AI Named 8 tables</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
