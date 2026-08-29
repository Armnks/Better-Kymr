import React, { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { Inquiry } from '../types';
import { Button, Badge } from '../components/ui/DesignSystem';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { createSpreadsheet } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';

export default function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isAuthorized } = useGoogle();

  useEffect(() => {
    async function load() {
      const data = await api.getInquiries();
      setInquiries(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = inquiries.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.company && i.company.toLowerCase().includes(search.toLowerCase())) ||
    (i.email && i.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = async () => {
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to export to Sheets.");
      return;
    }
    setExporting(true);
    try {
      const data = [
        ['ID', 'Contact Name', 'Company', 'Email', 'Phone', 'Service Interest', 'Status', 'Priority', 'Received Date'],
        ...filtered.map(i => [
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
      const sheet = await createSpreadsheet(`Inquiries Export - ${format(new Date(), 'yyyy-MM-dd')}`, data);
      window.open(sheet.spreadsheetUrl, '_blank');
    } catch (e) {
      console.error(e);
      alert("Failed to export to Sheets");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest text-brand-ivory mb-1">Inquiries</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Inquiry Pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search inquiries..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-brand-charcoal border border-brand-border pl-9 pr-3 py-2 text-xs font-mono text-brand-ivory placeholder:text-brand-muted focus:outline-none focus:border-brand-accent w-64 transition-colors"
            />
          </div>
          <Button icon={Download} variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button icon={Plus} onClick={() => navigate('/admin/inquiries/new')}>New Inquiry</Button>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse mt-8">Fetching records...</div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border bg-brand-charcoal/30 p-12">
          <InboxIcon className="w-8 h-8 text-brand-muted mb-4" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-brand-ivory mb-2">No Inquiries Found</h2>
          <p className="text-[10px] text-brand-muted font-mono uppercase tracking-widest text-center">
            {search ? 'Adjust search parameters' : 'The pipeline is currently clear.'}
          </p>
        </div>
      ) : (
        <div className="bg-brand-charcoal border border-brand-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-black/50">
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Contact</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Company</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Interest</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Status</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Priority</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inq, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  key={inq.id} 
                  onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
                  className="border-b border-brand-border/50 hover:bg-brand-charcoal-light cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-sans text-sm text-brand-ivory group-hover:text-brand-accent transition-colors">{inq.name}</span>
                      <span className="font-mono text-[10px] text-brand-muted mt-1 truncate max-w-[150px]">{inq.email || inq.phone || 'No contact info'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-sans text-sm text-brand-ivory/80">{inq.company || '-'}</td>
                  <td className="px-4 py-4 font-mono text-xs text-brand-muted">{inq.serviceInterest || '-'}</td>
                  <td className="px-4 py-4">
                    <Badge variant={inq.status === 'NEW' ? 'success' : inq.status === 'LOST' ? 'danger' : 'default'}>
                      {inq.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {inq.priority ? (
                      <Badge variant={inq.priority === 'URGENT' ? 'danger' : inq.priority === 'HIGH' ? 'warning' : 'default'}>
                        {inq.priority}
                      </Badge>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-brand-muted">
                    {format(inq.createdAt, 'MMM d, yyyy')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InboxIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    </svg>
  );
}
