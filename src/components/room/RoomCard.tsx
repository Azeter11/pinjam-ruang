import Link from 'next/link';
import { Users, MapPin, Wifi, Monitor, Wind, BookOpen } from 'lucide-react';
import { Room } from '@/types';
import { RoomStatusBadge } from './RoomStatusBadge';

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi size={12} />,
  'Proyektor': <Monitor size={12} />,
  'AC': <Wind size={12} />,
  'Whiteboard': <BookOpen size={12} />,
};

interface RoomCardProps {
  room: Room;
  showBookButton?: boolean;
}

export function RoomCard({ room, showBookButton = true }: RoomCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {room.image ? (
          <img
            src={room.image}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-200">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 20V8l8-5 8 5v12H4zm2-2h12V9.5l-6-3.75L6 9.5V18zm5-4h2v-2h-2v2zm0-4h2V8h-2v2z" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <RoomStatusBadge status={room.status} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{room.name}</h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={13} />
          <span className="truncate">{room.building}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
          <Users size={13} />
          <span>{room.capacity} orang</span>
        </div>

        {room.facility.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {room.facility.slice(0, 4).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {facilityIcons[f] || null}
                {f}
              </span>
            ))}
            {room.facility.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{room.facility.length - 4}
              </span>
            )}
          </div>
        )}

        {showBookButton && (
          <Link
            href={`/rooms/${room.id}`}
            className={`block w-full text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              room.status === 'available'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            {room.status === 'available' ? 'Lihat & Pinjam' : 'Tidak Tersedia'}
          </Link>
        )}
      </div>
    </div>
  );
}
