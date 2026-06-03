'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, MapPin, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRoom } from '@/hooks/useRooms';
import { BookingForm } from '@/components/booking/BookingForm';
import { RoomStatusBadge } from '@/components/room/RoomStatusBadge';
import { RoomSchedule } from '@/components/room/RoomSchedule';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data: room, isLoading, error } = useRoom(roomId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Ruangan tidak ditemukan.</p>
        <Link href="/rooms" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke daftar ruangan
        </Link>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pengajuan Berhasil!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Peminjaman ruangan <strong>{room.name}</strong> telah diajukan dan menunggu persetujuan admin.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/bookings"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Lihat Peminjaman
          </Link>
          <Link
            href="/rooms"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Kembali ke Ruangan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5">
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft size={15} />
          Kembali
        </Link>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Room info */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
              {room.image ? (
                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-blue-200">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 20V8l8-5 8 5v12H4zm2-2h12V9.5l-6-3.75L6 9.5V18zm5-4h2v-2h-2v2zm0-4h2V8h-2v2z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <RoomStatusBadge status={room.status} />
              </div>
            </div>

            <div className="p-5">
              <h1 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h1>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" />
                  {room.building}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" />
                  {room.capacity} orang
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Fasilitas:</p>
                <div className="flex flex-wrap gap-2">
                  {room.facility.map((f) => (
                    <span key={f} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Jadwal Ruangan */}
          <RoomSchedule roomId={roomId} />
        </div>

        {/* Booking form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6 z-20">
            <h2 className="font-semibold text-gray-900 mb-4">Form Peminjaman</h2>
            {room.status !== 'available' ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <p>Ruangan ini sedang tidak tersedia untuk dipinjam.</p>
              </div>
            ) : (
              <BookingForm
                roomId={room.id}
                roomName={room.name}
                onSuccess={() => setBookingSuccess(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
