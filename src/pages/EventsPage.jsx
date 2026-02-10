import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, LayoutGrid, Trash2, Heart, LogOut, Loader2, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import ConfirmDialog from '../components/ConfirmDialog';
import toast, { Toaster } from 'react-hot-toast';

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'other', label: 'Other' },
];

export default function EventsPage() {
  const { user, signOut } = useAuth();
  const { events, loading, createEvent, deleteEvent } = useEvents();
  const navigate = useNavigate();
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('other');
  const [newDate, setNewDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = 'My Events — TablePlanner';
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const event = await createEvent({
        name: newName.trim(),
        event_type: newType,
        date: newDate || null,
      });
      toast.success('Event created');
      setShowNewEvent(false);
      setNewName('');
      setNewType('other');
      setNewDate('');
      if (event) navigate(`/events/${event.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteEvent(deletingId);
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface">
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart size={18} className="text-teal" fill="#0d9488" />
            <span className="font-serif text-lg font-bold text-navy">TablePlanner</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/upgrade" className="text-xs text-amber-dark font-medium hover:text-amber flex items-center gap-1">
              <Crown size={14} />
              Upgrade
            </Link>
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy">My Events</h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage your seating plans</p>
          </div>
          <button
            onClick={() => setShowNewEvent(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Event
          </button>
        </div>

        {/* New Event Form */}
        {showNewEvent && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-navy mb-4">Create New Event</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Event name"
                  className="input-field"
                  autoFocus
                  required
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="input-field"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Create
                </button>
                <button type="button" onClick={() => setShowNewEvent(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-teal animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <LayoutGrid size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-500 mb-2">No events yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first event to start planning seating.</p>
            <button
              onClick={() => setShowNewEvent(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy truncate group-hover:text-teal transition-colors">
                      {event.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                      {event.event_type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingId(event.id); }}
                    className="text-gray-300 hover:text-coral cursor-pointer p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete event"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {event.guestCount} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <LayoutGrid size={12} />
                    {event.tableCount} tables
                  </span>
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deletingId && (
        <ConfirmDialog
          title="Delete event?"
          message="This will permanently delete this event, all its guests, tables, and seating data. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
