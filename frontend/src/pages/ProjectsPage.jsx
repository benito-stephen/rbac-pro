import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { projectSchema } from '../forms/authSchemas';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/Skeleton';
import { getApiErrorMessage } from '../utils/apiError';

export default function ProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { color: '#6366f1' },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => projectService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project created');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to create project')),
  });

  const projects = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage your workspaces and teams"
        action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>New Project</Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks"
          action={() => setModalOpen(true)}
          actionLabel="Create Project"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`}>
              <Card hover className="h-full">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{project.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description || 'No description'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{project.stats?.totalTasks || 0} tasks</span>
                  <span className="capitalize">{project.status}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Key (e.g. RBAC)" error={errors.key?.message} {...register('key')} />
          <Input label="Description" {...register('description')} />
          <Input label="Color" type="color" {...register('color')} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
