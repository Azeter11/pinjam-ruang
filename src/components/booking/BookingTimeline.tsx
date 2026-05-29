'use client';

import { Booking } from '@/types';
import { formatTime } from '@/lib/utils';
import { BookingStatusBadge } from './BookingStatusBadge';

interface BookingTimelineProps {
  bookings: Booking[];
  date: string;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 - 21:00

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToPercent(minutes: number, start = 7 * 60, end = 21 * 60): number {
  return ((minutes - start) / (end - start)) * 100;
}

export function BookingTimeline({ bookings, date }: BookingTimelineProps) {
  const dayBookings = bookings.filter((b) => b.date === date);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Jadwal Hari Ini</h3>

      {/* Hour markers */}
      <div className="relative">
        <div className="flex justify-between mb-1">
          {HOURS.filter((h) => h % 2 === 1).map((h) => (
            <span key={h} className="text-xs text-gray-400">
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
          {/* Hour grid lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-gray-200"
              style={{ left: `${minutesToPercent(h * 60)}%` }}
            />
          ))}

          {/* Booking blocks */}
          {dayBookings.map((booking) => {
            const startPct = minutesToPercent(timeToMinutes(booking.start_time));
            const endPct = minutesToPercent(timeToMinutes(booking.end_time));
            const width = endPct - startPct;

            const colorMap: Record<Booking['status'], string> = {
              pending: 'bg-yellow-400',
              approved: 'bg-green-500',
              rejected: 'bg-red-400 opacity-50',
              completed: 'bg-gray-400',
            };

            return (
              <div
                key={booking.id}
                className={`absolute top-1 bottom-1 rounded ${colorMap[booking.status]} flex items-center justify-center overflow-hidden`}
                style={{ left: `${startPct}%`, width: `${width}%` }}
                title={`${booking.user?.name || 'User'} · ${formatTime(booking.start_time)}–${formatTime(booking.end_time)}`}
              >
                {width > 5 && (
                  <span className="text-white text-xs font-medium truncate px-1">
                    {formatTime(booking.start_time)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: 'Menunggu', color: 'bg-yellow-400' },
            { label: 'Disetujui', color: 'bg-green-500' },
            { label: 'Selesai', color: 'bg-gray-400' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded ${l.color}`} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking list */}
      {dayBookings.length > 0 ? (
        <div className="mt-4 space-y-2">
          {dayBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm"
            >
              <div>
                <span className="font-medium text-gray-800">
                  {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                </span>
                <span className="text-gray-500 ml-2">{booking.user?.name}</span>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm mt-4">Tidak ada peminjaman</p>
      )}
    </div>
  );
}
