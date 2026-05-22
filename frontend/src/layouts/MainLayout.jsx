import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Users,
  FileText,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../context/store/authStore';
import { useThemeStore } from '../context/store/themeStore';
import { usePermissions } from '../hooks/usePermissions';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import NotificationDropdown from '../components/NotificationDropdown';
import { cn } from '../utils/format';

const iconMap = {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Users,
  FileText,
};

export default function MainLayout() {
  useSessionTimeout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filterByRole = (items) =>
    items.filter((item) => !item.roles || item.roles.includes(user?.role));

  const navItems = filterByRole(NAV_ITEMS);
  const adminItems = isAdmin() ? filterByRole(ADMIN_NAV_ITEMS) : [];

  const NavContent = () => (
    <>
      <Link
        to="/dashboard"
        onClick={() => setSidebarOpen(false)}
        className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
      >
        <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg gradient-text">RBAC PRO</span>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role} portal</p>
        </div>
      </Link>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Workspace</p>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn('nav-link', isActive ? 'nav-link-active' : 'nav-link-inactive')
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}

        {adminItems.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-6 mb-2">Administration</p>
            {adminItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn('nav-link', isActive ? 'nav-link-active' : 'nav-link-inactive')
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
      <aside className="hidden lg:flex lg:w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <NavContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 lg:hidden"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <NotificationDropdown />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <Avatar user={user} size="sm" />
                <div className="hidden sm:block text-left">
                  <span className="text-sm font-medium block">{user?.name}</span>
                  <Badge variant={user?.role === 'admin' ? 'brand' : 'default'} className="text-[10px] py-0">
                    {user?.role}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 py-1 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <button
                      onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Settings className="h-4 w-4" /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
