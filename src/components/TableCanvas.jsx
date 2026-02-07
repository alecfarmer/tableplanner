import { useRef, useState, useCallback } from 'react';
import TableShape from './TableShape';

export default function TableCanvas({
  tables,
  guests,
  onMoveTable,
  onUpdateTable,
  onRemoveTable,
}) {
  const canvasRef = useRef(null);
  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e, table) => {
      // Only start drag from the table itself, not from buttons/inputs
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'SELECT' ||
        e.target.tagName === 'BUTTON' ||
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('select')
      ) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingTable(table.id);
      setDragOffset({
        x: e.clientX - rect.left - table.x,
        y: e.clientY - rect.top - table.y,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingTable) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
      onMoveTable(draggingTable, x, y);
    },
    [draggingTable, dragOffset, onMoveTable]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingTable(null);
  }, []);

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 min-h-[600px] bg-cream-dark/30 overflow-auto"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        backgroundImage:
          'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {tables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-serif">No tables yet</p>
            <p className="text-sm mt-1">
              Add tables using the controls above
            </p>
          </div>
        </div>
      )}

      {tables.map((table) => (
        <div
          key={table.id}
          className={`absolute ${
            draggingTable === table.id ? 'z-50 cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            left: table.x,
            top: table.y,
            touchAction: 'none',
          }}
          onPointerDown={(e) => handlePointerDown(e, table)}
        >
          <TableShape
            table={table}
            guests={guests}
            onUpdateTable={onUpdateTable}
            onRemoveTable={onRemoveTable}
          />
        </div>
      ))}
    </div>
  );
}
