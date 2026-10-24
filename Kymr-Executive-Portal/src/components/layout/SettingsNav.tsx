import React from 'react';
import { NavLink } from 'react-router-dom';
import { Cpu, DollarSign, TrendingUp, Layers } from 'lucide-react';

export function SettingsNav() {
  const tabs = [
    { label: 'Connectors & Integrations', path: '/admin/settings/integrations', icon: Cpu },
    { label: 'Services & Pricing Catalog', path: '/admin/settings/services', icon: DollarSign },
    { label: 'Studio Treasury Bento', path: '/admin/treasury', icon: TrendingUp },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-brand-border mb-8 overflow-x-auto pb-px">
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `
            flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap
            ${isActive 
              ? 'border-brand-accent text-brand-accent font-bold bg-brand-surface/40' 
              : 'border-transparent text-brand-muted hover:text-brand-ivory hover:border-brand-border'}
          `}
        >
          <tab.icon className="w-3.5 h-3.5" />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
