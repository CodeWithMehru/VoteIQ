/**
 * VoteIQ Application Constants
 * Prevents magic numbers and ensures consistency across metrics.
 */
export const APP_CONSTANTS = {
  EVM_RESET_TIMEOUT_MS: 4000,
  MAX_VOTER_NAME_LENGTH: 50,
  MAX_VOTER_ID_LENGTH: 20,
  CACHE_CONTROL_SWR: 'public, s-maxage=3600, stale-while-revalidate=86400',
  WCAG_CONTRAST_RATIO_TARGET: 7.1,
} as const;
