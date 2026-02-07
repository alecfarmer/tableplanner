import { useState } from 'react';
import { Sparkles, Key, X, Loader2, RefreshCw } from 'lucide-react';
import { generateTableNames, getStoredApiKey, setStoredApiKey, getEffectiveApiKey, hasEnvApiKey } from '../utils/aiTableNames';
import toast from 'react-hot-toast';

export default function TableNameGenerator({ tables, onUpdateTable }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [previewNames, setPreviewNames] = useState(null);

  const envKeyAvailable = hasEnvApiKey();

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Enter a theme first');
      return;
    }
    if (!envKeyAvailable && !apiKey.trim()) {
      setShowApiKey(true);
      toast.error('An Anthropic API key is required — set VITE_ANTHROPIC_API_KEY in .env or enter one below');
      return;
    }

    setLoading(true);
    setPreviewNames(null);

    try {
      const names = await generateTableNames(theme.trim(), tables.length, apiKey.trim());
      setPreviewNames(names);
      toast.success(`Generated ${names.length} table names`);
    } catch (err) {
      const msg = err.message || 'Failed to generate names';
      if (msg.includes('401') || msg.includes('authentication') || msg.includes('api_key')) {
        toast.error('Invalid API key. Please check and try again.');
        setShowApiKey(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewNames) return;
    for (let i = 0; i < Math.min(previewNames.length, tables.length); i++) {
      onUpdateTable(tables[i].id, { label: previewNames[i] });
    }
    toast.success('Table names applied');
    setPreviewNames(null);
    setOpen(false);
  };

  const handleSaveKey = () => {
    setStoredApiKey(apiKey.trim());
    setShowApiKey(false);
    toast.success('API key saved');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={tables.length === 0}
        className="flex items-center gap-1 text-sm py-1.5 btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles size={14} />
        AI Names
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-wine flex items-center gap-2">
            <Sparkles size={18} className="text-gold" />
            AI Table Name Generator
          </h3>
          <button
            onClick={() => { setOpen(false); setPreviewNames(null); }}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Enter a theme and AI will generate creative names for your {tables.length} tables.
        </p>

        {/* Theme input */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Theme / Topic</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
              placeholder='e.g. "Flowers", "Italian cities", "Love songs", "Constellations"'
              className="input-field"
              autoFocus
            />
          </div>

          {/* Quick theme suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {['Flowers', 'Wine regions', 'Love songs', 'Gemstones', 'Constellations', 'Paris landmarks', 'Shakespeare plays', 'Dance styles'].map((s) => (
              <button
                key={s}
                onClick={() => setTheme(s)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-cream-dark hover:bg-blush text-gray-600 cursor-pointer transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* API Key */}
          <div>
            {envKeyAvailable ? (
              <div className="flex items-center gap-1.5 text-xs text-sage-dark">
                <Key size={10} />
                <span>Using API key from environment variable</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                >
                  <Key size={10} />
                  {getStoredApiKey() ? 'API key saved' : 'Set API key'}
                </button>

                {showApiKey && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="input-field text-xs font-mono"
                    />
                    <div className="flex gap-2 items-center">
                      <button onClick={handleSaveKey} className="btn-primary text-xs py-1 px-3">
                        Save Key
                      </button>
                      <span className="text-[10px] text-gray-400">
                        Or set VITE_ANTHROPIC_API_KEY in .env
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Generate button */}
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

        {/* Preview */}
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
                  <span className="font-medium text-wine">{name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleApply}
              className="btn-primary w-full mt-3"
            >
              Apply Names to Tables
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
