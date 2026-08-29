import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/db';
import { Inquiry, ActivityEvent, Client, Meeting, Quote, Project, Task, Invoice, Payment } from '../types';
import { Button, Badge } from '../components/ui/DesignSystem';
import { 
  Inbox, Calendar, FileText, Briefcase, CheckSquare, Receipt, 
  ArrowRight, Plus, Phone, Users, CheckCircle, Search, AlertCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttentionItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  icon: React.ElementType;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [inqData, actData, meetData, quoteData, taskData, invData, projData] = await Promise.all([
          api.getInquiries(),
          api.getRecentActivity(),
          api.getMeetings(),
          api.getQuotes(),
          api.getTasks(),
          api.getInvoices(),
          api.getProjects()
        ]);
        setInquiries(inqData || []);
        setActivity(actData || []);
        setMeetings(meetData || []);
        setQuotes(quoteData || []);
        setTasks(taskData || []);
        setInvoices(invData || []);
        setProjects(projData || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Attention Engine
  const attentionItems: AttentionItem[] = [];

  // Inquiries
  inquiries.filter(i => i.status === 'NEW').forEach(i => {
    attentionItems.push({
      id: `inq-new-${i.id}`,
      priority: 'HIGH',
      title: `NEW INQUIRY: ${i.name}`,
      description: `Received ${new Date(i.createdAt).toLocaleDateString()}. Needs review.`,
      actionLabel: 'REVIEW',
      onClick: () => navigate(`/admin/inquiries/${i.id}`),
      icon: Inbox
    });
  });

  // Meetings
  meetings.filter(m => m.status === 'PENDING').forEach(m => {
    const meetTime = new Date(m.date);
    if (meetTime >= startOfToday && meetTime <= endOfToday) {
      const diffMins = Math.floor((meetTime.getTime() - now.getTime()) / 60000);
      attentionItems.push({
        id: `meet-today-${m.id}`,
        priority: diffMins > 0 && diffMins < 60 ? 'CRITICAL' : 'HIGH',
        title: `CALL TODAY: ${m.title}`,
        description: `Scheduled with ${m.attendeeName} at ${meetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        actionLabel: 'JOIN / PREP',
        onClick: () => navigate(`/admin/meetings`),
        icon: Phone
      });
    }
  });

  meetings.filter(m => m.status === 'COMPLETED' && new Date(m.date) > threeDaysAgo).forEach(m => {
    if (!m.notes) {
      attentionItems.push({
        id: `meet-comp-${m.id}`,
        priority: 'NORMAL',
        title: `CALL COMPLETED`,
        description: `Meeting with ${m.attendeeName} finished. No notes recorded.`,
        actionLabel: 'ADD NOTES',
        onClick: () => navigate(`/admin/meetings`),
        icon: Phone
      });
    }
  });

  // Quotes
  quotes.filter(q => q.status === 'SENT').forEach(q => {
    if (q.sentAt && new Date(q.sentAt) < threeDaysAgo) {
      attentionItems.push({
        id: `quote-follow-${q.id}`,
        priority: 'NORMAL',
        title: `QUOTE SENT: ${q.title}`,
        description: `Sent ${Math.floor((now.getTime() - new Date(q.sentAt).getTime())/86400000)} days ago. No outcome recorded.`,
        actionLabel: 'FOLLOW UP',
        onClick: () => navigate(`/admin/quotes?id=${q.id}`),
        icon: FileText
      });
    }
  });

  quotes.filter(q => q.status === 'ACCEPTED').forEach(q => {
    const hasProject = projects.some(p => p.quoteId === q.id);
    if (!hasProject) {
      attentionItems.push({
        id: `quote-accept-${q.id}`,
        priority: 'HIGH',
        title: `QUOTE ACCEPTED: ${q.title}`,
        description: `Client accepted the quote. Project needs to be started.`,
        actionLabel: 'START PROJECT',
        onClick: () => navigate(`/admin/projects?create=true&quoteId=${q.id}`),
        icon: FileText
      });
    }
  });

  // Projects & Tasks
  projects.filter(p => p.status === 'IN_PROGRESS').forEach(p => {
    if (p.deadline && new Date(p.deadline) < now) {
      attentionItems.push({
        id: `proj-overdue-${p.id}`,
        priority: 'CRITICAL',
        title: `PROJECT OVERDUE: ${p.name}`,
        description: `Deadline was ${new Date(p.deadline).toLocaleDateString()}.`,
        actionLabel: 'REVIEW',
        onClick: () => navigate(`/admin/projects/${p.id}`),
        icon: AlertCircle
      });
    }
  });

  tasks.filter(t => t.status !== 'DONE').forEach(t => {
    if (t.dueDate) {
      const due = new Date(t.dueDate);
      if (due < startOfToday) {
        attentionItems.push({
          id: `task-overdue-${t.id}`,
          priority: 'HIGH',
          title: `TASK OVERDUE: ${t.title}`,
          description: `Due ${due.toLocaleDateString()}.`,
          actionLabel: 'OPEN TASK',
          onClick: () => navigate(`/admin/tasks`),
          icon: CheckSquare
        });
      } else if (due >= startOfToday && due <= endOfToday) {
        attentionItems.push({
          id: `task-today-${t.id}`,
          priority: 'NORMAL',
          title: `TASK DUE TODAY: ${t.title}`,
          description: `Needs completion today.`,
          actionLabel: 'OPEN TASK',
          onClick: () => navigate(`/admin/tasks`),
          icon: CheckSquare
        });
      }
    }
  });

  // Invoices
  invoices.filter(i => i.status === 'OVERDUE' || (i.status === 'SENT' && i.dueDate && new Date(i.dueDate) < startOfToday)).forEach(i => {
    attentionItems.push({
      id: `inv-overdue-${i.id}`,
      priority: 'CRITICAL',
      title: `INVOICE OVERDUE: ${i.invoiceNumber}`,
      description: `Payment of ${i.total - (i.amountPaid || 0)} ${i.currency} is overdue.`,
      actionLabel: 'FOLLOW UP',
      onClick: () => navigate(`/admin/invoices?id=${i.id}`),
      icon: Receipt
    });
  });

  // Sort Attention Items
  const priorityWeight = { CRITICAL: 3, HIGH: 2, NORMAL: 1, LOW: 0 };
  attentionItems.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  
  const displayItems = attentionItems.slice(0, 6);

  // Today Timeline
  const todayEvents = [
    ...meetings.filter(m => new Date(m.date) >= startOfToday && new Date(m.date) <= endOfToday).map(m => ({
      time: new Date(m.date),
      type: 'Meeting',
      title: m.title,
      person: m.attendeeName,
      status: m.status
    })),
    ...tasks.filter(t => t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday).map(t => ({
      time: new Date(t.dueDate!), // Tasks might not have exact time, assume EOD or just sort date
      type: 'Task',
      title: t.title,
      person: '',
      status: t.status
    }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  // Pipeline Snapshot
  const pipelineCounts = {
    NEW: inquiries.filter(i => i.status === 'NEW').length,
    QUALIFIED: inquiries.filter(i => i.status === 'QUALIFIED').length,
    CONTACTED: inquiries.filter(i => i.status === 'CONTACTED').length,
    MEETING: inquiries.filter(i => i.status === 'MEETING').length,
    QUOTED: inquiries.filter(i => i.status === 'QUOTED').length,
    WON: inquiries.filter(i => i.status === 'WON').length,
  };

  // Finance
  const curGroups = invoices.reduce((acc, i) => {
    if (!acc[i.currency]) acc[i.currency] = { outstanding: 0, overdue: 0, paid: 0 };
    if (i.status === 'SENT' || i.status === 'PARTIALLY_PAID') acc[i.currency].outstanding += (i.total - (i.amountPaid || 0));
    if (i.status === 'OVERDUE' || (i.status === 'SENT' && i.dueDate && new Date(i.dueDate) < startOfToday)) acc[i.currency].overdue += (i.total - (i.amountPaid || 0));
    if (i.status === 'PAID' && new Date(i.updatedAt).getMonth() === now.getMonth()) acc[i.currency].paid += i.total;
    return acc;
  }, {} as Record<string, { outstanding: number, overdue: number, paid: number }>);

  if (loading) {
    return <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse">Initializing Command Center...</div>;
  }

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* 1. GREETING & ATTENTION */}
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">{getGreeting()}</h1>
          <p className="font-mono text-xs text-brand-muted uppercase tracking-widest">KymrStudio Command Center</p>
        </div>

        <div className="bg-brand-charcoal border border-brand-border p-6 md:p-8">
          <h2 className="font-sans text-xs uppercase tracking-widest font-bold text-brand-ivory mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full inline-block animate-pulse"></span>
            Here's what needs your attention
          </h2>
          
          {displayItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayItems.map(item => (
                <div key={item.id} className={`p-4 bg-brand-surface border flex flex-col justify-between group transition-colors ${item.priority === 'CRITICAL' ? 'border-red-500/50 hover:border-red-500' : 'border-brand-border hover:border-brand-accent'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`mt-1 p-2 rounded-full flex shrink-0 ${item.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-brand-surface-highlight text-brand-accent'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 ${item.priority === 'CRITICAL' ? 'bg-red-500 text-white' : item.priority === 'HIGH' ? 'bg-brand-accent text-black' : 'bg-brand-muted/20 text-brand-muted'}`}>
                          {item.priority}
                        </span>
                      </div>
                      <h3 className="font-sans font-bold text-brand-ivory text-sm">{item.title}</h3>
                      <p className="font-sans text-xs text-brand-muted mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-brand-border/50 pt-3 mt-auto">
                    <Button variant={item.priority === 'CRITICAL' ? 'default' : 'outline'} size="sm" onClick={item.onClick} className={item.priority === 'CRITICAL' ? 'bg-red-500 text-white hover:bg-red-600 border-none' : ''}>
                      {item.actionLabel}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center p-12 border border-dashed border-brand-border bg-brand-surface text-center">
              <div className="w-12 h-12 rounded-full bg-brand-surface-highlight flex items-center justify-center text-green-500 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="font-bold text-brand-ivory text-xl mb-1">You're clear.</div>
              <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">No immediate actions require your attention.</div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* QUICK ACTIONS */}
          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Client', icon: Users, path: '/admin/clients?create=true' },
                { label: 'Call', icon: Phone, path: '/admin/meetings?create=true' },
                { label: 'Quote', icon: FileText, path: '/admin/quotes?create=true' },
                { label: 'Project', icon: Briefcase, path: '/admin/projects?create=true' },
                { label: 'Invoice', icon: Receipt, path: '/admin/invoices?create=true' },
                { label: 'Task', icon: CheckSquare, path: '/admin/tasks?create=true' },
              ].map(action => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border hover:border-brand-accent hover:text-brand-ivory transition-colors text-brand-muted group font-mono text-[10px] uppercase tracking-widest"
                >
                  <action.icon className="w-3.5 h-3.5 group-hover:text-brand-accent transition-colors" />
                  + {action.label}
                </button>
              ))}
            </div>
          </section>

          {/* MONEY */}
          <section>
             <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-4">Money Outstanding</h2>
             {Object.keys(curGroups).length > 0 ? (
               <div className="grid grid-cols-1 gap-6">
                 {Object.entries(curGroups).map(([cur, data]: [string, { outstanding: number, overdue: number, paid: number }]) => (
                   <div key={cur} className="grid grid-cols-3 gap-4 border border-brand-border bg-brand-surface p-6">
                      <div>
                        <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-2">Outstanding ({cur})</div>
                        <div className="text-2xl font-light text-brand-ivory">{data.outstanding.toLocaleString()}</div>
                      </div>
                      <div className="border-l border-brand-border pl-4">
                        <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-500" /> Overdue
                        </div>
                        <div className={`text-2xl font-light ${data.overdue > 0 ? 'text-red-500' : 'text-brand-ivory'}`}>{data.overdue.toLocaleString()}</div>
                      </div>
                      <div className="border-l border-brand-border pl-4">
                        <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-2">Paid This Month</div>
                        <div className="text-2xl font-light text-brand-ivory">{data.paid.toLocaleString()}</div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="p-6 border border-dashed border-brand-border bg-brand-surface text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">No financial records found</span>
                </div>
             )}
          </section>

          {/* PIPELINE SNAPSHOT */}
          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-4">Pipeline Snapshot</h2>
            <div className="flex border border-brand-border bg-brand-surface overflow-x-auto">
               {[
                 { label: 'New', count: pipelineCounts.NEW, color: 'text-brand-ivory' },
                 { label: 'Qual', count: pipelineCounts.QUALIFIED, color: 'text-brand-ivory' },
                 { label: 'Cont', count: pipelineCounts.CONTACTED, color: 'text-brand-ivory' },
                 { label: 'Meet', count: pipelineCounts.MEETING, color: 'text-brand-ivory' },
                 { label: 'Quote', count: pipelineCounts.QUOTED, color: 'text-brand-accent' },
                 { label: 'Won', count: pipelineCounts.WON, color: 'text-green-500' },
               ].map((stage, idx, arr) => (
                 <div key={stage.label} className={`flex-1 p-4 ${idx !== arr.length - 1 ? 'border-r border-brand-border' : ''} min-w-[80px]`}>
                   <div className="font-mono text-[9px] text-brand-muted uppercase tracking-widest mb-2">{stage.label}</div>
                   <div className={`text-xl font-bold ${stage.color}`}>{stage.count}</div>
                 </div>
               ))}
            </div>
          </section>

        </div>

        <div className="flex flex-col gap-10">
          {/* TODAY TIMELINE */}
          <section className="bg-brand-surface border border-brand-border p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-ivory font-bold mb-6 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-accent" />
              Today
            </h2>
            
            {todayEvents.length > 0 ? (
              <div className="relative border-l-2 border-brand-border-light ml-2 space-y-6">
                {todayEvents.map((evt, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-accent"></div>
                    <div className="font-mono text-[10px] text-brand-accent uppercase tracking-widest mb-1">
                      {evt.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="font-sans font-bold text-sm text-brand-ivory mb-0.5">{evt.title}</div>
                    <div className="font-sans text-xs text-brand-muted">{evt.type} {evt.person ? `with ${evt.person}` : ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-50">
                <Calendar className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                <div className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">No scheduled events today</div>
              </div>
            )}
          </section>

          {/* PROJECT HEALTH */}
          <section className="bg-brand-surface border border-brand-border p-6">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-4">Project Health</h2>
            <div className="space-y-4">
               {projects.filter(p => p.status === 'IN_PROGRESS').length === 0 ? (
                 <div className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">No active projects</div>
               ) : projects.filter(p => p.status === 'IN_PROGRESS').map(p => {
                 let health = 'ON TRACK';
                 let color = 'text-green-500 bg-green-500/10';
                 if (p.deadline && new Date(p.deadline) < now) {
                   health = 'OVERDUE';
                   color = 'text-red-500 bg-red-500/10';
                 }
                 // Simple health simulation, can be expanded with tasks
                 return (
                   <div key={p.id} className="flex items-center justify-between py-2 border-b border-brand-border/50 last:border-0 cursor-pointer hover:opacity-80" onClick={() => navigate(`/admin/projects/${p.id}`)}>
                     <div className="font-sans text-sm text-brand-ivory truncate pr-4">{p.name}</div>
                     <div className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 shrink-0 ${color}`}>{health}</div>
                   </div>
                 );
               })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
