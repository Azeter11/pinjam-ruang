'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { addDays, format, startOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRoomSchedule } from '@/hooks/useRooms';
import { Booking } from '@/types';
import { formatTime } from '@/lib/utils';

interface RoomScheduleProps {
  roomId: string;
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

function timeToRow(time: string): number {
  const [h] = time.split(':').map(Number);
  return h - 7;
}

function timeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export function RoomSchedule({ roomId }: RoomScheduleProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekEnd = addDays(weekStart, 6);

  const { data, isLoading } = useRoomSchedule(
    roomId,
    format(weekStart, 'yyyy-MM-dd'),
    format(weekEnd, 'yyyy-MM-dd')
  );

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForDay = (date: Date): Booking[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return (data?.schedule ?? []).filter(
      (b: Booking) => b.date === dateStr && b.status !== 'rejected'
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Jadwal Mingguan</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {format(weekStart, 'd MMM', { locale: id })} – {format(weekEnd, 'd MMM yyyy', { locale: id })}
          </span>
          <button
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-0.5 mb-1">
              <div className="text-xs text-gray-400 py-1 text-center" />
              {days.map((day, i) => {
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <div
                    key={i}
                    className={`text-center py-1 rounded text-xs font-medium ${
                      isToday ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-xs opacity-75">{format(day, 'd')}</div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-0.5">
                  <div className="text-xs text-gray-400 text-right pr-2 py-1 leading-none">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {days.map((day, dayIdx) => {
                    const dayBookings = getBookingsForDay(day);
                    const booking = dayBookings.find((b) => {
                      const [bh] = b.start_time.split(':').map(Number);
                      return bh === hour;
                    });

                    return (
                      <div
                        key={dayIdx}
                        className="h-6 border-t border-gray-100 relative"
                      >
                        {booking && (
                          <div
                            className={`absolute inset-x-0 z-10 rounded text-xs flex items-center justify-center overflow-hidden px-1 ${
                              booking.status === 'approved'
                                ? 'bg-green-100 border border-green-200 text-green-800'
                                : 'bg-yellow-100 border border-yellow-200 text-yellow-800'
                            }`}
                            style={{
                              height: `${timeDuration(booking.start_time, booking.end_time) * 24}px`,
                            }}
                            title={`${booking.user?.name} · ${formatTime(booking.start_time)}–${formatTime(booking.end_time)}`}
                          >
                            <span className="truncate leading-none">
                              {formatTime(booking.start_time)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
