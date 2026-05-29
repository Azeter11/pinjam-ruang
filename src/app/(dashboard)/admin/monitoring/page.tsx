'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, Building2, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import api from '@/services/api';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminMonitoringPage() {
  const stats = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    },
  });

  // Mock data for chart display when API is not connected
  const bookingsByStatus = [
    { name: 'Menunggu', value: stats.data?.pending ?? 12, color: '#F59E0B' },
    { name: 'Disetujui', value: stats.data?.approved ?? 45, color: '#10B981' },
    { name: 'Ditolak', value: stats.data?.rejected ?? 8, color: '#EF4444' },
    { name: 'Selesai', value: stats.data?.completed ?? 63, color: '#6B7280' },
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
    { label: 'Total Peminjaman', value: stats.data?.totalBookings ?? 128, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Ruangan Aktif', value: stats.data?.activeRooms ?? 24, icon: Building2, color: 'text-green-600 bg-green-50' },
    { label: 'Pengguna Terdaftar', value: stats.data?.totalUsers ?? 342, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Tingkat Persetujuan', value: `${stats.data?.approvalRate ?? 84}%`, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-5xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Monitoring Penggunaan Ruangan</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <Icon size={17} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Weekly bookings bar chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Peminjaman Per Hari (Minggu Ini)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  cursor={{ fill: '#EFF6FF' }}
                />
                <Bar dataKey="bookings" fill="#2563EB" radius={[6, 6, 0, 0]} name="Peminjaman" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart by status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Status Peminjaman</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {bookingsByStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
