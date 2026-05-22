import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { useAuthStore } from '../context/store/authStore';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import { TableSkeleton } from '../shared/Skeleton';
import { ROLES, USER_STATUS } from '../constants';
import { getApiErrorMessage } from '../utils/apiError';

const emptyForm = { name: '', email: '', password: '', role: ROLES.USER };

export default function AdminUsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User created');
      setModalOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed to create user')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => userService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed')),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => userService.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Role updated');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed')),
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deactivated');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Failed')),
  });

  const users = data?.data || [];

  const openModal = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleDelete = (u) => {
    const id = u.id || u._id;
    if (id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (window.confirm(`Deactivate ${u.name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="View, manage, and suspend accounts"
        action={<Button icon={Plus} onClick={openModal}>Add User</Button>}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {users.map((u) => {
                  const id = u.id || u._id;
                  const isSelf = id === currentUser?.id;
                  return (
                    <tr key={id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} size="sm" />
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          disabled={isSelf || roleMutation.isPending}
                          onChange={(e) => roleMutation.mutate({ id, role: e.target.value })}
                          className="text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 capitalize"
                        >
                          <option value={ROLES.USER}>User</option>
                          <option value={ROLES.ADMIN}>Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.status === 'active' ? 'success' : 'danger'} className="capitalize">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={u.status === 'active' ? 'danger' : 'secondary'}
                            disabled={isSelf}
                            onClick={() =>
                              statusMutation.mutate({
                                id,
                                status: u.status === 'active' ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE,
                              })
                            }
                            loading={statusMutation.isPending}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Trash2}
                            disabled={isSelf}
                            onClick={() => handleDelete(u)}
                            loading={deleteMutation.isPending}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
