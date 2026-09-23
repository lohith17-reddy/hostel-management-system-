import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { HostelAIAssistant } from './HostelAIAssistant.js';
import { Sparkles } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors">
      {/* Sidebar for Desktop & Mobile */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenAiAssistant={() => setAiAssistantOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Trigger in bottom right */}
      <button
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="Open HostelAI Copilot"
        aria-label="Open HostelAI Copilot"
      >
        <Sparkles className="w-5 h-5 text-indigo-100 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Slide-over AI Assistant */}
      <HostelAIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </div>
  );
};
