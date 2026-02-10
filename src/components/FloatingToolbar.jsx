import { useState } from 'react';
import {
  Plus, RotateCcw, Zap, Heart, LayoutGrid, X, MapPin,
  PieChart, Scale, Bookmark, Undo2, Redo2, Moon, Sun,
  Share2, Check, Clock, Search as SearchIcon, Sparkles,
} from 'lucide-react';
import { LAYOUT_PRESETS } from '../utils/autoLayout';
import { SEATING_TEMPLATES } from '../utils/templates';
import { VENUE_ELEMENT_TYPES } from '../hooks/useVenueElements';

function ToolbarDivider() {
  return <div className="w-px h-7 bg-gray-200/70 mx-0.5" />;
}

function ToolbarButton({ onClick, disabled, active, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-xl transition-all cursor-pointer
        ${active ? 'bg-teal/15 text-teal-dark' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default function FloatingToolbar({
  tables,
  onAddTable,
  onClearAssignments,
  onAutoSeat,
  onAutoLayout,
  onAutoBalance,
  onAddVenueElement,
  onApplyTemplate,
  onShowStats,
  onShowFindMySeat,
  onShowVersions,
  onShowAiNames,
  aiThemeActive,
  guestCount,
  assignedCount,
  unassignedCount,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  darkMode,
  onToggleDark,
  onShare,
  shareUrl,
}) {
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const hasSweetheart = tables.some((t) => t.shape === 'sweetheart');

  const closeAll = () => {
    setShowLayoutPicker(false);
    setShowVenuePicker(false);
    setShowTemplatePicker(false);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 no-print max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 px-2 sm:px-3 py-2 overflow-x-auto scrollbar-none">
        {/* Add Tables */}
        {!hasSweetheart && (
          <ToolbarButton onClick={() => { closeAll(); onAddTable({ shape: 'sweetheart', seats: 2, label: 'Sweetheart Table' }); }} title="Add Sweetheart Table">
            <Heart size={18} fill="#0d9488" className="text-teal" />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={() => { closeAll(); onAddTable({ shape: 'round' }); }} title="Add Round Table">
          <div className="flex items-center gap-1">
            <Plus size={14} />
            <span className="text-xs font-medium hidden sm:inline">Round</span>
          </div>
        </ToolbarButton>
        <ToolbarButton onClick={() => { closeAll(); onAddTable({ shape: 'rectangular' }); }} title="Add Rectangular Table">
          <div className="flex items-center gap-1">
            <Plus size={14} />
            <span className="text-xs font-medium hidden sm:inline">Rect</span>
          </div>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Venue Elements */}
        <div className="relative">
          <ToolbarButton
            onClick={() => { setShowVenuePicker(!showVenuePicker); setShowLayoutPicker(false); setShowTemplatePicker(false); }}
            active={showVenuePicker}
            title="Venue Elements"
          >
            <MapPin size={18} />
          </ToolbarButton>
          {showVenuePicker && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-52">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">Venue Elements</span>
                <button onClick={() => setShowVenuePicker(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {VENUE_ELEMENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { onAddVenueElement(type.id); setShowVenuePicker(false); }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-teal/10 cursor-pointer text-left transition-colors"
                  >
                    <span className="text-sm">{type.icon}</span>
                    <span className="text-[11px] text-gray-700">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Templates */}
        {onApplyTemplate && (
          <div className="relative">
            <ToolbarButton
              onClick={() => { setShowTemplatePicker(!showTemplatePicker); setShowLayoutPicker(false); setShowVenuePicker(false); }}
              active={showTemplatePicker}
              title="Templates"
            >
              <Bookmark size={18} />
            </ToolbarButton>
            {showTemplatePicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Templates</span>
                  <button onClick={() => setShowTemplatePicker(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>
                </div>
                <div className="space-y-1">
                  {SEATING_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { onApplyTemplate(t.id); setShowTemplatePicker(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal/10 cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800">{t.name}</span>
                      <span className="block text-[11px] text-gray-500">{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto Layout */}
        {tables.length > 1 && (
          <div className="relative">
            <ToolbarButton
              onClick={() => { setShowLayoutPicker(!showLayoutPicker); setShowVenuePicker(false); setShowTemplatePicker(false); }}
              active={showLayoutPicker}
              title="Auto Layout"
            >
              <LayoutGrid size={18} />
            </ToolbarButton>
            {showLayoutPicker && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-56">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Layout</span>
                  <button onClick={() => setShowLayoutPicker(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>
                </div>
                <div className="space-y-1">
                  {LAYOUT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => { onAutoLayout(preset.id); setShowLayoutPicker(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal/10 cursor-pointer transition-colors"
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

        <ToolbarDivider />

        {/* Auto Actions */}
        {unassignedCount > 0 && tables.length > 0 && (
          <ToolbarButton onClick={() => { closeAll(); onAutoSeat(); }} title="Auto-Seat">
            <div className="flex items-center gap-1">
              <Zap size={16} />
              <span className="text-xs font-medium hidden sm:inline">Auto-Seat</span>
            </div>
          </ToolbarButton>
        )}
        {assignedCount > 0 && tables.length > 1 && onAutoBalance && (
          <ToolbarButton onClick={() => { closeAll(); onAutoBalance(); }} title="Balance Tables">
            <Scale size={18} />
          </ToolbarButton>
        )}

        {tables.length > 0 && (
          <ToolbarButton onClick={() => { closeAll(); onShowAiNames(); }} title="AI Table Names" active={aiThemeActive}>
            <div className="flex items-center gap-1">
              <Sparkles size={16} className={aiThemeActive ? 'text-amber' : ''} />
              <span className="text-xs font-medium hidden sm:inline">AI Names</span>
            </div>
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo2 size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Utilities */}
        <ToolbarButton onClick={onToggleDark} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </ToolbarButton>
        <ToolbarButton onClick={onShowFindMySeat} title="Find My Seat">
          <SearchIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onShowVersions} title="Saved Versions">
          <Clock size={18} />
        </ToolbarButton>
        {guestCount > 0 && (
          <ToolbarButton onClick={onShowStats} title="Statistics">
            <PieChart size={18} />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={onShare} title="Share" active={!!shareUrl}>
          {shareUrl ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
        </ToolbarButton>

        {/* Clear All */}
        {assignedCount > 0 && (
          <>
            <ToolbarDivider />
            <ToolbarButton onClick={onClearAssignments} title="Clear all assignments" className="text-coral hover:text-coral-dark">
              <RotateCcw size={18} />
            </ToolbarButton>
          </>
        )}
      </div>

      {/* Stats summary */}
      <div className="text-center mt-2">
        <span className="text-[11px] text-gray-400 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
          {tables.length} {tables.length === 1 ? 'table' : 'tables'} &middot;{' '}
          {assignedCount}/{guestCount} seated
        </span>
      </div>
    </div>
  );
}
