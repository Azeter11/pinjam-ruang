import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Booking } from '@/types';

interface BookingStatusBadgeProps {
  status: Booking['status'];
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {getStatusLabel(status)}
    </span>
  );
}
