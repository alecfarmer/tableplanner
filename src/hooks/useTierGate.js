import { useTier } from '../contexts/TierContext';

/**
 * Check if a specific feature/limit is allowed for the current tier.
 *
 * Usage:
 *   const { allowed, limit, upgradeNeeded } = useTierGate('guests', currentCount)
 *   const { allowed } = useTierGate('aiNames')
 */
export function useTierGate(feature, currentCount = 0) {
  const { tier, limits } = useTier();
  const limit = limits[feature];

  // Boolean features (aiNames, csvImport, etc.)
  if (typeof limit === 'boolean') {
    return {
      allowed: limit,
      limit: null,
      current: null,
      upgradeNeeded: !limit,
      tier,
    };
  }

  // Array features (shapes, etc.)
  if (Array.isArray(limit)) {
    return {
      allowed: true,
      limit,
      current: currentCount,
      upgradeNeeded: false,
      tier,
      includes: (value) => limit.includes(value),
    };
  }

  // Numeric limits
  const allowed = limit === Infinity || currentCount < limit;
  return {
    allowed,
    limit: limit === Infinity ? null : limit,
    current: currentCount,
    upgradeNeeded: !allowed,
    tier,
  };
}
