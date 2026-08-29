import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/db';
import { Quote, Client, Inquiry, ServiceItem, CatalogService, ServiceCategory } from '../types';
import { FileText, Plus, X, ChevronRight, Briefcase, CheckCircle, Search, Save, Download, Play, Trash, ArrowRight, Mail } from 'lucide-react';
import { Button, Input, Badge } from '../components/ui/DesignSystem';
import { useEmail } from '../contexts/EmailContext';

export default function Quotes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openComposer } = useEmail();
  const isCreating = searchParams.get('create') === 'true';
  const prefillInquiryId = searchParams.get('inquiryId');
  const prefillClientId = searchParams.get('clientId');

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder States
  const [isBuilderOpen, setIsBuilderOpen] = useState(isCreating);
  const [step, setStep] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<Quote>>({
    title: 'New Proposal',
    status: 'DRAFT',
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    currency: 'USD',
    notes: '50% upfront, 50% upon completion.'
  });

  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [qData, cData, sData, catData] = await Promise.all([
      api.getQuotes(),
      api.getClients(),
      api.getCatalogServices(),
      api.getServiceCategories()
    ]);
    const activeServices = (sData || []).filter(s => s.isActive);
    setQuotes(qData || []);
    setClients(cData || []);
    setCatalogServices(activeServices);
    setCategories(catData || []);
    setLoading(false);
    
    if (isCreating) {
      setIsBuilderOpen(true);
      setSelectedQuote(null);
      setStep(1);
      handlePrefill(activeServices);
    }
  }

  async function handlePrefill(availableCatalogServices: CatalogService[]) {
    if (prefillClientId) {
      setFormState(prev => ({ ...prev, clientId: prefillClientId }));
    } else if (prefillInquiryId) {
      setFormState(prev => ({ ...prev, inquiryId: prefillInquiryId }));
      const inquiry = await api.getInquiry(prefillInquiryId);
      if (inquiry) {
        let title = 'New Proposal';
        if (inquiry.scopeRequest && inquiry.scopeRequest.serviceName) {
          title = `Proposal: ${inquiry.scopeRequest.serviceName}`;
        } else if (inquiry.serviceInterest) {
          title = `Proposal: ${inquiry.serviceInterest}`;
        }
        
        let initialItems: ServiceItem[] = [];
        
        // Attempt to pre-fill from scope request
        if (inquiry.scopeRequest) {
          const { serviceId, serviceName, estimatedBudget, notes, volume, tier, mix } = inquiry.scopeRequest;
          let matchedService = availableCatalogServices.find(s => s.id === serviceId || s.name === serviceName);
          
          if (matchedService) {
            initialItems.push({
              id: Math.random().toString(36).substring(7),
              catalogServiceId: matchedService.id,
              name: matchedService.name,
              description: matchedService.clientDescription || notes || '',
              rate: matchedService.defaultRate,
              billingType: matchedService.billingType,
              unit: matchedService.unit,
              quantity: matchedService.defaultQuantity || 1,
              currency: matchedService.defaultCurrency || 'USD'
            });
          } else if (serviceName || volume !== undefined) {
            // Create custom line item based on scope
            initialItems.push({
              id: Math.random().toString(36).substring(7),
              name: serviceName || `${volume} ADS / MO (${mix} MIX)`,
              description: notes || '',
              rate: estimatedBudget ? parseInt(estimatedBudget.replace(/[^0-9]/g, ''), 10) || 0 : (tier ? parseInt(tier.replace(/[^0-9]/g, ''), 10) || 0 : 0),
              billingType: 'FIXED',
              quantity: 1,
              currency: 'USD'
            });
          }
        }
        
        setFormState(prev => ({ ...prev, title, items: initialItems.length > 0 ? initialItems : prev.items }));
      }
    }
  }

  // Auto-calculate totals when items change
  useEffect(() => {
    const subtotal = (formState.items || []).reduce((acc, item) => acc + (item.rate * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax for example, or configurable
    const total = subtotal - (formState.discount || 0) + tax;
    setFormState(prev => ({ ...prev, subtotal, tax, total }));
  }, [formState.items, formState.discount]);

  const addService = (s: CatalogService) => {
    setFormState(prev => ({
      ...prev,
      items: [...(prev.items || []), {
        id: Math.random().toString(36).substring(7),
        catalogServiceId: s.id,
        name: s.name,
        description: s.clientDescription || s.shortDescription,
        rate: s.defaultRate,
        billingType: s.billingType,
        unit: s.unit,
        quantity: s.defaultQuantity || 1,
        currency: s.defaultCurrency || 'USD'
      }]
    }));
  };

  const removeService = (index: number) => {
    setFormState(prev => {
      const newItems = [...(prev.items || [])];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (status: Quote['status'] = 'DRAFT', returnId = false): Promise<string | undefined> => {
    if (!formState.clientId && !formState.inquiryId) return undefined;
    if (isSaving) return undefined;
    
    // Validate financial data
    if (
      !Number.isFinite(formState.total) || 
      !Number.isFinite(formState.subtotal) || 
      (formState.discount !== undefined && !Number.isFinite(formState.discount)) ||
      (formState.items?.some(i => !Number.isFinite(i.rate) || !Number.isFinite(i.quantity) || i.rate < 0 || i.quantity < 0))
    ) {
      alert("Invalid financial data. Please check item rates, quantities, and discounts.");
      return undefined;
    }

    setIsSaving(true);
    try {
      const dataToSave: any = { ...formState, status };
      
      // Remove undefined values
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });
      
      let savedId = selectedQuote?.id;
      if (savedId) {
        await api.updateQuote(savedId, dataToSave);
        await api.logActivity({ actorId: 'system', entityType: 'QUOTE', entityId: savedId, type: 'QUOTE_UPDATED', description: `Updated quote: ${dataToSave.title}` });
      } else {
        savedId = await api.createQuote(dataToSave as any);
        await api.logActivity({ actorId: 'system', entityType: 'QUOTE', entityId: savedId, type: 'QUOTE_CREATED', description: `Created quote: ${dataToSave.title}` });
      }
      
      // Update form state and selected quote to reflect the saved state so subsequent saves are updates
      setSelectedQuote({ ...dataToSave, id: savedId });
      
      // If we aren't returning the ID (like for Save Draft), we close the builder
      if (!returnId) {
        closeBuilder();
        load();
      }
      return savedId;
    } catch (e: any) {
      console.error('Failed to save quote', e);
      alert(`Quote save failed: ${e.message || 'Unknown error'}`);
      return undefined;
    } finally {
      setIsSaving(false);
    }
  };

  const closeBuilder = () => {
    setIsBuilderOpen(false);
    setSelectedQuote(null);
    setFormState({ title: 'New Proposal', status: 'DRAFT', items: [], subtotal: 0, discount: 0, tax: 0, total: 0, currency: 'USD', notes: '50% upfront, 50% upon completion.' });
    setStep(1);
    navigate('/admin/quotes');
  };

  const openQuote = (q: Quote) => {
    setSelectedQuote(q);
    setFormState({ ...q });
    setStep(6); // Open straight to preview
    setIsBuilderOpen(true);
  };

  const initiateSendQuote = async () => {
    // 1. Save quote as PENDING_SEND before emailing
    const savedId = await handleSave('PENDING_SEND', true);
    if (!savedId) return; // Save failed, stop email flow
    
    // Refresh list in background
    load();
    
    const client = clients.find(c => c.id === formState.clientId);
    openComposer({
      to: client?.email || '',
      subject: `Proposal: ${formState.title}`,
      body: `Hi ${client?.primaryContact || 'there'},\n\nPlease find the attached proposal for ${formState.title}.\n\nTotal value: $${formState.total?.toLocaleString()} ${formState.currency}\n\nLet me know if you have any questions.\n\nBest,\nKYMRSTUDIO`,
      onSuccess: async () => {
        // Mark SENT only after Google confirms
        await api.updateQuote(savedId, { status: 'SENT' });
        await api.logActivity({ actorId: 'system', entityType: 'QUOTE', entityId: savedId, type: 'QUOTE_SENT', description: `Sent quote: ${formState.title}` });
        
        // Link inquiry if we had one
        if (formState.inquiryId) {
          const inq = await api.getInquiry(formState.inquiryId);
          if (inq && inq.status !== 'QUOTED' && inq.status !== 'WON') {
            await api.updateInquiry(formState.inquiryId, { status: 'QUOTED' });
          }
        }
        
        closeBuilder();
        load();
      }
    });
  };

  const convertToProject = async (q: Quote) => {
    // 9. QUOTE -> PROJECT workflow
    const projectId = await api.createProject({
      name: `Project: ${q.title}`,
      clientId: q.clientId!, // assuming quotes have client IDs by the time they are accepted
      quoteId: q.id,
      status: 'PLANNING',
      budget: q.total,
      currency: q.currency
    });
    
    await api.logActivity({
      actorId: 'admin',
      entityType: 'Project',
      entityId: projectId,
      type: 'PROJECT_CREATED',
      description: `Started project from accepted quote: ${q.title}`
    });
    
    // Also mark quote as accepted if it isn't
    if (q.status !== 'ACCEPTED') {
      await api.updateQuote(q.id!, { status: 'ACCEPTED' });
    }
    
    navigate(`/admin/projects?id=${projectId}`); // Assuming we build this later
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">Quotes & Proposals</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Offer Configuration</p>
        </div>
        <div className="flex gap-3">
          <Button icon={Plus} onClick={() => navigate('/admin/quotes?create=true')} variant="primary">Create Quote</Button>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse">Retrieving Proposals...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {quotes.length === 0 ? (
            <div className="border border-dashed border-brand-border p-12 text-center bg-brand-surface max-w-2xl mx-auto w-full">
              <FileText className="w-8 h-8 text-brand-muted mx-auto mb-4" />
              <h3 className="font-sans font-bold text-brand-ivory text-lg mb-2">No Quotes Yet</h3>
              <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest leading-relaxed mb-6">
                Create a quote from an inquiry or client and the contact information will be filled automatically.
              </p>
              <Button onClick={() => navigate('/admin/quotes?create=true')} variant="primary">Create Quote</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotes.map(q => {
                const client = clients.find(c => c.id === q.clientId);
                return (
                  <div key={q.id} onClick={() => openQuote(q)} className="group bg-brand-surface border border-brand-border p-5 hover:border-brand-accent cursor-pointer transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={q.status === 'ACCEPTED' ? 'success' : q.status === 'SENT' ? 'info' : 'default'}>{q.status}</Badge>
                        <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest">{q.createdAt.toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-sans text-lg font-bold text-brand-ivory group-hover:text-brand-accent transition-colors mb-1">{q.title}</h3>
                      <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-4">
                        For: {client?.company || client?.name || 'Unknown Client'}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                      <span className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">Total Value</span>
                      <span className="font-sans font-bold text-brand-ivory">${q.total.toLocaleString()} {q.currency}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* QUOTE BUILDER DRAWER */}
      <AnimatePresence>
        {isBuilderOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-40"
              onClick={closeBuilder}
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
                  <h2 className="text-xl font-sans font-bold text-brand-ivory mb-1">Quote Builder</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                    Step {step} of 6 • {
                      step === 1 ? 'Who is this for?' :
                      step === 2 ? 'What are we doing?' :
                      step === 3 ? 'Scope & Quantity' :
                      step === 4 ? 'Price & Calculations' :
                      step === 5 ? 'Terms & Notes' : 'Preview & Send'
                    }
                  </p>
                </div>
                <button onClick={closeBuilder} className="text-brand-muted hover:text-brand-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-12">
                
                {/* 1: RECIPIENT */}
                <section>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-3">Select Existing Client</label>
                  <select 
                    value={formState.clientId || ''} 
                    onChange={e => setFormState({...formState, clientId: e.target.value})}
                    className="w-full bg-brand-surface border border-brand-border py-3 px-4 font-sans text-brand-ivory focus:outline-none focus:border-brand-accent transition-colors"
                  >
                    <option value="" disabled>Select a client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company || c.name}</option>
                    ))}
                  </select>
                </section>

                {/* 2: SERVICES & ITEMS */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted">Scope & Items</label>
                    <div className="flex gap-2">
                      <select 
                        onChange={(e) => {
                          const s = catalogServices.find(srv => srv.id === e.target.value);
                          if (s) addService(s);
                          e.target.value = "";
                        }}
                        className="bg-brand-surface border border-brand-border text-[10px] font-mono text-brand-muted py-1 px-2 focus:outline-none"
                      >
                        <option value="">+ Add from Catalog...</option>
                        {catalogServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <Button variant="outline" onClick={() => addService({ id: '', name: 'Custom Line Item', billingType: 'FIXED', defaultRate: 0, defaultCurrency: 'USD', defaultQuantity: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() })} className="text-[10px] h-6 px-2 py-0 border-brand-border border-dashed">
                        + Custom
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formState.items?.length === 0 && <div className="text-brand-muted text-xs font-mono uppercase border border-dashed border-brand-border p-4 text-center">No services added yet.</div>}
                    {formState.items?.map((item, idx) => (
                      <div key={idx} className="p-4 border border-brand-border bg-brand-surface space-y-4 relative group">
                        <button onClick={() => removeService(idx)} className="absolute top-4 right-4 text-brand-muted hover:text-brand-accent-red opacity-0 group-hover:opacity-100 transition-opacity"><Trash className="w-4 h-4" /></button>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2 pr-6">
                             <Input value={item.name} onChange={e => {
                               const newItems = [...formState.items!];
                               newItems[idx].name = e.target.value;
                               setFormState({...formState, items: newItems});
                             }} placeholder="Item Name" className="font-bold border-none px-0 focus:ring-0 text-base" />
                             <textarea
                               value={item.description || ''}
                               onChange={e => {
                                 const newItems = [...formState.items!];
                                 newItems[idx].description = e.target.value;
                                 setFormState({...formState, items: newItems});
                               }}
                               placeholder="Item Description"
                               className="w-full bg-transparent border border-brand-border/30 text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent min-h-[40px]"
                             />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Rate ({item.currency})</label>
                            <Input type="number" value={item.rate} onChange={(e) => {
                              const newItems = [...formState.items!];
                              newItems[idx].rate = Number(e.target.value);
                              setFormState({...formState, items: newItems});
                            }} />
                          </div>
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Quantity</label>
                            <Input type="number" value={item.quantity} onChange={(e) => {
                              const newItems = [...formState.items!];
                              newItems[idx].quantity = Number(e.target.value);
                              setFormState({...formState, items: newItems});
                            }} />
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs text-brand-ivory pt-2 border-t border-brand-border/50">
                          ${(item.rate * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3: PRICE SUMMARY & TERMS */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Proposal Title</label>
                    <Input value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="e.g. Website Redesign Proposal" className="mb-4" />
                    
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Payment Terms & Notes</label>
                    <textarea 
                      value={formState.notes || ''} 
                      onChange={e => setFormState({...formState, notes: e.target.value})}
                      className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent min-h-[100px]"
                    />
                  </div>
                  
                  <div className="p-6 border border-brand-border bg-brand-charcoal-light space-y-3 h-fit">
                    <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                      <span>Subtotal</span>
                      <span>${formState.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                      <span>Discount</span>
                      <input type="number" value={formState.discount} onChange={e => setFormState({...formState, discount: Number(e.target.value)})} className="w-20 bg-brand-black border border-brand-border text-right px-2 py-1 text-brand-ivory focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                      <span>Tax (10%)</span>
                      <span>${formState.tax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base uppercase tracking-widest text-brand-ivory pt-3 border-t border-brand-border">
                      <span>Total</span>
                      <span className="text-brand-accent">${formState.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </section>

                {/* ACTIONS IF VIEWING EXISTING */}
                {selectedQuote && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-6 border-t border-brand-border">
                    {selectedQuote.status === 'DRAFT' && (
                      <Button variant="primary" onClick={initiateSendQuote} icon={Mail} disabled={isSaving}>Send Quote</Button>
                    )}
                    {selectedQuote.status === 'SENT' && (
                      <Button variant="success" onClick={() => handleSave('ACCEPTED')} icon={CheckCircle}>Mark Accepted</Button>
                    )}
                    {selectedQuote.status === 'ACCEPTED' && (
                      <Button variant="primary" onClick={() => convertToProject(selectedQuote)} icon={Play} className="col-span-2 bg-brand-accent text-black border-none">Start Project</Button>
                    )}
                  </div>
                )}
              </div>

              {/* FOOTER NAV */}
              {!selectedQuote?.id && (
                <div className="p-6 border-t border-brand-border bg-brand-charcoal flex justify-end gap-2 shrink-0">
                  <Button variant="outline" onClick={() => handleSave('DRAFT', false)} icon={Save} disabled={!formState.clientId || !formState.items?.length || isSaving}>
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button variant="primary" disabled={!formState.clientId || !formState.items?.length || isSaving} onClick={initiateSendQuote}>
                    {isSaving ? 'Saving...' : 'Send Quote'}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
