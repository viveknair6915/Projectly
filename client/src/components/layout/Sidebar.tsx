import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../api';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  onOpenCreateProject?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  onOpenCreateProject,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', 'sidebar'],
    queryFn: () => projectsApi.getAll(),
    staleTime: 60000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'All Projects', icon: FolderKanban },
  ];

  return (
    <>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0c1220] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-wider text-white">Projectly</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Your Team’s Work, Organized.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Workspace
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-300 border border-brand-500/25 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Projects ({projects.length})
              </p>
              {onOpenCreateProject && (
                <button
                  onClick={onOpenCreateProject}
                  className="p-1 text-slate-400 hover:text-brand-300 hover:bg-slate-800 rounded transition-colors"
                  title="Create Project"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {projects.slice(0, 8).map((project) => (
                <NavLink
                  key={project._id}
                  to={`/projects/${project._id}`}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-brand-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-brand-500/60 group-hover:bg-brand-400 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                    {project.key}
                  </span>
                </NavLink>
              ))}

              {projects.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400 italic">No projects yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800/80 bg-[#090e1a]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.title || user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
