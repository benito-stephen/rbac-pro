import { cn, getInitials } from '../utils/format';

export default function Avatar({ user, size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const displayName = user?.name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={displayName}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-brand-500 to-purple-600',
        'flex items-center justify-center font-semibold text-white',
        sizes[size],
        className
      )}
    >
      {getInitials(user?.name || user?.firstName, user?.lastName)}
    </div>
  );
}
