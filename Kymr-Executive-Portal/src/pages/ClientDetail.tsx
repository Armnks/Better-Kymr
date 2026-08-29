import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/db';
import { Client, Project, Quote, Invoice, Payment, Meeting, Inquiry } from '../types';
import { Button, Card } from '../components/ui/DesignSystem';
import { ArrowLeft, Save, Building2, Mail, Phone, Globe, FileText, Folder, Calendar, Briefcase, Upload, CreditCard, Clock, Activity, MessageSquare, Receipt, CheckCircle, Users } from 'lucide-react';
import { useEmail } from '../contexts/EmailContext';
import { uploadFileToDrive } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';
import { format } from 'date-fns';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openComposer } = useEmail();
  const { isAuthorized } = useGoogle();
  
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isNew = id === 'new';

  useEffect(() => {
    if (isNew) {
      setClient({
        name: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Client);
      setLoading(false);
      return;
    }

    async function load() {
      if (!id) return;
      try {
        const [clientData, projs, qs, invs, pays, meets, inqs] = await Promise.all([
          api.getClient(id),
          api.getProjects(),
          api.getQuotes(),
          api.getInvoices(),
          api.getPayments(),
          api.getMeetings(),
          api.getInquiries()
        ]);
        if (clientData) setClient(clientData);
        setProjects((projs || []).filter(p => p.clientId === id));
        setQuotes((qs || []).filter(q => q.clientId === id));
        setInvoices((invs || []).filter(i => i.clientId === id));
        setPayments((pays || []).filter(p => p.clientId === id));
        setMeetings((meets || []).filter(m => m.relatedId === id && m.relatedType === 'CLIENT'));
        setInquiries((inqs || []).filter(i => i.convertedClientId === id || i.email === clientData?.email));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    try {
      if (isNew) {
        const newId = await api.createClient(client);
        await api.logActivity({
          type: 'CLIENT_CREATED',
          actorId: 'system',
          entityType: 'CLIENT',
          entityId: newId,
          description: `Created new client ${client.name}`
        });
        navigate(`/admin/clients/${newId}`);
      } else {
        await api.updateClient(client.id!, client);
        await api.logActivity({
          type: 'CLIENT_UPDATED',
          actorId: 'system',
          entityType: 'CLIENT',
          entityId: client.id!,
          description: `Updated client ${client.name}`
        });
      }
    } catch (e) {
        console.error(e);
        alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;
    
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to upload to Drive.");
      return;
    }

    setUploading(true);
    try {
      const customName = `[Client: ${client.company || client.name}] ${file.name}`;
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

  if (loading) return <div className="font-mono text-xs text-brand-muted uppercase tracking-widest animate-pulse mt-8">Accessing Record...</div>;
  if (!client) return <div className="text-brand-accent-red font-mono text-xs uppercase tracking-widest mt-8">Record Not Found</div>;

  // Relationship Memory calculations
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');
  const outstandingInvoices = invoices.filter(i => i.status === 'SENT' || i.status === 'PARTIALLY_PAID' || i.status === 'OVERDUE');
  const outstandingTotal = outstandingInvoices.reduce((acc, inv) => acc + (inv.total - (inv.amountPaid || 0)), 0);
  
  const pastMeetings = meetings.filter(m => new Date(m.date) < new Date()).sort((a, b) => b.date.getTime() - a.date.getTime());
  const futureMeetings = meetings.filter(m => new Date(m.date) >= new Date()).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const lastMeeting = pastMeetings[0];
  const nextMeeting = futureMeetings[0];
  
  const sortedQuotes = [...quotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const lastQuote = sortedQuotes[0];

  // Build Timeline
  const timelineEvents: { date: Date, type: string, description: string, icon: React.ElementType }[] = [];
  
  client.createdAt && timelineEvents.push({ date: client.createdAt, type: 'Client Created', description: 'Added to roster', icon: Users });
  inquiries.forEach(i => timelineEvents.push({ date: i.createdAt, type: 'Inquiry', description: `Received inquiry for ${i.serviceInterest || 'services'}`, icon: MessageSquare }));
  meetings.forEach(m => timelineEvents.push({ date: m.date, type: 'Meeting', description: `${m.title} (${m.status})`, icon: Phone }));
  quotes.forEach(q => timelineEvents.push({ date: q.createdAt, type: 'Quote', description: `Quote ${q.quoteNumber} created (${q.status})`, icon: FileText }));
  projects.forEach(p => timelineEvents.push({ date: p.createdAt, type: 'Project', description: `Project "${p.name}" started`, icon: Briefcase }));
  invoices.forEach(i => timelineEvents.push({ date: i.createdAt, type: 'Invoice', description: `Invoice ${i.invoiceNumber} generated`, icon: Receipt }));
  payments.forEach(p => timelineEvents.push({ date: p.date, type: 'Payment', description: `Payment received: ${p.amount} ${p.currency}`, icon: CreditCard }));

  timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-6xl">
      <div className="flex items-center gap-4 text-brand-muted hover:text-brand-ivory cursor-pointer font-mono text-[10px] uppercase tracking-widest transition-colors w-fit" onClick={() => navigate('/admin/clients')}>
        <ArrowLeft className="w-3 h-3" /> Back to Roster
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">
            {isNew ? 'New Client' : client.name}
          </h1>
          {!isNew && (
            <div className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
              ID: {client.id}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button icon={Save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (isNew ? 'Create Record' : 'Save Record')}
          </Button>
        </div>
      </div>

      {!isNew && (
        <div className="flex flex-wrap items-center gap-3 py-4 border-y border-brand-border/50">
          <Button variant="outline" icon={Mail} onClick={() => openComposer({ to: client.email })}>Email</Button>
          <Button variant="outline" icon={Calendar} onClick={() => navigate(`/admin/meetings?create=true&clientId=${client.id}`)}>Call</Button>
          <Button variant="outline" icon={FileText} onClick={() => navigate(`/admin/quotes?create=true&clientId=${client.id}`)}>Quote</Button>
          <Button variant="outline" icon={Briefcase} onClick={() => navigate(`/admin/projects?create=true&clientId=${client.id}`)}>Project</Button>
          <Button variant="outline" icon={Receipt} onClick={() => navigate(`/admin/invoices?create=true&clientId=${client.id}`)}>Invoice</Button>
          <Button variant="outline" icon={Folder} onClick={() => navigate(`/admin/files?q=${encodeURIComponent(client.company || client.name)}`)}>Files</Button>
          <Button variant="outline" icon={Upload} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: INFO & RELATIONSHIP MEMORY */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          <Card className="flex flex-col gap-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent border-b border-brand-border pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Identity
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Entity Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type="text" value={client.name} onChange={e => setClient({...client, name: e.target.value})} className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Primary Contact</label>
                <input type="text" value={client.primaryContact || ''} onChange={e => setClient({...client, primaryContact: e.target.value})} className="w-full bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type="email" value={client.email || ''} onChange={e => setClient({...client, email: e.target.value})} className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type="text" value={client.phone || ''} onChange={e => setClient({...client, phone: e.target.value})} className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type="text" value={client.website || ''} onChange={e => setClient({...client, website: e.target.value})} className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans" />
                </div>
              </div>
            </div>
          </Card>

          {!isNew && (
            <Card className="flex flex-col gap-4">
               <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Relationship Summary
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">Client Since</div>
                  <div className="font-sans text-sm text-brand-ivory font-medium">{format(client.createdAt, 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">Last Meeting</div>
                  <div className="font-sans text-sm text-brand-ivory">{lastMeeting ? format(lastMeeting.date, 'MMM d, yyyy') : 'No past meetings'}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">Next Scheduled</div>
                  <div className="font-sans text-sm text-brand-ivory">{nextMeeting ? format(nextMeeting.date, 'MMM d, yyyy - h:mm a') : 'None scheduled'}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">Last Quote</div>
                  <div className="font-sans text-sm text-brand-ivory">{lastQuote ? `${lastQuote.quoteNumber} (${lastQuote.status})` : 'No quotes sent'}</div>
                </div>
                <div className="pt-2 border-t border-brand-border/50">
                  <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">Active Projects</div>
                  <div className="font-sans text-sm font-bold text-brand-ivory">{activeProjects.length}</div>
                </div>
                <div className="pt-2 border-t border-brand-border/50">
                  <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">Outstanding Invoices</div>
                  <div className="font-sans text-sm font-bold text-brand-accent-red">{outstandingInvoices.length > 0 ? `${outstandingTotal.toLocaleString()}` : '0.00'}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        {/* RIGHT COLUMN: TIMELINE */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {!isNew && (
            <Card className="flex flex-col gap-4 h-full">
               <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Timeline
                </h2>
              </div>
              
              <div className="relative border-l border-brand-border-light ml-4 space-y-8 flex-1 overflow-y-auto pr-4">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-brand-charcoal border border-brand-border flex items-center justify-center text-brand-accent">
                      <evt.icon className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-1">
                        {format(evt.date, 'MMM d, yyyy - h:mm a')}
                      </div>
                      <div className="font-sans font-bold text-sm text-brand-ivory mb-1">{evt.type}</div>
                      <div className="font-sans text-sm text-brand-muted leading-relaxed">{evt.description}</div>
                    </div>
                  </div>
                ))}
                {timelineEvents.length === 0 && (
                  <div className="text-center py-8 text-brand-muted font-mono text-[10px] uppercase tracking-widest">
                    No history recorded
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
