import { Calendar, Clock, FileText, Download, MapPin } from 'lucide-react';
import { Booking } from '@/types';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatDateShort, formatTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface BookingCardProps {
  booking: Booking;
  actions?: React.ReactNode;
  showDownload?: boolean;
}

export function BookingCard({ booking, actions, showDownload = true }: BookingCardProps) {
  const token = useAuthStore((state) => state.token);

  const handleDownloadPDF = async () => {
    try {
      if (!token) throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${booking.id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch { /* ignore */ }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bukti-peminjaman-${booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert(`Gagal mengunduh PDF: ${error instanceof Error ? error.message : 'Silakan coba lagi'}`);
    }
  };

  const isApproved = booking.status === 'approved';

  return (
    <div
      className="bg-white rounded-2xl p-4 card-hover animate-fade-in-up"
      style={{
        border: '1px solid #f1f5f9',
        boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-sm truncate leading-tight">
            {booking.room?.name || `Ruangan #${booking.room_id}`}
          </h3>
          {booking.room?.building && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-gray-400 shrink-0" />
              <p className="text-gray-500 text-xs truncate">{booking.room.building}</p>
            </div>
          )}
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Divider */}
      <div className="h-px mb-3" style={{ background: '#f1f5f9' }} />

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: '#eff6ff' }}>
            <Calendar size={12} className="text-blue-500" />
          </div>
          <span className="font-medium">{formatDateShort(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: '#f0fdf4' }}>
            <Clock size={12} className="text-green-500" />
          </div>
          <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: '#fafafa' }}>
            <FileText size={12} className="text-gray-400" />
          </div>
          <span className="truncate text-gray-500">{booking.purpose || 'Tidak ada catatan'}</span>
        </div>
        {booking.proposal_url && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: '#e0f2fe' }}>
              <FileText size={12} className="text-sky-500" />
            </div>
            <a
              href={booking.proposal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-800 font-semibold underline truncate"
            >
              Unduh / Lihat Proposal
            </a>
          </div>
        )}
      </div>

      {/* Download PDF */}
      {showDownload && isApproved && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #e2e8f0' }}>
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            }}
          >
            <Download size={13} />
            Unduh Bukti Peminjaman
          </button>
        </div>
      )}

      {/* Extra actions */}
      {actions && (
        <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: '1px solid #f1f5f9' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
