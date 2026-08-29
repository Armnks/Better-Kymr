import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/db';
import { Inquiry, InquiryStatus, Priority, Meeting, Quote } from '../types';
import { Button, Badge, Card } from '../components/ui/DesignSystem';
import { ArrowLeft, Save, Briefcase, Mail, Phone, Globe, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEmail } from '../contexts/EmailContext';

export default function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openComposer } = useEmail();
  const [inq, setInq] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  // Editable fields
  const [status, setStatus] = useState<InquiryStatus>('NEW');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [notes, setNotes] = useState('');

  const isNew = id === 'new';

  useEffect(() => {
    if (isNew) {
      setInq({
        name: '',
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Inquiry);
      setLoading(false);
      return;
    }

    async function load() {
      if (!id) return;
      
      const [data, allMeetings, allQuotes] = await Promise.all([
        api.getInquiry(id),
        api.getMeetings(),
        api.getQuotes()
      ]);
      
      if (data) {
        setInq(data);
        setStatus(data.status);
        setPriority(data.priority || 'NORMAL');
        setNotes(data.notes || '');
      }
      
      if (allMeetings) {
        // Find meetings linked to this inquiry (either explicitly or via externalBookingId)
        setMeetings(allMeetings.filter(m => m.inquiryId === id || (data?.externalBookingId && m.externalBookingId === data.externalBookingId)));
      }
      
      if (allQuotes) {
        setQuotes(allQuotes.filter(q => q.inquiryId === id));
      }
      
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  const handleSave = async () => {
    if (!inq) return;
    setSaving(true);
    try {
      if (isNew) {
        const newId = await api.createInquiry({ ...inq, status, priority, notes });
        await api.logActivity({
          type: 'INQUIRY_CREATED',
          actorId: 'system', // In a real app, this would be the current user
          entityType: 'INQUIRY',
          entityId: newId,
          description: `Created new inquiry for ${inq.name}`
        });
        navigate(`/admin/inquiries/${newId}`);
      } else {
        await api.updateInquiry(inq.id!, { ...inq, status, priority, notes });
        await api.logActivity({
          type: 'INQUIRY_UPDATED',
          actorId: 'system',
          entityType: 'INQUIRY',
          entityId: inq.id!,
          description: `Updated inquiry for ${inq.name}`
        });
        // refresh
        const data = await api.getInquiry(inq.id!);
        if (data) setInq(data);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save. Check console.");
    } finally {
      setSaving(false);
    }
  };

  const convertToClient = async () => {
    if (!inq || !inq.id) return;
    if (saving) return; // Prevent double-click
    if (!window.confirm("Convert this inquiry to a persistent Client record?")) return;
    
    setSaving(true);
    try {
      const clientId = await api.convertInquiryToClient(inq);
      navigate(`/admin/clients/${clientId}`);
    } catch (e: any) {
      console.error(e);
      alert(`Conversion failed: ${e.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="font-mono text-xs text-brand-muted uppercase tracking-widest animate-pulse mt-8">Accessing Record...</div>;
  if (!inq) return <div className="text-brand-accent-red font-mono text-xs uppercase tracking-widest mt-8">Record Not Found</div>;

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl">
      <div className="flex items-center gap-4 text-brand-muted hover:text-brand-ivory cursor-pointer font-mono text-[10px] uppercase tracking-widest transition-colors w-fit" onClick={() => navigate('/admin/inquiries')}>
        <ArrowLeft className="w-3 h-3" /> Back to Pipeline
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">
            {isNew ? 'New Inquiry' : inq.name}
          </h1>
          {!isNew && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-brand-muted">
              <span>ID: {inq.id}</span>
              <span>•</span>
              <span>Received: {format(inq.createdAt, 'MMM d, yyyy HH:mm')}</span>
              {inq.source === 'WEBSITE' && (
                <>
                  <span>•</span>
                  <span className="bg-brand-accent/10 text-brand-accent px-2 py-0.5 border border-brand-accent/20">SOURCE: WEBSITE</span>
                </>
              )}
              {inq.submissionType && (
                <>
                  <span>•</span>
                  <span className="text-brand-ivory">{inq.submissionType.replace('_', ' ')}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={Save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Record'}
          </Button>
        </div>
      </div>

      {!isNew && (
        <div className="flex flex-wrap items-center gap-3 py-4 border-y border-brand-border/50">
          {inq.email ? (
            <Button 
              variant="outline" 
              icon={Mail} 
              onClick={() => openComposer({ 
                to: inq.email,
                onSuccess: async () => {
                  try {
                    await api.logActivity({
                      type: 'EMAIL_SENT',
                      actorId: 'system',
                      entityType: 'INQUIRY',
                      entityId: inq.id!,
                      description: `Sent email to ${inq.email}`
                    });
                  } catch (e) { console.error(e); }
                }
              })}
            >
              Email
            </Button>
          ) : (
            <Button variant="outline" icon={Mail} disabled title="No email provided">
              Email
            </Button>
          )}
          {inq.phone ? (
            <a 
              href={`tel:${inq.phone}`} 
              className="flex items-center gap-2 h-9 px-4 text-xs font-mono tracking-widest text-brand-ivory uppercase bg-transparent border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
          ) : (
            <Button variant="outline" icon={Phone} disabled title="No phone provided">
              Call
            </Button>
          )}
          <Button 
            variant="outline" 
            icon={FileText} 
            onClick={() => navigate(`/admin/quotes?create=true&inquiryId=${inq.id}`)}
          >
            Quote
          </Button>
          {!inq.convertedClientId ? (
             <Button variant="secondary" icon={CheckCircle2} onClick={convertToClient} disabled={saving}>Convert to Client</Button>
          ) : (
             <Button variant="secondary" onClick={() => navigate(`/admin/clients/${inq.convertedClientId}`)}>View Client</Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent border-b border-brand-border pb-2">Primary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Full Name</label>
                <input 
                  type="text" 
                  value={inq.name} 
                  onChange={e => setInq({...inq, name: e.target.value})}
                  className="bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Company</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="text" 
                    value={inq.company || ''} 
                    onChange={e => setInq({...inq, company: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="email" 
                    value={inq.email || ''} 
                    onChange={e => setInq({...inq, email: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="text" 
                    value={inq.phone || ''} 
                    onChange={e => setInq({...inq, phone: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input 
                    type="text" 
                    value={inq.website || ''} 
                    onChange={e => setInq({...inq, website: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border pl-9 pr-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent border-b border-brand-border pb-2">Inquiry Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Service Interest</label>
                <input 
                  type="text" 
                  value={inq.serviceInterest || ''} 
                  onChange={e => setInq({...inq, serviceInterest: e.target.value})}
                  className="bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Budget Range</label>
                <input 
                  type="text" 
                  value={inq.budgetRange || ''} 
                  onChange={e => setInq({...inq, budgetRange: e.target.value})}
                  className="bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Original Message</label>
                <textarea 
                  value={inq.message || ''} 
                  onChange={e => setInq({...inq, message: e.target.value})}
                  rows={4}
                  className="bg-brand-black border border-brand-border px-3 py-2 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans resize-none"
                />
              </div>
            </div>
          </Card>

          {inq.scopeRequest && (
            <Card className="flex flex-col gap-6">
              <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent border-b border-brand-border pb-2">Configured Scope Request</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(inq.scopeRequest.serviceName || inq.scopeRequest.volume !== undefined) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Target Service / Volume</label>
                    <div className="font-sans text-sm text-brand-ivory p-3 bg-brand-charcoal-light border border-brand-border/50">
                      {inq.scopeRequest.serviceName || `${inq.scopeRequest.volume} ADS / MO`}
                    </div>
                  </div>
                )}
                {(inq.scopeRequest.estimatedBudget || inq.scopeRequest.tier) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Provided Budget / Tier</label>
                    <div className="font-sans text-sm text-brand-ivory p-3 bg-brand-charcoal-light border border-brand-border/50">
                      {inq.scopeRequest.estimatedBudget || inq.scopeRequest.tier}
                    </div>
                  </div>
                )}
                {(inq.scopeRequest.timeline || inq.scopeRequest.cadence !== undefined) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Timeline / Cadence</label>
                    <div className="font-sans text-sm text-brand-ivory p-3 bg-brand-charcoal-light border border-brand-border/50">
                      {inq.scopeRequest.timeline || `Mix: ${inq.scopeRequest.mix}, Cadence: ${inq.scopeRequest.cadence}`}
                    </div>
                  </div>
                )}
                {inq.scopeRequest.deliverables && inq.scopeRequest.deliverables.length > 0 && (
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Requested Items</label>
                    <ul className="list-disc pl-5 font-sans text-sm text-brand-ivory space-y-1 p-3 bg-brand-charcoal-light border border-brand-border/50">
                      {inq.scopeRequest.deliverables.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {inq.scopeRequest.notes && (
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Additional Scope Notes</label>
                    <div className="font-sans text-sm text-brand-ivory p-3 bg-brand-charcoal-light border border-brand-border/50 whitespace-pre-wrap">{inq.scopeRequest.notes}</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="flex flex-col gap-4">
             <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent">Internal Notes</h2>
            </div>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal observations, next steps, or context..."
              rows={6}
              className="bg-brand-black border border-brand-border px-3 py-3 text-sm text-brand-ivory focus:border-brand-accent outline-none font-sans resize-none"
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent border-b border-brand-border pb-2">Control Panel</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as InquiryStatus)}
                  className="bg-brand-black border border-brand-border px-3 py-2 text-xs font-mono uppercase tracking-widest text-brand-ivory focus:border-brand-accent outline-none appearance-none"
                >
                  <option value="NEW">NEW</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="MEETING">MEETING</option>
                  <option value="QUOTED">QUOTED</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">Priority</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="bg-brand-black border border-brand-border px-3 py-2 text-xs font-mono uppercase tracking-widest text-brand-ivory focus:border-brand-accent outline-none appearance-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>
          </Card>

          {!isNew && (
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent">Meetings</h2>
                <Button size="sm" variant="ghost" icon={Calendar} onClick={() => navigate(`/admin/meetings?create=true&inquiryId=${inq.id}`)}>Schedule Call</Button>
              </div>
              <div className="py-2 flex flex-col gap-4">
                {meetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 border border-brand-border/30 bg-brand-charcoal-light gap-3">
                    <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest text-center">MEETING NOT BOOKED</p>
                    <div className="flex gap-3 mt-2">
                      <Button size="sm" variant="outline" icon={Calendar} onClick={() => navigate(`/admin/meetings?create=true&inquiryId=${inq.id}`)}>Schedule Call</Button>
                      <Button size="sm" variant="outline" icon={Mail} onClick={() => openComposer({ 
                        to: inq.email || '', 
                        subject: 'Scheduling our Introduction', 
                        body: 'Hi ' + (inq.name.split(' ')[0] || '') + ',\n\nPlease pick a time for us to speak here: https://kymrstudio.com/start\n\nThanks,\nKymrStudio'
                      })}>Send Booking Link</Button>
                    </div>
                  </div>
                ) : (
                  meetings.map(m => {
                    const meetUrl = m.meetingUrl || m.meetUrl;
                    const isReady = m.providerVerified === true && m.isSynthetic !== true && !!meetUrl;
                    const meetStatus = isReady ? 'READY' : (m.status === 'CANCELLED' ? 'UNAVAILABLE' : 'PENDING');
                    return (
                      <div key={m.id} className="flex flex-col p-4 border border-brand-border/30 bg-brand-charcoal-light group gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-sans text-sm text-brand-ivory font-bold">{m.title}</span>
                            <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mt-1">
                              {format(new Date(m.date), 'MMM d, yyyy h:mm a')} • {m.durationMinutes || 30} MIN • {m.attendeeName}
                            </span>
                          </div>
                          <Badge variant={m.status === 'COMPLETED' ? 'default' : m.status === 'CANCELLED' ? 'outline' : 'accent'}>
                            {m.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-brand-border/30">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[8px] text-brand-muted uppercase tracking-widest">Provider</span>
                            <span className="font-mono text-[10px] text-brand-ivory uppercase tracking-widest">{m.externalProvider || 'GOOGLE CALENDAR'}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[8px] text-brand-muted uppercase tracking-widest">Meet Status</span>
                            <span className={`font-mono text-[10px] uppercase tracking-widest ${isReady ? 'text-green-400' : 'text-brand-accent'}`}>{meetStatus}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {isReady && m.status !== 'CANCELLED' ? (
                            <Button size="sm" variant="primary" className="flex-1" onClick={() => window.open(meetUrl, '_blank')}>JOIN CALL</Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="flex-1 text-[10px]">MEETING LINK PENDING</Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => navigate(`/admin/meetings?id=${m.id}`)}>VIEW MEETING</Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          )}

           {!isNew && (
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent">Quotes</h2>
                <Button size="sm" variant="ghost" icon={FileText} onClick={() => navigate(`/admin/quotes?create=true&inquiryId=${inq.id}`)}>Create</Button>
              </div>
              <div className="py-2 flex flex-col gap-2">
                {quotes.length === 0 ? (
                  <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest text-center">No active quotes</p>
                ) : (
                  quotes.map(q => (
                    <div key={q.id} className="flex justify-between items-center p-3 border border-brand-border/30 bg-brand-charcoal-light group cursor-pointer hover:border-brand-accent transition-colors" onClick={() => navigate(`/admin/quotes?id=${q.id}`)}>
                      <div className="flex flex-col">
                        <span className="font-sans text-sm text-brand-ivory font-bold">{q.title}</span>
                        <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest">{format(new Date(q.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <Badge variant={q.status === 'ACCEPTED' ? 'default' : q.status === 'REJECTED' ? 'outline' : 'accent'}>
                        {q.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
