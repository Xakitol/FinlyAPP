/**
 * Apple auth — local simulation.
 * Simulates a successful sign-in as matan6310081@walla.com after a short delay.
 * Replace the body of signInWithApple() with a real Sign In with Apple call when ready.
 */

export interface AppleAuthResult {
  success: boolean;
  email?: string;
  identityToken?: string;    // placeholder for real token when backend is added
  authorizationCode?: string;
  user?: {
    email?: string;
    name?: { firstName?: string; lastName?: string };
  };
  error?: string;
}

export async function signInWithApple(): Promise<AppleAuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    email: 'matan6310081@walla.com',
    user: { email: 'matan6310081@walla.com' },
  };
}
