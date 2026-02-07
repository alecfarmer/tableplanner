import { useRef } from 'react';
import { Download, Upload, Printer } from 'lucide-react';
import { exportToJSON, importFromJSON, generatePrintHTML } from '../utils/exportHelpers';
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
          h1 { color: #722f37; border-bottom: 2px solid #c9a84c; padding-bottom: 8px; }
          h2 { color: #722f37; font-size: 16px; margin-top: 24px; }
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
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="btn-gold flex items-center gap-1 text-sm py-1.5"
      >
        <Download size={14} />
        Export
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
  );
}
