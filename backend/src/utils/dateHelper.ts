import { Booking } from '../types';

/**
 * Cek apakah waktu baru (newStart–newEnd) bentrok dengan salah satu booking yang ada.
 * Kondisi bentrok: (newStart < existingEnd) AND (newEnd > existingStart)
 */
export function checkTimeConflict(
  existingBookings: Booking[],
  newStart: string,
  newEnd: string
): boolean {
  return existingBookings.some((booking) => {
    const existingStart = booking.start_time;
    const existingEnd = booking.end_time;
    return newStart < existingEnd && newEnd > existingStart;
  });
}

/**
 * Ambil semua booking yang bentrok dengan slot waktu baru.
 */
export function getConflictingBookings(
  existingBookings: Booking[],
  newStart: string,
  newEnd: string
): Booking[] {
  return existingBookings.filter((booking) => {
    const existingStart = booking.start_time;
    const existingEnd = booking.end_time;
    return newStart < existingEnd && newEnd > existingStart;
  });
}

/**
 * Validasi format waktu HH:MM.
 */
export function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

/**
 * Pastikan start_time < end_time.
 */
export function isValidTimeRange(start: string, end: string): boolean {
  return start < end;
}

/**
 * Pastikan tanggal booking tidak di masa lalu.
 */
export function isDateInFuture(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(date);
  return bookingDate >= today;
}
