'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, Upload, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/useRooms';
import { RoomStatusBadge } from '@/components/room/RoomStatusBadge';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { roomSchema, RoomFormData } from '@/lib/validations';
import { Room } from '@/types';
import { roomService } from '@/services/roomService';

const FACILITY_OPTIONS = ['AC', 'WiFi', 'Proyektor', 'Whiteboard', 'Komputer', 'Sound System', 'TV', 'Microphone'];

export default function AdminRoomsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Room | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: { status: 'available', facility: [] },
  });

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreate = () => {
    setEditingRoom(null);
    setSelectedFacilities([]);
    reset({ status: 'available', facility: [] });
    resetImageState();
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setSelectedFacilities(room.facility);
    reset({
      name: room.name,
      building: room.building,
      capacity: room.capacity,
      facility: room.facility,
      status: room.status,
      image: room.image ?? '',
    });
    // Show existing image in preview
    setImageFile(null);
    setImagePreview(room.image ?? '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const handleFileSelected = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  const toggleFacility = (f: string) => {
    const next = selectedFacilities.includes(f)
      ? selectedFacilities.filter((x) => x !== f)
      : [...selectedFacilities, f];
    setSelectedFacilities(next);
    setValue('facility', next);
  };

  const onSubmit = async (formData: RoomFormData) => {
    let imageUrl = formData.image ?? '';

    // If a new file was selected, upload it first
    if (imageFile) {
      setUploadingImage(true);
      try {
        imageUrl = await roomService.uploadRoomImage(imageFile);
      } catch {
        alert('Gagal mengunggah gambar. Coba lagi.');
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    const payload = { ...formData, image: imageUrl || undefined };

    if (editingRoom) {
      updateRoom.mutate(
        { id: editingRoom.id, data: payload },
        { onSuccess: () => { setModalOpen(false); resetImageState(); } }
      );
    } else {
      createRoom.mutate(payload as Omit<Room, 'id' | 'created_at'>, {
        onSuccess: () => { setModalOpen(false); resetImageState(); },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteRoom.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const isSubmitting = uploadingImage || createRoom.isPending || updateRoom.isPending;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Kelola Ruangan</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            Tambah Ruangan
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Ruangan</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Gedung</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Kapasitas</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {room.image ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <ImageIcon size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{room.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{room.building}</td>
                    <td className="px-4 py-3 text-gray-600">{room.capacity} orang</td>
                    <td className="px-4 py-3">
                      <RoomStatusBadge status={room.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(room)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(room)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">
                {editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
              <button onClick={() => { setModalOpen(false); resetImageState(); }} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Ruangan</label>
                <input {...register('name')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gedung</label>
                  <input {...register('building')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  {errors.building && <p className="text-red-500 text-xs mt-1">{errors.building.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kapasitas</label>
                  <input type="number" {...register('capacity', { valueAsNumber: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select {...register('status')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="available">Tersedia</option>
                  <option value="occupied">Terpakai</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedFacilities.includes(f)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {errors.facility && <p className="text-red-500 text-xs mt-1">{errors.facility.message}</p>}
              </div>

              {/* ─── Image Upload ─────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Foto Ruangan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>

                {/* Preview */}
                {imagePreview && (
                  <div className="relative mb-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { resetImageState(); setValue('image', ''); }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                      title="Hapus gambar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Drop zone */}
                {!imagePreview && (
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      isDragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Klik atau seret file ke sini</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP maks. 5 MB</p>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={onFileChange}
                  className="hidden"
                />

                {/* Change image button when preview exists */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 text-xs text-blue-600 hover:underline"
                  >
                    Ganti gambar
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetImageState(); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {uploadingImage ? 'Mengunggah gambar...' : editingRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Hapus Ruangan?</h3>
            <p className="text-gray-500 text-sm mb-5">
              <strong>{deleteConfirm.name}</strong> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteRoom.isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                {deleteRoom.isPending && <Loader2 size={14} className="animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
