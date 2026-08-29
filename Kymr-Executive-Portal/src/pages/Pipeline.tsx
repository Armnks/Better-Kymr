import React, { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { Inquiry, InquiryStatus, Quote, ActivityEvent } from '../types';
import { Badge, Button } from '../components/ui/DesignSystem';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MessageSquare, Phone, FileText, Check, X, ArrowRight, XCircle, Download, AlertTriangle } from 'lucide-react';
import { createSpreadsheet } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';
import { format } from 'date-fns';

const STAGES: { id: InquiryStatus; label: string; description: string }[] = [
  { id: 'NEW', label: 'NEW', description: 'Just came in. Needs review.' },
  { id: 'QUALIFIED', label: 'QUALIFIED', description: 'Worth pursuing.' },
  { id: 'CONTACTED', label: 'CONTACTED', description: 'We have reached out.' },
  { id: 'MEETING', label: 'MEETING', description: 'A conversation is scheduled or happening.' },
  { id: 'QUOTED', label: 'QUOTED', description: 'Pricing/proposal sent.' },
  { id: 'WON', label: 'WON', description: 'They became a client.' },
];

export default function Pipeline() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const navigate = useNavigate();
  const { isAuthorized } = useGoogle();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [inqData, quoteData, actData] = await Promise.all([
      api.getInquiries(),
      api.getQuotes(),
      api.getRecentActivity()
    ]);
    setInquiries(inqData ? inqData.filter(i => i.status !== 'LOST') : []);
    setQuotes(quoteData || []);
    setActivity(actData || []);
    setLoading(false);
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('inquiryId', id);
  };

  const handleDrop = async (e: React.DragEvent, status: InquiryStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('inquiryId');
    if (id) {
      await changeStatus(id, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const changeStatus = async (id: string, status: InquiryStatus) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry(prev => prev ? { ...prev, status } : null);
    }
    await api.updateInquiry(id, { status });
    await api.logActivity({
      actorId: 'admin',
      entityType: 'Inquiry',
      entityId: id,
      type: 'STATUS_CHANGE',
      description: `Moved opportunity to ${status}`
    });
  };

  const getNextBestAction = (inq: Inquiry) => {
    switch (inq.status) {
      case 'NEW': return { label: 'Review Inquiry', icon: Clock };
      case 'QUALIFIED': return { label: 'Contact Inquiry', icon: MessageSquare };
      case 'CONTACTED': return { label: 'Schedule Call', icon: Phone };
      case 'MEETING': return { label: 'Create Quote', icon: FileText };
      case 'QUOTED': return { label: 'Follow Up', icon: MessageSquare };
      case 'WON': return { label: 'Start Project', icon: Check };
      default: return null;
    }
  };

  const timeSince = (date: Date) => {
    const hours = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const isStale = (inq: Inquiry) => {
    const hours = Math.floor((new Date().getTime() - new Date(inq.updatedAt).getTime()) / (1000 * 60 * 60));
    if (inq.status === 'NEW' && hours > 24) return true;
    if (inq.status === 'QUALIFIED' && hours > 48) return true;
    if (inq.status === 'CONTACTED' && hours > 72) return true;
    if (inq.status === 'QUOTED' && hours > 120) return true; // 5 days
    return false;
  };

  const handleExport = async () => {
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to export to Sheets.");
      return;
    }
    setExporting(true);
    try {
      const data = [
        ['ID', 'Contact Name', 'Company', 'Email', 'Phone', 'Service Interest', 'Status', 'Priority', 'Received Date'],
        ...inquiries.map(i => [
          i.id || '',
          i.name,
          i.company || '',
          i.email || '',
          i.phone || '',
          i.serviceInterest || '',
          i.status,
          i.priority || '',
          format(i.createdAt, 'yyyy-MM-dd')
        ])
      ];
      const sheet = await createSpreadsheet(`Pipeline Export - ${format(new Date(), 'yyyy-MM-dd')}`, data);
      window.open(sheet.spreadsheetUrl, '_blank');
    } catch (e) {
      console.error(e);
      alert("Failed to export to Sheets");
    } finally {
      setExporting(false);
    }
  };

  // Calculate Pipeline Value
  const valueByCurrency: Record<string, number> = {};
  inquiries.forEach(inq => {
    // Only count active pipeline (not WON/LOST)
    if (inq.status !== 'WON' && inq.status !== 'LOST') {
      const relatedQuote = quotes.find(q => q.inquiryId === inq.id && q.status !== 'VOID' && q.status !== 'REJECTED');
      if (relatedQuote) {
        valueByCurrency[relatedQuote.currency] = (valueByCurrency[relatedQuote.currency] || 0) + relatedQuote.total;
      }
    }
  });

  if (loading) {
    return <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse">Scanning Pipeline...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 shrink-0 border-b border-brand-border pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest text-brand-ivory mb-2">Sales Pipeline</h1>
          <p className="font-mono text-[11px] text-brand-muted uppercase tracking-[0.1em] max-w-2xl leading-relaxed mb-4">
            Potential clients move from first contact to Won or Lost.
          </p>
          {Object.keys(valueByCurrency).length > 0 && (
            <div className="flex gap-4 items-center mt-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Active Pipeline Value:</span>
              {Object.entries(valueByCurrency).map(([cur, val]) => (
                <Badge key={cur} variant="default" className="text-xs font-sans text-brand-ivory border-brand-border bg-brand-surface font-bold">
                  {val.toLocaleString()} {cur}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/inquiries?filter=lost')} className="text-brand-muted hover:text-brand-ivory text-xs h-8">
            View Lost
          </Button>
          <Button icon={Download} variant="outline" onClick={handleExport} disabled={exporting} className="text-xs h-8">
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x relative">
        {STAGES.map(stage => {
          const columnInquiries = inquiries.filter(i => i.status === stage.id);
          return (
            <div 
              key={stage.id} 
              className="flex-shrink-0 w-80 flex flex-col snap-start bg-brand-charcoal border-t border-brand-border"
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
            >
              <div className="p-3 mb-2 group">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-sans text-xs font-bold text-brand-ivory">{stage.label}</h3>
                  <span className="font-mono text-[10px] text-brand-muted">{columnInquiries.length}</span>
                </div>
                <p className="font-mono text-[9px] text-brand-muted-dark uppercase tracking-widest">{stage.description}</p>
              </div>
              
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-2 pb-2">
                {columnInquiries.length === 0 ? (
                  <div className="p-4 border border-dashed border-brand-border text-center">
                    <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest leading-relaxed">
                      Empty
                    </p>
                  </div>
                ) : (
                  columnInquiries.map((inq, i) => {
                    const action = getNextBestAction(inq);
                    const stale = isStale(inq);
                    const q = quotes.find(q => q.inquiryId === inq.id && q.status !== 'REJECTED' && q.status !== 'VOID');
                    
                    return (
                      <motion.div
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, inq.id!)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`bg-brand-surface border p-3 cursor-grab active:cursor-grabbing flex flex-col gap-2 shadow-sm transition-colors ${stale ? 'border-brand-accent-red hover:border-red-500' : 'border-brand-border hover:border-brand-accent'}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-sans text-sm font-bold text-brand-ivory truncate pr-2">{inq.company || inq.name}</span>
                          {stale && <AlertTriangle className="w-3.5 h-3.5 text-brand-accent-red shrink-0" title="Stale Opportunity" />}
                        </div>
                        
                        <div className="font-mono text-[10px] text-brand-muted uppercase truncate">
                          {inq.serviceInterest || 'General'}
                        </div>

                        {q && (
                          <div className="font-sans text-xs font-bold text-brand-ivory mt-1">
                            {q.total.toLocaleString()} {q.currency}
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-brand-border/50 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-brand-muted-dark">
                            <span>Last Act: {timeSince(inq.updatedAt)} ago</span>
                          </div>
                          {action && (
                            <div className="flex items-center gap-1.5 text-brand-accent text-[9px] font-mono uppercase tracking-widest">
                              NEXT: {action.label} <ArrowRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK DRAWER */}
      <AnimatePresence>
        {selectedInquiry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedInquiry(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-brand-charcoal border-l border-brand-border z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-highlight">
                <div>
                  <h2 className="text-xl font-sans font-bold text-brand-ivory mb-1">{selectedInquiry.company || selectedInquiry.name}</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{selectedInquiry.name} • {selectedInquiry.email}</p>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="text-brand-muted hover:text-brand-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* ACTIONS */}
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => navigate(`/admin/meetings?create=true&inquiryId=${selectedInquiry.id}`)} className="text-[10px] h-8" icon={Phone}>Create Call</Button>
                    <Button variant="outline" onClick={() => navigate(`/admin/quotes?create=true&inquiryId=${selectedInquiry.id}`)} className="text-[10px] h-8" icon={FileText}>Create Quote</Button>
                    <Button variant="primary" onClick={() => navigate(`/admin/inquiries/${selectedInquiry.id}`)} className="text-[10px] h-8 col-span-2">Open Full Record</Button>
                  </div>
                </section>

                {/* MOVE TO */}
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Move To</h3>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map(s => (
                      <button
                        key={s.id}
                        disabled={selectedInquiry.status === s.id}
                        onClick={() => changeStatus(selectedInquiry.id!, s.id)}
                        className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest border transition-colors ${
                          selectedInquiry.status === s.id 
                            ? 'bg-brand-accent text-black border-brand-accent cursor-default' 
                            : 'border-brand-border text-brand-muted hover:text-brand-ivory hover:border-brand-ivory'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-brand-border/50">
                    <button
                      onClick={() => { changeStatus(selectedInquiry.id!, 'LOST'); setSelectedInquiry(null); }}
                      className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-muted hover:text-brand-accent-red transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Mark as Lost
                    </button>
                  </div>
                </section>
                
                {/* DETAILS */}
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Details</h3>
                  <div className="bg-brand-surface border border-brand-border p-4 space-y-4">
                    <div>
                      <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-1">Service Interest</div>
                      <div className="text-sm font-sans text-brand-ivory">{selectedInquiry.serviceInterest || 'Not specified'}</div>
                    </div>
                    {selectedInquiry.budgetRange && (
                      <div>
                        <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-1">Budget Range</div>
                        <div className="text-sm font-sans text-brand-ivory">{selectedInquiry.budgetRange}</div>
                      </div>
                    )}
                    {selectedInquiry.message && (
                      <div>
                        <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-1">Message</div>
                        <p className="text-sm font-sans text-brand-ivory whitespace-pre-wrap">{selectedInquiry.message}</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
