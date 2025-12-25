import React from 'react';
import { 
  Settings, 
  Download, 
  ShieldCheck, 
  Activity, 
  Info,
  Server,
  LayoutDashboard
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isHealthy: boolean;
  onRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isHealthy, onRefresh }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dlcs', label: 'Content Manager', icon: Download },
    { id: 'discovery', label: 'Intelligence Hub', icon: Server },
    { id: 'mods', label: 'Mod Guardian', icon: ShieldCheck },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-brand-dark text-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black/30 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-brand-accent to-blue-400 bg-clip-text text-transparent">
            Sims 4 Updater
          </h1>
          <button 
            onClick={onRefresh}
            aria-label="Refresh backend health status"
            className="mt-2 flex items-center gap-2 text-xs group hover:opacity-80 transition-opacity outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-full px-1"
          >
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-brand-success' : 'bg-brand-danger animate-pulse'}`} />
            <span className={isHealthy ? 'text-gray-400 group-hover:text-gray-300' : 'text-brand-danger group-hover:text-red-400'}>
              {isHealthy ? 'Backend Healthy' : 'Backend Offline'}
            </span>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1" role="navigation" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={`Navigate to ${item.label}`}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  activeTab === item.id 
                    ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-brand-accent mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">v2.0.0 Stable</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                Reverse engineered by anadius. Rebuilt for performance.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-black/10 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-gray-100">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Production Ready</span>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="text-brand-accent">December 2025</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
