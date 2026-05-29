'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, Upload, ImageIcon, Search, Building2 } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredRooms = (data?.data ?? []).filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    reset({ name: room.name, building: room.building, capacity: room.capacity, facility: room.facility, status: room.status, image: room.image ?? '' });
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

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
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
      updateRoom.mutate({ id: editingRoom.id, data: payload }, { onSuccess: () => { setModalOpen(false); resetImageState(); } });
    } else {
      createRoom.mutate(payload as Omit<Room, 'id' | 'created_at'>, { onSuccess: () => { setModalOpen(false); resetImageState(); } });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteRoom.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const isSubmitting = uploadingImage || createRoom.isPending || updateRoom.isPending;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kelola Ruangan</h1>
            <p className="text-gray-500 text-sm mt-0.5">Tambah, edit, atau hapus ruangan kampus</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
            }}
          >
            <Plus size={15} />
            Tambah Ruangan
          </button>
        </div>

        {/* ── Stats Bar ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-75">
          {[
            { label: 'Total Ruangan', value: data?.total ?? 0, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Tersedia',      value: data?.data.filter(r => r.status === 'available').length ?? 0,    color: '#10b981', bg: '#ecfdf5' },
            { label: 'Tidak Aktif',   value: data?.data.filter(r => r.status !== 'available').length ?? 0,    color: '#f59e0b', bg: '#fffbeb' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 text-center"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search & Table ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden animate-fade-in-up delay-100"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>

          {/* Table toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4"
            style={{ borderBottom: '1px solid #f8fafc' }}>
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari ruangan atau gedung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              />
            </div>
            <span className="text-sm text-gray-400">{filteredRooms.length} ruangan</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: '#eff6ff' }}>
                <Loader2 size={20} className="animate-spin text-blue-500" />
              </div>
              <p className="text-sm text-gray-400">Memuat data ruangan...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 animate-float">
                <Building2 size={28} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500">Tidak ada ruangan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruangan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gedung</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kapasitas</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fasilitas</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room, idx) => (
                    <tr
                      key={room.id}
                      className="animate-fade-in-up group"
                      style={{
                        borderBottom: '1px solid #f8fafc',
                        animationDelay: `${idx * 40}ms`,
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {room.image ? (
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm ring-2 ring-white">
                              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)' }}>
                              <ImageIcon size={16} className="text-blue-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{room.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">ID: {room.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-700 font-medium">{room.building}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#f1f5f9', color: '#475569' }}>
                          {room.capacity} orang
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {room.facility.slice(0, 3).map(f => (
                            <span key={f} className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                              style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                              {f}
                            </span>
                          ))}
                          {room.facility.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                              style={{ background: '#f1f5f9', color: '#64748b' }}>
                              +{room.facility.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RoomStatusBadge status={room.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(room)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.04]"
                            style={{ background: '#eff6ff', color: '#2563eb' }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(room)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.04]"
                            style={{ background: '#fef2f2', color: '#dc2626' }}
                          >
                            <Trash2 size={12} /> Hapus
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
      </div>

      {/* ══ Create/Edit Modal ══════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 rounded-t-2xl"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 className="font-bold text-gray-900">
                  {editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingRoom ? 'Perbarui informasi ruangan' : 'Isi detail ruangan baru'}
                </p>
              </div>
              <button
                onClick={() => { setModalOpen(false); resetImageState(); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Nama Ruangan
                </label>
                <input
                  {...register('name')}
                  placeholder="cth. Ruang Rapat A"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Gedung + Kapasitas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Gedung</label>
                  <input
                    {...register('building')}
                    placeholder="cth. Gedung A"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  />
                  {errors.building && <p className="text-red-500 text-xs mt-1">{errors.building.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Kapasitas</label>
                  <input
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <option value="available">Tersedia</option>
                  <option value="occupied">Terpakai</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Fasilitas */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Fasilitas</label>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_OPTIONS.map((f) => {
                    const active = selectedFacilities.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFacility(f)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:scale-[1.04]"
                        style={active ? {
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: '#fff',
                          boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
                        } : {
                          background: '#f1f5f9',
                          color: '#64748b',
                        }}
                      >
                        {active && '✓ '}{f}
                      </button>
                    );
                  })}
                </div>
                {errors.facility && <p className="text-red-500 text-xs mt-1">{errors.facility.message}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Foto Ruangan <span className="text-gray-400 normal-case font-normal">(opsional)</span>
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 h-44 mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <button
                      type="button"
                      onClick={() => { resetImageState(); setValue('image', ''); }}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-all hover:scale-110"
                    >
                      <X size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-xl p-8 text-center transition-all duration-200"
                    style={{
                      border: `2px dashed ${isDragging ? '#3b82f6' : '#e2e8f0'}`,
                      background: isDragging ? '#eff6ff' : '#f8fafc',
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: isDragging ? '#dbeafe' : '#f1f5f9' }}>
                      <Upload size={20} className={isDragging ? 'text-blue-500' : 'text-gray-400'} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Klik atau seret file ke sini</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — maks. 5 MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetImageState(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  style={{ border: '1px solid #e2e8f0' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  }}
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {uploadingImage ? 'Mengunggah...' : editingRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Delete Confirm Modal ═══════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center modal-content">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
              <Trash2 size={26} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Hapus Ruangan?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <strong className="text-gray-700">{deleteConfirm.name}</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                style={{ border: '1px solid #e2e8f0' }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteRoom.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
              >
                {deleteRoom.isPending && <Loader2 size={14} className="animate-spin" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
