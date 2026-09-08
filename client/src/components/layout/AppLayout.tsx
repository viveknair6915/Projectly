import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CreateProjectModal } from '../modals/CreateProjectModal';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const navigate = useNavigate();

  const handleProjectCreated = (newProject: any) => {
    setIsCreateProjectOpen(false);
    navigate(`/projects/${newProject._id}`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">

      <Sidebar
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenCreateProject: () => setIsCreateProjectOpen(true) }} />
        </main>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};
