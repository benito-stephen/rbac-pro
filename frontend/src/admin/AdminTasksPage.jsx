import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { useDebounce } from '../hooks/useDebounce';
import { useTasks } from '../hooks/useTasks';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import DataTable from '../shared/DataTable';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer';
import { TableSkeleton } from '../shared/Skeleton';
import { TASK_STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { formatDate } from '../utils/format';

const defaultFilters = { page: 1, limit: 20, sortBy: 'updatedAt', order: 'desc' };

export default function AdminTasksPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 400);
  const queryClient = useQueryClient();
  const { deleteTask, updateTask, isUpdating } = useTasks({}, { enabled: false });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tasks', filters, debouncedSearch],
    queryFn: () =>
      adminService.getAllTasks({ ...filters, search: debouncedSearch || undefined }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const tasks = data?.data || [];
  const meta = data?.meta;

  const handleDelete = (id) => {
    if (!window.confirm('Delete this task permanently?')) return;
    deleteTask(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
        setSelectedTask(null);
      },
    });
  };

  const handleSave = async (data) => {
    if (!editingTask) return;
    await updateTask({ id: editingTask._id, data });
    setModalOpen(false);
    setEditingTask(null);
    queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
  };

  const columns = [
    { key: 'title', label: 'Task', render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'owner', label: 'Owner', render: (r) => r.createdBy?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => (
      <Badge className={STATUS_COLORS[r.status]}>{TASK_STATUS_LABELS[r.status]}</Badge>
    )},
    { key: 'priority', label: 'Priority', render: (r) => (
      <Badge className={PRIORITY_COLORS[r.priority]}>{r.priority}</Badge>
    )},
    { key: 'due', label: 'Due', render: (r) => formatDate(r.dueDate) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button
          size="sm"
          variant="danger"
          icon={Trash2}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(r._id);
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Task Monitoring" subtitle="View and manage all tasks across the platform" />

      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <TaskFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
        </div>
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={10} /></div>
        ) : (
          <DataTable columns={columns} data={tasks} onRowClick={setSelectedTask} emptyMessage="No tasks in system" />
        )}
        {meta?.totalPages > 1 && (
          <div className="flex justify-between px-4 py-3 border-t text-sm text-gray-500">
            <span>Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={meta.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                Prev
              </Button>
              <Button size="sm" variant="secondary" disabled={meta.page >= meta.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
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
        loading={isUpdating}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(t) => {
          setSelectedTask(null);
          setEditingTask(t);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        canDelete
      />
    </div>
  );
}
