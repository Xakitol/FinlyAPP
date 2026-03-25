/**
 * Google auth — local simulation.
 * Simulates a successful sign-in as matantoledanoo631@gmail.com after a short delay.
 * Replace the body of signInWithGoogle() with a real OAuth call when ready.
 */

export interface GoogleAuthResult {
  success: boolean;
  email?: string;
  credential?: string; // placeholder for real JWT when backend is added
  error?: string;
}

export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    email: 'matantoledanoo631@gmail.com',
  };
}

export function cancelGoogleSignIn() {
  // no-op in simulation
}
