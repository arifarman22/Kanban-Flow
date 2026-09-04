'use client';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '@/lib/types';
import TaskCard from './TaskCard';

interface Props {
  column: Column;
  onAddTask: (columnId: string, title: string, description: string, priority?: string, dueDate?: string, label?: string) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onNewTask: (columnId: string) => void;
  isDraggingActive?: boolean;
}

const ACCENT_COLORS = [
  { bar: 'bg-emerald-500', ring: 'ring-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-300', glow: 'shadow-emerald-500/10' },
  { bar: 'bg-teal-500',    ring: 'ring-teal-500/30',    badge: 'bg-teal-500/15 text-teal-300',       glow: 'shadow-teal-500/10' },
  { bar: 'bg-cyan-500',    ring: 'ring-cyan-500/30',    badge: 'bg-cyan-500/15 text-cyan-300',       glow: 'shadow-cyan-500/10' },
  { bar: 'bg-sky-500',     ring: 'ring-sky-500/30',     badge: 'bg-sky-500/15 text-sky-300',         glow: 'shadow-sky-500/10' },
  { bar: 'bg-amber-500',   ring: 'ring-amber-500/30',   badge: 'bg-amber-500/15 text-amber-300',     glow: 'shadow-amber-500/10' },
  { bar: 'bg-rose-500',    ring: 'ring-rose-500/30',    badge: 'bg-rose-500/15 text-rose-300',       glow: 'shadow-rose-500/10' },
  { bar: 'bg-orange-500',  ring: 'ring-orange-500/30',  badge: 'bg-orange-500/15 text-orange-300',   glow: 'shadow-orange-500/10' },
  { bar: 'bg-violet-500',  ring: 'ring-violet-500/30',  badge: 'bg-violet-500/15 text-violet-300',   glow: 'shadow-violet-500/10' },
];

function getAccent(id: string) {
  return ACCENT_COLORS[id.charCodeAt(id.length - 1) % ACCENT_COLORS.length];
}

export default function KanbanColumn({ column, onDeleteTask, onEditTask, onDeleteColumn, onRenameColumn, onNewTask, isDraggingActive }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editing, setEditing] = useState(false);
  const [colTitle, setColTitle] = useState(column.title);

  const accent = getAccent(column.id);
  const taskCount = column.tasks.length;

  const submitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (colTitle.trim()) onRenameColumn(column.id, colTitle.trim());
    setEditing(false);
  };

  return (
    <div className={`flex flex-col w-80 min-w-[18rem] shrink-0 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl ${accent.glow}`}
      style={{ maxHeight: 'var(--col-max-h, calc(100svh - 13rem))' }}>

      {/* Colored top bar */}
      <div className={`${accent.bar} h-1 rounded-t-2xl shrink-0`} />

      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {editing ? (
            <form onSubmit={submitRename} className="flex gap-1.5 flex-1">
              <input
                autoFocus value={colTitle} onChange={e => setColTitle(e.target.value)}
                className="bg-zinc-800 border border-emerald-500/60 text-white rounded-lg px-2.5 py-1.5 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button type="submit" className="text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-lg hover:bg-emerald-500/10 transition shrink-0">Save</button>
            </form>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2.5 flex-1 text-left group min-w-0">
              <span className="font-semibold text-sm text-zinc-100 group-hover:text-white transition truncate">{column.title}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ring-1 ${accent.badge} ${accent.ring}`}>
                {taskCount}
              </span>
            </button>
          )}
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-zinc-600 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10 shrink-0"
            title="Delete column"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mini progress bar — shows task fill visually */}
        <div className="mt-2.5 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${accent.bar} rounded-full transition-all duration-500`}
            style={{ width: taskCount > 0 ? `${Math.min(100, taskCount * 12.5)}%` : '0%' }}
          />
        </div>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 px-3 py-2 overflow-y-auto flex-1 min-h-[5rem] ${isOver ? 'bg-emerald-500/[0.04]' : ''}`}
        style={{ touchAction: isDraggingActive ? 'none' : 'pan-y' }}
      >
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={(tid) => onDeleteTask(column.id, tid)} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {taskCount === 0 && (
          <div className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed transition-all duration-150 ${
            isOver ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800'
          }`}>
            {isOver ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-emerald-400">Drop here</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-zinc-600">No tasks yet</p>
                <p className="text-[10px] text-zinc-700 mt-0.5">Click below to add one</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add task button */}
      <div className="px-3 pb-3 pt-2 shrink-0 border-t border-zinc-800/60">
        <button
          onClick={() => onNewTask(column.id)}
          className={`w-full flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 transition-all duration-150 group border border-transparent hover:border-zinc-700/60 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800`}
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 bg-zinc-800 group-hover:${accent.bar}`}>
            <svg className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          Add task
        </button>
      </div>
    </div>
  );
}
