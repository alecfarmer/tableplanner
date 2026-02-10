import { Link } from 'react-router-dom';
import { MapPin, Home, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin size={32} className="text-teal" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-navy mb-3">404</h1>
        <h2 className="font-serif text-xl font-semibold text-navy mb-3">
          Page not found
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like this seat isn't assigned yet. Let's get you back to the right table.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={16} />
            Home
          </Link>
          <Link to="/app" className="btn-secondary flex items-center gap-2">
            Open Planner
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
