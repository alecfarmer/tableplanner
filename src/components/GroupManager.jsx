import { useState } from 'react';
import {
  FolderPlus,
  Wand2,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupManager({
  groups,
  guests,
  onAddGroup,
  onRemoveGroup,
  onUpdateGroup,
  onAutoGroup,
  onSetGuestGroup,
  onClearGuestGroups,
  groupColors,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(groupColors[0]);
  const [expanded, setExpanded] = useState(true);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [addingToGroupId, setAddingToGroupId] = useState(null);

  const handleCreate = () => {
    if (!newGroupName.trim()) return;
    onAddGroup(newGroupName.trim(), selectedColor);
    setNewGroupName('');
    setShowCreateForm(false);
    toast.success(`Group "${newGroupName.trim()}" created`);
  };

  const handleAutoGroup = () => {
    const result = onAutoGroup(guests);
    if (result.newGroups.length === 0 && Object.keys(result.guestGroupAssignments).length === 0) {
      toast('No shared last names found (need 2+ guests with the same last name)');
      return;
    }
    toast.success(
      `Created ${result.newGroups.length} family group${result.newGroups.length !== 1 ? 's' : ''}, assigned ${Object.keys(result.guestGroupAssignments).length} guests`
    );
  };

  const handleRemoveGroup = (group) => {
    onClearGuestGroups(group.id);
    onRemoveGroup(group.id);
    toast.success(`Group "${group.name}" removed`);
  };

  const handleStartEdit = (group) => {
    setEditingGroupId(group.id);
    setEditingName(group.name);
  };

  const handleSaveEdit = (groupId) => {
    if (editingName.trim()) {
      onUpdateGroup(groupId, { name: editingName.trim() });
    }
    setEditingGroupId(null);
  };

  const guestsByGroup = {};
  for (const group of groups) {
    guestsByGroup[group.id] = guests.filter((g) => g.groupId === group.id);
  }
  const ungroupedGuests = guests.filter((g) => !g.groupId);

  return (
    <div className="border-t border-gray-100">
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 cursor-pointer"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500" />
        ) : (
          <ChevronRight size={14} className="text-gray-500" />
        )}
        <span className="text-sm font-semibold text-gray-600">
          Groups ({groups.length})
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
            >
              <FolderPlus size={12} />
              New Group
            </button>
            <button
              onClick={handleAutoGroup}
              className="btn-gold text-xs py-1 px-2 flex items-center gap-1"
              title="Automatically group guests who share the same last name"
            >
              <Wand2 size={12} />
              Auto-Group by Last Name
            </button>
          </div>

          {/* Create form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Group name..."
                className="input-field text-xs"
                autoFocus
              />
              <div className="flex gap-1 flex-wrap">
                {groupColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                      selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn-primary text-xs py-1 px-3">
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Group list */}
          {groups.length === 0 ? (
            <p className="text-xs text-gray-400 py-2 text-center">
              No groups yet. Create one or auto-group by last name.
            </p>
          ) : (
            <div className="space-y-1.5">
              {groups.map((group) => (
                <GroupItem
                  key={group.id}
                  group={group}
                  members={guestsByGroup[group.id] || []}
                  ungroupedGuests={ungroupedGuests}
                  isEditing={editingGroupId === group.id}
                  editingName={editingName}
                  onEditingNameChange={setEditingName}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingGroupId(null)}
                  onRemove={() => handleRemoveGroup(group)}
                  isAddingMembers={addingToGroupId === group.id}
                  onToggleAddMembers={() =>
                    setAddingToGroupId(addingToGroupId === group.id ? null : group.id)
                  }
                  onAddGuest={(guestId) => onSetGuestGroup(guestId, group.id)}
                  onRemoveGuest={(guestId) => onSetGuestGroup(guestId, null)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroupItem({
  group,
  members,
  ungroupedGuests,
  isEditing,
  editingName,
  onEditingNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  isAddingMembers,
  onToggleAddMembers,
  onAddGuest,
  onRemoveGuest,
}) {
  const [showMembers, setShowMembers] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: group.color }}
        />

        {isEditing ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(group.id)}
              className="text-xs bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 flex-1 min-w-0"
              autoFocus
            />
            <button
              onClick={() => onSaveEdit(group.id)}
              className="text-sage hover:text-sage-dark cursor-pointer"
            >
              <Check size={12} />
            </button>
            <button
              onClick={onCancelEdit}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="text-xs font-medium text-gray-700 truncate flex-1 text-left cursor-pointer hover:text-gray-900"
            >
              {group.name}
              <span className="text-gray-400 font-normal ml-1">
                ({members.length})
              </span>
            </button>
            <button
              onClick={onToggleAddMembers}
              className="text-gray-400 hover:text-sage cursor-pointer p-0.5"
              title="Add guests to group"
            >
              <UserPlus size={12} />
            </button>
            <button
              onClick={() => onStartEdit(group)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>

      {/* Add members dropdown */}
      {isAddingMembers && ungroupedGuests.length > 0 && (
        <div className="border-t border-gray-100 px-2.5 py-2 bg-gray-50 max-h-36 overflow-y-auto">
          <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">
            Add to group:
          </p>
          <div className="space-y-0.5">
            {ungroupedGuests.map((guest) => (
              <button
                key={guest.id}
                onClick={() => onAddGuest(guest.id)}
                className="flex items-center gap-1.5 w-full text-left text-xs text-gray-600 hover:text-sage hover:bg-white rounded px-1.5 py-1 cursor-pointer transition-colors"
              >
                <UserPlus size={10} className="shrink-0" />
                <span className="truncate">{guest.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isAddingMembers && ungroupedGuests.length === 0 && (
        <div className="border-t border-gray-100 px-2.5 py-2 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">All guests are in groups</p>
        </div>
      )}

      {/* Member list */}
      {showMembers && members.length > 0 && (
        <div className="border-t border-gray-100 px-2.5 py-1.5 space-y-0.5">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1.5 text-xs text-gray-600"
            >
              <span className="truncate flex-1">{member.name}</span>
              <button
                onClick={() => onRemoveGuest(member.id)}
                className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5"
                title="Remove from group"
              >
                <UserMinus size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
