import React from 'react';
import { Menu, Plus, Search, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenCreateProject: () => void;
  title?: string;
  subtitle?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenCreateProject,
  title,
  subtitle,
  onSearchChange,
  searchValue = '',
  searchPlaceholder = 'Search projects, tasks...',
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && (
            <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {onSearchChange && (
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={onOpenCreateProject}
        >
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </Button>

        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
          <span className="text-xs font-medium text-slate-300 hidden xl:block">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
