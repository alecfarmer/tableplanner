import { Link } from 'react-router-dom';
import { Crown, ArrowRight, X } from 'lucide-react';

export default function UpgradePrompt({
  feature,
  message,
  onClose,
  inline = false,
}) {
  if (inline) {
    return (
      <div className="bg-amber/5 border border-amber/20 rounded-xl p-3 flex items-center gap-3">
        <Crown size={16} className="text-amber shrink-0" />
        <p className="text-xs text-gray-600 flex-1">
          {message || `Upgrade to unlock ${feature}.`}
        </p>
        <Link
          to="/upgrade"
          className="text-xs font-semibold text-amber-dark hover:text-amber whitespace-nowrap flex items-center gap-1"
        >
          Upgrade
          <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="w-14 h-14 bg-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown size={28} className="text-amber" />
          </div>
          <h2 className="font-serif text-xl font-bold text-navy mb-2">
            Upgrade to unlock
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {message || `The ${feature} feature is available on Plus and Pro plans.`}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/upgrade" className="btn-gold flex items-center justify-center gap-2">
              <Crown size={16} />
              View Plans
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer py-2"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
