import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCalendar } from '../context/CalendarContext';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Building2, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Trash2, 
  Plus, 
  Instagram, 
  Linkedin, 
  Twitter,
  CheckCircle2,
  Wand2,
  ChevronRight
} from 'lucide-react';
import AiGenerateModal from '../components/AiGenerateModal';

const Dashboard = () => {
  const { user, activeBrand, brands } = useAuth();
  const { calendars, posts, selectCalendar, deleteCalendar } = useCalendar();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const navigate = useNavigate();

  // Metric stats
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  // Next 4 scheduled posts
  const upcomingPosts = [...posts]
    .filter((p) => p.status === 'scheduled')
    .slice(0, 4);

  const getPlatformIcon = (p) => {
    if (p === 'Instagram') return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
    if (p === 'LinkedIn') return <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />;
    return <Twitter className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Dynamic Hero Command Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl border border-indigo-700/30 dark:border-slate-800 relative overflow-hidden transition-all">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-violet-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-float" />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-pink-500/15 rounded-full blur-2xl pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-amber-300 mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Social Media Command Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
              Welcome back, {user?.name || 'Creator'}! 👋
            </h1>
            <p className="text-indigo-100/90 dark:text-slate-300 text-sm md:text-base mt-2.5 leading-relaxed font-normal">
              Managing <strong className="text-white underline decoration-indigo-400 decoration-2">{activeBrand?.name || 'EcoGlow Wellness'}</strong>. Generate 30 days of platform-tailored social media posts, reschedule via drag-and-drop, and export roadmaps in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-indigo-950 font-extrabold text-xs sm:text-sm hover:bg-slate-100 shadow-xl shadow-black/20 transition-all transform active:scale-95 cursor-pointer border border-white/60"
            >
              <Wand2 className="w-4 h-4 text-indigo-600" />
              <span>Generate 30-Day AI Plan</span>
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Open Calendar Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Glass KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Roadmap Posts</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{posts.length}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">100% Generated</span> 30-Day Plan
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider">Scheduled Posts</span>
            <div className="w-9 h-9 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">{scheduledCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Ready for cross-platform auto-publish
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider">Active Platforms</span>
            <div className="w-9 h-9 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">3</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-extrabold">Instagram</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] font-extrabold">LinkedIn</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/10 dark:bg-slate-100/10 text-slate-900 dark:text-slate-100 font-extrabold">X</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider">Estimated Engagement</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">5.8%</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">+1.4%</span> above benchmark
          </p>
        </div>
      </div>

      {/* Main Grid: Upcoming Posts Queue & Active Brand / Saved Calendars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Scheduled Posts Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 p-6 md:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">Upcoming Post Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scheduled posts ready for publishing</p>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Calendar View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingPosts.length > 0 ? (
                upcomingPosts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => navigate('/calendar')}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                        {getPlatformIcon(post.platform)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {post.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-normal">
                          {post.caption}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                        {post.date}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                        {post.timeSlot}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                  No upcoming posts scheduled yet. Click "Generate 30-Day Plan" to populate your roadmap!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Tip: Drag posts directly between calendar days to reschedule!
            </span>
          </div>
        </div>

        {/* Right Column: Active Brand & Saved Calendars (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Brand Profile Card */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active Brand Persona
              </span>
              <button
                onClick={() => navigate('/brand')}
                className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>

            {activeBrand ? (
              <div>
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0"
                    style={{ backgroundColor: activeBrand.color || '#4f46e5' }}
                  >
                    {activeBrand.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{activeBrand.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{activeBrand.niche || activeBrand.industry}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100 font-extrabold">Tone:</strong> {activeBrand.tone}
                  </p>
                  <p className="line-clamp-2">
                    <strong className="text-slate-900 dark:text-slate-100 font-extrabold">Goals:</strong> {activeBrand.postingGoals}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-2">No active brand configured yet.</div>
            )}
          </div>

          {/* Saved Calendars Stack */}
          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Saved Calendars ({calendars.length})
              </span>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Plan
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto pr-1">
              {calendars.map((cal) => (
                <div
                  key={cal._id}
                  onClick={() => {
                    selectCalendar(cal);
                    navigate('/calendar');
                  }}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {cal.topic || cal.month}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                      {cal.month} • 30 Social Posts
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global AI Generator Wizard Modal */}
      <AiGenerateModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerated={() => navigate('/calendar')}
      />
    </div>
  );
};

export default Dashboard;
