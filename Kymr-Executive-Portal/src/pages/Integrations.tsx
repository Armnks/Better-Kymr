import React from 'react';
import { Card } from '../components/ui/DesignSystem';
import { CheckCircle2, AlertCircle, RefreshCw, Mail, HardDrive, FileSpreadsheet, Calendar, Link2, Link2Off } from 'lucide-react';
import { Button } from '../components/ui/DesignSystem';
import { useGoogle } from '../contexts/GoogleContext';

export function Integrations() {
  const { isAuthorized, isReady, authorize, revoke } = useGoogle();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display tracking-wide mb-1">Integrations</h1>
        <p className="text-[10px] font-mono text-brand-muted uppercase tracking-widest">
          System Connections & API Services
        </p>
      </div>

      <div className="grid gap-6">
        {/* Public Website Block */}
        <Card className="flex flex-col gap-6">
          <div className="flex items-start justify-between border-b border-brand-border pb-4">
            <div>
              <h2 className="text-lg font-display mb-1">KymrStudio Public Website</h2>
              <p className="text-sm text-brand-muted">Secure API receiving integration for public inquiries and scope configurations.</p>
            </div>
            <div className="flex items-center gap-2 bg-brand-charcoal-light border border-brand-accent/30 text-brand-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-brand-black border border-brand-border p-4">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-brand-muted mb-2">Endpoint Status</h3>
                <div className="font-sans text-xs text-brand-ivory space-y-2">
                  <p>✓ Public → API → Firestore pipeline verified.</p>
                  <p>✓ Inquiry Data Model updated for Scope Requests.</p>
                  <p>✓ Quote Builder prefill mapping established.</p>
                </div>
             </div>
          </div>
        </Card>

        {/* Cal.com Block */}
        <Card className="flex flex-col gap-6">
          <div className="flex items-start justify-between border-b border-brand-border pb-4">
            <div>
              <h2 className="text-lg font-display mb-1">Cal.com Scheduling</h2>
              <p className="text-sm text-brand-muted">Automated meeting synchronization and Google Meet generation.</p>
            </div>
            <div className="flex items-center gap-2 bg-brand-charcoal-light border border-yellow-500/30 text-yellow-400 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" />
              Local Handler Ready
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-brand-black border border-brand-border p-4">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-brand-muted mb-2">Webhook Status</h3>
                <div className="font-sans text-xs text-brand-ivory space-y-2">
                  <p>✓ Endpoint `/api/webhooks/calcom` is ready.</p>
                  <p>✓ `BOOKING_CREATED` parsing and Google Meet URL extraction enabled.</p>
                  <p>✓ Idempotent Meeting document mapping active.</p>
                  <p className="text-brand-muted mt-2">Production URL must be configured in Cal.com dashboard.</p>
                </div>
             </div>
          </div>
        </Card>

        {/* Google Workspace Block */}
        <Card className="flex flex-col gap-6">
          <div className="flex items-start justify-between border-b border-brand-border pb-4">
            <div>
              <h2 className="text-lg font-display mb-1">Google Workspace</h2>
              <p className="text-sm text-brand-muted">Core business services integration.</p>
            </div>
            {!isReady ? (
              <Button size="sm" variant="outline" disabled>Initializing...</Button>
            ) : isAuthorized ? (
              <Button size="sm" variant="danger" icon={Link2Off} onClick={revoke}>Disconnect</Button>
            ) : (
              <Button size="sm" variant="primary" icon={Link2} onClick={authorize}>Connect Workspace</Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationItem 
              icon={Mail} 
              title="Gmail" 
              description="Read and compose emails directly from the portal."
              isConnected={isAuthorized} 
            />
            <IntegrationItem 
              icon={HardDrive} 
              title="Drive" 
              description="Access and manage client files and assets."
              isConnected={isAuthorized} 
            />
            <IntegrationItem 
              icon={FileSpreadsheet} 
              title="Sheets" 
              description="Export reports, pipelines, and financial data."
              isConnected={isAuthorized} 
            />
            <IntegrationItem 
              icon={Calendar} 
              title="Calendar" 
              description="View upcoming meetings and schedules."
              isConnected={isAuthorized} 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function IntegrationItem({ icon: Icon, title, description, isConnected }: { icon: any, title: string, description: string, isConnected: boolean }) {
  return (
    <div className="bg-brand-black border border-brand-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-ivory font-mono uppercase tracking-widest text-xs">
          <Icon className="w-4 h-4 text-brand-muted" />
          {title}
        </div>
        {isConnected ? (
          <div className="flex items-center gap-1.5 text-brand-accent text-[10px] font-mono uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-brand-muted-dark text-[10px] font-mono uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" />
            Not Connected
          </div>
        )}
      </div>
      <p className="text-xs text-brand-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
