import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useTasks } from '../hooks/useTasks';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import EmptyState from '../shared/EmptyState';
import { TableSkeleton } from '../shared/Skeleton';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer';
import { TASK_STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { formatDate } from '../utils/format';

const defaultFilters = { page: 1, limit: 15, sortBy: 'updatedAt', order: 'desc' };

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [filters, setFilters] = useState(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setEditingTask(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const taskFromNav = location.state?.editTask;
    if (taskFromNav) {
      setEditingTask(taskFromNav);
      setModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const queryParams = { ...filters, search: debouncedSearch || undefined };
  const {
    tasks,
    meta,
    stats,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
  } = useTasks(queryParams, { poll: true });

  const handleSave = async (data) => {
    if (editingTask) {
      await updateTask({ id: editingTask._id, data });
    } else {
      await createTask(data);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const columns = [
    { key: 'title', label: 'Task', render: (row) => (
      <span className="font-medium text-gray-900 dark:text-white">{row.title}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => (
      <Badge className={STATUS_COLORS[row.status]}>{TASK_STATUS_LABELS[row.status]}</Badge>
    )},
    { key: 'priority', label: 'Priority', render: (row) => (
      <Badge className={PRIORITY_COLORS[row.priority]}>{row.priority}</Badge>
    )},
    { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
    { key: 'tags', label: 'Tags', render: (row) => (
      <div className="flex gap-1 flex-wrap">
        {(row.tags || []).slice(0, 2).map((t) => (
          <span key={t} className="text-xs text-gray-500">#{t}</span>
        ))}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Task Intelligence"
        subtitle="Create, track, and manage your work"
        action={<Button icon={Plus} onClick={() => { setEditingTask(null); setModalOpen(true); }}>New Task</Button>}
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon={CheckSquare} color="brand" index={0} />
          <StatCard title="Completed" value={stats.completed} icon={CheckSquare} color="green" index={1} />
          <StatCard title="Pending" value={stats.pending} icon={CheckSquare} color="orange" index={2} />
          <StatCard title="Completion" value={`${stats.completionRate}%`} icon={CheckSquare} color="purple" index={3} />
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <TaskFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </div>

        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={8} /></div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="Create a task or adjust your filters"
            action={() => setModalOpen(true)}
            actionLabel="Create Task"
          />
        ) : (
          <DataTable columns={columns} data={tasks} onRowClick={setSelectedTask} />
        )}

        {meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
            <span className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} tasks)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={meta.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSubmit={handleSave}
        task={editingTask}
        loading={isCreating || isUpdating}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(t) => { setEditingTask(t); setModalOpen(true); setSelectedTask(null); }}
        onDelete={(id) => { deleteTask(id); setSelectedTask(null); }}
        canDelete
      />
    </div>
  );
}
