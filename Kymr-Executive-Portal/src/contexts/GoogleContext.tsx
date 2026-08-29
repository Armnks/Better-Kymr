import React, { createContext, useContext, useState, useEffect } from 'react';
import { initGoogleWorkspace, requestGoogleAuthorization, isGoogleAuthorized, revokeGoogleToken } from '../lib/google';

interface GoogleContextType {
  isReady: boolean;
  isAuthorized: boolean;
  authorize: () => Promise<void>;
  revoke: () => void;
}

const GoogleContext = createContext<GoogleContextType>({
  isReady: false,
  isAuthorized: false,
  authorize: async () => {},
  revoke: () => {},
});

export const GoogleProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Attempt to load GAPI scripts if not already loaded
    const loadGapi = async () => {
      try {
        await initGoogleWorkspace();
        setIsReady(true);
        setIsAuthorized(isGoogleAuthorized());
      } catch (e) {
        console.error("Failed to initialize Google Workspace", e);
      }
    };
    
    // GAPI scripts are loaded async in index.html, we should wait for them to be available on window
    const checkGapi = setInterval(() => {
      if (window.gapi && window.google) {
        clearInterval(checkGapi);
        loadGapi();
      }
    }, 100);

    return () => clearInterval(checkGapi);
  }, []);

  const authorize = async () => {
    try {
      await requestGoogleAuthorization();
      setIsAuthorized(true);
    } catch (e) {
      console.error("Authorization failed", e);
      throw e;
    }
  };

  const revoke = () => {
    revokeGoogleToken();
    setIsAuthorized(false);
  };

  return (
    <GoogleContext.Provider value={{ isReady, isAuthorized, authorize, revoke }}>
      {children}
    </GoogleContext.Provider>
  );
};

export const useGoogle = () => useContext(GoogleContext);
