'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, TouchSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Board, Column, Task } from '@/lib/types';
import KanbanColumn from '@/components/KanbanColumn';
import TaskCard from '@/components/TaskCard';
import EditTaskModal from '@/components/EditTaskModal';
import ShareModal from '@/components/ShareModal';

export default function BoardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [addingCol, setAddingCol] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(112);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const fetchBoard = useCallback(async () => {
    try {
      const { data } = await api.get(`/boards/${slug}`);
      setBoard(data); setColumns(data.columns);
    } catch { router.push('/boards'); }
  }, [slug, router]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchBoard();
  }, [user, router, fetchBoard]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight));
    ro.observe(el);
    setHeaderH(el.offsetHeight);
    return () => ro.disconnect();
  }, [board]);

  const addColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    const { data } = await api.post(`/boards/${slug}/columns`, { title: newColTitle.trim() });
    setColumns(prev => [...prev, { ...data, tasks: [] }]);
    setNewColTitle(''); setAddingCol(false);
  };

  const deleteColumn = async (columnId: string) => {
    await api.delete(`/boards/${slug}/columns/${columnId}`);
    setColumns(prev => prev.filter(c => c.id !== columnId));
  };

  const renameColumn = async (columnId: string, title: string) => {
    await api.put(`/boards/${slug}/columns/${columnId}`, { title });
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, title } : c));
  };

  const addTask = async (columnId: string, title: string, description: string, priority?: string, dueDate?: string, label?: string) => {
    const { data } = await api.post(`/boards/${slug}/columns/${columnId}/tasks`, { title, description, priority, dueDate, label });
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, tasks: [...c.tasks, data] } : c));
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    await api.delete(`/boards/${slug}/columns/${columnId}/tasks/${taskId}`);
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c));
  };

  const saveTask = async (taskId: string, title: string, description: string, priority?: string, dueDate?: string, label?: string) => {
    const col = columns.find(c => c.tasks.some(t => t.id === taskId))!;
    const { data } = await api.put(`/boards/${slug}/columns/${col.id}/tasks/${taskId}`, { title, description, priority, dueDate, label });
    setColumns(prev => prev.map(c => c.id === col.id ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? data : t) } : c));
  };

  const BLANK_TASK: Task = { id: '', title: '', position: 0, columnId: '', createdAt: '' };

  const handleNewTask = (columnId: string) => {
    setNewTaskColumnId(columnId);
    setEditingTask({ ...BLANK_TASK, columnId });
  };

  const handleSaveTask = async (taskId: string, title: string, description: string, priority?: string, dueDate?: string, label?: string) => {
    if (!taskId) {
      await addTask(newTaskColumnId!, title, description, priority, dueDate, label);
    } else {
      await saveTask(taskId, title, description, priority, dueDate, label);
    }
    setNewTaskColumnId(null);
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    const task = columns.flatMap(c => c.tasks).find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    const sourceCol = columns.find(c => c.tasks.some(t => t.id === active.id));
    const overCol = columns.find(c => c.id === over.id || c.tasks.some(t => t.id === over.id));
    if (!sourceCol || !overCol || sourceCol.id === overCol.id) return;
    setColumns(prev => prev.map(c => {
      if (c.id === sourceCol.id) return { ...c, tasks: c.tasks.filter(t => t.id !== active.id) };
      if (c.id === overCol.id) {
        const overIndex = c.tasks.findIndex(t => t.id === over.id);
        const newTasks = [...c.tasks];
        const movedTask = { ...sourceCol.tasks.find(t => t.id === active.id)!, columnId: overCol.id };
        newTasks.splice(overIndex >= 0 ? overIndex : newTasks.length, 0, movedTask);
        return { ...c, tasks: newTasks };
      }
      return c;
    }));
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const targetCol = columns.find(c => c.id === over.id || c.tasks.some(t => t.id === over.id));
    if (!targetCol) return;
    const targetPosition = targetCol.tasks.findIndex(t => t.id === over.id);
    const finalPosition = targetPosition >= 0 ? targetPosition : targetCol.tasks.length - 1;
    const sourceCol = columns.find(c => c.tasks.some(t => t.id === active.id));
    if (!sourceCol) return;
    if (sourceCol.id === targetCol.id) {
      const oldIndex = sourceCol.tasks.findIndex(t => t.id === active.id);
      const newIndex = targetCol.tasks.findIndex(t => t.id === over.id);
      if (oldIndex !== newIndex)
        setColumns(prev => prev.map(c => c.id === sourceCol.id ? { ...c, tasks: arrayMove(c.tasks, oldIndex, newIndex) } : c));
    }
    try {
      await api.patch(`/boards/${slug}/columns/${sourceCol.id}/tasks/${active.id}/move`, {
        targetColumnId: targetCol.id, targetPosition: finalPosition,
      });
    } catch { fetchBoard(); }
  };

  // ── Skeleton ──
  if (!board) return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] bg-zinc-950">
      <div className="h-[4.5rem] bg-zinc-900/80 border-b border-zinc-800 animate-pulse shrink-0" />
      <div className="flex gap-4 p-5 overflow-x-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-80 min-w-[18rem] shrink-0 space-y-3">
            <div className="h-16 bg-zinc-800/60 rounded-2xl animate-pulse" />
            {[...Array(3 - i)].map((_, j) => (
              <div key={j} className="h-20 bg-zinc-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const isOwner = board.ownerId === user?.id;
  const totalTasks = columns.reduce((s, c) => s + c.tasks.length, 0);
  const allTasks = columns.flatMap(c => c.tasks);
  const urgentCount = allTasks.filter(t => t.priority === 'urgent').length;
  const overdueCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString())).length;
  // Treat last column as "done"
  const doneCount = columns.length > 0 ? columns[columns.length - 1].tasks.length : 0;
  const completionPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100svh - 3.5rem)' }}>

      {/* ── Board header ── */}
      <div ref={headerRef} className="bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 shrink-0">
        {/* Top row */}
        <div className="px-4 sm:px-5 pt-3 pb-2 flex flex-wrap items-center gap-3">
          {/* Back + title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => router.push('/boards')}
              className="text-zinc-500 hover:text-zinc-300 transition p-1.5 rounded-lg hover:bg-zinc-800 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate leading-tight">{board.title}</h1>
              <p className="text-[11px] text-zinc-500 mt-0.5 hidden sm:block">
                <span className="font-mono text-zinc-600">{board.slug}</span>
                <span className="mx-1.5">·</span>by {board.owner.name}
              </p>
            </div>
          </div>

          {/* Right: avatars + share */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Member avatars */}
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-zinc-900 z-10" title={board.owner.name}>
                {board.owner.name[0].toUpperCase()}
              </div>
              {board.members.slice(0, 2).map((m, i) => (
                <div key={m.id} style={{ zIndex: 9 - i }}
                  className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center ring-2 ring-zinc-900"
                  title={m.user.name}>
                  {m.user.name[0].toUpperCase()}
                </div>
              ))}
              {board.members.length > 2 && (
                <div className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-400 text-xs font-bold flex items-center justify-center ring-2 ring-zinc-900">
                  +{board.members.length - 2}
                </div>
              )}
            </div>

            {isOwner && (
              <button onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 text-xs font-medium border border-zinc-700 text-zinc-300 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats + progress row */}
        <div className="px-4 sm:px-5 pb-3 flex flex-wrap items-center gap-4">
          {/* Stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatPill icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            } label={`${columns.length} columns`} />
            <StatPill icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            } label={`${totalTasks} tasks`} />
            {urgentCount > 0 && (
              <StatPill icon={
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } label={`${urgentCount} urgent`} color="text-red-400" />
            )}
            {overdueCount > 0 && (
              <StatPill icon={
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } label={`${overdueCount} overdue`} color="text-amber-400" />
            )}
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2.5 ml-auto">
              <div className="hidden sm:flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-zinc-400">{doneCount}/{totalTasks} done</span>
              </div>
              <div className="w-24 sm:w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-400 tabular-nums w-8">{completionPct}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Board canvas ── */}
      <div
        className="flex-1 overflow-x-auto bg-zinc-950 px-4 sm:px-5 py-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(63 63 70 / 0.4) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          ['--col-max-h' as string]: `calc(100svh - 3.5rem - ${headerH}px - 2.5rem)`,
          touchAction: 'none',
        }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full items-start">
            {columns.map(col => (
              <KanbanColumn key={col.id} column={col}
                onAddTask={addTask} onDeleteTask={deleteTask} onEditTask={setEditingTask}
                onDeleteColumn={deleteColumn} onRenameColumn={renameColumn} onNewTask={handleNewTask}
                isDraggingActive={!!activeTask} />
            ))}

            {/* Add column */}
            <div className="w-80 min-w-[18rem] shrink-0">
              {addingCol ? (
                <form onSubmit={addColumn} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center">
                      <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-zinc-400">New column</span>
                  </div>
                  <input autoFocus value={newColTitle} onChange={e => setNewColTitle(e.target.value)}
                    placeholder="Column title…"
                    className="bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-semibold transition">
                      Add column
                    </button>
                    <button type="button" onClick={() => { setAddingCol(false); setNewColTitle(''); }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2 rounded-xl hover:bg-zinc-800 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setAddingCol(true)}
                  className="w-full h-full min-h-[8rem] max-h-32 bg-zinc-900/40 hover:bg-zinc-900/70 border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 text-zinc-600 hover:text-emerald-400 rounded-2xl p-4 text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 group">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/10 border border-zinc-700 group-hover:border-emerald-500/30 flex items-center justify-center transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  Add column
                </button>
              )}
            </div>

            {/* Empty board state */}
            {columns.length === 0 && !addingCol && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-1">Board is empty</h3>
                <p className="text-xs text-zinc-600 max-w-xs">Add your first column to start organizing tasks — try "To Do", "In Progress", "Done".</p>
              </div>
            )}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <div style={{ width: '20rem' }} className="rotate-1 opacity-90 shadow-2xl shadow-black/60">
                <TaskCard task={activeTask} onDelete={() => {}} onEdit={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {editingTask && <EditTaskModal task={editingTask} onSave={handleSaveTask} onClose={() => { setEditingTask(null); setNewTaskColumnId(null); }} />}
      {showShare && board && <ShareModal board={board} onClose={() => setShowShare(false)} onUpdate={b => { setBoard(b); setColumns(b.columns); }} />}
    </div>
  );
}

function StatPill({ icon, label, color = 'text-zinc-500' }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      {icon}
      <span className="text-xs font-normal">{label}</span>
    </div>
  );
}
