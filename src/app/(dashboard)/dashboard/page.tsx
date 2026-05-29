'use client';

import { Calendar, Clock, CheckCircle, XCircle, Loader2, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useBookings, useDashboardStats } from '@/hooks/useBookings';
import { BookingCard } from '@/components/booking/BookingCard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const stats = useDashboardStats();
  const activeBookings = useBookings({ status: 'approved', limit: 3 });
  const pendingBookings = useBookings({ status: 'pending', limit: 3 });

  const statCards = [
    {
      label: 'Total Peminjaman',
      value: stats.data?.total ?? 0,
      icon: Calendar,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      bg: '#eff6ff',
      text: '#1d4ed8',
      glow: 'rgba(59,130,246,0.25)',
    },
    {
      label: 'Menunggu',
      value: stats.data?.pending ?? 0,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bg: '#fffbeb',
      text: '#b45309',
      glow: 'rgba(245,158,11,0.25)',
    },
    {
      label: 'Disetujui',
      value: stats.data?.approved ?? 0,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bg: '#ecfdf5',
      text: '#047857',
      glow: 'rgba(16,185,129,0.25)',
    },
    {
      label: 'Ditolak',
      value: stats.data?.rejected ?? 0,
      icon: XCircle,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      bg: '#fef2f2',
      text: '#b91c1c',
      glow: 'rgba(239,68,68,0.25)',
    },
  ];

  const firstName = user?.name?.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Welcome Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)',
          boxShadow: '0 20px 40px -8px rgba(59,130,246,0.4)',
        }}>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
        <div className="absolute top-4 right-20 w-16 h-16 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-0.5">{greeting},</p>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">
              {firstName}! 👋
            </h2>
            <p className="text-blue-100 text-sm max-w-xs leading-relaxed">
              Kelola peminjaman ruangan kampus Anda dengan mudah dan cepat.
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl animate-float"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <TrendingUp size={26} className="text-white" />
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:gap-3"
            style={{
              background: 'rgba(255,255,255,0.95)',
              color: '#1d4ed8',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={15} />
            Pinjam Ruangan
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 card-hover animate-fade-in-up cursor-default"
              style={{
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: card.gradient, boxShadow: `0 6px 16px ${card.glow}` }}>
                  <Icon size={19} className="text-white" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                  style={{ background: card.bg, color: card.text }}>
                  Live
                </span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 leading-none mb-1">
                {stats.isLoading
                  ? <span className="skeleton inline-block w-8 h-7" />
                  : card.value
                }
              </p>
              <p className="text-gray-500 text-xs font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Active & Pending Bookings ────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Active */}
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
              <h3 className="font-bold text-gray-900 text-sm">Peminjaman Aktif</h3>
            </div>
            <Link
              href="/bookings?status=approved"
              className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold hover:gap-2 transition-all"
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          {activeBookings.isLoading ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>
          ) : activeBookings.data?.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">Tidak ada peminjaman aktif</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.data?.data.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        {/* Pending */}
        <div className="animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse-soft" />
              <h3 className="font-bold text-gray-900 text-sm">Menunggu Persetujuan</h3>
            </div>
            <Link
              href="/bookings?status=pending"
              className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold hover:gap-2 transition-all"
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>
          {pendingBookings.isLoading ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>
          ) : pendingBookings.data?.data.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Clock size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">Tidak ada yang menunggu persetujuan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.data?.data.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
