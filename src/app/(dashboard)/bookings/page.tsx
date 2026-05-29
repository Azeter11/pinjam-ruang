'use client';

import { useState } from 'react';
import { Loader2, CalendarX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingFilter } from '@/types';

const STATUS_FILTERS: { label: string; value: BookingFilter['status'] | ''; color: string; bg: string }[] = [
  { label: 'Semua',    value: '',           color: '#374151', bg: '#f9fafb' },
  { label: 'Menunggu', value: 'pending',    color: '#92400e', bg: '#fef3c7' },
  { label: 'Disetujui',value: 'approved',   color: '#065f46', bg: '#d1fae5' },
  { label: 'Ditolak',  value: 'rejected',   color: '#991b1b', bg: '#fee2e2' },
  { label: 'Selesai',  value: 'completed',  color: '#1e3a5f', bg: '#dbeafe' },
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
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Peminjaman Saya</h1>
        <p className="text-gray-500 text-sm mt-0.5">Riwayat dan status semua peminjaman ruangan Anda</p>
      </div>

      {/* ── Status Filter Tabs ──────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl p-1.5 flex flex-wrap gap-1 animate-fade-in-up delay-75"
        style={{
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
        }}
      >
        {STATUS_FILTERS.map((f) => {
          const isActive = status === f.value;
          return (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className="flex-1 min-w-max px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={isActive ? {
                background: f.value === ''
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : f.bg,
                color: f.value === '' ? '#fff' : f.color,
                boxShadow: f.value === ''
                  ? '0 4px 10px rgba(59,130,246,0.3)'
                  : `0 2px 6px ${f.bg}80`,
              } : {
                color: '#6b7280',
                background: 'transparent',
              }}
            >
              {f.label}
              {data && isActive && (
                <span className="ml-1.5 text-[10px] opacity-70">({data.total})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Booking Grid ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl skeleton animate-fade-in-up" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 animate-float"
            style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}
          >
            <CalendarX size={36} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-900 text-base mb-1">Tidak ada peminjaman</p>
          <p className="text-sm text-gray-500 max-w-xs">
            {status
              ? `Belum ada peminjaman dengan status "${STATUS_FILTERS.find(f => f.value === status)?.label}".`
              : 'Anda belum memiliki riwayat peminjaman. Mulai pinjam ruangan sekarang!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {data?.data.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────────── */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 animate-fade-in">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                style={{ border: '1px solid #e2e8f0' }}
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>

              {Array.from({ length: data.totalPages }).map((_, i) => {
                const p = i + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all"
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#fff',
                      boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
                    } : {
                      border: '1px solid #e2e8f0',
                      color: '#6b7280',
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                style={{ border: '1px solid #e2e8f0' }}
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
