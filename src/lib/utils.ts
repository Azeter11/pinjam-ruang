import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Booking, Room } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function getStatusColor(status: Booking['status']) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getRoomStatusColor(status: Room['status']) {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 border-green-200';
    case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
    case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getStatusLabel(status: Booking['status']): string {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'approved': return 'Disetujui';
    case 'rejected': return 'Ditolak';
    case 'completed': return 'Selesai';
    default: return status;
  }
}

export function getRoomStatusLabel(status: Room['status']): string {
  switch (status) {
    case 'available': return 'Tersedia';
    case 'occupied': return 'Terpakai';
    case 'maintenance': return 'Maintenance';
    default: return status;
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'mahasiswa': return 'Mahasiswa';
    case 'dosen': return 'Dosen';
    case 'organisasi': return 'Organisasi';
    case 'admin': return 'Administrator';
    default: return role;
  }
}

export function generateTimeSlots(startHour = 7, endHour = 21, interval = 30): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h === endHour && m > 0) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}
