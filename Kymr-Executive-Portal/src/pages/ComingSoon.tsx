import React from 'react';
import { Command } from 'lucide-react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 border border-dashed border-brand-border bg-brand-charcoal/30">
      <Command className="w-8 h-8 text-brand-muted mb-4" />
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-brand-ivory mb-2">{title}</h2>
      <p className="text-brand-muted text-sm max-w-sm text-center">
        NOT CONFIGURED
      </p>
      <div className="mt-8 text-[10px] text-brand-muted/50 tracking-widest uppercase font-mono">
        Architecture pending implementation
      </div>
    </div>
  );
}
