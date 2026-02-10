import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-coral hover:bg-coral-dark text-white font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer'
      : 'btn-primary';

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-coral" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-navy text-lg mb-1">{title}</h3>
              {message && (
                <p className="text-sm text-gray-500">{message}</p>
              )}
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 -mr-1 -mt-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onCancel} className="btn-secondary text-sm py-1.5 px-4">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`${confirmClass} text-sm py-1.5 px-4`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
