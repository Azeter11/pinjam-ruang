'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Calendar, Clock, User, Eye, MapPin, FileText, X } from 'lucide-react';
import { useAllBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Booking } from '@/types';
import { formatDateShort, formatTime } from '@/lib/utils';

export default function AdminApprovalPage() {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'all'>('pending');
  const [detailModal, setDetailModal] = useState<Booking | null>(null);
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
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Persetujuan Peminjaman</h1>
            <p className="text-gray-500 text-sm mt-0.5">Tinjau dan kelola permintaan peminjaman ruangan</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 p-1 rounded-xl"
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setSelectedStatus('pending')}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={selectedStatus === 'pending' ? {
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(245,158,11,0.3)',
              } : { color: '#6b7280' }}
            >
              Menunggu
              {selectedStatus !== 'pending' && data?.total != null && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                  {data.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={selectedStatus === 'all' ? {
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
              } : { color: '#6b7280' }}
            >
              Semua
            </button>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden animate-fade-in-up delay-75"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-blue-500 mb-3" />
              <p className="text-sm text-gray-400">Memuat data...</p>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
                style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <p className="font-bold text-gray-900 mb-1">Tidak ada peminjaman</p>
              <p className="text-sm text-gray-400">
                {selectedStatus === 'pending'
                  ? 'Semua permintaan sudah ditangani!'
                  : 'Belum ada data peminjaman.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    {['Pemohon', 'Ruangan', 'Jadwal', 'Keperluan', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((booking, idx) => (
                    <tr
                      key={booking.id}
                      className="animate-fade-in-up group hover:bg-blue-50/30 transition-colors"
                      style={{ borderBottom: '1px solid #f8fafc', animationDelay: `${idx * 40}ms` }}
                    >
                      {/* Pemohon */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                            {booking.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs leading-tight">{booking.user?.name}</p>
                            <p className="text-gray-400 text-[11px] capitalize mt-0.5">{booking.user?.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Ruangan */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 text-xs">{booking.room?.name}</p>
                        <p className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />{booking.room?.building}
                        </p>
                      </td>

                      {/* Jadwal */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Calendar size={11} className="text-blue-400" />
                          {formatDateShort(booking.date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Clock size={11} className="text-gray-400" />
                          {formatTime(booking.start_time)}–{formatTime(booking.end_time)}
                        </div>
                      </td>

                      {/* Keperluan */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <p className="text-xs text-gray-600 truncate">{booking.purpose}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailModal(booking)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                            style={{ background: '#eff6ff', color: '#2563eb' }}
                            title="Lihat Detail"
                          >
                            <Eye size={12} /> Detail
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(booking, 'approved')}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                style={{ background: '#ecfdf5', color: '#16a34a' }}
                                title="Setujui"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleAction(booking, 'rejected')}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                style={{ background: '#fef2f2', color: '#dc2626' }}
                                title="Tolak"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══ Detail Modal ═════════════════════════════════════════ */}
      {detailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content">

            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 rounded-t-2xl z-10"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 className="font-bold text-gray-900">Detail Peminjaman</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{detailModal.id.slice(0, 16)}…</p>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex justify-center">
                <BookingStatusBadge status={detailModal.status} />
              </div>

              {/* Info sections */}
              {[
                {
                  icon: MapPin, title: 'Informasi Ruangan',
                  rows: [
                    ['Nama Ruangan', detailModal.room?.name],
                    ['Gedung', detailModal.room?.building],
                    ['Kapasitas', `${detailModal.room?.capacity} orang`],
                  ],
                },
                {
                  icon: Calendar, title: 'Jadwal Peminjaman',
                  rows: [
                    ['Tanggal', formatDateShort(detailModal.date)],
                    ['Waktu Mulai', formatTime(detailModal.start_time)],
                    ['Waktu Selesai', formatTime(detailModal.end_time)],
                    ['Durasi', (() => {
                      const start = new Date(`2000-01-01T${detailModal.start_time}`);
                      const end   = new Date(`2000-01-01T${detailModal.end_time}`);
                      const diff  = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      return `${diff} jam`;
                    })()],
                  ],
                },
                {
                  icon: User, title: 'Informasi Pemohon',
                  rows: [
                    ['Nama', detailModal.user?.name],
                    ['Email', detailModal.user?.email],
                    ['Role', detailModal.user?.role],
                    ...(detailModal.user?.faculty ? [['Fakultas', detailModal.user.faculty] as [string, string | undefined]] : []),
                  ],
                },
              ].map(({ icon: Icon, title, rows }) => (
                <div key={title}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: '#eff6ff' }}>
                      <Icon size={14} className="text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
                    {rows.map(([label, value], i) => (
                      <div key={label} className="flex justify-between items-center px-4 py-2.5 text-sm"
                        style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">{value ?? '–'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Keperluan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
                    <FileText size={14} className="text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">Keperluan</h4>
                </div>
                <div className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed"
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  {detailModal.purpose}
                </div>
              </div>

              {/* Diajukan pada */}
              <p className="text-center text-xs text-gray-400">
                Diajukan pada {new Date(detailModal.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>

              {/* Actions */}
              {detailModal.status === 'pending' && (
                <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => { setDetailModal(null); handleAction(detailModal, 'rejected'); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{ background: '#fef2f2', color: '#dc2626' }}
                  >
                    <XCircle size={15} /> Tolak
                  </button>
                  <button
                    onClick={() => { setDetailModal(null); handleAction(detailModal, 'approved'); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                  >
                    <CheckCircle size={15} /> Setujui
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ Confirm Modal ════════════════════════════════════════ */}
      {confirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 modal-content">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: confirmModal.action === 'approved'
                  ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                  : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              }}>
              {confirmModal.action === 'approved'
                ? <CheckCircle size={28} className="text-green-500" />
                : <XCircle size={28} className="text-red-500" />}
            </div>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-1">
              {confirmModal.action === 'approved' ? 'Setujui Peminjaman?' : 'Tolak Peminjaman?'}
            </h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              <strong className="text-gray-700">{confirmModal.booking.room?.name}</strong> –{' '}
              {confirmModal.booking.user?.name}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Catatan <span className="text-gray-400 normal-case font-normal">(opsional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Tambahkan catatan untuk pemohon..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                style={{ border: '1px solid #e2e8f0' }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={updateStatus.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.02]"
                style={confirmModal.action === 'approved' ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                } : {
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                }}
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
