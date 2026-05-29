import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { Booking } from '@/types';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatDateShort, formatTime } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  actions?: React.ReactNode;
}

export function BookingCard({ booking, actions }: BookingCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {booking.room?.name || `Ruangan #${booking.room_id}`}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {booking.room?.building}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span>{formatDateShort(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-gray-400 shrink-0" />
          <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-gray-400 shrink-0" />
          <span className="truncate">{booking.purpose}</span>
        </div>
      </div>

      {actions && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
