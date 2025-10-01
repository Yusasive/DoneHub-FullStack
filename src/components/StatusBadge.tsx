import { UserStatus, OrgStatus, InviteStatus } from '../types';

interface StatusBadgeProps {
  status: UserStatus | OrgStatus | InviteStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    accepted: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status]
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
