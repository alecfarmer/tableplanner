import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-white" fill="white" />
              </div>
              <span className="font-serif text-lg font-bold text-white">TablePlanner</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              The easiest way to plan seating charts for weddings, galas, corporate dinners, and any event.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/app" className="text-sm text-white/50 hover:text-teal transition-colors">
                  Open Planner
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm text-white/50 hover:text-teal transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-white/50 hover:text-teal transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="text-sm text-white/50 hover:text-teal transition-colors">
                  Live Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/auth" className="text-sm text-white/50 hover:text-teal transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/upgrade" className="text-sm text-white/50 hover:text-teal transition-colors">
                  Upgrade
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-sm text-white/50 hover:text-teal transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} TablePlanner. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Made with care for event planners everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
