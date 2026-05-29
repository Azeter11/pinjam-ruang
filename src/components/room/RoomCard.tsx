import Link from 'next/link';
import { Users, MapPin, Wifi, Monitor, Wind, BookOpen, Zap, Mic, Tv, Volume2, ArrowRight } from 'lucide-react';
import { Room } from '@/types';
import { RoomStatusBadge } from './RoomStatusBadge';

const facilityIcons: Record<string, React.ReactNode> = {
  'WiFi':         <Wifi size={11} />,
  'Proyektor':    <Monitor size={11} />,
  'AC':           <Wind size={11} />,
  'Whiteboard':   <BookOpen size={11} />,
  'Komputer':     <Zap size={11} />,
  'Microphone':   <Mic size={11} />,
  'TV':           <Tv size={11} />,
  'Sound System': <Volume2 size={11} />,
};

interface RoomCardProps {
  room: Room;
  showBookButton?: boolean;
}

export function RoomCard({ room, showBookButton = true }: RoomCardProps) {
  const isAvailable = room.status === 'available';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden card-hover animate-fade-in-up group"
      style={{
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
      }}
    >
      {/* Room Image */}
      <div className="relative h-48 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)' }}>
        {room.image ? (
          <img
            src={room.image}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-float">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
                style={{ color: '#bfdbfe' }}>
                <path d="M4 20V8l8-5 8 5v12H4z" fill="currentColor" fillOpacity="0.4" />
                <path d="M4 20V8l8-5 8 5v12H4z" stroke="#93c5fd" strokeWidth="1.5" fill="none" />
                <rect x="9" y="12" width="3" height="3" rx="0.5" fill="#93c5fd" />
                <rect x="12" y="12" width="3" height="3" rx="0.5" fill="#93c5fd" />
                <rect x="9" y="8" width="6" height="3" rx="0.5" fill="#93c5fd" />
              </svg>
            </div>
          </div>
        )}

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.3), transparent)' }} />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <RoomStatusBadge status={room.status} />
        </div>

        {/* Capacity chip */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
          }}>
          <Users size={11} />
          {room.capacity} orang
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1.5 truncate leading-tight">
          {room.name}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          <span className="truncate">{room.building}</span>
        </div>

        {/* Facilities */}
        {room.facility.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.facility.slice(0, 4).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium"
                style={{ background: '#eff6ff', color: '#1d4ed8' }}
              >
                {facilityIcons[f] || null}
                {f}
              </span>
            ))}
            {room.facility.length > 4 && (
              <span className="px-2 py-1 rounded-lg text-[11px] font-medium"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                +{room.facility.length - 4} lagi
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        {showBookButton && (
          <Link
            href={`/rooms/${room.id}`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isAvailable ? 'hover:gap-3' : ''
            }`}
            style={isAvailable ? {
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
            } : {
              background: '#f1f5f9',
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          >
            {isAvailable ? (
              <>Lihat & Pinjam <ArrowRight size={13} /></>
            ) : (
              'Tidak Tersedia'
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
