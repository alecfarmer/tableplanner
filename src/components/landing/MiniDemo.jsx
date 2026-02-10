import { useState, useCallback } from 'react';
import { DndContext, DragOverlay, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const INITIAL_GUESTS = [
  { id: 'd1', name: 'Emma Wilson' },
  { id: 'd2', name: 'James Chen' },
  { id: 'd3', name: 'Sofia Martinez' },
  { id: 'd4', name: 'Liam O\'Brien' },
];

function getSeatPositions(seats, radius) {
  const positions = [];
  const cx = 120, cy = 120;
  for (let i = 0; i < seats; i++) {
    const angle = (2 * Math.PI * i) / seats - Math.PI / 2;
    positions.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return positions;
}

function DemoGuestCard({ guest, isDemoOver }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `demo-guest-${guest.id}`,
    data: { type: 'guest', guest },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all hover:border-teal/30 ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <GripVertical size={14} className="text-gray-400 shrink-0" />
      <span className="font-medium truncate">{guest.name}</span>
    </div>
  );
}

function DemoSeat({ seatIndex, guest, position }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `demo-seat-${seatIndex}`,
    data: { type: 'seat', seatIndex, currentGuest: guest },
  });

  const size = 48;

  return (
    <div
      ref={setNodeRef}
      className={`absolute flex items-center justify-center rounded-full text-center transition-all duration-150
        ${guest
          ? 'bg-teal text-white shadow-sm'
          : 'border-[1.5px] border-dashed border-gray-300 bg-white'
        }
        ${isOver && !guest ? 'ring-2 ring-teal-light ring-offset-2 bg-teal-50 scale-110' : ''}
        ${isOver && guest ? 'ring-2 ring-amber ring-offset-1 scale-110' : ''}
      `}
      style={{
        width: size,
        height: size,
        left: position.x - size / 2,
        top: position.y - size / 2,
        fontSize: '10px',
        lineHeight: '1.1',
      }}
    >
      {guest ? (
        <span className="truncate block w-full font-semibold text-white px-1">{guest.name.split(' ')[0]}</span>
      ) : (
        <span className="text-gray-400 text-[9px] font-medium">{seatIndex + 1}</span>
      )}
    </div>
  );
}

export default function MiniDemo() {
  const { ref, isVisible } = useScrollAnimation();
  const [assignments, setAssignments] = useState({});
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const seatPositions = getSeatPositions(6, 80);

  const assignedGuestIds = new Set(Object.values(assignments).map((g) => g.id));
  const unassigned = INITIAL_GUESTS.filter((g) => !assignedGuestIds.has(g.id));

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (active.data.current?.type === 'guest') {
      setActiveDrag(active.data.current.guest);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over || !active) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type !== 'guest' || overData?.type !== 'seat') return;

    const guest = activeData.guest;
    const seatIndex = overData.seatIndex;

    setAssignments((prev) => {
      const next = { ...prev };
      // Remove guest from any current seat
      for (const [key, val] of Object.entries(next)) {
        if (val.id === guest.id) delete next[key];
      }
      // Assign to new seat
      next[seatIndex] = guest;
      return next;
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
  }, []);

  return (
    <section id="demo" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div ref={ref} className={`text-center mb-12 animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="inline-block text-teal text-xs font-bold uppercase tracking-widest mb-3">
            Live Demo
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4 tracking-tight">
            Try it right now
          </h2>
          <p className="text-gray-500 text-lg">
            Drag a guest onto a seat to see how easy it is.
          </p>
        </div>

        <div className={`animate-fade-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="bg-surface border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              {/* Browser frame */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 text-center">
                  tableplanner.app
                </div>
              </div>

              {/* Demo content */}
              <div className="flex p-6 gap-6 min-h-[300px]">
                {/* Mini sidebar */}
                <div className="w-48 shrink-0">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Guests ({unassigned.length})
                  </h3>
                  <div className="space-y-2">
                    {unassigned.map((guest) => (
                      <DemoGuestCard key={guest.id} guest={guest} />
                    ))}
                    {unassigned.length === 0 && (
                      <p className="text-xs text-teal font-medium text-center py-4">
                        All seated!
                      </p>
                    )}
                  </div>
                </div>

                {/* Mini canvas */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative" style={{ width: 240, height: 240 }}>
                    {/* Table surface */}
                    <svg className="absolute inset-0" width={240} height={240}>
                      <defs>
                        <filter id="demo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.06" />
                        </filter>
                        <radialGradient id="demo-fill" cx="40%" cy="35%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="100%" stopColor="#f1f5f9" />
                        </radialGradient>
                      </defs>
                      <circle cx={120} cy={120} r={56} fill="url(#demo-fill)" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#demo-shadow)" />
                      <circle cx={120} cy={120} r={46} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center">
                        <p className="text-xs font-serif font-semibold text-navy">Table 1</p>
                        <p className="text-[10px] text-gray-400">{Object.keys(assignments).length}/6</p>
                      </div>
                    </div>

                    {/* Seats */}
                    {seatPositions.map((pos, i) => (
                      <DemoSeat
                        key={i}
                        seatIndex={i}
                        guest={assignments[i] || null}
                        position={pos}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeDrag ? (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-xl ring-2 ring-teal pointer-events-none w-44">
                  <GripVertical size={14} className="text-gray-400 shrink-0" />
                  <span className="font-medium truncate">{activeDrag.name}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </section>
  );
}
