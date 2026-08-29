import React, { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { Client } from '../types';
import { Button } from '../components/ui/DesignSystem';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Building2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { createSpreadsheet } from '../lib/google';
import { useGoogle } from '../contexts/GoogleContext';

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isAuthorized } = useGoogle();

  useEffect(() => {
    async function load() {
      const data = await api.getClients();
      setClients(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = async () => {
    if (!isAuthorized) {
      alert("Please connect Google Workspace in Settings to export to Sheets.");
      return;
    }
    setExporting(true);
    try {
      const data = [
        ['ID', 'Name', 'Company', 'Email', 'Phone', 'Website', 'Created At'],
        ...filtered.map(c => [
          c.id || '',
          c.name,
          c.company || '',
          c.email || '',
          c.phone || '',
          c.website || '',
          format(c.createdAt, 'yyyy-MM-dd')
        ])
      ];
      const sheet = await createSpreadsheet(`Clients Export - ${format(new Date(), 'yyyy-MM-dd')}`, data);
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
          <h1 className="text-2xl font-display uppercase tracking-widest text-brand-ivory mb-1">Clients</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Active Relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-brand-charcoal border border-brand-border pl-9 pr-3 py-2 text-xs font-mono text-brand-ivory placeholder:text-brand-muted focus:outline-none focus:border-brand-accent w-64 transition-colors"
            />
          </div>
          <Button icon={Download} variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button icon={Plus} onClick={() => navigate('/admin/clients/new')}>New Client</Button>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-brand-muted text-xs uppercase tracking-widest animate-pulse mt-8">Fetching records...</div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border bg-brand-charcoal/30 p-12">
          <Building2 className="w-8 h-8 text-brand-muted mb-4" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-brand-ivory mb-2">No Clients Found</h2>
          <p className="text-[10px] text-brand-muted font-mono uppercase tracking-widest text-center">
            {search ? 'Adjust search parameters' : 'Convert inquiries to populate the client roster.'}
          </p>
        </div>
      ) : (
        <div className="bg-brand-charcoal border border-brand-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-black/50">
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Entity Name</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Primary Contact</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Website</th>
                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-brand-muted font-normal">Since</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  key={client.id} 
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                  className="border-b border-brand-border/50 hover:bg-brand-charcoal-light cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-4">
                    <span className="font-sans text-sm font-medium text-brand-ivory group-hover:text-brand-accent transition-colors">{client.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-sans text-sm text-brand-ivory/80">{client.primaryContact || '-'}</span>
                      <span className="font-mono text-[10px] text-brand-muted mt-1">{client.email || client.phone || ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-brand-muted">{client.website || '-'}</td>
                  <td className="px-4 py-4 font-mono text-xs text-brand-muted">
                    {format(client.createdAt, 'MMM yyyy')}
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
