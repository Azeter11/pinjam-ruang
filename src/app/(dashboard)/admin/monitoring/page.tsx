'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, Building2, Users, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import api from '@/services/api';

export default function AdminMonitoringPage() {
  const stats = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    },
  });

  const bookingsByStatus = [
    { name: 'Menunggu',  value: stats.data?.pending   ?? 12, color: '#f59e0b' },
    { name: 'Disetujui', value: stats.data?.approved  ?? 45, color: '#10b981' },
    { name: 'Ditolak',   value: stats.data?.rejected  ??  8, color: '#ef4444' },
    { name: 'Selesai',   value: stats.data?.completed ?? 63, color: '#6366f1' },
  ];

  const weeklyData = stats.data?.weekly ?? [
    { day: 'Sen', bookings: 8 },
    { day: 'Sel', bookings: 12 },
    { day: 'Rab', bookings: 15 },
    { day: 'Kam', bookings: 9 },
    { day: 'Jum', bookings: 18 },
    { day: 'Sab', bookings: 5 },
    { day: 'Min', bookings: 3 },
  ];

  const summaryCards = [
    {
      label: 'Total Peminjaman',
      value: stats.data?.totalBookings ?? 128,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      glow: 'rgba(59,130,246,0.25)',
    },
    {
      label: 'Ruangan Aktif',
      value: stats.data?.activeRooms ?? 24,
      icon: Building2,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      glow: 'rgba(16,185,129,0.25)',
    },
    {
      label: 'Pengguna Terdaftar',
      value: stats.data?.totalUsers ?? 342,
      icon: Users,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      glow: 'rgba(139,92,246,0.25)',
    },
    {
      label: 'Tingkat Persetujuan',
      value: `${stats.data?.approvalRate ?? 84}%`,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      glow: 'rgba(6,182,212,0.25)',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Monitoring Penggunaan</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pantau aktivitas peminjaman ruangan secara real-time</p>
        </div>

        {/* ── Summary Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-5 card-hover animate-fade-in-up"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-md"
                  style={{ background: card.gradient, boxShadow: `0 6px 16px ${card.glow}` }}>
                  <Icon size={19} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 leading-none mb-1">
                  {stats.isLoading
                    ? <span className="skeleton inline-block w-12 h-7 rounded" />
                    : card.value}
                </p>
                <p className="text-gray-500 text-xs font-medium">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts ───────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5 animate-fade-in-up delay-200">

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Peminjaman Per Hari</h2>
                <p className="text-xs text-gray-400 mt-0.5">Minggu ini</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                7 hari terakhir
              </span>
            </div>
            {stats.isLoading ? (
              <div className="h-48 skeleton rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: '#eff6ff', radius: 6 }}
                  />
                  <Bar dataKey="bookings" radius={[8, 8, 0, 0]} name="Peminjaman"
                    fill="url(#barGradient)" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
            <div className="mb-5">
              <h2 className="font-bold text-gray-900">Status Peminjaman</h2>
              <p className="text-xs text-gray-400 mt-0.5">Distribusi saat ini</p>
            </div>
            {stats.isLoading ? (
              <div className="h-40 skeleton rounded-full w-40 mx-auto" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={bookingsByStatus}
                    cx="50%" cy="50%"
                    innerRadius={46} outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div className="space-y-2 mt-3">
              {bookingsByStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
