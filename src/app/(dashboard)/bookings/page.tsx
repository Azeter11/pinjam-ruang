'use client';

import { useState } from 'react';
import { Loader2, CalendarX } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingFilter, Booking } from '@/types';

const STATUS_FILTERS: { label: string; value: BookingFilter['status'] | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
  { label: 'Selesai', value: 'completed' },
];

export default function BookingsPage() {
  const [status, setStatus] = useState<BookingFilter['status'] | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBookings({
    status: status || undefined,
    page,
    limit: 9,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Peminjaman Saya</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CalendarX size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Tidak ada peminjaman ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
