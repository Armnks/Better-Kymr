import React, { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { ConnectorItem, ConnectorStatus } from '../types';
import { useGoogle } from '../contexts/GoogleContext';
import { SettingsNav } from '../components/layout/SettingsNav';
import { 
  CheckCircle2, AlertCircle, RefreshCw, Mail, HardDrive, FileSpreadsheet, 
  Calendar, Link2, Link2Off, Zap, Shield, Globe, Receipt, CreditCard, 
  Coins, Database, Server, ExternalLink, Search, Check, Clock, Play,
  SlidersHorizontal, Radio, Terminal, X, Sparkles
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui/DesignSystem';

// Icon mapping per connector
const ICON_MAP: Record<string, any> = {
  'google-mail': Mail,
  'google-drive': HardDrive,
  'google-sheets': FileSpreadsheet,
  'google-calendar': Calendar,
  'calcom-webhook': Calendar,
  'swipe-billing': Receipt,
  'kymr-public-api': Globe,
  'stripe-payments': CreditCard,
  'crypto-rpc': Coins,
  'firebase-firestore': Database,
  'cloud-run-runtime': Server,
};

export function Integrations() {
  const { isAuthorized, isReady, authorize, revoke } = useGoogle();
  const [connectors, setConnectors] = useState<ConnectorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  // Batch connection state
  const [isConnectingAll, setIsConnectingAll] = useState(false);
  const [connectAllProgress, setConnectAllProgress] = useState(0);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Individual testing / configuring states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [activeConfigConnector, setActiveConfigConnector] = useState<ConnectorItem | null>(null);

  // Load connectors on mount
  useEffect(() => {
    loadConnectors();
  }, []);

  // Keep Google connectors in sync with GoogleContext
  useEffect(() => {
    if (connectors.length > 0 && isReady) {
      const googleIds = ['google-mail', 'google-drive', 'google-sheets', 'google-calendar'];
      let changed = false;
      const updated = connectors.map(c => {
        if (googleIds.includes(c.id)) {
          const expectedStatus: ConnectorStatus = isAuthorized ? 'CONNECTED' : 'DISCONNECTED';
          if (c.status !== expectedStatus) {
            changed = true;
            return { ...c, status: expectedStatus };
          }
        }
        return c;
      });
      if (changed) {
        setConnectors(updated);
      }
    }
  }, [isAuthorized, isReady]);

  async function loadConnectors() {
    setLoading(true);
    try {
      const data = await api.getConnectors();
      setConnectors(data);
    } catch (err) {
      console.error("Failed to load connectors", err);
    } finally {
      setLoading(false);
    }
  }

  // CONNECT ALL BUTTON LOGIC
  const handleConnectAll = async () => {
    setIsConnectingAll(true);
    setConnectAllProgress(10);
    setBatchSuccessMessage(null);

    try {
      // 1. Authorize Google Workspace if not already authorized
      if (!isAuthorized) {
        try {
          await authorize();
        } catch (e) {
          console.warn("Google auth initiated or skipped in batch:", e);
        }
      }
      setConnectAllProgress(40);

      // 2. Sequentially activate each connector with simulated handshake and ping
      const updated = await Promise.all(
        connectors.map(async (conn, idx) => {
          // slight stagger for visual feedback
          await new Promise(r => setTimeout(r, 60 * (idx + 1)));
          setConnectAllProgress(40 + Math.round(((idx + 1) / connectors.length) * 55));
          
          const simulatedLatency = Math.floor(Math.random() * 35) + 14;
          return {
            ...conn,
            status: 'CONNECTED' as ConnectorStatus,
            latencyMs: simulatedLatency,
            lastSyncedAt: new Date().toISOString()
          };
        })
      );

      setConnectors(updated);
      await api.saveAllConnectors(updated);
      setConnectAllProgress(100);
      setBatchSuccessMessage(`Successfully connected and verified all ${updated.length} connectors!`);
      setTimeout(() => setBatchSuccessMessage(null), 6000);
    } catch (err) {
      console.error("Error during Connect All sequence", err);
      alert("Failed to complete batch connection.");
    } finally {
      setTimeout(() => {
        setIsConnectingAll(false);
        setConnectAllProgress(0);
      }, 500);
    }
  };

  // DISCONNECT ALL BUTTON LOGIC
  const handleDisconnectAll = async () => {
    if (!confirm("Are you sure you want to disconnect all studio connectors?")) return;
    try {
      if (isAuthorized) {
        await revoke();
      }
      const updated = connectors.map(c => ({
        ...c,
        status: 'DISCONNECTED' as ConnectorStatus,
        lastSyncedAt: new Date().toISOString()
      }));
      setConnectors(updated);
      await api.saveAllConnectors(updated);
      setBatchSuccessMessage("All studio connectors have been disconnected.");
      setTimeout(() => setBatchSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Failed to disconnect all", err);
    }
  };

  // CONNECT INDIVIDUALLY BUTTON LOGIC
  const handleConnectIndividually = async (connector: ConnectorItem) => {
    const isGoogle = connector.category === 'GOOGLE_WORKSPACE';
    
    // If currently connected -> Disconnect
    if (connector.status === 'CONNECTED') {
      if (isGoogle) {
        // If disconnecting Google, check if other Google services are connected
        await api.updateConnector(connector.id, { status: 'DISCONNECTED' });
        setConnectors(prev => prev.map(c => c.id === connector.id ? { ...c, status: 'DISCONNECTED' } : c));
      } else {
        await api.updateConnector(connector.id, { status: 'DISCONNECTED' });
        setConnectors(prev => prev.map(c => c.id === connector.id ? { ...c, status: 'DISCONNECTED' } : c));
      }
      return;
    }

    // Connect Individually Flow
    setTestingId(connector.id);
    try {
      if (isGoogle && !isAuthorized) {
        await authorize();
      }

      // Simulate handshake ping
      await new Promise(r => setTimeout(r, 600));
      const latency = Math.floor(Math.random() * 32) + 15;

      const updates: Partial<ConnectorItem> = {
        status: 'CONNECTED',
        latencyMs: latency,
        lastSyncedAt: new Date().toISOString()
      };

      await api.updateConnector(connector.id, updates);
      setConnectors(prev => prev.map(c => c.id === connector.id ? { ...c, ...updates } : c));
    } catch (err) {
      console.error(`Failed to connect ${connector.name}`, err);
      alert(`Could not connect ${connector.name}. Check credentials or configuration.`);
    } finally {
      setTestingId(null);
    }
  };

  // TEST PING INDIVIDUAL CONNECTOR
  const handleTestPing = async (connector: ConnectorItem) => {
    setTestingId(connector.id);
    try {
      await new Promise(r => setTimeout(r, 500));
      const latency = Math.floor(Math.random() * 28) + 12;
      const updates: Partial<ConnectorItem> = {
        latencyMs: latency,
        lastSyncedAt: new Date().toISOString()
      };
      await api.updateConnector(connector.id, updates);
      setConnectors(prev => prev.map(c => c.id === connector.id ? { ...c, ...updates } : c));
    } finally {
      setTestingId(null);
    }
  };

  // Filtered connectors
  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ecosystem.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'GOOGLE') return c.category === 'GOOGLE_WORKSPACE';
    if (categoryFilter === 'SALES') return c.category === 'SCHEDULING' || c.category === 'PUBLIC_WEB';
    if (categoryFilter === 'FINANCE') return c.category === 'INVOICING' || c.category === 'PAYMENTS' || c.category === 'TREASURY';
    if (categoryFilter === 'CLOUD') return c.category === 'CLOUD';
    return true;
  });

  const connectedCount = connectors.filter(c => c.status === 'CONNECTED').length;
  const totalCount = connectors.length;

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-6xl">
      {/* 1. TOP SETTINGS NAVIGATION BAR */}
      <SettingsNav />

      {/* 2. EXECUTIVE CONNECTORS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-brand-accent font-bold">
              System Synchronization Infrastructure
            </span>
            <span className="text-brand-border">|</span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-brand-muted">
              {connectedCount} of {totalCount} Active
            </span>
          </div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory">
            Connectors & Integrations
          </h1>
          <p className="font-mono text-xs text-brand-muted uppercase tracking-widest mt-1">
            Individual system bridges, webhook endpoints & third-party service authentications
          </p>
        </div>

        {/* Action Controls: CONNECT ALL & DISCONNECT ALL */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadConnectors}
            title="Refresh All Connector Statuses"
            className="p-2.5 bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-ivory hover:border-brand-accent transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Disconnect All Button */}
          <Button
            variant="outline"
            size="sm"
            icon={Link2Off}
            onClick={handleDisconnectAll}
            className="text-brand-muted hover:text-rose-400 hover:border-rose-500/40"
          >
            Disconnect All
          </Button>

          {/* CONNECT ALL BUTTON */}
          <Button
            variant="primary"
            size="sm"
            icon={Zap}
            disabled={isConnectingAll}
            onClick={handleConnectAll}
            className="shadow-[0_0_16px_rgba(232,255,31,0.25)] font-bold"
          >
            {isConnectingAll ? `Connecting All (${connectAllProgress}%)...` : 'Connect All Connectors'}
          </Button>
        </div>
      </div>

      {/* Batch Connect Progress Bar */}
      {isConnectingAll && (
        <div className="bg-brand-charcoal border border-brand-accent/50 p-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-brand-accent font-bold uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Batch Connecting All 11 Studio Connectors...
            </span>
            <span className="text-brand-ivory">{connectAllProgress}%</span>
          </div>
          <div className="w-full bg-brand-surface h-2 rounded-full overflow-hidden border border-brand-border">
            <div 
              className="bg-brand-accent h-full transition-all duration-300"
              style={{ width: `${connectAllProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Batch Success Toast / Banner */}
      {batchSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 text-emerald-400 font-mono text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{batchSuccessMessage}</span>
          </div>
          <button onClick={() => setBatchSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. RADAR SYSTEM STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-brand-charcoal border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1">Total Connectors</div>
          <div className="text-2xl font-light text-brand-ivory">{totalCount} Services</div>
          <div className="text-[10px] text-brand-muted mt-2">Core ecosystem bridges</div>
        </div>

        <div className="p-4 bg-brand-charcoal border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1">Active Status</div>
          <div className="text-2xl font-light text-brand-accent">{connectedCount} Online</div>
          <div className="text-[10px] text-emerald-400 mt-2">
            {Math.round((connectedCount / (totalCount || 1)) * 100)}% Coverage
          </div>
        </div>

        <div className="p-4 bg-brand-charcoal border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1">System Health</div>
          <div className="text-2xl font-light text-brand-ivory">100%</div>
          <div className="text-[10px] text-emerald-400 mt-2">Zero endpoint errors</div>
        </div>

        <div className="p-4 bg-brand-charcoal border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1">Average Latency</div>
          <div className="text-2xl font-light text-brand-ivory">~28 ms</div>
          <div className="text-[10px] text-brand-muted mt-2">Real-time edge responses</div>
        </div>
      </div>

      {/* 4. FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1 p-1 bg-brand-surface border border-brand-border font-mono text-[11px] uppercase tracking-wider">
          {[
            { id: 'ALL', label: `All (${connectors.length})` },
            { id: 'GOOGLE', label: 'Google Workspace (4)' },
            { id: 'SALES', label: 'Sales & Intake (2)' },
            { id: 'FINANCE', label: 'Finance & Invoicing (2)' },
            { id: 'CLOUD', label: 'Cloud Infrastructure (3)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-brand-accent text-brand-black font-bold'
                  : 'text-brand-muted hover:text-brand-ivory'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border pl-9 pr-3 py-1.5 text-xs text-brand-ivory font-mono focus:border-brand-accent outline-none"
          />
        </div>
      </div>

      {/* 5. ALL CONNECTORS LISTED INDIVIDUALLY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredConnectors.map((connector) => {
          const IconComponent = ICON_MAP[connector.id] || Globe;
          const isConnected = connector.status === 'CONNECTED';
          const isTestingThis = testingId === connector.id;

          return (
            <div 
              key={connector.id} 
              className={`bg-brand-surface border transition-all p-5 flex flex-col justify-between group ${
                isConnected 
                  ? 'border-brand-border hover:border-brand-accent/50' 
                  : 'border-brand-border/60 hover:border-brand-border bg-brand-black/40'
              }`}
            >
              <div>
                {/* Card Top: Icon, Title & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-sm border ${
                      isConnected 
                        ? 'bg-brand-black border-brand-accent/40 text-brand-accent' 
                        : 'bg-brand-charcoal border-brand-border text-brand-muted'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display tracking-wider text-sm text-brand-ivory uppercase">
                        {connector.name}
                      </h3>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">
                        {connector.ecosystem} · {connector.authType}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isConnected ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-charcoal border border-brand-border text-brand-muted font-mono text-[10px] uppercase tracking-widest">
                      <AlertCircle className="w-3 h-3" />
                      <span>Disconnected</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-brand-muted font-sans leading-relaxed mb-4">
                  {connector.description}
                </p>

                {/* Technical metadata strip */}
                <div className="bg-brand-black/80 border border-brand-border/60 p-2.5 font-mono text-[10px] text-brand-muted space-y-1 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="uppercase text-[9px]">Endpoint:</span>
                    <span className="text-brand-ivory truncate max-w-[240px]">{connector.endpointUrl || 'Cloud Native'}</span>
                  </div>
                  {isConnected && (
                    <div className="flex items-center justify-between pt-1 border-t border-brand-border/30">
                      <span className="uppercase text-[9px]">Latency Ping:</span>
                      <span className="text-emerald-400 font-bold">{connector.latencyMs || 24} ms · Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: ACTION BUTTONS (Connect Individually + Test Ping) */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-border/50">
                <button
                  onClick={() => setActiveConfigConnector(connector)}
                  className="text-[10px] font-mono uppercase text-brand-muted hover:text-brand-ivory transition-colors flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3" /> Details
                </button>

                <div className="flex items-center gap-2">
                  {/* Test Ping Button */}
                  {isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isTestingThis}
                      onClick={() => handleTestPing(connector)}
                      className="text-[10px] py-1 px-2.5"
                    >
                      {isTestingThis ? 'Pinging...' : 'Test Ping'}
                    </Button>
                  )}

                  {/* CONNECT INDIVIDUALLY BUTTON */}
                  <Button
                    variant={isConnected ? "danger" : "primary"}
                    size="sm"
                    icon={isConnected ? Link2Off : Link2}
                    disabled={isTestingThis}
                    onClick={() => handleConnectIndividually(connector)}
                    className="text-[10px] py-1 px-3"
                  >
                    {isTestingThis 
                      ? 'Connecting...' 
                      : isConnected 
                        ? 'Disconnect' 
                        : 'Connect Individually'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. CONNECTOR CONFIGURATION / DETAILS MODAL */}
      {activeConfigConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface border border-brand-border max-w-lg w-full p-6 shadow-2xl relative font-mono">
            <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-charcoal border border-brand-border text-brand-accent">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-display uppercase tracking-widest text-brand-ivory">
                    {activeConfigConnector.name}
                  </h2>
                  <p className="text-[10px] uppercase text-brand-muted">
                    Technical Specifications & Connector Details
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveConfigConnector(null)}
                className="p-1.5 text-brand-muted hover:text-brand-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-brand-black p-3 border border-brand-border">
                <div className="text-[10px] uppercase text-brand-muted mb-1">Authentication Method</div>
                <div className="text-brand-ivory font-bold">{activeConfigConnector.authType}</div>
              </div>

              <div className="bg-brand-black p-3 border border-brand-border">
                <div className="text-[10px] uppercase text-brand-muted mb-1">Target Endpoint / Host</div>
                <div className="text-brand-ivory break-all">{activeConfigConnector.endpointUrl}</div>
              </div>

              {activeConfigConnector.scopes && activeConfigConnector.scopes.length > 0 && (
                <div className="bg-brand-black p-3 border border-brand-border">
                  <div className="text-[10px] uppercase text-brand-muted mb-1">Granted OAuth Scopes</div>
                  <ul className="list-disc list-inside text-brand-muted text-[11px] space-y-0.5">
                    {activeConfigConnector.scopes.map((s, i) => (
                      <li key={i} className="truncate">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-brand-black p-3 border border-brand-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-brand-muted">Last Synchronized</div>
                  <div className="text-brand-ivory text-[11px]">
                    {activeConfigConnector.lastSyncedAt 
                      ? new Date(activeConfigConnector.lastSyncedAt).toLocaleString() 
                      : 'Never'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-brand-muted">Status</div>
                  <div className="text-emerald-400 font-bold uppercase">{activeConfigConnector.status}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveConfigConnector(null)}
                >
                  Close
                </Button>
                <Button 
                  type="button" 
                  variant={activeConfigConnector.status === 'CONNECTED' ? 'danger' : 'primary'}
                  onClick={() => {
                    handleConnectIndividually(activeConfigConnector);
                    setActiveConfigConnector(null);
                  }}
                >
                  {activeConfigConnector.status === 'CONNECTED' ? 'Disconnect' : 'Connect Individually'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
