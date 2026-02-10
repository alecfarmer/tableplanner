import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Download, Upload, Printer, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { exportToJSON, importFromJSON, generatePrintHTML } from '../utils/exportHelpers';
import PlatformCSVModal from './PlatformCSVModal';
import toast from 'react-hot-toast';

export default function ExportImport({
  guests,
  tables,
  groups,
  relationships = [],
  venueElements = [],
  onImport,
}) {
  const fileInputRef = useRef(null);
  const [showCSVExport, setShowCSVExport] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportBtnRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const openMenu = useCallback(() => {
    if (exportBtnRef.current) {
      const rect = exportBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right });
    }
    setShowExportMenu(true);
  }, []);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        exportBtnRef.current && !exportBtnRef.current.contains(e.target)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExportMenu]);

  const handleExport = () => {
    exportToJSON({
      guests,
      tables,
      groups,
      relationships,
      venueElements,
      exportedAt: new Date().toISOString(),
    });
    toast.success('Seating arrangement exported');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      onImport(data);
      toast.success(`Imported ${data.guests.length} guests and ${data.tables.length} tables`);
    } catch (err) {
      toast.error(err.message);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    const html = generatePrintHTML(tables, guests);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Seating Arrangement</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #333; }
          h1 { color: #0d9488; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; }
          h2 { color: #0d9488; font-size: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>Seating Arrangement</h1>
        <p style="color:#6b7280;font-size:14px;">Generated ${new Date().toLocaleDateString()}</p>
        ${html}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          ref={exportBtnRef}
          type="button"
          onClick={() => showExportMenu ? setShowExportMenu(false) : openMenu()}
          className="btn-gold flex items-center gap-1 text-sm py-1.5"
        >
          <Download size={14} />
          Export
          <ChevronDown size={12} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="json-import"
        />
        <label
          htmlFor="json-import"
          className="btn-secondary flex items-center gap-1 text-sm py-1.5 cursor-pointer"
        >
          <Upload size={14} />
          Import
        </label>

        <button
          onClick={handlePrint}
          className="btn-wine flex items-center gap-1 text-sm py-1.5"
        >
          <Printer size={14} />
          Print
        </button>
      </div>

      {showExportMenu && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[9999] min-w-[160px]"
          style={{ top: menuPos.top, left: menuPos.left, transform: 'translateX(-100%)' }}
        >
          <button
            type="button"
            onClick={() => { handleExport(); setShowExportMenu(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} className="text-gray-400" />
            JSON Export
          </button>
          <button
            type="button"
            onClick={() => { setShowCSVExport(true); setShowExportMenu(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-gray-400" />
            CSV Export
          </button>
        </div>,
        document.body
      )}

      {showCSVExport && (
        <PlatformCSVModal
          mode="export"
          guests={guests}
          tables={tables}
          onClose={() => setShowCSVExport(false)}
        />
      )}
    </>
  );
}
