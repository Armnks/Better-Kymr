import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

interface GoogleContextType {
  isReady: boolean;
  isAuthorized: boolean;
  authorize: () => Promise<void>;
  revoke: () => Promise<void>;
}

const GoogleContext = createContext<GoogleContextType>({
  isReady: false,
  isAuthorized: false,
  authorize: async () => {},
  revoke: async () => {},
});

export const GoogleProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkStatus = async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/google/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthorized(data.isAuthorized);
      }
    } catch (e) {
      console.error("Failed to check Google status", e);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkStatus();
      } else {
        setIsAuthorized(false);
        setIsReady(true);
      }
    });
    
    // Also listen for OAuth popup success message
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "GOOGLE_AUTH_SUCCESS") {
        checkStatus();
      }
    };
    window.addEventListener("message", handleMessage);
    
    return () => {
      unsubscribe();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const authorize = async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) throw new Error("Not logged in");
      const token = await auth.currentUser.getIdToken();
      
      const initRes = await fetch('/api/google/auth/init', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!initRes.ok) {
        throw new Error('Failed to initiate OAuth');
      }
      const { initId } = await initRes.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(`/api/google/auth/start?init=${initId}`, 'GoogleAuth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (e) {
      console.error("Authorization failed", e);
      throw e;
    }
  };

  const revoke = async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      await fetch('/api/google/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsAuthorized(false);
    } catch (e) {
      console.error("Revocation failed", e);
    }
  };

  return (
    <GoogleContext.Provider value={{ isReady, isAuthorized, authorize, revoke }}>
      {children}
    </GoogleContext.Provider>
  );
};

export const useGoogle = () => useContext(GoogleContext);
