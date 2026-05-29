'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from '@/components/room/RoomCard';
import { RoomFilter } from '@/types';

const BUILDINGS = ['Gedung A', 'Gedung B', 'Gedung C', 'Gedung D', 'Aula Utama'];
const CAPACITIES = [
  { label: 'Semua', value: undefined },
  { label: '< 30 orang', value: 30 },
  { label: '< 50 orang', value: 50 },
  { label: '< 100 orang', value: 100 },
];

export default function RoomsPage() {
  const [filters, setFilters] = useState<RoomFilter>({});
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useRooms({
    ...filters,
    search: search || undefined,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Daftar Ruangan</h1>
        <span className="text-gray-500 text-sm">
          {data?.total ?? 0} ruangan tersedia
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ruangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.building || ''}
            onChange={(e) => setFilters((f) => ({ ...f, building: e.target.value || undefined }))}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Gedung</option>
            {BUILDINGS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value as RoomFilter['status']) || undefined,
              }))
            }
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="occupied">Terpakai</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {(filters.building || filters.status || search) && (
            <button
              onClick={() => { setFilters({}); setSearch(''); }}
              className="text-sm text-gray-500 hover:text-red-600 px-3 py-2.5 border border-gray-200 rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Room grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-red-500 mb-2">Gagal memuat data ruangan.</p>
          <p className="text-sm">Pastikan koneksi API aktif.</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <SlidersHorizontal size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Tidak ada ruangan yang sesuai filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.data.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
