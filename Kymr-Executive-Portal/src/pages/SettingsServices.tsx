import React, { useState, useEffect } from 'react';
import { api } from '../lib/db';
import { CatalogService, ServiceCategory } from '../types';
import { Plus, Edit2, Archive, CheckCircle, X, Check } from 'lucide-react';
import { Button, Input, Badge } from '../components/ui/DesignSystem';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsServices() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<CatalogService> | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [svcData, catData] = await Promise.all([
      api.getCatalogServices(),
      api.getServiceCategories()
    ]);
    setServices(svcData);
    setCategories(catData);
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await api.createServiceCategory({ name: newCategoryName });
    setNewCategoryName('');
    setIsAddingCategory(false);
    loadData();
  };

  const openEditor = (service?: CatalogService) => {
    if (service) {
      setEditingService(service);
    } else {
      setEditingService({
        name: '',
        billingType: 'FIXED',
        defaultRate: 0,
        defaultCurrency: 'USD',
        defaultQuantity: 1,
        isActive: true,
      });
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingService(null);
  };

  const saveService = async () => {
    if (!editingService?.name) return;
    
    if (editingService.id) {
      await api.updateCatalogService(editingService.id, editingService);
    } else {
      await api.createCatalogService(editingService as any);
    }
    closeEditor();
    loadData();
  };

  const groupedServices = categories.map(cat => ({
    category: cat,
    services: services.filter(s => s.categoryId === cat.id)
  }));
  const uncategorizedServices = services.filter(s => !s.categoryId);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-brand-ivory mb-2">Services & Pricing</h1>
          <p className="font-mono text-[10px] text-brand-muted uppercase tracking-[0.2em]">Service Catalog Configuration</p>
        </div>
        <div className="flex gap-3">
          <Button icon={Plus} onClick={() => openEditor()} variant="primary">Add Service</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 border-r border-brand-border pr-6">
          <h2 className="font-mono text-[10px] text-brand-muted uppercase tracking-widest mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="font-sans text-sm text-brand-ivory px-3 py-2 bg-brand-surface border border-brand-border">
                {c.name}
              </div>
            ))}
            {isAddingCategory ? (
              <div className="flex gap-2">
                <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Category Name" autoFocus />
                <button onClick={handleAddCategory} className="text-brand-accent"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsAddingCategory(false)} className="text-brand-muted"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setIsAddingCategory(true)} className="font-mono text-[10px] text-brand-accent uppercase tracking-widest hover:text-brand-ivory transition-colors mt-2 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Category
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div className="font-mono text-xs text-brand-muted uppercase tracking-widest animate-pulse">Loading Catalog...</div>
          ) : (
            <div className="space-y-8">
              {groupedServices.map(group => group.services.length > 0 && (
                <div key={group.category.id} className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-brand-ivory border-b border-brand-border pb-2">{group.category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.services.map(s => (
                      <ServiceCard key={s.id} service={s} onEdit={() => openEditor(s)} />
                    ))}
                  </div>
                </div>
              ))}

              {uncategorizedServices.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-brand-ivory border-b border-brand-border pb-2">Uncategorized</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uncategorizedServices.map(s => (
                      <ServiceCard key={s.id} service={s} onEdit={() => openEditor(s)} />
                    ))}
                  </div>
                </div>
              )}
              {services.length === 0 && (
                <div className="text-center p-12 border border-dashed border-brand-border text-brand-muted font-mono text-[10px] uppercase tracking-widest">
                  No services found. Add one to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditorOpen && editingService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-40"
              onClick={closeEditor}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-brand-charcoal border-l border-brand-border z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between shrink-0">
                <h2 className="text-xl font-sans font-bold text-brand-ivory">{editingService.id ? 'Edit Service' : 'New Service'}</h2>
                <button onClick={closeEditor} className="text-brand-muted hover:text-brand-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Service Name</label>
                  <Input value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} placeholder="e.g. Brand Identity" />
                </div>
                
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Category</label>
                  <select 
                    value={editingService.categoryId || ''} 
                    onChange={e => setEditingService({...editingService, categoryId: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                  >
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Billing Type</label>
                    <select 
                      value={editingService.billingType} 
                      onChange={e => setEditingService({...editingService, billingType: e.target.value as any})}
                      className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                    >
                      <option value="FIXED">Fixed</option>
                      <option value="PER_DELIVERABLE">Per Deliverable</option>
                      <option value="PER_HOUR">Per Hour</option>
                      <option value="PER_DAY">Per Day</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Default Currency</label>
                    <select 
                      value={editingService.defaultCurrency} 
                      onChange={e => setEditingService({...editingService, defaultCurrency: e.target.value})}
                      className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="AED">AED</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Default Rate</label>
                    <Input type="number" value={editingService.defaultRate} onChange={e => setEditingService({...editingService, defaultRate: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Default Qty</label>
                    <Input type="number" value={editingService.defaultQuantity} onChange={e => setEditingService({...editingService, defaultQuantity: Number(e.target.value)})} />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Unit (Optional)</label>
                  <Input value={editingService.unit || ''} onChange={e => setEditingService({...editingService, unit: e.target.value})} placeholder="e.g. hours, pages" />
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Internal Cost (Optional)</label>
                  <Input type="number" value={editingService.internalCost || ''} onChange={e => setEditingService({...editingService, internalCost: Number(e.target.value)})} placeholder="0" />
                </div>
                
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Short Description</label>
                  <textarea 
                    value={editingService.shortDescription || ''} 
                    onChange={e => setEditingService({...editingService, shortDescription: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent min-h-[60px]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">Default Quote Description</label>
                  <textarea 
                    value={editingService.clientDescription || ''} 
                    onChange={e => setEditingService({...editingService, clientDescription: e.target.value})}
                    className="w-full bg-brand-black border border-brand-border text-brand-ivory px-3 py-2 text-sm focus:outline-none focus:border-brand-accent min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" checked={editingService.isActive} onChange={e => setEditingService({...editingService, isActive: e.target.checked})} id="isActive" />
                  <label htmlFor="isActive" className="font-mono text-xs text-brand-ivory">Active Service</label>
                </div>
              </div>

              <div className="p-6 border-t border-brand-border bg-brand-surface-highlight flex justify-end shrink-0">
                <Button variant="primary" onClick={saveService} disabled={!editingService.name}>Save Service</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceCard({ service, onEdit, ...props }: { service: CatalogService, onEdit: () => void } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div onClick={onEdit} {...props} className={`p-4 border border-brand-border bg-brand-surface hover:border-brand-accent cursor-pointer transition-colors flex flex-col justify-between group ${props.className || ''}`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-sans font-bold text-brand-ivory group-hover:text-brand-accent transition-colors">{service.name}</h4>
          {!service.isActive && <Badge variant="default">Archived</Badge>}
        </div>
        <p className="font-mono text-[10px] text-brand-muted uppercase tracking-widest">{service.billingType.replace('_', ' ')}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
        <span className="font-sans text-sm font-bold text-brand-ivory">{service.defaultRate.toLocaleString()} {service.defaultCurrency}</span>
        {service.unit && <span className="font-mono text-[9px] text-brand-muted uppercase tracking-widest">per {service.unit}</span>}
      </div>
    </div>
  );
}
