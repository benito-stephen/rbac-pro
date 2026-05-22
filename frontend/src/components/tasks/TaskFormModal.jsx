import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../shared/Modal';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants';

const defaultValues = {
  title: '',
  description: '',
  status: TASK_STATUS.TODO,
  priority: TASK_PRIORITY.MEDIUM,
  dueDate: '',
  tags: '',
};

export default function TaskFormModal({ isOpen, onClose, onSubmit, task, loading, defaultProjectId }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: (task.tags || []).join(', '),
      });
    } else {
      reset(defaultValues);
    }
  }, [task, reset, isOpen]);

  const submit = (data) => {
    onSubmit({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      projectId: task?.project?._id || task?.project || defaultProjectId || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'} size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Required' })} />
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select {...register('status')} className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm">
              {Object.values(TASK_STATUS).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Priority</label>
            <select {...register('priority')} className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm">
              {Object.values(TASK_PRIORITY).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <Input label="Due date" type="date" {...register('dueDate')} />
        <Input label="Tags (comma separated)" placeholder="design, urgent" {...register('tags')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{task ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
