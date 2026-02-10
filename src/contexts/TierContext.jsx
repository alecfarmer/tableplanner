import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const TIER_LIMITS = {
  free: {
    events: 1,
    guests: 50,
    tables: 8,
    versions: 1,
    venueElements: 3,
    shapes: ['round'],
    templates: 1,
    aiNames: false,
    csvImport: false,
    pdfExport: false,
    seatingRules: false,
    shareLink: false,
    findMySeat: false,
    autoSeatFull: false,
  },
  plus: {
    events: 5,
    guests: 200,
    tables: 30,
    versions: 5,
    venueElements: Infinity,
    shapes: ['round', 'rectangular'],
    templates: Infinity,
    aiNames: true,
    csvImport: true,
    pdfExport: true,
    seatingRules: true,
    shareLink: true,
    findMySeat: true,
    autoSeatFull: true,
  },
  pro: {
    events: Infinity,
    guests: Infinity,
    tables: Infinity,
    versions: Infinity,
    venueElements: Infinity,
    shapes: ['round', 'rectangular', 'sweetheart'],
    templates: Infinity,
    aiNames: true,
    csvImport: true,
    pdfExport: true,
    seatingRules: true,
    shareLink: true,
    findMySeat: true,
    autoSeatFull: true,
  },
};

const TierContext = createContext(null);

export function TierProvider({ children }) {
  const { user } = useAuth();
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setTier('free');
      return;
    }

    setLoading(true);
    (async () => {
      // Check for active subscription first
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        setTier(sub.tier);
      } else {
        // Fall back to profile tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', user.id)
          .single();
        setTier(profile?.tier || 'free');
      }
      setLoading(false);
    })();
  }, [user]);

  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  return (
    <TierContext.Provider value={{ tier, limits, loading }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (!context) throw new Error('useTier must be used within TierProvider');
  return context;
}
