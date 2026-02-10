import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Download, AlertTriangle, Check, FileSpreadsheet } from 'lucide-react';
import { PLATFORMS, parseForPlatform, exportForPlatform } from '../utils/platformCSV/index.js';
import toast from 'react-hot-toast';

const IMPORT_PLATFORMS = PLATFORMS; // includes 'auto'
const EXPORT_PLATFORMS = PLATFORMS.filter((p) => p.id !== 'auto');

export default function PlatformCSVModal({
  mode, // 'import' | 'export'
  guests = [],
  tables = [],
  onImportGuests,
  onClose,
}) {
  const [step, setStep] = useState(1); // import: 1=select, 2=preview
  const [selectedPlatform, setSelectedPlatform] = useState(mode === 'import' ? 'auto' : 'generic');
  const [parsedGuests, setParsedGuests] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [detectedPlatform, setDetectedPlatform] = useState(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef(null);

  // ── Import: file selected ──
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      const result = await parseForPlatform(selectedPlatform, file);
      setParsedGuests(result.guests);
      setWarnings(result.warnings);
      setDetectedPlatform(result.detectedPlatform);
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Import: confirm ──
  const handleImportConfirm = () => {
    if (parsedGuests.length === 0) {
      toast.error('No guests to import');
      return;
    }
    onImportGuests(parsedGuests);
    const platformLabel = PLATFORMS.find((p) => p.id === detectedPlatform)?.label || 'CSV';
    toast.success(`Imported ${parsedGuests.length} guests from ${platformLabel}`);
    onClose();
  };

  // ── Export: platform selected ──
  const handleExport = (platformId) => {
    const csv = exportForPlatform(platformId, guests, tables);
    const platformLabel = PLATFORMS.find((p) => p.id === platformId)?.label || 'CSV';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests-${platformId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${guests.length} guests as ${platformLabel} CSV`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-teal" />
            <h2 className="font-serif text-lg font-semibold text-navy">
              {mode === 'import' ? 'Import from CSV' : 'Export to CSV'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'import' && step === 1 && (
            <ImportStep1
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              parsing={parsing}
            />
          )}

          {mode === 'import' && step === 2 && (
            <ImportStep2
              guests={parsedGuests}
              warnings={warnings}
              detectedPlatform={detectedPlatform}
              onConfirm={handleImportConfirm}
              onBack={() => setStep(1)}
            />
          )}

          {mode === 'export' && (
            <ExportStep
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              onExport={handleExport}
              guestCount={guests.length}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Platform grid used by both import and export ──
function PlatformGrid({ platforms, selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
            selected === p.id
              ? 'border-teal bg-teal/5'
              : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="font-medium text-sm text-gray-800">{p.label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{p.description}</div>
        </button>
      ))}
    </div>
  );
}

// ── Import Step 1: Select platform + upload file ──
function ImportStep1({ selectedPlatform, onSelectPlatform, onFileSelect, fileInputRef, parsing }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select Platform</h3>
        <PlatformGrid
          platforms={IMPORT_PLATFORMS}
          selected={selectedPlatform}
          onSelect={onSelectPlatform}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Upload CSV File</h3>
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
          parsing ? 'border-teal bg-teal/5' : 'border-gray-200 hover:border-teal/50 hover:bg-gray-50'
        }`}>
          <Upload size={24} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">
            {parsing ? 'Parsing...' : 'Click to select a CSV file'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileSelect}
            className="hidden"
            disabled={parsing}
          />
        </label>
      </div>
    </div>
  );
}

// ── Import Step 2: Preview parsed guests ──
function ImportStep2({ guests, warnings, detectedPlatform, onConfirm, onBack }) {
  const platformLabel = PLATFORMS.find((p) => p.id === detectedPlatform)?.label || 'Unknown';
  const preview = guests.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Check size={16} className="text-teal" />
        <span className="text-sm text-gray-700">
          Detected as <span className="font-semibold text-teal">{platformLabel}</span> — {guests.length} guest{guests.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium text-gray-600">Name</th>
              <th className="px-3 py-2 font-medium text-gray-600">Party</th>
              <th className="px-3 py-2 font-medium text-gray-600">RSVP</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((g, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-3 py-1.5 text-gray-800">{g.name}</td>
                <td className="px-3 py-1.5 text-gray-500">{g.party || '—'}</td>
                <td className="px-3 py-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    g.rsvp === 'accepted' ? 'bg-green-100 text-green-700' :
                    g.rsvp === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {g.rsvp}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guests.length > 10 && (
          <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 text-center">
            ...and {guests.length - 10} more
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="btn-secondary flex-1 text-sm py-2 cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="btn-teal flex-1 flex items-center justify-center gap-2 text-sm py-2 cursor-pointer"
        >
          <Download size={14} />
          Import {guests.length} Guest{guests.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

// ── Export: Select platform and download ──
function ExportStep({ selectedPlatform, onSelectPlatform, onExport, guestCount }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select Export Format</h3>
        <PlatformGrid
          platforms={EXPORT_PLATFORMS}
          selected={selectedPlatform}
          onSelect={onSelectPlatform}
        />
      </div>

      <button
        onClick={() => onExport(selectedPlatform)}
        className="btn-teal w-full flex items-center justify-center gap-2 text-sm py-2.5 cursor-pointer"
        disabled={guestCount === 0}
      >
        <Download size={14} />
        Export {guestCount} Guest{guestCount !== 1 ? 's' : ''} as {EXPORT_PLATFORMS.find((p) => p.id === selectedPlatform)?.label || 'CSV'}
      </button>

      {guestCount === 0 && (
        <p className="text-xs text-gray-400 text-center">No guests to export</p>
      )}
    </div>
  );
}
