import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Heart } from 'lucide-react';

export default function PaymentSuccessPage() {
  useEffect(() => {
    document.title = 'Payment Successful — TablePlanner';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy mb-3">
          Payment successful!
        </h1>
        <p className="text-gray-500 mb-8">
          Your plan has been upgraded. All premium features are now unlocked.
          It may take a few moments for changes to reflect.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/events" className="btn-primary flex items-center gap-2">
            Go to Events
            <ArrowRight size={16} />
          </Link>
          <Link to="/app" className="btn-secondary flex items-center gap-2">
            Open Planner
          </Link>
        </div>
      </div>
    </div>
  );
}
