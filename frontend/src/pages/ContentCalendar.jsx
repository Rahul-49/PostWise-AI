import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Grid, 
  List, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  Code2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';
import { useAuth } from '../context/AuthContext';
import CalendarGrid from '../components/CalendarGrid';
import CalendarAgendaView from '../components/CalendarAgendaView';


const ContentCalendar = () => {
  const { 
    calendars, 
    activeCalendar, 
    selectCalendar, 
    posts,
    filteredPosts,
    platformFilter,
    statusFilter,
    searchQuery,
    viewMode,
    setPlatformFilter,
    setStatusFilter,
    setSearchQuery,
    setViewMode,
    openPostEditor,
    createPost,
    handleExport
  } = useCalendar();

  const { activeBrand } = useAuth();

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [exportOpen, setExportOpen] = useState(false);
  const [calendarSwitcherOpen, setCalendarSwitcherOpen] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleAddPostAtDate = async (targetDateStr) => {
    const newPost = {
      title: 'New Social Post',
      caption: 'Write a compelling social caption here...',
      date: targetDateStr,
      timeSlot: '10:00 AM',
      platform: 'Instagram',
      postType: 'Single Image',
      status: 'draft',
      hashtags: ['#PostWise', '#SocialMedia'],
    };
    const created = await createPost(newPost);
    if (created) {
      openPostEditor(created);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner / Calendar Title & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        {/* Left info & Calendar Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {activeCalendar?.topic || 'Social Media Content Calendar'}
              </h1>

              {/* Multiple Calendar Switcher Pill */}
              {calendars.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setCalendarSwitcherOpen(!calendarSwitcherOpen)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {calendarSwitcherOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-popover z-40">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Switch Calendar Plan
                      </div>
                      {calendars.map((cal) => (
                        <button
                          key={cal._id}
                          onClick={() => {
                            selectCalendar(cal);
                            setCalendarSwitcherOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors truncate cursor-pointer ${
                            activeCalendar?._id === cal._id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {cal.topic || cal.month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Brand: <strong className="text-slate-700 dark:text-slate-300">{activeBrand?.name || 'EcoGlow'}</strong></span>
              <span>•</span>
              <span>{posts.length} Posts Total ({filteredPosts.length} Displayed)</span>
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Navigator */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[110px] text-center">
              {months[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid vs Agenda Mode */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Export Plan</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-popover z-40 animate-scale-in">
                <button
                  onClick={() => {
                    handleExport('pdf');
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Export as PDF (.pdf)</span>
                </button>
                <button
                  onClick={() => {
                    handleExport('csv');
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Export as CSV (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    handleExport('json');
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  <span>Export as JSON (.json)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Create Manual Post */}
          <button
            onClick={() => {
              const todayStr = new Date().toISOString().split('T')[0];
              handleAddPostAtDate(todayStr);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Post</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors">
        {/* Left Platform & Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform filter pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Platform:
            </span>
            {(() => {
              // Gather platforms actually present in current posts
              const platformsInPosts = Array.from(new Set(posts.map(p => p.platform === 'Twitter' || p.platform === 'X' ? 'X/Twitter' : p.platform).filter(Boolean)));
              const availablePlatforms = platformsInPosts.length > 0 
                ? ['All', ...platformsInPosts] 
                : ['All', 'Instagram', 'LinkedIn', 'X/Twitter'];
              return availablePlatforms.map((p) => {
                const isActive = platformFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p === 'X/Twitter' ? 'X' : p}
                  </button>
                );
              });
            })()}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
            {['All', 'draft', 'scheduled', 'published'].map((s) => {
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, #hashtags..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Calendar View Area */}
      {viewMode === 'month' ? (
        <CalendarGrid
          year={currentYear}
          month={currentMonth}
          onSelectPost={openPostEditor}
          onAddPostAtDate={handleAddPostAtDate}
        />
      ) : (
        <CalendarAgendaView onSelectPost={openPostEditor} />
      )}


    </div>
  );
};

export default ContentCalendar;
