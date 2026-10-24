import React, { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { Card } from '../components/ui/DesignSystem';
import { format } from 'date-fns';
import { Activity as ActivityIcon, MessageSquare, Briefcase, FileText, Calendar, CheckSquare, Settings } from 'lucide-react';

export default function Activity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getRecentActivity();
      setActivities(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const getIconForType = (type: string) => {
    if (type.includes('INQUIRY')) return <MessageSquare className="w-4 h-4 text-brand-ivory" />;
    if (type.includes('CLIENT') || type.includes('PROJECT')) return <Briefcase className="w-4 h-4 text-brand-ivory" />;
    if (type.includes('QUOTE') || type.includes('INVOICE')) return <FileText className="w-4 h-4 text-brand-ivory" />;
    if (type.includes('MEETING')) return <Calendar className="w-4 h-4 text-brand-ivory" />;
    if (type.includes('TASK')) return <CheckSquare className="w-4 h-4 text-brand-ivory" />;
    return <Settings className="w-4 h-4 text-brand-ivory" />;
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold italic tracking-tight">Activity Stream</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted mt-1">System Timeline</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="p-8 text-center font-mono text-[10px] text-brand-muted tracking-widest uppercase">Loading Timeline...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 border border-brand-border/30 text-center font-mono text-[10px] text-brand-muted tracking-widest uppercase bg-brand-charcoal-light">
            No Activity Recorded
          </div>
        ) : (
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-[21px] top-4 bottom-4 w-px bg-brand-border/50"></div>
            {activities.map((item, index) => (
              <div key={item.id} className="flex gap-4 items-start relative z-10 group">
                <div className="w-11 h-11 rounded-full bg-brand-charcoal border border-brand-border flex items-center justify-center shrink-0 group-hover:border-brand-accent transition-colors">
                  {getIconForType(item.type)}
                </div>
                <Card className="flex-1 p-4 bg-brand-charcoal-light group-hover:border-brand-accent transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-bold text-brand-ivory">{item.description}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mt-1">
                        {item.type} • {item.actorId || 'SYSTEM'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted shrink-0">
                      {format(item.createdAt, 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
