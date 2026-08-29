import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../lib/db';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  link?: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
    // Simulate real-time by polling every 60s for demo purposes
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    // In a real app, these would come from a 'notifications' collection tailored to the user.
    // For this prototype, we'll synthesize meaningful alerts based on recent activity/state.
    try {
      const inqs = await api.getInquiries();
      const newInqs = (inqs || []).filter(i => i.status === 'NEW');
      
      const notifs: Notification[] = [];
      
      // 1. New Inquiries
      if (newInqs.length > 0) {
        notifs.push({
          id: 'new_inquiries',
          type: 'INFO',
          title: 'New Inquiries',
          message: `You have ${newInqs.length} new inquiries awaiting review.`,
          createdAt: new Date(),
          read: false,
          link: '/admin/inquiries'
        });
      }

      // 2. Overdue Invoices
      const invs = await api.getInvoices();
      const overdueInvs = (invs || []).filter(i => i.status === 'OVERDUE');
      if (overdueInvs.length > 0) {
        notifs.push({
          id: 'overdue_invoices',
          type: 'WARNING',
          title: 'Overdue Invoices',
          message: `${overdueInvs.length} invoices are currently overdue.`,
          createdAt: new Date(),
          read: false,
          link: '/admin/invoices'
        });
      }

      // 3. Meetings today
      const meets = await api.getMeetings();
      const today = new Date();
      const todaysMeets = (meets || []).filter(m => m.status === 'PENDING' && m.date.toDateString() === today.toDateString());
      if (todaysMeets.length > 0) {
         notifs.push({
           id: 'meetings_today',
           type: 'INFO',
           title: 'Meetings Today',
           message: `You have ${todaysMeets.length} calls scheduled for today.`,
           createdAt: new Date(),
           read: false,
           link: '/admin/meetings'
         });
      }

      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-brand-muted hover:text-brand-ivory transition-colors flex items-center justify-center w-8 h-8 rounded-sm hover:bg-brand-surface-highlight"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-accent rounded-full border border-brand-black"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-brand-charcoal border border-brand-border shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]"
            >
              <div className="p-3 border-b border-brand-border flex items-center justify-between bg-brand-black">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-ivory">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] bg-brand-accent text-black px-1.5 py-0.5 rounded-sm font-bold">{unreadCount} New</span>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-5 h-5 text-brand-muted mx-auto mb-2 opacity-50" />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">All clear</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-3 border-b border-brand-border/50 hover:bg-brand-surface transition-colors cursor-pointer",
                          !n.read ? "bg-brand-surface/50" : ""
                        )}
                        onClick={() => {
                          if (n.link) window.location.href = n.link;
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-400" />}
                            {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-brand-accent" />}
                            {n.type === 'ERROR' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-sans font-bold text-xs text-brand-ivory">{n.title}</span>
                              <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest">
                                {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="font-sans text-xs text-brand-muted leading-snug">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
