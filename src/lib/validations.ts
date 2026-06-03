import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
    role: z.enum(['mahasiswa', 'dosen', 'organisasi']).refine((v) => !!v, {
      message: 'Pilih peran Anda',
    }),
    faculty: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const bookingSchema = z
  .object({
    room_id: z.string().min(1, 'Pilih ruangan'),
    date: z.string().min(1, 'Pilih tanggal'),
    start_time: z.string().min(1, 'Pilih jam mulai'),
    end_time: z.string().min(1, 'Pilih jam selesai'),
    purpose: z.string().max(500, 'Catatan maksimal 500 karakter').optional().or(z.literal('')),
    proposal: z.any()
      .refine((files) => files && files.length > 0, 'Proposal peminjaman wajib diunggah (PDF)')
      .refine((files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        return file.type === 'application/pdf';
      }, 'File harus berupa dokumen PDF'),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
      }
      return true;
    },
    { message: 'Jam selesai harus setelah jam mulai', path: ['end_time'] }
  );

export const roomSchema = z.object({
  name: z.string().min(3, 'Nama ruangan minimal 3 karakter'),
  building: z.string().min(1, 'Gedung wajib diisi'),
  capacity: z.number().min(1, 'Kapasitas minimal 1').max(1000, 'Kapasitas maksimal 1000'),
  facility: z.array(z.string()).min(1, 'Tambahkan minimal 1 fasilitas'),
  status: z.enum(['available', 'occupied', 'maintenance']),
  image: z.string().optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
