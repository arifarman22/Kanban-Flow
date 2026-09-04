'use client';
import { useState, useEffect } from 'react';
import { Board, User } from '@/lib/types';
import api from '@/lib/api';

interface Props {
  board: Board;
  onClose: () => void;
  onUpdate: (board: Board) => void;
}

export default function ShareModal({ board, onClose, onUpdate }: Props) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const memberIds = new Set(board.members.map(m => m.userId));
  memberIds.add(board.owner.id);

  useEffect(() => {
    api.get('/auth/users').then(r => setAllUsers(r.data));
  }, []);

  const invite = async (userId: string) => {
    setError(''); setLoadingId(userId);
    try {
      const user = allUsers.find(u => u.id === userId)!;
      await api.post(`/boards/${board.id}/members`, { email: user.email });
      const { data } = await api.get(`/boards/${board.id}`);
      onUpdate(data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to invite');
    } finally {
      setLoadingId(null);
    }
  };

  const remove = async (userId: string) => {
    setLoadingId(userId);
    await api.delete(`/boards/${board.id}/members/${userId}`);
    const { data } = await api.get(`/boards/${board.id}`);
    onUpdate(data);
    setLoadingId(null);
  };

  const filteredUsers = allUsers.filter(u =>
    !memberIds.has(u.id) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const invitedMembers = board.members;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Share &ldquo;{board.title}&rdquo;</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{board.members.length + 1} member{board.members.length !== 0 ? 's' : ''} · owner: {board.owner.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1.5 rounded-lg hover:bg-zinc-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* Invited members */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invited members</span>
              {invitedMembers.length > 0 && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium px-1.5 py-0.5 rounded-md">{invitedMembers.length}</span>
              )}
            </div>

            {/* Owner row */}
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-800/40 border border-zinc-700/30 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {board.owner.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{board.owner.name}</p>
                  <p className="text-xs text-zinc-500">{board.owner.email}</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium px-2.5 py-1 rounded-lg">Owner</span>
            </div>

            {invitedMembers.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-600">No members invited yet</p>
                <p className="text-xs text-zinc-700 mt-1">Invite users from the list below</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {invitedMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-800/50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-bold flex items-center justify-center shrink-0">
                        {m.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{m.user.name}</p>
                        <p className="text-xs text-zinc-500">{m.user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(m.userId)}
                      disabled={loadingId === m.userId}
                      className="text-xs text-slate-600 hover:text-red-400 font-medium px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100 disabled:opacity-50 flex items-center gap-1">
                      {loadingId === m.userId
                        ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                      }
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* All users */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All users</span>
              <span className="bg-zinc-800 text-zinc-500 border border-zinc-700 text-xs font-medium px-1.5 py-0.5 rounded-md">{filteredUsers.length}</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2.5 rounded-xl text-sm mb-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {filteredUsers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-zinc-600">{search ? 'No users match your search' : 'All registered users are already members'}</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-800/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-bold flex items-center justify-center shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => invite(u.id)}
                      disabled={loadingId === u.id}
                      className="text-xs font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-600 px-3 py-1.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5">
                      {loadingId === u.id
                        ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      }
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
