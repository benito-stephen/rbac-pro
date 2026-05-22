import { Link } from 'react-router-dom';
import Card, { CardHeader } from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import { STATUS_COLORS, TASK_STATUS_LABELS } from '../constants';
import { cn } from '../utils/format';

export default function RecentTasksList({ tasks = [] }) {
  return (
    <Card>
      <CardHeader
        title="Recent Tasks"
        subtitle="Latest activity"
        action={
          <Button to="/tasks" size="sm" variant="ghost">
            View all
          </Button>
        }
      />
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">No recent tasks</p>
            <Button to="/tasks?create=1" size="sm">
              Create a task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <Link
              key={task._id}
              to={task.project?._id ? `/projects/${task.project._id}` : '/tasks'}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.project?.color || '#6366f1' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                <p className="text-xs text-gray-500">{task.project?.name || 'Personal task'}</p>
              </div>
              <Badge className={cn(STATUS_COLORS[task.status])}>
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
              {task.assignee && <Avatar user={task.assignee} size="sm" />}
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
