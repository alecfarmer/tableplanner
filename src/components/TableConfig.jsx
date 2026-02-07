import { useState } from 'react';
import { Plus, RotateCcw, Zap, Heart, LayoutGrid, X } from 'lucide-react';
import TableNameGenerator from './TableNameGenerator';
import { LAYOUT_PRESETS } from '../utils/autoLayout';

export default function TableConfig({
  tables,
  onAddTable,
  onUpdateTable,
  onClearAssignments,
  onAutoSeat,
  onAutoLayout,
  guestCount,
  assignedCount,
  unassignedCount,
}) {
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const hasSweetheart = tables.some((t) => t.shape === 'sweetheart');

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 no-print flex-wrap">
      <div className="flex items-center gap-2">
        {!hasSweetheart && (
          <button
            onClick={() =>
              onAddTable({ shape: 'sweetheart', seats: 2, label: 'Sweetheart Table' })
            }
            className="flex items-center gap-1 text-sm py-1.5 px-3 rounded-lg border-2 border-gold/40 text-gold-dark hover:bg-gold/10 font-medium cursor-pointer transition-colors"
          >
            <Heart size={14} fill="#c9a84c" />
            Sweetheart Table
          </button>
        )}
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

      <div className="flex items-center gap-2">
        <TableNameGenerator
          tables={tables}
          onUpdateTable={onUpdateTable}
        />
        {tables.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowLayoutPicker(!showLayoutPicker)}
              className="btn-secondary flex items-center gap-1 text-sm py-1.5"
            >
              <LayoutGrid size={14} />
              Auto-Layout
            </button>
            {showLayoutPicker && (
              <div className="absolute top-full left-0 mt-1 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-56">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Choose Layout</span>
                  <button
                    onClick={() => setShowLayoutPicker(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-1">
                  {LAYOUT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onAutoLayout(preset.id);
                        setShowLayoutPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-sage/10 cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800">{preset.name}</span>
                      <span className="block text-[11px] text-gray-500">{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {unassignedCount > 0 && tables.length > 0 && (
          <button
            onClick={onAutoSeat}
            className="btn-wine flex items-center gap-1 text-sm py-1.5"
          >
            <Zap size={14} />
            Auto-Seat
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 flex-1">
        {tables.length} {tables.length === 1 ? 'table' : 'tables'} &middot;{' '}
        {tables.reduce((sum, t) => sum + (t.shape === 'sweetheart' ? 2 : t.seats), 0)} total seats &middot;{' '}
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
