import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime } from '../utils/format';
import Button from '../shared/Button';
import { cn } from '../utils/format';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll({ limit: 15 }).then((r) => r.data),
    refetchInterval: open ? 15000 : 60000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 relative transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[420px] overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={CheckCheck}
                  onClick={() => markAllMutation.mutate()}
                  loading={markAllMutation.isPending}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[340px]">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => {
                      if (!n.isRead) markReadMutation.mutate(n._id);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition',
                      !n.isRead && 'bg-brand-50/50 dark:bg-brand-950/30'
                    )}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
