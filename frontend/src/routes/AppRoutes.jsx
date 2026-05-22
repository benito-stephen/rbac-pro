import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, AdminRoute } from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import { DashboardSkeleton } from '../shared/Skeleton';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const AdminDashboardPage = lazy(() => import('../admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../admin/AdminUsersPage'));
const AdminTasksPage = lazy(() => import('../admin/AdminTasksPage'));
const AdminAnalyticsPage = lazy(() => import('../admin/AdminAnalyticsPage'));
const AdminActivityPage = lazy(() => import('../admin/AdminActivityPage'));

const PageLoader = () => (
  <div className="p-8">
    <DashboardSkeleton />
  </div>
);

const Lazy = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Lazy><LandingPage /></Lazy>} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><Lazy><LoginPage /></Lazy></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Lazy><RegisterPage /></Lazy></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><Lazy><ForgotPasswordPage /></Lazy></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><Lazy><ResetPasswordPage /></Lazy></PublicRoute>} />
      </Route>

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Lazy><DashboardPage /></Lazy>} />
        <Route path="/projects" element={<Lazy><ProjectsPage /></Lazy>} />
        <Route path="/projects/:id" element={<Lazy><ProjectDetailPage /></Lazy>} />
        <Route path="/tasks" element={<Lazy><TasksPage /></Lazy>} />
        <Route path="/profile" element={<Lazy><ProfilePage /></Lazy>} />
        <Route path="/admin" element={<AdminRoute><Lazy><AdminDashboardPage /></Lazy></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Lazy><AdminUsersPage /></Lazy></AdminRoute>} />
        <Route path="/admin/tasks" element={<AdminRoute><Lazy><AdminTasksPage /></Lazy></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Lazy><AdminAnalyticsPage /></Lazy></AdminRoute>} />
        <Route path="/admin/activity" element={<AdminRoute><Lazy><AdminActivityPage /></Lazy></AdminRoute>} />
        <Route path="/unauthorized" element={<Lazy><UnauthorizedPage /></Lazy>} />
      </Route>

      <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
    </Routes>
  );
}
