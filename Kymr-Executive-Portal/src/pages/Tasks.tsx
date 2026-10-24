import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckSquare, Plus, Check, Clock, Search as SearchIcon, 
  Trash2, X, AlertCircle, Save 
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../lib/db';
import { Card, Button } from '../components/ui/DesignSystem';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(searchParams.get('create') === 'true');
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'NORMAL',
    assignee: 'ADMIN',
    projectId: searchParams.get('projectId') || '',
    clientId: searchParams.get('clientId') || '',
    inquiryId: searchParams.get('inquiryId') || ''
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && tasks.length > 0) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setSelectedTask(task);
        setFormData(task);
      }
    }
  }, [searchParams, tasks]);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      alert("Title is required");
      return;
    }
    
    setSaving(true);
    try {
      // Strip undefined values to prevent Firebase errors
      const cleanData: any = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v !== undefined));
      
      let taskId = '';
      if (selectedTask) {
        taskId = selectedTask.id;
        await api.updateTask(taskId, cleanData);
      } else {
        taskId = await api.createTask(cleanData);
        await api.logActivity({
          type: 'TASK_CREATED',
          actorId: 'system',
          entityType: 'TASK',
          entityId: taskId,
          taskId,
          projectId: cleanData.projectId || undefined,
          clientId: cleanData.clientId || undefined,
          inquiryId: cleanData.inquiryId || undefined,
          description: `Task created: ${cleanData.title}`,
        });
      }
      
      await loadTasks();
      closeModal();
    } catch (e) {
      console.error(e);
      alert("Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string, task: any) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      if (newStatus === 'DONE') {
        await api.logActivity({
          type: 'TASK_COMPLETED',
          actorId: 'system',
          entityType: 'TASK',
          entityId: taskId,
          taskId,
          projectId: task.projectId || undefined,
          clientId: task.clientId || undefined,
          inquiryId: task.inquiryId || undefined,
          description: `Task completed: ${task.title}`,
        });
      }
      await loadTasks();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to hard delete ALL tasks? This cannot be undone.")) return;
    setClearing(true);
    try {
      const res = await api.deleteAllDocuments('tasks');
      alert(`Successfully deleted ${res.deletedCount} tasks.`);
      await loadTasks();
    } catch (e) {
      console.error(e);
      alert("Failed to clear tasks");
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent | null, taskId: string) => {
    if (e) e.stopPropagation();
    if (window.confirm("Delete this task?")) {
      try {
        await api.deleteDocument('tasks', taskId);
        await loadTasks();
        if (selectedTask?.id === taskId) closeModal();
      } catch (e) {
        console.error(e);
        alert("Failed to delete task");
      }
    }
  };

  const closeModal = () => {
    setIsCreating(false);
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'NORMAL',
      assignee: 'ADMIN',
    });
    setSearchParams({});
  };

  const visibleTasks = tasks.filter(t => t.status !== 'DELETED');
  const todoTasks = visibleTasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'BLOCKED');
  const doneTasks = visibleTasks.filter(t => t.status === 'DONE');

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold italic tracking-tight">Tasks</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted mt-1">Manage Work Items</p>
        </div>
        <div className="flex gap-3">
          <Button icon={Trash2} variant="danger" onClick={handleClearAll} disabled={clearing || tasks.length === 0}>
            {clearing ? 'Clearing...' : 'Clear All'}
          </Button>
          <Button icon={Plus} onClick={() => setIsCreating(true)}>New Task</Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-6 overflow-y-auto pb-20">
        <div className="flex flex-col gap-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-brand-accent">Pending ({todoTasks.length})</h2>
          {todoTasks.map(t => (
            <Card key={t.id} className="flex flex-col gap-3 group hover:border-brand-accent cursor-pointer" onClick={() => navigate(`?id=${t.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-bold text-sm">{t.title}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">
                    {t.priority} • {t.assignee}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusChange(t.id, 'DONE', t); }}>Mark Done</Button>
                  <button 
                    onClick={(e) => handleDelete(e, t.id)}
                    className="p-1.5 text-brand-muted hover:text-brand-accent-red hover:bg-brand-accent-red/10 rounded transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {todoTasks.length === 0 && (
             <div className="p-8 border border-brand-border/30 text-center font-mono text-[10px] text-brand-muted tracking-widest uppercase bg-brand-charcoal-light">
               All Caught Up
             </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <h2 className="font-mono text-xs uppercase tracking-widest text-brand-muted">Completed ({doneTasks.length})</h2>
          {doneTasks.map(t => (
            <Card key={t.id} className="flex flex-col gap-3 opacity-60 hover:opacity-100 cursor-pointer" onClick={() => navigate(`?id=${t.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-bold text-sm line-through">{t.title}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-muted">
                    Completed • {format(t.updatedAt, 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleStatusChange(t.id, 'TODO', t); }}>Reopen</Button>
                  <button 
                    onClick={(e) => handleDelete(e, t.id)}
                    className="p-1 text-brand-muted hover:text-brand-accent-red hover:bg-brand-accent-red/10 rounded transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      {(isCreating || selectedTask) && (
        <div className="absolute inset-0 bg-brand-black/90 z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-lg flex flex-col gap-6 relative max-h-full overflow-y-auto">
            <button className="absolute top-4 right-4 text-brand-muted hover:text-brand-ivory" onClick={closeModal}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-xl font-bold italic">{selectedTask ? 'Edit Task' : 'New Task'}</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-brand-black border border-brand-border px-3 py-2 font-sans text-sm outline-none focus:border-brand-accent"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="bg-brand-black border border-brand-border px-3 py-2 font-sans text-sm outline-none focus:border-brand-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="bg-brand-black border border-brand-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-brand-accent"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="BLOCKED">BLOCKED</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="bg-brand-black border border-brand-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-brand-accent"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-border/30">
                 {selectedTask && (
                    <Button variant="outline" className="text-brand-accent-red border-brand-accent-red hover:bg-brand-accent-red hover:text-black" onClick={(e) => handleDelete(null, selectedTask.id)}>Delete</Button>
                 )}
                 <div className={selectedTask ? 'col-span-2 flex gap-3' : 'col-span-3 flex justify-end gap-3'}>
                    <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
                    <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? 'Saving...' : 'Save Task'}
                    </Button>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
