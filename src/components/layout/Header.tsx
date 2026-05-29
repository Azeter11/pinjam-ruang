'use client';

import { Menu, Bell, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { getRoleLabel } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0"
      style={{ borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>

      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Menu size={19} />
        </button>
        {title && (
          <h1 className="font-bold text-gray-900 text-base tracking-tight">{title}</h1>
        )}
        {!title && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', border: '1px solid #bfdbfe' }}>
            <Sparkles size={13} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-700">Smart Campus Portal</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-gray-500">{user ? getRoleLabel(user.role) : ''}</p>
            </div>
            <ChevronDown
              size={13}
              className="text-gray-400 transition-transform duration-200"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl z-50 py-1.5 animate-scale-in"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -8px rgba(15,23,42,0.15)' }}>
              {/* User info */}
              <div className="px-4 py-3 mx-2 mb-1 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #f8faff, #f0f9ff)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 mx-0 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                  <LogOut size={13} className="text-red-600" />
                </div>
                Keluar dari Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
