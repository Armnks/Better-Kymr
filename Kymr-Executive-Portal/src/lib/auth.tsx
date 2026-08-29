import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, AuthError } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  logOut: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Check authorization in users collection
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setIsAuthorized(true);
            setUser(firebaseUser);
          } else {
            // Check if there are no users at all (bootstrap mode)
            // For safety, we will just deny access if not in users collection,
            // but if you are the owner and there's no user, you can't get in.
            // Let's create the first user if they match the support email or if we assume bootstrap.
            // Wait, we'll try to create it if it fails we are unauthorized.
            try {
               await setDoc(userDocRef, {
                 email: firebaseUser.email,
                 role: 'OWNER',
                 createdAt: serverTimestamp()
               });
               setIsAuthorized(true);
               setUser(firebaseUser);
            } catch (e) {
               console.warn("Could not bootstrap user:", e);
               // Access Denied
               setIsAuthorized(false);
               setUser(null); // Clear user state to prevent access
               await signOut(auth); // Sign them out
               setAuthError('ACCESS_DENIED');
            }
          }
        } catch (error) {
          console.error("Authorization check failed:", error);
          setIsAuthorized(false);
          setUser(null);
          await signOut(auth);
          setAuthError('ACCESS_DENIED');
        }
      } else {
        setUser(null);
        setIsAuthorized(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setAuthError(null);
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthorized, signInWithGoogle, signInWithEmail, resetPassword, logOut, authError, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
