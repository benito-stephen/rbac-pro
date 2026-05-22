import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit } from 'lucide-react';
import Badge from '../../shared/Badge';
import Button from '../../shared/Button';
import { useTaskHistory } from '../../hooks/useTasks';
import TaskTimeline from './TaskTimeline';
import { TASK_STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { formatDate, cn } from '../../utils/format';

export default function TaskDetailDrawer({ task, onClose, onEdit, onDelete, canDelete }) {
  const { data: history, isLoading } = useTaskHistory(task?._id, !!task);

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-200 dark:border-slate-700 overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge className={STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                  <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {task.description && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Due</span>
                  <p className="font-medium">{formatDate(task.dueDate)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Completed</span>
                  <p className="font-medium">{formatDate(task.completedAt)}</p>
                </div>
              </div>
              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-xs">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" icon={Edit} onClick={() => onEdit(task)}>Edit</Button>
                {canDelete && (
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => onDelete(task._id)}>Delete</Button>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4">Activity Timeline</h3>
                <TaskTimeline history={history} loading={isLoading} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
