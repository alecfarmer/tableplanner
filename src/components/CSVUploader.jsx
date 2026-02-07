import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import toast from 'react-hot-toast';

export default function CSVUploader({ onGuestsLoaded }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const guests = await parseCSV(file);
      if (guests.length === 0) {
        toast.error('No valid guest names found in CSV');
        return;
      }
      onGuestsLoaded(guests);
      toast.success(`Imported ${guests.length} guests from CSV`);
    } catch (err) {
      toast.error(err.message);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className="btn-secondary flex items-center gap-2 cursor-pointer text-sm w-full justify-center"
      >
        <Upload size={16} />
        Import CSV
      </label>
    </div>
  );
}
