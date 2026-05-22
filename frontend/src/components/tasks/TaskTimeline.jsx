import { motion } from 'framer-motion';
import { Clock, Edit, Plus, CheckCircle } from 'lucide-react';
import { formatRelativeTime } from '../../utils/format';
import Avatar from '../../shared/Avatar';

const actionIcons = {
  created: Plus,
  updated: Edit,
  completed: CheckCircle,
};

export default function TaskTimeline({ history = [], loading }) {
  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>;
  }

  if (!history.length) {
    return <p className="text-sm text-gray-500 text-center py-6">No activity yet</p>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-6">
      {history.map((entry, i) => {
        const Icon = actionIcons[entry.action] || Clock;
        return (
          <motion.div
            key={entry._id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative"
          >
            <div className="absolute -left-[29px] p-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500">
              <Icon className="h-3 w-3 text-brand-600" />
            </div>
            <div className="flex items-start gap-2">
              {entry.user && <Avatar user={entry.user} size="sm" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {entry.message || `${entry.action}${entry.field ? `: ${entry.field}` : ''}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(entry.createdAt)}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
