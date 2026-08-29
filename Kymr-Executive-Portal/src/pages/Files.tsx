import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/DesignSystem';
import { Search, Folder, File, ExternalLink, HardDrive, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/DesignSystem';
import { useGoogle } from '../contexts/GoogleContext';
import { searchDriveFiles } from '../lib/google';

export function Files() {
  const { isAuthorized } = useGoogle();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    if (isAuthorized) {
      fetchFiles(initialQuery);
    }
  }, [isAuthorized, initialQuery]);

  const fetchFiles = async (query: string) => {
    setLoading(true);
    try {
      // Default to recently modified files if no query
      const q = query ? `name contains '${query}'` : 'trashed = false';
      const results = await searchDriveFiles(q);
      setFiles(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchQuery);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted">
          <HardDrive className="w-6 h-6" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-xl font-display">Drive Not Connected</h1>
          <p className="text-sm text-brand-muted">
            Connect Google Workspace to securely browse and manage files stored in Google Drive.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/admin/settings/integrations'} variant="primary">
          Configure Integrations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display tracking-wide mb-1">Files</h1>
          <p className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">
            Google Drive Repository
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Drive..." 
              className="bg-brand-charcoal border border-brand-border pl-9 pr-3 py-2 text-xs font-mono text-brand-ivory placeholder:text-brand-muted focus:outline-none focus:border-brand-accent w-64 transition-colors"
            />
          </form>
          {/* Note: In a full app, Upload would trigger picker or input[type=file] */}
          <Button icon={Plus} onClick={() => window.open('https://drive.google.com', '_blank')}>Open Drive</Button>
        </div>
      </div>

      <div className="flex-1 bg-brand-surface border border-brand-border overflow-y-auto">
         <div className="p-4 border-b border-brand-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-brand-muted sticky top-0 bg-brand-surface">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span>Recent Files</span>
            </div>
            <button onClick={() => fetchFiles(searchQuery)} className="hover:text-brand-ivory transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
         </div>
         
         {loading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-muted" />
            </div>
         ) : files.length === 0 ? (
            <div className="p-8 text-center border-b border-brand-border border-dashed">
               <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">No files found</p>
            </div>
         ) : (
            <div className="flex flex-col divide-y divide-brand-border">
              {files.map(file => (
                <div key={file.id} className="p-4 hover:bg-brand-charcoal transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    {file.mimeType.includes('folder') ? (
                      <Folder className="w-5 h-5 text-brand-accent" />
                    ) : (
                      <File className="w-5 h-5 text-brand-muted" />
                    )}
                    <div>
                      <div className="font-sans text-sm text-brand-ivory font-medium group-hover:text-brand-accent transition-colors">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-brand-muted font-mono uppercase mt-1 tracking-widest">
                        {new Date(file.createdTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={file.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-brand-muted hover:text-brand-ivory"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}
