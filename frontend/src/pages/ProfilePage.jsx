import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/store/authStore';
import { authService } from '../services/authService';
import PageHeader from '../shared/PageHeader';
import Card, { CardHeader } from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name,
      avatar: user?.avatar,
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account and security" />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 text-center">
          <Avatar user={user} size="lg" className="mx-auto h-24 w-24 text-2xl" />
          <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <Badge variant={user?.role === 'admin' ? 'brand' : 'default'} className="mt-3 capitalize">
            {user?.role}
          </Badge>
          <Badge variant={user?.status === 'active' ? 'success' : 'danger'} className="mt-2 ml-1">
            {user?.status}
          </Badge>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Account Information" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name" {...register('name')} />
            <Input label="Avatar URL" {...register('avatar')} />
            <Button type="submit" loading={isSubmitting}>Save Changes</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
