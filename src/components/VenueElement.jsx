import { Trash2 } from 'lucide-react';
import { VENUE_ELEMENT_TYPES } from '../hooks/useVenueElements';

export default function VenueElement({ element, onRemove }) {
  const typeDef = VENUE_ELEMENT_TYPES.find((t) => t.id === element.type);

  return (
    <div
      className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white/60 select-none"
      style={{ width: element.width, height: element.height }}
    >
      <span className="text-lg leading-none">{typeDef?.icon || '?'}</span>
      <span className="text-[10px] font-medium text-gray-600 mt-0.5 truncate max-w-full px-1">
        {element.label}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(element.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -top-2 -right-2 bg-white shadow-sm border border-gray-200 rounded-full p-0.5 hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer z-10"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}
