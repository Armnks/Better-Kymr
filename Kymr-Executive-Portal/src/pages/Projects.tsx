import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/db';
import { Project, Client, Quote } from '../types';
import { Briefcase, FileText, CheckCircle, Search, Clock, ArrowRight, X, Mail, Folder, Calendar, Download, Upload } from 'lucide-react';
import { Button, Badge } from '../components/ui/DesignSystem';
import { useEmail } from '../contexts/EmailContext';
import { createSpreadsheet, uploadFileToDrive } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';
import { format } from 'date-fns';

export default function Projects() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openComposer } = useEmail();
  const { isAuthorized } = useGoogle();
  const highlightId = searchParams.get('id');

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (highlightId && projects.length > 0) {
      const p = projects.find(x => x.id === highlightId);
      if (p) setSelectedProject(p);
    }
  }, [highlightId, projects]);

  async function load() {
    setLoading(true);
    const [pData, cData, qData] = await Promise.all([
      api.getProjects(),
      api.getClients(),
      api.getQuotes()
    ]);
    setProjects(pData || []);
    setClients(cData || []);
    setQuotes(qData || []);
    setLoading(false);
  }

  const generateInvoice = async (project: Project) => {
    // Convert to Invoice
    const invoiceId = await api.createInvoice({
      projectId: project.id!,
      clientId: project.clientId,
      title: `Invoice for ${project.name}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      items: [{
        id: `item-${Date.now()}`,
        name: 'Project Work',
        description: `Deliverables for ${project.name}`,
        quantity: 1,
        rate: project.budget || 0,
        type: 'service'
      }],
      subtotal: project.budget || 0,
      discount: 0,
      tax: 0,
      total: project.budget || 0,
      currency: project.currency || 'USD',
      status: 'DRAFT',
      issueDate: new Date(),
      dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    });

    await api.logActivity({
      actorId: 'admin',
      entityType: 'Invoice',
      entityId: invoiceId,
      type: 'INVOICE_CREATED',
      description: `Generated invoice from project: ${project.name}`
    });

    navigate(`/admin/invoices?id=${invoiceId}`);
  };

  const updateStatus = async (p: Project, status: Project['status']) => {
    await api.updateProject(p.id!, { status });
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, status } : x));
    if (selectedProject?.id === p.id) {
      setSelectedProject({ ...selectedProject, status });
    }
  };

  const handleExport = async () => {
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to export to Sheets.");
      return;
    }
    setExporting(true);
    try {
      const data = [
        ['ID', 'Project Name', 'Client Name', 'Status', 'Budget', 'Currency', 'Start Date'],
        ...projects.map(p => {
          const client = clients.find(c => c.id === p.clientId);
          return [
            p.id || '',
            p.name,
            client?.company || client?.name || '',
            p.status,
            p.budget?.toString() || '',
            p.currency || '',
            format(p.createdAt, 'yyyy-MM-dd')
          ];
        })
      ];
      const sheet = await createSpreadsheet(`Projects Export - ${format(new Date(), 'yyyy-MM-dd')}`, data);
      window.open(sheet.spreadsheetUrl, '_blank');
    } catch (e) {
      console.error(e);
      alert("Failed to export to Sheets");
    } finally {
      setExporting(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;
    
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to upload to Drive.");
      return;
    }

    setUploading(true);
    try {
      const customName = `[Project: ${selectedProject.name}] ${file.name}`;
      await uploadFileToDrive(file, undefined, customName);
      alert("File successfully uploaded and tagged in Google Drive.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert("Failed to upload file to Drive.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">Projects</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Active Delivery</p>
        </div>
        <Button icon={Download} variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {loading ? (
        <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse">Loading Projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full border border-dashed border-brand-border p-12 text-center bg-brand-surface max-w-2xl mx-auto w-full">
              <Briefcase className="w-8 h-8 text-brand-muted mx-auto mb-4" />
              <h3 className="font-sans font-bold text-brand-ivory text-lg mb-2">No Active Projects</h3>
              <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest leading-relaxed mb-6">
                Projects are typically created by accepting a Quote.
              </p>
              <Button onClick={() => navigate('/admin/quotes')} variant="outline">Go to Quotes</Button>
            </div>
          ) : (
            projects.map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div key={p.id} onClick={() => setSelectedProject(p)} className="group bg-brand-surface border border-brand-border p-5 hover:border-brand-accent cursor-pointer transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={p.status === 'IN_PROGRESS' ? 'success' : p.status === 'COMPLETED' ? 'default' : 'info'}>{p.status}</Badge>
                      <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest">{p.createdAt.toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-brand-ivory group-hover:text-brand-accent transition-colors mb-1">{p.name}</h3>
                    <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-4">
                      {client?.company || client?.name || 'Unknown Client'}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                    <span className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">Budget</span>
                    <span className="font-sans font-bold text-brand-ivory">{p.budget ? `$${p.budget.toLocaleString()} ${p.currency || ''}` : 'TBD'}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* PROJECT DRAWER */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedProject(null)}
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
                  <h2 className="text-xl font-sans font-bold text-brand-ivory mb-1">{selectedProject.name}</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{clients.find(c => c.id === selectedProject.clientId)?.company || 'Client Project'}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-brand-muted hover:text-brand-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* QUICK ACTIONS */}
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Project Actions</h3>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      icon={Mail} 
                      className="text-[10px] h-8 flex-1"
                      onClick={() => {
                        const client = clients.find(c => c.id === selectedProject.clientId);
                        if (client?.email) openComposer({ to: client.email });
                      }}
                    >
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={Folder} 
                      className="text-[10px] h-8 flex-1"
                      onClick={() => {
                        const client = clients.find(c => c.id === selectedProject.clientId);
                        const query = client ? client.company || client.name : selectedProject.name;
                        navigate(`/admin/files?q=${encodeURIComponent(query)}`);
                      }}
                    >
                      Files
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={Upload} 
                      className="text-[10px] h-8 flex-1"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Upload
                    </Button>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleUpload} 
                    />
                    <Button 
                      variant="outline" 
                      icon={Calendar} 
                      className="text-[10px] h-8 flex-1"
                      onClick={() => navigate('/admin/meetings')}
                    >
                      Call
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="primary" onClick={() => generateInvoice(selectedProject)} className="text-[10px] h-8 col-span-2 bg-brand-accent text-black border-none" icon={FileText}>Generate Invoice</Button>
                    {selectedProject.status === 'PLANNING' && (
                      <Button variant="outline" onClick={() => updateStatus(selectedProject, 'IN_PROGRESS')} className="text-[10px] h-8" icon={Clock}>Mark Active</Button>
                    )}
                    {selectedProject.status === 'IN_PROGRESS' && (
                      <Button variant="outline" onClick={() => updateStatus(selectedProject, 'COMPLETED')} className="text-[10px] h-8 hover:text-brand-accent" icon={CheckCircle}>Mark Complete</Button>
                    )}
                  </div>
                </section>

                {/* DETAILS */}
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Overview</h3>
                  <div className="bg-brand-surface border border-brand-border p-4 space-y-4">
                    <div>
                      <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-1">Status</div>
                      <Badge variant={selectedProject.status === 'IN_PROGRESS' ? 'success' : 'default'}>{selectedProject.status}</Badge>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-1">Budget</div>
                      <div className="text-sm font-sans font-bold text-brand-ivory">{selectedProject.budget ? `$${selectedProject.budget.toLocaleString()} ${selectedProject.currency || ''}` : 'Unspecified'}</div>
                    </div>
                    {selectedProject.quoteId && (
                      <div className="pt-3 border-t border-brand-border/50">
                        <div className="text-[9px] font-mono text-brand-muted uppercase tracking-widest mb-1">Origin Quote</div>
                        <div className="text-sm font-sans text-brand-ivory line-clamp-1">{quotes.find(q => q.id === selectedProject.quoteId)?.title || selectedProject.quoteId}</div>
                      </div>
                    )}
                  </div>
                </section>
                
                <section>
                  <h3 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Tasks</h3>
                  <div className="border border-dashed border-brand-border p-6 text-center">
                    <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">Tasks module coming soon</p>
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
