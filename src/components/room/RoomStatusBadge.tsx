import { cn, getRoomStatusColor, getRoomStatusLabel } from '@/lib/utils';
import { Room } from '@/types';

interface RoomStatusBadgeProps {
  status: Room['status'];
  className?: string;
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getRoomStatusColor(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {getRoomStatusLabel(status)}
    </span>
  );
}
