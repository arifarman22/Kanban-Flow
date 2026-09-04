'use client';
import { useState, FormEvent } from 'react';
import { Task } from '@/lib/types';

interface Props {
  task: Task;
  onSave: (taskId: string, title: string, description: string, priority?: string, dueDate?: string, label?: string) => void;
  onClose: () => void;
}

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/30' },
  { value: 'medium', label: 'Medium', color: 'text-sky-400',    bg: 'bg-sky-500/15 border-sky-500/30' },
  { value: 'high',   label: 'High',   color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/30' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30' },
];

const LABELS = ['Bug', 'Feature', 'Improvement', 'Research', 'Design', 'Docs', 'Testing', 'Blocked'];

export default function EditTaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
  const [label, setLabel] = useState(task.label || '');
  const [customLabel, setCustomLabel] = useState(!LABELS.includes(task.label || '') && !!task.label ? task.label : '');
  const [useCustomLabel, setUseCustomLabel] = useState(!LABELS.includes(task.label || '') && !!task.label);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalLabel = useCustomLabel ? customLabel.trim() : label;
    onSave(task.id, title.trim(), description.trim(), priority || undefined, dueDate || undefined, finalLabel || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-xl shadow-2xl shadow-black/60 w-full max-w-lg max-h-[92svh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">{task.id ? 'Edit task' : 'New task'}</h2>
            <p className="text-xs text-zinc-500 mt-0.5 font-normal">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1.5 rounded-lg hover:bg-zinc-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(92svh-8rem)]">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Title <span className="text-red-400">*</span></label>
              <input
                autoFocus value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="What needs to be done?"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Description</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Add more context, steps, or notes…"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm font-normal resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {/* Priority + Due Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value} type="button"
                      onClick={() => setPriority(priority === p.value ? '' : p.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition ${
                        priority === p.value ? `${p.bg} ${p.color}` : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority === p.value ? 'bg-current' : 'bg-slate-600'}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Due date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg pl-9 pr-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition [color-scheme:dark]"
                  />
                </div>
                {dueDate && (
                  <button type="button" onClick={() => setDueDate('')} className="text-xs text-slate-600 hover:text-slate-400 transition font-normal">
                    Clear date
                  </button>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Label</label>
              <div className="flex flex-wrap gap-1.5">
                {LABELS.map(l => (
                  <button
                    key={l} type="button"
                    onClick={() => { setLabel(label === l ? '' : l); setUseCustomLabel(false); }}
                    className={`px-2.5 py-1 rounded-md border text-xs font-normal transition ${
                      !useCustomLabel && label === l
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setUseCustomLabel(true); setLabel(''); }}
                  className={`px-2.5 py-1 rounded-md border text-xs font-normal transition ${
                    useCustomLabel
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  Custom…
                </button>
              </div>
              {useCustomLabel && (
                <input
                  autoFocus value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                  placeholder="Enter custom label"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-lg px-3.5 py-2 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition mt-1.5"
                />
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-zinc-800">
            <button type="button" onClick={onClose}
              className="flex-1 border border-zinc-700 text-zinc-400 font-medium py-2.5 rounded-lg text-sm hover:bg-zinc-800 hover:text-zinc-300 transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-emerald-600/20">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
