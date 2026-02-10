import { useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize, AlertTriangle, Grid3x3, Image } from 'lucide-react';
import TableShape from './TableShape';
import VenueElement from './VenueElement';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.15;
const GRID_SIZE = 24;

export default function TableCanvas({
  tables,
  guests,
  highlightedGuestIds,
  tableConflicts,
  venueElements = [],
  gridSnap,
  backgroundImage,
  onMoveTable,
  onUpdateTable,
  onRemoveTable,
  onDuplicateTable,
  onTableClick,
  onMoveVenueElement,
  onRemoveVenueElement,
  onToggleGridSnap,
  onSetBackgroundImage,
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [draggingTable, setDraggingTable] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragMoved, setDragMoved] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  const handleZoomReset = () => setZoom(1);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta));
      });
    }
  }, []);

  const snapToGrid = useCallback((val) => {
    if (!gridSnap) return val;
    return Math.round(val / GRID_SIZE) * GRID_SIZE;
  }, [gridSnap]);

  const handlePointerDown = useCallback(
    (e, table) => {
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
      setDraggingElement(null);
      setDragMoved(false);
      setDragOffset({
        x: e.clientX - rect.left - table.x * zoom,
        y: e.clientY - rect.top - table.y * zoom,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [zoom]
  );

  const handleElementPointerDown = useCallback(
    (e, element) => {
      if (e.target.closest('button')) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingElement(element.id);
      setDraggingTable(null);
      setDragMoved(false);
      setDragOffset({
        x: e.clientX - rect.left - element.x * zoom,
        y: e.clientY - rect.top - element.y * zoom,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [zoom]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingTable && !draggingElement) return;
      setDragMoved(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = Math.max(0, (e.clientX - rect.left - dragOffset.x) / zoom);
      const rawY = Math.max(0, (e.clientY - rect.top - dragOffset.y) / zoom);
      const x = snapToGrid(rawX);
      const y = snapToGrid(rawY);
      if (draggingTable) {
        onMoveTable(draggingTable, x, y);
      } else if (draggingElement && onMoveVenueElement) {
        onMoveVenueElement(draggingElement, x, y);
      }
    },
    [draggingTable, draggingElement, dragOffset, onMoveTable, onMoveVenueElement, zoom, snapToGrid]
  );

  const handlePointerUp = useCallback(
    (e, table) => {
      if (draggingTable && !dragMoved && table && onTableClick) {
        onTableClick(table.id);
      }
      setDraggingTable(null);
      setDraggingElement(null);
      setDragMoved(false);
    },
    [draggingTable, dragMoved, onTableClick]
  );

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (onSetBackgroundImage) onSetBackgroundImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-1 no-print">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleZoomReset}
          className="px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-100 rounded cursor-pointer min-w-[48px] text-center transition-colors"
          title="Reset zoom"
        >
          {zoomPercent}%
        </button>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        <button
          onClick={handleZoomReset}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
          title="Fit to view"
        >
          <Maximize size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        {onToggleGridSnap && (
          <button
            onClick={onToggleGridSnap}
            className={`p-1.5 rounded cursor-pointer transition-colors ${gridSnap ? 'bg-sage/20 text-sage-dark' : 'text-gray-400 hover:bg-gray-100'}`}
            title={gridSnap ? 'Grid snap ON' : 'Grid snap OFF'}
          >
            <Grid3x3 size={16} />
          </button>
        )}
        {onSetBackgroundImage && (
          <button
            onClick={() => {
              if (backgroundImage) {
                onSetBackgroundImage(null);
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`p-1.5 rounded cursor-pointer transition-colors ${backgroundImage ? 'bg-sage/20 text-sage-dark' : 'text-gray-400 hover:bg-gray-100'}`}
            title={backgroundImage ? 'Remove floor plan' : 'Upload floor plan'}
          >
            <Image size={16} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="hidden"
        />
      </div>

      {/* Hint */}
      {tables.length > 0 && (
        <div className="absolute bottom-3 right-3 z-30 text-[10px] text-gray-400 bg-white/80 backdrop-blur-sm rounded px-2 py-1 no-print">
          Ctrl+Scroll to zoom &middot; Click table to inspect{gridSnap ? ' &middot; Grid snap ON' : ''}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto"
        onWheel={handleWheel}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          setDraggingTable(null);
          setDraggingElement(null);
          setDragMoved(false);
        }}
        style={{
          backgroundImage: gridSnap
            ? `linear-gradient(to right, rgba(13,148,136,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(13,148,136,0.12) 1px, transparent 1px)`
            : 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: gridSnap
            ? `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`
            : `${24 * zoom}px ${24 * zoom}px`,
        }}
      >
        <div
          className="relative min-h-[600px]"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            width: `${100 / zoom}%`,
            minHeight: `${600 / zoom}px`,
          }}
        >
          {/* Background floor plan */}
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt="Floor plan"
              className="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none"
            />
          )}

          {tables.length === 0 && venueElements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${1 / zoom})`, transformOrigin: 'center center' }}>
              <div className="text-center text-gray-400">
                <p className="text-lg font-serif">No tables yet</p>
                <p className="text-sm mt-1">
                  Add tables using the controls above
                </p>
              </div>
            </div>
          )}

          {/* Venue elements */}
          {venueElements.map((element) => (
            <div
              key={element.id}
              className={`absolute ${
                draggingElement === element.id ? 'z-40 cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                left: element.x,
                top: element.y,
                touchAction: 'none',
              }}
              onPointerDown={(e) => handleElementPointerDown(e, element)}
            >
              <VenueElement
                element={element}
                onRemove={onRemoveVenueElement}
              />
            </div>
          ))}

          {/* Tables */}
          {tables.map((table) => {
            const hasConflict = tableConflicts?.has(table.id);
            return (
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
                onPointerUp={(e) => handlePointerUp(e, table)}
              >
                {/* Conflict badge */}
                {hasConflict && (
                  <div
                    className="absolute -top-2 -left-2 z-20 bg-red-500 text-white rounded-full p-0.5"
                    title={`Seating conflict: ${tableConflicts.get(table.id).map((c) => `${c.guest1?.name} & ${c.guest2?.name}`).join(', ')}`}
                  >
                    <AlertTriangle size={12} />
                  </div>
                )}
                <TableShape
                  table={table}
                  guests={guests}
                  highlightedGuestIds={highlightedGuestIds}
                  onUpdateTable={onUpdateTable}
                  onRemoveTable={onRemoveTable}
                  onDuplicateTable={onDuplicateTable}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
