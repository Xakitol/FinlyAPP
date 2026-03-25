import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebase';

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; code: string }> {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (err) {
    console.error('[authEmail] signup failed:', err);
    const code = err instanceof FirebaseError ? err.code : 'unknown';
    return { ok: false, code };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<boolean> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (err) {
    console.error('[authEmail] login failed:', err);
    return false;
  }
}
