import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/db';
import { Meeting, Inquiry, Client, Quote, Project, Invoice } from '../types';
import { Calendar, Phone, Clock, Video, CheckCircle, X, ChevronRight, MessageSquare, ArrowRight, AlertTriangle, Briefcase, Receipt, FileText } from 'lucide-react';
import { Button, Input, Badge } from '../components/ui/DesignSystem';
import { createCalendarEvent, createMeetSpace } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';
import { format } from 'date-fns';
import { getMeetingJoinState } from '../lib/meetings';

export default function Meetings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthorized } = useGoogle();
  const isCreating = searchParams.get('create') === 'true';
  const prefillInquiryId = searchParams.get('inquiryId');
  const prefillClientId = searchParams.get('clientId');

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(isCreating);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  
  // Form states
  const [formState, setFormState] = useState<Partial<Meeting>>({
    title: '',
    durationMinutes: 30,
    status: 'PENDING',
    date: new Date(),
    attendeeName: '',
    attendeeEmail: '',
  });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (isCreating) {
      setIsDrawerOpen(true);
      setSelectedMeeting(null);
      handlePrefill();
    }
  }, [isCreating, prefillInquiryId, prefillClientId]);

  async function load() {
    setLoading(true);
    const [meets, cls, inqs, qs, projs, invs] = await Promise.all([
      api.getMeetings(),
      api.getClients(),
      api.getInquiries(),
      api.getQuotes(),
      api.getProjects(),
      api.getInvoices()
    ]);
    setMeetings(meets || []);
    setClients(cls || []);
    setInquiries(inqs || []);
    setQuotes(qs || []);
    setProjects(projs || []);
    setInvoices(invs || []);
    setLoading(false);
  }

  async function handlePrefill() {
    if (prefillInquiryId) {
      const inquiry = inquiries.find(i => i.id === prefillInquiryId) || await api.getInquiry(prefillInquiryId);
      if (inquiry) {
        setFormState(prev => ({
          ...prev,
          title: `Intro Call: ${inquiry.company || inquiry.name}`,
          attendeeName: inquiry.name,
          attendeeEmail: inquiry.email || '',
          attendeeCompany: inquiry.company || '',
          relatedId: inquiry.id,
          relatedType: 'INQUIRY'
        }));
      }
    } else if (prefillClientId) {
      const client = clients.find(c => c.id === prefillClientId) || await api.getClient(prefillClientId);
      if (client) {
        setFormState(prev => ({
          ...prev,
          title: `Check-in: ${client.company || client.name}`,
          attendeeName: client.primaryContact || client.name,
          attendeeEmail: client.email || '',
          attendeeCompany: client.company || '',
          relatedId: client.id,
          relatedType: 'CLIENT'
        }));
      }
    }
  }

  const handleSave = async () => {
    if (!formState.title || !formState.attendeeName || !formState.date) return;
    
    // Email validation if required
    if (formState.attendeeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.attendeeEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      let meetUrl = formState.meetUrl;
      let eventId = formState.calendarEventId;

      if (isAuthorized && !selectedMeeting) {
        try {
          const event = await createCalendarEvent(
            formState.title,
            formState.date,
            formState.durationMinutes || 30,
            formState.attendeeEmail ? [formState.attendeeEmail] : [],
            formState.notes
          );
          
          eventId = event.id;
          if (event.hangoutLink) {
            meetUrl = event.hangoutLink;
          }
        } catch (calendarError: any) {
          console.error("Failed to create calendar event", calendarError);
          alert(`Failed to schedule with Google Calendar: ${calendarError.message}`);
          return; // Stop if calendar creation fails to prevent partial/fake state
        }
      }

      const rawFormState = {
        ...formState,
        meetUrl,
        calendarEventId: eventId
      };
      
      // Clean undefined fields to prevent Firestore crashes
      const finalFormState = Object.fromEntries(Object.entries(rawFormState).filter(([_, v]) => v !== undefined));

      if (selectedMeeting) {
        await api.updateMeeting(selectedMeeting.id!, finalFormState);
      } else {
        const newMeetId = await api.createMeeting(finalFormState as any);
        await api.logActivity({
          actorId: 'admin',
          entityType: 'Meeting',
          entityId: newMeetId,
          type: 'MEETING_CREATED',
          description: `Scheduled call: ${formState.title}`
        });
      }
      closeDrawer();
      load();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save meeting: ${e.message}`);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedMeeting(null);
    setFormState({ title: '', durationMinutes: 30, status: 'PENDING', date: new Date(), attendeeName: '', attendeeEmail: '' });
    navigate('/admin/meetings');
  };

  const openMeeting = (m: Meeting) => {
    setSelectedMeeting(m);
    setFormState({ ...m });
    setIsDrawerOpen(true);
  };

  const updateStatus = async (m: Meeting, status: Meeting['status']) => {
    await api.updateMeeting(m.id!, { status });
    // Update local state temporarily for snappy UI
    setFormState(prev => ({ ...prev, status }));
    setMeetings(prev => prev.map(meet => meet.id === m.id ? { ...meet, status } : meet));
    if (status === 'COMPLETED') {
      // If we mark it complete, leave drawer open so they can add notes and next actions
      return; 
    }
  };

  const upcoming = meetings.filter(m => m.status === 'PENDING' && m.date >= new Date(new Date().setHours(0,0,0,0)));
  const past = meetings.filter(m => m.status !== 'PENDING' || m.date < new Date(new Date().setHours(0,0,0,0)));

  // PREP DATA COMPUTATION
  let relatedInquiry: Inquiry | undefined;
  let relatedClient: Client | undefined;
  let pastMeets: Meeting[] = [];
  let actQuote: Quote | undefined;
  let actProj: Project | undefined;
  let outInvs: Invoice[] = [];

  if (selectedMeeting && selectedMeeting.relatedId) {
    if (selectedMeeting.relatedType === 'INQUIRY') {
      relatedInquiry = inquiries.find(i => i.id === selectedMeeting.relatedId);
    } else if (selectedMeeting.relatedType === 'CLIENT') {
      relatedClient = clients.find(c => c.id === selectedMeeting.relatedId);
    }
    
    pastMeets = meetings.filter(m => 
      m.relatedId === selectedMeeting.relatedId && 
      m.id !== selectedMeeting.id && 
      m.date < selectedMeeting.date
    ).sort((a,b) => b.date.getTime() - a.date.getTime());
    
    if (relatedClient) {
      actQuote = quotes.find(q => q.clientId === relatedClient!.id && (q.status === 'SENT' || q.status === 'DRAFT'));
      actProj = projects.find(p => p.clientId === relatedClient!.id && p.status === 'IN_PROGRESS');
      outInvs = invoices.filter(i => i.clientId === relatedClient!.id && (i.status === 'SENT' || i.status === 'PARTIALLY_PAID' || i.status === 'OVERDUE'));
    } else if (relatedInquiry) {
      actQuote = quotes.find(q => q.inquiryId === relatedInquiry!.id && (q.status === 'SENT' || q.status === 'DRAFT'));
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">Calls & Meetings</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Schedule and Join</p>
        </div>
        <div className="flex gap-3">
          <Button icon={Calendar} onClick={() => navigate('/admin/meetings?create=true')} variant="primary">New Call</Button>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse">Loading schedule...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-brand-ivory mb-4 pb-2 border-b border-brand-border">Upcoming Calls</h2>
            {upcoming.length === 0 ? (
              <div className="border border-dashed border-brand-border p-8 text-center bg-brand-surface">
                <Calendar className="w-6 h-6 text-brand-muted mx-auto mb-2" />
                <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest leading-relaxed mb-4">No upcoming calls.</p>
                <Button variant="outline" onClick={() => navigate('/admin/meetings?create=true')} className="mx-auto text-[10px]">Schedule One</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map(m => (
                  <div key={m.id} onClick={() => openMeeting(m)} className="group bg-brand-surface border border-brand-border p-4 hover:border-brand-accent cursor-pointer transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-sm font-bold text-brand-ivory group-hover:text-brand-accent transition-colors">{m.title}</span>
                      </div>
                      <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">
                        {m.date.toLocaleDateString()} at {m.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.durationMinutes} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const { canJoin, label } = getMeetingJoinState(m);
                        if (canJoin) {
                          return (
                            <button className="bg-brand-ivory text-black p-2 rounded-sm hover:bg-brand-accent hover:text-white transition-colors" title={label} onClick={(e) => { e.stopPropagation(); window.open(m.meetUrl, '_blank'); }}>
                              <Video className="w-4 h-4" />
                            </button>
                          );
                        } else {
                          return (
                            <span className="font-mono text-[9px] text-brand-muted-dark uppercase tracking-widest border border-brand-border px-2 py-1">{label}</span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          <section>
            <h2 className="font-mono text-xs uppercase tracking-widest text-brand-ivory mb-4 pb-2 border-b border-brand-border">Past / Completed</h2>
            <div className="flex flex-col gap-2 opacity-70">
              {past.slice(0, 10).map(m => (
                <div key={m.id} onClick={() => openMeeting(m)} className="bg-brand-charcoal border border-brand-border p-3 hover:border-brand-ivory cursor-pointer transition-colors flex justify-between items-center">
                  <div>
                    <span className="font-sans text-xs font-medium text-brand-ivory">{m.title}</span>
                    <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mt-1">
                      {m.date.toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={m.status === 'COMPLETED' ? 'success' : 'default'}>{m.status}</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-brand-charcoal border-l border-brand-border z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-highlight shrink-0">
                <h2 className="text-xl font-sans font-bold text-brand-ivory">{selectedMeeting ? 'Meeting Details' : 'New Call'}</h2>
                <button onClick={closeDrawer} className="text-brand-muted hover:text-brand-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                
                {/* LEFT: FORM / NOTES / POST-MEETING */}
                <div className="flex-1 p-6 flex flex-col space-y-6">
                  {selectedMeeting && selectedMeeting.status === 'COMPLETED' ? (
                    // POST-MEETING FLOW
                    <div className="space-y-8">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                           <CheckCircle className="w-5 h-5" />
                         </div>
                         <div>
                           <h3 className="font-sans font-bold text-brand-ivory text-lg">Call Completed</h3>
                           <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Record outcomes</p>
                         </div>
                       </div>
                       
                       <div className="space-y-3">
                         <h4 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted border-b border-brand-border pb-1">Notes</h4>
                         <textarea 
                            value={formState.notes || ''} 
                            onChange={e => setFormState({...formState, notes: e.target.value})}
                            className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent min-h-[150px]"
                            placeholder="Add meeting notes here..."
                          />
                          <Button variant="outline" size="sm" onClick={handleSave}>Save Notes</Button>
                       </div>

                       <div className="space-y-3 pt-4 border-t border-brand-border/50">
                         <h4 className="font-mono text-[9px] uppercase tracking-widest text-brand-muted border-b border-brand-border pb-1">What's Next?</h4>
                         <div className="flex flex-col gap-2">
                           <Button variant="primary" onClick={() => navigate(`/admin/quotes?create=true&inquiryId=${relatedInquiry?.id}&clientId=${relatedClient?.id}`)} className="justify-start">
                             Create Quote <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                           </Button>
                           <Button variant="outline" onClick={() => navigate(`/admin/tasks?create=true&clientId=${relatedClient?.id}`)} className="justify-start">
                             Create Task <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                           </Button>
                           <Button variant="outline" onClick={closeDrawer} className="justify-start">
                             No Action
                           </Button>
                         </div>
                       </div>
                    </div>
                  ) : (
                    // NORMAL FORM
                    <div className="space-y-6">
                      {!selectedMeeting && (
                        <div className={`font-mono text-[10px] uppercase tracking-widest p-3 border mb-4 ${isAuthorized ? 'bg-brand-surface border-brand-accent/30 text-brand-ivory' : 'bg-brand-surface border-brand-border text-brand-muted'}`}>
                          {isAuthorized 
                            ? '✓ Calendar Connected. Meet link automatically generated.'
                            : 'Connect Google Workspace in Settings for automatic Meet links.'}
                        </div>
                      )}
                      
                      {selectedMeeting && (
                        <div className="grid grid-cols-2 gap-2">
                          {(() => {
                            const { canJoin, label } = getMeetingJoinState(selectedMeeting);
                            if (canJoin) {
                              return (
                                <Button variant="primary" onClick={() => window.open(selectedMeeting.meetUrl, '_blank')} className="text-[10px] h-8 col-span-2" icon={Video}>{label}</Button>
                              );
                            } else {
                              return (
                                <div className="font-mono text-[9px] text-brand-muted-dark uppercase tracking-widest border border-brand-border px-3 py-2 text-center col-span-2">{label}</div>
                              );
                            }
                          })()}
                          {selectedMeeting.status === 'PENDING' && (
                            <>
                              <Button variant="outline" onClick={() => updateStatus(selectedMeeting, 'COMPLETED')} className="text-[10px] h-8 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-black">Mark Complete</Button>
                              <Button variant="outline" onClick={() => updateStatus(selectedMeeting, 'CANCELLED')} className="text-[10px] h-8 hover:text-brand-accent-red">Cancel</Button>
                            </>
                          )}
                        </div>
                      )}

                      {!selectedMeeting && formState.meetUrl && (
                        <div className="font-mono text-[10px] uppercase tracking-widest p-3 border mb-4 bg-brand-surface border-brand-accent/30 text-brand-ivory flex items-center justify-between">
                          <span>✓ Meet Link Added</span>
                          <span className="truncate ml-2 text-brand-muted max-w-[150px]">{formState.meetUrl}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Title</label>
                          <Input value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="e.g. Intro Call: ACME Corp" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Duration</label>
                            <div className="grid grid-cols-2 gap-1">
                              {[15, 30, 45, 60].map(m => (
                                <button key={m} onClick={() => setFormState({...formState, durationMinutes: m})} className={`py-1.5 text-[9px] font-mono uppercase tracking-widest border transition-colors ${formState.durationMinutes === m ? 'bg-brand-accent text-black border-brand-accent' : 'border-brand-border text-brand-muted hover:text-brand-ivory hover:border-brand-ivory'}`}>
                                  {m}m
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Date & Time</label>
                            <input type="datetime-local" value={formState.date ? new Date(formState.date.getTime() - formState.date.getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''} onChange={e => setFormState({...formState, date: new Date(e.target.value)})} className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Attendee Name</label>
                            <Input value={formState.attendeeName} onChange={e => setFormState({...formState, attendeeName: e.target.value})} placeholder="Jane Doe" />
                          </div>
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Attendee Email</label>
                            <Input type="email" value={formState.attendeeEmail || ''} onChange={e => setFormState({...formState, attendeeEmail: e.target.value.trim()})} placeholder="jane@example.com" />
                          </div>
                        </div>

                        <div>
                          <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Notes</label>
                          <textarea value={formState.notes || ''} onChange={e => setFormState({...formState, notes: e.target.value})} className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent min-h-[120px]" placeholder="Agenda, talking points..." />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: PREP / BRIEFING */}
                {selectedMeeting && (relatedInquiry || relatedClient) && (
                  <div className="w-full md:w-64 border-l border-brand-border bg-brand-surface p-6 overflow-y-auto">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-brand-accent mb-6 flex items-center gap-2 border-b border-brand-border pb-2">
                      <Clock className="w-3.5 h-3.5" /> Meeting Prep
                    </h3>
                    
                    <div className="space-y-6">
                       {/* Identity */}
                       <div>
                         <div className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-1">Entity</div>
                         <div className="font-sans font-bold text-sm text-brand-ivory truncate">{relatedClient?.name || relatedInquiry?.company || relatedInquiry?.name}</div>
                         <div className="font-sans text-xs text-brand-muted">{relatedInquiry ? 'Inquiry' : 'Client'}</div>
                       </div>
                       
                       {/* Inquiry details if it's an inquiry */}
                       {relatedInquiry && (
                         <div>
                           <div className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-1">Inquiry Context</div>
                           <div className="font-sans text-xs text-brand-ivory mb-1">Service: {relatedInquiry.serviceInterest || 'Not specified'}</div>
                           {relatedInquiry.budgetRange && <div className="font-sans text-xs text-brand-ivory mb-1">Budget: {relatedInquiry.budgetRange}</div>}
                           <div className="font-mono text-[9px] uppercase text-brand-muted">Received: {format(relatedInquiry.createdAt, 'MMM d')}</div>
                         </div>
                       )}

                       {/* Quote */}
                       {actQuote && (
                         <div>
                           <div className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Active Quote</div>
                           <div className="font-sans text-xs text-brand-ivory">{actQuote.quoteNumber}</div>
                           <div className="font-sans text-xs text-brand-ivory font-bold">{actQuote.total.toLocaleString()} {actQuote.currency} ({actQuote.status})</div>
                         </div>
                       )}

                       {/* Project */}
                       {actProj && (
                         <div>
                           <div className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Active Project</div>
                           <div className="font-sans text-xs text-brand-ivory truncate">{actProj.name}</div>
                           {actProj.deadline && <div className="font-sans text-xs text-brand-muted">Due: {format(actProj.deadline, 'MMM d')}</div>}
                         </div>
                       )}

                       {/* Outstanding Invoices */}
                       {outInvs.length > 0 && (
                         <div>
                           <div className="font-mono text-[9px] uppercase tracking-widest text-red-500 mb-1 flex items-center gap-1"><Receipt className="w-3 h-3" /> Money Owed</div>
                           <div className="font-sans text-xs text-brand-ivory font-bold">{outInvs.reduce((acc, i) => acc + (i.total - (i.amountPaid || 0)), 0).toLocaleString()}</div>
                           <div className="font-mono text-[9px] uppercase text-brand-muted mt-1">{outInvs.length} invoice(s)</div>
                         </div>
                       )}

                       {/* Past Meetings */}
                       {pastMeets.length > 0 && (
                         <div className="pt-4 border-t border-brand-border/50">
                           <div className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Previous Call</div>
                           <div className="font-sans text-xs text-brand-ivory mb-1 truncate">{pastMeets[0].title}</div>
                           <div className="font-mono text-[9px] uppercase text-brand-muted">{format(pastMeets[0].date, 'MMM d, yyyy')}</div>
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </div>

              {(!selectedMeeting || selectedMeeting.status === 'PENDING') && (
                <div className="p-6 border-t border-brand-border bg-brand-charcoal shrink-0">
                  <Button variant="primary" onClick={handleSave} className="w-full">
                    {selectedMeeting ? 'Update Call Details' : 'Schedule Call'}
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
