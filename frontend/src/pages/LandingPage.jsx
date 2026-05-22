import { Shield, ArrowRight, CheckCircle, BarChart3, Lock, Zap } from 'lucide-react';
import Button from '../shared/Button';

const features = [
  { icon: Lock, title: 'Enterprise RBAC', desc: 'Admin and user roles with secure access control' },
  { icon: CheckCircle, title: 'Task Intelligence', desc: 'Kanban boards, priorities, and real-time updates' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Data-driven insights with audit trails' },
  { icon: Zap, title: 'Modern Stack', desc: 'React, Node.js, MongoDB — production-ready architecture' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-brand-600" />
          <span className="text-xl font-bold gradient-text">RBAC PRO</span>
        </div>
        <div className="flex items-center gap-4">
          <Button to="/login" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button to="/register" size="sm">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-32 text-center">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-medium mb-6">
            Next-Gen Enterprise Platform
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight max-w-4xl mx-auto">
            Role-Based Access Control{' '}
            <span className="gradient-text">Reimagined</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enterprise SaaS platform combining task management with secure roles, analytics, and admin control.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/register" size="lg">
              Start Free <ArrowRight className="h-5 w-5" />
            </Button>
            <Button to="/login" size="lg" variant="outline">
              Sign In / Demo
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-glow transition-shadow"
            >
              <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900/30 w-fit mb-4">
                <f.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
