'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Loader2, X, LayoutGrid } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from '@/components/room/RoomCard';
import { RoomFilter } from '@/types';

const BUILDINGS = ['Gedung A', 'Gedung B', 'Gedung C', 'Gedung D', 'Aula Utama'];

export default function RoomsPage() {
  const [filters, setFilters] = useState<RoomFilter>({});
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useRooms({
    ...filters,
    search: search || undefined,
  });

  const hasFilters = filters.building || filters.status || search;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daftar Ruangan</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Temukan dan pinjam ruangan yang sesuai kebutuhan Anda
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl animate-fade-in-up delay-100"
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <LayoutGrid size={14} className="text-blue-600" />
          <span className="text-blue-700 text-sm font-bold">
            {data?.total ?? 0}
          </span>
          <span className="text-blue-600 text-xs font-medium">ruangan</span>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl p-4 animate-fade-in-up delay-100"
        style={{
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama ruangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Building filter */}
          <select
            value={filters.building || ''}
            onChange={(e) => setFilters((f) => ({ ...f, building: e.target.value || undefined }))}
            className="py-2.5 px-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <option value="">Semua Gedung</option>
            {BUILDINGS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value as RoomFilter['status']) || undefined,
              }))
            }
            className="py-2.5 px-3.5 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <option value="">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="occupied">Terpakai</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={() => { setFilters({}); setSearch(''); }}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              style={{ border: '1px solid #fecaca' }}
            >
              <X size={13} /> Reset
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <SlidersHorizontal size={11} /> Filter aktif:
            </span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                "{search}"
                <button onClick={() => setSearch('')}><X size={10} /></button>
              </span>
            )}
            {filters.building && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: '#f0fdf4', color: '#15803d' }}>
                {filters.building}
                <button onClick={() => setFilters(f => ({ ...f, building: undefined }))}><X size={10} /></button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: '#fefce8', color: '#854d0e' }}>
                {filters.status === 'available' ? 'Tersedia' : filters.status === 'occupied' ? 'Terpakai' : 'Maintenance'}
                <button onClick={() => setFilters(f => ({ ...f, status: undefined }))}><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Room Grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-3 bg-white" style={{ border: '1px solid #f1f5f9', borderTop: 0 }}>
                <div className="h-4 skeleton w-3/4" />
                <div className="h-3 skeleton w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 skeleton w-12 rounded-full" />
                  <div className="h-6 skeleton w-12 rounded-full" />
                </div>
                <div className="h-9 skeleton rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <SlidersHorizontal size={28} className="text-red-400" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Gagal memuat ruangan</p>
          <p className="text-sm text-gray-500">Pastikan koneksi API aktif dan coba lagi.</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <SlidersHorizontal size={28} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Tidak ada ruangan ditemukan</p>
          <p className="text-sm text-gray-500">Coba ubah atau reset filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {data?.data.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
