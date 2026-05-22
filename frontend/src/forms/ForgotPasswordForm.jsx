import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { forgotPasswordSchema } from './authSchemas';
import { authService } from '../services/authService';

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword(email);
      toast.success('If an account exists, a reset link was sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Enter your email and we'll send a secure reset link
          </p>
        </div>

        <Input label="Email" type="email" icon={Mail} error={errors.email?.message} {...register('email')} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-brand-600 hover:underline font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </form>
    </motion.div>
  );
}
