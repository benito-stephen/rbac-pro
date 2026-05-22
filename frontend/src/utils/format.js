export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const getInitials = (nameOrFirst, lastName) => {
  if (lastName) {
    return `${nameOrFirst?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }
  const parts = (nameOrFirst || '').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
