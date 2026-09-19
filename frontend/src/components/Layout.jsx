import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from './Toast';
import AiGenerateModal from './AiGenerateModal';
import PostEditorModal from './PostEditorModal';

const Layout = () => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleGenerated = (calendar) => {
    setIsAiModalOpen(false);
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-row font-sans text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenAiGenerator={() => setIsAiModalOpen(true)} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global AI Generator Wizard Modal */}
      <AiGenerateModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerated={handleGenerated}
      />

      {/* Fullscreen Post Editor Modal */}
      <PostEditorModal />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};

export default Layout;
