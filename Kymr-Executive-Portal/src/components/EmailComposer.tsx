import React, { useState } from 'react';
import { Mail, X, Send } from 'lucide-react';
import { Button } from './ui/DesignSystem';
import { sendEmail } from '../lib/google';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  onSuccess?: () => void;
}

export function EmailComposer({ isOpen, onClose, defaultTo = '', defaultSubject = '', defaultBody = '', onSuccess }: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string>('idle');

  // Reset internal state when defaults change or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTo(defaultTo);
      setSubject(defaultSubject);
      setBody(defaultBody);
      setStatus('idle');
    }
  }, [isOpen, defaultTo, defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!to || !subject || !body) return;
    setIsSending(true);
    setStatus('idle');
    try {
      await sendEmail(to, subject, body);
      setStatus('success');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setBody('');
        setSubject('');
        setTo('');
      }, 1500);
    } catch (e: any) {
      console.error(e);
      let errorMsg = 'MESSAGE FAILED TO SEND';
      if (e?.result?.error?.message) {
        errorMsg = e.result.error.message.toUpperCase();
      } else if (e.message) {
        if (e.message === 'Not authorized') errorMsg = 'WORKSPACE DISCONNECTED';
        else errorMsg = e.message.toUpperCase();
      }
      
      // If we see insufficient permissions or auth errors
      if (errorMsg.includes('PERMISSION') || errorMsg.includes('INSUFFICIENT')) {
        errorMsg = 'PERMISSION REQUIRED - RECONNECT WORKSPACE';
      }
      
      setStatus(errorMsg as any);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-black border border-brand-border w-full max-w-2xl shadow-2xl flex flex-col h-[600px] max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <div className="flex items-center gap-2 text-brand-ivory font-mono uppercase tracking-widest text-xs">
            <Mail className="w-4 h-4 text-brand-accent" />
            Compose Message
          </div>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ivory transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-4 border-b border-brand-border space-y-3">
          <div className="flex items-center gap-4">
            <label className="w-12 text-xs font-mono text-brand-muted tracking-widest uppercase">To:</label>
            <input 
              type="email" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              className="flex-1 bg-transparent border-none text-brand-ivory text-sm focus:outline-none" 
              placeholder="recipient@example.com"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-12 text-xs font-mono text-brand-muted tracking-widest uppercase">Subj:</label>
            <input 
              type="text" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              className="flex-1 bg-transparent border-none text-brand-ivory font-display text-lg focus:outline-none placeholder:text-brand-muted-dark" 
              placeholder="Message subject..."
            />
          </div>
        </div>

        {/* Body Editor */}
        <div className="flex-1 p-4 flex flex-col">
          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 w-full bg-transparent border-none text-brand-ivory text-sm resize-none focus:outline-none leading-relaxed"
            placeholder="Write your message here..."
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border flex items-center justify-between bg-brand-surface">
          <div>
            {status === 'success' && <span className="text-xs text-brand-accent font-mono uppercase">Sent successfully</span>}
            {status !== 'idle' && status !== 'success' && <span className="text-xs text-red-500 font-mono uppercase">{status}</span>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSending}>Discard</Button>
            <Button variant="primary" icon={Send} onClick={handleSend} disabled={isSending || !to || !subject || !body}>
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
