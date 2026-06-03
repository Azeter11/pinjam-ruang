'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { bookingSchema, BookingFormData } from '@/lib/validations';
import { useCreateBooking, useCheckConflict } from '@/hooks/useBookings';
import { generateTimeSlots } from '@/lib/utils';

interface BookingFormProps {
  roomId: string;
  roomName: string;
  onSuccess?: () => void;
}

const TIME_SLOTS = generateTimeSlots(7, 21, 30);

export function BookingForm({ roomId, roomName, onSuccess }: BookingFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [formValues, setFormValues] = useState<BookingFormData | null>(null);
  const [conflictEnabled, setConflictEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { room_id: roomId },
  });

  const watchDate = watch('date');
  const watchStart = watch('start_time');
  const watchEnd = watch('end_time');

  const createBooking = useCreateBooking();
  const conflict = useCheckConflict(roomId, watchDate, watchStart, watchEnd, conflictEnabled);

  useEffect(() => {
    if (watchDate && watchStart && watchEnd && watchStart < watchEnd) {
      setConflictEnabled(true);
    } else {
      setConflictEnabled(false);
    }
  }, [watchDate, watchStart, watchEnd]);

  const onSubmit = (data: BookingFormData) => {
    setFormValues(data);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!formValues) return;

    const formData = new FormData();
    formData.append('room_id', formValues.room_id);
    formData.append('date', formValues.date);
    formData.append('start_time', formValues.start_time);
    formData.append('end_time', formValues.end_time);
    
    if (formValues.purpose) {
      formData.append('purpose', formValues.purpose);
    }
    
    if (formValues.proposal && formValues.proposal.length > 0) {
      formData.append('proposal', formValues.proposal[0]);
    }

    createBooking.mutate(formData, {
      onSuccess: () => {
        setShowConfirm(false);
        onSuccess?.();
      },
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('room_id')} value={roomId} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
          <input
            type="date"
            min={today}
            {...register('date')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Mulai</label>
            <select
              {...register('start_time')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Selesai</label>
            <select
              {...register('end_time')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
          </div>
        </div>

        {/* Conflict check */}
        {conflictEnabled && (
          <div>
            {conflict.isFetching && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <Loader2 size={14} className="animate-spin" />
                <span>Memeriksa ketersediaan jadwal...</span>
              </div>
            )}
            {!conflict.isFetching && conflict.data?.hasConflict && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>Waktu tersebut sudah terbooking atau peminjaman belum selesai. Silakan pilih waktu yang lain.</span>
              </div>
            )}
            {!conflict.isFetching && conflict.data && !conflict.data.hasConflict && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                <CheckCircle size={14} />
                <span>Jadwal tersedia!</span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Proposal Peminjaman / Surat Perizinan <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            {...register('proposal')}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          />
          <p className="text-[11px] text-gray-400 mt-1">Hanya file PDF dengan ukuran maksimal 10MB.</p>
          {errors.proposal && <p className="text-red-500 text-xs mt-1">{(errors.proposal as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Catatan <span className="text-gray-400 font-normal text-xs">(opsional)</span>
          </label>
          <textarea
            {...register('purpose')}
            rows={3}
            placeholder="Tambahkan catatan peminjaman jika diperlukan..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
        </div>

        <button
          type="submit"
          disabled={conflict.data?.hasConflict}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Ajukan Peminjaman
        </button>
      </form>

      {/* Confirm Modal */}
      {showConfirm && formValues && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Konfirmasi Peminjaman</h3>
            <p className="text-gray-600 text-sm mb-4">Pastikan detail peminjaman sudah benar.</p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Ruangan</span>
                <span className="font-medium">{roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-medium">{formValues.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waktu</span>
                <span className="font-medium">{formValues.start_time} – {formValues.end_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Proposal</span>
                <span className="font-medium truncate max-w-[60%]" title={formValues.proposal?.[0]?.name}>
                  {formValues.proposal?.[0]?.name || 'Proposal.pdf'}
                </span>
              </div>
              {formValues.purpose && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Catatan</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{formValues.purpose}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={createBooking.isPending}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {createBooking.isPending && <Loader2 size={14} className="animate-spin" />}
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
