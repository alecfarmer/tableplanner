import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import PricingSection from '../components/PricingSection';

export default function UpgradePage() {
  useEffect(() => {
    document.title = 'Upgrade — TablePlanner';
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart size={18} className="text-teal" fill="#0d9488" />
            <span className="font-serif text-lg font-bold text-navy">TablePlanner</span>
          </Link>
          <Link to="/events" className="text-sm text-gray-500 hover:text-teal flex items-center gap-1">
            <ArrowLeft size={14} />
            Back to events
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-navy mb-3">
            Choose your plan
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Pay per event or subscribe monthly. Upgrade anytime, downgrade anytime.
          </p>
        </div>

        <PricingSection embedded />
      </div>
    </div>
  );
}
