import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) { setEvents([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*, guests(count), tables(count)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setEvents(data.map(e => ({
        ...e,
        guestCount: e.guests?.[0]?.count ?? 0,
        tableCount: e.tables?.[0]?.count ?? 0,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async ({ name, event_type = 'other', date = null }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('events')
      .insert({ user_id: user.id, name, event_type, date })
      .select()
      .single();
    if (error) throw error;
    await fetchEvents();
    return data;
  }, [user, fetchEvents]);

  const updateEvent = useCallback(async (eventId, updates) => {
    const { error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId);
    if (error) throw error;
    await fetchEvents();
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    if (error) throw error;
    await fetchEvents();
  }, [fetchEvents]);

  return { events, loading, createEvent, updateEvent, deleteEvent, refetch: fetchEvents };
}
