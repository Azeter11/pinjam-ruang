'use client';

import { Calendar, Clock, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';
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
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Menunggu',
      value: stats.data?.pending ?? 0,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Disetujui',
      value: stats.data?.approved ?? 0,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Ditolak',
      value: stats.data?.rejected ?? 0,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">
          Selamat datang, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-blue-100 text-sm mb-4">
          Kelola peminjaman ruangan kampus Anda di sini.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          <Plus size={15} />
          Pinjam Ruangan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                <Icon size={17} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.isLoading ? <Loader2 size={20} className="animate-spin text-gray-400" /> : card.value}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Active & Pending bookings */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Peminjaman Aktif</h3>
            <Link href="/bookings?status=approved" className="text-blue-600 text-xs hover:underline">
              Lihat semua
            </Link>
          </div>
          {activeBookings.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : activeBookings.data?.data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500 text-sm">
              Tidak ada peminjaman aktif
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.data?.data.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Menunggu Persetujuan</h3>
            <Link href="/bookings?status=pending" className="text-blue-600 text-xs hover:underline">
              Lihat semua
            </Link>
          </div>
          {pendingBookings.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : pendingBookings.data?.data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500 text-sm">
              Tidak ada yang menunggu persetujuan
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
