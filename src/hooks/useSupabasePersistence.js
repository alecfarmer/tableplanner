import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Supabase persistence layer for a single event.
 * Loads data on mount, auto-saves on changes (debounced).
 */
export function useSupabasePersistence(
  eventId,
  guests, tables, groups, relationships, venueElements,
  setGuests, setTables, setGroups, setRelationships, setVenueElements
) {
  const initialized = useRef(false);
  const saving = useRef(false);

  // Load event data from Supabase
  useEffect(() => {
    if (!eventId || initialized.current) return;
    initialized.current = true;

    (async () => {
      const [
        { data: dbTables },
        { data: dbGroups },
        { data: dbGuests },
        { data: dbRelationships },
        { data: dbVenueElements },
      ] = await Promise.all([
        supabase.from('tables').select('*').eq('event_id', eventId),
        supabase.from('groups').select('*').eq('event_id', eventId),
        supabase.from('guests').select('*').eq('event_id', eventId),
        supabase.from('relationships').select('*').eq('event_id', eventId),
        supabase.from('venue_elements').select('*').eq('event_id', eventId),
      ]);

      if (dbGroups?.length) {
        setGroups(dbGroups.map(g => ({
          id: g.id,
          name: g.name,
          color: g.color,
        })));
      }

      if (dbTables?.length) {
        setTables(dbTables.map(t => ({
          id: t.id,
          label: t.label,
          seats: t.seats,
          shape: t.shape,
          x: t.x,
          y: t.y,
          notes: t.notes || '',
          rotation: t.rotation || 0,
        })));
      }

      if (dbGuests?.length) {
        setGuests(dbGuests.map(g => ({
          id: g.id,
          name: g.name,
          party: g.party || '',
          dietary: g.dietary || '',
          notes: g.notes || '',
          groupId: g.group_id || null,
          rsvp: g.rsvp || 'pending',
          meal: g.meal || '',
          tags: g.tags || [],
          role: g.role || '',
          plusOneOf: g.plus_one_of || null,
          tableId: g.table_id || null,
          seatIndex: g.seat_index ?? null,
        })));
      }

      if (dbRelationships?.length) {
        setRelationships(dbRelationships.map(r => ({
          id: r.id,
          guestId1: r.guest_id_1,
          guestId2: r.guest_id_2,
          type: r.type,
        })));
      }

      if (dbVenueElements?.length) {
        setVenueElements(dbVenueElements.map(v => ({
          id: v.id,
          typeId: v.type_id,
          x: v.x,
          y: v.y,
        })));
      }
    })();
  }, [eventId, setGuests, setTables, setGroups, setRelationships, setVenueElements]);

  // Auto-save to Supabase on changes (debounced)
  useEffect(() => {
    if (!eventId || !initialized.current || saving.current) return;

    const timer = setTimeout(async () => {
      saving.current = true;
      try {
        // Upsert all data — delete existing, reinsert
        // Using a simple strategy: replace all rows for this event
        await Promise.all([
          replaceRows('tables', eventId, tables.map(t => ({
            id: t.id,
            event_id: eventId,
            label: t.label,
            seats: t.seats,
            shape: t.shape,
            x: t.x,
            y: t.y,
            notes: t.notes || null,
            rotation: t.rotation || 0,
          }))),
          replaceRows('groups', eventId, groups.map(g => ({
            id: g.id,
            event_id: eventId,
            name: g.name,
            color: g.color,
          }))),
          replaceRows('venue_elements', eventId, venueElements.map(v => ({
            id: v.id,
            event_id: eventId,
            type_id: v.typeId,
            x: v.x,
            y: v.y,
          }))),
        ]);

        // Guests after tables and groups (FK dependencies)
        await replaceRows('guests', eventId, guests.map(g => ({
          id: g.id,
          event_id: eventId,
          name: g.name,
          party: g.party || null,
          dietary: g.dietary || null,
          notes: g.notes || null,
          group_id: g.groupId || null,
          rsvp: g.rsvp || 'pending',
          meal: g.meal || null,
          tags: g.tags || [],
          role: g.role || null,
          plus_one_of: g.plusOneOf || null,
          table_id: g.tableId || null,
          seat_index: g.seatIndex ?? null,
        })));

        // Relationships after guests (FK dependencies)
        await replaceRows('relationships', eventId, relationships.map(r => ({
          id: r.id,
          event_id: eventId,
          guest_id_1: r.guestId1,
          guest_id_2: r.guestId2,
          type: r.type,
        })));

        // Update event timestamp
        await supabase.from('events').update({ updated_at: new Date().toISOString() }).eq('id', eventId);
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        saving.current = false;
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [eventId, guests, tables, groups, relationships, venueElements]);
}

async function replaceRows(table, eventId, rows) {
  // Delete all existing rows for this event, then insert new ones
  await supabase.from(table).delete().eq('event_id', eventId);
  if (rows.length > 0) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) console.error(`Error saving ${table}:`, error);
  }
}
