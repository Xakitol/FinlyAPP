import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export async function signInWithGoogle(): Promise<string | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fullName = result.user.displayName ?? '';
    const firstName = fullName.split(' ')[0] ?? '';
    localStorage.setItem('finly_user_name', firstName);
    return firstName;
  } catch (err) {
    console.error('[authGoogle] signInWithPopup failed:', err);
    return null;
  }
}
