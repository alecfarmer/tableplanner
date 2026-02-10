import { X, Users, Utensils, PieChart } from 'lucide-react';

export default function StatsPanel({ guests, tables, groups, onClose }) {
  const assigned = guests.filter((g) => g.tableId);
  const unassigned = guests.filter((g) => !g.tableId);
  const totalSeats = tables.reduce((s, t) => s + (t.shape === 'sweetheart' ? 2 : t.seats), 0);
  const emptySeats = totalSeats - assigned.length;

  // RSVP breakdown
  const rsvpCounts = { accepted: 0, declined: 0, pending: 0, invited: 0 };
  for (const g of guests) {
    rsvpCounts[g.rsvp || 'pending'] = (rsvpCounts[g.rsvp || 'pending'] || 0) + 1;
  }

  // Meal breakdown
  const mealCounts = {};
  for (const g of guests) {
    if (g.meal) mealCounts[g.meal] = (mealCounts[g.meal] || 0) + 1;
  }
  const noMeal = guests.filter((g) => !g.meal).length;

  // Dietary breakdown
  const dietCounts = {};
  for (const g of guests) {
    if (g.dietary) dietCounts[g.dietary] = (dietCounts[g.dietary] || 0) + 1;
  }

  // Table fill rates
  const tableFills = tables.map((t) => {
    const cap = t.shape === 'sweetheart' ? 2 : t.seats;
    const filled = guests.filter((g) => g.tableId === t.id).length;
    return { label: t.label, filled, cap, pct: cap > 0 ? Math.round((filled / cap) * 100) : 0 };
  });

  // Tags breakdown
  const tagCounts = {};
  for (const g of guests) {
    for (const tag of g.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Role breakdown
  const roleCounts = {};
  for (const g of guests) {
    if (g.role) roleCounts[g.role] = (roleCounts[g.role] || 0) + 1;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-serif text-xl font-semibold text-wine flex items-center gap-2">
            <PieChart size={20} />
            Statistics Dashboard
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Overview */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Guests" value={guests.length} color="text-wine" />
            <StatCard label="Seated" value={assigned.length} color="text-green-600" />
            <StatCard label="Unassigned" value={unassigned.length} color="text-yellow-600" />
            <StatCard label="Empty Seats" value={emptySeats} color="text-gray-500" />
          </div>

          {/* RSVP */}
          <Section title="RSVP Status" icon={<Users size={14} />}>
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Accepted" value={rsvpCounts.accepted} bg="bg-green-100" text="text-green-700" />
              <MiniStat label="Pending" value={rsvpCounts.pending} bg="bg-yellow-100" text="text-yellow-700" />
              <MiniStat label="Invited" value={rsvpCounts.invited} bg="bg-blue-100" text="text-blue-700" />
              <MiniStat label="Declined" value={rsvpCounts.declined} bg="bg-red-100" text="text-red-600" />
            </div>
          </Section>

          {/* Meals */}
          {(Object.keys(mealCounts).length > 0 || noMeal > 0) && (
            <Section title="Meal Choices" icon={<Utensils size={14} />}>
              <div className="space-y-1.5">
                {Object.entries(mealCounts).sort((a, b) => b[1] - a[1]).map(([meal, count]) => (
                  <BarRow key={meal} label={meal} count={count} total={guests.length} />
                ))}
                {noMeal > 0 && <BarRow label="No selection" count={noMeal} total={guests.length} muted />}
              </div>
            </Section>
          )}

          {/* Dietary */}
          {Object.keys(dietCounts).length > 0 && (
            <Section title="Dietary Requirements">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(dietCounts).map(([diet, count]) => (
                  <span key={diet} className="text-xs bg-gold/10 text-gold-dark px-2 py-1 rounded-full">
                    {diet} ({count})
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Table Fill Rates */}
          <Section title="Table Fill Rates">
            <div className="space-y-1.5">
              {tableFills.map((t) => (
                <BarRow key={t.label} label={t.label} count={t.filled} total={t.cap} suffix={`${t.filled}/${t.cap}`} />
              ))}
            </div>
          </Section>

          {/* Tags */}
          {Object.keys(tagCounts).length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(tagCounts).map(([tag, count]) => (
                  <span key={tag} className="text-xs bg-sage/20 text-sage-dark px-2 py-1 rounded-full">
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Roles */}
          {Object.keys(roleCounts).length > 0 && (
            <Section title="Event Roles">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(roleCounts).map(([role, count]) => (
                  <span key={role} className="text-xs bg-wine/10 text-wine px-2 py-1 rounded-full">
                    {role} ({count})
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniStat({ label, value, bg, text }) {
  return (
    <div className={`${bg} rounded-lg px-3 py-2 flex items-center justify-between`}>
      <span className={`text-xs font-medium ${text}`}>{label}</span>
      <span className={`text-sm font-bold ${text}`}>{value}</span>
    </div>
  );
}

function BarRow({ label, count, total, suffix, muted }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs w-24 truncate ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${muted ? 'bg-gray-300' : 'bg-sage'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500 w-10 text-right">{suffix || count}</span>
    </div>
  );
}
