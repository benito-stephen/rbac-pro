import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { resetPasswordSchema } from './authSchemas';
import { authService } from '../services/authService';

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token) setValue('token', token);
    if (email) setValue('email', email);
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      await authService.resetPassword(payload);
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 rounded-2xl shadow-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Choose a strong new password</p>
        </div>

        <input type="hidden" {...register('token')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} readOnly />
        <Input label="New password" type="password" icon={Lock} error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" icon={Lock} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Reset password
        </Button>

        <Link to="/login" className="block text-center text-sm text-brand-600 hover:underline font-medium">
          Back to sign in
        </Link>
      </form>
    </motion.div>
  );
}
