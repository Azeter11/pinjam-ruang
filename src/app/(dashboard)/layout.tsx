'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/ui/Toast';
import { getStatusLabel } from '@/lib/utils';

function SocketListener() {
  const { success, error, info } = useToast();

  const onBookingUpdate = useCallback(
    (data: { booking_id: string; user_id: string; status: string; room_name: string }) => {
      const label = getStatusLabel(data.status as 'pending' | 'approved' | 'rejected' | 'completed');
      if (data.status === 'approved') {
        success('Peminjaman Disetujui!', `${data.room_name} – ${label}`);
      } else if (data.status === 'rejected') {
        error('Peminjaman Ditolak', `${data.room_name} – ${label}`);
      } else {
        info('Status Peminjaman Diperbarui', `${data.room_name} – ${label}`);
      }
    },
    [success, error, info]
  );

  useSocket(onBookingUpdate);
  return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <SocketListener />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
