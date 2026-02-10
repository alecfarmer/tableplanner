import { useState } from 'react';
import { Sparkles, X, Loader2, RefreshCw } from 'lucide-react';
import { generateTableNames } from '../utils/aiTableNames';
import toast from 'react-hot-toast';

const THEME_SUGGESTIONS = [
  'Flowers', 'Wine regions', 'Love songs', 'Gemstones',
  'Constellations', 'Paris landmarks', 'Shakespeare plays', 'Dance styles',
];

export default function TableNameGenerator({ tables, onUpdateTable, onClose, savedTheme, onSaveTheme }) {
  const [theme, setTheme] = useState(savedTheme || '');
  const [loading, setLoading] = useState(false);
  const [previewNames, setPreviewNames] = useState(null);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Enter a theme first');
      return;
    }

    setLoading(true);
    setPreviewNames(null);

    try {
      const names = await generateTableNames(theme.trim(), tables.length);
      setPreviewNames(names);
      toast.success(`Generated ${names.length} table names`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate names');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewNames) return;
    for (let i = 0; i < Math.min(previewNames.length, tables.length); i++) {
      onUpdateTable(tables[i].id, { label: previewNames[i] });
    }
    onSaveTheme(theme.trim());
    toast.success('Table names applied — new tables will auto-name');
    setPreviewNames(null);
    onClose();
  };

  const handleClearTheme = () => {
    onSaveTheme('');
    toast.success('Auto-naming disabled');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-navy flex items-center gap-2">
            <Sparkles size={18} className="text-amber" />
            AI Table Names
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Pick a theme and AI will name your {tables.length} tables. New tables you add will automatically get a name to match.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Theme / Topic</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
              placeholder='e.g. "Flowers", "Italian cities", "Love songs"'
              className="input-field"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {THEME_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setTheme(s)}
                className={`text-[11px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  theme === s
                    ? 'bg-teal/15 text-teal-dark font-medium'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {savedTheme && (
            <div className="flex items-center gap-2 text-xs bg-teal-50 text-teal-dark rounded-lg px-3 py-2">
              <Sparkles size={12} />
              <span>Active theme: <strong>{savedTheme}</strong> — new tables auto-name</span>
              <button onClick={handleClearTheme} className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer">
                <X size={12} />
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !theme.trim()}
            className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Names
              </>
            )}
          </button>
        </div>

        {previewNames && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Preview</h4>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} />
                Regenerate
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {previewNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 text-xs w-6 text-right">{i + 1}.</span>
                  <span className="text-gray-400 line-through text-xs">
                    {tables[i]?.label || `Table ${i + 1}`}
                  </span>
                  <span className="text-gray-400">&rarr;</span>
                  <span className="font-medium text-navy">{name}</span>
                </div>
              ))}
            </div>
            <button onClick={handleApply} className="btn-primary w-full mt-3">
              Apply Names
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
