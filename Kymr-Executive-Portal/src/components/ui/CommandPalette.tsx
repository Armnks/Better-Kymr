import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Inbox, X, Mail, HardDrive, Calendar, Phone, CheckSquare, MessageSquare, ArrowRight, Briefcase, Receipt, Plus, GitMerge } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmail } from '../../contexts/EmailContext';
import { api } from '../../lib/db';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { openComposer } = useEmail();

  // Search Results State
  const [clients, setClients] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadData();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  async function loadData() {
    setLoading(true);
    try {
      const [cls, inqs, projs, qs] = await Promise.all([
        api.getClients(),
        api.getInquiries(),
        api.getProjects(),
        api.getQuotes()
      ]);
      setClients(cls || []);
      setInquiries(inqs || []);
      setProjects(projs || []);
      setQuotes(qs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (actionStr: string) => {
    // Basic natural language parsing for quick capture
    const lower = actionStr.toLowerCase();
    
    if (lower.startsWith('task ') || lower.startsWith('todo ')) {
       // navigate to tasks with prefill (or we could just create it directly, but let's prefill)
       const title = actionStr.replace(/^(task|todo)\s+/i, '');
       navigate(`/admin/tasks?create=true&title=${encodeURIComponent(title)}`);
       onClose();
       return true;
    }
    
    if (lower.startsWith('call ') || lower.startsWith('meet ')) {
       const title = actionStr;
       navigate(`/admin/meetings?create=true&title=${encodeURIComponent(title)}`);
       onClose();
       return true;
    }

    if (lower.startsWith('note ')) {
       const text = actionStr.replace(/^note\s+/i, '');
       // Since we don't have a global notes feature yet, maybe we send to tasks or a global capture
       navigate(`/admin/tasks?create=true&title=${encodeURIComponent('Note: ' + text)}`);
       onClose();
       return true;
    }

    return false;
  };

  const executeAndClose = (action: () => void) => {
    action();
    onClose();
  };

  const isQuickCapture = /^(task|todo|call|meet|note)\b/i.test(query);

  const baseCommands = [
    { id: 'compose_email', label: 'Compose Email', icon: Mail, action: () => executeAndClose(() => openComposer()) },
    { id: 'new_meeting', label: 'Schedule Meeting', icon: Calendar, action: () => executeAndClose(() => navigate('/admin/meetings?create=true')) },
    { id: 'new_quote', label: 'Create Quote', icon: FileText, action: () => executeAndClose(() => navigate('/admin/quotes?create=true')) },
    { id: 'inquiries', label: 'Go to Inquiries', icon: Inbox, action: () => executeAndClose(() => navigate('/admin/inquiries')) },
    { id: 'clients', label: 'Go to Clients', icon: Users, action: () => executeAndClose(() => navigate('/admin/clients')) },
    { id: 'pipeline', label: 'Go to Pipeline', icon: GitMerge, action: () => executeAndClose(() => navigate('/admin/pipeline')) },
  ];

  // Universal Search Logic
  const q = query.toLowerCase();
  
  const searchResults: any[] = [];
  
  if (q && !isQuickCapture) {
    clients.filter(c => c.name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)).slice(0, 3).forEach(c => {
      searchResults.push({ id: `c_${c.id}`, label: c.name + (c.company ? ` (${c.company})` : ''), type: 'Client', icon: Users, action: () => executeAndClose(() => navigate(`/admin/clients/${c.id}`)) });
    });
    
    inquiries.filter(i => i.name?.toLowerCase().includes(q) || i.company?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q)).slice(0, 3).forEach(i => {
      searchResults.push({ id: `i_${i.id}`, label: i.name + (i.company ? ` (${i.company})` : ''), type: 'Inquiry', icon: Inbox, action: () => executeAndClose(() => navigate(`/admin/inquiries/${i.id}`)) });
    });

    projects.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 3).forEach(p => {
      searchResults.push({ id: `p_${p.id}`, label: p.name, type: 'Project', icon: Briefcase, action: () => executeAndClose(() => navigate(`/admin/projects`)) });
    });
    
    quotes.filter(qObj => qObj.quoteNumber?.toLowerCase().includes(q) || qObj.projectName?.toLowerCase().includes(q)).slice(0, 3).forEach(qObj => {
      searchResults.push({ id: `q_${qObj.id}`, label: `${qObj.quoteNumber} - ${qObj.projectName || 'Quote'}`, type: 'Quote', icon: Receipt, action: () => executeAndClose(() => navigate(`/admin/quotes`)) });
    });
  }

  const quickCaptureCommand = isQuickCapture ? [{
    id: 'quick_capture',
    label: `Create: "${query}"`,
    type: 'Quick Capture',
    icon: Plus,
    action: () => handleAction(query)
  }] : [];

  const externalSearchCommands = (q && !isQuickCapture) ? [
    { id: 'search_email', label: `Search Workspace Emails for "${query}"`, icon: Mail, type: 'External', action: () => executeAndClose(() => navigate(`/admin/inbox?q=${encodeURIComponent(query)}`)) },
    { id: 'search_drive', label: `Search Google Drive for "${query}"`, icon: HardDrive, type: 'External', action: () => executeAndClose(() => navigate(`/admin/files?q=${encodeURIComponent(query)}`)) },
  ] : [];

  const filteredBase = q && !isQuickCapture
    ? baseCommands.filter(c => c.label.toLowerCase().includes(q))
    : (q ? [] : baseCommands);
    
  const allItems = [...quickCaptureCommand, ...searchResults, ...externalSearchCommands, ...filteredBase];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm" 
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-brand-charcoal border border-brand-border shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center px-4 py-4 border-b border-brand-border bg-brand-black">
            <Search className="w-5 h-5 text-brand-accent mr-3 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search everywhere, or type 'task', 'call', 'note' to quick capture..."
              className="flex-1 bg-transparent border-none outline-none text-brand-ivory font-sans text-lg placeholder:text-brand-muted placeholder:font-mono placeholder:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && allItems.length > 0) {
                  allItems[0].action();
                }
              }}
            />
            {query && (
               <button onClick={() => setQuery('')} className="text-brand-muted hover:text-brand-ivory mr-2">
                 <X className="w-4 h-4" />
               </button>
            )}
            <div className="text-[9px] font-mono uppercase tracking-widest text-brand-muted-dark border border-brand-border px-2 py-1 bg-brand-surface-highlight">
              CMD+K
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-2 bg-brand-charcoal">
            {loading && query && (
               <div className="p-4 text-center text-xs font-mono text-brand-muted uppercase tracking-widest animate-pulse">
                 Searching...
               </div>
            )}
            {!loading && allItems.length === 0 && (
              <div className="p-8 text-center text-sm font-mono text-brand-muted uppercase tracking-widest">
                No results found.
              </div>
            )}
            
            {allItems.map((item, index) => (
              <button
                key={item.id}
                onClick={item.action}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors rounded-sm mb-1 group",
                  index === 0 ? "bg-brand-accent text-black font-bold" : "text-brand-muted hover:bg-brand-surface-highlight hover:text-brand-ivory"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-4 h-4", index === 0 ? "text-black" : "text-brand-muted group-hover:text-brand-ivory")} />
                  <span className="font-sans text-[15px]">{item.label}</span>
                </div>
                {item.type && (
                  <span className={cn(
                    "text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm",
                    index === 0 ? "bg-black/10 text-black border border-black/20" : "bg-brand-black text-brand-muted-dark border border-brand-border"
                  )}>
                    {item.type}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-brand-border p-3 bg-brand-black flex items-center gap-4 text-[10px] font-mono text-brand-muted uppercase tracking-widest">
            <span><kbd className="font-sans font-bold mr-1">↑↓</kbd> Navigate</span>
            <span><kbd className="font-sans font-bold mr-1">↵</kbd> Select</span>
            <span><kbd className="font-sans font-bold mr-1">ESC</kbd> Close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

