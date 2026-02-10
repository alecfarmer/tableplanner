import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-sm shadow-teal/25 group-hover:shadow-md group-hover:shadow-teal/30 transition-shadow">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="font-serif text-lg font-bold text-navy">
            TablePlanner
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-500 hover:text-navy transition-colors font-medium">
            Features
          </a>
          <a href="#pricing" className="text-sm text-gray-500 hover:text-navy transition-colors font-medium">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-gray-500 hover:text-navy transition-colors font-medium">
            FAQ
          </a>
          <Link to="/auth" className="text-sm text-gray-500 hover:text-navy transition-colors font-medium">
            Sign In
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 bg-teal hover:bg-teal-dark text-white text-sm font-semibold py-2 px-5 rounded-xl transition-all shadow-sm shadow-teal/25 hover:shadow-md hover:shadow-teal/30 active:scale-[0.97]"
          >
            Start Planning
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-600 p-1 cursor-pointer"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-600 font-medium py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-600 font-medium py-2"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-600 font-medium py-2"
            >
              FAQ
            </a>
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-600 font-medium py-2"
            >
              Sign In
            </Link>
            <Link
              to="/app"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full text-center block mt-2"
            >
              Start Planning Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
