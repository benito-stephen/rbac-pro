import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { loginSchema } from './authSchemas';
import { useAuthStore } from '../context/store/authStore';
import { getApiErrorMessage } from '../utils/apiError';
import api from '../services/api';

export default function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  // Wake Render free-tier instance before the user submits (can take 60s+ when cold)
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed'));
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Secure enterprise access</p>
        </div>

        <Input label="Email" type="email" icon={Mail} error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" icon={Lock} error={errors.password?.message} {...register('password')} />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:underline font-medium">
            Create one
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
