'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DoorOpen,
  CalendarCheck,
  CheckSquare,
  Settings,
  BarChart3,
  X,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const userNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Ringkasan aktivitas' },
  { href: '/rooms',     label: 'Ruangan',    icon: DoorOpen,        desc: 'Cari & pinjam ruangan' },
  { href: '/bookings',  label: 'Peminjaman', icon: CalendarCheck,   desc: 'Riwayat peminjaman' },
];

const adminNav = [
  { href: '/admin/approval',   label: 'Persetujuan',    icon: CheckSquare, desc: 'Kelola permintaan' },
  { href: '/admin/rooms',      label: 'Kelola Ruangan', icon: Settings,    desc: 'Tambah & edit ruangan' },
  { href: '/admin/monitoring', label: 'Monitoring',     icon: BarChart3,   desc: 'Pantau penggunaan' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNav : userNav;

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <Building2 size={17} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">Pinjam Ruang</span>
              <p className="text-[10px] text-blue-400 font-medium">Smart Campus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X size={15} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 my-4 rounded-xl p-3 shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff' }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold mt-0.5"
                style={{
                  background: isAdmin ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                  color: isAdmin ? '#fca5a5' : '#93c5fd',
                }}>
                {isAdmin ? 'Administrator' : 'Pengguna'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <p className="px-5 text-[10px] font-semibold uppercase tracking-widest mb-1.5 shrink-0"
          style={{ color: 'rgba(148,163,184,0.5)' }}>
          Menu
        </p>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-in-up',
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
                style={{
                  animationDelay: `${idx * 60}ms`,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2))'
                    : undefined,
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = '';
                }}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                  isActive ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                )}>
                  <Icon size={16} />
                </div>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight size={13} className="text-blue-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] text-slate-600 text-center">
            © 2025 Smart Campus
          </p>
        </div>
      </aside>
    </>
  );
}
