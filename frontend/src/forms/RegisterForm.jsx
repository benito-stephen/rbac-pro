import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { registerSchema } from './authSchemas';
import { useAuthStore } from '../context/store/authStore';
import { getApiErrorMessage } from '../utils/apiError';
import api from '../services/api';

export default function RegisterForm() {
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed'));
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join RBAC PRO enterprise</p>
        </div>

        <Input label="Full name" icon={User} error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" icon={Mail} error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" icon={Lock} error={errors.password?.message} {...register('password')} />
        <p className="text-xs text-gray-500 -mt-3">At least 8 characters with uppercase, lowercase, and a number</p>
        <Input label="Confirm password" type="password" icon={Lock} error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
