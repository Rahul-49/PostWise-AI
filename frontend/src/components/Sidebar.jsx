import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Wand2, 
  ExternalLink,
  ChevronRight,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const { activeBrand } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Content Calendar', icon: Calendar, badge: '30 Days' },
    { to: '/generate', label: 'AI Generator', icon: Wand2, highlight: true },
    { to: '/brand', label: 'Brand Profile', icon: Building2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col justify-between min-h-screen sticky top-0 z-20 shadow-sm transition-all duration-200 select-none">
      <div className="flex flex-col gap-6">
        {/* App Logo & Header */}
        <div 
          className="flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer group hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-all"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 font-extrabold text-xl group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1">
              PostWise<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">.ai</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none">AI Social Manager</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Workspace Nav
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Active Brand Profile Widget */}
        <div className="px-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Active Brand</span>
            <button 
              onClick={() => navigate('/brand')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-[10px] font-bold cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="mt-1.5 bg-slate-50/90 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-xs">
            {activeBrand ? (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: activeBrand.color || '#4f46e5' }}
                    />
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {activeBrand.name}
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
                  {activeBrand.niche || activeBrand.industry}
                </p>
                <div className="flex items-center gap-1 mt-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-extrabold text-pink-600 dark:text-pink-400">
                    IG
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-extrabold text-[#0A66C2]">
                    LinkedIn
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-extrabold text-slate-900 dark:text-slate-100">
                    X
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-1">No active brand set</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Theme & Links */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Theme Mode
          </span>
          <ThemeToggle variant="switch" />
        </div>

        <NavLink
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Landing Page
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </NavLink>
        
        <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-violet-50/90 dark:from-indigo-950/50 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Hackathon 2026</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Groq AI Powered 30-Day Engine</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
