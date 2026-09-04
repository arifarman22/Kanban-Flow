'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Board } from '@/lib/types';

const CARD_ACCENTS = [
  'border-l-emerald-500',
  'border-l-cyan-500',
  'border-l-violet-500',
  'border-l-amber-500',
  'border-l-rose-500',
  'border-l-sky-500',
];

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-cyan-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-sky-600',
];

function getAccent(id: string) {
  return CARD_ACCENTS[id.charCodeAt(0) % CARD_ACCENTS.length];
}
function getAvatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function BoardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/boards').then(r => { setBoards(r.data); setLoading(false); });
  }, [user, router]);

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const { data } = await api.post('/boards', { title: newTitle.trim(), slug: newSlug.trim() || undefined });
    setBoards(prev => [data, ...prev]);
    setNewTitle(''); setNewSlug(''); setShowModal(false); setCreating(false);
  };

  const deleteBoard = async (id: string) => {
    await api.delete(`/boards/${id}`);
    setBoards(prev => prev.filter(b => b.id !== id));
    setDeleteId(null);
  };

  const ownedBoards = boards.filter(b => b.ownerId === user?.id);
  const sharedBoards = boards.filter(b => b.ownerId !== user?.id);
  const totalTasks = boards.reduce((s, b) => s + (b.columns?.reduce((cs, c) => cs + (c.tasks?.length ?? 0), 0) ?? 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Workspace</span>
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">{user?.name}&apos;s Workspace</h1>
              <p className="text-sm text-zinc-500 mt-0.5 font-normal">Manage your boards, track progress, and collaborate with your team.</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-emerald-300 hover:text-white font-medium px-5 py-2 rounded-full text-sm transition-colors duration-200 border border-emerald-500/50 hover:border-emerald-400 bg-transparent shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Board
            </button>
          </div>

          {/* Stats bar */}
          {!loading && (
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                <span className="text-sm text-zinc-400 font-normal"><span className="text-zinc-100 font-medium">{boards.length}</span> boards</span>
              </div>
              <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm text-zinc-400 font-normal"><span className="text-zinc-100 font-medium">{totalTasks}</span> total tasks</span>
              </div>
              <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-zinc-400 font-normal"><span className="text-zinc-100 font-medium">{ownedBoards.length}</span> owned · <span className="text-zinc-100 font-medium">{sharedBoards.length}</span> shared</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-900 rounded-lg border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center mb-4 border border-zinc-800">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-zinc-100 mb-1">No boards yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs font-normal">Create your first board to start organizing work and collaborating with your team.</p>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-emerald-300 hover:text-white font-medium px-5 py-2 rounded-full text-sm transition-colors border border-emerald-500/50 hover:border-emerald-400 bg-transparent">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first board
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {ownedBoards.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Your Boards</span>
                    <span className="bg-zinc-800 text-zinc-400 text-xs font-medium px-2 py-0.5 rounded border border-zinc-700">{ownedBoards.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ownedBoards.map(board => <BoardCard key={board.id} board={board} isOwner onDelete={() => setDeleteId(board.id)} />)}
                </div>
              </section>
            )}
            {sharedBoards.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Shared with you</span>
                  <span className="bg-zinc-800 text-zinc-400 text-xs font-medium px-2 py-0.5 rounded border border-zinc-700">{sharedBoards.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sharedBoards.map(board => <BoardCard key={board.id} board={board} isOwner={false} onDelete={() => {}} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Create new board</h2>
                <p className="text-xs text-zinc-500 mt-0.5 font-normal">Give your board a clear, descriptive name</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300 transition p-1.5 rounded-lg hover:bg-zinc-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={createBoard} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Board title</label>
                <input autoFocus value={newTitle} onChange={e => {
                  setNewTitle(e.target.value);
                  if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }} required
                  placeholder="e.g. Product Roadmap, Sprint 12…"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 rounded-lg px-3.5 py-2.5 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Slug <span className="normal-case text-zinc-600 font-normal">(URL identifier)</span></label>
                <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition overflow-hidden">
                  <span className="pl-3.5 pr-1 text-sm text-zinc-600 select-none shrink-0">/boards/</span>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-board"
                    className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 pr-3.5 py-2.5 text-sm font-mono focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowModal(false); setNewSlug(''); }}
                  className="flex-1 border border-zinc-700 text-zinc-400 font-medium py-2.5 rounded-lg text-sm hover:bg-zinc-800 hover:text-zinc-300 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-lg shadow-emerald-600/20">
                  {creating ? 'Creating…' : 'Create board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setDeleteId(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100">Delete board?</h3>
              <p className="text-xs text-zinc-500 mt-1 font-normal">This will permanently delete the board and all its columns and tasks. This cannot be undone.</p>
            </div>
            <div className="flex gap-3 px-6 py-4">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-zinc-700 text-zinc-400 font-medium py-2.5 rounded-lg text-sm hover:bg-zinc-800 transition">
                Cancel
              </button>
              <button onClick={() => deleteBoard(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-lg text-sm transition">
                Delete board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardCard({ board, isOwner, onDelete }: { board: Board; isOwner: boolean; onDelete: () => void }) {
  const accent = getAccent(board.id);
  const avatarColor = getAvatarColor(board.id);
  const totalTasks = board.columns?.reduce((sum, c) => sum + (c.tasks?.length ?? 0), 0) ?? 0;
  const totalColumns = board.columns?.length ?? 0;
  const initials = board.owner.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const lastActivity = new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`group bg-zinc-900 border border-zinc-800 border-l-2 ${accent} rounded-lg hover:border-zinc-700 hover:border-l-2 transition-all duration-150 hover:shadow-lg hover:shadow-black/30 flex flex-col`}>

      {/* Card top */}
      <div className="px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/boards/${board.slug}`}>
              <h3 className="font-medium text-zinc-100 text-sm leading-snug hover:text-emerald-400 transition-colors line-clamp-1">
                {board.title}
              </h3>
            </Link>
            <p className="text-xs text-zinc-600 mt-0.5 font-normal">Created {lastActivity}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isOwner && (
              <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">
                Shared
              </span>
            )}
            {isOwner && (
              <button onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs text-zinc-500 font-normal">{totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            <span className="text-xs text-zinc-500 font-normal">{totalColumns} columns</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-zinc-500 font-normal">{board.members.length + 1} members</span>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
        {/* Member avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            <div className={`w-6 h-6 rounded-md ${avatarColor} text-white text-[10px] font-semibold flex items-center justify-center ring-1 ring-zinc-900 z-10`}>
              {initials}
            </div>
            {board.members.slice(0, 2).map((m, i) => (
              <div key={m.id} style={{ zIndex: 9 - i }}
                className="w-6 h-6 rounded-md bg-zinc-700 text-zinc-300 text-[10px] font-semibold flex items-center justify-center ring-1 ring-zinc-900">
                {m.user.name[0].toUpperCase()}
              </div>
            ))}
            {board.members.length > 2 && (
              <div className="w-6 h-6 rounded-md bg-zinc-700 text-zinc-500 text-[10px] font-semibold flex items-center justify-center ring-1 ring-zinc-900">
                +{board.members.length - 2}
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-600 font-normal">
            {isOwner ? 'Owner' : `by ${board.owner.name}`}
          </span>
        </div>

        <Link href={`/boards/${board.slug}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
          Open
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
