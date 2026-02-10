import { useState } from 'react';
import { Upload } from 'lucide-react';
import PlatformCSVModal from './PlatformCSVModal';

export default function CSVUploader({ onGuestsLoaded }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-secondary flex items-center gap-2 cursor-pointer text-sm w-full justify-center"
      >
        <Upload size={16} />
        Import from CSV
      </button>

      {showModal && (
        <PlatformCSVModal
          mode="import"
          onImportGuests={onGuestsLoaded}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
