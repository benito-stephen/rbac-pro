import { motion } from 'framer-motion';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden auth-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur border border-white/20">
              <Shield className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">RBAC PRO</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-6">
              <Lock className="h-4 w-4" />
              Military-grade security
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Enterprise Authentication & Authorization
            </h1>
            <p className="text-white/70 mt-6 text-lg max-w-md leading-relaxed">
              JWT sessions, refresh token rotation, RBAC, and zero-trust API protection.
            </p>
          </motion.div>

          <p className="text-white/40 text-sm">© 2026 RBAC PRO · SOC2-ready architecture</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <Shield className="h-8 w-8 text-brand-400" />
              <span className="text-xl font-bold text-white">RBAC PRO</span>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
