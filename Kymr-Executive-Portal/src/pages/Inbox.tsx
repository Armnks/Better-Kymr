import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/DesignSystem';
import { Search, Mail, ExternalLink, RefreshCw, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/DesignSystem';
import { useGoogle } from '../contexts/GoogleContext';
import { searchEmails } from '../lib/google';
import { useEmail } from '../contexts/EmailContext';
import { useSearchParams } from 'react-router-dom';

export function Inbox() {
  const { isAuthorized } = useGoogle();
  const { openComposer } = useEmail();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    if (isAuthorized) {
      fetchEmails(searchQuery);
    }
  }, [isAuthorized, searchParams]);

  const fetchEmails = async (query: string) => {
    setLoading(true);
    try {
      // Default query to standard inbox if empty
      const q = query ? query : 'in:inbox';
      const results = await searchEmails(q, 20);
      setEmails(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails(searchQuery);
  };

  const getHeader = (headers: any[], name: string) => {
    return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted">
          <Mail className="w-6 h-6" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-xl font-display">Inbox Not Connected</h1>
          <p className="text-sm text-brand-muted">
            Connect Google Workspace to securely access your business email directly within the Executive Portal.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/admin/settings/integrations'} variant="primary">
          Configure Integrations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display tracking-wide mb-1">Inbox</h1>
          <p className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">
            Gmail Secure Sync
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..." 
              className="bg-brand-charcoal border border-brand-border pl-9 pr-3 py-2 text-xs font-mono text-brand-ivory placeholder:text-brand-muted focus:outline-none focus:border-brand-accent w-64 transition-colors"
            />
          </form>
          <Button icon={Send} onClick={() => openComposer()}>Compose</Button>
        </div>
      </div>

      <div className="flex-1 bg-brand-surface border border-brand-border overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center py-20">
            <RefreshCw className="w-5 h-5 text-brand-muted animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center border-b border-brand-border border-dashed">
            <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">No emails found</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-brand-border">
            {emails.map((email, i) => {
              const headers = email.payload?.headers || [];
              const from = getHeader(headers, 'From');
              const subject = getHeader(headers, 'Subject') || '(No Subject)';
              const date = getHeader(headers, 'Date');
              const snippet = email.snippet || '';
              
              // Clean up "From" name
              const fromName = from.split('<')[0].replace(/"/g, '').trim() || from;

              return (
                <div key={i} className="p-4 hover:bg-brand-charcoal transition-colors cursor-pointer group flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-sans text-sm font-bold text-brand-ivory truncate">{fromName}</span>
                      <span className="text-[10px] text-brand-muted font-mono">{new Date(date).toLocaleDateString()}</span>
                    </div>
                    <div className="font-sans text-sm text-brand-ivory mb-1 truncate group-hover:text-brand-accent transition-colors">
                      {subject}
                    </div>
                    <div className="text-xs text-brand-muted truncate">
                      {snippet}
                    </div>
                  </div>
                  <a 
                    href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-brand-muted hover:text-brand-ivory"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
