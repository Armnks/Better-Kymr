import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/db';
import { Invoice, Client, Project } from '../types';
import { FileText, Plus, X, Download, ArrowRight, CheckCircle, Clock, Mail } from 'lucide-react';
import { Button, Badge } from '../components/ui/DesignSystem';
import { useEmail } from '../contexts/EmailContext';
import { createSpreadsheet } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';
import { format } from 'date-fns';

export default function Invoices() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openComposer } = useEmail();
  const { isAuthorized } = useGoogle();
  const highlightId = searchParams.get('id');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (highlightId && invoices.length > 0) {
      const inv = invoices.find(x => x.id === highlightId);
      if (inv) setSelectedInvoice(inv);
    }
  }, [highlightId, invoices]);

  async function load() {
    setLoading(true);
    const [iData, cData, pData] = await Promise.all([
      api.getInvoices(),
      api.getClients(),
      api.getProjects()
    ]);
    setInvoices(iData || []);
    setClients(cData || []);
    setProjects(pData || []);
    setLoading(false);
  }

  const updateStatus = async (inv: Invoice, status: Invoice['status']) => {
    await api.updateInvoice(inv.id!, { status });
    setInvoices(prev => prev.map(x => x.id === inv.id ? { ...x, status } : x));
    if (selectedInvoice?.id === inv.id) {
      setSelectedInvoice({ ...selectedInvoice, status });
    }
  };

  const handleSendInvoiceEmail = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    const project = projects.find(p => p.id === inv.projectId);
    
    openComposer({
      to: client?.email || '',
      subject: `Invoice from KYMRSTUDIO${project ? ` - ${project.name}` : ''}`,
      body: `Hi ${client?.primaryContact || 'there'},\n\nPlease find your invoice attached.\n\nAmount Due: $${inv.total.toLocaleString()} ${inv.currency}\nDue Date: ${inv.dueDate?.toLocaleDateString()}\n\nYou can pay directly via the link in the invoice.\n\nBest,\nKYMRSTUDIO`,
      onSuccess: () => {
        updateStatus(inv, 'SENT');
      }
    });
  };

  const handleExport = async () => {
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to export to Sheets.");
      return;
    }
    setExporting(true);
    try {
      const data = [
        ['ID', 'Project Name', 'Client Name', 'Status', 'Amount', 'Currency', 'Issue Date', 'Due Date'],
        ...invoices.map(inv => {
          const client = clients.find(c => c.id === inv.clientId);
          const project = projects.find(p => p.id === inv.projectId);
          return [
            inv.id || '',
            project?.name || 'Manual Invoice',
            client?.company || client?.name || '',
            inv.status,
            inv.total.toString(),
            inv.currency,
            format(inv.createdAt, 'yyyy-MM-dd'),
            inv.dueDate ? format(inv.dueDate, 'yyyy-MM-dd') : ''
          ];
        })
      ];
      const sheet = await createSpreadsheet(`Invoices Export - ${format(new Date(), 'yyyy-MM-dd')}`, data);
      window.open(sheet.spreadsheetUrl, '_blank');
    } catch (e) {
      console.error(e);
      alert("Failed to export to Sheets");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">Invoices</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Billing & Payments</p>
        </div>
        <Button icon={Download} variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {loading ? (
        <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse">Loading Invoices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.length === 0 ? (
            <div className="col-span-full border border-dashed border-brand-border p-12 text-center bg-brand-surface max-w-2xl mx-auto w-full">
              <FileText className="w-8 h-8 text-brand-muted mx-auto mb-4" />
              <h3 className="font-sans font-bold text-brand-ivory text-lg mb-2">No Invoices</h3>
              <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest leading-relaxed mb-6">
                Invoices are generated from Projects.
              </p>
              <Button onClick={() => navigate('/admin/projects')} variant="outline">Go to Projects</Button>
            </div>
          ) : (
            invoices.map(inv => {
              const client = clients.find(c => c.id === inv.clientId);
              const project = projects.find(p => p.id === inv.projectId);
              return (
                <div key={inv.id} onClick={() => setSelectedInvoice(inv)} className="group bg-brand-surface border border-brand-border p-5 hover:border-brand-accent cursor-pointer transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'SENT' ? 'info' : inv.status === 'OVERDUE' ? 'danger' : 'default'}>{inv.status}</Badge>
                      <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest">{inv.createdAt.toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-brand-ivory group-hover:text-brand-accent transition-colors mb-1">
                      {project?.name || 'Manual Invoice'}
                    </h3>
                    <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-4">
                      {client?.company || client?.name || 'Unknown Client'}
                    </div>
                  </div>
                  
                    <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                      <span className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">Total</span>
                      <span className="font-sans font-bold text-brand-ivory">${(inv.total || 0).toLocaleString()} {inv.currency || 'USD'}</span>
                    </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* INVOICE DRAWER */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedInvoice(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-brand-charcoal border-l border-brand-border z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-highlight shrink-0">
                <div>
                  <h2 className="text-xl font-sans font-bold text-brand-ivory mb-1">Invoice Details</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">ID: {selectedInvoice.id}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="text-brand-muted hover:text-brand-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                
                {/* PREVIEW */}
                <div className="bg-brand-ivory text-brand-black p-8 shadow-sm">
                  <div className="flex justify-between items-start mb-12 border-b border-brand-border-light pb-6">
                    <div>
                      <h1 className="text-2xl font-display font-bold italic tracking-tighter leading-none mb-1">KYMRSTUDIO</h1>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted-dark">INVOICE</p>
                    </div>
                    <div className="text-right">
                      <h2 className="font-sans font-bold text-lg">Amount Due</h2>
                      <p className="font-sans font-bold text-xl text-brand-accent mt-1">${(selectedInvoice.total || 0).toLocaleString()} {selectedInvoice.currency || 'USD'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted-dark mb-2">Billed To:</h3>
                      <p className="font-sans font-bold">{clients.find(c => c.id === selectedInvoice.clientId)?.company || 'Client Name'}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted-dark mb-2">Issue Date:</h3>
                      <p className="font-sans font-bold text-sm">{selectedInvoice.createdAt.toLocaleDateString()}</p>
                      <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted-dark mb-2 mt-4">Due Date:</h3>
                      <p className="font-sans font-bold text-sm">{selectedInvoice.dueDate?.toLocaleDateString() || selectedInvoice.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <table className="w-full text-sm font-sans mb-8">
                    <thead>
                      <tr className="border-b-2 border-brand-border-light">
                        <th className="text-left py-2 font-mono text-[9px] uppercase tracking-widest text-brand-muted-dark">Description</th>
                        <th className="text-right py-2 font-mono text-[9px] uppercase tracking-widest text-brand-muted-dark">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.length > 0 ? (
                        selectedInvoice.items.map((item, i) => (
                          <tr key={i} className="border-b border-brand-border-light/50">
                            <td className="py-3 font-medium">{item.name}</td>
                            <td className="py-3 text-right">${((item.quantity || 1) * (item.rate || 0)).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-brand-border-light/50">
                          <td className="py-3 font-medium">Project Delivery: {projects.find(p => p.id === selectedInvoice.projectId)?.name || 'Custom Work'}</td>
                          <td className="py-3 text-right">${(selectedInvoice.total || 0).toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between font-bold text-base pt-2 border-t-2 border-brand-border-light">
                        <span>Total Due</span>
                        <span>${(selectedInvoice.total || 0).toLocaleString()} {selectedInvoice.currency || 'USD'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="p-6 border-t border-brand-border bg-brand-charcoal flex gap-2 shrink-0">
                {selectedInvoice.status === 'DRAFT' && (
                  <Button variant="primary" onClick={() => handleSendInvoiceEmail(selectedInvoice)} icon={Mail} className="flex-1">Send Invoice</Button>
                )}
                {(selectedInvoice.status === 'SENT' || selectedInvoice.status === 'OVERDUE') && (
                  <Button variant="success" onClick={() => updateStatus(selectedInvoice, 'PAID')} icon={CheckCircle} className="flex-1">Mark Paid</Button>
                )}
                {selectedInvoice.status === 'PAID' && (
                  <div className="flex-1 text-center font-mono text-xs uppercase tracking-widest text-brand-accent p-2 border border-brand-accent">
                    Invoice Paid in Full
                  </div>
                )}
                {selectedInvoice.documentUrl ? (
                  <Button variant="outline" icon={Download} onClick={() => window.open(selectedInvoice.documentUrl, '_blank')}>View in Swipe</Button>
                ) : (
                  <Button variant="outline" icon={Download}>PDF</Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
