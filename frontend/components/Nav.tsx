'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); router.push('/login'); };
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '';
  const isAuth = pathname === '/login' || pathname === '/register' || pathname === '/';
  if (isAuth) return null;

  return (
    <nav className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/boards" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <span className="text-zinc-100">Kanban<span className="text-emerald-400">Flow</span></span>
          </Link>
          {user && (
            <Link href="/boards"
              className={`hidden sm:block text-sm font-medium transition-colors ${pathname.startsWith('/boards') ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
              Boards
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-1.5 hover:bg-zinc-800 transition border border-transparent hover:border-zinc-700">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-medium text-zinc-300 hidden sm:block">{user.name}</span>
                <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 py-1 z-50">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-bold text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link href="/boards" onClick={() => setOpen(false)}
                    className="sm:hidden w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
                    Boards
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition">Sign in</Link>
              <Link href="/register" className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition shadow-lg shadow-emerald-600/20">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
