import { useState } from 'react';
import { Save, Trash2, Upload, Clock, X } from 'lucide-react';

export default function VersionManager({ versions, onSave, onLoad, onDelete, onClose }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-wine flex items-center gap-2">
            <Clock size={18} />
            Saved Versions
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Save new */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Version name (e.g. 'After RSVPs')"
            className="input-field flex-1"
          />
          <button onClick={handleSave} disabled={!name.trim()} className="btn-primary flex items-center gap-1 text-sm disabled:opacity-50">
            <Save size={14} />
            Save
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {versions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No saved versions yet. Save your current layout to create a checkpoint.
            </p>
          )}

          {versions.map((v) => (
            <div key={v.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{v.name}</p>
                <p className="text-[10px] text-gray-500">
                  {new Date(v.savedAt).toLocaleString()} &middot;{' '}
                  {v.state.guests?.length || 0} guests, {v.state.tables?.length || 0} tables
                </p>
              </div>
              <button
                onClick={() => onLoad(v)}
                className="text-sage hover:text-sage-dark cursor-pointer p-1"
                title="Load this version"
              >
                <Upload size={14} />
              </button>
              <button
                onClick={() => onDelete(v.id)}
                className="text-gray-400 hover:text-red-500 cursor-pointer p-1"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
