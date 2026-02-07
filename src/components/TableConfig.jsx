import { Plus, RotateCcw } from 'lucide-react';

export default function TableConfig({
  tables,
  onAddTable,
  onClearAssignments,
  guestCount,
  assignedCount,
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 no-print flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onAddTable({ shape: 'round' })}
          className="btn-primary flex items-center gap-1 text-sm py-1.5"
        >
          <Plus size={14} />
          Round Table
        </button>
        <button
          onClick={() => onAddTable({ shape: 'rectangular' })}
          className="btn-secondary flex items-center gap-1 text-sm py-1.5"
        >
          <Plus size={14} />
          Rectangular
        </button>
      </div>

      <div className="text-sm text-gray-500 flex-1">
        {tables.length} {tables.length === 1 ? 'table' : 'tables'} &middot;{' '}
        {tables.reduce((sum, t) => sum + t.seats, 0)} total seats &middot;{' '}
        {assignedCount}/{guestCount} guests seated
      </div>

      {assignedCount > 0 && (
        <button
          onClick={onClearAssignments}
          className="text-sm text-gray-500 hover:text-wine flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={14} />
          Clear all
        </button>
      )}
    </div>
  );
}
