/**
 * Development flags — set all to false before shipping.
 *
 * These exist to make feature validation faster during development.
 * They have no effect in production if removed; they are purely local dev aids.
 */

/**
 * When true, the recurring suggestion banner ignores dismissal state and always
 * shows the first available candidate.
 *
 * Use this to validate the suggestion UI flow without waiting for a real month
 * to pass or needing to refresh after dismissing all candidates.
 *
 * To test the dismiss/approve flow normally: set to false.
 */
export const DEV_FORCE_SHOW_RECURRING_SUGGESTION = true;
