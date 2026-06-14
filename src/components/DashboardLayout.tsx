import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LayoutDashboard, LogOut, Search, User as UserIcon, FileText, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  requiredRole?: 'seeker' | 'employer';
}

export function DashboardLayout({ requiredRole }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const seekerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/seeker/dashboard' },
    { icon: Search, label: 'Find Jobs', path: '/seeker/jobs' },
    { icon: Heart, label: 'Saved Jobs', path: '/seeker/saved' },
    { icon: FileText, label: 'My Applications', path: '/seeker/applications' },
    { icon: UserIcon, label: 'Profile', path: '/seeker/profile' },
  ];

  const employerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employer/dashboard' },
    { icon: Briefcase, label: 'Manage Jobs', path: '/employer/jobs' },
    { icon: FileText, label: 'Applications', path: '/employer/applications' },
  ];

  const links = user.role === 'seeker' ? seekerLinks : employerLinks;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 glass-dark border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-10 m-0">
        <div className="h-16 flex items-center px-6 mt-4">
          <div className="flex items-center gap-3 text-slate-100 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 match-gradient rounded-lg flex items-center justify-center font-bold shadow-lg">W</div>
            WorkSphere
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-600/20 text-indigo-400" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-500")} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-sm font-medium overflow-hidden shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold truncate">{user.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-w-0 flex flex-col bg-[#020617] text-slate-50">
        <div className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
