'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';

interface Props {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; borderColor: string; dotColor: string }> = {
  low:    { label: 'Low',    textColor: 'text-zinc-400',  bgColor: 'bg-zinc-700/50',  borderColor: 'border-l-zinc-500',  dotColor: 'bg-zinc-400' },
  medium: { label: 'Medium', textColor: 'text-sky-400',   bgColor: 'bg-sky-500/10',   borderColor: 'border-l-sky-500',   dotColor: 'bg-sky-400' },
  high:   { label: 'High',   textColor: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-l-amber-500', dotColor: 'bg-amber-400' },
  urgent: { label: 'Urgent', textColor: 'text-red-400',   bgColor: 'bg-red-500/10',   borderColor: 'border-l-red-500',   dotColor: 'bg-red-400' },
};

function formatDueDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date(new Date().toDateString());
}

function isDueToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function TaskCard({ task, onDelete, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const priority = task.priority ? PRIORITY_CONFIG[task.priority] : null;
  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
  const dueToday = task.dueDate ? isDueToday(task.dueDate) : false;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform) ?? undefined,
        transition,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
      className={`relative bg-zinc-800 border border-zinc-700/60 rounded-xl group shadow-sm border-l-2 ${
        priority?.borderColor ?? 'border-l-zinc-700/60'
      } ${isDragging ? 'shadow-2xl shadow-black/60 z-50' : 'hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30'}`}
    >
      {/* Full-card drag handle (behind content, above base) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 rounded-xl cursor-grab active:cursor-grabbing z-10"
        style={{ touchAction: 'none' }}
      />

      {/* Action buttons */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button
          onClick={e => { e.stopPropagation(); onEdit(task); }}
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Grip dots */}
      <div className="absolute top-2.5 left-3 flex gap-0.5 opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none">
        {[0, 1].map(col => (
          <div key={col} className="flex flex-col gap-0.5">
            {[0, 1, 2].map(row => (
              <div key={row} className="w-1 h-1 rounded-full bg-zinc-400" />
            ))}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="px-3.5 pt-3 pb-3">
        <p className="text-sm font-medium text-zinc-100 leading-snug pl-5 pr-14">{task.title}</p>

        {task.description && (
          <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed font-normal pl-5">{task.description}</p>
        )}

        {(priority || task.label || task.dueDate) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-5">
            {priority && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${priority.textColor} ${priority.bgColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dotColor}`} />
                {priority.label}
              </span>
            )}
            {task.label && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium">
                {task.label}
              </span>
            )}
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                overdue  ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                dueToday ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                           'bg-zinc-700/40 border-zinc-700/40 text-zinc-500'
              }`}>
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {overdue && 'Overdue · '}{formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
