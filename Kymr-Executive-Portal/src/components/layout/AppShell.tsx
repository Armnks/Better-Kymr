import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { 
  Command, Inbox as InboxIcon, GitMerge, Calendar, Users, FileText, 
  Briefcase, CheckSquare, Receipt, Activity, Settings, 
  Search, LogOut, Menu, X, Mail, Folder, HardDrive, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CommandPalette } from '../ui/CommandPalette';

import { NotificationCenter } from '../ui/NotificationCenter';

export function AppShell() {
  const { user, logOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const salesItems = [
    { label: 'Inquiries', path: '/admin/inquiries', icon: InboxIcon },
    { label: 'Pipeline', path: '/admin/pipeline', icon: GitMerge },
    { label: 'Clients', path: '/admin/clients', icon: Users },
    { label: 'Meetings', path: '/admin/meetings', icon: Calendar },
    { label: 'Quotes', path: '/admin/quotes', icon: FileText },
  ];

  const workItems = [
    { label: 'Projects', path: '/admin/projects', icon: Briefcase },
    { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
  ];

  const financeItems = [
    { label: 'Invoices', path: '/admin/invoices', icon: Receipt },
  ];

  const workspaceItems = [
    { label: 'Inbox', path: '/admin/inbox', icon: Mail },
    { label: 'Files', path: '/admin/files', icon: HardDrive },
  ];

  const systemItems = [
    { label: 'Activity', path: '/admin/activity', icon: Activity },
    { label: 'Settings', path: '/admin/settings/services', icon: Settings },
  ];

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <>
      {(!isSidebarCollapsed || isMobileMenuOpen) && <div className="text-[10px] uppercase tracking-widest text-brand-muted-dark px-3 mb-2 mt-6 font-semibold whitespace-nowrap overflow-hidden">{title}</div>}
      {isSidebarCollapsed && !isMobileMenuOpen && <div className="my-3 border-t border-brand-border/50"></div>}
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 text-xs font-sans font-medium rounded-sm transition-colors group",
            isActive 
              ? "bg-brand-accent text-black" 
              : "text-brand-muted hover:text-brand-ivory hover:bg-brand-surface-highlight",
            isSidebarCollapsed && !isMobileMenuOpen ? "justify-center" : ""
          )}
          title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (isActive ? <span className="w-1 h-3 bg-black shrink-0"></span> : <span className="w-1 h-3 opacity-0 group-hover:opacity-100 bg-brand-border transition-colors shrink-0"></span>)}
              <item.icon className="w-4 h-4 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="uppercase whitespace-nowrap overflow-hidden">{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-brand-black text-brand-ivory overflow-hidden selection:bg-brand-accent selection:text-brand-black">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-brand-black/80 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-brand-charcoal border-r border-brand-border flex flex-col transition-all duration-300 ease-in-out lg:static",
          isMobileMenuOpen ? "translate-x-0 w-56" : "-translate-x-full lg:translate-x-0",
          isSidebarCollapsed ? "lg:w-16" : "lg:w-56"
        )}
      >
        <div className="p-4 border-b border-brand-border flex items-center justify-between min-h-[56px]">
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <h1 className="text-xl tracking-tighter font-display font-bold italic leading-none">KYMRSTUDIO</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-brand-muted mt-1">Executive Portal v1.0</p>
            </div>
          )}
          {isSidebarCollapsed && !isMobileMenuOpen && (
            <div className="w-full flex justify-center">
              <span className="text-xl tracking-tighter font-display font-bold italic">K</span>
            </div>
          )}
          <button 
            className="lg:hidden text-brand-muted hover:text-brand-ivory"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 space-y-1">
          <NavLink
            to="/admin"
            end={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 text-xs font-sans font-medium rounded-sm transition-colors group",
              isActive 
                ? "bg-brand-accent text-black" 
                : "text-brand-muted hover:text-brand-ivory hover:bg-brand-surface-highlight",
              isSidebarCollapsed && !isMobileMenuOpen ? "justify-center" : ""
            )}
            title={isSidebarCollapsed && !isMobileMenuOpen ? 'Command' : undefined}
          >
            {({ isActive }) => (
              <>
                {(!isSidebarCollapsed || isMobileMenuOpen) && (isActive ? <span className="w-1 h-3 bg-black shrink-0"></span> : <span className="w-1 h-3 opacity-0 group-hover:opacity-100 bg-brand-border transition-colors shrink-0"></span>)}
                <Command className="w-4 h-4 shrink-0" />
                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="uppercase whitespace-nowrap overflow-hidden">Command</span>}
              </>
            )}
          </NavLink>

          <NavGroup title="Sales" items={salesItems} />
          <NavGroup title="Work" items={workItems} />
          <NavGroup title="Finance" items={financeItems} />
          <NavGroup title="Workspace" items={workspaceItems} />
          <NavGroup title="System" items={systemItems} />
        </nav>

        <div className="p-4 border-t border-brand-border bg-brand-charcoal flex flex-col">
          {(!isSidebarCollapsed || isMobileMenuOpen) ? (
            <>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-brand-muted-dark mb-1">
                <span>Database</span>
                <span className="text-brand-accent">Healthy</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 shrink-0 bg-brand-surface-highlight border border-brand-border-light rounded-full flex items-center justify-center text-[10px]">
                    {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                  <div className="text-[11px] leading-none overflow-hidden">
                    <div className="font-bold text-white">ADMIN</div>
                    <div className="text-brand-muted mt-1 uppercase text-[9px] truncate max-w-[100px]">{user?.email}</div>
                  </div>
                </div>
                <button onClick={logOut} className="text-brand-muted hover:text-brand-accent-red transition-colors ml-2 shrink-0">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 shrink-0 bg-brand-surface-highlight border border-brand-border-light rounded-full flex items-center justify-center text-[10px]">
                {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <button onClick={logOut} className="text-brand-muted hover:text-brand-accent-red transition-colors shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-brand-black relative h-screen">
        {/* Topbar */}
        <header className="h-14 border-b border-brand-border flex items-center justify-between px-4 lg:px-8 bg-brand-black sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="hidden lg:flex text-brand-muted hover:text-brand-ivory items-center justify-center w-8 h-8 rounded-sm bg-brand-surface-highlight border border-brand-border-light"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title="Toggle Sidebar"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button 
              className="lg:hidden text-brand-ivory"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted uppercase font-mono">Search</span>
              <button onClick={() => setIsCommandOpen(true)} className="bg-brand-surface-highlight border border-brand-border-light rounded-sm pl-16 pr-4 py-1.5 text-xs w-64 text-left focus:outline-none focus:border-brand-accent text-brand-muted hover:text-brand-ivory transition-colors">
                CMD + K
              </button>
            </div>
            <button 
              onClick={() => setIsCommandOpen(true)}
              className="sm:hidden flex items-center gap-2 px-3 py-1.5 bg-brand-surface-highlight border border-brand-border-light text-brand-muted hover:text-brand-ivory transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <NotificationCenter />
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full pb-8">
            <Outlet />
          </div>
        </div>

        <footer className="h-8 shrink-0 bg-brand-charcoal border-t border-brand-border px-8 flex items-center justify-between text-[9px] uppercase tracking-widest text-brand-muted-dark font-mono hidden md:flex">
          <div>Secure Session Active: ADMIN_X109</div>
          <div className="hidden sm:block">System Health: 100% Operational</div>
        </footer>
      </main>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}
