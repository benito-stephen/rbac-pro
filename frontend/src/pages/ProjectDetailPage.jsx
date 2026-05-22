import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useTasks } from '../hooks/useTasks';
import PageHeader from '../shared/PageHeader';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import { DashboardSkeleton } from '../shared/Skeleton';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer';
import { TASK_STATUS, TASK_STATUS_LABELS, STATUS_COLORS } from '../constants';
import { cn } from '../utils/format';
import { getApiErrorMessage } from '../utils/apiError';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id).then((r) => r.data.data.project),
  });

  const { data: board, isLoading: boardLoading, refetch } = useQuery({
    queryKey: ['board', id],
    queryFn: () => taskService.getBoard(id).then((r) => r.data.data.board),
    enabled: !!id,
  });

  const { createTask, updateTask, deleteTask, isCreating, isUpdating } = useTasks({}, { enabled: false });

  const handleSaveTask = async (data) => {
    try {
      if (editingTask) {
        await updateTask({ id: editingTask._id, data });
      } else {
        await createTask({ ...data, projectId: id });
      }
      setModalOpen(false);
      setEditingTask(null);
      refetch();
      queryClient.invalidateQueries(['tasks']);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save task'));
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask({ id: task._id, data: { status: newStatus } });
      refetch();
      if (selectedTask?._id === task._id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      toast.success('Status updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update status'));
    }
  };

  const handleDelete = (taskId) => {
    deleteTask(taskId, {
      onSuccess: () => {
        refetch();
        setSelectedTask(null);
      },
    });
  };

  if (projectLoading || boardLoading) return <DashboardSkeleton />;

  const boardData = board || {};

  return (
    <div>
      <PageHeader
        title={project?.name}
        subtitle={`${project?.key} · ${project?.description || 'Project board'}`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/projects')}>
              Back
            </Button>
            <Button icon={Plus} onClick={() => { setEditingTask(null); setModalOpen(true); }}>
              Add Task
            </Button>
          </div>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {Object.entries(TASK_STATUS).map(([, status]) => {
          const tasks = boardData[status] || [];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-shrink-0 w-72"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  {TASK_STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px] p-2 rounded-xl bg-gray-100/50 dark:bg-slate-800/50">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-brand-400 transition"
                    onClick={() => setSelectedTask({ ...task, project })}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</p>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <Badge className={cn(STATUS_COLORS[task.priority], 'text-xs')}>{task.priority}</Badge>
                      {task.assignee && <Avatar user={task.assignee} size="sm" />}
                    </div>
                    <div className="mt-2 relative" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className="w-full text-xs rounded-md border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 py-1.5 pl-2 pr-7 appearance-none"
                      >
                        {Object.values(TASK_STATUS).map((s) => (
                          <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setModalOpen(true);
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-brand-600 hover:bg-white/50 dark:hover:bg-slate-900/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-600 transition"
                >
                  + Add task
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSubmit={handleSaveTask}
        task={editingTask}
        defaultProjectId={id}
        loading={isCreating || isUpdating}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(t) => { setEditingTask(t); setModalOpen(true); setSelectedTask(null); }}
        onDelete={handleDelete}
        canDelete
      />
    </div>
  );
}
