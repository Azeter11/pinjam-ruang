'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Calendar, Clock, User } from 'lucide-react';
import { useAllBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Booking } from '@/types';
import { formatDateShort, formatTime } from '@/lib/utils';

export default function AdminApprovalPage() {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'all'>('pending');
  const [confirmModal, setConfirmModal] = useState<{
    booking: Booking;
    action: 'approved' | 'rejected';
  } | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useAllBookings({
    status: selectedStatus === 'all' ? undefined : 'pending',
    limit: 20,
  });

  const updateStatus = useUpdateBookingStatus();

  const handleAction = (booking: Booking, action: 'approved' | 'rejected') => {
    setConfirmModal({ booking, action });
    setNote('');
  };

  const handleConfirm = () => {
    if (!confirmModal) return;
    updateStatus.mutate(
      { id: confirmModal.booking.id, status: confirmModal.action, note },
      { onSuccess: () => setConfirmModal(null) }
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Persetujuan Peminjaman</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-3 text-green-300" />
            <p>Tidak ada peminjaman yang perlu disetujui.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Pemohon</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Ruangan</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Jadwal</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                          {booking.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{booking.user?.name}</p>
                          <p className="text-gray-400 text-xs capitalize">{booking.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">{booking.room?.name}</p>
                      <p className="text-gray-400 text-xs">{booking.room?.building}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar size={11} className="text-gray-400" />
                        {formatDateShort(booking.date)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock size={11} className="text-gray-400" />
                        {formatTime(booking.start_time)}–{formatTime(booking.end_time)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAction(booking, 'approved')}
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                            title="Setujui"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => handleAction(booking, 'rejected')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              confirmModal.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {confirmModal.action === 'approved'
                ? <CheckCircle size={24} className="text-green-600" />
                : <XCircle size={24} className="text-red-600" />
              }
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-1">
              {confirmModal.action === 'approved' ? 'Setujui Peminjaman?' : 'Tolak Peminjaman?'}
            </h3>
            <p className="text-gray-500 text-sm text-center mb-4">
              {confirmModal.booking.room?.name} – {confirmModal.booking.user?.name}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Catatan (opsional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Tambahkan catatan..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={updateStatus.isPending}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-70 flex items-center justify-center gap-2 ${
                  confirmModal.action === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updateStatus.isPending && <Loader2 size={14} className="animate-spin" />}
                {confirmModal.action === 'approved' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
