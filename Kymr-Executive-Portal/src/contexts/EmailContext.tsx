import React, { createContext, useContext, useState } from 'react';
import { EmailComposer } from '../components/EmailComposer';

interface EmailOptions {
  to?: string;
  subject?: string;
  body?: string;
  onSuccess?: () => void;
}

interface EmailContextType {
  openComposer: (options?: EmailOptions) => void;
  closeComposer: () => void;
}

const EmailContext = createContext<EmailContextType>({
  openComposer: () => {},
  closeComposer: () => {},
});

export const EmailProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [composerProps, setComposerProps] = useState<EmailOptions>({});

  const openComposer = (options?: EmailOptions) => {
    setComposerProps(options || {});
    setIsOpen(true);
  };

  const closeComposer = () => {
    setIsOpen(false);
  };

  return (
    <EmailContext.Provider value={{ openComposer, closeComposer }}>
      {children}
      <EmailComposer 
        isOpen={isOpen} 
        onClose={closeComposer} 
        defaultTo={composerProps.to}
        defaultSubject={composerProps.subject}
        defaultBody={composerProps.body}
        onSuccess={composerProps.onSuccess}
      />
    </EmailContext.Provider>
  );
};

export const useEmail = () => useContext(EmailContext);
